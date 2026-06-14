import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

const dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]:)/, '$1');
loadEnvFile(path.join(dirname, '.env.local'));
loadEnvFile(path.join(dirname, '.env'));

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

function verifyPassword(password, storedHash) {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (e) {
    return false;
  }
}

async function main() {
  const user = await prisma.user.findFirst({ where: { employeeId: 'MON-102' } });
  console.log("=== USER MON-102 ===");
  console.log(user);
  if (user) {
    console.log("verifyPassword('password'):", verifyPassword("password", user.passwordHash));
    console.log("verifyPassword('hashed_monitor_password'):", verifyPassword("hashed_monitor_password", user.passwordHash));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
