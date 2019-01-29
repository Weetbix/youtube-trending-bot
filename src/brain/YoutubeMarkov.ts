import debug = require('debug');
import fs = require('fs');
import path = require('path');
import util = require('util');
const log = debug('brain');

import {
    ControlTokens,
    createDictionaryFromInput,
    generateMessage,
    IMarkovMap,
    updateDictionaryFromInput,
} from '../markov';
import { fetchAllCommentsForVideo, fetchTrendingVideos } from '../youtube';

// Some constants that will help us limit how many comments we
// are fetching per day, so we don't hit the quota limit
const QUOTA_COST_PER_FETCH = 4; // 1 per video listing, 3 per comment fetching
const MAX_QUOTA_PER_DAY = 10000;
const COMMENTS_PER_BATCH = 100;
const MAX_COMMENTS_PER_DAY =
    (MAX_QUOTA_PER_DAY / QUOTA_COST_PER_FETCH) * COMMENTS_PER_BATCH;

const MAX_COMMENTS_PER_VIDEO = 100;

const MAX_VIDEOS_PER_UPDATE = 5;

const CHAIN_LENGTH = 2;

interface ISerializedStructure {
    map: IMarkovMap;
    harvestedYoutubeIDs: string[];
}

export default class YoutubeMarkov {
    private map: IMarkovMap;
    private harvestedYoutubeIDs: Set<string> = new Set<string>();

    /**
     * @param pathToMapStorage    The path to persist the map to on disk
     * @param pathToCommentStorage  The path to persist all processed input to
     *                              useful for rebuilding the data or changing chainlength etc
     */
    constructor(
        readonly apiKey: string,
        readonly pathToMapStorage: string,
        readonly pathToCommentStorage: string,
    ) {}

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

        // Get the latest trending videos, not including ones we
        // have already processed, and limit it to MAX_VIDEOS_PER_UPDATE
        const trending = (await fetchTrendingVideos(this.apiKey))
            .filter(videoID => !this.harvestedYoutubeIDs.has(videoID))
            .slice(0, MAX_VIDEOS_PER_UPDATE);

        // Iterate through the trending videos, for each one fetch
        // our predetermined amount of comments and add them to our
        // dictionary.
        let commentsFetched = 0;
        for (const videoId of trending) {
            log(`Fetching comments from ${videoId}`);
            const comments = await fetchAllCommentsForVideo(
                videoId,
                this.apiKey,
                MAX_COMMENTS_PER_VIDEO,
            );
            commentsFetched += comments.length;
            log(`Fetched ${comments.length} comments`);

            updateDictionaryFromInput(
                comments.join('\n'),
                this.map,
                CHAIN_LENGTH,
            );
            this.harvestedYoutubeIDs.add(videoId);
            this.saveCommentsToStorage(comments);

            // Try not to go over our quota in the next fetch
            if (commentsFetched + MAX_COMMENTS_PER_VIDEO > MAX_COMMENTS_PER_DAY)
                break;
        }

        log(`Dictionary now contains ${Object.keys(this.map).length} keys`);
        log(`Dictionary KV ratio is now ${this.getKeyValueRatio()}`);
        this.saveMapToStorage();
    }

    public getKeyCount() {
        return Object.keys(this.map).length;
    }

    public getKeyValueRatio() {
        const totalValues = Object.values(this.map).reduce(
            (total, tokenArray) => (total += tokenArray.length),
            0,
        );
        return totalValues / this.getKeyCount();
    }

    /**
     * Returns how many sentences have been processed. Given that
     * every sentence ends with the END token, and duplicate tokens
     * are kept, we can just count the number of END tokens.
     */
    public getSentencesProcessed() {
        return Object.values(this.map)
            .flat()
            .filter(token => token === ControlTokens.END).length;
    }

    public getVideosProcessed() {
        return this.harvestedYoutubeIDs.size;
    }

    /**
     * returns the size on disk in bytes
     */
    public getSizeOnDisk() {
        if (fs.existsSync(this.pathToMapStorage)) {
            return fs.statSync(this.pathToMapStorage).size;
        }
        return 0;
    }

    private async loadMapFromStorage() {
        const readFile = util.promisify(fs.readFile);
        const json = await readFile(this.pathToMapStorage, {
            encoding: 'utf8',
        });

        const data = JSON.parse(json) as ISerializedStructure;
        this.map = data.map;
        this.harvestedYoutubeIDs = new Set(data.harvestedYoutubeIDs);
        log(
            `markov file loaded from disk with [${
                Object.keys(this.map).length
            }] keys`,
        );
    }

    private async saveMapToStorage() {
        // Ensure the folder exists before we create it
        const dir = path.dirname(this.pathToMapStorage);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const data: ISerializedStructure = {
            harvestedYoutubeIDs: Array.from(this.harvestedYoutubeIDs),
            map: this.map,
        };

        const writeFile = util.promisify(fs.writeFile);
        await writeFile(this.pathToMapStorage, JSON.stringify(data));
        log(`Saved markov file to disk at ${this.pathToMapStorage}`);
    }

    private async saveCommentsToStorage(comments: string[]) {
        const dir = path.dirname(this.pathToCommentStorage);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const appendFile = util.promisify(fs.appendFile);
        await appendFile(this.pathToCommentStorage, comments.join('\n'));
    }
}
