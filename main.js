const Discord = require('discord.js');

// need intents to create a client
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const prefix = '!'; // right meow, all messages starting with ! will be read.

const fs = require('fs');

client.commands = new Discord.Collection();

/**
 * This acts as an advanced command handler, as each command can be written in an independent file
 * that doesn't need to be edited in this file directly.
 */
const commandFiles  = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles){
    // require each command to have a file
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () =>  {
    console.log('PaqBot is ready to spread misinformation!');
})

client.on('messageCreate', message =>{
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // cutout extra whitespace
    console.log("Read command: %s", message.content);
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        client.commands.get('ping').execute(message, args);
    }
});

// this must be the last line
client.login('OTcxMjc1NzI2MDY4Mjg1NDUw.G52xzr.a50X3iHx3g7wmgrOx9bQTcmo8qyxaUf3JpaZyI');
