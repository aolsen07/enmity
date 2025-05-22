const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const rest = new REST().setToken(process.env.BOT_TOKEN);

rest.get(Routes.applicationCommands(process.env.CLIENT_ID))
    .then((data) => {
        console.log('data:', data);
    });