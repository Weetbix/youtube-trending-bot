import '../util/setupEnvironment';
import api from './api';
import YoutubeMarkov from './YoutubeMarkov';

const markov = new YoutubeMarkov(process.env.YOUTUBE_API_KEY);

api(markov);

markov.updateMapFromYoutube();
