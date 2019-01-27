import {
    ControlTokens,
    createDictionary,
    groupTokens,
    tokeniseSingleMessage,
} from '../markov';

describe('tokeniseMessage', () => {
    it('should handle a basic sentence', () => {
        expect(tokeniseSingleMessage('this is easy')).toEqual([
            'this',
            'is',
            'easy',
        ]);
    });
});

describe('groupTokens', () => {
    it('should not return anything when there arent enough tokens', () => {
        expect(groupTokens(['cat'], 2)).toEqual([]);
        expect(groupTokens([], 2)).toEqual([]);
    });

    it('should return correct grouping when the length matches the chain length', () => {
        expect(groupTokens(['cat'], 1)).toEqual([['cat', ControlTokens.END]]);
        expect(groupTokens(['cat', 'dog'], 2)).toEqual([
            ['cat', 'dog', ControlTokens.END],
        ]);
    });

    it('should group tokens into lengths of L + 1', () => {
        expect(groupTokens(['cat', 'dog', 'horse', 'apple'], 2)).toEqual([
            ['cat', 'dog', 'horse'],
            ['dog', 'horse', 'apple'],
            ['horse', 'apple', ControlTokens.END],
        ]);
    });
});

describe('createDictionary', () => {
    it('shoud create the expected dictionaries', () => {
        const input = 'cats and dogs';
        const tokens = tokeniseSingleMessage(input);
        const groups = groupTokens(tokens, 2);

        expect(createDictionary(groups, 2)).toMatchSnapshot();
    });

    it('shoud create the expected dictionaries when there are more than one occurance of the same word', () => {
        const input = 'cats and cats and dogs';
        const tokens = tokeniseSingleMessage(input);
        const groups = groupTokens(tokens, 2);

        expect(createDictionary(groups, 2)).toMatchSnapshot();
    });
});
