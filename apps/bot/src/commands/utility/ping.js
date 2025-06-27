const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        const ping = interaction.client.ws.ping;
        const sent = await interaction.reply({ content: `Pong! WebSocket ping: \`${ping}ms\``, withResponse: true });
        interaction.editReply(`Pong! WebSocket ping: \`${ping}ms\`, This ping: \`${(sent.resource.message.createdTimestamp - interaction.createdTimestamp)}ms\``);
    },
};

/**
 * Interaction Callbacks give a reference to the message they created in the chat
 */