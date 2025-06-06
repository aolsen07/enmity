const mongoose = require('mongoose');
const { Schema } = mongoose;

const npcSchema = new Schema({
    name: String,
    id: String,
    image: String,
});

const serverSchema = new Schema({
    serverId: String,
    npcs: [npcSchema], // Array of NPCs for each server
});

const Npc = mongoose.model('NPC', npcSchema);

module.exports = Npc;
module.exports.npcSchema = npcSchema;