const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Presence } = require('discord.js');
require('dotenv').config(); // .env file accessed with process.env

// new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds], // only subscribe to guild events
    presence: {
        activities: [{
            name: 'League of Legends',
            type: 0,
        }],
        status: 'online',
    },
});

client.commands = new Collection(); // extended map
client.cooldowns = new Collection();

// load commands
console.log('Reviewing commands...\n');
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath, { recursive: true }).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // set item in collection with key name and module
        // check to ensure properties are defined in export
        if ('data' in command && 'execute' in command) {
            console.log(`Loading command ${command.data.name}`);
            client.commands.set(command.data.name, command);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// should files be labeled as command- and event-?
// load event listener files
console.log('Tuning into event listeners...\n');
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);

    // does the event only need to be trigger once?
	if (event.once) {
		client.once(event.trigger, (...args) => event.execute(...args));
	}
    else {
        // adds to an array of listeners for the specified event
		client.on(event.trigger, (...args) => event.execute(...args));
	}
}

// login using token
client.login(process.env.BOT_TOKEN);