import debug = require('debug');
const log = debug('brain');

import {
    createDictionaryFromInput,
    generateMessage,
    IMarkovMap,
    updateDictionaryFromInput,
} from '../markov';
import { fetchAllCommentsForVideo, fetchTrendingVideos } from '../youtube';
import api from './api';

const CHAIN_LENGTH = 2;

export default class YoutubeMarkov {
    private map: IMarkovMap;

    constructor(readonly apiKey: string) {
        this.map = createDictionaryFromInput('', CHAIN_LENGTH);
    }

    public generateMessage() {
        return generateMessage(this.map);
    }

    public async updateMapFromYoutube() {
        log('Updating map from youtube');

        const trending = await fetchTrendingVideos(this.apiKey);
        log(`Fetching comments from ${trending[0]}`);

        const comments = await fetchAllCommentsForVideo(
            trending[0],
            this.apiKey,
        );
        log(`Fetched ${comments.length} comments`);

        updateDictionaryFromInput(comments.join('\n'), this.map, CHAIN_LENGTH);
        log(`Dictionary now contains ${Object.keys(this.map).length} keys`);
    }
}
