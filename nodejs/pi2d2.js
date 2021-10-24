const keypress = require('keypress');
const admin = require('firebase-admin');
const config = require('./pi2d2.config.json');
const gamepad = require('gamepad');

const io = require('socket.io-client');
const socket = io.connect('http://10.0.0.1:8080', {reconnect: true});

admin.initializeApp({
    credential: admin.credential.cert(config.firebase_credentials),
    databaseURL: config.firebase_database_url
});

// Add a connect listener
socket.on('connect', (sock) => {
    console.log('Connected!', sock);
});

var db = admin.database();

var controls = ['up', 'down', 'left', 'right', 'w', 'a', 's', 'd', 'space', 'x'];

function setMovingDirection(direction) {
    db.ref('move/').set({
        direction: direction
    }).catch(function(err) {
        console.log('ERROR: ', err);
    });

    socket.emit('message', direction);
    // socket.emit({direction: direction});
}

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function(ch, key) {
    if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
        process.exit();
    }
    if (key && key.name && (controls.includes(key.name))) {
        console.log('got "keypress"', key);
        setMovingDirection(key.name);
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();

console.log('PID: ', process.pid);

var moveRef = db.ref('move/');
moveRef.on('value', function(snapshot) {
    console.log('received from database', snapshot.val());
});

setMovingDirection('space');

/** Gamepad support, for fun. Why not? */

// Initialize the library
gamepad.init();

// List the state of all currently attached devices
for (var i = 0, l = gamepad.numDevices(); i < l; i++) {
    console.log(i, gamepad.deviceAtIndex());
}

// Create a game loop and poll for events
setInterval(gamepad.processEvents, 16);
// Scan for new gamepads as a slower rate
setInterval(gamepad.detectDevices, 500);

// Listen for move events on all gamepads
gamepad.on('move', (id, axis, value) => {
    if (axis == 1) {
        if (value > 0) {
            setMovingDirection('up');
        } else if (value < 0) {
            setMovingDirection('down');
        } else if (value == 0) {
            setMovingDirection('space');
        }
    } else if (axis == 0) {
        if (value > 0) {
            setMovingDirection('right');
        } else if (value < 0) {
            setMovingDirection('left');
        } else if (value == 0) {
            setMovingDirection('space');
        }
    }

    console.log('gamepad move', {
        id: id,
        axis: axis,
        value: value,
    });
});


console.log('2');
