import Player from "../Player";
import {ILocation, IItem, IMessage} from "./types";
import * as _String from "./string-helper";
import * as TextFormat from "./text-format";
import * as Message from "./message-helper";

const WALK = {
    CMD: "walk",
    DESC: "Navigate north, south, east or west",
    NORTH: "north",
    SOUTH: "south",
    WEST: "west",
    EAST: "east",
};

const SLASH = {
    CMD: "/",
    HELP: {
        CMD: "/help",
        DESC: "Display available commands",
    },
    STATS: {
        CMD: "/stats",
        DESC: "Display your statistics",
    },
    INVENTORY: {
        CMD: "/inventory",
        DESC: "Display your inventory",
    },
};

const TAKE = {
    CMD: "take",
    DESC: "Pick up an item, take <item>",
};

export function isCommand(message: string): boolean {
    return message[0] === "/";
}
export function validateMessage(player: Player, msg: string, socket: SocketIOClient.Socket) {
    msg = msg.toLowerCase();
    const splitMsg = msg.split(" ");

    if (splitMsg[0] === WALK.CMD) {
        const coord = Object.assign({}, player.state.location.coordinates);

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
                splitMsg[1] = null;
                break;
        }

        const msgMessage = "You venture " + ((!_String.isNullOrWhitespace(splitMsg[1]))
                                        ? splitMsg[1]
                                        : "around in circles, getting nowhere");
        const returnMessage: IMessage = Message.ServerMessage(msgMessage);
        player.addMessage(returnMessage);
        socket.emit("client:move", {from: player.state.location.coordinates, to: coord});
    } else if (splitMsg[0][0] === SLASH.CMD) { // First letter
        if (splitMsg[0] === SLASH.HELP.CMD) {
            player.addMessage(Message.ServerMessage(SLASH.HELP.CMD + " - " + SLASH.HELP.DESC));
            player.addMessage(Message.ServerMessage(WALK.CMD + " - " + WALK.DESC));
            player.addMessage(Message.ServerMessage(TAKE.CMD + " - " + TAKE.DESC));
            player.addMessage(Message.ServerMessage(SLASH.STATS.CMD + " - " + SLASH.STATS.DESC));
            player.addMessage(Message.ServerMessage(SLASH.INVENTORY.CMD + " - " + SLASH.INVENTORY.DESC));
        } else if (splitMsg[0] === SLASH.STATS.CMD) {
            const message = "You are currently at {" +
                            player.state.location.coordinates.x +
                            ", " +
                            player.state.location.coordinates.y + "}";
            player.addMessage(Message.ServerMessage(message));
        } else if (splitMsg [0] === SLASH.INVENTORY.CMD) {
            const inventory: IItem[] = player.state.inventory;
            const items: string = TextFormat.commaSeparatedArray(inventory, "name");
            if (items != null) {
                player.addMessage(Message.ServerMessage(items));
            } else {
                player.addMessage(Message.ServerMessage("No items in inventory"));
            }
        }
        return false;
    } else if (splitMsg[0] === TAKE.CMD) {
        if (splitMsg[1] != null) {
            socket.emit("client:take",
            {coordinates: player.state.location.coordinates,
                item: _String.stringAfterSpace(msg)});
        }
    }
    return true;
}
