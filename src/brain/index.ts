import '../util/setupEnvironment';
import api from './api';
import YoutubeMarkov from './YoutubeMarkov';

(async () => {
    const MARKOV_FILEPATH = './data/data.json';

    const markov = new YoutubeMarkov(
        process.env.YOUTUBE_API_KEY,
        MARKOV_FILEPATH,
    );
    await markov.initialise();

    api(markov);

    if (markov.getKeyCount() === 0) {
        markov.updateMapFromYoutube();
    }
})();
