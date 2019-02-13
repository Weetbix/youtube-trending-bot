import { setupEnvironment } from '@youtube-trending-bot/util';
setupEnvironment();

import schedule = require('node-schedule');
import api from './src/api';
import YoutubeMarkov from './src/YoutubeMarkov';

(async () => {
    const MARKOV_FILEPATH = './data/data.json';
    const COMMENT_STORAGE_FILEPATH = './data/comments.txt';
    const VIDEOS_PROCESSED_FILEPATH = './data/videosProcessed.json';

    // As a cron style string. See https://www.npmjs.com/package/node-schedule
    // For now, once a day
    const UPDATE_INTERVAL = '0 * * *';

    const markov = new YoutubeMarkov(
        process.env.YOUTUBE_API_KEY,
        MARKOV_FILEPATH,
        VIDEOS_PROCESSED_FILEPATH,
        COMMENT_STORAGE_FILEPATH,
    );
    await markov.initialise();
    if (markov.getKeyCount() === 0) {
        // temporarily disable this while testing docker
        // markov.updateMapFromYoutube();
    }

    // schedule updates
    const updateJob = schedule.scheduleJob(UPDATE_INTERVAL, () => {
        markov.updateMapFromYoutube();
    });

    api(markov, updateJob);
})();
