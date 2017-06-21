import Player from "../Player";
import * as Type from "./types";
import * as _String from "./string-helper";
import * as TextFormat from "./text-format";
import * as Message from "./message-helper";

const CMDS: any = {
    WALK: {
        CMD: "walk",
        DESC: "Navigate north, south, east or west",
        NORTH: "north",
        SOUTH: "south",
        WEST: "west",
        EAST: "east",
    },
    SLASH: {
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
    },
    TAKE: {
        CMD: "take",
        DESC: "Pick up an item, take <item name>",
    },
    USE: {
        CMD: "use",
        DESC: "Use a usable item: use <item name>",
    },
};

export function isCommand(message: string): boolean {
    return message[0] === "/";
}
export function validateMessage(player: Player, msg: string, socket: SocketIOClient.Socket) {
    msg = msg.toLowerCase();
    const splitMsg = msg.split(" ");

    if (splitMsg[0] === CMDS.WALK.CMD) {
        const coord = Object.assign({}, player.state.location.coordinates);

        switch (splitMsg[1]) {
            case CMDS.WALK.NORTH:
                coord.y++;
                break;
            case CMDS.WALK.SOUTH:
                coord.y--;
                break;
            case CMDS.WALK.EAST:
                coord.x++;
                break;
            case CMDS.WALK.WEST:
                coord.x--;
                break;
            default:
                splitMsg[1] = null;
                break;
        }

        const msgMessage = "You venture " + ((!_String.isNullOrWhitespace(splitMsg[1]))
                                        ? splitMsg[1]
                                        : "around in circles, getting nowhere");
        const returnMessage: Type.IMessage = Message.ServerMessage(msgMessage);
        player.addMessage(returnMessage);
        socket.emit("client:move", {from: player.state.location.coordinates, to: coord});
    } else if (splitMsg[0][0] === CMDS.SLASH.CMD) { // First letter
        if (splitMsg[0] === CMDS.SLASH.HELP.CMD) {
            for (const key in CMDS) {
                if (CMDS.hasOwnProperty(key)) {
                    for (const key2 in CMDS[key]) {
                        if (CMDS.hasOwnProperty(key2)) {
                            player.addMessage(Message.ServerMessage(CMDS[key2].CMD + " - " + CMDS[key2].DESC));
                        }
                    }
                    player.addMessage(Message.ServerMessage(CMDS[key].CMD + " - " + CMDS[key].DESC));
                }
            }
            /*player.addMessage(Message.ServerMessage(CMDS.SLASH.HELP.CMD + " - " + CMDS.SLASH.HELP.DESC));
            player.addMessage(Message.ServerMessage(CMDS.WALK.CMD + " - " + CMDS.WALK.DESC));
            player.addMessage(Message.ServerMessage(CMDS.TAKE.CMD + " - " + CMDS.TAKE.DESC));
            player.addMessage(Message.ServerMessage(CMDS.SLASH.STATS.CMD + " - " + CMDS.SLASH.STATS.DESC));
            player.addMessage(Message.ServerMessage(CMDS.SLASH.INVENTORY.CMD + " - " + CMDS.SLASH.INVENTORY.DESC));*/
        } else if (splitMsg[0] === CMDS.SLASH.STATS.CMD) {
            const message = "You are currently at {" +
                            player.state.location.coordinates.x +
                            ", " +
                            player.state.location.coordinates.y + "}";
            player.addMessage(Message.ServerMessage(message));
        } else if (splitMsg [0] === CMDS.SLASH.INVENTORY.CMD) {
            const inventory: Type.IItem[] = player.state.inventory;
            const items: string = TextFormat.commaSeparatedArray(inventory, "name");
            if (items != null) {
                player.addMessage(Message.ServerMessage(items));
            } else {
                player.addMessage(Message.ServerMessage("No items in inventory"));
            }
        }
        return false;
    } else if (splitMsg[0] === CMDS.TAKE.CMD) {
        if (splitMsg[1] != null) {
            socket.emit("client:take",
            {coordinates: player.state.location.coordinates,
                item: _String.stringAfterSpace(msg)});
        }
    } else if (splitMsg[0] === CMDS.USE.CMD) {
        if (splitMsg[1] != null) {
            const data: Type.IUseData = { item: _String.stringAfterSpace(msg),
                                          state: player.state};
            socket.emit("client:use", data);
        }
    }
    return true;
}
