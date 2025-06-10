const { Events } = require('discord.js');

module.exports = {
    trigger: Events.InteractionCreate,
    async execute(interaction) {
        // Check if the interaction is a context menu command
        if (!interaction.isContextMenuCommand()) return;

        // Check if the command is registered
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // this does not have a cooldown yet

        try {
            console.log('Processing context menu command...');
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Oops, an error occurred while executing this command!', ephemeral: true });
            }
            else {
                await interaction.reply({ content: 'Uhhhh...what did you need? *(There was an error while executing this command)*', ephemeral: true });
            }
        }
    },
};