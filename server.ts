import * as Types from './src/components/helpers/types';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as httpz from 'http';
import * as StringHelper from './src/components/helpers/StringHelper';
import * as TextFormat from './src/components/helpers/TextFormat';

const app = express();
const http = httpz.createServer(app);
const io = socketIo(http);

const SPAWN_LOCATION = '0,0';
const ALL_CHAT = 'all_chat';

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/*', function(req, res) {
  res.sendFile(__dirname + req.url);
});


io.on('connection', function(socket){
  console.log("Client joined: " + socket.handshake.address);
	socket.join(SPAWN_LOCATION);
  socket.join(ALL_CHAT);
  socket.in(SPAWN_LOCATION).emit('server:message', '~~ A stranger appears out of nothing ~~');
  socket.on('disconnecting', function() {
    console.log("Client left: " + socket.handshake.address);
    socket.in(socket.rooms[0]).emit('server:message', '~~ Somewhere in the world a stranger disappears with a light popping sound ~~');
  });

  socket.on('client:message', function(data: Types.Message) {
    socket.in(_(data.coordinates)).emit('server:message', data.message);
  });

  socket.on('client:take', function(data: Types.TakeItem) {
    var location: Types.Location = getLocation(data.coordinates);
    var allItems: Types.Item[] = location.items;
    var item: Types.Item;
    
    if (allItems.length > 0) {
      item = getItem(data.item, location);
    }

    if (item != null) 
    {
      var index = location.items.indexOf(item);
      if (index > -1){
        location.items.splice(index, 1);
      }
    }
    
    updateLocation(data.coordinates, location);
    socket.emit('server:take', item, data.item);
  });

  socket.on('client:move', function(data: {from: Types.Coordinates, to: Types.Coordinates}) {
    var location: Types.Location = getLocation(data.to);
    var blocked: boolean = location.isBlocker;
    var desc: string = location.desc;
    var items: Types.Item[] = location.items;

    if (!equalCoordinates(data.from, data.to) && !blocked) {
      // Leave the room
      socket.leave(_(data.from));

      // Move the player
      socket.emit('server:move', data.to);
      socket.join(_(data.to));

      // Notify the others in the room
      socket.in(_(data.to)).emit('server:message', '~~ A stranger comes wandering ~~');

      // Location info for player
      var message = getLocationString(location);
      if (!StringHelper.isNullOrWhitespace(message)) {
        socket.emit('server:message', message);
      }
    } 
  });
});

function _(coordinates: Types.Coordinates) {
  return coordinates.x + ',' + coordinates.y;
}

function equalCoordinates(coordinatesA: Types.Coordinates, coordinatesB: Types.Coordinates) {
  return coordinatesA.x == coordinatesB.x && coordinatesA.y == coordinatesB.y;
}

function getRoom(coordinates: Types.Coordinates) {
  return io.sockets.adapter.rooms[_(coordinates)];
}
function peopleInRoom(room: any): number {
  return room.length;
}

function getLocationString(location: Types.Location) {
  let message: string = '';
  let room = getRoom(location.coordinates);
  let roomLength = peopleInRoom(room);

  if (location.desc) {
    message += location.desc;
  }
  if (location.isBlocker) {
    message += 'The path is blocked. ';
    return message;
  }
  if (location.spawner) {
    message += "A spawner lies here. ";
  }
  if (roomLength > 1) {
    message += 'You see ' + (roomLength - 1) + ' stranger(s) here. ';    
  }
  if (location.items.length > 0) {
    message += 'You see the following items: ';
    message += TextFormat.commaSeparatedArray(location.items, 'name');
  }
  return message;
}

function getLocation(coordinates: Types.Coordinates): Types.Location {
  for (var i = 0; i < world.length; i++) {
    if (equalCoordinates(world[i].coordinates, coordinates)) {
      return world[i];
    }
  }
  return getDefaultLocation(coordinates);
}

function getItem(item: string, location: Types.Location): Types.Item {
  for (var i = 0; i < location.items.length; i++) {
    if (location.items[i].name == item) {
      return location.items[i];
    }
  }
  return null;
}

function updateLocation(coordinates: Types.Coordinates, location: Types.Location) {
  for (var i = 0; i < world.length; i++) {
    if (equalCoordinates(world[i].coordinates, coordinates)) {
      world[i] = location;
    }
  }
}

function getDefaultLocation(coordinates: Types.Coordinates) {
  let location: Types.Location = {
    coordinates: {
      x: coordinates.x,
      y: coordinates.y
    },
    isBlocker: false,
    desc: null,
    items: [],
  }
  return location;
}


function itemGenerator(items: Types.Item[], location: Types.Location, minuteInterval: number) {
  console.log(location);
  setInterval(function(){
    items.forEach(function(item) {
      location.items.push(item);
    });
  }, minuteInterval*1000*60);
}

function initializeWorld(): void {
  for (var i = 0; i < world.length; i++) {
    if (world[i].spawner != null) {
      world[i].spawner(world[i]);
    }
  }
}

let letter: Types.Item = {
  name: 'letter',
  value: 3
};

let getter: Types.Item = {
  name: 'getter',
  value: 3
};

let goldOre: Types.Item = {
  name: 'gold ore',
  value: 50,
}

const nullWorld: Types.Location = {
    coordinates: {
      x: 0,
      y: 0
    },
    isBlocker: false,
    desc: null,
    items: [],
    spawner: null
}
let world: Types.Location[] = [
  {
      coordinates: { x: 1, y: 1 },
      items: [letter, getter],
      desc: 'It\'s a beautiful area. ',
  },
  {
      coordinates: { x: -1, y: -1 },
      isBlocker: true
  },
  {
    coordinates: {x: 0, y: 1},
    items: [],
    spawner: (location) => itemGenerator([goldOre, letter], location, 0.1),
  }
];


http.listen(3000, function() {
  console.log('listening on *:3000');
  initializeWorld();
});