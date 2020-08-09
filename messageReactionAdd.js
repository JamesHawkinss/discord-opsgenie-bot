const helpers = require('./helpers');
const config = require('./config');

async function messageReactionAdd(reaction, user) {
    const client = reaction.client;
    if (reaction.message.author.id !== client.user.id) return;
    if (reaction.message.channel.id !== config.discord.channel) return;
    if (reaction.count <= 1) return;

    const alertId = reaction.message.embeds[0].footer.text;
    const emojiId = reaction.emoji.id;

    const p1 = config.emojis.priority.P1;
    const p2 = config.emojis.priority.P2;
    const p3 = config.emojis.priority.p3;
    const p4 = config.emojis.priority.P4;
    const p5 = config.emojis.priority.P5;

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
        reaction.remove();

        Object.keys(config.emojis.priority).forEach((key) => {
            if (key == "main") return;
            reaction.message.react(config.emojis.priority[key]);
        });
    } else if (emojiId == p1 || emojiId == p2 || emojiId == p3 || emojiId == p4 || emojiId == p5) {
        helpers.changePriorityOpsgenieAlert(alertId, reaction.emoji.name, user.username);
    }
}

module.exports = { messageReactionAdd }