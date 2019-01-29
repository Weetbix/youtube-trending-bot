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
        const input = `cat\n\ndog\n\n\nmouse`;
        expect(splitInputIntoMessages(input)).toEqual(['cat', 'dog', 'mouse']);
    });

    it('should not include lines with only whitespace', () => {
        const input = `cat\n\t\ndog`;
        expect(splitInputIntoMessages(input)).toEqual(['cat', 'dog']);
    });

    it('should replace long stretches of white space with a space', () => {
        expect(
            splitInputIntoMessages(
                '   cat     dog        mouse giraffe  scot   ',
            ),
        ).toEqual(['cat dog mouse giraffe scot']);
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

    it('should remove quotes', () => {
        expect(splitInputIntoMessages(`I'm doing "great" lol here'''`)).toEqual(
            ['Im doing great lol here'],
        );
    });

    it('should include punctuation in line', () => {
        expect(splitInputIntoMessages('Oh wow, so cool!')).toEqual([
            'Oh wow, so cool!',
        ]);
    });

    it('should remove youtube time anchor tags', () => {
        const input =
            '<a href="https://www.youtube.com/watch?v=zbZzeceXKKk&amp;t=20m16s">20:16</a> test';
        const expected = ['20:16 test'];

        expect(splitInputIntoMessages(input)).toEqual(expected);
    });

    it('should remove time anchors even if there are multiples', () => {
        const input =
            // tslint:disable-next-line:max-line-length
            '<a href="https://www.youtube.com/watch?v=zbZzeceXKKk&amp;t=20m16s">20:16</a>test<a href="https://www.youtube.com/watch?v=zbZzeceXKKk&amp;t=20m16s">20:16</a>';
        const expected = ['20:16 test 20:16'];

        expect(splitInputIntoMessages(input)).toEqual(expected);
    });

    it('should strip bold tags', () => {
        const input = '<b>oh wow</b>more<b>things</b>';
        const expected = ['oh wow more things'];

        expect(splitInputIntoMessages(input)).toEqual(expected);
    });

    it('should split on br tags as if they were new lines', () => {
        const input = 'line 1<br /><br /><br />line 2';
        const expected = ['line 1', 'line 2'];

        expect(splitInputIntoMessages(input)).toEqual(expected);
    });

    it('should unescape HTML entities back to plain text', () => {
        const input = 'm&amp;m';
        const expected = [`m&m`];

        expect(splitInputIntoMessages(input)).toEqual(expected);
    });

    it('should ignore lines that dont have any alpha characters', () => {
        const input = `here\n10:10\nthere`;
        expect(splitInputIntoMessages(input)).toEqual(['here', 'there']);
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
