import debug = require('debug');
import fs = require('fs');
import { sample } from 'lodash';
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

const MAX_COMMENTS_PER_VIDEO = 1000;

const MAX_VIDEOS_PER_UPDATE = 50;

const CHAIN_LENGTH = 3;

const MIN_WORD_LENGTH_FOR_SEED = 5;

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const appendFile = util.promisify(fs.appendFile);

export default class YoutubeMarkov {
    private map: IMarkovMap;
    private wordToHash: Map<string, string[]>;
    private harvestedYoutubeIDs: Set<string> = new Set<string>();

    /**
     * @param pathToMapStorage              The path to persist the map to on disk
     * @param pathToVideosProcessedStorage  The path where we store the list of videos we've already processed
     * @param pathToCommentStorage          The path to persist all processed input to
     *                                      useful for rebuilding the data or changing chainlength etc
     */
    constructor(
        readonly apiKey: string,
        readonly pathToMapStorage: string,
        readonly pathToVideosProcessedStorage: string,
        readonly pathToCommentStorage: string,
    ) {}

    public async initialise() {
        await this.loadDataFromStorage();
    }

    public generateMessage(replyTo?: string) {
        // Attempt to see from the input
        if (replyTo) {
            const seedWord: string | undefined = sample(
                toSeedableWords(replyTo),
            );
            log(`Seed word selected is: ${seedWord}`);

            const seedHash = sample(this.wordToHash.get(seedWord));
            log(`Seedhash result is: ${seedHash}`);

            if (seedHash) {
                return generateMessage(this.map, seedHash);
            }
        }

        // otherwise just randomly reply
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
        this.saveDataToStorage();
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

    public getNumberOfResponseKeywords() {
        return this.wordToHash.size;
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

    private async loadDataFromStorage() {
        // first load the IDs
        const ids = await loadJSONFromFile<string[]>(
            this.pathToVideosProcessedStorage,
        );
        if (ids !== null) {
            this.harvestedYoutubeIDs = new Set(ids);
        }

        // next try and load the map
        const map = await loadJSONFromFile<IMarkovMap>(this.pathToMapStorage);
        if (map !== null) {
            this.map = map;

            log(
                `markov file loaded from disk with [${
                    Object.keys(this.map).length
                }] keys`,
            );
        } else {
            // Create a fresh map
            log(`No markov file found. Creating a fresh map`);
            this.map = createDictionaryFromInput('', CHAIN_LENGTH);

            // If the map is gone, but we have the original comments file
            // we should use that comment file to rebuild the map!
            const allCommentsEver = await loadFile(this.pathToCommentStorage);
            if (allCommentsEver !== null) {
                log(`comments file found. Populating map with input`);
                updateDictionaryFromInput(
                    allCommentsEver,
                    this.map,
                    CHAIN_LENGTH,
                );
                await this.saveDataToStorage();
            }
        }
        this.wordToHash = generateWordsToHashMap(this.map);
    }

    private async saveDataToStorage() {
        saveJSONToFile(
            Array.from(this.harvestedYoutubeIDs),
            this.pathToVideosProcessedStorage,
        );
        saveJSONToFile(this.map, this.pathToMapStorage);
        log(`Saved markov file to disk at ${this.pathToMapStorage}`);
    }

    private async saveCommentsToStorage(comments: string[]) {
        const dir = path.dirname(this.pathToCommentStorage);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        await appendFile(this.pathToCommentStorage, comments.join('\n'));
    }
}

async function saveJSONToFile<T>(obj: T, filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    await writeFile(filePath, JSON.stringify(obj));
}

async function loadJSONFromFile<T>(filePath: string): Promise<T> {
    try {
        const json = await readFile(filePath, {
            encoding: 'utf8',
        });

        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}

async function loadFile(filePath: string) {
    try {
        const contents = await readFile(filePath, {
            encoding: 'utf8',
        });
        return contents;
    } catch {
        return null;
    }
}

/**
 * Takes a sentence or string and returns an array of
 * words which we will consider for seeding message generation
 * We only consider words:
 *  - of a certain length
 *  - without quotes, question marks etc
 *  - non-common words like 'think' etc that the bot may
 *    be asked normally
 *  - that are entirely a-z letters
 */
function toSeedableWords(sentence: string) {
    const blacklist = [
        'think',
        'about',
        'going',
        'making',
        'please',
        'youre',
        'saying',
    ];

    return sentence
        .replace(/["'?]/g, '')
        .toLowerCase()
        .split(/\s/g)
        .filter(
            word =>
                word.length >= MIN_WORD_LENGTH_FOR_SEED &&
                /^[a-zA-Z]+$/.test(word) &&
                !blacklist.includes(word),
        );
}

/**
 * Generates a map that you can use to look up hashes
 * that contain a word in a given markov map.
 * Note: for now this stores the hashes again as strings.
 * A future improvement would store references to the
 * token arrays, and pass this to the markov functions.
 */
function generateWordsToHashMap(markov: IMarkovMap) {
    const wordToHash = new Map<string, string[]>();
    Object.keys(markov).forEach(hash => {
        toSeedableWords(hash).forEach(word => {
            const val = wordToHash.get(word);
            if (val) {
                val.push(hash);
            } else {
                wordToHash.set(word, [hash]);
            }
        });
    });
    log(`Generated a word=>hash map with ${wordToHash.size} entries`);
    return wordToHash;
}
