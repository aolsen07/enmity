const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const privateCommands = [];

const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);
const rest = new REST().setToken(process.env.BOT_TOKEN);

// load commands
console.log('Loading commands...\n');
console.log('commands/');
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    console.log(`|─ ${folder}/`);

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // check to ensure properties are defined in export
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON()); // !!
            console.log(`|\t|─ ${file}`);
        }
        else {
            console.log(`|\t|─ !! ${file}!! missing "data" or "execute" property`);
        }
    }

    // check if the private folder exists
    const privatePath = path.join(commandsPath, 'private');
    if (fs.existsSync(privatePath)) {
        const privateFiles = fs.readdirSync(privatePath).filter(file => file.endsWith('.js'));
        for (const file of privateFiles) {
            const filePath = path.join(privatePath, file);
            const command = require(filePath);

            // check to ensure properties are defined in export
            if ('data' in command && 'execute' in command) {
                privateCommands.push(command.data.toJSON()); // !!
                console.log(`|\t|─ ${file} (private)`);
            }
            else {
                console.log(`|\t|─ ${file} (private & missing "data" or "execute" property)`);
            }
        }
    }
}


// idk what this notation is... i think it's making an unnamed async function, then calling it

// deploy guild commands to the server's API
(async () => {
    try {
        console.log(`\nRefreshing ${commands.length} global slash commands...\n`);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        )
        .then((data) => {
            console.log(`SUCCESS - Reloaded ${data.length} commands!`);
            data.forEach(command => {
                console.log(`\t${command.name} - ${command.description}`);
            });
        });

        console.log(`\nRefreshing ${privateCommands.length} private slash commands...\n`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID),
            { body: privateCommands },
        )
        .then((privateData) =>
            console.log(`SUCCESS - Reloaded ${privateData.length} private commands!`),
        )
        .catch(err => {
            console.log('An error occurred!!!', err);
        });

    }
    catch (error) {
        console.log('An error occurred');
        console.error(error);
    }
})();