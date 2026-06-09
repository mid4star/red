const { createClient } = require('@libsql/client');
const fs = require('fs');

async function main() {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const envMap = {};
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) envMap[key.trim()] = vals.join('=').trim();
  });

  const client = createClient({
    url: envMap['DATABASE_URL'],
    authToken: envMap['DATABASE_AUTH_TOKEN'],
  });

  console.log('Connecting to LibSQL...');

  const sql = `
    CREATE TABLE IF NOT EXISTS "EmailRoute" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "alias" TEXT NOT NULL,
        "destinationEmail" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "cloudflareRuleId" TEXT,
        "verified" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "EmailRoute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `;

  await client.execute(sql);

  const sqlIndex = `CREATE UNIQUE INDEX IF NOT EXISTS "EmailRoute_alias_key" ON "EmailRoute"("alias");`;
  await client.execute(sqlIndex);

  console.log('Successfully created EmailRoute table and index.');
}

main().catch(console.error);
