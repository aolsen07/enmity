const { SlashCommandBuilder } = require('discord.js');

// If you need to access your client instance from inside a 
// command file, you can access it via interaction.client. 
// If you need to access external files, packages, etc., 
// you should require() them at the top of the file.

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite the bot to another server'),
    async execute(interaction) {
        await interaction.reply('https://discord.com/oauth2/authorize?client_id=971275726068285450&permissions=8&scope=bot', { ephemeral: true });
    },
};