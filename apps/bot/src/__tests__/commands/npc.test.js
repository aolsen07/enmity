const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const { execute } = require('../../commands/npc/npc');
const { Server } = require('../../__mocks__/mongoose-mocks');

// Mock the entire npc-schema module
jest.mock('../../commands/npc/npc-schema', () => ({
    Server: require('../../__mocks__/mongoose-mocks').Server
}));


const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

// Mock the Discord.js classes and utilities
jest.mock('discord.js', () => ({
  SlashCommandBuilder: jest.fn().mockReturnValue({
    setName: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    addStringOption: jest.fn().mockReturnThis(),
    addSubcommand: jest.fn().mockReturnThis(),
  }),
  ModalBuilder: jest.fn().mockReturnValue({
    setCustomId: jest.fn().mockReturnThis(),
    setTitle: jest.fn().mockReturnThis(),
    addComponents: jest.fn().mockReturnThis(),
  }),
  TextInputBuilder: jest.fn().mockReturnValue({
    setCustomId: jest.fn().mockReturnThis(),
    setLabel: jest.fn().mockReturnThis(),
    setStyle: jest.fn().mockReturnThis(),
    setPlaceholder: jest.fn().mockReturnThis(),
    setRequired: jest.fn().mockReturnThis(),
    setValue: jest.fn().mockReturnThis(),
  }),
  TextInputStyle: {
    Short: 1,
    Paragraph: 2,
  },
  ActionRowBuilder: jest.fn().mockReturnValue({
    addComponents: jest.fn().mockReturnThis(),
  }),
  MessageFlags: {
    Ephemeral: 1 << 6,
  },
}));

describe('npc command', () => {
  let mockInteraction;
  let mockModal;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    Server.clearMocks();

    // Mock the modal
    mockModal = {
      setCustomId: jest.fn().mockReturnThis(),
      setTitle: jest.fn().mockReturnThis(),
      addComponents: jest.fn().mockReturnThis(),
    };

    // Mock the interaction
    mockInteraction = {
      options: {
        getSubcommand: jest.fn(),
        getString: jest.fn(),
      },
      user: {
        id: '111222333',
        username: 'CommandUser',
      },
      showModal: jest.fn().mockResolvedValue({}),
      reply: jest.fn().mockResolvedValue({}),
      editReply: jest.fn().mockResolvedValue({}),
      deferReply: jest.fn().mockResolvedValue({}),
    };
  });

  test('should show create modal when create subcommand is used', async () => {
    mockInteraction.options.getSubcommand.mockReturnValue('create');

    await execute(mockInteraction);

    expect(mockInteraction.showModal).toHaveBeenCalled();
  });

  // test('should handle edit subcommand', async () => {
  //   mockInteraction.options.getSubcommand.mockReturnValue('edit');
  //   mockInteraction.options.getString.mockReturnValue('test-npc');

  //   await execute(mockInteraction);

  //   expect(mockInteraction.showModal).toHaveBeenCalled();
  // });

  // test('should handle delete subcommand', async () => {
  //   mockInteraction.options.getSubcommand.mockReturnValue('delete');
  //   mockInteraction.options.getString.mockReturnValue('test-npc');

  //   await execute(mockInteraction);

  //   expect(mockInteraction.reply).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       ephemeral: true,
  //       components: expect.any(Array)
  //     })
  //   );
  // });

  // test('should handle list subcommand', async () => {
  //   mockInteraction.options.getSubcommand.mockReturnValue('list');

  //   await execute(mockInteraction);

  //   expect(mockInteraction.reply).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       ephemeral: true
  //     })
  //   );
  // });

  // test('should handle invalid subcommand', async () => {
  //   mockInteraction.options.getSubcommand.mockReturnValue('invalid');

  //   await execute(mockInteraction);

  //   expect(mockInteraction.reply).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       content: expect.stringContaining('Invalid subcommand'),
  //       ephemeral: true
  //     })
  //   );
  // });

  // Add more specific test cases for modal fields, validation, etc.
});
