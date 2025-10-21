import { SlashCommandBuilder } from 'discord.js';

// i like this syntax
enum CHARACTER {
    CREATE,
    PROFILE,
    DELETE,
    IMPORT
}

module.exports = {
    // TODO
    data: new SlashCommandBuilder(),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === CHARACTER.CREATE) {

        }

        else if (subcommand === CHARACTER.DELETE) {

        }

        else if (subcommand === CHARACTER.IMPORT) {
            // TODO: get character from global scope
        }

        else if (subcommand === CHARACTER.PROFILE) {
            // TODO: codex profile options
            // subcommand subcommand options
            
            // view
            // edit
            // chapter add? 
            // alias
        }
    }
}