import axios from "axios";
import { DMChannel, PartialDMChannel } from "discord.js";
import db from "../database";
import client from "../client";
import { Alert, CoinGekkoSimplePriceResponse } from "./types";
import { BASIS, CRYPTO, TARGET_USER_CRYPTO_JOIN } from "../database/types";

export async function fetchPrices(): Promise<CoinGekkoSimplePriceResponse | null> {
    try {
        const crypto = db.prepare(`SELECT * FROM crypto`).all() as CRYPTO[];
        const ids = crypto.map((data) => data.api_id).join(",");
        if (!ids.length) {
            return null;
        }
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price`,
            {
                headers: {
                    "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
                    Accept: "application/json",
                },
                params: { ids, vs_currencies: "usd" },
            },
        );
        if (response.status !== 200) {
            throw new Error(`${response.status} API error`);
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching prices:", error);
        return null;
    }
}

export async function buildAlerts(
    prices: CoinGekkoSimplePriceResponse,
): Promise<Alert[]> {
    try {
        // query all targets from db
        const targets = db
            .prepare(
                `
            SELECT *
            FROM targets
            JOIN users ON targets.user_id = users.id
            JOIN crypto ON targets.crypto_id = crypto.id
        `,
            )
            .all() as TARGET_USER_CRYPTO_JOIN[];

        const alerts: Alert[] = [];
        // compare prices with targets
        for (const target of targets) {
            const currentPrice = prices[target.api_id]?.usd;
            if (currentPrice && currentPrice >= target.price) {
                alerts.push({
                    targetId: target.id,
                    userId: target.user_id,
                    cryptoId: target.crypto_id,
                    username: target.username,
                    channelId: target.channel_id,
                    symbol: target.symbol,
                    targetPrice: target.price,
                    percentage: target.percentage,
                    currentPrice: currentPrice,
                });
            }
        }
        // attach basis to alerts if available
        for (const alert of alerts) {
            const basis = db
                .prepare(
                    `
                SELECT *
                FROM basis
                WHERE basis.user_id = ? AND basis.crypto_id = ?
            `,
                )
                .get(alert.userId, alert.cryptoId) as BASIS | undefined;
            if (basis) {
                alert.basis = basis;
            }
        }
        return alerts;
    } catch (error) {
        console.error("Error building alerts:", error);
        return [];
    }
}

export async function sendAlerts(alerts: Alert[]): Promise<boolean> {
    for (const alert of alerts) {
        try {
            const channel = (await client.channels.fetch(alert.channelId)) as
                | DMChannel
                | PartialDMChannel
                | null;
            if (channel) {
                let message = `🎉 It's time to sell ${alert.percentage}% of your ${alert.symbol} holdings!\n\n📈 ${alert.symbol} has reached $${alert.currentPrice.toFixed(2)} (Target: $${alert.targetPrice.toFixed(2)}).`;
                if (alert.basis) {
                    const profit =
                        (alert.currentPrice - alert.basis.price) *
                        (alert.basis.dollars * (alert.percentage / 100));
                    message += `\n💰 Secure your profit of $${profit.toFixed(2)} compared to ${alert.percentage}% of your initial investment.`;
                }
                await channel.send(message);
                // remove target after alert
                db.prepare(
                    `
                        DELETE FROM targets
                        WHERE id = ?
                    `,
                ).run(alert.targetId);
            }
        } catch (error) {
            console.error(
                `Error sending alert for ${alert.symbol} to ${alert.username}:`,
                error,
            );
        }
    }
    return true;
}
