var Epoc = require('epocjs')();

Epoc.connect(function(event) {
    if (event.smile > 0) {
        console.log('smiling');
    }
});
