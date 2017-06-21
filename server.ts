import * as Type from "./src/components/helpers/types";
import * as express from "express";
import * as socketIo from "socket.io";
import * as httpz from "http";
import * as StringHelper from "./src/components/helpers/string-helper";
import * as TextFormat from "./src/components/helpers/text-format";
import * as Message from "./src/components/helpers/message-helper";
import {Player, IStateType} from "./src/components/Player";
const app = express();
const http = httpz.createServer(app);
const io = socketIo(http);

const SPAWN_LOCATION = "0,0";
const ALL_CHAT = "all_chat";

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/*", (req, res) => {
  res.sendFile(__dirname + req.url);
});

io.on("connection", (socket) => {
  // tslint:disable-next-line:no-console
  console.log("Client joined: " + socket.handshake.address);
  socket.join(SPAWN_LOCATION);
  socket.join(ALL_CHAT);
  socket.on("disconnecting", () => {
    // tslint:disable-next-line:no-console
    console.log("Client left: " + socket.handshake.address);
    const message = "~~ Somewhere in the world a stranger disappears with a light popping sound ~~";
    socket.in(ALL_CHAT).emit("server:message", Message.ServerMessage(message));
  });

  socket.on("client:message", (data: Type.IMessage) => {
    socket.in(_(data.coordinates)).emit("server:message", data);
  });

  socket.on("client:take", (data: Type.ITakeItem) => {
    const location: Type.ILocation = getLocation(data.coordinates);
    const allItems: Type.IItem[] = location.items;
    let item: Type.IItem;

    if (allItems.length > 0) {
      item = getItemInLocation(data.item, location);
    }

    if (item != null) {
      const index = location.items.indexOf(item);
      if (index > -1) {
        location.items.splice(index, 1);
      }
    }

    updateLocation(data.coordinates, location);
    socket.emit("server:take", item, data.item);
  });

  socket.on("client:use", (data: Type.IUseData) => {
    const item: Type.IItem = getItem(data.item);
    console.log("state: ");
    console.log(data.state);

    if (item != null && item.use != null) {
      socket.emit("server:use", item.use(data.state));
    }
  });

  socket.on("client:move", (data: {from: Type.ICoordinates, to: Type.ICoordinates}) => {
    const location: Type.ILocation = getLocation(data.to);
    const blocked: boolean = location.isBlocker;
    const desc: string = location.desc;
    const items: Type.IItem[] = location.items;

    if (!equalCoordinates(data.from, data.to) && !blocked) {
      // Leave the room
      socket.leave(_(data.from));

      // Move the player
      socket.emit("server:move", data.to);
      socket.join(_(data.to));

      // Notify the others in the room
      socket.in(_(data.to)).emit("server:message", Message.ServerMessage("~~ A stranger comes wandering ~~"));
    }
      // Location info for player
    const message = getLocationString(location);
    if (!StringHelper.isNullOrWhitespace(message)) {
      socket.emit("server:message", Message.ServerMessage(message));
    }
  });
});

function _(coordinates: Type.ICoordinates) {
  return coordinates.x + "," + coordinates.y;
}

function equalCoordinates(coordinatesA: Type.ICoordinates, coordinatesB: Type.ICoordinates) {
  return coordinatesA.x === coordinatesB.x && coordinatesA.y === coordinatesB.y;
}

function getRoom(coordinates: Type.ICoordinates) {
  return io.sockets.adapter.rooms[_(coordinates)];
}
function peopleInRoom(room: any): number {
  if (room != null) {
    return room.length;
  }
  return 0;
}

function getLocationString(location: Type.ILocation) {
  let message: string = "";
  const room = getRoom(location.coordinates);
  const roomLength = peopleInRoom(room);

  if (location.desc) {
    message += location.desc;
  }
  if (location.isBlocker) {
    message += "The path is blocked. ";
    return message;
  }
  if (location.spawner) {
    message += "A spawner lies here. ";
  }
  if (roomLength > 1) {
    message += "You see " + (roomLength - 1) + " stranger(s) here. ";
  }
  if (location.items.length > 0) {
    message += "You see the following items: ";
    message += TextFormat.commaSeparatedArray(location.items, "name");
  }
  return message;
}

function getLocation(coordinates: Type.ICoordinates): Type.ILocation {
  for (const loc of world) {
    if (equalCoordinates(loc.coordinates, coordinates)) {
      return loc;
    }
  }
  return getDefaultLocation(coordinates);
}

function getItemInLocation(item: string, location: Type.ILocation): Type.IItem {
  for (const locItem of location.items) {
    if (locItem.name === item) {
      return locItem;
    }
  }
  return null;
}

function getItem(item: string): Type.IItem {
  for (const key in itemRep) {
    if (itemRep.hasOwnProperty(key)) {
      if (itemRep[key].name === item) {
        return itemRep[key];
      }
    }
  }
  return itemRep[item];
}

function updateLocation(coordinates: Type.ICoordinates, location: Type.ILocation) {
  for (let loc of world) {
    if (equalCoordinates(loc.coordinates, coordinates)) {
      loc = location;
    }
  }
}

function getDefaultLocation(coordinates: Type.ICoordinates) {
  const location: Type.ILocation = {
    coordinates: {
      x: coordinates.x,
      y: coordinates.y,
    },
    isBlocker: false,
    desc: null,
    items: [],
  };
  return location;
}

function itemGenerator(items: Type.IItem[], location: Type.ILocation, minuteInterval: number, maxItems: number) {
  setInterval(() => {
    if (location.items.length <= maxItems) {
      items.forEach((item) => {
        location.items.push(item);
      });
    }
  }, minuteInterval * 1000 * 60);
}

function initializeWorld(): void {
  for (const loc of world) {
    if (loc.spawner != null) {
      loc.spawner(loc);
    }
  }
}

// tslint:disable-next-line:one-variable-per-declaration
const itemRep: {[name: string]: Type.IItem} = {
  letter: {
    name: "letter",
    value: 3,
  },
  getter: {
    name: "getter",
    value: 3,
    use: (state: IStateType) => ({stats: {strength: state.stats.strength + 1}}),
  },
  goldOre: {
    name: "gold ore",
    value: 50,
  },
  preAlphaTester: {
    name: "medallion of the pre-alpha tester",
    use: (state: IStateType) => ({location: {coordinates: {x: 0, y: 0}}}),
    value: 0,
  },
};

const world: Type.ILocation[] = [
  {
    coordinates: { x: 0, y: 0 },
    desc: "A protective one way protective barrier. ",
    items: [itemRep.preAlphaTester],
    spawner: (l) => itemGenerator([itemRep.preAlphaTester], l, 0.01, 1),
    isBlocker: true,
  },
  {
      coordinates: { x: 1, y: 1 },
      items: [itemRep.letter, itemRep.getter, itemRep.preAlphaTester],
      desc: "It's a beautiful area. ",
  },
  {
      coordinates: { x: -1, y: -1 },
      isBlocker: true,
  },
  {
    coordinates: {x: 0, y: 1},
    items: [],
    spawner: (location) => itemGenerator([itemRep.goldOre, itemRep.letter], location, 0.1, 6),
  },
];

http.listen(3000, () => {
  // tslint:disable-next-line:no-console
  console.log("listening on *:3000");
  initializeWorld();
});

process.stdin.resume();
process.on("SIGINT", () => {
  io.emit("server:message", Message.SystemMessage("#### The server has shut down ####"));
  // tslint:disable-next-line:no-console
  console.log("Closing");
  process.exit();
});

process.on("uncaughtException", (err: string) => {
  io.emit("server:message", Message.SystemMessage("#### Server has crashed & shut down ####"));
  // tslint:disable-next-line:no-console
  console.log(err);
  setTimeout(() => {
    process.exit();
  }, 1000);
});
