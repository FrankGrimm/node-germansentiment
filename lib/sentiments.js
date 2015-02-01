'use strict';

var Sentiments = function(options, cb) {
    cb = arguments[arguments.length-1];
    if (!options || options instanceof Function) options = {};

    // determine which word-list to use, default to SentiWS (since we can include the data for that inside the package)
    options.wordlist = options.wordlist || 'sentiws';
    // determine which tokenizer to use if the analysis input is a string instead of a token array
    options.tokenizer = options.tokenier || require('./naive_tokenizer');
    // choose data directory (needs to be changed for bawl-r, as we cannot distribute that dataset in the package)
    options.datadirectory = options.datadirectory || './data/';

    // normalize value ranges to the interval [-1:1]
    if (options.normalizeranges === undefined) options.normalizeranges = false;
    
    // normalize token lookup to lowercase (essentialy ignoring case for the entire analysis)
    if (options.normalizetokens === undefined) options.normalizetokens = true;
    
    if (!(options.wordlist == 'sentiws' || options.wordlist == 'bawlr')) return cb(new Error('invalid wordlist. Must be one of: bawlr, sentiws'), null);
    var wl = require('./' + options.wordlist);

    // load wordlist
    wl(options, function(err, wordlist, metadata) {
        // propagate errors (e.g. missing data file or similar)
        if (err) return cb(err, wordlist, metadata);

        console.log('wordlist loaded:', Object.keys(wordlist).length, metadata);
    });
};

module.exports = exports = Sentiments;

