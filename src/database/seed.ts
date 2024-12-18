import db from ".";
import { SUPPORTED_TICKERS } from "../constants";

const insert = db.prepare(`
    INSERT INTO crypto (name, symbol, api_id)
    VALUES (?, ?, ?)
    ON CONFLICT(symbol) DO NOTHING
`);
Object.entries(SUPPORTED_TICKERS).forEach(([symbol, data]) => {
    insert.run(data.name, symbol, data.api_id);
});

console.log("Base cryptocurrency projects initialized.");
