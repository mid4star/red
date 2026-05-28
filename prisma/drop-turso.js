const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envLocalPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url || !url.startsWith("libsql://")) {
    console.error("❌ DATABASE_URL must be a libsql:// URL.");
    process.exit(1);
  }

  console.log("🔗 Connecting to Turso:", url);
  const client = createClient({ url, authToken });

  // Get all user tables
  console.log("🔍 Fetching tables...");
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
  const tables = result.rows.map(row => String(row.name));

  console.log(`📋 Found ${tables.length} tables to drop:`, tables.join(", "));

  // Disable foreign keys temporarily
  await client.execute("PRAGMA foreign_keys = OFF;");

  for (const table of tables) {
    try {
      console.log(`🗑️ Dropping table: ${table}`);
      await client.execute(`DROP TABLE IF EXISTS "${table}";`);
      console.log(`  ✅ Dropped`);
    } catch (err) {
      console.error(`  ❌ Error dropping table ${table}:`, err.message);
    }
  }

  // Re-enable foreign keys
  await client.execute("PRAGMA foreign_keys = ON;");

  console.log("\n🎉 All tables dropped successfully!");
  client.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
