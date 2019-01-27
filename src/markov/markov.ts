export enum ControlTokens {
    END,
}
type Token = string | ControlTokens;
type TokenChains = Token[][];

export function tokeniseMessage(message: string) {
    return message.split(' ');
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

export interface MarkovMap {
    [key: string]: Token[];
}

export function createDictionary(
    tokenChains: TokenChains,
    chainLength: number,
): MarkovMap {
    const map = {};
    addToDictionary(map, tokenChains, chainLength);
    return map;
}

export function addToDictionary(
    map: MarkovMap,
    tokenChains: TokenChains,
    chainLength: number,
): MarkovMap {
    tokenChains.forEach((tokenChain: token[]) => {
        const key = tokenChain.slice(0, chainLength).join(' ');
        map[key] = tokenChain.slice(chainLength);
    });
}
