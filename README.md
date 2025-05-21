# My Own Discord Son

## Main Features
- Tech Demo for slash commands, utilizing discord.js
  
## Still to develop
- Economy system with gambling, connection to either MongoDB or other database service
- Frontend web panel to tweak settings (may be seperate ecosystem)
  
Commands are built using the `SlashCommandBuilder` interface.

## Scripts
- `npm run-script commands delete <command-id>` 
  Provide a command ID for a slash command to remove it from Discord's API.

- `npm run-script commands deploy` 
  Run the `deploy-commands.js` script, which builds and adds all commands in the `commands` directory to the API. This should be done before running the bot. 

- `npm start`
  Runs the bot.