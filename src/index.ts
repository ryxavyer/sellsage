import {
  Client,
  GatewayIntentBits,
  Partials,
  Message,
  ChannelType,
} from "discord.js";
import {
  setCostBasis,
  addTarget,
  removeTarget,
  viewTargets,
  sendHelp,
  getCommandType,
  unlink,
} from "./commands";
import { Command } from "./types";
import dotenv from "dotenv";
import { getOrCreateUser } from "./database/utils";
import { startPriceWatcher } from "./cron/watcher";

const client = new Client({
  intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  startPriceWatcher();
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;
  if (message.channel.type != ChannelType.DM) return;
  const command = getCommandType(message.content);
  // make sure user is in db
  try {
    const user = getOrCreateUser(
      message.author.id,
      message.channel.id,
      message.author.username,
    );
    if (!user) {
      throw new Error("No user found.");
    }
  } catch (error) {
    console.error("No user found and failed to create:", error);
    message.channel.send(error || "No user found. Please try again.");
    return;
  }

  switch (command) {
    case Command.Unlink:
      await unlink(message.channel);
      break;
    case Command.SetBasis:
      await setCostBasis(message.content, message.channel);
      break;
    case Command.AddTarget:
      await addTarget(message.content, message.channel);
      break;
    case Command.RemoveTarget:
      await removeTarget(message.content, message.channel);
      break;
    case Command.ViewTargets:
      await viewTargets(message.content, message.channel);
      break;
    case Command.Help:
      await sendHelp(message.channel);
      break;
    default:
      message.channel.send(
        "Unknown command. Use `!help` for a list of available commands.",
      );
      break;
  }
});

dotenv.config();
client.login(process.env.DISCORD_BOT_TOKEN);
