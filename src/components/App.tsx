import * as React from 'react';
import Header from './header';
import Game from './game';

import '../Game.css';

type StateType = {
    messages: string[];
};

class App extends React.Component<{}, StateType> {

  constructor(props: {}) {
    super(props);
    this.state = {
      messages: []
    }
  }

  addPlayerMessage(msg: string) {
        let msgList = this.addMessage(msg);
        this.setState({messages: msgList});
        this.validateMessage(msg);
    }
  addMessage(msg: string) {
      let msgList = this.state.messages;
      if (msgList.unshift(msg) > 100) {
          msgList.pop();
      }
      return msgList;
  }
  validateMessage(msg: string) {
      let splitMsg = msg.split(' ');
      if (splitMsg[0] === 'walk') {
          if (splitMsg[1] === 'north') {
              this.addMessage('You venture north!');
          }
      }
  }

  messagePosted(msg: string) {
    this.addPlayerMessage(msg);
  }
  render() {
    return (
      <div className="game">
        <Header post={(msg: string) => {this.messagePosted(msg); }} />
        <Game messages={this.state.messages} />
      </div>
    );
  }
}

export default App;
