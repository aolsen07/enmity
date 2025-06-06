const { Events } = require('discord.js');
const chalk = require('chalk');
module.exports = {
	trigger: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(chalk.green(`Ready! Logged in as ${client.user.tag}`));
	},
};