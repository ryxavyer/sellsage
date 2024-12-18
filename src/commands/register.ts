import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import { SUPPORTED_TICKERS } from "../constants";
import { Command } from "./types";
import dotenv from "dotenv";

const commands = [
    new SlashCommandBuilder()
        .setName(Command.SetBasis)
        .setDescription("Set your cost basis for a ticker")
        .addStringOption((option) =>
            option
                .setName("ticker")
                .setDescription(
                    "The cryptocurrency ticker (e.g., BTC, ETH, ADA)",
                )
                .setRequired(true)
                .addChoices(
                    Object.keys(SUPPORTED_TICKERS).map((t) => ({
                        name: t,
                        value: t,
                    })),
                ),
        )
        .addNumberOption((option) =>
            option
                .setName("dollars")
                .setDescription("The amount you invested")
                .setRequired(true),
        )
        .addNumberOption((option) =>
            option
                .setName("price")
                .setDescription("The average price per unit of your investment")
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName(Command.AddTarget)
        .setDescription("Add a sell target for a cryptocurrency")
        .addStringOption((option) =>
            option
                .setName("ticker")
                .setDescription(
                    "The cryptocurrency ticker (e.g., BTC, ETH, ADA)",
                )
                .setRequired(true)
                .addChoices(
                    Object.keys(SUPPORTED_TICKERS).map((t) => ({
                        name: t,
                        value: t,
                    })),
                ),
        )
        .addNumberOption((option) =>
            option
                .setName("price")
                .setDescription("The target price to sell at")
                .setRequired(true),
        )
        .addNumberOption((option) =>
            option
                .setName("percentage")
                .setDescription("The percentage of your holdings to sell")
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName(Command.RemoveTarget)
        .setDescription("Remove an existing sell target")
        .addStringOption((option) =>
            option
                .setName("ticker")
                .setDescription(
                    "The cryptocurrency ticker (e.g., BTC, ETH, ADA)",
                )
                .setRequired(true)
                .addChoices(
                    Object.keys(SUPPORTED_TICKERS).map((t) => ({
                        name: t,
                        value: t,
                    })),
                ),
        )
        .addNumberOption((option) =>
            option
                .setName("price")
                .setDescription("The price the target to remove was set at")
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName(Command.ViewTargets)
        .setDescription("View your existing sell targets")
        .addStringOption((option) =>
            option
                .setName("ticker")
                .setDescription(
                    "The cryptocurrency ticker (e.g., BTC, ETH, ADA)",
                )
                .setRequired(true)
                .addChoices(
                    Object.keys(SUPPORTED_TICKERS).map((t) => ({
                        name: t,
                        value: t,
                    })),
                ),
        ),

    new SlashCommandBuilder()
        .setName(Command.Help)
        .setDescription("Display a help message"),

    new SlashCommandBuilder()
        .setName(Command.Unlink)
        .setDescription("Unlink your account and delete all your data"),
];

dotenv.config();
if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error("DISCORD_BOT_TOKEN must be set in the environment");
}
const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_BOT_TOKEN);
(async () => {
    try {
        console.log("Registering slash commands...");
        if (!process.env.DISCORD_APP_ID) {
            throw new Error("DISCORD_APP_ID must be set in the environment");
        }
        await rest.put(Routes.applicationCommands(process.env.DISCORD_APP_ID), {
            body: commands.map((command) => command.toJSON()),
        });
        console.log("Slash commands registered successfully.");
    } catch (error) {
        console.error("Error registering slash commands:", error);
    }
})();
