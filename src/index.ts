import * as markov from './markov/markov';

const messages = markov.tokeniseSingleMessage('cats dogs');
console.log(messages);

console.log(markov.groupTokens(messages, 2));

console.log('oh wow');
