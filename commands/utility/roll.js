const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Replies with a roll!')
        .addSubcommand(subcommand =>
            subcommand
            .setName('range')
            .setDescription('Ranged!')
            .addNumberOption(option => option.setName('upper').setDescription('Upper range (Default 100)').setMaxValue(1000000000))
            .addNumberOption(option => option.setName('lower').setDescription('Lower range (default 1').setMinValue(0)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('coinflip')
            .setDescription('Flips a coin and gets heads or tails'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('dice')
            .setDescription('Rolls six sided dice (one by default)!')
            .addNumberOption(option => option.setName('count').setDescription('Number of dice to roll!').setMaxValue(5))),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'coinflip') {
            const side = (Math.random() < 0.5) ? "Heads" : "Tails";
            await interaction.reply(`The coin landed on \`${side}\`!`);
        }
        else if (interaction.options.getSubcommand() === 'dice') {
            const count = interaction.options.getInt('count') ?? 1;
            let reply = `You cast \`${count}\` dice.`

            for (let i = 0; i < count; i++) {
                const side = Math.ceil(Math.random() * 6);
                reply += `\nDice ${i + 1}: \`${side}\``
            }

            await interaction.reply(reply);
        } else if (interaction.options.getSubcommand() === 'range') {
            const lower = interaction.options.getInt('lower') - 1 ?? 0;
            const upper = interaction.options.getInt('upper') ?? 100;
            const range = upper - lower;

            await interaction.reply(`Landed on \`${Math.ceil(Math.random() * range) + lower}\``);
        }
    }

}
