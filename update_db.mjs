import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  const tables = [
    "Patrol",
    "Violation",
    "Survey",
    "EiaCost",
    "EiaInspection",
    "EiaViolation",
    "EiaAccident"
  ];

  for (const table of tables) {
    try {
      console.log(`Adding reserveId to ${table}...`);
      await client.execute(`ALTER TABLE ${table} ADD COLUMN reserveId TEXT NOT NULL DEFAULT ''`);
      console.log(`Adding reserve to ${table}...`);
      await client.execute(`ALTER TABLE ${table} ADD COLUMN reserve TEXT NOT NULL DEFAULT ''`);
      console.log(`Successfully updated ${table}.`);
    } catch (e) {
      console.log(`Error updating ${table} (maybe columns already exist):`, e.message);
    }
  }
}

main().catch(console.error);
