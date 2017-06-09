var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var SPAWN_LOCATION = '0,0';

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/*', function(req, res){
  res.sendFile(__dirname + req.url);
});


io.on('connection', function(socket){
  console.log("Client joined");
	socket.join(SPAWN_LOCATION);

  socket.on('client:message', function(data) {
    console.log("Message sent: ");
    socket.in(_(data.coordinates)).emit('server:message', data.message);
  });

  socket.on('client:move', function(data) {
    console.log('Client moves from: ' + data.from.y + ' to: ' + data.to.y);
    socket.leave(_(data.from));
    socket.join(_(data.to));
  });

});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

function _(coordinates) {
  return coordinates.x + ',' + coordinates.y;
}