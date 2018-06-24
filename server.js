// Imports
const path = require('path');
const express = require('express');
const http = require('http');
const config = require('./config');
const socketio = require('socket.io');


// Configure server
const app = express();
const server = http.createServer(app);


// Serve public folder
app.use(express.static(path.join(__dirname, 'public')));


// Sockets
const io = socketio(server, {
  transports: ['websocket']
});
const sendFrameToAll = (senderId, frame) => {
  io.volatile.emit('frame', senderId, frame);
};

const onDisconnected = (id) => {
  io.emit('endstream', id);
};

io.on('connection', (socket) => {
  const { id } = socket;
  console.log('connected', id);

  socket.on('frame', (data) => {
    console.log('received from ' + id);
    sendFrameToAll(id, data);
  });

  socket.on('disconnect', () => {
    onDisconnected(id);
  });
});


// Start Server
server.listen(config.port, () => {
  console.info(`Server started on port ${server.address().port}`);
});