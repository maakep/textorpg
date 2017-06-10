import App from '../App';

export function validateMessage(obj: App, msg: string, socket: SocketIOClient.Socket) {
    let splitMsg = msg.split(' ');
    if (splitMsg[0] === 'walk') {
      var coord = Object.assign({},obj.state.coordinates);

      if (splitMsg[1] === 'north') {
          coord.y++;
      } else if (splitMsg[1] === 'south') {
          coord.y--;
      } else if (splitMsg[1] === 'west') {
          coord.x--;
      } else if (splitMsg[1] === 'east') {
          coord.x++;            
      }

      obj.addMessage('You venture ' + ((splitMsg[1] != null) ? splitMsg[1] : 'around in circles, getting nowhere'));
      socket.emit('client:move', {from: obj.state.coordinates, to: coord});
      obj.setState({coordinates: coord});
    }
    return true;
}