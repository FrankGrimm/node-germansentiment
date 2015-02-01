'use strict';

var emoticons = require('./emoticons')();
var negations = require('./negations');

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

    // negation processing
    if (options.negationprocessing === undefined) options.negationprocessing = true;

    // emoticons
    if (options.disableemoticons === undefined) options.disableemoticons = false;

    // score normalization to interval [-1:1]
    if (options.normalizescore === undefined) options.normalizescore = true;

    if (!(options.wordlist == 'sentiws' || options.wordlist == 'bawlr')) return cb(new Error('invalid wordlist. Must be one of: bawlr, sentiws'), null);
    var wl = require('./' + options.wordlist);

    // load negations
    negations(function(err, get_negations) {
        // propagate errors (e.g. missing data file or similar)
        if (err) return cb(err, contains_negation);
        // load wordlist
        wl(options, function(err, wordlist, metadata, tokenScore, normalizeScore) {
            // propagate errors (e.g. missing data file or similar)
            if (err) return cb(err, wordlist, metadata, tokenScore);

            console.log('wordlist loaded. metadata: ', metadata);

            var assessTokens = function assessTokens(input, cb) {
                var assessments = [];
                var scored = 0;
                var totalScore = 0.0;
                var weight = 1.0; // weight, may be used for arousal and/or negation
                var delimiters = /([\s+.,?!:\-\[\]\(\)]+)/gm;
                var delimiter_count = 0;

                for (var tokenIdx = 0; tokenIdx < input.length; tokenIdx++) {
                    var token = input[tokenIdx];
                    if (!token) continue;
                    if (options.normalizetokens) token = token.toLowerCase();

                    // check for delimiters
                    var is_delimiter = false;
                    if (token.match(delimiters)) {
                        assessments.push({token: token, 'type': 'delimiter'});
                        delimiter_count++;
                        is_delimiter = true;
                    }

                    // emoticons 
                    if (!options.disableemoticons) {
                        var emoticonscore = emoticons(token);
                        if (emoticonscore !== null) {
                            // console.log(token, 'EMOTE', emoticonscore);
                            // remove delimiter entry
                                assessments.pop(); 
                            totalScore += emoticonscore;
                            scored++;
                            assessments.push({token: token, score: emoticonscore, type: 'emoticon'});
                            continue;
                        } else if (is_delimiter) {
                            continue;
                        }
                    } else if (is_delimiter) {
                        continue;
                    }

                    var score = tokenScore(wordlist, token, weight);
                    if (score !== null) { // wordlist found a match
                        assessments.push({token: token, score: score.value, details: score.assessment});
                        totalScore += score.value;
                        scored++;
                        // console.log(token, score.value);
                        continue;
                    }

                    // unhandled, insert filler
                    assessments.push({token: token, score: 0.0});

                }

                // check if last assessment entry is a delimiter, otherwise insert empty delimiter
                var last_assessment = assessments[assessments.length - 1];
                if (!last_assessment || !('type' in last_assessment && last_assessment.type === 'delimiter')) {
                    assessments.push({token: '', type: 'delimiter'});
                }

                // check for negations
                if (options.negationprocessing) {
                    var fragment = [0, assessments.length];

                    for (var assessmentIdx = 0; assessmentIdx < assessments.length; assessmentIdx++) { 
                        var assessment = assessments[assessmentIdx];
                        var isdelim = false;

                        // check if token is a delimiter
                        if ('type' in assessment && assessment.type === 'delimiter') {
                            // delimiter hit, fragment ends here
                            fragment[1] = assessmentIdx;
                            isdelim = true;
                        }

                        // console.log(assessmentIdx, require('util').inspect(assessments[assessmentIdx]));

                        if (isdelim) {
                            var fragment_text = input.slice(fragment[0], fragment[1]).join(' ');
                            var negation_count = get_negations(fragment_text);
                            //console.log('"' + fragment_text + '"', negation_count);

                            // odd negation count -> real negation
                            if (negation_count > 0 && (negation_count % 2) !== 0) {
                                // swap all non-zero scores within the fragment
                                for (var fIdx = fragment[0]; fIdx < fragment[1]; fIdx++) {
                                    if (!('score' in assessments[fIdx])) continue;

                                    if (assessments[fIdx].score == 0.0) continue;

                                    // remove score from total
                                    totalScore -= assessments[fIdx].score;

                                    assessments[fIdx].score *= -1.0;

                                    // add new score to the total
                                    totalScore += assessments[fIdx].score;
                                }
                            }

                            // fragment ended, so new one starts at n+1
                            fragment[0] = fragment[1] + 1;
                        }
                    }
                }

                if (scored > 0) {
                    // we got some data, compute confidence
                    var confidence = ((scored + delimiter_count)/ input.length) * 100.0;
                    var endscore = totalScore / scored;

                    // check if score needs normalization
                    if (options.normalizescore && normalizeScore) {
                        endscore = normalizeScore(metadata, endscore);
                    }

                    // invoke callback
                    cb(null, input, endscore, confidence, assessments);
                } else {
                    cb(null, input, 0.0, 0.0, []);
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
    });
};

module.exports = exports = Sentiments;

