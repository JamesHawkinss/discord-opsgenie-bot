# discord-opsgenie-bot

A Discord bot that allows for Slack-like interaction with Opsgenie alerts from within Discord.

## Features

 - React to acknowledge, close, and update priority of alerts
 - Embeds for displaying alerts
 - Embeds update when alert updated in Opsgenie

## Setup

1. Clone this repository
2. Add the required emojis from the /emojis folder to your Discord server
3. Copy `config.js` from `config.example.js`, and fill out values
4. Run `node .` to start the bot
5. (optional) Use a process manager such as PM2 to keep the bot up.