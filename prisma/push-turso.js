const { createClient } = require('@libsql/client');
const { execSync } = require('child_process');

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Error: Please set DATABASE_URL and DATABASE_AUTH_TOKEN environment variables.');
    console.error('Example:');
    console.error('  $env:DATABASE_URL="libsql://your-db.turso.io"');
    console.error('  $env:DATABASE_AUTH_TOKEN="your-token"');
    process.exit(1);
  }

  console.log('Connecting to Turso database...');
  const client = createClient({ url, authToken });

  console.log('Generating schema SQL using Prisma CLI...');
  let sqlSchema;
  try {
    sqlSchema = execSync('npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script', {
      encoding: 'utf-8'
    });
  } catch (err) {
    console.error('Error generating schema SQL:', err.message);
    process.exit(1);
  }

  console.log('Applying schema to Turso database...');
  // Split statements by semicolon and filter out comments and empty statements
  const statements = sqlSchema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.startsWith('--')) continue; // Skip single statement comments
    
    try {
      await client.execute(stmt);
    } catch (err) {
      if (err.message.includes('already exists')) {
        // Table or index already exists, this is fine
      } else {
        console.warn(`Warning/Error running statement ${i + 1}:`, err.message);
      }
    }
  }

  console.log('Schema pushed to Turso successfully!');
  client.close();
}

main().catch(console.error);
