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

  console.log('Connecting to LibSQL to fix seed users...');

  await client.execute(`UPDATE "User" SET customDomainEmail = 'admin@rsmp-eg.com' WHERE employeeId = 'ADMIN-01'`);
  await client.execute(`UPDATE "User" SET customDomainEmail = 'monitor@rsmp-eg.com' WHERE employeeId = 'MON-102'`);

  console.log('Successfully updated seed users with custom domain emails.');
}

main().catch(console.error);
