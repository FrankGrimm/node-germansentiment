'use strict';

var fs = require('fs');

var load_file = function load_file(options, target, metadata, filename, cb) {
    fs.readFile(filename, {encoding: options.encoding || 'utf-8'}, function(err, content) {
        if (err) return cb(err, content);

        content = content.split('\n');
        metadata = metadata || {valence_min: Math.NaN, valence_max: Math.NaN, count: 0, mainforms: 0, wordlist: 'sentiws'};

        for (var lineIndex = 0; lineIndex < content.length; lineIndex++) {
            var splitline = content[lineIndex].replace(/^\s+|\s+$/g,'').split('\t');
            if (!splitline || splitline == '') continue; // ignore empty

            // crude format checks follow:
            if (splitline.length < 2) {
                console.log('Invalid line format: "' + content[lineIndex] + '"');
                continue;
            }
            var tokeninfo = splitline[0].split('|', 2);
            if (tokeninfo.length != 2) {
                console.log('Invalid token format: "' + splitline[0] + '"');
                continue;
            }

            var token_main = tokeninfo[0];
            var token_pos = tokeninfo[1];
            var token_value = parseFloat(splitline[1]);
            if (token_value == Math.NaN) {
                console.log('Invalid token value (NaN): "' + splitline[1] + '"');
            }

            if (metadata.valence_min === Math.NaN || token_value < metadata.valence_min) metadata.valence_min = token_value;
            if (metadata.valence_max === Math.NaN || token_value > metadata.valence_max) metadata.valence_max = token_value;

            var inflections = [];

            if (splitline.length > 2) {
                inflections = splitline[2].split(',');
            }

            // add main token form to inflection array
            inflections.unshift(token_main);
            var token = {token: token_main, pos: token_pos, valence: token_value};

            // optional attach all inflections to each token representation
            if (options.storeinflections) token.inflections = inflections;

            // store token information in target dictionary for every inflection to improve lookup speed
            metadata.mainforms++;
            for (var inflectionIndex = 0; inflectionIndex < inflections.length; inflectionIndex++) {
                var key = inflections[inflectionIndex];
                if (options.normalizetokens) key = key.toLowerCase();
                target[key] = token; 
            }
            metadata.count += inflections.length;
        }

        var tokenScore = function tokenScore(wordlist, token, weight) {
            if (wordlist.hasOwnProperty(token)) {
                var match = wordlist[token];
                return {value: match.valence * weight, assessment: match};
            }
            return null;
        };


        cb(null, target, metadata, tokenScore, null);
    });
};

var SentiWS = function SentiWS(options, cb) {
    var file_positive = options.datadirectory + 'SentiWS_v1.8c_Positive.txt';
    var file_negative = options.datadirectory + 'SentiWS_v1.8c_Negative.txt';

    var dict = {};

    load_file(options, dict, null, file_positive, function(err, data, metadata, tokenScore) {
        if (err) return cb(err, null);

        load_file(options, dict, metadata, file_negative, function(err, data, metadata, tokenScore) {
            if (err) return cb(err, null);
            return cb(null, data, metadata, tokenScore);
        });
    });
}

module.exports = exports = SentiWS;
