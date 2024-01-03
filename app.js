import 'dotenv/config';
import express from 'express';
import {

} from 'discord-interactions';

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/interactions', async function (req, res) {
    
    const { type, id, data } = req.body;

    // verification requests
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponceType.PONG });
    }

    // slash command handling
    // see: https://discord.com/developers/docs/interactions/application-commands#slash-commands
})

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});