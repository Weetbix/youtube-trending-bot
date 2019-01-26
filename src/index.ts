import * as makrov from './makrov/makrov';

const messages = makrov.tokeniseMessage('cats dogs');
console.log(messages);

console.log(makrov.groupTokens(messages, 2));

console.log('oh wow');
