const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const t = line.trim();
  if (t && !t.startsWith("#")) {
    const i = t.indexOf("=");
    if (i > 0) {
      const k = t.substring(0, i).trim();
      const v = t.substring(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
});

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  console.log("Checking Turso database...\n");

  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
  
  for (const row of tables.rows) {
    const tableName = String(row.name);
    try {
      const countRes = await client.execute("SELECT COUNT(*) as cnt FROM \"" + tableName + "\";");
      const cnt = Number(countRes.rows[0].cnt);
      console.log(tableName + ": " + cnt + " records");
      
      if (cnt > 0 && cnt <= 10) {
        const data = await client.execute("SELECT * FROM \"" + tableName + "\" LIMIT 5;");
        for (const r of data.rows) {
          const str = JSON.stringify(r);
          console.log("  -> " + str.substring(0, 300));
        }
      }
    } catch (err) {
      console.log(tableName + ": ERROR - " + err.message);
    }
  }

  client.close();
}

main().catch(console.error);
