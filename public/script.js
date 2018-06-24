const socket = window.io();

socket.on('connection', (e) => {
  console.log('connected!', e);
});
