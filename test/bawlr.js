'use strict';

var sentiments = require('../lib/sentiments');
var testdata = require('./testdata');

sentiments({wordlist: 'bawlr', datadirectory: '../data/'}, function(score) {

});
