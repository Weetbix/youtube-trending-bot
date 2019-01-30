import express = require('express');
import moment = require('moment');
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
    timeOfNextUpdate: string;
    videosProcessed: number;
    responseKeywords: number;
}

interface IJob {
    nextInvocation(): Date;
}

export default function(
    markov: YoutubeMarkov,
    updateJob: IJob,
    port: number = DEFAULT_PORT,
) {
    const app = express();

    app.get(`/status`, (req, res, next) => {
        res.status(200).json({
            status: 'ok',
        });
    });

    app.get('/generateMessage', (req, res, next) => {
        res.json({
            message: markov.generateMessage(req.query.replyTo),
        } as IGenerateMessageRespone);
    });

    app.get('/stats', (req, res, next) => {
        res.json({
            KVRatio: markov.getKeyValueRatio(),
            memoryUsage: process.memoryUsage().rss,
            responseKeywords: markov.getNumberOfResponseKeywords(),
            sentencesProcessed: markov.getSentencesProcessed(),
            sizeOnDisk: markov.getSizeOnDisk(),
            timeOfNextUpdate: moment(
                updateJob.nextInvocation().toISOString(),
            ).fromNow(),
            totalKeys: markov.getKeyCount(),
            videosProcessed: markov.getVideosProcessed(),
        } as IStatsResponse);
    });

    app.listen(port);

    return app;
}
