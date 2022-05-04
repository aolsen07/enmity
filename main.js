const Discord = require('discord.js');

// need intents to create a client
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const prefix = '!';

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
        message.channel.send('pong!');
    }
});

// this must be the last line
client.login('OTcxMjc1NzI2MDY4Mjg1NDUw.G52xzr.a50X3iHx3g7wmgrOx9bQTcmo8qyxaUf3JpaZyI');
