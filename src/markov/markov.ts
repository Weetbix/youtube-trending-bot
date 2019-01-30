import { sample, unescape } from 'lodash';
import { stringify } from 'querystring';

export enum ControlTokens {
    END,
}
type Token = string | ControlTokens;
type TokenChains = Token[][];

export function splitInputIntoMessages(input: string) {
    return (
        unescape(input)
            .toLowerCase()
            // Remove any character repetition over 2 times. ie aaaaa => aa
            .replace(/([^0-9])(\1{1,1})(\1{1,})/g, '$1$2')
            // Remove any non-alpha or non-numerical repetitions over 1 times.
            // Adding u ensures unicode support and trimming down of emojis streams
            .replace(/([^a-zA-Z0-9])\1{1,}/gu, '$1')
            .replace(/<br \/>/g, `\n`) // Replace BRs with new lines
            .replace(/<a href=".*?">/g, ' ') // String anchor links
            .replace(/(<\/a>|<b>|<\/b>|<\/?i>)/g, ' ') // Remove anchor, bold and italics tags
            .replace(/\n{2,}/g, '\n') // Remove duplicate blank lines
            .replace(/ {2,}/g, ' ') // Remove duplicate spaces
            .replace(/["']/g, '') // Remove quotes
            .split(/[\n\.]/) // Split based on new line or full stops
            .map(line => line.trim()) // Remove any head/tail whitespace
            // Remove blank lines and lines without any alpha characters
            .filter(line => line.length > 0 && /[a-zA-Z]/g.test(line))
    );
}

export function tokeniseSingleMessage(message: string) {
    return message.split(' ');
}

/**
 * Creates a new markov dictionary from unsanitised input
 */
export function createDictionaryFromInput(
    input: string,
    chainLength: number,
): IMarkovMap {
    const tokenChains = splitInputIntoMessages(input).flatMap(line =>
        groupTokens(tokeniseSingleMessage(line), chainLength),
    );

    return createDictionary(tokenChains, chainLength);
}

/**
 * Updates a given markov dictionary with new, unsanitised input
 */
export function updateDictionaryFromInput(
    input: string,
    map: IMarkovMap,
    chainLength: number,
) {
    const tokenChains = splitInputIntoMessages(input).flatMap(line =>
        groupTokens(tokeniseSingleMessage(line), chainLength),
    );

    addToDictionary(map, tokenChains, chainLength);
}

/**
 * Takes a list of tokens and returns them in the correct length chunks for our map.
 *
 * For example:
 * [ 'cat', 'dog' ]
 * would return:
 * [
 *   ['cat', 'dog'],
 *   ['dog', END]
 * ]
 */
export function groupTokens(tokens: Token[], chainLength: number): TokenChains {
    tokens.push(ControlTokens.END);

    return tokens.reduce((acc, current, index) => {
        if (index < tokens.length - chainLength) {
            acc.push(tokens.slice(index, index + chainLength + 1));
        }
        return acc;
    }, []);
}

export interface IMarkovMap {
    [key: string]: Token[];
}

/**
 * Creates tunescapehe markov dictionary based on a token
 * chain an expected length.
 * For now we don't make the values in the dictonary
 * unique. This will provide a rudimentary frequency
 * selection.
 */
export function createDictionary(
    tokenChains: TokenChains,
    chainLength: number,
): IMarkovMap {
    const map = {};
    addToDictionary(map, tokenChains, chainLength);
    return map;
}

export function addToDictionary(
    map: IMarkovMap,
    tokenChains: TokenChains,
    chainLength: number,
) {
    tokenChains.forEach((tokenChain: Token[]) => {
        // The key is the first 'chain length' worth of tokens
        const key = tokenChain.slice(0, chainLength).join(' ');

        const currentValue = map[key] || [];
        map[key] = [...currentValue, ...tokenChain.slice(chainLength)];
    });
}

/**
 * @param map   The map to use for creating the message
 * @param seed  The intial hash (seed) to use
 */
export function generateMessage(map: IMarkovMap, seed?: string): string {
    const MAX_WORD_LENGTH = 50;

    // start off with a seed from the array keys, either
    // use provided or random
    let key = seed ? seed : sample(Object.keys(map));
    let message = key;

    for (let i = 0; i < MAX_WORD_LENGTH; i++) {
        const nextWord = sample(map[key]);
        if (nextWord === ControlTokens.END) {
            break;
        }

        // Take all of the tokens after the first one to
        // create our new key
        const remainingWordsInKey = key.substring(key.indexOf(' ') + 1);
        key = remainingWordsInKey + ' ' + nextWord;
        message += ' ' + nextWord;
    }

    return message;
}
