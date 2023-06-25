const wordsToNumbers = require('words-to-numbers').wordsToNumbers;

const ACRONYMS = require('../constants/acronyms').ACRONYMS;
const formatRaw = require('./format').formatRaw;

exports.checkAnswer = (categoryName, clue, expected, actual) => {
    const MIN_ANSWER_LENGTH = 3;

    const rawCategoryName = formatRaw(categoryName);
    const rawClue = formatRaw(clue);
    const rawExpected = formatRaw(wordsToNumbers(expected).toString());
    const rawActual = formatRaw(wordsToNumbers(actual).toString());

    // If expected answer is short (< 3 characters) then the actual answer can be short too
    const lengthLimit = rawExpected.length >= MIN_ANSWER_LENGTH ? MIN_ANSWER_LENGTH : 0;

    const validLength = rawActual.length >= lengthLimit;

    const containsAnswer = rawExpected.includes(rawActual) || rawActual.includes(rawExpected);

    for (let acronym of Object.keys(ACRONYMS)) {
        const acronymArray = ACRONYMS[acronym];

        if (acronymArray.includes(rawExpected) && acronymArray.includes(rawActual)) {
            return true;
        }
    }

    const cheated = !rawCategoryName.includes(rawExpected) && rawCategoryName.includes(rawActual) || rawClue.includes(rawActual);

    return rawActual === rawExpected || validLength && containsAnswer && !cheated;
};

exports.checkPlayerName = (playerName) => {
    if (playerName.length === 0) {
        return 'Your name is too short, please try again!';
    } else if (playerName.length > 20) {
        return 'Your name is too long, please try again!';
    }

    return '';
};
