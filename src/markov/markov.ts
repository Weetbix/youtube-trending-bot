export enum ControlTokens {
    END,
}
type Token = string | ControlTokens;
type TokenChains = Token[][];

export function splitInputIntoMessages(input: string) {
    return input
        .replace(/<br \/>/g, `\n`) // Replace BRs with new lines
        .replace(/<a href=".*?">/g, ' ') //String anchor links
        .replace(/(<\/a>|<b>|<\/b>)/g, ' ') // Remove anchor and bold tags
        .replace(/\n{2,}/g, '\n') // Remove duplicate blank lines
        .replace('  ', ' ') // Remove duplicate spaces
        .split(/[\n\.]/) // Split based on new line or full stops
        .map(line => line.trim()) // Remove any head/tail whitespace
        .filter(line => line.length > 0); // Remove blanks
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
 * Creates the markov dictionary based on a token
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

function sample<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
}

export function generateMessage(map: IMarkovMap): string {
    const MAX_WORD_LENGTH = 50;

    // start off with a random seed from the array keys
    let key = sample(Object.keys(map));
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
