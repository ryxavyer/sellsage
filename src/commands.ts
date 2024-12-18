import { CommandInteraction } from "discord.js";
import { BASIS_CREATE, TARGET_CREATE } from "./database/types";
import {
    deleteTarget,
    deleteUser,
    getCrypto,
    getTarget,
    getTargets,
    getUser,
    insertOrUpdateBasis,
    insertTarget,
} from "./database/utils";
import { SUPPORTED_TICKERS } from "./constants";

export async function unlink(interaction: CommandInteraction) {
    // unlink user from app by deleting the user record in the database
    try {
        deleteUser(interaction.user.id);
        interaction.reply("✅ You've been unlinked from SellSage.");
    } catch (error) {
        console.error("Error unlinking user:", error);
        interaction.reply("❌ Error unlinking user. Please try again.");
    }
}

export async function sendHelp(interaction: CommandInteraction) {
    const helpMessage = `
**Supported Tickers**: ${Object.keys(SUPPORTED_TICKERS).join(", ")}

\`/setbasis\`
💵 *Optional*: Set your cost basis for a ticker and get extra information about your profits across alerts. If a cost basis is already set, this will overwrite it.
        
\`/addtarget\`
🎯 Add a sell target. SellSage will automatically alert you when the target is reached.
        
\`/removetarget\`
❌ Remove an existing sell target and any associated alerts.
        
\`/viewtargets\`
📈 View your existing sell targets for a ticker.
        
\`/help\`
❔ Display this help message.

\`/unlink\`
⛓️‍💥 Unlink your Discord account from SellSage. 🚩 **Warning**: This will delete all of your data.
`;
    interaction.reply(helpMessage);
}

export async function setCostBasis(interaction: CommandInteraction) {
    // set the cost basis for a ticker
    const ticker = interaction.options.get("ticker", true).value as string;
    const dollars = interaction.options.get("dollars", true).value as number;
    const price = interaction.options.get("price", true).value as number;
    try {
        const user = getUser(interaction.user.id);
        if (!user) {
            throw new Error(
                "❌ No user found. User needs to be linked before using SellSage.",
            );
        }
        const crypto = getCrypto(ticker);
        if (!crypto) {
            throw new Error("❌ Cryptocurrency not supported.");
        }
        const basis: BASIS_CREATE = {
            user_id: user.id,
            crypto_id: crypto.id,
            dollars: dollars,
            price: price,
        };
        insertOrUpdateBasis(basis);
        return interaction.reply(
            `✅ Set cost basis for ${ticker} - $${dollars} at $${price} per ${ticker}.`,
        );
    } catch (error) {
        console.error("Error saving cost basis:", error);
        return interaction.reply(error || "❌ Error saving cost basis.");
    }
}

export async function addTarget(interaction: CommandInteraction) {
    // add a price target
    const ticker = interaction.options.get("ticker", true).value as string;
    const price = interaction.options.get("price", true).value as number;
    const percentage = interaction.options.get("percentage", true)
        .value as number;
    try {
        const user = getUser(interaction.user.id);
        if (!user) {
            throw new Error(
                "❌ No user found. User needs to be linked before using SellSage.",
            );
        }
        const crypto = getCrypto(ticker);
        if (!crypto) {
            throw new Error("❌ Cryptocurrency not supported.");
        }
        const target: TARGET_CREATE = {
            user_id: user.id,
            crypto_id: crypto.id,
            price: price,
            percentage: percentage,
        };
        insertTarget(target);
        return interaction.reply(
            `✅ Added target for ${ticker} - ${percentage}% at $${price}.`,
        );
    } catch (error) {
        console.error("Error saving target:", error);
        return interaction.reply(error || "❌ Error saving target.");
    }
}

export async function removeTarget(interaction: CommandInteraction) {
    // remove a sale target
    const ticker = interaction.options.get("ticker", true).value as string;
    const price = interaction.options.get("price", true).value as number;
    try {
        const user = getUser(interaction.user.id);
        if (!user) {
            throw new Error(
                "❌ No user found. User needs to be linked before using SellSage.",
            );
        }
        const crypto = getCrypto(ticker);
        if (!crypto) {
            throw new Error("❌ Cryptocurrency not supported.");
        }
        const target = getTarget(user.id, crypto.id, price);
        if (!target) {
            throw new Error("❌ Target not found.");
        }
        deleteTarget(user.id, crypto.id, price);
        return interaction.reply(
            `✅ Removed target for ${ticker} at $${price}.`,
        );
    } catch (error) {
        console.error("Error deleting target:", error);
        return interaction.reply(error || "❌ Error deleting target.");
    }
}

export async function viewTargets(interaction: CommandInteraction) {
    // view all sale targets for a ticker
    const ticker = interaction.options.get("ticker", true).value as string;
    try {
        const targets = getTargets(interaction.user.id, ticker);
        if (!targets.length) {
            return interaction.reply(
                `No targets found for ${ticker}. Use /addtarget to add a target.`,
            );
        }
        let targetsMessage = "Your sale targets for **" + ticker + "**:\n";
        targets.forEach((target) => {
            targetsMessage += `- Sell ${target.percentage}% at $${target.price}.\n`;
        });
        return interaction.reply(targetsMessage);
    } catch (error) {
        console.error("Error fetching targets:", error);
        return interaction.reply(error || "❌ Error fetching targets.");
    }
}
