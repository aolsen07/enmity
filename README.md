# Enmity Lore Manager
> *Enmity noun - positive, active, and typically mutual hatred or ill will* (Merriam-Webster)

**Bring your TTRPG's universe into your Discord server, and make it your own. Write lore, backstories, and dialogue ~~that no one else will read.~~**

Not officially launched as a service, but this repo is free to adapt and deploy on your own bot if you see the use. 

## Key Features
- NPCs in your server, controlled by you or other game masters.

## Requirements
The code relies on an `.env` file with the following values:
- `MONGO_URI`: A MongoDB database URI. This can be locally hosted or on Atlas.
- `BOT_TOKEN`: A token for Discord's bot API, acquired from the Discord Development Portal.
- `CLIENT_ID`: The Client ID for your bot, also acquired from Discord.
- `TEST_GUILD_ID`: Used in some scripts, deploys commands to a specific server/guild. 

For your discord bot user, be sure to enable the `Message Content` privileged intent. The bot user should also be able to `Manage Webhooks` and `Send Messages`, to speak as characters and provide outputs. 

## Planned
- Track fanart, characters, and other media throughout your campaign's lore.
- Wiki-style profiles for characters and campaigns.
- Allow players to manage their own characters.
- Spam protections and settings for security and accountability.
