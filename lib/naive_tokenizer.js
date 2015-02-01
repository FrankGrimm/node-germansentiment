'use strict';

// naive tokenizer to split input into tokens (using special characters and whitespace)
var Tokenizer = function(input, cb) {
    if (!input) return cb(new Error('missing input'), null);
   
    // trim input
    input = input.replace(/^\s+|\s+$/g, '');

    // split on sentence delimiters and other whitespace but keep them
    input = input.split(/([\s+.,?!:\-\[\]\(\)]+)/gm);
    input = input || [];
    // trim all elements and remove empty ones
    input = input.map(function(s) { return s.replace(/^\s+|\s+$/g, '')}).filter(function(s) { return s && s.length >= 0});

    cb(null, input);
};

module.exports = exports = Tokenizer;

