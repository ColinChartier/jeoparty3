const request = require('request');
const qs = require('query-string');
const _ = require('lodash');

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

//{
//   id: 1876,
//   title: 'tv stars',
//   clues_count: 15,
//   clues: [
//     {
//       id: 201361,
//       answer: '(Ray) Romano',
//       question: `Everybody loved this sitcom star as Zoe Kazan's dad in "The Big Sick"`,
//       value: 200,
//       airdate: '2020-03-18T19:00:00.000Z',
//       category_id: 1876,
//       game_id: 6581,
//       invalid_count: null
const getAICategory = async cb => {
    try {
        const {Configuration, OpenAIApi} = await import("openai");
        const configuration = new Configuration({
            organization: "org-FUQ2Mg2xMn8YIFNyrwjMBnk1",
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        let response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: "give a single jeopardy category name",

                }
            ],
            temperature: 0.7,
            n: 1,
        });
        const title = /^(.*?)[.?!]?$/.exec(response.data.choices[0].message.content)[1];

        response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `For the trivia game category '${title}', create five increasingly difficult questions in the form Q1: ..., A1: ..., Q2: ..., A2: ..., Q3: ..., A3: ..., Q4: ..., A4: ..., Q5: ..., A5: ...`,
                }
            ],
            temperature: 0.7,
            n: 1,
        });

        let textSplit = response.data.choices[0].message.content.split(/[QA][1-5]: /);
        textSplit = textSplit.map(x => x.trim()).filter(x => x !== "");
        if(textSplit.length !== 10) {
            cb(true, `didn't get five questions and answers: ${textSplit.length}`)
            return
        }
        const res = {
            id: Math.floor(1+Math.random()*10000)+MAX_CATEGORY_ID,
            title,
            clues_count: 5,
            clues: []
        };
        for(let i = 0; i < 5; i += 1) {
            res.clues.push({
                id: res.id+1+i,
                question: textSplit[i*2],
                answer: textSplit[i*2+1],
                value: (i+1)*100,
                airdate: '2020-03-18T19:00:00.000Z',
                category_id: res.id,
                game_id: 1000,
            })
        }
        cb(false, res);
    } catch (e) {
        console.log(`Error: ${e}`);
        cb(true, e);
    }
}

const getRandomCategory = (cb) => {
    if(Math.random() < 1) {
        getAICategory(cb);
        return;
    }


    const categoryId = Math.floor(Math.random() * MAX_CATEGORY_ID) + 1;

    js.category(categoryId, (error, response, category) => {
        if (!error && response.statusCode === 200) {
            const cluesCount = category.clues_count;
            const startingIndex = Math.round((Math.random() * (cluesCount - 5)) / 5) * 5;
            category.clues = category.clues.slice(startingIndex, startingIndex + 5);

            if (approveCategory(category)) {
                cb(false, formatCategory(category));
            } else {
                cb(false, {categoryId: categoryId})
            }
        } else {
            console.log(`Error: ${response.statusCode}`);
            cb(true, { categoryId: categoryId });
        }
    });
};

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

exports.getRandomCategories = (cb) => {
    let categories = [];
    let doubleJeopartyCategories = [];
    let finalJeopartyClue = {};
    let usedCategoryIds = [];

    const recursiveGetRandomCategory = () => {
        getRandomCategory((error, category) => {
            console.log(`error: ${error}, categoryId: ${category.id}, clues: ${category?.clues}, categories: ${categories.length}, doubleJeopardyCategories: ${doubleJeopartyCategories.length}`);
            if (error) {
                cb(categories, doubleJeopartyCategories, finalJeopartyClue, true);
            } else if (!category || usedCategoryIds.includes(category.id) || !category.clues || category.clues.length != NUM_CLUES) {
                recursiveGetRandomCategory();
            } else {
                if (categories.length < NUM_CATEGORIES) {
                    categories.push(category);
                } else if (doubleJeopartyCategories.length < NUM_CATEGORIES) {
                    doubleJeopartyCategories.push(category);
                } else {
                    finalJeopartyClue = choice(finalJeopartyClues);
                    finalJeopartyClue.categoryName = finalJeopartyClue.category;
                }

                usedCategoryIds.push(category.id);

                if (approveGame(categories, doubleJeopartyCategories, finalJeopartyClue)) {
                    const [categoryIndex, clueIndex, djCategoryIndex1, djClueIndex1, djCategoryIndex2, djClueIndex2] = getDailyDoubleIndices();
                    categories[categoryIndex].clues[clueIndex].dailyDouble = true;
                    doubleJeopartyCategories[djCategoryIndex1].clues[djClueIndex1].dailyDouble = true;
                    doubleJeopartyCategories[djCategoryIndex2].clues[djClueIndex2].dailyDouble = true;

                    // DEBUG
                    // const categoryName = categories[categoryIndex].title;
                    // const dollarValue = 200 * (clueIndex + 1);
                    // console.log(`Daily double is '${categoryName} for $${dollarValue}'`);

                    cb(categories, doubleJeopartyCategories, finalJeopartyClue, false);
                } else {
                    recursiveGetRandomCategory();
                }
            }
        });
    };

    recursiveGetRandomCategory();
};
