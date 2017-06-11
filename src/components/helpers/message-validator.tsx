import App from '../App';
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

export function validateMessage(obj: App, msg: string, socket: SocketIOClient.Socket) {
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
        socket.on('server:move', function(data: any) {
            obj.setState({location: {coordinates: data}});
        });
    } else if (splitMsg[0][0] === SLASH.CMD) {
        if(splitMsg[0] === SLASH.HELP) {
            obj.addMessage('<walk [(north|south|west|east)]>');
            obj.addMessage('/help - This text');
            obj.addMessage('/stats - Your stats');
        } else if (splitMsg[0] === SLASH.STATS) {
            obj.addMessage('You are currently at {' + obj.state.location.coordinates.x + ', ' + obj.state.location.coordinates.y + '}');
        }
        return false;
    }
    return true;
}

let letter: Item = {
    name: 'Letter',
    value: 3
};

let WORLD: Location[] = [
    {
        coordinates: { x: 1, y: 1 },
        items: [letter],
    },
    {
        coordinates: { x: -1, y: -1 },
        isblocker: true
    },
];