const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // check to ensure properties are defined in export
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON()); // !!
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

// idk what this notation is... i think it's making an unnamed async function, then calling it
(async () => {
    try {
        console.log(`Refreshing ${commands.length} slash commands.`);
        console.log(`App ID: ${process.env.APP_ID} - Guild ID: ${process.env.GUILD_ID}`);
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`Reloaded ${data.length} commands!`);
    } catch (error) {
        console.error(error);
    }
})();