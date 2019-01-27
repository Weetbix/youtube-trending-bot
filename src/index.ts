import './util/loadEnvironmentVariables';
import * as markov from './markov';

console.log('YOUTUBE API KEY: ' + process.env.YOUTUBE_API_KEY);

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
