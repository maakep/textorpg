import Player from "../player";
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
    DROP: {
        CMD: "drop",
        DESC: "Drop an item: drop <item name>",
    },
};

export function isCommand(message: string): boolean {
    return message[0] === "/";
}
export function validateMessage(player: Player, msg: string, socket: SocketIOClient.Socket) {
    msg = msg.toLowerCase();
    const splitMsg = msg.split(" ");

    function removeItemFromInventory(item: string) {
        const inventory = player.state.inventory;
        for (const i in inventory) {
            if (inventory[i].name === item) {
                inventory.splice(inventory.indexOf(inventory[i]), 1);
                player.setState({inventory});
                return true;
            }
        }
        return false;
    }

    function playerHasItem(item: string) {
        const inventory = player.state.inventory;
        for (const i in inventory) {
            if (inventory[i].name === item) {
                return true;
            }
        }
        return false;
    }

    switch (splitMsg[0]) {
        case CMDS.WALK.CMD:
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
            break;
        case CMDS.SLASH.HELP.CMD: // First letter /*splitMsg[0][0] ===*/
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
            break;
        case CMDS.SLASH.STATS.CMD:
            const message = "You are currently at {" +
                            player.state.location.coordinates.x +
                            ", " +
                            player.state.location.coordinates.y + "}";
            player.addMessage(Message.ServerMessage(message));
            break;
        case CMDS.SLASH.INVENTORY.CMD:
            const inventory: Type.IItem[] = player.state.inventory;
            const items: string = TextFormat.commaSeparatedArray(inventory, "name");
            if (items != null) {
                player.addMessage(Message.ServerMessage(items));
            } else {
                player.addMessage(Message.ServerMessage("No items in inventory"));
            }
            return false;
        case CMDS.TAKE.CMD:
            if (splitMsg[1] != null) {
                socket.emit("client:take",
                {coordinates: player.state.location.coordinates,
                    item: _String.stringAfterSpace(msg)});
            }
            break;
        case CMDS.USE.CMD:
            if (splitMsg[1] != null) {
                const data: Type.IUseData = { item: _String.stringAfterSpace(msg),
                                            state: player.state};
                socket.emit("client:use", data);
            }
            break;
        case CMDS.DROP.CMD:
            if (splitMsg[1] != null) {
                const item = _String.stringAfterSpace(msg);
                if (playerHasItem(item)) {
                    if (removeItemFromInventory(item)) {
                        const dropItem: Type.IDropItem = {
                            item,
                            coordinates: player.state.location.coordinates,
                        };
                        socket.emit("client:drop", dropItem);
                    }
                }
            }
            break;
    }
    return true;
}
