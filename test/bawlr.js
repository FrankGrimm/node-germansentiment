'use strict';

// this test assumes that bawlr.csv is present in the directory "../data/" (relative to the repository location)

var sentiments = require('../lib/sentiments');
var testdata = require('./testdata');

sentiments({wordlist: 'bawlr', datadirectory: '../data/'}, function(err, score) {
    if (err) {
        console.log('Failed to load:');
        console.log(err);
        return;
    }

    testdata.evaluate(score);
});
