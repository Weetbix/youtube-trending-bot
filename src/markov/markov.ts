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

export interface IMarkovMap {
    [key: string]: Token[];
}

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
