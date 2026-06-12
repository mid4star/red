import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, employeeId: true, role: true, reserveId: true, reserve: true } });
  console.log("USERS:", users);

  const patrols = await prisma.patrol.findMany({ select: { id: true, code: true, reserveId: true, reserve: true } });
  console.log("PATROLS:", patrols);

  const violations = await prisma.violation.findMany({ select: { id: true, code: true, reserveId: true, reserve: true } });
  console.log("VIOLATIONS:", violations);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
