var sentiments = require('germansentiment');
sentiments({wordlist: 'sentiws'}, function(err, score) {
    if (err) {
        console.log('Failed to load:', err);
        return;
    }

    var outputResult = function outputResult(err, tokenized_text, valence, confidence, assessments) {
        if (err) {
            console.log('Error:', err);
            return;
        }
        console.log('"' + tokenized_text.join(' ') + '": ', valence, ' (confidence: ' + Math.round(confidence) + '%)');

        var text_with_assessments = "";
        for (var idx = 0; idx < assessments.length; idx++) {
            var token_assessment = assessments[idx];
            if ('score' in token_assessment) {
                text_with_assessments += token_assessment.token + '/' + token_assessment.score.toFixed(2) + ' ';
            } else if ('type' in token_assessment) {
                text_with_assessments += token_assessment.token + '/' + token_assessment.type + ' ';
            } else {
                text_with_assessments += token_assessment.token + ' ';
            }
        }
        console.log(text_with_assessments + '\n');
    };

    score('Hallo! Schön dich zu sehen', outputResult);
    score('Das ist aber nicht schön.', outputResult);
    score('Was soll der Mist?', outputResult);
});

