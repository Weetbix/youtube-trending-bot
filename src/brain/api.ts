import express = require('express');
import YoutubeMarkov from './YoutubeMarkov';

const DEFAULT_PORT = 8080;

export interface IGenerateMessageRespone {
    message: string;
}

export interface IStatsResponse {
    KVRatio: number;
    memoryUsage: number;
    sentencesProcessed: number;
    sizeOnDisk: number;
    totalKeys: number;
    videosProcessed: number;
}

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
        } as IGenerateMessageRespone);
    });

    app.get('/stats', (req, res, next) => {
        res.json({
            KVRatio: markov.getKeyValueRatio(),
            memoryUsage: process.memoryUsage().rss,
            sentencesProcessed: markov.getSentencesProcessed(),
            sizeOnDisk: markov.getSizeOnDisk(),
            totalKeys: markov.getKeyCount(),
            videosProcessed: markov.getVideosProcessed(),
        } as IStatsResponse);
    });

    app.listen(port);

    return app;
}
