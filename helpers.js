const discord = require('discord.js');
const opsgenie = require('opsgenie-sdk');
const config = require('./config');
const { response } = require('express');

opsgenie.configure({
    "api_key": config.opsgenie.api_key
});

async function sendOpsgenieEmbed(data, channel) {
    if (data.action !== "Create") return;

    const embed = new discord.MessageEmbed();
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
    if (data.alert.recipients.length > 0) {
        let recipients = "";
        data.alert.recipients.forEach((recipient) => {
            recipients += `${recipient}\n`;
        });
        embed.addField("Assigned Recipients", recipients);
    }
    if (data.alert.alertId && data.alert.tinyId) embed.setFooter(`${data.alert.alertId}${tinyId}`);

    const message = await channel.send(embed);
    return message;
}

async function closeOpsgenieAlert(id) {
    const identifier = {
        identifier: id,
        identifierType: 'id'
    };

    const closeData = {
        "note": "Closed by discord-opsgenie-bot",
        "source": "discord-opsgenie-bot"
    };

    opsgenie.alertV2.close(identifier, closeData, (error, result) => {
        if (error) throw error;
        console.log(response);
        return response;
    });
}

module.exports = {
    sendOpsgenieEmbed,
    closeOpsgenieAlert
}