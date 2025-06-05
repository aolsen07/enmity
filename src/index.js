const { chalk } = require('chalk');
console.log(chalk.blue('Initializing AyyyyyyBot...'));

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // .env file accessed with process.env


// new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
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
console.log(chalk.green('Client initialized.\n'));

const mongoose = require('mongoose');
try {
    mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.green('Database connected.'));
}
catch (err) {
    console.error('Error connecting to MongoDB:', err);
}

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
            console.log(chalk.yellow('[WARNING]'), `The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// should files be labeled as command- and event-?
// load event listener files
console.log('Tuning into event listeners...');
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

console.log(chalk.green('Done.\n'));
// login using token
client.login(process.env.BOT_TOKEN);