console.log('1');

// Connect to server
var io = require('socket.io-client');
var socket = io.connect('http://10.0.0.1:8080', {reconnect: true});

console.log('2');

// Add a connect listener
socket.on('connect', (sock) => {
    console.log('Connected!');
    console.log('socket', sock);
    socket.emit('message', 'w');
    // sock.emit('message', {direction: 'x'});
});

console.log('3');
