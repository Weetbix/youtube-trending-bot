import debug = require('debug');
import fs = require('fs');
import path = require('path');
import util = require('util');
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

    /**
     * @param pathToFile    The path to persist the map to on disk
     */
    constructor(readonly apiKey: string, readonly pathToFile: string) {}

    public async initialise() {
        try {
            await this.loadMapFromStorage();
        } catch {
            log('Unable to load map from storage. Creating fresh one');
            this.map = createDictionaryFromInput('', CHAIN_LENGTH);
        }
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
            20,
        );
        log(`Fetched ${comments.length} comments`);

        updateDictionaryFromInput(comments.join('\n'), this.map, CHAIN_LENGTH);
        log(`Dictionary now contains ${Object.keys(this.map).length} keys`);

        this.saveMapToStorage();
    }

    public getKeyCount() {
        return Object.keys(this.map).length;
    }

    private async loadMapFromStorage() {
        const readFile = util.promisify(fs.readFile);
        const json = await readFile(this.pathToFile, { encoding: 'utf8' });

        this.map = JSON.parse(json) as IMarkovMap;
        log(
            `markov file loaded form disk with [${Object.keys(this.map)}] keys`,
        );
    }

    private async saveMapToStorage() {
        // Ensure the folder exists before we create it
        const dir = path.dirname(this.pathToFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const writeFile = util.promisify(fs.writeFile);
        await writeFile(this.pathToFile, JSON.stringify(this.map));
        log(`Saved markov file to disk at ${this.pathToFile}`);
    }
}
