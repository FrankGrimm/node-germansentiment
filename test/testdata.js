'use strict';

var fs = require('fs');

var testdata = fs.readFileSync('./data/test.txt', {encoding: 'utf-8'}).split("\n\n").filter(function(p) { return p && p.length > 1;});

var evaluate = function evaluate(score) {
    for (var idx = 0; idx < testdata.length; idx++) {
        var text = testdata[idx];

        score(text, function(err, input, score, assessments) {
            console.log('"' + text + '": ' + score, '(' + assessments.length + " assessments)");
        });
    }
};

module.exports = exports = {evaluate: evaluate};
