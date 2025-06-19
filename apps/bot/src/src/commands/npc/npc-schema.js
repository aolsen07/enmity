const mongoose = require('mongoose');
const { Schema } = mongoose;
module.exports.ignore = true;

const npcSchema = new Schema({
    name: { type: String, required: true },
    image: String,
    description: String,
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const serverSchema = new Schema({
    serverId: { type: String, required: true }, // Unique identifier for each server
    npcs: [npcSchema],
    // add more things here

    joinedAt: { type: Date, default: Date.now },
});

const NPC = mongoose.model('NPC', npcSchema);
const Server = mongoose.model('Server', serverSchema);

module.exports = { NPC, Server, npcSchema, serverSchema };
