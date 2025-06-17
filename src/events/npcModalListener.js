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
            const npcId = interaction.customId.split('_')[1];
            await editNPC(interaction, npcId)
                .then((npc) => interaction.reply({
                    content: `NPC Updated: ${npc.name} - ${npc.image ? npc.image : 'No image.'} - ${npc.description ? npc.description : 'No description.'}`,
                    flags: MessageFlags.Ephemeral,
                }))
                .catch(error => {
                    console.error('Failed to edit NPC:', error);
                    interaction.reply({
                        content: 'Failed to edit the NPC. Please try again.',
                        flags: MessageFlags.Ephemeral,
                    });
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

/**
 * Edit an existing NPC based on the interaction input
 * @param {ModalSubmitInteraction} interaction - Contains Guild ID and modal reply values
 * @param {string} npcId - The ID of the NPC to edit
 * @returns {*} The updated NPC object
 */
async function editNPC(interaction, npcId) {
    const serverId = interaction.guildId;
    const server = await Server.findOne({ serverId });

    if (!server) {
        throw new Error('Server not found');
    }

    const npcToEdit = server.npcs.find(npc => npc.id === npcId);
    if (!npcToEdit) {
        throw new Error('NPC not found');
    }

    // Update the NPC fields
    npcToEdit.name = interaction.fields.getTextInputValue('npcName');
    npcToEdit.image = interaction.fields.getTextInputValue('npcImage');
    npcToEdit.description = interaction.fields.getTextInputValue('npcDescription');
    npcToEdit.updatedBy = interaction.user.id;
    npcToEdit.updatedAt = new Date();

    await server.save();
    return npcToEdit;
}