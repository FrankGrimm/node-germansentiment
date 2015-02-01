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

    // normalize token lookup to lowercase (essentialy ignoring case for the entire analysis)
    if (options.normalizetokens === undefined) options.normalizetokens = true;
    
    if (!(options.wordlist == 'sentiws' || options.wordlist == 'bawlr')) return cb(new Error('invalid wordlist. Must be one of: bawlr, sentiws'), null);
    var wl = require('./' + options.wordlist);

    // load wordlist
    wl(options, function(err, wordlist, metadata, tokenScore) {
        // propagate errors (e.g. missing data file or similar)
        if (err) return cb(err, wordlist, metadata, tokenScore);

        console.log('wordlist loaded. metadata: ', metadata);

        var assessTokens = function assessTokens(input, cb) {
            var assessments = [];
            var totalScore = 0.0;
            var weight = 1.0; // weight, may be used for arousal and/or negation

            for (var tokenIdx = 0; tokenIdx < input.length; tokenIdx++) {
                var token = input[tokenIdx];
                if (!token) continue;
                if (options.normalizetokens) token = token.toLowerCase();

                // check for negation
                
                // check for sentence delimiters to reset weight
                
                var score = tokenScore(wordlist, token, weight);
                if (score !== null) { // wordlist found a match
                    assessments.push(score.assessment);
                    totalScore += score.value;
                    console.log(token, score.value);
                }
            }

            if (assessments.length > 0) {
                cb(null, input, totalScore / assessments.length, assessments);
            } else {
                cb(null, input, 0.0, []);
            }
        };
        
        var assess = function assess(input, cb) {
            if (Array.isArray(input)) {
                return assessTokens(input, cb);
            } else {
                // input is not tokenized yet
                options.tokenizer(input, function(err, tokens) {
                    if (err) return cb(err, null);
                    return assessTokens(tokens, cb);
                });
            }
        };

        cb(null, assess);
    });
};

module.exports = exports = Sentiments;

