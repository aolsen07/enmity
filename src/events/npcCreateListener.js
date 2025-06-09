const { Events, MessageFlags } = require('discord.js');

// processes and executes the NPC creation modal
module.exports = {
    trigger: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'createNpcModal') {
            const npcName = interaction.fields.getTextInputValue('npcName');
            const npcImage = interaction.fields.getTextInputValue('npcImage');
            const npcDescription = interaction.fields.getTextInputValue('npcDescription');

            await interaction.reply({ content: `NPC Created: ${npcName} - ${npcImage} - ${npcDescription}`, flags: MessageFlags.Ephemeral });

            interaction.channel.createWebhook({
                name: npcName,
                avatar: npcImage,
                reason: `Created by ${interaction.user.tag}`,
            })
                .then(webhook => {
                    console.log(`Created webhook ${webhook.id} with name ${webhook.name}`);
                    webhook.send(`i'm alive!!! my id is ${webhook.id}`);
                })
                .catch(console.error);
        }
        else if (interaction.customId.startsWith('npcEdit')) {
            await interaction.reply({
                content: 'Received Edit',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
