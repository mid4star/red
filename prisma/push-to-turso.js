/**
 * Push Prisma schema to Turso database
 * Usage: node prisma/push-to-turso.js
 */

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

function parseSqlStatements(sql) {
  const statements = [];
  let depth = 0; // Track parenthesis depth
  let current = "";
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    
    // Skip SQL comments
    if (char === '-' && sql[i+1] === '-') {
      // Skip to end of line
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }
    
    current += char;
    
    if (char === '(') depth++;
    if (char === ')') depth--;
    
    if (char === ';' && depth === 0) {
      const trimmed = current.trim();
      if (trimmed.length > 1) { // More than just ";"
        statements.push(trimmed);
      }
      current = "";
    }
  }
  
  return statements;
}

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url || !url.startsWith("libsql://")) {
    console.error("❌ DATABASE_URL must be a libsql:// URL.");
    console.error("   Current value:", url || "(not set)");
    process.exit(1);
  }

  if (!authToken) {
    console.error("❌ DATABASE_AUTH_TOKEN is not set.");
    process.exit(1);
  }

  console.log("🔗 Connecting to Turso:", url);
  const client = createClient({ url, authToken });

  // Read the SQL migration file
  const sqlPath = path.join(__dirname, "turso-migration.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("❌ Migration SQL file not found.");
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf-8");
  const statements = parseSqlStatements(sql);

  console.log(`📋 Found ${statements.length} SQL statements to execute.\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      successCount++;
      const match = stmt.match(/(?:CREATE\s+TABLE|CREATE\s+UNIQUE\s+INDEX|CREATE\s+INDEX)\s+"?([^"\s(]+)"?/i);
      if (match) {
        console.log(`  ✅ Created: ${match[1]}`);
      } else {
        console.log(`  ✅ Executed: ${stmt.substring(0, 60)}...`);
      }
    } catch (err) {
      if (err.message && err.message.includes("already exists")) {
        skipCount++;
        const match = stmt.match(/(?:CREATE\s+TABLE|CREATE\s+UNIQUE\s+INDEX|CREATE\s+INDEX)\s+"?([^"\s(]+)"?/i);
        if (match) {
          console.log(`  ⏭️  Already exists: ${match[1]}`);
        }
      } else {
        errorCount++;
        console.error(`  ❌ Error: ${err.message}`);
        console.error(`     Statement: ${stmt.substring(0, 120)}...`);
      }
    }
  }

  console.log("\n📊 Summary:");
  console.log(`   ✅ Created: ${successCount}`);
  console.log(`   ⏭️  Skipped (already exist): ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  // Verify tables
  console.log("\n🔍 Verifying tables in Turso database...");
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
  console.log("   Tables found:");
  for (const row of result.rows) {
    console.log(`     📋 ${row.name}`);
  }

  if (errorCount === 0) {
    console.log("\n🎉 All done! Database schema is on Turso.");
  }

  client.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
