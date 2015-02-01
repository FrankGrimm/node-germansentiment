'use strict';

var fs = require('fs');
var csv = require('csv');

var convertFloat = function convertFloat(s) {
    if (!s) return Math.NaN;
    s = s.replace(',', '.');
    return parseFloat(s);
}

var BAWLR = function BAWLR(options, cb) {
    var filename = options.datadirectory + 'bawlr.csv';

    fs.readFile(filename, {encoding: options.encoding || 'utf-8'}, function(err, data) {
        if (err) return cb(err, data);
        csv.parse(data, {delimiter: ';', skip_empty_lines: true, trim: true, auto_parse: false, columns: true}, function(err, data) {
            if (err) return cb(err, data);

            var dict = {};
            var metadata = {emo_min: Math.NaN, emo_max: Math.NaN, arousal_min: Math.NaN, arousal_max: Math.NaN, image_min: Math.NaN, image_max: Math.NaN, count: 0, wordlist: 'bawlr'};

            for (var entryIndex = 0; entryIndex < data.length; entryIndex++) {
                var entry = data[entryIndex];
                // convert datatypes where appropriate and necessary
                entry['EMO_MEAN'] = convertFloat(entry['EMO_MEAN']);
                entry['EMO_STD'] = convertFloat(entry['EMO_STD']);
                entry['AROUSAL_MEAN'] = convertFloat(entry['AROUSAL_MEAN']);
                entry['AROUSAL_STD'] = convertFloat(entry['AROUSAL_STD']);
                entry['IMAGE_MEAN'] = convertFloat(entry['IMAGE_MEAN']);
                entry['IMAGE_STD'] = convertFloat(entry['IMAGE_STD']);
                entry['Ftot/1MIL'] = convertFloat(entry['Ftot/1MIL']);
                entry['BIGmean(TOKEN)'] = convertFloat(entry['BIGmean(TOKEN)']);

                // update metadata min/max values:
                if (metadata.emo_min === Math.NaN || entry.EMO_MEAN < metadata.emo_min) metadata.emo_min = entry.EMO_MEAN;
                if (metadata.emo_max === Math.NaN || entry.EMO_MEAN > metadata.emo_max) metadata.emo_max = entry.EMO_MEAN;
                if (metadata.arousal_min === Math.NaN || entry.AROUSAL_MEAN < metadata.arousal_min) metadata.arousal_min = entry.AROUSAL_MEAN;
                if (metadata.arousal_max === Math.NaN || entry.AROUSAL_MEAN > metadata.arousal_max) metadata.arousal_max = entry.AROUSAL_MEAN;
                if (metadata.image_min === Math.NaN || entry.IMAGE_MEAN < metadata.image_min) metadata.image_min = entry.IMAGE_MEAN;
                if (metadata.image_max === Math.NaN || entry.IMAGE_MEAN > metadata.image_max) metadata.image_max = entry.IMAGE_MEAN;

                var targetKey = entry.WORD;
                if (options.normalizetokens) {
                    targetKey = entry.WORD_LOWER;
                }

                dict[targetKey] = entry;
            }
            metadata.count = data.length;

            cb(null, dict, metadata);
        });
    });

    return this;
}

module.exports = exports = BAWLR;
