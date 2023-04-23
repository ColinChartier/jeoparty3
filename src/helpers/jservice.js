const request = require('request');
const qs = require('query-string');
const _ = require('lodash');
const {generateCategories} = require("./aiservice");

const formatRaw = require('./format').formatRaw;
const formatCategory = require('./format').formatCategory;

const finalJeopartyClues = require('../constants/finalJeopartyClues.js').finalJeopartyClues;

const MAX_CATEGORY_ID = 18418;
const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;

class jServiceApi{
	constructor() {
		this._url = 'http://jservice.io/api/'
	}

	_makeRequest(url, callback) {
		url = this._url + url;
		request(url, function(err, response, json) {
            if (response) {
                const parsedJson = response.statusCode == 200 ? JSON.parse(json) : undefined;
                callback(err, response, parsedJson);
            } else {
                callback(false, { 'statusCode': 400 }, {});
            }
		});
	}

    category(id, callback) {
		const url = 'category?' + qs.stringify({'id' : id});
		this._makeRequest(url, callback);
	}

	random(count, callback) {
		count = count || 100;
		count = count > 100 ? 100 : count;
		const url = 'random?' + qs.stringify({'count' : count});
		this._makeRequest(url, callback);
	}
}

const js = new jServiceApi();

const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const weightedRandomClueIndex = () => {
    let sum = 0;
    let r = Math.random();

    const distribution = {0: 0.05, 1: 0.2, 2: 0.4, 3: 0.2, 4: 0.15};

    for (const i in distribution) {
        sum += distribution[i];

        if (r <= sum) {
            return parseInt(i);
        }
    }
};

const getDailyDoubleIndices = () => {
    const categoryIndex = Math.floor(Math.random() * NUM_CATEGORIES);
    const clueIndex = weightedRandomClueIndex();

    const djCategoryIndex1 = Math.floor(Math.random() * NUM_CATEGORIES);
    const djClueIndex1 = weightedRandomClueIndex();

    let djCategoryIndex2;
    do {
        djCategoryIndex2 = Math.floor(Math.random() * NUM_CATEGORIES);
    } while (djCategoryIndex1 === djCategoryIndex2);
    const djClueIndex2 = weightedRandomClueIndex();

    return [categoryIndex, clueIndex, djCategoryIndex1, djClueIndex1, djCategoryIndex2, djClueIndex2];
};


// const getRandomCategory = (cb) => {
//     if(Math.random() < 1) {
//         getAICategory(cb);
//         return;
//     }
//
//
//     const categoryId = Math.floor(Math.random() * MAX_CATEGORY_ID) + 1;
//
//     js.category(categoryId, (error, response, category) => {
//         if (!error && response.statusCode === 200) {
//             const cluesCount = category.clues_count;
//             const startingIndex = Math.round((Math.random() * (cluesCount - 5)) / 5) * 5;
//             category.clues = category.clues.slice(startingIndex, startingIndex + 5);
//
//             if (approveCategory(category)) {
//                 cb(false, formatCategory(category));
//             } else {
//                 cb(false, {categoryId: categoryId})
//             }
//         } else {
//             console.log(`Error: ${response.statusCode}`);
//             cb(true, { categoryId: categoryId });
//         }
//     });
// };

const approveCategory = (category) => {
    const rawCategoryTitle = formatRaw(category.title);
    const isMediaCategory = rawCategoryTitle.includes('logo') || rawCategoryTitle.includes('video');

    for (let i = 0; i < NUM_CLUES; i++) {
        const clue = category.clues[i];

        if (!clue) {
            return false;
        }

        const rawQuestion = formatRaw(clue.question);

        const isValid = rawQuestion.length > 0 && clue.invalid_count === null;
        const isMediaQuestion =
            rawQuestion.includes('seenhere') ||
            rawQuestion.includes('picturedhere') ||
            rawQuestion.includes('heardhere') ||
            rawQuestion.includes('video');

        if (!isValid || isMediaQuestion) {
            return false;
        }

        clue.completed = false;
        clue.dailyDouble = false;
    }

    category.completed = false;
    category.numCluesUsed = 0;

    return !isMediaCategory;
};

const approveGame = (categories, doubleJeopartyCategories, finalJeopartyClue) => {
    if (categories.length != NUM_CATEGORIES || doubleJeopartyCategories.length != NUM_CATEGORIES || !_.get(finalJeopartyClue, 'question')) {
        return false;
    }

    for (let i = 0; i < NUM_CLUES; i++) {
        let category = categories[i];
        let doubleJeopartyCategory = doubleJeopartyCategories[i];

        if (!category || category.clues.length != NUM_CLUES || !doubleJeopartyCategory || doubleJeopartyCategory.clues.length != NUM_CLUES) {
            return false;
        }
    }

    return true;
};

exports.getRandomCategories = async (cb) => {
    const allCategories = await generateCategories(12);

    const categories = allCategories.slice(0, 6);
    const doubleJeopartyCategories = allCategories.slice(6, 12);
    const finalJeopartyClue = choice(finalJeopartyClues);
    finalJeopartyClue.categoryName = finalJeopartyClue.category;

    const [categoryIndex, clueIndex, djCategoryIndex1, djClueIndex1, djCategoryIndex2, djClueIndex2] = getDailyDoubleIndices();
    categories[categoryIndex].clues[clueIndex].dailyDouble = true;
    doubleJeopartyCategories[djCategoryIndex1].clues[djClueIndex1].dailyDouble = true;
    doubleJeopartyCategories[djCategoryIndex2].clues[djClueIndex2].dailyDouble = true;

    cb(categories, doubleJeopartyCategories, finalJeopartyClue, false);
    // return;

    // const recursiveGetRandomCategory = () => {
    //     getRandomCategory((error, category) => {
    //         console.log(`error: ${error}, categoryId: ${category.id}, clues: ${category?.clues}, categories: ${categories.length}, doubleJeopardyCategories: ${doubleJeopartyCategories.length}`);
    //         if (error) {
    //             cb(categories, doubleJeopartyCategories, finalJeopartyClue, true);
    //         } else if (!category || usedCategoryIds.includes(category.id) || !category.clues || category.clues.length != NUM_CLUES) {
    //             recursiveGetRandomCategory();
    //         } else {
    //             if (categories.length < NUM_CATEGORIES) {
    //                 categories.push(category);
    //             } else if (doubleJeopartyCategories.length < NUM_CATEGORIES) {
    //                 doubleJeopartyCategories.push(category);
    //             } else {
    //                 finalJeopartyClue = choice(finalJeopartyClues);
    //                 finalJeopartyClue.categoryName = finalJeopartyClue.category;
    //             }
    //
    //             usedCategoryIds.push(category.id);
    //
    //             if (approveGame(categories, doubleJeopartyCategories, finalJeopartyClue)) {
    //                 const [categoryIndex, clueIndex, djCategoryIndex1, djClueIndex1, djCategoryIndex2, djClueIndex2] = getDailyDoubleIndices();
    //                 categories[categoryIndex].clues[clueIndex].dailyDouble = true;
    //                 doubleJeopartyCategories[djCategoryIndex1].clues[djClueIndex1].dailyDouble = true;
    //                 doubleJeopartyCategories[djCategoryIndex2].clues[djClueIndex2].dailyDouble = true;
    //
    //                 // DEBUG
    //                 // const categoryName = categories[categoryIndex].title;
    //                 // const dollarValue = 200 * (clueIndex + 1);
    //                 // console.log(`Daily double is '${categoryName} for $${dollarValue}'`);
    //
    //                 cb(categories, doubleJeopartyCategories, finalJeopartyClue, false);
    //             } else {
    //                 recursiveGetRandomCategory();
    //             }
    //         }
    //     });
    // };
    //
    // recursiveGetRandomCategory();
};
