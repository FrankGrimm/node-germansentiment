# node-germansentiment

## Usage

TODO

### Options

options.wordlist: "sentiws" (default) or "bawlr"

options.datadirectory: Location of wordlist data files

options.storeinflections: false (default) sentiws only: Indicates whether inflections will be exported for token assessments (note: this largely increases memory requirements)

options.encoding: input file encoding (defaults to utf-8)

options.normalizetokens: true (default)/false - Use lowercase tokens in all cases (otherwise lookup will be case-sensitive

### Test script

To run some tests on the included analysis, simply run:

    npm run test-sentiws

To run all tests (including the BAWL-R wordlist), run:

    npm test

## Datasets

### SentiWS

SentiWS is a german-language sentiment wordlist available at under a CC-BY-NC-SA 3.0 Unported license

    R. Remus, U. Quasthoff & G. Heyer: SentiWS - a Publicly Available German-language Resource for Sentiment Analysis.
    In: Proceedings of the 7th International Language Ressources and Evaluation (LREC'10), pp. 1168--1171, 2010

### BAWL-R

BAWL-R is not available in this package, please see the license file for more information.
After obtaining the rights to use this dataset, export the wordlist to bawlr.csv (using a semicolon as the delimiter) and adjust options.datadirectory accordingly.
