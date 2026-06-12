import 'dotenv/config';

const baseUrl = 'http://localhost:3000/api';

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
  console.log("Logging in as admin...");
  let adminRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ADMIN-01', password: 'admin' }) // Now this works because of my previous fix!
  });
  
  if (!adminRes.ok) {
    console.error("Admin login failed:", await adminRes.text());
    return;
  }
  
  const adminCookieStr = adminRes.headers.get('set-cookie');
  console.log("Got cookie:", adminCookieStr ? "Yes" : "No");

  for (const r of reservesData) {
    console.log(`Creating reserve: ${r.id}`);
    const res = await fetch(`${baseUrl}/staff/mutate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookieStr || ''
      },
      body: JSON.stringify({
        collectionName: 'reserves',
        action: 'ADD', // or UPDATE if we want to upsert, but let's try ADD
        id: r.id,
        data: r
      })
    });
    const result = await res.json();
    console.log(`Result for ${r.id}:`, result);
  }
}

seedReserves().catch(console.error);
