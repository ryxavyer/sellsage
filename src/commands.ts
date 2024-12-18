import { DMChannel, PartialDMChannel } from "discord.js";
import { BASIS_CREATE, TARGET_CREATE } from "./database/types";
import {
  deleteTarget,
  deleteUser,
  getCrypto,
  getTarget,
  getTargets,
  getUser,
  insertBasis,
  insertTarget,
} from "./database/utils";
import { SUPPORTED_TICKERS } from "./constants";
import {
  parseAddTargetCommandArgs,
  parseRemoveTargetCommandArgs,
  parseSetBasisCommandArgs,
  parseViewTargetsCommandArgs,
} from "./utils";
import { Command } from "./types";

export function getCommandType(message: string): Command | null {
  const command = message.split(" ")[0];
  switch (command) {
    case "!link":
      return Command.Link;
    case "!unlink":
      return Command.Unlink;
    case "!setbasis":
      return Command.SetBasis;
    case "!addtarget":
      return Command.AddTarget;
    case "!removetarget":
      return Command.RemoveTarget;
    case "!viewtargets":
      return Command.ViewTargets;
    case "!help":
      return Command.Help;
    default:
      return null;
  }
}

export async function unlink(channel: DMChannel | PartialDMChannel) {
  // unlink user from app by deleting the user record in the database
  try {
    if (!channel.recipient) {
      throw new Error("❌ No recipient found in the channel.");
    }
    deleteUser(channel.recipient.id);
    channel.send("✅ You've been unlinked from SellSage.");
  } catch (error) {
    console.error("Error unlinking user:", error);
    channel.send("Error unlinking user. Please try again.");
  }
}

export async function sendHelp(channel: DMChannel | PartialDMChannel) {
  const helpMessage = `
**Supported Tickers**: ${Object.keys(SUPPORTED_TICKERS).join(", ")}

\`!setbasis <crypto ticker - ie. BTC, ETH, SOL> <dollars in ie. 10.50, 5000> <price ie. 0.5, 15.00, 101600>\`
💵 *Optional*: Set your cost basis for a ticker and get extra information about your profits across alerts.
        
\`!addtarget <crypto ticker - ie. BTC, ETH, SOL> <target price ie. 0.00025, 1.20, 5600> <percentage ie. 5, 15, 50>\`
🎯 Add a sell target. SellSage will automatically alert you when the target is reached.
        
\`!removetarget <crypto ticker - ie. BTC, ETH, SOL> <target price ie. 0.00025, 1.20, 5600>\`
❌ Remove an existing sell target and any associated alerts.
        
\`!viewtargets <crypto ticker - ie. BTC, ETH, SOL>\`
📈 View your existing sell targets for a ticker.
        
\`!help\`
❔ Display this help message.

\`!unlink\`
⛓️‍💥 Unlink your Discord account from SellSage. 🚩 **Warning**: This will delete all of your data.
`;
  channel.send(helpMessage);
}

export async function setCostBasis(
  message: string,
  channel: DMChannel | PartialDMChannel,
) {
  // set the cost basis for a ticker
  // ie: !setbasis BTC 100 50000
  const parsed = parseSetBasisCommandArgs(message);
  if (!parsed || !parsed.success || !parsed.args) {
    return channel.send(parsed?.error || "❌ Error parsing setbasis command.");
  }
  try {
    if (!channel.recipient) {
      throw new Error("❌ No recipient found in the channel.");
    }
    const user = getUser(channel.recipient.id);
    if (!user) {
      throw new Error("❌ No user found. Please link your account first.");
    }
    const crypto = getCrypto(parsed.args.ticker);
    if (!crypto) {
      throw new Error("❌ Cryptocurrency not supported.");
    }
    const basis: BASIS_CREATE = {
      user_id: user.id,
      crypto_id: crypto.id,
      dollars: parsed.args.dollars,
      price: parsed.args.buyPrice,
    };
    insertBasis(basis);
    return channel.send(
      `✅ Set cost basis for ${parsed.args.ticker} - $${parsed.args.dollars} at $${parsed.args.buyPrice} per ${parsed.args.ticker}.`,
    );
  } catch (error) {
    console.error("Error saving cost basis:", error);
    return channel.send(error || "❌ Error saving cost basis.");
  }
}

export async function addTarget(
  message: string,
  channel: DMChannel | PartialDMChannel,
) {
  // add a price target
  // ie: !addtarget BTC 2.1T 15
  const parsed = parseAddTargetCommandArgs(message);
  if (!parsed || !parsed.success || !parsed.args) {
    return channel.send(parsed?.error || "❌ Error parsing addtarget command.");
  }
  try {
    if (!channel.recipient) {
      throw new Error("❌ No recipient found in the channel.");
    }
    const user = getUser(channel.recipient.id);
    if (!user) {
      throw new Error("❌ No user found. Please link your account first.");
    }
    const crypto = getCrypto(parsed.args.ticker);
    if (!crypto) {
      throw new Error("❌ Cryptocurrency not supported.");
    }
    const target: TARGET_CREATE = {
      user_id: user.id,
      crypto_id: crypto.id,
      price: parsed.args.price,
      percentage: parsed.args.percentage,
    };
    insertTarget(target);
    return channel.send(
      `✅ Added target for ${parsed.args.ticker} - ${parsed.args.percentage}% at ${parsed.args.price}.`,
    );
  } catch (error) {
    console.error("Error saving target:", error);
    return channel.send(error || "❌ Error saving target.");
  }
}

export async function removeTarget(
  message: string,
  channel: DMChannel | PartialDMChannel,
) {
  // remove a sale target
  // Example: !removetarget BTC 1.2T
  const parsed = parseRemoveTargetCommandArgs(message);
  if (!parsed || !parsed.success || !parsed.args) {
    return channel.send(
      parsed?.error || "❌ Error parsing removetarget command.",
    );
  }
  try {
    if (!channel.recipient) {
      throw new Error("❌ No recipient found in the channel.");
    }
    const user = getUser(channel.recipient.id);
    if (!user) {
      throw new Error("❌ No user found. Please link your account first.");
    }
    const crypto = getCrypto(parsed.args.ticker);
    if (!crypto) {
      throw new Error("❌ Cryptocurrency not supported.");
    }
    const target = getTarget(user.id, crypto.id, parsed.args.price);
    if (!target) {
      throw new Error("❌ Target not found.");
    }
    deleteTarget(user.id, crypto.id, parsed.args.price);
    return channel.send(
      `✅ Removed target for ${parsed.args.ticker} at ${parsed.args.price}.`,
    );
  } catch (error) {
    console.error("Error deleting target:", error);
    return channel.send(error || "❌ Error deleting target.");
  }
}

export async function viewTargets(
  message: string,
  channel: DMChannel | PartialDMChannel,
) {
  // view all sale targets for a ticker
  // Example: !viewtargets BTC
  const parsed = parseViewTargetsCommandArgs(message);
  if (!parsed || !parsed.success || !parsed.args) {
    return channel.send(
      parsed?.error || "❌ Error parsing viewtargets command.",
    );
  }
  try {
    if (!channel.recipient) {
      throw new Error("❌ No recipient found in the channel.");
    }
    const targets = getTargets(channel.recipient.id, parsed.args.ticker);
    if (!targets.length) {
      return channel.send(
        `No targets found for ${parsed.args.ticker}. Use !addtarget to add a target.`,
      );
    }
    let targetsMessage =
      "Your sale targets for **" + parsed.args.ticker + "**:\n";
    targets.forEach((target) => {
      targetsMessage += `- Sell ${target.percentage}% at $${target.price}.\n`;
    });
    return channel.send(targetsMessage);
  } catch (error) {
    console.error("Error fetching targets:", error);
    return channel.send(error || "❌ Error fetching targets.");
  }
}
