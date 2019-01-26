import { tokeniseMessage } from '../makrov';

describe('tokeniseMessage', () => {
    it('should handle a basic sentence', () => {
        expect(tokeniseMessage('this is easy')).toEqual(['this', 'is', 'easy']);
    });
});
