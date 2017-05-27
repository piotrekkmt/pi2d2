const keypress = require('keypress');
const admin = require('firebase-admin');
const config = require('./pi2d2.config.json');

admin.initializeApp({
    credential: admin.credential.cert(config.firebase_credentials),
    databaseURL: config.firebase_database_url
});

var db = admin.database();

var controls = ['up', 'down', 'left', 'right', 'w', 'a', 's', 'd', 'space', 'x'];

function setMovingDirection(direction) {
    db.ref('move/').set({
        direction: direction
    }).catch(function(err) {
        console.log('ERROR: ', err);
    });
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
