import db from ".";

// reverse dependency order
const tables = ["basis", "targets", "crypto", "users"];

try {
  tables.forEach((table) => {
    db.prepare(`DELETE FROM ${table}`).run();
    console.log(`Wiped all rows from ${table}`);
  });

  console.log("Database wiped successfully.");
} catch (error) {
  console.error("Error wiping the database:", error);
} finally {
  db.close();
}
