import * as markov from './markov';

const dictionary = markov.createDictionaryFromInput('test text goes here', 2);

console.log(markov.generateMessage(dictionary));
console.log('');
console.log(markov.generateMessage(dictionary));
console.log('');
console.log(markov.generateMessage(dictionary));
console.log('');
console.log(markov.generateMessage(dictionary));
console.log('');

console.log(`Keys: ${Object.keys(dictionary).length}`);

console.log('oh wow');
