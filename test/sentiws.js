'use strict';

var sentiments = require('../lib/sentiments');
var testdata = require('./testdata');

sentiments({wordlist: 'sentiws'}, function(err, score) {
    if (err) {
        console.log('Failed to load:');
        console.log(err);
        return;
    }
    

});
