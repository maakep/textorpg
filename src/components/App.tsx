import * as React from 'react';
import Header from './header';
import Game from './game';
import * as io from 'socket.io-client';
import * as Validate from './helpers/message-validator';

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
    this.addMessage(msg);
    if(this.validateMessage(msg)) {
     socket.emit('client:message', {coordinates: this.state.coordinates, message: msg}); 
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
  validateMessage(msg: string) {
    Validate.validateMessage(this, msg, socket);
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
