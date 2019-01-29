import schedule = require('node-schedule');
import '../util/setupEnvironment';
import api from './api';
import YoutubeMarkov from './YoutubeMarkov';

(async () => {
    const MARKOV_FILEPATH = './data/data.json';
    const COMMENT_STORAGE_FILEPATH = './data/comments.txt';
    // As a cron style string. See https://www.npmjs.com/package/node-schedule
    // For now, once a day
    const UPDATE_INTERVAL = '0 * * *';

    const markov = new YoutubeMarkov(
        process.env.YOUTUBE_API_KEY,
        MARKOV_FILEPATH,
        COMMENT_STORAGE_FILEPATH,
    );
    await markov.initialise();
    if (markov.getKeyCount() === 0) {
        markov.updateMapFromYoutube();
    }

    // schedule updates
    const updateJob = schedule.scheduleJob(UPDATE_INTERVAL, () => {
        markov.updateMapFromYoutube();
    });

    api(markov, updateJob);
})();
