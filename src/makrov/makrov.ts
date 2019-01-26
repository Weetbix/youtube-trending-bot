type token = string;
type tokenChains = token[][];

export function tokeniseMessage(message: string): token[] {
    return message.split(' ');
}

export function groupTokens(message: string, chainLength: number): tokenChains {
    return null;
}
