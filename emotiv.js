var Epoc = require('epocjs')();

Epoc.connect(function(event) {
    if (event.smile > 0) {
        console.log('smiling');
    }
    if (event.blink > 0) {
        console.log('blinking');
    }
    if (event.frown > 0) {
        console.log('frown');
    }
});
