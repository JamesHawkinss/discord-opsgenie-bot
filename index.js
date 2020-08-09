const express = require('express');
const discord = require('discord.js');
const bodyparser = require('body-parser');
const config = require('./config');
const helpers = require('./helpers');

const { messageReactionAdd } = require('./messageReactionAdd');

const app = express();
app.use(bodyparser.json())

const client = new discord.Client();

app.post('/opsgenie', async (req, res) => {
    res.sendStatus(200);
    const data = req.body;
    const channel = await client.channels.fetch(config.discord.channel);

    console.log(data.action);
    switch (data.action) {
        case "Create":
            const createMessages = await helpers.sendOpsgenieEmbed(data, channel);

            Object.keys(config.emojis).forEach(async (key) => {
                if (key == "priority") return createMessages.react(createMessages.guild.emojis.cache.get(config.emojis.priority.main));
                createMessages.react(createMessages.guild.emojis.cache.get(config.emojis[key]));
            });
            break;
        case "Close":
            const closeMessages = await helpers.getRelatedMessages(channel, data.alert.alertId);

            if (closeMessages.array().length > 0) {
                closeMessages.each((message) => message.delete());
            }
            break;
        case "Acknowledge":
            const ackMessages = await helpers.getRelatedMessages(channel, data.alert.alertId);

            if (ackMessages.array().length > 0) {
                ackMessages.each(async (message) => {
                    let reaction = message.reactions.cache.get(config.emojis.acknowledge);
                    reaction.remove();
                    const embed = message.embeds[0];

                    if (embed.fields.some((field) => field.name == "Acknowledged")) {
                        embed.fields.forEach((field) => {
                            if (field.name == "Acknowledged") field.value = "True";
                        });
                    } else embed.addField("Acknowledged", "True");

                    message.edit(embed);
                })
            }
            break;
        case "UnAcknowledge":
            const unackMessages = await helpers.getRelatedMessages(channel, data.alert.alertId);

            if (unackMessages.array().length > 0) {
                unackMessages.each((message) => {
                    let reaction = message.guild.emojis.cache.get(config.emojis.acknowledge);
                    message.react(reaction);
                    const embed = message.embeds[0];

                    if (embed.fields.some((field) => field.name == "Acknowledged")) {
                        embed.fields.forEach((field) => {
                            if (field.name == "Acknowledged") field.value = "False";
                        });
                    } else embed.addField("Acknowledged", "False");

                    message.edit(embed);
                })
            }
            break;
        case "UpdatePriority":
            const priMessages = await helpers.getRelatedMessages(channel, data.alert.alertId);

            if (priMessages.array().length > 0) {
                priMessages.each((message) => {
                    const embed = message.embeds[0];
                    embed.fields.forEach((field) => { if (field.name == "Priority") field.value = data.alert.priority });
                    message.edit(embed);
                });
            }
            break;
        default:
            break;
    }
});

client.on('messageReactionAdd', messageReactionAdd);

app.listen(2444, () => console.log("express live"));
client.on('ready', () => console.log("discord live"));

client.login(config.discord.token);