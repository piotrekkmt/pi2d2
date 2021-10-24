const GPIO = require('onoff').Gpio;
const admin = require('firebase-admin');
const config = require('./pi2d2.config.json');

admin.initializeApp({
    credential: admin.credential.cert(config.firebase_credentials),
    databaseURL: config.firebase_database_url
});

let db = admin.database();

/* Set up motor pins */
let motorRForward = new GPIO(10, 'out'),
    motorRBack = new GPIO(9, 'out'),
    motorLForward = new GPIO(7, 'out'),
    motorLBack = new GPIO(8, 'out');

let usedPins = [motorLForward, motorLBack, motorRForward, motorRBack];

/* Process cleanup so that we don't fry the Pi */
process.on('SIGINT', function() {
    pi2D2.exit();
});

let moveRef = db.ref('move/');
moveRef.on('value', function(snapshot) {
    console.log('received from database', snapshot.val());
    pi2D2.move(snapshot.val().direction);
});

let pi2D2 = {
    exit: () => {
        for (let nr in usedPins) {
            usedPins[nr].writeSync(0);
            usedPins[nr].unexport();
        }
        console.log('Cleaned up. Bye, bye!');
        process.exit();
    },
    stop: () => {
        motorLForward.writeSync(0);
        motorLBack.writeSync(0);
        motorRForward.writeSync(0);
        motorRBack.writeSync(0);
    },
    forwards: () => {
        motorLForward.writeSync(0);
        motorLBack.writeSync(1);
        motorRForward.writeSync(0);
        motorRBack.writeSync(1);
    },
    backwards: () => {
        motorLForward.writeSync(1);
        motorLBack.writeSync(0);
        motorRForward.writeSync(1);
        motorRBack.writeSync(0);
    },
    left: () => {
        motorLForward.writeSync(0);
        motorLBack.writeSync(1);
        motorRForward.writeSync(1);
        motorRBack.writeSync(0);
    },
    right: () => {
        motorLForward.writeSync(1);
        motorLBack.writeSync(0);
        motorRForward.writeSync(0);
        motorRBack.writeSync(1);
    },
    move: (keypress) => {
        switch (keypress) {
        case 'up':
        case 'w':
            pi2D2.forwards();
            break;
        case 'down':
        case 's':
            pi2D2.backwards();
            break;
        case 'left':
        case 'a':
            pi2D2.left();
            break;
        case 'right':
        case 'd':
            pi2D2.right();
            break;
        case 'space':
        case 'x':
            pi2D2.stop();
            break;
        }
    }
};
