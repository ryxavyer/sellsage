import {
    BASIS,
    BASIS_CREATE,
    CRYPTO,
    CRYPTO_CREATE,
    TARGET,
    TARGET_CREATE,
    USER,
    USER_CREATE,
} from "./types";
import db from ".";

// USER
export function getUser(discord_id: string): USER | undefined {
    const user = db
        .prepare(
            `
        SELECT * FROM users WHERE discord_id = ?
    `,
        )
        .get(discord_id);
    return user ? (user as USER) : undefined;
}
export function getOrCreateUser(
    discord_id: string,
    channel_id: string,
    username: string,
): USER {
    let user = getUser(discord_id);
    if (user) {
        return user;
    }
    insertUser({ discord_id, channel_id, username });
    return getUser(discord_id) as USER;
}
export function insertUser(user: USER_CREATE): boolean {
    const result = db
        .prepare(
            `
        INSERT INTO users (discord_id, channel_id, username)
        VALUES (?, ?, ?)
    `,
        )
        .run(user.discord_id, user.channel_id, user.username);
    if (!result.changes) {
        throw new Error("❌ Error saving user.");
    }
    return true;
}
export function deleteUser(discord_id: string): boolean {
    const result = db
        .prepare(
            `
        DELETE FROM users WHERE discord_id = ?
    `,
        )
        .run(discord_id);
    if (!result.changes) {
        throw new Error("❌ Error deleting user.");
    }
    return true;
}
// CRYPTO
export function getCrypto(symbol: string): CRYPTO | undefined {
    const crypto = db
        .prepare(
            `
        SELECT * FROM crypto WHERE symbol = ?
    `,
        )
        .get(symbol);
    return crypto ? (crypto as CRYPTO) : undefined;
}
export function insertCrypto(crypto: CRYPTO_CREATE): boolean {
    const result = db
        .prepare(
            `
        INSERT INTO crypto (name, symbol)
        VALUES (?, ?)
    `,
        )
        .run(crypto.name, crypto.symbol);
    if (!result.changes) {
        throw new Error("❌ Error saving crypto.");
    }
    return true;
}
export function deleteCrypto(symbol: string): boolean {
    const result = db
        .prepare(
            `
        DELETE FROM crypto WHERE symbol = ?
    `,
        )
        .run(symbol);
    if (!result.changes) {
        throw new Error("❌ Error deleting crypto.");
    }
    return true;
}
// BASIS
export function getBasis(
    user_id: number,
    crypto_id: number,
): BASIS | undefined {
    const basis = db
        .prepare(
            `
            SELECT * FROM basis WHERE user_id = ? AND crypto_id = ?
        `,
        )
        .get(user_id, crypto_id);
    return basis ? (basis as BASIS) : undefined;
}
export function insertOrUpdateBasis(basis: BASIS_CREATE): boolean {
    const result = db
        .prepare(
            `
            INSERT INTO basis (user_id, crypto_id, dollars, price)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, crypto_id)
            DO UPDATE SET
                dollars = excluded.dollars,
                price = excluded.price
        `,
        )
        .run(basis.user_id, basis.crypto_id, basis.dollars, basis.price);
    if (!result.changes) {
        throw new Error("❌ Error saving cost basis.");
    }
    return true;
}
export function deleteBasis(user_id: number, crypto_id: number): boolean {
    const result = db
        .prepare(
            `
            DELETE FROM basis WHERE user_id = ? AND crypto_id = ?
        `,
        )
        .run(user_id, crypto_id);
    if (!result.changes) {
        throw new Error("❌ Error deleting cost basis.");
    }
    return !!result.changes;
}
// TARGET
export function getTargets(discord_id: string, symbol: string): TARGET[] {
    const user = getUser(discord_id);
    if (!user) {
        throw new Error("❌ No user found. Please link your account first");
    }
    const crypto = getCrypto(symbol);
    if (!crypto) {
        throw new Error("❌ Cryptocurrency not found.");
    }
    const targets = db
        .prepare(
            `
            SELECT * FROM targets WHERE user_id = ? AND crypto_id = ?
        `,
        )
        .all(user.id, crypto.id);
    return targets ? (targets as TARGET[]) : [];
}
export function getTarget(
    user_id: number,
    crypto_id: number,
    price: number,
): TARGET | undefined {
    const target = db
        .prepare(
            `
        SELECT * FROM targets WHERE user_id = ? AND crypto_id = ? AND price = ?
    `,
        )
        .get(user_id, crypto_id, price);
    return target ? (target as TARGET) : undefined;
}
export function insertOrUpdateTarget(target: TARGET_CREATE): boolean {
    const result = db
        .prepare(
            `
            INSERT INTO targets (user_id, crypto_id, price, percentage)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, crypto_id, price)
            DO UPDATE SET
                percentage = excluded.percentage
        `,
        )
        .run(target.user_id, target.crypto_id, target.price, target.percentage);
    if (!result.changes) {
        throw new Error("❌ Error saving or updating target.");
    }
    return true;
}
export function deleteTarget(
    user_id: number,
    crypto_id: number,
    price: number,
): boolean {
    const result = db
        .prepare(
            `
        DELETE FROM targets WHERE user_id = ? AND crypto_id = ? AND price = ?
    `,
        )
        .run(user_id, crypto_id, price);
    if (!result.changes) {
        console.log(
            `No matching target to delete for ${user_id} - ${crypto_id} at ${price}`,
        );
        return false;
    }
    return true;
}
