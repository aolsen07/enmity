const { Events, MessageFlags, ModalSubmitInteraction } = require('discord.js');
const { Server } = require('../commands/npc/npc-schema');

// processes and executes the NPC creation modal
module.exports = {
    trigger: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'createNpcModal') {

            await createNPC(interaction)
            .then((npc) => interaction.reply({ content: `NPC Created: ${npc.name} - ${npc.image ? npc.image : 'No image.'} - ${npc.description ? npc.description : 'No description.'}`, flags: MessageFlags.Ephemeral }));

        }
        else if (interaction.customId.startsWith('npcEdit')) {
            await interaction.reply({
                content: 'Received Edit. Too bad this doesn\'t do anything yet',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};

/**
 * Create an NPC based off the interaction input.
 * @param {ModalSubmitInteraction} interaction - Contains Guild ID and modal reply values
 * @returns {*} npc
 */
async function createNPC(interaction) {

    const serverId = interaction.guildId;
    let server = await Server.findOne({ serverId });
    if (!server) {
        server = new Server({
            serverId,
        });
    }

    const npc = {
        name: interaction.fields.getTextInputValue('npcName'),
        image: interaction.fields.getTextInputValue('npcImage'),
        description: interaction.fields.getTextInputValue('npcDescription'),
        createdBy: interaction.user.id,
    };

    server.npcs.push(npc);
    await server.save();
    return npc;
}