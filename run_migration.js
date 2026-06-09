const { createClient } = require("@libsql/client");
require("dotenv").config();

async function run() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
  });

  try {
    await client.execute("ALTER TABLE User ADD COLUMN lastActive DATETIME;");
    console.log("Added lastActive column");
  } catch(e) { console.log("lastActive may already exist", e.message); }

  console.log("Migration complete.");
}

run();
