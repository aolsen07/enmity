const { Collection } = require('@discordjs/collection');
const { Events } = require('discord.js');

// processes and executes Chat Input Commands
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		// check if this is a found command for the system
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		// cooldown check for the command
		const { cooldowns } = interaction.client;

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDur = 5;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDur) * 1_000;

		if (timestamps.has(interaction.user.id)) {
			console.warn('[WARN]: Cooldown triggered');

			const expireTime = timestamps.get(interaction.user.id) + cooldownAmount;
			if (now < expireTime) {
				const expiredTimestamp = Math.round(expireTime / 1_000);
				return interaction.reply({ content: `Please wait, you are still on cooldown until \`${expiredTimestamp}\``});
			}
			return interaction.reply('Still on cooldown!');
		}

		timestamps.set(interaction.user.id, now);	// set user id, remove after cooldown
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	},
};