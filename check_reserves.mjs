import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkReserves() {
  const reserves = await prisma.reserveProfile.findMany();
  console.log("RESERVES:", reserves);
}

checkReserves().catch(console.error).finally(() => prisma.$disconnect());
