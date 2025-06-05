// using modals and webhooks to create a new NPC for discord messaging
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('createnpc')
        .setDescription('Launches a modal to create a new NPC')
        .setDefaultMemberPermissions(PermissionsBitField.ManageWebhooks), // requires Manage Webhooks permission

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('createNpcModal')
            .setTitle('Create a new NPC');

        const nameInput = new TextInputBuilder()
            .setCustomId('npcName')
            .setLabel('NPC Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const imageInput = new TextInputBuilder()
            .setCustomId('npcImage')
            .setLabel('NPC Image URL')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('npcDescription')
            .setLabel('NPC Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const row1 = new ActionRowBuilder().addComponents(nameInput);
        const row2 = new ActionRowBuilder().addComponents(imageInput);
        const row3 = new ActionRowBuilder().addComponents(descriptionInput);

        modal.addComponents(row1, row2, row3);
        await interaction.showModal(modal);
    },
};