import * as React from "react";
import Header from "./header";
import Game from "./game";
import * as io from "socket.io-client";
import * as Validate from "./helpers/message-validator";
import * as Type from "./helpers/types";
import * as Message from "./helpers/message-helper";
import * as StringHelper from "./helpers/string-helper";

const socket = io();

import "../game.css";

export interface IStateType {
    messages: Type.IMessage[];
    location: Type.ILocation;
    inventory: Type.IItem[];
    stats: Type.IStats;
    version: number;
}
const STATE_VERSION = 0.12;

interface IPropType {
  name: string;
}

export class Player extends React.Component<IPropType, IStateType> {
  constructor(props: IPropType) {
    super(props);
    const savedState: IStateType = JSON.parse(localStorage.getItem("state"));

    if (savedState != null && savedState.version === STATE_VERSION) {
      this.state = savedState;
      socket.emit("client:move", {from: {x: 0, y: 0}, to: this.state.location.coordinates});
    } else {
      this.state = Object.assign(savedState, {
        inventory: [],
        location: {
          coordinates: {x: 0, y: 0},
        },
        messages: [],
        stats: {
          strength: 0,
          stamina: {value: 0, max: 10},
          charisma: 0,
        },
        version: STATE_VERSION,
      });
    }

    this.generateStamina();
  }
  public generateStamina() {
    const player = this;
    setInterval(() => {
      this.updateStamina(1);
    }, 1000 * (1 + (15 - player.state.stats.stamina.max)));
  }

  public updateStamina(val: number) {
    const stats = Object.assign({}, this.state.stats);

    if (stats.stamina.value + val >= 0 && stats.stamina.value + val <= stats.stamina.max) {
      stats.stamina.value += val;
      this.setState({stats});
      return true;
    }
    return false;
  }
  public componentDidUpdate() {
    localStorage.setItem("state", JSON.stringify(this.state));
  }
  public componentDidMount() {
    const player: Player = this;
    socket.on("server:message", (data: Type.IMessage) => {
      player.addMessage(data);
    });
    socket.on("server:take", (item: Type.IItem, inputItem: string) => {
        if (item == null) {
            player.addMessage(Message.ServerMessage("Your hands search but you cannot find any " + inputItem));
            return;
        }

        const inventory: Type.IItem[] = player.state.inventory;
        inventory.push(item);
        player.setState({inventory});
    });
    socket.on("server:move", (data: Type.ICoordinates) => {
      player.setState({location: {coordinates: data}});
    });
    socket.on("server:use", (data: Type.IUseReturnMessage) => {
      if (data != null) {
        if (!StringHelper.isNullOrWhitespace(data.message)) {
          this.addMessage(Message.ServerMessage(data.message));
        }
        if (data.state !== null) {
          this.setState(data.state);
        }
      }
    });
  }

  public addPlayerMessage(msg: Type.IMessage) {
    this.addMessage(msg);
    if (Validate.validateMessage(this, msg.message, socket)) {
      socket.emit("client:message", msg);
    }
  }
  public addMessage(msg: Type.IMessage) {
    const msgList = this.state.messages;
    if (msgList.unshift(msg) > 100) {
        msgList.pop();
    }

    this.setState({messages: msgList});
    return msgList;
  }
  public removeLastMessage() {
    const msgList = this.state.messages;
    msgList.shift();
    this.setState({messages: msgList});
  }
  public messagePosted(msg: string) {
    this.addPlayerMessage(Message.PlayerMessage(msg, this.props.name, this.state.location.coordinates));
  }
  public render() {
    return (
      <div className="game">
        <Header
          post={(msg: string) => {this.messagePosted(msg); }}
          coordinates={this.state.location.coordinates}
        />
        <Game messages={this.state.messages} />
      </div>
    );
  }
}

export default Player;
