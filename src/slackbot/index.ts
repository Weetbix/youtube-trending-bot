import debug = require('debug');
const log = debug('slackbot');

import { RTMClient, WebClient } from '@slack/client';
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
    client.on('message', (message: ISlackMessage) => {
        // Skip bots
        if (message.subtype && message.subtype === 'bot_message') return;

        // @Mentions
        if (message.text.indexOf(`<@${botUserId}>`) >= 0) {
            client.sendMessage('Hello there', message.channel);
        }
    });
})();
