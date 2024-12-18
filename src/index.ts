import { ChannelType, Interaction } from "discord.js";
import {
    setCostBasis,
    addTarget,
    removeTarget,
    viewTargets,
    sendHelp,
    unlink,
} from "./commands";
import client from "./client";
import { Command } from "./commands/types";
import { getOrCreateUser } from "./database/utils";
import { startPriceWatcher } from "./cron/watcher";

client.once("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    startPriceWatcher();
});

client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.channel?.type != ChannelType.DM) {
        interaction.reply("SellSage can only be used in a DM.");
        return;
    }
    // make sure user is in db
    try {
        const user = getOrCreateUser(
            interaction.user.id,
            interaction.channel.id,
            interaction.user.username,
        );
        if (!user) {
            throw new Error("No user found.");
        }
    } catch (error) {
        console.error("No user found and failed to create:", error);
        interaction.channel.send(error || "No user found. Please try again.");
        return;
    }

    const command = interaction.commandName as Command;
    switch (command) {
        case Command.Unlink:
            await unlink(interaction);
            break;
        case Command.SetBasis:
            await setCostBasis(interaction);
            break;
        case Command.AddTarget:
            await addTarget(interaction);
            break;
        case Command.RemoveTarget:
            await removeTarget(interaction);
            break;
        case Command.ViewTargets:
            await viewTargets(interaction);
            break;
        case Command.Help:
            await sendHelp(interaction);
            break;
        default:
            interaction.channel.send(
                "Unknown command. Use `/help` for a list of available commands.",
            );
            break;
    }
});
