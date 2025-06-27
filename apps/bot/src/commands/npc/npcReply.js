const { SlashCommandBuilder, MessageFlags, ContainerBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, TextDisplayBuilder, Webhook } = require('discord.js');

const CANCEL_PRESSED = 'cancelled';
const FINISH_PRESSED = 'finished';

module.exports = {
    ignore: true,
    cooldown: 300,
    reason: 'Please finish your current reply before starting a new one.',
    data: new SlashCommandBuilder()
        .setName('npcreply')
        .setDescription('Reply as an NPC that you created')
        .addStringOption(option =>
            option.setName('npcname')
                .setDescription('Enter the name of the NPC you want to reply as')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('messagelink')
                .setDescription('Paste the id of a message here to reply to')
                .setRequired(false)),

    async execute(interaction) {

        const npcId = interaction.options.getString('npcname');
        const messageId = interaction.options.getString('messagelink');
        const base_channel = interaction.channel;

        const [webhook, dmChannel, targetMessage] = await validateInputs(interaction, npcId, messageId, base_channel);

        const messages = [];

        const prompt = new TextDisplayBuilder()
            .setContent(
                targetMessage ? `## ${webhook.name} will reply...` : `## ${webhook.name} will send...`,
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


        // send the initial container
        const containerMsg = await dmChannel.send({ components: [container], flags: MessageFlags.IsComponentsV2 })
            .catch(err => {
                console.error('Error sending container message:', err);
                return;
            });

        // send a message in the original channel to notify the user
        await interaction.reply({ content: `Check your DMs to reply as ${webhook.name}!`, flags: MessageFlags.Ephemeral });

        // set up collectors for messages and button interactions
        const messageFilter = m => m.author.id === interaction.user.id; // this will block messages from the bot itself
        const messageCollector = dmChannel.createMessageCollector({
            filter: messageFilter,
            idle: 120_000,
            time: 300_000,
        });

        const buttonCollector = containerMsg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            idle: 180_000,
            time: 300_000,
        });

        messageCollector.on('collect', async (message) => {
            pushNewMessage(message, messages, container, containerMsg);
        });

        buttonCollector.on('collect', async (buttonInteraction) => {
            await handleButtonInteraction(buttonInteraction, messages, webhook, messageCollector, messages);
        });

        // notify the user that the collection has ended
        messageCollector.on('end', async (collected, reason) => { await handleMessageCollectorClose(collected, reason, dmChannel, buttonCollector); });

        // visually update the buttons when the collector ends
        buttonCollector.on('end', async (collected, reason) => {
            console.log(`Button collector ended for reason: ${reason}`);
            finishButton.setDisabled(true);
            cancelButton.setDisabled(true);
            row.setComponents(finishButton, cancelButton);
            await containerMsg.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
        });

    },
    async autocomplete(interaction) {

        // note: the number of choices is limited to 25
        const focusedValue = await interaction.options.getFocused();
        // this returns a collection (extension of Map)
        const webhookMap = await interaction.channel.fetchWebhooks()
            .catch(err => {
                console.error('Error fetching webhooks:', err);
                return [];
            });

        // const filtered = npcNames.filter(choice => choice.startsWith(focusedValue));
        await interaction.respond(
            webhookMap.map(wh => ({ name: wh.name, value: wh.id })),
        );
    },
};

async function pushNewMessage(message, messages, container, containerMsg) {
    const newComponent = {
        content: `${message.content}`,
        type: ComponentType.TextDisplay,
    };

    // insert in container and update the messages array
    container.spliceComponents(2 + messages.length, 0, newComponent);
    messages.push(message.content);

    await containerMsg.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });

    console.log(`Collected message: ${message.content}`);
}

/**
 * 
 * @param {Interaction} buttonInteraction 
 * @param {String[]} messages
 * @param {Webhook} webhook 
 * @param {MessageCollector} messageCollector 
 * @param {MessageComponentCollector} buttonCollector 
 * @returns void
 */
async function handleButtonInteraction(buttonInteraction, messages, webhook, messageCollector, buttonCollector) {
    if (buttonInteraction.customId === 'finish') {
        // send the reply using the webhook
        if (messages.length === 0) {
            await buttonInteraction.channel.send('You can\'t send an empty reply. Please type a message first.');
            return;
        }

        try {
            await webhook.send({
                content: messages.join('\n'),
                allowedMentions: { parse: [] }, // prevent mentions
                flags: MessageFlags.SuppressEmbeds,
            });
            await buttonInteraction.reply({ content: 'Reply sent successfully!' });
            messageCollector.stop(FINISH_PRESSED);
            buttonCollector.stop(FINISH_PRESSED);
        }
        catch (err) {
            console.error('Error sending webhook message:', err);
            await buttonInteraction.reply({ content: 'An error occurred, failed to send reply.', flags: MessageFlags.Ephemeral });
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
 * @param {*} buttonCollector
 * @param {DMChannel} dmChannel - The DM channel where the user is sending messages.
 * @param {MessageComponentCollector} buttonCollector - A reference to the container's button collector, so that it can be stopped if no messages were collected.
 * @returns {void} - This function does not return anything, but it sends a message to the user in the DM channel.
 */
async function handleMessageCollectorClose(collected, buttonCollector, reason, dmChannel) {
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
 * @param {Interaction} interaction - the interaction object from discord.js
 * @param {Snowflake} npcId - the ID of the NPC webhook to reply as
 * @param {Snowflake} [messageId] - the ID of the message to reply to, if specified
 * @returns { [Webhook, Channel, Message] } Successful validation returns an object with the webhook, the dm's channel, and the message to reply to, if specified.
 */
async function validateInputs(interaction, npcId, messageId) {

    const client = interaction.client;
    const base_channel = interaction.channel;

    // validate inputs
    let webhook;
    try {

        // Fetch the webhooks for the channel
        webhook = await client.fetchWebhook(npcId);
        // Find the webhook with the matching name

        if (!webhook) {
            console.error(`No webhook found for NPC: ${npcId}`);
            await interaction.reply({ content: `No webhook found for with an ID of ${npcId}. Make sure the webhook still exists and use the autocomplete result.`, flags: MessageFlags.Ephemeral });
            return;
        }
    }
    catch (err) {
        console.error('Error fetching webhook:', err);
        await interaction.reply({ content: 'Error fetching webhooks. Please try again later.', flags: MessageFlags.Ephemeral });
        return;
    }

    // Try to DM the user
    let dmChannel;
    try {
        dmChannel = await interaction.user.createDM();
    }
    catch (err) {
        console.error('Could not create DM channel:', err);
        await interaction.reply({ content: 'Could not send you a DM! Please check your server privacy settings to allow Direct Messages.', flags: MessageFlags.Ephemeral });
        return;
    }

    // If a message ID is provided, fetch the message to reply to
    let targetMessage;
    if (messageId) {
        try {
            // Fetch the message to reply to
            targetMessage = await base_channel.messages.fetch(messageId);
        }
        catch (err) {
            console.error('Error fetching message:', err);
            await interaction.reply({ content: 'Could not find the message you want reply to. Please double check the message ID.', flags: MessageFlags.Ephemeral });
            return;
        }
    }

    return [ webhook, dmChannel, targetMessage ];
}