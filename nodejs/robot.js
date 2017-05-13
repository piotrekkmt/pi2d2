const GPIO = require('onoff').Gpio;
const admin = require('firebase-admin');
const config = require('./pi2d2.config.json');

admin.initializeApp({
    credential: admin.credential.cert(config.firebase_credentials),
    databaseURL: config.firebase_database_url
});

let db = admin.database();

/* Set up motor pins */
let motorRForward = new GPIO(9, 'out'),
    motorRBack = new GPIO(10, 'out'),
    motorLForward = new GPIO(8, 'out'),
    motorLBack = new GPIO(7, 'out');

let usedPins = [motorLForward, motorLBack, motorRForward, motorRBack];

/* Process cleanup so that we don't fry the Pi */
process.on('SIGINT', function() {
    pi2D2.exit();
});

var moveRef = db.ref('move/');
moveRef.on('value', function(snapshot) {
    console.log('received from database', snapshot.val());
    pi2D2.move(snapshot.val().direction);
});

var pi2D2 = {
    exit: function() {
        for (let nr in usedPins) {
            usedPins[nr].writeSync(0);
            usedPins[nr].unexport();
        }
        console.log('Cleaned up. Bye, bye!');
        process.exit();
    },
    stop: function() {
        motorLForward.writeSync(0);
        motorLBack.writeSync(0);
        motorRForward.writeSync(0);
        motorRBack.writeSync(0);
    },
    forwards: function() {
        motorLForward.writeSync(1);
        motorLBack.writeSync(0);
        motorRForward.writeSync(1);
        motorRBack.writeSync(0);
    },
    backwards: function() {
        motorLForward.writeSync(0);
        motorLBack.writeSync(1);
        motorRForward.writeSync(0);
        motorRBack.writeSync(1);
    },
    left: function() {
        motorLForward.writeSync(0);
        motorLBack.writeSync(1);
        motorRForward.writeSync(1);
        motorRBack.writeSync(0);
    },
    right: function() {
        motorLForward.writeSync(1);
        motorLBack.writeSync(0);
        motorRForward.writeSync(0);
        motorRBack.writeSync(1);
    },
    move: function(keypress) {
        switch (keypress) {
        case 'up':
            pi2D2.forwards();
            break;
        case 'down':
            pi2D2.backwards();
            break;
        case 'left':
            pi2D2.left();
            break;
        case 'right':
            pi2D2.right();
            break;
        case 'space':
            pi2D2.stop();
            break;
        }
    }
};
