import Player from '../Player';
import {Location, Item} from './types';
import * as _String from './StringHelper';
import * as TextFormat from './TextFormat';

const WALK = {
    CMD: 'walk',
    DESC: 'Navigate north, south, east or west',
    NORTH: 'north',
    SOUTH: 'south',
    WEST: 'west',
    EAST: 'east',
}

const SLASH = {
    CMD: '/',
    HELP: {
        CMD: '/help',
        DESC: 'Display available commands'
    },
    STATS: {
        CMD: '/stats',
        DESC: 'Display your statistics'
    },
    INVENTORY: {
        CMD: '/inventory',
        DESC: 'Display your inventory'
    },
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
        obj.addMessage('You venture ' + ((!_String.isNullOrWhitespace(splitMsg[1])) ? splitMsg[1] : 'around in circles, getting nowhere'), );
        socket.emit('client:move', {from: obj.state.location.coordinates, to: coord});
    } else if (splitMsg[0][0] === SLASH.CMD) { // First letter
        if(splitMsg[0] === SLASH.HELP.CMD) {
            obj.addMessage(SLASH.HELP.CMD + ' - ' + SLASH.HELP.DESC);
            obj.addMessage(WALK.CMD + ' - ' + WALK.DESC);
            obj.addMessage(SLASH.STATS.CMD + ' - ' + SLASH.STATS.DESC);
            obj.addMessage(SLASH.INVENTORY.CMD + ' - ' + SLASH.INVENTORY.DESC);
        } else if (splitMsg[0] === SLASH.STATS.CMD) {
            obj.addMessage('You are currently at {' + obj.state.location.coordinates.x + ', ' + obj.state.location.coordinates.y + '}');
        } else if (splitMsg [0] === SLASH.INVENTORY.CMD) {
            let inventory: Item[] = obj.state.inventory;
            let items: string = TextFormat.commaSeparatedArray(inventory, 'name');
            if (items != null) {
                obj.addMessage(items);
            } else {
                obj.addMessage('No items in inventory');
            }
        }
        return false;
    } else if (splitMsg[0] === TAKE.CMD) {
        if (splitMsg[1] != null)
            socket.emit('client:take', {coordinates: obj.state.location.coordinates, item: splitMsg[1]});
    }
    return true;
}