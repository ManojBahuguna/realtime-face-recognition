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
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('connected', socket.id);

  socket.on('frame', (data) => {

  });
});


// Start Server
server.listen(config.port, () => {
  console.info(`Server started on port ${server.address().port}`);
});