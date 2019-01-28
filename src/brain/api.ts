import express = require('express');
import YoutubeMarkov from './YoutubeMarkov';

const DEFAULT_PORT = 8080;

export default function(markov: YoutubeMarkov, port: number = DEFAULT_PORT) {
    const app = express();

    app.get(`/status`, (req, res, next) => {
        res.status(200).json({
            status: 'ok',
        });
    });

    app.get('/generateMessage', (req, res, next) => {
        res.json({
            message: markov.generateMessage(),
        });
    });

    app.get('/stats', (req, res, next) => {
        res.json({
            KVRatio: markov.getKeyValueRatio(),
            memoryUsage: process.memoryUsage().rss,
            sentencesLearned: markov.getSentencesLearned(),
            sizeOnDisk: markov.getSizeOnDisk(),
            totalKeys: markov.getKeyCount(),
            videosProcessed: markov.getVideosProcessed(),
        });
    });

    app.listen(port);

    return app;
}
