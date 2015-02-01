'use strict';

var fs = require('fs');

var testdata = fs.readFileSync('./data/test.txt', {encoding: 'utf-8'}).split("\n\n").filter(function(p) { return p && p.length > 1;});

module.exports = exports = testdata;
