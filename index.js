const express = require('express');
const discord = require('discord.js');
const opsgenie = require('opsgenie-sdk');
const bodyparser = require('body-parser');
const config = require('./config');
const helpers = require('./helpers');

const app = express();
app.use(bodyparser.json())

const client = new discord.Client();

opsgenie.configure({
    "api_key": config.opsgenie.api_key
});

app.get('/opsgenie', async (req, res) => {
    const channel = client.channels.cache.get(config.discord.channel);
    const message = await helpers.sendOpsgenieEmbed(req.body, channel);
    
    // react to message with emojis
});

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.author.id !== client.user.id) return;
    if (reaction.message.channel.id !== config.discord.channel) return;

    const alertId = reaction.message.embeds[0].footer;

    if (reaction.id == config.emojis.acknowledge) {
        // acknowledge alert
    }
})

app.listen(3000, () => console.log("express live"));
client.on('ready', () => console.log("discord live"));

client.login(config.discord.token);