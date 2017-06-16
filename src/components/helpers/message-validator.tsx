import Player from '../Player';
import {Location, Item} from './types';

const WALK = {
    CMD: 'walk',
    NORTH: 'north',
    SOUTH: 'south',
    WEST: 'west',
    EAST: 'east',
}

const SLASH = {
    CMD: '/',
    HELP: '/help',
    STATS: '/stats',
}

const TAKE = {
    CMD: 'take'
}

export function validateMessage(obj: Player, msg: string, socket: SocketIOClient.Socket) {
    msg = msg.toLowerCase();
    let splitMsg = msg.split(' ');
    if (splitMsg[0] === WALK.CMD) {
        var coord = Object.assign({}, obj.state.location.coordinates);

        switch (splitMsg[1]) {
            case WALK.NORTH:
                coord.y++;
                break;
            case WALK.SOUTH:
                coord.y--;
                break;
            case WALK.EAST:
                coord.x++;
                break;
            case WALK.WEST:
                coord.x--;
                break;
            default:
                splitMsg[1] == null
        }
        obj.addMessage('You venture ' + ((splitMsg[1] != null) ? splitMsg[1] : 'around in circles, getting nowhere'), );
        socket.emit('client:move', {from: obj.state.location.coordinates, to: coord});
    } else if (splitMsg[0][0] === SLASH.CMD) {
        if(splitMsg[0] === SLASH.HELP) {
            obj.addMessage('<walk [(north|south|west|east)]>');
            obj.addMessage('/help - This text');
            obj.addMessage('/stats - Your stats');
        } else if (splitMsg[0] === SLASH.STATS) {
            obj.addMessage('You are currently at {' + obj.state.location.coordinates.x + ', ' + obj.state.location.coordinates.y + '}');
        }
        return false;
    } else if (splitMsg[0] === TAKE.CMD) {
        if (splitMsg[1] != null)
            socket.emit('client:take', {coordinates: obj.state.location.coordinates, item: splitMsg[1]});
    }
    return true;
}