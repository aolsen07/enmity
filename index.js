const fs = require('node:fs');      // file system
const path = require('node:path');  // ... path
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // .env file accessed with process.env

// new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection(); // extended map
client.cooldowns = new Collection();

// load commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // set item in collection with key name and module
        // check to ensure properties are defined in export
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// load event listener files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// login using token
client.login(process.env.BOT_TOKEN);