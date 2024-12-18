import db from ".";

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        discord_id TEXT UNIQUE NOT NULL,
        channel_id TEXT NOT NULL,
        username TEXT NOT NULL,
        silence_alerts BOOLEAN DEFAULT FALSE,
        linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`,
).run();

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS crypto (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL UNIQUE,
        api_id TEXT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`,
).run();

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS basis (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        crypto_id INTEGER NOT NULL,
        dollars NUMERIC(20, 2) NOT NULL,
        price NUMERIC(20, 10) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (crypto_id) REFERENCES crypto(id) ON DELETE CASCADE
    )
    `,
).run();

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS targets (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        crypto_id INTEGER NOT NULL,
        price NUMERIC(20, 10) NOT NULL,
        percentage NUMERIC(3, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        was_notified BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (crypto_id) REFERENCES crypto(id) ON DELETE CASCADE
    )
`,
).run();

console.log("Database tables created.");
