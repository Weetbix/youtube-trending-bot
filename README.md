[![travis](https://travis-ci.org/Weetbix/youtube-trending-bot.svg?branch=master)](https://travis-ci.org/Weetbix/youtube-trending-bot) [![Greenkeeper badge](https://badges.greenkeeper.io/Weetbix/youtube-trending-bot.svg)](https://greenkeeper.io/)

# youtube-trending-bot

### Environment Variables

Environment variables can either be set in the usual way, or they can be added to a `.env` file in the root of the project directory.

| Key             | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| YOUTUBE_API_KEY | The youtube API key to use for searching and fetching comments |
| SLACK_API_KEY   | The slack bot OAuth token                                      |
| SLACK_BOT_NAME  | The name of your bot in slack                                  |
| DEBUG           | You should set this to `*` to see debug log output             |
