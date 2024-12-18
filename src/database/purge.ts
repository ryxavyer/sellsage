import db from ".";

// reverse dependency order
const tables = ["basis", "targets", "crypto", "users"];

try {
    tables.forEach((table) => {
        db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
        console.log(`Dropped table: ${table}`);
    });

    console.log("Database purged successfully.");
} catch (error) {
    console.error("Error purging the database:", error);
} finally {
    db.close();
}
