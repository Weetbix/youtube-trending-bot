import {
    ControlTokens,
    createDictionary,
    createDictionaryFromInput,
    groupTokens,
    splitInputIntoMessages,
    tokeniseSingleMessage,
    updateDictionaryFromInput,
} from '../markov';

describe('splitInputIntoMessages', () => {
    it('should split based on new lines', () => {
        const input = `
message 1
message 2
message 3`;

        expect(splitInputIntoMessages(input)).toEqual([
            'message 1',
            'message 2',
            'message 3',
        ]);
    });

    it('should not include multiple new lines', () => {
        const input = `1\n\n2\n\n\n3`;
        expect(splitInputIntoMessages(input)).toEqual(['1', '2', '3']);
    });

    it('should not include lines with only whitespace', () => {
        const input = `1\n\t\n2`;
        expect(splitInputIntoMessages(input)).toEqual(['1', '2']);
    });

    it('should split based on full stops, and remove them', () => {
        const input = `
I had a cat.
It was nice.
But I prefer dogs.`;

        expect(splitInputIntoMessages(input)).toEqual([
            'I had a cat',
            'It was nice',
            'But I prefer dogs',
        ]);
    });

    it('should split between elipsis and ignore them', () => {
        expect(splitInputIntoMessages('Oh wow... so cool')).toEqual([
            'Oh wow',
            'so cool',
        ]);
    });

    it('should include punctuation in line', () => {
        expect(splitInputIntoMessages('Oh wow, so cool!')).toEqual([
            'Oh wow, so cool!',
        ]);
    });
});

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

describe('createDictionaryFromInput', () => {
    it('should create the expected dictionary', () => {
        const input = `
            A b c d!
            A b c d

            A b c d d`;

        expect(createDictionaryFromInput(input, 2)).toMatchSnapshot();
    });
});

describe('updateDictionaryFromInput', () => {
    it('should update the dictionary to produce the same result as if they were already joined', () => {
        const expectedInput = `
            A b c d!
            A b c d

            A b c d d
            a b b`;
        const expectedDictionary = createDictionaryFromInput(expectedInput, 2);

        const input1 = `
            A b c d!
            A b c d`;
        const input2 = `
            A b c d d
            a b b`;
        const actualDictionary = createDictionaryFromInput(input1, 2);
        updateDictionaryFromInput(input2, actualDictionary, 2);

        expect(actualDictionary).toEqual(expectedDictionary);
    });
});
