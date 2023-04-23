const generateQuestions = async ({openai, categoryTitle}) => {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: `For the trivia game category '${categoryTitle}', create five increasingly difficult questions in the form Q1: ..., A1: ..., Q2: ..., A2: ..., Q3: ..., A3: ..., Q4: ..., A4: ..., Q5: ..., A5: ...`,
            }
        ],
        temperature: 1,
        n: 1,
    });

    let textSplit = response.data.choices[0].message.content.split(/[QA][1-5]: /);
    textSplit = textSplit.map(x => x.trim()).filter(x => x !== "");
    if (textSplit.length !== 10) {
        throw new Error(`didn't get five questions and answers: ${textSplit.length}`)
    }

    const res = [];
    for (let i = 0; i < 5; i += 1) {
        res.push({
            question: textSplit[i * 2],
            answer: textSplit[i * 2 + 1],
            value: (i + 1) * 100,
            airdate: '2020-03-18T19:00:00.000Z',
            category_id: Math.floor(Math.random()*10000),
            game_id: Math.floor(Math.random()*10000),
            id: Math.floor(Math.random()*10000),
        })
    }
    return res;
}

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
const generateCategories = async numCategories => {
    const {Configuration, OpenAIApi} = await import("openai");
    const configuration = new Configuration({
        organization: "org-FUQ2Mg2xMn8YIFNyrwjMBnk1",
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    // console.log("Generating titles...");
    let response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: `Generate ${numCategories} jeopardy category names separated by the delimiter '---'`,
            }
        ],
        temperature: 1.5,
        n: 1,
    });
    // console.log(response.data.choices[0].message.content);
    const titles = response.data.choices[0].message.content.split("---").map(x => x.trim()).filter(x => x !== "").map(x => /^[0-9\-.]*(.*?)[.?!]?$/.exec(x)[1]);
    // console.log(`Generated titles: ${titles} (${titles.length}.) Generating clues for titles...`);
    const cluesForTitles = await Promise.all(titles.map(title => generateQuestions({openai, categoryTitle: title})));
    // console.log(`Generated ${cluesForTitles.length} clues for titles: ${cluesForTitles}`);

    const res = [];
    for(let i = 0; i < numCategories; i += 1) {
        res.push({
            id: Math.floor(1 + Math.random() * 10000),
            title: titles[i],
            clues: cluesForTitles[i],
            clues_count: 5,
        })
    }
    return res;
}


exports.generateCategories = generateCategories;