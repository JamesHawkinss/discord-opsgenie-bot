const express = require('express');
const discord = require('discord.js');
const opsgenie = require('opsgenie-sdk');
const bodyparser = require('body-parser');
const config = require('./config');
const helpers = require('./helpers');

const app = express();
app.use(bodyparser.json())

const client = new discord.Client();

app.post('/opsgenie', async (req, res) => {
    res.sendStatus(200);
    const data = req.body;
    console.log(data);
    const channel = await client.channels.cache.get(config.discord.channel);

    if (data.action == "Create") {
        const message = await helpers.sendOpsgenieEmbed(data, channel);
    
        Object.keys(config.emojis).forEach(async (key) => {
            await message.react(message.guild.emojis.cache.get(config.emojis[key]));
        });
    } else if (data.action == "Close") {
        const messages = await helpers.getRelatedMessages(channel, data.alert.alertId);
        
        if (messages.array().length > 0) {
            messages.each((message) => message.delete());
        }
    } else if (data.action == "Acknowledge") {
        const messages = await helpers.getRelatedMessages(channel, data.alert.alertId);

        if (messages.array().length > 0) {
            messages.each(async (message) => {
                let reaction = message.reactions.cache.get(config.emojis.acknowledge);
                reaction = await message.reactions.resolve(reaction);
                reaction.remove();
                const embed = message.embeds[0];
                embed.addField("Acknowledged", "True");
                message.edit(embed);
            })
        }
    } else if (data.action == "UnAcknowledge") {
        const messages = await helpers.getRelatedMessages(channel, data.alert.alertId);

        if (messages.array().length > 0) {
            messages.each(async (message) => {
                let reaction = message.reactions.cache.get(config.emojis.acknowledge);
                message.react(reaction);
                const embed = message.embeds[0];
                embed.addField("Acknowledged", "False");
                message.edit(embed);
            })
        }
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.author.id !== client.user.id) return;
    if (reaction.message.channel.id !== config.discord.channel) return;
    if (reaction.count <= 1) return;

    const alertId = reaction.message.embeds[0].footer;

    if (reaction.emoji.id == config.emojis.acknowledge) {
        try {
            reaction.remove();
            const result = await helpers.ackOpsgenieAlert(alertId, username);
            console.log(result);
        } catch (e) {
            reaction.message.channel.send(`Failed to acknowledge alert!\nError: ${e.name} ${e.message}`);
        }
    } else if (reaction.emoji.id == config.emojis.close) {
        try {
            reaction.remove();
            const result = await helpers.closeOpsgenieAlert(alertId, user.username);
            console.log(result);
        } catch (e) {
            reaction.message.channel.send(`Failed to close alert!\nError: ${e.name} ${e.message}`);
        }
    }
});

app.listen(3000, () => console.log("express live"));
client.on('ready', () => console.log("discord live"));

client.login(config.discord.token);