'use strict';

var fs = require('fs');

// https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string
/** Function count the occurrences of substring in a string;
*  * @param {String} string   Required. The string;
*   * @param {String} subString    Required. The string to search for;
*    * @param {Boolean} allowOverlapping    Optional. Default: false;
*     */
function occurrences(string, subString, allowOverlapping){

    string+=""; subString+="";
    if(subString.length<=0) return string.length+1;

    var n=0, pos=0;
    var step=(allowOverlapping)?(1):(subString.length);

    while(true){
        pos=string.indexOf(subString,pos);
        if(pos>=0){ n++; pos+=step; } else break;
    }
    return(n);
}

var Negations = function Negations(cb) {

    fs.readFile(__dirname + '/../data/german_negations', {encoding: 'utf-8'}, function(err, data) {
        if (err) return cb(err, null);

        data = data.split('\n').filter(function(s) { return s && s.length > 0}).map(function(s) { return s + ' '; });

        var get_negation = function get_negation(text) {
            if (!text) return 0;
            text = text + ' ';
            var result = 0;

            for (var idx = 0; idx < data.length; idx++) {
                var count = occurrences(text, data[idx], true);
                result += count;
            }

            return result;
        };

        cb(null, get_negation);
    });

};

module.exports = exports = Negations;
