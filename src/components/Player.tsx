import * as React from 'react';
import Header from './header';
import Game from './game';
import * as io from 'socket.io-client';
import * as Validate from './helpers/message-validator';
import {Location, Item} from './helpers/types';

let socket = io();

import '../Game.css';

type StateType = {
    messages: string[],
    location: Location,
    inventory: Item[]
};

export class Player extends React.Component<{}, StateType> {
  constructor(props: {}) {
    super(props);
    this.state = {
      messages: [],
      location: {
        coordinates: {x: 0, y: 0},
      },
      inventory: []
    }
  }

  componentDidMount() {
    socket.on('server:message', (data: any) => {
      this.addMessage(data);
    });
  }

  addPlayerMessage(msg: string) {
    if (Validate.validateMessage(this, msg, socket)) {
      this.addMessage(msg);
      socket.emit('client:message', {coordinates: this.state.location.coordinates, message: msg}); 
    };
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
