var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var SPAWN_LOCATION = '0,0';
var ALL_CHAT = 'all_chat';

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/*', function(req, res){
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

  socket.on('client:message', function(data) {
    socket.in(_(data.coordinates)).emit('server:message', data.message);
  });

  socket.on('client:move', function(data) {
    var location = getLocation(data.to);
    var blocked = location.isBlocker;
    var desc = location.desc;
    var items = location.items;

    if (!equalCoordinates(data.from, data.to) && !blocked) {
      // Leave the room
      socket.leave(_(data.from));

      // Move the player
      socket.emit('server:move', data.to);
      socket.join(_(data.to));

      // Notify the others in the room
      socket.in(_(data.to)).emit('server:message', '~~ A stranger comes wandering ~~');     
    } else if (blocked) {
      socket.emit('server:message', '~~ That path is blocked ~~');
    }

    var room = io.sockets.adapter.rooms[_(data.to)];
    if (room != null && !blocked) {
      var message = '';
      if (location.desc) {
        message += location.desc;
      }
      if (location.items) {
        items.forEach(function(item) {
          message += ', ' + item.name
        });
      }
      if (room.length > 1) {
        message += 'You see ' + (room.length-1) + ' stranger(s) here. ';
      }
      
      socket.emit('server:message', message);
    }
  });

});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

function _(coordinates) {
  return coordinates.x + ',' + coordinates.y;
}

function equalCoordinates(coordinatesA, coordinatesB) {
  return coordinatesA.x == coordinatesB.x && coordinatesA.y == coordinatesB.y;
}

function getLocation(coordinates) {
  for (i = 0; i < world.length; i++) {
    if (equalCoordinates(world[i].coordinates, coordinates)) {
      return world[i];
    }
  }
  return {};
}

let letter = {
  name: 'Letter',
  value: 3
};

let world = [
  {
      coordinates: { x: 1, y: 1 },
      items: [letter],
      desc: 'It\'s a beautiful area'
  },
  {
      coordinates: { x: -1, y: -1 },
      isBlocker: true
  },
];