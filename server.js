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
    console.log(socket.rooms);
    socket.in(socket.rooms[0]).emit('server:message', '~~ Somewhere in the world a stranger disappears with a light popping sound ~~');
  });


  socket.on('client:message', function(data) {
    socket.in(_(data.coordinates)).emit('server:message', data.message);
  });

  socket.on('client:move', function(data) {
    console.log('Client moves from: ' + data.from.y + ' to: ' + data.to.y);
    if (!equalCoordinates(data.from, data.to)) {
      console.log("not same coord");
      socket.leave(_(data.from));
      socket.join(_(data.to));
    }
    
    socket.in(_(data.to)).emit('server:message', '~~ A stranger comes wandering ~~');
    
    var room = io.sockets.adapter.rooms[_(data.to)];
    if (room != null && room.length > 1) {
      socket.emit('server:message', '~~ You see ' + (room.length-1) + ' stranger(s) here ~~');
    } else {
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