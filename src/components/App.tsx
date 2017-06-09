import * as React from 'react';
import Header from './header';
import Game from './game';
import * as io from 'socket.io-client';
let socket = io();

import '../Game.css';

type StateType = {
    messages: string[],
    coordinates: {
      x: number,
      y: number,
    }
};

class App extends React.Component<{}, StateType> {
  constructor(props: {}) {
    super(props);
    this.state = {
      messages: [],
      coordinates: {x: 0, y: 0},
    }
  }

  componentDidMount() {
    console.log("mounted");
    socket.on('server:message', (data: any) => {
      console.log("messaged");
      this.addMessage(data);
    });
  }

  addPlayerMessage(msg: string) {
    socket.emit('client:message', {coordinates: this.state.coordinates, message: msg});
    let msgList = this.addMessage(msg);
    this.validateMessage(msg);
  }
  addMessage(msg: string) {
    let msgList = this.state.messages;
    if (msgList.unshift(msg) > 100) {
        msgList.pop();
    }
    this.setState({messages: msgList});
    return msgList;
  }
  validateMessage(msg: string) {
    let splitMsg = msg.split(' ');
    if (splitMsg[0] === 'walk') {
      var coord = Object.assign({},this.state.coordinates);

      if (splitMsg[1] === 'north') {
          coord.y++;
      } else if (splitMsg[1] === 'south') {
          coord.y--;
      } else if (splitMsg[1] === 'west') {
          coord.x--;
      } else if (splitMsg[1] === 'east') {
          coord.x++;            
      }

      this.addMessage('You venture ' + ((splitMsg[1] != null) ? splitMsg[1] : 'around in circles, getting nowhere'));
      socket.emit('client:move', {from: this.state.coordinates, to: coord});
      this.setState({coordinates: coord});
    }
  }

  messagePosted(msg: string) {
    this.addPlayerMessage(msg);
  }
  render() {
    return (
      <div className="game">
        <Header 
          post={(msg: string) => {this.messagePosted(msg); }} 
          coordinates={this.state.coordinates}
        />
        <Game messages={this.state.messages} />
      </div>
    );
  }
}

export default App;
