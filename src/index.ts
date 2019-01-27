import './util/setupEnvironment';

import * as markovInternal from './markov/markov';
import * as markov from './markov';
import * as youtube from './youtube';
c(async () => {
    console.log('YOUTUBE API KEY: ' + process.env.YOUTUBE_API_KEY);

    const trending = await youtube.fetchTrendingVideos(
        process.env.YOUTUBE_API_KEY,
    );
    const comments = await youtube.fetchCommentsForVideo(
        trending[0],
        process.env.YOUTUBE_API_KEY,
    );
    console.log(trending);
    console.log(markovInternal.splitInputIntoMessages(comments.join(`\n`)));

    const dictionary = markov.createDictionaryFromInput(
        'test text goes here',
        2,
    );

    console.log(markov.generateMessage(dictionary));
    console.log('');
    console.log(markov.generateMessage(dictionary));
    console.log('');
    console.log(markov.generateMessage(dictionary));
    console.log('');
    console.log(markov.generateMessage(dictionary));
    console.log('');

    console.log(`Keys: ${Object.keys(dictionary).length}`);

    console.log('oh wow');
})();
