'use strict';

var fs = require('fs');

var testdata = fs.readFileSync(__dirname + '/../data/test.txt', {encoding: 'utf-8'}).split("\n\n").map(function(p) { return p.replace(/^\s+|\s+$/g, ''); }).filter(function(p) { return p && p.length > 1;});

var evaluate = function evaluate(score) {
    for (var idx = 0; idx < testdata.length; idx++) {
        var text = testdata[idx];

        score(text, function(err, input, score, confidence, assessments) {
            console.log('"' + text + '": ' + score, '[confidence: ' + confidence + '%]', '(' + assessments.length + " token infos)");
        });
    }
};

var tokenize = function tokenize(Tokenizer) {
    for (var idx = 0; idx < testdata.length; idx++) {
        var text = testdata[idx];

        Tokenizer(text, function(err, tokenized) {
            if (err) {
                throw err;
            }
            if (!tokenized) {
                throw new Error('no result for input ' + text);
            }
            tokenized = tokenized.map(function (token) { return '"' + token + '"'});

            console.log('"' + text + '" => ' + tokenized.join(', '));
        });
    }
}

module.exports = exports = {evaluate: evaluate, tokenize: tokenize};
