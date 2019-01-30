import debug = require('debug');
const log = debug('slackbot');

import { RTMClient, WebClient } from '@slack/client';
import querystring = require('querystring');
import { IGenerateMessageRespone, IStatsResponse } from '../brain/api';
import '../util/setupEnvironment';

interface ISlackMessage {
    subtype?: string;
    user: string;
    text: string;
    channel: string;
}

/**
 * For some reason, the bots.info endpoint will not give
 * me the bots user ID. So instead we search the user list
 * for our bot with the given name from the ENV variable :\
 */
async function findBotID(): Promise<string | undefined> {
    const webClient = new WebClient(process.env.SLACK_API_KEY);
    const users: any = await webClient.users.list();
    const bot = users.members.find(
        (result: any) => result.name === process.env.SLACK_BOT_NAME,
    );
    return bot ? bot.id : undefined;
}

(async () => {
    const botUserId = await findBotID();
    if (!botUserId) {
        log('Bot user not found. Exiting.');
        process.exit(1);
    }

    const client = new RTMClient(process.env.SLACK_API_KEY);
    client.start();
    client.on('message', async (message: ISlackMessage) => {
        // Skip bots
        if (message.subtype && message.subtype === 'bot_message') return;

        // @Mentions
        if (message.text) {
            if (message.text.includes(`<@${botUserId}>`)) {
                // Print stats if we find the word stats
                if (message.text.includes(' stats'))
                    return await handleStatsMessage(client, message);

                // otherwise generate a message
                return await handleNormalMessage(client, message);
            }
        }
    });
})();

async function handleNormalMessage(client: RTMClient, message: ISlackMessage) {
    const url =
        `http://localhost:8080/generateMessage?` +
        querystring.stringify({
            replyTo: message.text,
        });
    const response = await fetch(url);
    const json = (await response.json()) as IGenerateMessageRespone;

    client.sendMessage(json.message, message.channel);
}

async function handleStatsMessage(client: RTMClient, message: ISlackMessage) {
    const response = await fetch(`http://localhost:8080/stats`);
    const json = (await response.json()) as IStatsResponse;

    function bytesToMiB(bytes: number) {
        return (bytes / 1024 / 1024).toFixed(2) + ' MiB';
    }

    const stats =
        `To become so darn smart I've looked ` +
        `at *${json.videosProcessed}* videos and read through ` +
        `*${json.sentencesProcessed} sentences*.\n` +
        `I know *${
            json.responseKeywords
        } keywords* that I will respond to! \n` +
        `I have *${json.totalKeys} keys* in my head, and on ` +
        `average these have *${json.KVRatio.toFixed(2)} values* each.\n` +
        `I'm using *${bytesToMiB(json.sizeOnDisk)}s of disk* and ` +
        `*${bytesToMiB(json.memoryUsage)}s of RAM.*\n\n` +
        `I'll look at some more YouTube videos *${json.timeOfNextUpdate}*.`;

    client.sendMessage(stats, message.channel);
}
