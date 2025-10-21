import { ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from 'discord.js'

// le epic ts shorthand
enum Compose {
    QUEST = 'quest',
    MESSAGE = 'message'
}

module.exports = {
    // TODO
    data: new SlashCommandBuilder(),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'quest') {
            // TODO 
        }

        else if (subcommand === 'message') {
            // TODO
        }
    }
}