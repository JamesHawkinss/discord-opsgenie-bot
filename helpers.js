const discord = require('discord.js');
const opsgenie = require('opsgenie-sdk');
const fetch = require('node-fetch');
const config = require('./config');

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
    embed.setTitle(`#${data.alert.tinyId}: ${data.alert.message}`);

    if (data.alert.description !== "") embed.addField("Description", data.alert.description);
    if (data.alert.source) embed.addField("Source", data.alert.source);
    if (data.alert.priority) embed.addField("Priority", data.alert.priority);
    if (data.alert.responders) {
        let responders = "";
        data.alert.responders.forEach((responder) =>  responders += `${responder.name} (${responder.type})\n`);
        embed.addField("Assigned Responders", responders);
    }
    if (data.alert.alertId) embed.setFooter(data.alert.alertId);

    const message = await channel.send(embed);
    return message;
}

async function closeOpsgenieAlert(id, username) {
    const identifier = {
        identifier: id,
        identifierType: 'id'
    };

    const data = {
        "note": `Closed by Discord user "${username}"`,
        "source": "discord-opsgenie-bot"
    };

    try {
        opsgenie.alertV2.close(identifier, data, (error, result) => {
            if (error) throw error;
        });
    } catch (e) {
        throw e;
    }
}

async function ackOpsgenieAlert(id, username) {
    const identifier = {
        identifier: id,
        identifierType: 'id'
    };

    const data = {
        "note": `Ack'd by Discord user "${username}"`,
        "source": "discord-opsgenie-bot"
    };

    try {
        opsgenie.alertV2.acknowledge(identifier, data, (error, result) => {
            if (error) throw error;
        });
    } catch (e) {
        throw e;
    }
}

async function changePriorityOpsgenieAlert(id, priority, username) {
    fetch(`https://api.opsgenie.com/v2/alerts/${id}/priority`, {
        "method": "PUT",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": `GenieKey ${config.opsgenie.api_key}`
        },
        "body": JSON.stringify({
            "priority": `${priority}`,
            "note": `Priority changed to ${priority} by Discord user "${username}"`
        })
    });
}

async function getRelatedMessages(channel, id) {
    var messages = await channel.messages.fetch();
    return messages.filter((msg) => msg.embeds[0].footer.text === id)
}

module.exports = {
    createEmbed,
    sendOpsgenieEmbed,
    closeOpsgenieAlert,
    ackOpsgenieAlert,
    changePriorityOpsgenieAlert,
    getRelatedMessages
}