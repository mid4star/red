import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const reservesData = [
  {
    id: "northern-islands",
    name: "Northern Islands",
    nameAr: "محمية الجزر الشمالية",
    description: "Northern Islands marine reserve.",
    descriptionAr: "محمية الجزر الشمالية البحرية.",
    location: "Red Sea",
    locationAr: "البحر الأحمر",
    area: 100,
    establishedYear: 2000,
    status: "OPEN"
  },
  {
    id: "wadi-el-gemal",
    name: "Wadi El Gemal",
    nameAr: "محمية وادي الجمال",
    description: "Wadi El Gemal National Park.",
    descriptionAr: "محمية وادي الجمال الوطنية.",
    location: "Red Sea",
    locationAr: "البحر الأحمر",
    area: 7450,
    establishedYear: 2003,
    status: "OPEN"
  },
  {
    id: "gebel-elba",
    name: "Gebel Elba",
    nameAr: "محمية جبل علبة",
    description: "Gebel Elba National Park.",
    descriptionAr: "محمية جبل علبة الوطنية.",
    location: "Red Sea",
    locationAr: "البحر الأحمر",
    area: 35600,
    establishedYear: 1986,
    status: "OPEN"
  },
  {
    id: "coral-reef",
    name: "Coral Reef Protectorate",
    nameAr: "محمية الحيد المرجاني",
    description: "Coral Reef Protectorate.",
    descriptionAr: "محمية الحيد المرجاني.",
    location: "Red Sea",
    locationAr: "البحر الأحمر",
    area: 500,
    establishedYear: 2000,
    status: "OPEN"
  }
];

async function seedReserves() {
  for (const r of reservesData) {
    await prisma.reserveProfile.upsert({
      where: { id: r.id },
      update: r,
      create: r
    });
  }
  console.log("Reserves seeded successfully.");
}

seedReserves()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
