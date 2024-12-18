import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

dotenv.config();
client.login(process.env.DISCORD_BOT_TOKEN);

export default client;
