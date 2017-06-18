import * as React from "react";
import Header from "./header";
import Game from "./game";
import * as io from "socket.io-client";
import * as Validate from "./helpers/message-validator";
import {ILocation, IItem, ICoordinates, IMessage, MessageLevel} from "./helpers/types";
import * as Message from "./helpers/message-helper";

const socket = io();

import "../Game.css";

interface IStateType {
    messages: IMessage[];
    location: ILocation;
    inventory: IItem[];
}

interface IPropType {
  name: string;
}

export class Player extends React.Component<IPropType, IStateType> {
  constructor(props: IPropType) {
    super(props);
    const savedState: IStateType = JSON.parse(localStorage.getItem("state"));

    if (savedState != null) {
      this.state = savedState;
      socket.emit("client:move", {from: {x: 0, y: 0}, to: this.state.location.coordinates});
    } else {
      this.state = {
        inventory: [],
        location: {
          coordinates: {x: 0, y: 0},
        },
        messages: [],
      };
    }
  }
  public componentDidUpdate() {
    localStorage.setItem("state", JSON.stringify(this.state));
  }
  public componentDidMount() {
    const player: Player = this;
    socket.on("server:message", (data: IMessage) => {
      player.addMessage(data);
    });
    socket.on("server:take", (item: IItem, inputItem: string) => {
        if (item == null) {
            player.addMessage(Message.ServerMessage("Your hands search but you cannot find any " + inputItem));
            return;
        }

        const inventory: IItem[] = player.state.inventory;
        inventory.push(item);
        player.setState({inventory});
    });
    socket.on("server:move", (data: ICoordinates) => {
      player.setState({location: {coordinates: data}});
    });
  }

  public addPlayerMessage(msg: IMessage) {
    this.addMessage(msg);
    if (Validate.validateMessage(this, msg.message, socket)) {
      socket.emit("client:message", {coordinates: this.state.location.coordinates, message: msg });
    }
  }
  public addMessage(msg: IMessage) {
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
