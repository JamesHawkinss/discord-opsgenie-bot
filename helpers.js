const discord = require('discord.js');
const opsgenie = require('opsgenie-sdk');
const config = require('./config');
const { response } = require('express');
const e = require('express');

opsgenie.configure({
    "api_key": config.opsgenie.api_key
});

function createEmbed() {
    const embed = new discord.MessageEmbed();
    return embed;
}

async function sendOpsgenieEmbed(data, channel) {
    if (data.action !== "Create") return;

    const embed = createEmbed();
    embed.setTitle("New OpsGenie Alert");

    if (data.alert.message) embed.addField("Message", data.alert.message);
    if (data.alert.source) embed.addField("Source", data.alert.source);
    if (data.alert.teams.length > 0) {
        let teams = "";
        data.alert.teams.forEach((team) => {
            teams += `${team}\n`;
        });
        embed.addField("Assigned Teams", teams);
    }
    if (data.alert.recipients) {
        console.log(data.alert.recipients);
        // let recipients = "";
        // data.alert.recipients.forEach((recipient) => {
        //     recipients += `${recipient}\n`;
        // });
        // embed.addField("Assigned Recipients", recipients);
    }
    if (data.alert.alertId && data.alert.tinyId) embed.setFooter(`${data.alert.alertId}`);

    const message = await channel.send(embed);
    return message;
}

async function closeOpsgenieAlert(id, username) {
    var out;

    const identifier = {
        identifier: id,
        identifierType: 'id'
    };

    const closeData = {
        "note": `Closed by Discord user "${username}"`,
        "source": "discord-opsgenie-bot"
    };

    try {
        opsgenie.alertV2.close(identifier, closeData, (error, result) => {
            if (error) throw error;
            out = result;
        });
    
        return out;
    } catch (e) {
        throw e;
    }
}

async function ackOpsgenieAlert(id, username) {
    var out;

    const identifier = {
        identifier: id,
        identifierType: 'id'
    };

    const ackData = {
        "note": `Closed by Discord user "${username}"`,
        "source": "discord-opsgenie-bot"
    };

    try {
        opsgenie.alertV2.acknowledge(identifier, ackData, (error, result) => {
            if (error) throw error;
            out = result;
        });

        return out;
    } catch (e) {
        throw e;
    }
}

async function getRelatedMessages(channel, id) {
    let messages = await channel.messages.fetch();
    messages = messages.filter((msg) => msg.embeds[0].footer.text == id);
    return messages;
}

module.exports = {
    createEmbed,
    sendOpsgenieEmbed,
    closeOpsgenieAlert,
    getRelatedMessages
}