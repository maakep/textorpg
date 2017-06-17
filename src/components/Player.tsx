import * as React from 'react';
import Header from './header';
import Game from './game';
import * as io from 'socket.io-client';
import * as Validate from './helpers/message-validator';
import {Location, Item, Coordinates} from './helpers/types';

let socket = io();

import '../Game.css';

type StateType = {
    messages: string[],
    location: Location,
    inventory: Item[]
};

type PropType = {
  name: string,
}

export class Player extends React.Component<PropType, StateType> {
  constructor(props: PropType) {
    super(props);
    let savedState: StateType = JSON.parse(localStorage.getItem('state'));
    if (savedState != null) {
      this.state = savedState;
      socket.emit('client:move', {from: {x: 0, y: 0}, to: this.state.location.coordinates});        
    } else {
      this.state = {
        messages: [],
        location: {
          coordinates: {x: 0, y: 0},
        },
        inventory: []
      }
    }
  }
  componentDidUpdate() {
    localStorage.setItem('state', JSON.stringify(this.state));
  }
  componentDidMount() {
    let player: Player = this;
    socket.on('server:message', (data: string) => {
      player.addMessage(data);
    });
    socket.on('server:take', function(item: Item, inputItem: string) {
        if (item == null) {
            player.addMessage('Your hands search but you cannot find any ' + inputItem);
            return;
        }

        var inventory: Item[] = player.state.inventory;
        inventory.push(item);
        player.setState({inventory: inventory});
    });
    socket.on('server:move', function(data: Coordinates) {
      player.setState({location: {coordinates: data}});
    });
  }

  addPlayerMessage(msg: string) {
    let playerPrefixMsg: string = this.props.name + ': ' + msg;

    this.addMessage(playerPrefixMsg);
    if (Validate.validateMessage(this, msg, socket)) {
      socket.emit('client:message', {coordinates: this.state.location.coordinates, message: playerPrefixMsg }); 
    }
  }
  removeLastMessage() {
    let msgList = this.state.messages;
    msgList.shift();
    this.setState({messages: msgList});
  }
  addMessage(msg: string) {
    let msgList = this.state.messages;
    if (msgList.unshift(msg) > 100) {
        msgList.pop();
    }

    this.setState({messages: msgList});
    return msgList;
  }

  messagePosted(msg: string) {
    this.addPlayerMessage(msg);
  }
  render() {
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
