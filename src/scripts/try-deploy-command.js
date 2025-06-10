const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const npcContextMenuReply = require('../commands/npc/npcReply');
require('dotenv').config();

const rest = new REST().setToken(process.env.BOT_TOKEN);

// load commands
console.log('Trying command...\n');


// deploy guild commands to the server's API
(async () => {
    try {
        console.log('\nRefreshing the slash command...\n');

        const data = await rest.post(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID),
            { body: npcContextMenuReply.data.toJSON() },
        );

        console.log(`SUCCESS - Reloaded command!`);

        /*
        console.log(`\nRefreshing ${privateCommands.length} private slash commands...\n`);
        const privateData = await rest.post(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID),
            { body: privateCommands },
        );

        console.log(`SUCCESS - Reloaded ${privateData.length} private commands!`);
        */
    }
    catch (error) {
        console.error(error.rawError.errors);
        console.error(error.message);

    }
})();