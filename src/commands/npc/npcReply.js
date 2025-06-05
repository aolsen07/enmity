const { SlashCommandBuilder, MessageFlags, ContainerBuilder, ComponentType, TextDisplayBuilder } = require('discord.js');

module.exports = {
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

        const client = interaction.client;
        const npcId = interaction.options.getString('npcname');
        const messageId = interaction.options.getString('messagelink');
        const base_channel = interaction.channel;

        // validate inputs
        let webhook;
        try {

            // Fetch the webhooks for the channel
            webhook = await client.fetchWebhook(npcId);
            // Find the webhook with the matching name

            if (!webhook) {
                console.error(`No webhook found for NPC: ${npcId}`);
                await interaction.reply({ content: `No webhook found for NPC: ${npcId}`, flags: MessageFlags.Ephemeral });
                return;
            }
        }
        catch (err) {
            console.error('Error fetching webhook:', err);
            await interaction.reply({ content: 'Error fetching webhooks. Please try again later.', flags: MessageFlags.Ephemeral });
            return;
        }

        let targetMessage;
        if (messageId) {
            try {
                // Fetch the message to reply to
                targetMessage = await base_channel.messages.fetch(messageId);
            }
            catch (err) {
                console.error('Error fetching message:', err);
                await interaction.reply({ content: 'Could not find the message to reply to. Please check the message ID.', flags: MessageFlags.Ephemeral });
                return;
            }
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

        console.log(`Validated inputs: Webhook ID: ${npcId}, Message ID: ${messageId}, DM Channel: ${dmChannel.id}`);

        // create a container builder
        const messages = [];
        const container = new ContainerBuilder({
            components: [
                {
                    content: '-# Type messages in this channel to add to the reply',
                    type: ComponentType.TextDisplay,
                },
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.Button,
                            custom_id: 'finish',
                            label: 'Finish',
                            style: 1, // Primary style
                        },
                        {
                            type: ComponentType.Button,
                            custom_id: 'cancel',
                            label: 'Cancel',
                            style: 2, // Secondary style
                        },
                    ],
                },
            ],
        });

        // send the initial container
        const containerMsg = await dmChannel.send({ components: [container], flags: MessageFlags.IsComponentsV2 })
            .catch(err => {
                console.error('Error sending container message:', err);
                return;
            });

        // send a message in the original channel to notify the user
        await interaction.reply({ content: `Check your DMs to reply as ${webhook.name}!`, flags: MessageFlags.Ephemeral });

        // set up collectors for messages and button interactions
        // const messageFilter = m => !m.content.startsWith('cancel') || !m.content.startsWith('finish');
        const messageCollector = dmChannel.createMessageCollector({
            // filter: messageFilter,
            idle: 120_000, // 2 minute idle time
            time: 300_000, // 5 minutes total time
        });

        const buttonCollector = containerMsg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            idle: 120_000, // 2 minute idle time
            time: 300_000, // 5 minutes total time
        });

        messageCollector.on('collect', async (message) => {
            let newComponent = {
                content: `${message.content}`,
                type: ComponentType.TextDisplay,
            };
            messages.push(message.content);

            container.spliceComponents(
                container.components.length - 1,
                {
                    content: `${message.content}`,
                    type: ComponentType.TextDisplay,
                },
            );

            await containerMsg.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });

            console.log(`Collected message: ${message.content}`);
        });

        /*
        messageCollector.on('dispose', (message) => {
            if (message.content.toLowerCase().startsWith('cancel') || message.content.toLowerCase().startsWith('finish')) {
                messageCollector.stop('cancelled');
                console.log('Message collection cancelled by user.');
                return;
            }
            console.error('Message was disposed');
            return;
        });
        */

        messageCollector.on('end', async (collected) => {
            await dmChannel.send(`Message collection ended. Collected ${collected.size} messages`);
        });

        // at some point, this will need additional confirmation
        buttonCollector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === 'finish') {
                // send the reply using the webhook
                try {
                    await webhook.send({
                        content: messages.join('\n'),
                        allowedMentions: { parse: [] }, // prevent mentions
                        flags: MessageFlags.SuppressEmbeds,
                    });
                    messageCollector.stop('finished');
                    await buttonInteraction.reply({ content: 'Reply sent successfully!' });
                }
                catch (err) {
                    console.error('Error sending webhook message:', err);
                    await buttonInteraction.reply({ content: 'Failed to send reply.', flags: MessageFlags.Ephemeral });
                }
            }
            else if (buttonInteraction.customId === 'cancel') {
                await buttonInteraction.reply({ content: 'Reply cancelled.' });
                messageCollector.stop('cancelled');
            }
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
