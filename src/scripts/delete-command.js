const { REST, Routes } = require('discord.js');
require('dotenv').config();
// read in arg from command line
const commandId = process.argv[2]; // 0 is the script name, 1 is the command name
if (!commandId) {
    console.error('Please provide a command name to delete.');
    process.exit(1);
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, commandId))
    .then(() => {
        console.log('Successfully deleted command.');
    })
    .catch(console.error);
