/**
 * @file npc.js
 * @description This file contains the main command handler for NPC-related commands.
 * It includes the command registration and execution logic for creating, editing, and deleting NPCs.
 */

const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags, CommandInteraction } = require('discord.js');


module.exports = {
    cooldown: 5,
    data:
    new SlashCommandBuilder()
        .setName('npc')
        .setDescription('Manage NPCs in your server')
        // Create
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Launch a modal to create a new NPC'),
        )
        // Edit
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit an existing NPC\'s name and image')
                .addStringOption(option =>
                    option.setName('npcname')
                        .setDescription('The name of the NPC you want to edit')
                        .setRequired(true)
                        .setAutocomplete(true),
                    ),
        )
        // Delete
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an existing NPC')
                .addStringOption(option =>
                    option.setName('npcname')
                        .setDescription('The ID of the NPC to delete')
                        .setRequired(true)
                        .setAutocomplete(true),
                    ),
        )
        // Reply
        .addSubcommand(subcommand =>
            subcommand
                .setName('reply')
                .setDescription('Send a reply as an NPC in this channel')
                .addStringOption(option =>
                    option.setName('npcname')
                        .setDescription('Enter the name of the NPC you want to reply as')
                        .setRequired(true)
                        .setAutocomplete(true)),
        ),

        // // View
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('view')
        //         .setDescription('View an NPC\'s details')
        //         .addStringOption(option =>
        //             option.setName('npc_id')
        //                 .setDescription('The ID of the NPC to view')
        //                 .setRequired(true)
        //                 .setAutocomplete(true),
        //             ),
        // ),

    /**
     * Handle a general NPC command interaction, and branch it off into subcommands
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // switch on the subcommand
        if (subcommand === 'reply') {
            // Handle the reply subcommand
            await npcReply(interaction)
                .catch(err => {
                    console.error('Couldn\'t reply,', err.message);
                });
        }
        else if (subcommand === 'create') {
            // Handle the create subcommand
            const modal = await buildNPCModal();
            await interaction.showModal(modal)
                .catch(err =>
                    console.error('Couldn\'t launch creation modal,', err.message),
                );
        }
        else if (subcommand === 'edit') {
            const npcId = interaction.options.getString('npcname');
            await interaction.client.fetchWebhook(npcId)
                .then(webhook => buildNPCModal(webhook))
                .then(modal => interaction.showModal(modal))
                .catch(err => interaction.reply(`Couldn't launch edit modal, ${err.message}`));
        }
        else if (subcommand === 'delete') {
            // Handle the delete subcommand
            const serverId = interaction.guildId;
            const server = await Server.findOne({ serverId });
            if (!server) {
                return interaction.reply({ content: 'No NPCs have been created in your server.', flags: MessageFlags.Ephemeral });
            }

            const npcId = interaction.options.getString('npcname');
            const npcToDelete = server.npcs.find(npc => npc.id === npcId);

            if (!npcToDelete) {
                return interaction.reply({ content: 'Could not find that NPC in your server.', flags: MessageFlags.Ephemeral });
            }

            const npcName = npcToDelete.name;
            server.npcs = server.npcs.filter(npc => npc.id !== npcId);
            await server.save();
            await interaction.reply({ content: `Successfully deleted NPC: ${npcName}`, flags: MessageFlags.Ephemeral });
        }
    },
    async autocomplete(interaction) {
        const serverId = interaction.guildId;
        // get webhooks from channel interaction
        await Server.findOne({ serverId })
        .then(server => {
            const focusedValue = interaction.options.getFocused();

            // webhooks is a collection of snowflake -> webhook
            const filtered = server.npcs.filter(npc => npc.name.toLowerCase().startsWith(focusedValue.toLowerCase()));
            interaction.respond(
                filtered.map(webhook => ({ name: webhook.name, value: webhook.id })),
            );
        });
    },
};

/**
 * @function buildNPCModal
 * @description Builds a modal for creating or editing an NPC.
 * @param {Webhook|null} NPCWebhook - The webhook to use for populating modal fields, or null if empty.
 * @returns {Promise<void>}
*/
async function buildNPCModal(NPCWebhook = null) {

    const modal = new ModalBuilder()
                .setTitle(NPCWebhook ? 'Edit an NPC' : 'Create a new NPC')
                .setCustomId(NPCWebhook ? `npcEdit_${NPCWebhook.id}` : 'createNpcModal');

    const nameInput = new TextInputBuilder()
        .setCustomId('npcName')
        .setLabel('Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(NPCWebhook ? NPCWebhook.name : '');

    const imageInput = new TextInputBuilder()
        .setCustomId('npcImage')
        .setLabel('Image URL')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder(NPCWebhook ? NPCWebhook.avatarURL({ forceStatic: true }) : '');

    const descriptionInput = new TextInputBuilder()
        .setCustomId('npcDescription')
        .setLabel('NPC Description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const row1 = new ActionRowBuilder().addComponents(nameInput);
    const row2 = new ActionRowBuilder().addComponents(imageInput);
    const row3 = new ActionRowBuilder().addComponents(descriptionInput);

    if (NPCWebhook) {
        imageInput.setValue(NPCWebhook.avatar || '');
    }

    modal.addComponents(row1, row2, row3);
    return modal;
}

// === NPC Reply Functionality ===

// consts for end states
const CANCEL_PRESSED = 'cancelled';
const FINISH_PRESSED = 'finished';

// access globally
const messages = [];
let messageCollector;
let buttonCollector;

const { ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { Server } = require('./npc-schema');

async function npcReply(interaction) {
    const npcId = interaction.options.getString('npcname');

    // Fetch the NPC from the database
    const serverId = interaction.guildId;
    const server = await Server.findOne({ serverId });

    if (!server) {
        await interaction.reply({
            content: 'No NPCs have been created in your server.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const npcData = server.npcs.find(n => n.id === npcId);
    if (!npcData) {
        await interaction.reply({
            content: `Could not find NPC with ID \`${npcId}\`. Please use the autocomplete to select a valid NPC.`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    // Get or create webhook for this channel
    const channel = interaction.channel;
    const webhook = await findOrCreateNPCWebhook(channel);
    if (!webhook) {
        await interaction.reply({
            content: 'Failed to create webhook. Please make sure I have the "Manage Webhooks" permission.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    // Try to DM the user
    const dmChannel = await interaction.user.createDM()
        .catch(err => {
            interaction.reply({
                content: 'Could not send you a DM! Please check your server privacy settings to allow Direct Messages.',
                flags: MessageFlags.Ephemeral,
            });
            throw new Error(`Could not create DM channel: ${err.message}`);
        });

    const [container, finishButton, cancelButton] = buildReplyMessageContainer(npcData.name);

    // send the initial container
    const containerMsg = await dmChannel.send({ components: [container], flags: MessageFlags.IsComponentsV2 })
        .catch(err => {
            console.error('Error sending container message:', err);
            return;
        });

    // send a message in the original channel to notify the user
    await interaction.reply({
        content: `Check your DMs to reply as ${npcData.name}!`,
        flags: MessageFlags.Ephemeral,
    });

    // set up collectors for messages and button interactions
    const messageFilter = m => m.author.id === interaction.user.id; // this will block messages from the bot itself
    messageCollector = dmChannel.createMessageCollector({
        filter: messageFilter,
        idle: 120_000,
        time: 300_000,
    });

    buttonCollector = containerMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        idle: 180_000,
        time: 300_000,
    });

    // add listeners for the collectors
    messageCollector.on('collect', async (message) => {
        await addMessageToContainer(message, container, containerMsg);
    });

    buttonCollector.on('collect', async (buttonInteraction) => {
        await handleNPCReplyInteraction(buttonInteraction, npcData, webhook);
    });

    // notify the user that the collection has ended
    messageCollector.on('end', async (collected, reason) => {
        await handleMessageCollectorClose(collected, reason, dmChannel);
    });

    // visually update the buttons when the collector ends
    buttonCollector.on('end', async (collected, reason) => {
        console.log(`Button collector ended for reason: ${reason}`);
        finishButton.setDisabled(true);
        cancelButton.setDisabled(true);
        await containerMsg.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
    });
}

/**
 * Add a message to the reply container
 * @param {Message} message - The message to add
 * @param {ContainerBuilder} container - The container to add the message to
 * @param {Message} containerMsg - The message containing the container
 */
async function addMessageToContainer(message, container, containerMsg) {
    console.log(`Collected message: ${message.content}`);
    const newComponent = {
        content: `${message.content}`,
        type: ComponentType.TextDisplay,
    };

    // insert in container and update the messages array
    container.spliceComponents(2 + messages.length, 0, newComponent);
    messages.push(message.content);

    await containerMsg.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

/**
 * Find existing NPC webhook or create a new one
 * @param {TextChannel} channel - The channel to find/create webhook in
 * @returns {Promise<Webhook|null>} The webhook or null if creation failed
 */
async function findOrCreateNPCWebhook(channel) {
    try {
        const webhooks = await channel.fetchWebhooks();
        const webhook = webhooks.find(wh => wh.name === 'NPC System');

        if (!webhook) {
            // Create a new webhook
            return await channel.createWebhook({
                name: 'NPC System',
                avatar: 'https://i.imgur.com/AfFp7pu.png', // Default Discord avatar or your bot's avatar
            });
        }

        return webhook;
    }
    catch (error) {
        console.error('Error managing webhook:', error);
        return null;
    }
}

/**
 * Handle button interactions for NPC replies
 * @param {ButtonInteraction} buttonInteraction - The button interaction
 * @param {*} npcData - The NPC object from the database
 * @param {Webhook} webhook - The webhook to send the message through
 */
async function handleNPCReplyInteraction(buttonInteraction, npcData, webhook) {
    if (buttonInteraction.customId === 'finish') {
        // send the reply as the NPC
        if (messages.length === 0) {
            await buttonInteraction.channel.send('You can\'t send an empty reply. Please type a message first.');
            return;
        }

        messages.push(`> -# Message sent by <@${buttonInteraction.user.id}>`);
        
        try {
            await webhook.send({
                content: messages.join('\n'),
                username: npcData.name,
                avatarURL: npcData.image,
                allowedMentions: { parse: [] },
            });
            await buttonInteraction.reply({ content: 'Reply sent successfully!' });
            messageCollector.stop(FINISH_PRESSED);
            buttonCollector.stop(FINISH_PRESSED);
        }
        catch (err) {
            console.error('Error sending webhook message:', err);
            await buttonInteraction.reply({
                content: 'An error occurred, failed to send reply.',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
    
    else if (buttonInteraction.customId === 'cancel') {
        await buttonInteraction.reply({ content: 'Reply cancelled.' });
        messageCollector.stop(CANCEL_PRESSED);
        buttonCollector.stop(CANCEL_PRESSED);
    }
}

/**
 * Contains the logic for notifying the user when the message collector shuts off. The output changes depending on whether any messages were collected.
 * @param {ReadonlyCollection<Snowflake, Message>} collected - A collection of messages from the user, given by the collector on the end event.
 * @param {DMChannel} dmChannel - The DM channel where the user is sending messages.
 * @param {MessageComponentCollector} buttonCollector - A reference to the container's button collector, so that it can be stopped if no messages were collected.
 * @returns {void} - This function does not return anything, but it sends a message to the user in the DM channel.
 */
async function handleMessageCollectorClose(collected, reason, dmChannel) {
    if (reason === FINISH_PRESSED || reason === CANCEL_PRESSED) {
        console.log(`Message collector ended for reason: ${reason}`);
    }
    else if (collected.size === 0) {
        await dmChannel.send('Didn\'t get your message, maybe next time.');
        buttonCollector.stop('no messages');
        return;
    }
    else {
        await dmChannel.send('I stopped paying attention, but I still have your messages. Use the container buttons to finish or cancel your reply.');
    }
}

/**
 * Validates the inputs for the NPC reply command before sending the container. If there is an error, it replies to the interaction with an error message in the channel the command was made in.
 * @async
 * @param {Interaction} interaction - the interaction object from discord.js
 * @param {Snowflake} npcId - the ID of the NPC webhook to reply as
 * @param {Snowflake} [messageId] - the ID of the message to reply to, if specified
 * @returns { [Webhook, Channel, Message] } Successful validation returns an object with the webhook, the dm's channel, and the message to reply to, if specified.
 */
// async function validateInputs(interaction, npcId, messageId) {

//     const client = interaction.client;
//     const base_channel = interaction.channel;
//     return [ webhook, dmChannel, targetMessage ];
// }

/**
 * Creates the container that the bot will use to show the user their collected output.
 * @param {String} name - The name of the NPC the message/reply will be sent as.
 * @param {import('discord.js').MessageReference} targetMessage - The message to target as a reply.
 * @returns {[ContainerBuilder, ButtonBuilder, ButtonBuilder]} - References to the builders used.
 */
function buildReplyMessageContainer(name, targetMessage) {
    const prompt = new TextDisplayBuilder()
        .setContent(
            targetMessage ? `## ${name} will reply...` : `## ${name} will send...`,
        );

    const instructions = new TextDisplayBuilder()
        .setContent('-# Type messages in this channel to add to the reply');

    const finishButton = new ButtonBuilder()
        .setCustomId('finish')
        .setLabel('Finish')
        .setStyle(1); // Primary style

    const cancelButton = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(2); // Secondary style

    const row = new ActionRowBuilder()
        .addComponents(finishButton, cancelButton);

    // create a container builder
    const container = new ContainerBuilder()
        .addTextDisplayComponents(prompt, instructions)
        .addActionRowComponents(row);

    return [container, finishButton, cancelButton];
}