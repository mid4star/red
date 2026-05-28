process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding SQLite database with Prisma...');

  // 1. Clear existing data
  await prisma.eiaCostFile.deleteMany({});
  await prisma.eiaCost.deleteMany({});
  await prisma.eiaInspection.deleteMany({});
  await prisma.eiaViolationFile.deleteMany({});
  await prisma.eiaViolation.deleteMany({});
  await prisma.eiaAccident.deleteMany({});
  await prisma.newsArticle.deleteMany({});
  await prisma.reserveProfile.deleteMany({});
  await prisma.openDataDocument.deleteMany({});
  await prisma.visitorGuideSection.deleteMany({});
  await prisma.homepageSettings.deleteMany({});
  await prisma.observation.deleteMany({});
  await prisma.violation.deleteMany({});
  await prisma.survey.deleteMany({});
  await prisma.patrol.deleteMany({});
  await prisma.vessel.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.marineSpecies.deleteMany({});
  await prisma.mapLocation.deleteMany({});
  await prisma.ecoProgramReport.deleteMany({});
  await prisma.strandingCase.deleteMany({});
  await prisma.sighting.deleteMany({});
  await prisma.beachSurvey.deleteMany({});

  console.log('Cleared SQLite database.');

  // 2. Seed Users
  const user1 = await prisma.user.create({
    data: {
      id: "user_admin_01",
      employeeId: "ADMIN-01",
      name: "Ahmed Ali",
      nameAr: "أحمد علي",
      passwordHash: "hashed_admin_password",
      role: "ADMIN",
      reserveId: "reserve_ras_mohammed",
      reserve: "Ras Mohammed",
      reserveAr: "رأس محمد",
      status: "ACTIVE",
      certifications: "Advanced Dive, Rescue Diver",
      allowedSections: JSON.stringify(["dashboard", "eia", "fleet", "monitoring", "patrols", "users", "violations"])
    }
  });

  const user2 = await prisma.user.create({
    data: {
      id: "user_mon_102",
      employeeId: "MON-102",
      name: "Sarah Hassan",
      nameAr: "سارة حسن",
      passwordHash: "hashed_monitor_password",
      role: "MONITOR",
      reserveId: "reserve_wadi_el_gemal",
      reserve: "Wadi El Gemal",
      reserveAr: "وادي الجمال",
      status: "ACTIVE",
      certifications: "Open Water",
      allowedSections: JSON.stringify(["dashboard", "fleet", "monitoring", "patrols"])
    }
  });

  // 3. Seed Vessels
  const vessel1 = await prisma.vessel.create({
    data: {
      id: "vessel_amwaj_1",
      code: "V-101",
      name: "Amwaj 1",
      nameAr: "أمواج 1",
      regNumber: "RS-V-101",
      type: "PATROL",
      status: "ACTIVE",
      fuelLevel: 90,
      healthScore: 95,
      engineHours: 1240.5,
      lastService: new Date("2026-02-12")
    }
  });

  const vessel2 = await prisma.vessel.create({
    data: {
      id: "vessel_interceptor",
      code: "V-102",
      name: "Interceptor Alpha",
      nameAr: "المعترض ألفا",
      regNumber: "RS-V-102",
      type: "PATROL",
      status: "ACTIVE",
      fuelLevel: 85,
      healthScore: 92,
      engineHours: 1020.0,
      lastService: new Date("2026-03-01")
    }
  });

  const vessel3 = await prisma.vessel.create({
    data: {
      id: "vessel_explorer",
      code: "R-304",
      name: "Reef Explorer",
      nameAr: "مستكشف الشعاب",
      regNumber: "RS-R-304",
      type: "RESEARCH",
      status: "ACTIVE",
      fuelLevel: 62,
      healthScore: 88,
      engineHours: 890.0,
      lastService: new Date("2026-04-15")
    }
  });

  // 4. Seed Patrols
  await prisma.patrol.create({
    data: {
      id: "patrol_01",
      code: "PAT-2026-001",
      zone: "Ras Mohammed South",
      zoneAr: "رأس محمد جنوب",
      status: "COMPLETED",
      vesselId: "vessel_amwaj_1",
      areaCovered: 120.5,
      duration: 4.5,
      weather: "Sunny",
      observations: "Large school of dolphins sighted near the north reef.",
      startTime: new Date(),
      endTime: new Date(),
      routeCoordinates: JSON.stringify([
        { lat: 27.7128, lng: 34.2131 },
        { lat: 27.7200, lng: 34.2200 }
      ]),
      incidentsReported: 1,
      members: {
        connect: [{ id: "user_admin_01" }, { id: "user_mon_102" }]
      }
    }
  });

  // 5. Seed Violations
  await prisma.violation.create({
    data: {
      id: "violation_01",
      code: "VIO-2026-110",
      officerId: "user_admin_01",
      locationLat: 27.7128,
      locationLng: 34.2131,
      types: "Illegal Fishing, Speeding",
      typeAr: "صيد غير قانوني، سرعة زائدة",
      severity: "HIGH",
      violatorName: "Al-Jareh Vessel",
      vesselName: "Al-Jareh",
      actionTaken: "Confiscated gear and issued fine",
      fineAmount: 5000,
      status: "INVESTIGATING",
      location: "Sector 4 - Protected",
      locationAr: "القطاع 4 - محمي",
      description: "Detected unauthorized vessel engaged in fishing activities inside the marine reserve boundary."
    }
  });

  // 6. Seed Observations
  await prisma.observation.create({
    data: {
      id: "obs_01",
      code: "OBS-2026-001",
      type: "CORAL",
      location: "North Reef Sector",
      locationAr: "قطاع الشعاب المرجانية الشمالي",
      observerId: "user_mon_102",
      observerName: "Sarah Hassan",
      date: new Date(),
      status: "VERIFIED",
      score: 85,
      indicators: JSON.stringify([
        { name: "Bleaching", nameAr: "ابيضاض", value: 12 },
        { name: "Density", nameAr: "الكثافة", value: 78 }
      ])
    }
  });

  await prisma.observation.create({
    data: {
      id: "obs_02",
      code: "OBS-2026-002",
      type: "THREAT",
      location: "Blue Hole Vicinity",
      locationAr: "محيط الثقب الأزرق",
      observerId: "user_mon_102",
      observerName: "Sarah Hassan",
      date: new Date(),
      status: "PENDING",
      score: 92,
      indicators: JSON.stringify([
        { name: "Debris", nameAr: "حطام", value: 45 }
      ])
    }
  });

  // 7. Seed News
  await prisma.newsArticle.create({
    data: {
      id: "news_01",
      title: "New Marine Protection Regulation Issued",
      titleAr: "إصدار لوائح جديدة لحماية البيئة البحرية",
      content: "<p>Strict rules are now in place for vessel speeds in Ras Mohammed reserve.</p>",
      contentAr: "<p>تم فرض قواعد صارمة بشأن سرعات القوارب في محمية رأس محمد.</p>",
      category: "REGULATION",
      date: new Date(),
      authorId: "user_admin_01",
      authorName: "Ahmed Ali",
      status: "PUBLISHED"
    }
  });

  // 8. Seed Reserves
  await prisma.reserveProfile.create({
    data: {
      id: "reserve_northern_islands",
      name: "Northern Islands Protectorate",
      nameAr: "محمية الجزر الشمالية",
      description: "A pristine archipelago serving as a critical sanctuary for marine turtles and migratory birds in the northern Red Sea. Highly restricted zones safeguard nesting grounds.",
      descriptionAr: "أرخبيل بكر يعد ملاذاً حرجاً للسلاحف البحرية والطيور المهاجرة في شمال البحر الأحمر. مناطق محظورة تماماً لحماية مواقع التعشيش.",
      location: "Hurghada & Northern Islands",
      locationAr: "الغردقة والجزر الشمالية",
      area: 3500,
      establishedYear: 2006,
      status: "OPEN",
      coords: "27.2288° N, 33.8541° E",
      speciesCount: 750,
      healthIndex: 9.7,
      statusAr: "محمية ذات أولوية قصوى",
      imageUrl: "/red_sea_hero_aerial_1774790601114.png",
      activities: "Scuba Diving, Bird Watching, Wildlife Photography, Sailing",
      activitiesAr: "الغوص السطحي، رصد الطيور البحرية، التصوير الفوتوغرافي للحياة البرية، الإبحار الشراعي",
      rules: "No anchoring on reefs, No single-use plastics allowed, Maximum speed 8 knots near nesting islands",
      rulesAr: "يمنع ربط القوارب بالشعاب المرجانية، يُحظر تماماً حمل البلاستيك أحادي الاستخدام، السرعة القصوى 8 عقد قرب جزر التعشيش",
      ticketPrice: "Egyptian: 50 EGP | Foreigner: $10 USD",
      ticketPriceAr: "المصريين: 50 ج.م | الأجانب: 10 دولار أمريكي",
      famousSpecies: "Green Sea Turtle, Sooty Falcon, Spinner Dolphin, Hawksbill Turtle",
      famousSpeciesAr: "السلحفاة الخضراء، الصقر الأسحم، الدلفين الدوار، السلحفاة صقرية المنقار",
      gallery: JSON.stringify([
        { src: "/red_sea_hero_aerial_1774790601114.png", caption: "Stunning aerial view of the Northern Islands protectorate", captionAr: "منظر جوي ساحر لأرخبيل الجزر الشمالية المحمية" },
        { src: "/sea_turtle_close_up_1774790619989.png", caption: "Green sea turtle nesting on sandy beaches of the archipelago", captionAr: "سلحفاة خضراء معششة على الشواطئ الرملية للجزر" },
        { src: "/red_sea_sunset_mountains_1774790636632.png", caption: "Sunset hues over the pristine coastal lagoons", captionAr: "ألوان الغروب الساحرة على البحيرات الساحلية البكر" }
      ])
    }
  });

  await prisma.reserveProfile.create({
    data: {
      id: "reserve_wadi_el_gemal",
      name: "Wadi El Gemal National Park",
      nameAr: "محمية وادي الجمال",
      description: "A vast expanse of coastal lagoons, mangroves, and desert peaks. Home to the legendary ancient emerald mines and critical dugong populations.",
      descriptionAr: "مساحات شاسعة من البحيرات الساحلية والمنجروف والقمم الجبلية. موطن لمناجم الزمرد التاريخية ومجتمعات الأطوم النادرة.",
      location: "Marsa Alam Sector",
      locationAr: "قطاع مرسى علم",
      area: 4770,
      establishedYear: 2003,
      status: "OPEN",
      coords: "24.6644° N, 35.0886° E",
      speciesCount: 650,
      healthIndex: 9.4,
      statusAr: "محمية طبيعية ووطنية",
      imageUrl: "/wadi_el_gemal_mangroves_aerial_1774861445577.png",
      activities: "Snorkeling with Dugongs, Mangrove Walk, Emerald Mine Tours, Camel Riding",
      activitiesAr: "السباحة مع الأطوم (عروس البحر)، المسير البيئي بالمنجروف، جولات مناجم الزمرد الأثرية، ركوب الجمال شاطئياً",
      rules: "Do not touch or approach dugongs closer than 5 meters, Use reef-safe sunscreen, No littering",
      rulesAr: "يمنع منعاً باتاً لمس أو الاقتراب من حيوان الأطوم لمسافة تقل عن 5 أمتار، استخدام واقي شمس صديق للبيئة، التخلص الآمن من النفايات",
      ticketPrice: "Egyptian: 40 EGP | Foreigner: $8 USD",
      ticketPriceAr: "المصريين: 40 ج.م | الأجانب: 8 دولار أمريكي",
      famousSpecies: "Dugong (Sea Cow), Green Turtle, Osprey, Ibex",
      famousSpeciesAr: "الأطوم (عروس البحر)، السلحفاة الخضراء، العقاب النساري، الوعل النوبي",
      gallery: JSON.stringify([
        { src: "/wadi_el_gemal_mangroves_aerial_1774861445577.png", caption: "Dense and vibrant coastal mangrove forests", captionAr: "غابات المنجروف الكثيفة والحيوية على طول الساحل" },
        { src: "/sea_turtle_close_up_1774790619989.png", caption: "Endangered hawksbill sea turtle swimming near the shallow reefs", captionAr: "سلحفاة صقرية المنقار المهددة بالانقراض تسبح قرب الشعاب" },
        { src: "/marsa_alam_dugong_underwater_1774861424689.png", caption: "Rare Dugong grazing peacefully in shallow seagrass meadows", captionAr: "عروس البحر (الأطوم) يتغذى بسلام في مراعي أعشاب البحر" }
      ])
    }
  });

  await prisma.reserveProfile.create({
    data: {
      id: "reserve_gebel_elba",
      name: "Gebel Elba Biosphere",
      nameAr: "محمية جبل علبة",
      description: "An unparalleled mist oasis in the desert offering unique biodiversity, rich flora, and a meeting point of distinct Afro-Asian ecosystems.",
      descriptionAr: "واحة ضبابية فريدة في الصحراء توفر تنوعاً بيولوجياً نادراً ونباتات غنية، وتعتبر نقطة التقاء لنظم بيئية متميزة.",
      location: "Halaib Triangle",
      locationAr: "مثلث حلايب",
      area: 35600,
      establishedYear: 1986,
      status: "RESTRICTED",
      coords: "22.1833° N, 36.3333° E",
      speciesCount: 920,
      healthIndex: 9.8,
      statusAr: "محمية محيط حيوي",
      imageUrl: "/red_sea_sunset_mountains_1774790636632.png",
      activities: "Eco-Hiking, Bird Watching, Cultural Heritage Tours, Botanist Exploration",
      activitiesAr: "المسير الجبلي البيئي، رصد الطيور النادرة، جولات التراث الثقافي المحلي، استكشاف النباتات البرية",
      rules: "Prior military/governmental permit required, Mooring/camping only in designated sectors, No fire building",
      rulesAr: "يتطلب الحصول على تصريح أمني وحكومي مسبق، التخييم والمبيت في القطاعات المحددة فقط، يُمنع إشعال النيران في المناطق المفتوحة",
      ticketPrice: "Egyptian: 100 EGP | Foreigner: $25 USD",
      ticketPriceAr: "المصريين: 100 ج.م | الأجانب: 25 دولار أمريكي",
      famousSpecies: "Aoudad (Barbary Sheep), Dragon Blood Tree, Nubian Wild Ass, Egyptian Vulture",
      famousSpeciesAr: "الأروي (الكبش البري)، شجرة دم الأخوين، الحمار البري النوبي، الرخمة المصرية",
      gallery: JSON.stringify([
        { src: "/red_sea_sunset_mountains_1774790636632.png", caption: "Mist-shrouded green peaks of the Elba biosphere reserve", captionAr: "القمم الخضراء المغطاة بالضباب في محمية جبل علبة" },
        { src: "/red_sea_hero_aerial_1774790601114.png", caption: "Diverse terrestrial and coastal boundary tracks", captionAr: "المسارات البرية والساحلية المتنوعة في قطاع المحمية" },
        { src: "/sea_turtle_close_up_1774790619989.png", caption: "Unique biodiversity records along the mountain foothills", captionAr: "رصد فريد للتنوع البيولوجي على طول سفوح الجبال" }
      ])
    }
  });

  await prisma.reserveProfile.create({
    data: {
      id: "reserve_coral_reef",
      name: "Coral Reef Protectorate",
      nameAr: "محمية الحيد المرجاني",
      description: "Vibrant, resilient, and extensive coral reef systems providing critical habitat for diverse marine life and world-class diving expeditions.",
      descriptionAr: "أنظمة شعاب مرجانية نابضة بالحياة وممتدة توفر موائل حرجة للحياة البحرية المتنوعة وتجارب غوص عالمية.",
      location: "Brother Islands Sector",
      locationAr: "قطاع جزر الأخوة",
      area: 1200,
      establishedYear: 1998,
      status: "OPEN",
      coords: "25.3131° N, 34.8569° E",
      speciesCount: 1100,
      healthIndex: 9.9,
      statusAr: "ملاذ بحري محمي",
      imageUrl: "/brother_islands_reef_wall_1774861464852.png",
      activities: "Deep Wall Diving, Shark Expeditions, Wreck Diving, Marine Biology Seminars",
      activitiesAr: "غوص الحوائط العميقة، رحلات رصد القروش، غوص السفن الغارقة، ندوات الأحياء البحرية الميدانية",
      rules: "Dive computer mandatory for every diver, Night diving strictly prohibited, No touching reef structures",
      rulesAr: "كمبيوتر الغوص إلزامي لكل غواص، يُمنع منعاً باتاً الغوص الليلي، يحظر لمس أو الوقوف على هياكل المرجان",
      ticketPrice: "Egyptian: 80 EGP | Foreigner: $15 USD",
      ticketPriceAr: "المصريين: 80 ج.م | الأجانب: 15 دولار أمريكي",
      famousSpecies: "Hammerhead Shark, Oceanic Whitetip Shark, Manta Ray, Napoleon Wrasse",
      famousSpeciesAr: "قرش المطرقة، القرش المحيطي ذو الطرف الأبيض، سمكة مانتا، سمكة النابليون",
      gallery: JSON.stringify([
        { src: "/brother_islands_reef_wall_1774861464852.png", caption: "Spectacular vertical coral walls at the Brother Islands", captionAr: "حوائط مرجانية عمودية مذهلة في أعماق جزر الأخوة" },
        { src: "/marsa_alam_dugong_underwater_1774861424689.png", caption: "Bustling reef environment hosting schools of pelagic fish", captionAr: "بيئة الشعاب المرجانية النابضة بالحياة تجمع قروش وأسماك البحر" },
        { src: "/sea_turtle_close_up_1774790619989.png", caption: "Hawksbill sea turtle grazing on marine sponges", captionAr: "سلحفاة صقرية المنقار تتغذى على الإسفنج البحري في الأعماق" }
      ])
    }
  });

  // 9. Seed Opendata
  await prisma.openDataDocument.create({
    data: {
      id: "doc_01",
      title: "Annual Red Sea Coral Reef Survey Report 2025",
      titleAr: "تقرير مسح الشعاب المرجانية السنوي بالبحر الأحمر 2025",
      type: "REPORT",
      fileUrl: "/uploads/annual_survey_2025.pdf",
      fileSize: 4521092,
      uploadDate: new Date(),
      uploaderId: "user_admin_01",
      status: "PUBLIC"
    }
  });

  // 10. Seed Visitor Guide
  await prisma.visitorGuideSection.create({
    data: {
      id: "guide_01",
      title: "Mission Planning",
      titleAr: "تخطيط الزيارة الاستراتيجي",
      content: "Obtain proper permits from the Ministry of Environment before entering protected sectors. Dynamic zones have specific seasonal access regulations. The best diving window is between October and April when visibility exceeds 30m and temperatures are mild (22°C - 28°C).",
      contentAr: "احصل على التصاريح المناسبة من وزارة البيئة قبل دخول القطاعات المحمية. تخضع المناطق الحركية للوائح وصول موسمية محددة. أفضل وقت للغوص هو بين أكتوبر وأبريل عندما تتجاوز الرؤية 30 متراً وتكون درجات الحرارة معتدلة (22-28 درجة مئوية).",
      order: 1,
      links: JSON.stringify([
        { n: 'Permit Application', nAr: 'طلب تصريح زيارة' },
        { n: 'Seasonal Intelligence', nAr: 'البيانات الموسمية' }
      ])
    }
  });

  await prisma.visitorGuideSection.create({
    data: {
      id: "guide_02",
      title: "Code of Engagement",
      titleAr: "قواعد السلوك الميداني",
      content: "Adhere to zero-impact diving protocols. Keep a minimum of 2 meters distance from all marine life. Do not touch, harvest, or step on any coral structures. Wearing gloves is prohibited without special research authorization to discourage grabbing reefs.",
      contentAr: "التزم ببروتوكولات الغوص منعدمة الأثر البيئي. حافظ على مسافة لا تقل عن مترين من جميع الكائنات البحرية. يمنع منعاً باتاً لمس أو جمع أو الوقوف على الهياكل المرجانية. يحظر ارتداء القفازات بدون تصريح بحثي خاص لمنع التمسك بالشعاب.",
      order: 2,
      links: JSON.stringify([
        { n: 'Marine Etiquette', nAr: 'آداب التعامل مع البحر' },
        { n: 'Security Protocol', nAr: 'البروتوكول الأمني' }
      ])
    }
  });

  await prisma.visitorGuideSection.create({
    data: {
      id: "guide_03",
      title: "Field Equipment",
      titleAr: "المعدات الميدانية",
      content: "Ensure you carry an SMB (Surface Marker Buoy) and a dive computer. Only use reef-safe, biodegradable sunscreens. Single-use plastics, harpoons, spears, and collecting bags are strictly prohibited onboard any vessel entering the reserves.",
      contentAr: "تأكد من حمل عوامة الإشارة السطحية (SMB) وكمبيوتر الغوص. استخدم فقط واقيات الشمس الآمنة للشعاب المرجانية والقابلة للتحلل الحيوي. يمنع منعاً باتاً حمل البلاستيك أحادي الاستخدام، الحراب، السهام، أو حقائب الجمع على متن أي قارب يدخل المحميات.",
      order: 3,
      links: JSON.stringify([
        { n: 'Equipment Checklist', nAr: 'قائمة مراجعة المعدات' },
        { n: 'Prohibited Gear', nAr: 'المعدات المحظورة' }
      ])
    }
  });

  // 10b. Seed Marine Species
  await prisma.marineSpecies.create({
    data: {
      id: "species_dugong",
      name: "Dugong (Sea Cow)",
      nameAr: "الأطوم (عروس البحر)",
      type: "Protected Mammal",
      typeAr: "ثدييات محمية",
      imageUrl: "/marsa_alam_dugong_underwater_1774861424689.png",
      status: "Vulnerable",
      statusAr: "مهدد بالانقراض (هش)",
      description: "Dugongs are gentle herbivorous marine mammals that rely entirely on shallow seagrass beds for food. They can grow up to 3 meters in length and live for over 70 years. In Egypt, they are critically protected and commonly sighted in the bays of Marsa Alam (like Abu Dabbab).",
      descriptionAr: "الأطوم هو حيوان ثديي بحري عاشب لطيف يعتمد كلياً على أعشاب البحر الضحلة للغذاء. يمكن أن ينمو طوله إلى 3 أمتار ويعيش لأكثر من 70 عاماً. في مصر، يحظى بحماية صارمة ويُرى بشكل شائع في خلجان مرسى علم (مثل أبو دباب)."
    }
  });

  await prisma.marineSpecies.create({
    data: {
      id: "species_green_turtle",
      name: "Green Sea Turtle",
      nameAr: "السلحفاة البحرية الخضراء",
      type: "Nesting Reptile",
      typeAr: "زواحف معششة",
      imageUrl: "/sea_turtle_close_up_1774790619989.png",
      status: "Endangered",
      statusAr: "مهدد بالانقراض",
      description: "Named for the green color of its fat, this large sea turtle nesting extensively on Red Sea islands (such as Zabargad and Giftun). Green turtles play a vital role in keeping seagrass beds healthy by grazing on them, promoting new growth.",
      descriptionAr: "سميت بهذا الاسم نسبة للون الأخضر لدهونها، وتعشش هذه السلحفاة البحرية الكبيرة بكثافة في جزر البحر الأحمر (مثل زبرجد وجفتون). تلعب السلاحف الخضراء دوراً حيوياً في الحفاظ على صحة مراعي أعشاب البحر عن طريق رعيها، مما يحفز نموها الجديد."
    }
  });

  await prisma.marineSpecies.create({
    data: {
      id: "species_hawksbill_turtle",
      name: "Hawksbill Sea Turtle",
      nameAr: "السلحفاة صقرية المنقار",
      type: "Reef Reptile",
      typeAr: "زواحف الشعاب المرجانية",
      imageUrl: "/sea_turtle_close_up_1774790619989.png",
      status: "Critically Endangered",
      statusAr: "مهدد بالانقراض بشدة",
      description: "Easily distinguished by its sharp, hawk-like beak, this turtle feeds almost exclusively on marine sponges found on coral reefs. By consuming sponges, they prevent them from outcompeting corals for space, helping maintain reef diversity.",
      descriptionAr: "يمكن تمييزها بسهولة بمنقارها الحاد الذي يشبه منقار الصقر، وتتغذى هذه السلحفاة بشكل شبه حصري على الإسفنج البحري الموجود في الشعاب المرجانية. يساهم تناولها للإسفنج في حماية الشعاب من هيمنة الإسفنج على المساحة المتاحة للمرجان."
    }
  });

  await prisma.marineSpecies.create({
    data: {
      id: "species_whale_shark",
      name: "Whale Shark",
      nameAr: "القرش الحوت (البهلوان)",
      type: "Migratory Fish",
      typeAr: "أسماك مهاجرة",
      imageUrl: "/marsa_alam_dugong_underwater_1774861424689.png",
      status: "Endangered",
      statusAr: "مهدد بالانقراض",
      description: "The largest fish in the ocean, growing up to 18 meters. Despite their size, they are harmless filter feeders, consuming plankton and small fish. They visit the northern Red Sea seasonally (spring and early summer), often near Hurghada and Sharm El-Sheikh.",
      descriptionAr: "أكبر سمكة في المحيط، ينمو طولها إلى 18 متراً. على الرغم من حجمها الضخم، إلا أنها تتغذى بالترشيح وغير ضارة للبشر، حيث تقتات على العوالق والأسماك الصغيرة. تزور شمال البحر الأحمر موسمياً في الربيع وأوائل الصيف."
    }
  });

  await prisma.marineSpecies.create({
    data: {
      id: "species_napoleon_wrasse",
      name: "Humphead Napoleon Wrasse",
      nameAr: "سمكة النابليون (المطرقة)",
      type: "Reef Giant",
      typeAr: "أسماك الشعاب العملاقة",
      imageUrl: "/sea_turtle_close_up_1774790619989.png",
      status: "Endangered",
      statusAr: "مهدد بالانقراض",
      description: "Recognized by the large hump on its forehead and thick, fleshy lips. These massive fish can live up to 30 years and are crucial for reef health as they consume toxic animals like crown-of-thorns starfish and box jellyfish.",
      descriptionAr: "تتميز بحدبة كبيرة على جبهتها وشفاه سميكة لحمية. يمكن لهذه الأسماك الضخمة أن تعيش حتى 30 عاماً، وهي مهمة جداً لصحة المرجان حيث تتغذى على كائنات سامة مثل نجم البحر ذو الأشواك وقناديل البحر الصندوقية."
    }
  });

  // 10c. Seed Map Locations
  await prisma.mapLocation.create({
    data: {
      id: "loc_blue_hole",
      name: "Dahab Blue Hole",
      nameAr: "ثقب دهب الأزرق",
      latitude: 28.5721,
      longitude: 34.5368,
      type: "DIVE_SITE",
      typeAr: "موقع غوص",
      status: "ACTIVE",
      statusAr: "نشط",
      description: "A famous submarine sinkhole plunging over 100 meters deep just meters from the shore. Renowned for its stunning deep blue water, pristine corals, and challenging arch, it attracts divers from all over the world.",
      descriptionAr: "ثقب بحري شهير يصل عمقه إلى أكثر من 100 متر على بعد أمتار قليلة من الشاطئ. يشتهر بمياهه الزرقاء الداكنة الكريستالية، وشعابه العذراء، وقوسه العميق المثير للتحدي، مما يجعله وجهة للغواصين عالمياً.",
      imageUrl: "/red_sea_hero_aerial_1774790601114.png"
    }
  });

  await prisma.mapLocation.create({
    data: {
      id: "loc_shark_reef",
      name: "Shark & Yolanda Reef",
      nameAr: "شعب القرش ويولاندا",
      latitude: 27.7288,
      longitude: 34.2564,
      type: "PROTECTED_ZONE",
      typeAr: "منطقة محمية نشطة",
      status: "RESTRICTED",
      statusAr: "خاضع لقيود بيئية",
      description: "Located at the southern tip of Ras Mohammed National Park, this site features two twin reef peaks rising from vertical walls. Yolanda is named after a merchant ship wreck containing bathroom porcelain that sank in 1980.",
      descriptionAr: "يقع في الطرف الجنوبي لمحمية رأس محمد الوطنية، ويتميز بقمم مرجانية توأم ترتفع من جدران رأسية سحيقة العمق. سميت يولاندا بهذا الاسم بعد شحط سفينة شحن تجارية غرقت عام 1980 وكانت تحمل حمولة من البورسلين.",
      imageUrl: "/red_sea_hero_aerial_1774790601114.png"
    }
  });

  await prisma.mapLocation.create({
    data: {
      id: "loc_abu_dabbab",
      name: "Abu Dabbab Bay",
      nameAr: "خليج أبو دباب",
      latitude: 25.3375,
      longitude: 34.7369,
      type: "NATURE_RESERVE",
      typeAr: "محمية طبيعية وشاطئية",
      status: "ACTIVE",
      statusAr: "نشط",
      description: "A world-famous bay in Marsa Alam with shallow seagrass meadows that serve as the main feeding grounds for vulnerable dugongs and large green sea turtles. Boating speed limits are strictly enforced inside the bay.",
      descriptionAr: "خليج شهير عالمياً في مرسى علم يتميز بمراعي أعشاب بحرية ضحلة تعمل كموقع رئيسي لتغذية الأطوم المهدد بالانقراض والسلاحف الخضراء الضخمة. تفرض قيود صارمة على سرعات القوارب داخل الخليج.",
      imageUrl: "/red_sea_hero_aerial_1774790601114.png"
    }
  });

  await prisma.mapLocation.create({
    data: {
      id: "loc_elphinstone",
      name: "Elphinstone Reef",
      nameAr: "شعب الفنستون",
      latitude: 25.3111,
      longitude: 34.8633,
      type: "DIVE_SITE",
      typeAr: "موقع غوص مفتوح",
      status: "ACTIVE",
      statusAr: "نشط",
      description: "A finger-shaped reef located 12km offshore in Marsa Alam. Famous for its strong currents, deep drop-offs over 100m, and frequent encounters with pelagic fish, hammerheads, and oceanic whitetip sharks.",
      descriptionAr: "شعب مرجاني مستطيل الشكل يقع على بعد 12 كم من الشاطئ في مرسى علم. يشتهر بتياراته القوية، ومنحدراته العميقة التي تتجاوز 100 متر، واللقاءات المتكررة مع أسماك القرش المحيطية ذات الطرف الأبيض والقرش المطرقة.",
      imageUrl: "/red_sea_hero_aerial_1774790601114.png"
    }
  });

  await prisma.mapLocation.create({
    data: {
      id: "loc_giftun",
      name: "Giftun Island National Park",
      nameAr: "جزر الجفتون الوطنية",
      latitude: 27.2333,
      longitude: 33.9333,
      type: "NATURE_RESERVE",
      typeAr: "محمية جزر طبيعية",
      status: "ACTIVE",
      statusAr: "نشط",
      description: "The first nature reserve in Hurghada, boasting gorgeous white sandy beaches, shallow crystal lagoons, and key nesting grounds for endangered hawksbill turtles and marine birds.",
      descriptionAr: "أول محمية طبيعية في الغردقة، تضم شواطئ رملية بيضاء رائعة، وبحيرات ضحلة كريستالية، ومواقع تعشيش هامة للطيور البحرية وسلحفاة صقرية المنقار المهددة بالانقراض.",
      imageUrl: "/red_sea_hero_aerial_1774790601114.png"
    }
  });

  // 11. Seed Homepage Settings
  await prisma.homepageSettings.create({
    data: {
      id: "home-config",
      heroTitle: "Protecting the Red Sea Treasures",
      heroTitleAr: "حماية كنوز البحر الأحمر",
      heroSubtitle: "Real-time monitoring and environmental impact management",
      heroSubtitleAr: "مراقبة فورية وإدارة الأثر البيئي",
      announcements: JSON.stringify([
        { id: "ann-01", text: "New patrol vessels added to fleet.", textAr: "تم إضافة زوارق دورية جديدة للأسطول.", active: true }
      ])
    }
  });

  // 12. Seed EIA Specific
  await prisma.eiaCost.create({
    data: {
      id: "eia_cost_01",
      subject: "تقييم الأثر البيئي لمشروع امتداد مارينا الجونة",
      details: "مراجعة تقرير الأثر البيئي الخاص بتوسعة مارينا اليخوت في الجونة، والتحقق من حواجز الأمواج وحماية الشعاب.",
      date: new Date("2026-05-10"),
      status: "ANSWERED",
      createdBy: "مصطفى لايق"
    }
  });

  await prisma.eiaInspection.create({
    data: {
      id: "eia_insp_01",
      locationName: "موقع مرسى أبو دباب - مرسى علم",
      latitude: 25.3375,
      longitude: 34.7369,
      date: new Date("2026-04-12"),
      inspectorName: "د. أحمد علي",
      studyFileUrl: "/uploads/eia_study_dabab.pdf",
      reportFileUrl: "/uploads/final_response_dabab.pdf",
      createdBy: "مصطفى لايق"
    }
  });

  await prisma.eiaViolation.create({
    data: {
      id: "eia_viol_01",
      type: "ردم وتغير في حرم الشاطئ",
      date: new Date("2026-05-05"),
      locationName: "المنطقة الشمالية - الغردقة",
      latitude: 27.3155,
      longitude: 33.7852,
      entityType: "PROJECT",
      entityName: "شركة إعمار البحر الأحمر للتطوير العقاري",
      createdBy: "مصطفى لايق"
    }
  });

  await prisma.eiaAccident.create({
    data: {
      id: "eia_acc_01",
      type: "حوادث شحط أو ربط على الشعاب",
      locationName: "شعاب ريجنسي - شرم الشيخ",
      latitude: 27.9152,
      longitude: 34.3541,
      date: new Date("2026-04-20"),
      description: "شحط يخت سياحي (بلو لايت) على الشعاب المرجانية السطحية، مما أدى لتدمير مساحة 50 متر مربع من الشعاب.",
      reportFileUrl: "/uploads/technical_report_bluelight.pdf",
      createdBy: "مصطفى لايق"
    }
  });

  // Seed EcoProgramReports
  await prisma.ecoProgramReport.create({
    data: {
      id: "eco_program_01",
      program: "MANGROVE",
      subType: null,
      date: new Date(),
      location: "Wadi El Gemal Mangroves",
      locationAr: "شجر المانجروف بوادي الجمال",
      latitude: 25.1234,
      longitude: 34.8234,
      observerName: "Sarah Hassan",
      details: "Healthy mangrove seedlings and high density of juvenile marine creatures observed.",
      attachedFileUrl: "/uploads/mangrove_report_2026.pdf"
    }
  });

  await prisma.ecoProgramReport.create({
    data: {
      id: "eco_program_02",
      program: "MARINE_CREATURES",
      subType: "DOLPHIN",
      date: new Date(),
      location: "Samadai Reef (Dolphin House)",
      locationAr: "شعب صمداي (بيت الدلافين)",
      latitude: 25.0123,
      longitude: 34.9789,
      observerName: "Ahmed Ali",
      details: "Observed a pod of 25 spinner dolphins including 3 calves.",
      attachedFileUrl: "/uploads/spinner_dolphins.png"
    }
  });

  // Seed StrandingCases
  await prisma.strandingCase.create({
    data: {
      id: "stranding_01",
      date: new Date(),
      location: "Abu Dabbab Coast",
      locationAr: "ساحل أبو دباب",
      latitude: 25.3375,
      longitude: 34.7369,
      status: "ALIVE",
      species: "Green Sea Turtle",
      speciesAr: "السلحفاة الخضراء",
      attachedFileUrl: "/uploads/turtle_rescue.jpg",
      description: "Juvenile green turtle found entangled in discarded fishing nets. Extricated safely and released after health assessment."
    }
  });

  await prisma.strandingCase.create({
    data: {
      id: "stranding_02",
      date: new Date(),
      location: "Elphinstone Offshore",
      locationAr: "محيط شعب الفنستون",
      latitude: 25.3111,
      longitude: 34.8633,
      status: "DEAD",
      species: "Dugong",
      speciesAr: "الأطوم (عروس البحر)",
      attachedFileUrl: "/uploads/dugong_stranding.jpg",
      description: "Adult female dugong washed ashore with propeller wounds on her back. Tissue samples taken for analysis."
    }
  });

  // Seed Sightings
  await prisma.sighting.create({
    data: {
      id: "sighting_01",
      date: new Date(),
      location: "Marsa Alam Bay",
      locationAr: "خليج مرسى علم",
      latitude: 25.0645,
      longitude: 34.8921,
      species: "Whale Shark",
      speciesAr: "القرش الحوت",
      count: 1,
      notes: "Large whale shark (~7m) cruising slowly near the surface. Gentle interaction observed with local divers.",
      observerName: "Sarah Hassan"
    }
  });

  await prisma.sighting.create({
    data: {
      id: "sighting_02",
      date: new Date(),
      location: "Giftun Shallow Lagoon",
      locationAr: "بحيرة الجفتون الضحلة",
      latitude: 27.2333,
      longitude: 34.0123,
      species: "Hawksbill Sea Turtle",
      speciesAr: "السلحفاة صقرية المنقار",
      count: 3,
      notes: "Three juvenile hawksbills feeding on sponges along the reef wall.",
      observerName: "Sarah Hassan"
    }
  });

  // Seed BeachSurveys
  await prisma.beachSurvey.create({
    data: {
      id: "beach_survey_01",
      date: new Date(),
      location: "Wadi El Gemal Beach",
      locationAr: "شاطئ وادي الجمال",
      latitude: 25.0123,
      longitude: 34.8567,
      attachedFileUrl: "/uploads/beach_debris_survey.pdf",
      description: "Systematic beach survey covered 1km of sandy shore. High level of microplastics found near high tide line. Clean-up scheduled."
    }
  });

  await prisma.beachSurvey.create({
    data: {
      id: "beach_survey_02",
      date: new Date(),
      location: "Hamata Mangrove Coast",
      locationAr: "ساحل أشجار حماطة",
      latitude: 25.2123,
      longitude: 34.9123,
      attachedFileUrl: "/uploads/hamata_mangrove_survey.pdf",
      description: "Surveyed nesting areas for migratory marine birds. Checked 15 active nests. No direct human disturbance reported."
    }
  });

  console.log('Seeding SQLite database completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
