export enum ControlTokens {
    END,
}
type token = string | ControlTokens;
type tokenChains = token[][];

export function tokeniseMessage(message: string): token[] {
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
export function groupTokens(tokens: token[], chainLength: number): tokenChains {
    tokens.push(ControlTokens.END);

    return tokens.reduce((acc, current, index) => {
        if (index < tokens.length - chainLength) {
            acc.push(tokens.slice(index, index + chainLength + 1));
        }
        return acc;
    }, []);
}
