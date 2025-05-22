const { ContextMenuCommandBuilder, ApplicationCommandType, ModalBuilder,
    ActionRowBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder,
    MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('npcreply')
        .setDescription('Reply as an NPC that you created')
        .addStringOption(option =>
            option.setName('npcname')
                .setDescription('Enter the name of the NPC you want to reply as')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Enter the message you want to reply')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('messagelink')
                .setDescription('Paste the id of a message here to reply it')
                .setRequired(false)),
    async execute(interaction) {

        await interaction.reply({ content: 'Sending...', flags: MessageFlags.Ephemeral });

        const channel = interaction.channel;
        const messageId = interaction.options.getString('messagelink');
        const message = await channel.messages.fetch(messageId)
            .catch(console.error);

        // why are we not replying to the message?
        await message.reply(`${interaction.options.getString('npcname')}: ${interaction.options.getString('message')}`)
        .catch(console.error);
        await interaction.editReply({ content: 'Sent!', flags: MessageFlags.Ephemeral });
    },
};

const contextCommand = new ContextMenuCommandBuilder()
        .setName('npcReply')
        .setType(ApplicationCommandType.Message);
        // .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        // .setContexts(0) // 0 = guild, 1 = dm bot, 2 = private channel
        // .setIntegrationTypes(0), // 0 = guild, 1 = user

const contextExecute = async (interaction) => {

        if (!interaction.isContextMenuCommand()) return;

        const messageId = interaction.targetMessage.id;
        let messageContent;

        const idFilter = (i) => i.customId === `npcReplyModal-${messageId}`;

        const npcReplyModal = new ModalBuilder()
            .setCustomId(`npcReplyModal-${messageId}`)
            .setTitle('NPC Reply')
            .addComponents(
                new ActionRowBuilder()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('npcName')
                            .setLabel('NPC Name')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true),
                    ),
                new ActionRowBuilder()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('npcImage')
                            .setLabel('NPC Image URL')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true),
                    ),
                new ActionRowBuilder()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('npcDescription')
                            .setLabel('NPC Description')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true),
                    ),
            );

        await interaction.showModal(npcReplyModal);
        await interaction.reply('NPC is composing a response...');
        await interaction.awaitModalSubmit(idFilter, { time: 15_000 })
            .then(interaction => {
                const npcName = modalInteraction.fields.getTextInputValue('npcName');
                const npcImage = modalInteraction.fields.getTextInputValue('npcImage');
                const npcDescription = modalInteraction.fields.getTextInputValue('npcDescription');


                interaction.channel.createWebhook({
                    name: npcName,
                    avatar: npcImage,
                })
                    .then(webhook => {
                        console.log(`Created webhook ${webhook.id} with name ${webhook.name}`);
                        webhook.send(`i'm alive!!! my id is ${webhook.id}`);
                    })
                    .catch(console.error);
            });
    };