const { createClient } = require('@libsql/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper to load env files
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
          const key = trimmed.substring(0, eqIndex).trim();
          let value = trimmed.substring(eqIndex + 1).trim();
          // Remove optional quotes around values
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
}

async function main() {
  // Load .env.local first (takes precedence), then .env
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  loadEnvFile(path.join(__dirname, '..', '.env'));

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
  console.log('sqlSchema length:', sqlSchema ? sqlSchema.length : 0);
  // Split statements by semicolon and filter out comments and empty statements
  const statements = sqlSchema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  console.log('Number of statements parsed:', statements.length);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Strip comment lines starting with '--'
    const lines = stmt.split(/\r?\n/).map(line => line.trim());
    const sqlLines = lines.filter(line => !line.startsWith('--') && line.length > 0);
    const actualQuery = sqlLines.join(' ').trim();
    
    if (!actualQuery) continue;
    
    console.log(`Executing SQL ${i + 1}/${statements.length}: ${actualQuery.substring(0, 80)}...`);
    try {
      await client.execute(actualQuery);
      console.log(`  ✅ Success`);
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate column name')) {
        console.log(`  ⏭️  Already exists (skipped)`);
      } else {
        console.warn(`  ❌ Error running statement ${i + 1}:`, err.message);
      }
    }
  }

  console.log('Schema push execution completed.');
  client.close();
}

main().catch(console.error);
