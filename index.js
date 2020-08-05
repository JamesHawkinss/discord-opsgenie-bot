const express = require('express');
const discord = require('discord.js');
const bodyparser = require('body-parser');
const config = require('./config');
const helpers = require('./helpers');

const app = express();
app.use(bodyparser.json())

const client = new discord.Client();

app.post('/opsgenie', async (req, res) => {
    res.sendStatus(200);
    const data = req.body;
    const channel = await client.channels.cache.get(config.discord.channel);

    switch(data.action) {
        case "Create":
            const createMessages = await helpers.sendOpsgenieEmbed(data, channel);
        
            Object.keys(config.emojis).forEach((key) => {
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

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.author.id !== client.user.id) return;
    if (reaction.message.channel.id !== config.discord.channel) return;
    if (reaction.count <= 1) return;

    const alertId = reaction.message.embeds[0].footer.text;
    const emojiId = reaction.emoji.id;

    if (emojiId == config.emojis.acknowledge) {
        try {
            await helpers.ackOpsgenieAlert(alertId, user.username);
        } catch (e) {
            reaction.message.channel.send(`Failed to acknowledge alert!\nError: ${e.name} ${e.message}`);
        }
    } else if (emojiId == config.emojis.close) {
        try {
            await helpers.closeOpsgenieAlert(alertId, user.username);
        } catch (e) {
            reaction.message.channel.send(`Failed to close alert!\nError: ${e.name} ${e.message}`);
        }
    } else if (emojiId == config.emojis.priority.main) {
        if (!config.permissions.priority.some((item) => item == user)) return;

        Object.keys(config.emojis.priority).forEach(async (key) => {
            if (reaction.message.embeds[0].fields.some(field => field.value == key)) return;
            if (config.emojis.priority[key] == emojiId) helpers.changePriorityOpsgenieAlert(alertId, key);
            reaction.remove();
        });
    }
});

app.listen(3000, () => console.log("express live"));
client.on('ready', () => console.log("discord live"));

client.login(config.discord.token);