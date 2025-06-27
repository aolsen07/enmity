const { REST, Routes } = require('discord.js');
require('dotenv').config();
const rest = new REST().setToken(process.env.BOT_TOKEN);
const chalk = require('chalk');

console.log('Fetching commands from Discord record...\n');
rest.get(Routes.applicationCommands(process.env.CLIENT_ID))
    .then((data) => {
        processCommands(data);
    })
    .catch((error) => {
        console.error(chalk.red('Error fetching commands:'), error);
    });

// see https://discord.com/developers/docs/interactions/application-commands#application-command-object
function processCommands(data) {
    for (const command of data) {
        console.log(chalk.blue(`\n${command.name} -- ${matchCommandType(command.type)}`));
        console.log(`Description: ${command.description}`);
        console.log(`ID: ${command.id}`);

        if (command.options) {
            console.log('Options:');
            for (const option of command.options) {
                console.log(`  - ${option.name} (${option.type})`);
                if (option.description) {
                    console.log(`    Description: ${option.description}`);
                }
                console.log(`    Required: ${option.required ? chalk.green('Yes') : chalk.red('No')}`);
                console.log(`    Autocompletes: ${option.autocomplete ? chalk.green('Yes') : chalk.red('No')}`);
            }
        }

        if (command.contexts) console.log(`Context: ${(command.contexts)}\n`);
    }

    return;
}

// matches the command type to a string
function matchCommandType(type) {
    if (type === 1) {
        return 'CHAT_INPUT';
    }
    else if (type === 2) {
        return 'USER';
    }
    else if (type === 3) {
        return 'MESSAGE';
    }
    else if (type === 4) {
        return 'ENTRY_POINT';
    }
}

// matches the context type to a string
// not actually sure what this is for
function matchContextType(context) {
    if (context === 0) {
        return 'GUILD';
    }
    else if (context === 1) {
        return 'DM';
    }
    else if (context === 2) {
        return 'GROUP_DM';
    }
}