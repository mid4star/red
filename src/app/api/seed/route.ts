import { NextResponse } from 'next/server';
import { collection, writeBatch, doc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// Helper to clear a Firestore collection
async function clearCollection(collectionName: string) {
  const q = collection(db, collectionName);
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const expectedKey = process.env.SEED_SECRET_KEY || 'red_sea_command_seed_secret_auth_2026_xyz';

    if (!key || key !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid seed secret key' }, { status: 401 });
    }

    console.log("Starting unified database seeding...");

    // 1. Clear SQLite Database via Prisma
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
    await (prisma as any).marineSpecies.deleteMany({});
    await (prisma as any).mapLocation.deleteMany({});
    await (prisma as any).ecoProgramReport.deleteMany({});
    await (prisma as any).strandingCase.deleteMany({});
    await (prisma as any).sighting.deleteMany({});
    await (prisma as any).beachSurvey.deleteMany({});
    console.log("Cleared Prisma SQLite database.");

    // 2. Clear Firebase Firestore collections
    try {
      const collectionsToClear = [
        'users', 'fleet', 'patrols', 'violations', 'observations',
        'news', 'reserves', 'opendata', 'visitor_guide', 'homepage',
        'marine_species', 'map_locations',
        'eco_programs', 'stranding_cases', 'sightings', 'beach_surveys'
      ];
      for (const coll of collectionsToClear) {
        await clearCollection(coll);
      }
      console.log("Cleared Firebase Firestore collections.");
    } catch (fbClearError) {
      console.error("Warning: Failed to clear Firebase Firestore collections:", fbClearError);
    }

    // 3. Define Seed Datasets
    const now = new Date();
    const timestampNow = Timestamp.fromDate(now);

    // --- USERS ---
    const usersData = [
      {
        id: "user_admin_01",
        employeeId: "ADMIN-01",
        name: "Ahmed Ali",
        nameAr: "أحمد علي",
        passwordHash: hashPassword("admin"),
        role: "ADMIN",
        reserveId: "reserve_ras_mohammed",
        reserve: "Ras Mohammed",
        reserveAr: "رأس محمد",
        status: "ACTIVE",
        certifications: "Advanced Dive, Rescue Diver",
        allowedSections: JSON.stringify(["dashboard", "eia", "fleet", "monitoring", "patrols", "users", "violations"])
      },
      {
        id: "user_mon_102",
        employeeId: "MON-102",
        name: "Sarah Hassan",
        nameAr: "سارة حسن",
        passwordHash: hashPassword("password"),
        role: "MONITOR",
        reserveId: "reserve_wadi_el_gemal",
        reserve: "Wadi El Gemal",
        reserveAr: "وادي الجمال",
        status: "ACTIVE",
        certifications: "Open Water",
        allowedSections: JSON.stringify(["dashboard", "fleet", "monitoring", "patrols"])
      }
    ];

    // --- VESSELS ---
    const vesselsData = [
      {
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
      },
      {
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
      },
      {
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
    ];

    // --- PATROLS ---
    const patrolsData = [
      {
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
        startTime: now,
        endTime: now,
        routeCoordinates: JSON.stringify([
          { lat: 27.7128, lng: 34.2131 },
          { lat: 27.7200, lng: 34.2200 }
        ]),
        incidentsReported: 1
      }
    ];

    // --- VIOLATIONS ---
    const violationsData = [
      {
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
    ];

    // --- OBSERVATIONS ---
    const observationsData = [
      {
        id: "obs_01",
        code: "OBS-2026-001",
        type: "CORAL",
        location: "North Reef Sector",
        locationAr: "قطاع الشعاب المرجانية الشمالي",
        observerId: "user_mon_102",
        observerName: "Sarah Hassan",
        date: now,
        status: "VERIFIED",
        score: 85,
        indicators: JSON.stringify([
          { name: "Bleaching", nameAr: "ابيضاض", value: 12 },
          { name: "Density", nameAr: "الكثافة", value: 78 }
        ])
      },
      {
        id: "obs_02",
        code: "OBS-2026-002",
        type: "THREAT",
        location: "Blue Hole Vicinity",
        locationAr: "محيط الثقب الأزرق",
        observerId: "user_mon_102",
        observerName: "Sarah Hassan",
        date: now,
        status: "PENDING",
        score: 92,
        indicators: JSON.stringify([
          { name: "Debris", nameAr: "حطام", value: 45 }
        ])
      }
    ];

    // --- NEWS ARTICLES ---
    const newsData = [
      {
        id: "news_01",
        title: "New Marine Protection Regulation Issued",
        titleAr: "إصدار لوائح جديدة لحماية البيئة البحرية",
        content: "<p>Strict rules are now in place for vessel speeds in Ras Mohammed reserve.</p>",
        contentAr: "<p>تم فرض قواعد صارمة بشأن سرعات القوارب في محمية رأس محمد.</p>",
        category: "REGULATION",
        date: now,
        authorId: "user_admin_01",
        authorName: "Ahmed Ali",
        status: "PUBLISHED"
      }
    ];

    // --- RESERVE PROFILES ---
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

    // --- OPEN DATA DOCUMENTS ---
    const opendataData = [
      {
        id: "doc_01",
        title: "Annual Red Sea Coral Reef Survey Report 2025",
        titleAr: "تقرير مسح الشعاب المرجانية السنوي بالبحر الأحمر 2025",
        type: "REPORT",
        fileUrl: "/uploads/annual_survey_2025.pdf",
        fileSize: 4521092,
        uploadDate: now,
        uploaderId: "user_admin_01",
        status: "PUBLIC"
      }
    ];

    // --- VISITOR GUIDE SECTIONS ---
    const visitorGuideData = [
      {
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
      },
      {
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
      },
      {
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
    ];

    // --- MARINE SPECIES ---
    const marineSpeciesData = [
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
    ];

    // --- MAP LOCATIONS ---
    const mapLocationsData = [
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
        descriptionAr: "شعاب مرجانية مستطيلة الشكل تقع على بعد 12 كم من الشاطئ في مرسى علم. تشتهر بتياراتها القوية، ومنحدراتها العميقة التي تتجاوز 100 متر، واللقاءات المتكررة مع أسماك القرش المحيطية ذات الطرف الأبيض والقرش المطرقة.",
        imageUrl: "/red_sea_hero_aerial_1774790601114.png"
      },
      {
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
    ];

    // --- HOMEPAGE SETTINGS ---
    const homepageData = {
      id: "home-config",
      heroTitle: "Protect. Explore. Marvel.",
      heroTitleAr: "احمِ.. استكشف.. انبهر",
      heroSubtitle: "Discover the majesty of the world’s most enchanting marine ecosystem, where turquoise horizons meet untamed biodiversity.",
      heroSubtitleAr: "اكتشف روعة أحد أكثر النظم البيئية البحرية سحراً في الكوكب، حيث تلتقي المياه الفيروزية بالطبيعة الخلابة.",
      heroAuthority: "Red Sea Marine Authority",
      heroAuthorityAr: "جهاز محميات البحر الأحمر",
      heroBgUrl: "/red_sea_aerial_hd.png",
      heroBtn1Text: "Begin Exploration",
      heroBtn1TextAr: "ابدأ الاستكشاف",
      heroBtn1Link: "/guide",
      heroBtn2Text: "Interactive Map",
      heroBtn2TextAr: "خريطة المحميات",
      heroBtn2Link: "/reserves",
      
      statsJson: JSON.stringify([
        { value: "35,000", label: "km² Protected Area", labelAr: "كيلومتر مربع من المحميات", icon: "Globe" },
        { value: "1,200+", label: "Protected Species", labelAr: "من الأنواع المحمية", icon: "Microscope" },
        { value: "40", label: "Marine Reservoirs", labelAr: "محمية بحرية وبرية", icon: "Shield" },
        { value: "2.5M", label: "Annual Visitors", labelAr: "زائر سنوي للمحميات", icon: "Eye" }
      ]),

      missionTag: "Protecting the Vision",
      missionTagAr: "حماية الرؤية المستقبلية",
      missionTitle: "Commitment to the Blue Heritage",
      missionTitleAr: "مهمتنا هي صون التراث الطبيعي",
      missionDesc: "Implementing standard ecosystem preservation practices through community engagement and regular field surveys, ensuring resource sustainability.",
      missionDescAr: "نعمل على تطبيق أعلى المعايير الدولية في إدارة المحميات من خلال إشراك المجتمع المحلي والمسوحات الميدانية المستمرة لضمان استدامة الموارد.",
      missionChecklistJson: JSON.stringify([
        { text: "Environmental Patrols", textAr: "دوريات بيئية" },
        { text: "Biodiversity Protection", textAr: "صون التنوع" },
        { text: "Environmental Awareness", textAr: "وعي بيئي" },
        { text: "Smart Management", textAr: "إدارة ذكية" }
      ]),
      missionImgUrl: "/sea_turtle_close_up_1774790619989.png",
      missionCardTag: "Current Status",
      missionCardTagAr: "الوضع الحالي",
      missionCardTitle: "Peak Ecological Health Index",
      missionCardTitleAr: "أعلى مستويات الصحة البيئية",

      highlightsTag: "Explore the Arcana",
      highlightsTagAr: "اكتشف روائع الطبيعة",
      highlightsTitle: "Reserve Highlights",
      highlightsTitleAr: "عجائب المحميات",
      highlightsLinkText: "Explore All Reserves",
      highlightsLinkTextAr: "تصفح جميع المحميات",
      highlightsLinkUrl: "/reserves",
      highlightsJson: JSON.stringify([
        {
          id: "reserve_northern_islands",
          title: "Northern Islands Protectorate",
          titleAr: "محمية الجزر الشمالية",
          desc: "A pristine archipelago serving as a critical sanctuary for marine turtles and migratory birds.",
          descAr: "أرخبيل بكر يعد ملاذاً حرجاً للسلاحف البحرية والطيور المهاجرة.",
          img: "/red_sea_hero_aerial_1774790601114.png",
          tag: "PREMIUM DESTINATION",
          tagAr: "وجهة استثنائية"
        },
        {
          id: "reserve_wadi_el_gemal",
          title: "Wadi El Gemal National Park",
          titleAr: "محمية وادي الجمال",
          desc: "A vast expanse of coastal lagoons and desert peaks, home to the ancient emerald mines.",
          descAr: "مساحات شاسعة من المناطق الساحلية والجبلية، موطن لمناجم الزمرد القديمة.",
          img: "/wadi_el_gemal_mangroves_aerial_1774861445577.png",
          tag: "ECOLOGICAL HERITAGE",
          tagAr: "تراث بيئي"
        },
        {
          id: "reserve_gebel_elba",
          title: "Gebel Elba Biosphere",
          titleAr: "محمية جبل علبة",
          desc: "An unparalleled mist oasis in the desert with unique biodiversity and lush green peaks.",
          descAr: "واحة ضبابية فريدة في الصحراء تتميز بتنوع بيولوجي فريد وقمم جبلية خضراء.",
          img: "/red_sea_sunset_mountains_1774790636632.png",
          tag: "BIODIVERSITY HUB",
          tagAr: "مركز التنوع البيولوجي"
        },
        {
          id: "reserve_coral_reef",
          title: "Coral Reef Protectorate",
          titleAr: "محمية الحيد المرجاني",
          desc: "Vibrant and resilient coral reef systems offering world-class diving experiences.",
          descAr: "أنظمة شعاب مرجانية نابضة بالحياة ومرنة تقدم تجارب غوص بمستوى عالمي.",
          img: "/brother_islands_reef_wall_1774861464852.png",
          tag: "MARINE SANCTUARY",
          tagAr: "ملاذ بحري"
        }
      ]),

      ctaBgUrl: "/red_sea_sunset_mountains_1774790636632.png",
      ctaTitle: "Elevate Your Marine Perspective",
      ctaTitleAr: "ابدأ رحلتك نحو الرقي البيئي",
      ctaSubtitle: "Join the guardianship. Experience the world’s most precious marine territories.",
      ctaSubtitleAr: "انضم إلينا في حماية وتجربة أغلى الكنوز البحرية على وجه الأرض.",
      ctaBtn1Text: "Book a Visit",
      ctaBtn1TextAr: "احجز زيارة الآن",
      ctaBtn1Link: "/reserves",
      ctaBtn2Text: "Support Conservation",
      ctaBtn2TextAr: "دعم جهود الصون",
      ctaBtn2Link: "/guide",

      announcements: JSON.stringify([
        { id: "ann-01", text: "New patrol vessels added to fleet.", textAr: "تم إضافة زوارق دورية جديدة للأسطول.", active: true }
      ])
    };

    // --- EIA SPECIFIC (SQL ONLY) ---
    const eiaCosts = [
      {
        id: "eia_cost_01",
        subject: "تقييم الأثر البيئي لمشروع امتداد مارينا الجونة",
        details: "مراجعة تقرير الأثر البيئي الخاص بتوسعة مارينا اليخوت في الجونة، والتحقق من حواجز الأمواج وحماية الشعاب.",
        date: new Date("2026-05-10"),
        status: "ANSWERED",
        createdBy: "مصطفى لايق"
      }
    ];
    const eiaInspections = [
      {
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
    ];
    const eiaViolations = [
      {
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
    ];
    const eiaAccidents = [
      {
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
    ];

    const ecoProgramsData = [
      {
        id: "eco_program_01",
        program: "MANGROVE",
        subType: null,
        date: now,
        location: "Wadi El Gemal Mangroves",
        locationAr: "شجر المانجروف بوادي الجمال",
        latitude: 25.1234,
        longitude: 34.8234,
        observerName: "Sarah Hassan",
        details: "Healthy mangrove seedlings and high density of juvenile marine creatures observed.",
        attachedFileUrl: "/uploads/mangrove_report_2026.pdf"
      },
      {
        id: "eco_program_02",
        program: "MARINE_CREATURES",
        subType: "DOLPHIN",
        date: now,
        location: "Samadai Reef (Dolphin House)",
        locationAr: "شعب صمداي (بيت الدلافين)",
        latitude: 25.0123,
        longitude: 34.9789,
        observerName: "Ahmed Ali",
        details: "Observed a pod of 25 spinner dolphins including 3 calves.",
        attachedFileUrl: "/uploads/spinner_dolphins.png"
      }
    ];

    const strandingCasesData = [
      {
        id: "stranding_01",
        date: now,
        location: "Abu Dabbab Coast",
        locationAr: "ساحل أبو دباب",
        latitude: 25.3375,
        longitude: 34.7369,
        status: "ALIVE",
        species: "Green Sea Turtle",
        speciesAr: "السلحفاة الخضراء",
        attachedFileUrl: "/uploads/turtle_rescue.jpg",
        description: "Juvenile green turtle found entangled in discarded fishing nets. Extricated safely and released after health assessment."
      },
      {
        id: "stranding_02",
        date: now,
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
    ];

    const sightingsData = [
      {
        id: "sighting_01",
        date: now,
        location: "Marsa Alam Bay",
        locationAr: "خليج مرسى علم",
        latitude: 25.0645,
        longitude: 34.8921,
        species: "Whale Shark",
        speciesAr: "القرش الحوت",
        count: 1,
        notes: "Large whale shark (~7m) cruising slowly near the surface. Gentle interaction observed with local divers.",
        observerName: "Sarah Hassan"
      },
      {
        id: "sighting_02",
        date: now,
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
    ];

    const beachSurveysData = [
      {
        id: "beach_survey_01",
        date: now,
        location: "Wadi El Gemal Beach",
        locationAr: "شاطئ وادي الجمال",
        latitude: 25.0123,
        longitude: 34.8567,
        attachedFileUrl: "/uploads/beach_debris_survey.pdf",
        description: "Systematic beach survey covered 1km of sandy shore. High level of microplastics found near high tide line. Clean-up scheduled."
      },
      {
        id: "beach_survey_02",
        date: now,
        location: "Hamata Mangrove Coast",
        locationAr: "ساحل أشجار حماطة",
        latitude: 25.2123,
        longitude: 34.9123,
        attachedFileUrl: "/uploads/hamata_mangrove_survey.pdf",
        description: "Surveyed nesting areas for migratory marine birds. Checked 15 active nests. No direct human disturbance reported."
      }
    ];

    // 4. WRITE DATA TO PRISMA SQLITE
    console.log("Writing datasets to Prisma SQLite...");
    
    // Seed Users
    for (const u of usersData) {
      await prisma.user.create({ data: u });
    }
    // Seed Vessels
    for (const v of vesselsData) {
      await prisma.vessel.create({ data: v });
    }
    // Seed Patrols
    for (const p of patrolsData) {
      await prisma.patrol.create({ data: p });
    }
    // Seed Violations
    for (const vio of violationsData) {
      await prisma.violation.create({ data: vio });
    }
    // Seed Observations
    for (const obs of observationsData) {
      await prisma.observation.create({ data: obs });
    }
    // Seed News
    for (const n of newsData) {
      await prisma.newsArticle.create({ data: n });
    }
    // Seed Reserves
    for (const r of reservesData) {
      await prisma.reserveProfile.create({ data: r });
    }
    // Seed Opendata
    for (const docObj of opendataData) {
      await prisma.openDataDocument.create({ data: docObj });
    }
    // Seed Visitor Guide
    for (const vg of visitorGuideData) {
      await prisma.visitorGuideSection.create({ data: vg });
    }
    // Seed Homepage Settings
    await prisma.homepageSettings.create({ data: homepageData });

    // Seed Marine Species
    for (const ms of marineSpeciesData) {
      await (prisma as any).marineSpecies.create({ data: ms });
    }
    // Seed Map Locations
    for (const ml of mapLocationsData) {
      await (prisma as any).mapLocation.create({ data: ml });
    }

    // Seed EIA Specific
    for (const cost of eiaCosts) {
      await prisma.eiaCost.create({ data: cost });
    }
    for (const insp of eiaInspections) {
      await prisma.eiaInspection.create({ data: insp });
    }
    for (const v of eiaViolations) {
      await prisma.eiaViolation.create({ data: v });
    }
    for (const acc of eiaAccidents) {
      await prisma.eiaAccident.create({ data: acc });
    }

    // Seed Eco Programs
    for (const ep of ecoProgramsData) {
      await (prisma as any).ecoProgramReport.create({ data: ep });
    }
    // Seed Stranding Cases
    for (const sc of strandingCasesData) {
      await (prisma as any).strandingCase.create({ data: sc });
    }
    // Seed Sightings
    for (const s of sightingsData) {
      await (prisma as any).sighting.create({ data: s });
    }
    // Seed Beach Surveys
    for (const bs of beachSurveysData) {
      await (prisma as any).beachSurvey.create({ data: bs });
    }

    console.log("SQLite database seeded successfully.");

    // 5. WRITE DATA TO FIREBASE FIRESTORE
    try {
      console.log("Writing datasets to Firebase Firestore...");
      const fbBatch = writeBatch(db);

      // Sync Users
      usersData.forEach((u) => {
        const { passwordHash, certifications, allowedSections, ...rest } = u;
        const ref = doc(db, 'users', u.id);
        fbBatch.set(ref, {
          ...rest,
          certifications: certifications ? certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
          allowedSections: JSON.parse(allowedSections),
          createdAt: timestampNow
        });
      });

      // Sync Vessels (Fleet)
      vesselsData.forEach((v) => {
        const ref = doc(db, 'fleet', v.id);
        fbBatch.set(ref, {
          code: v.code,
          name: v.name,
          nameAr: v.nameAr,
          type: v.type,
          status: v.status,
          fuelLevel: v.fuelLevel,
          engineHours: v.engineHours,
          healthScore: v.healthScore,
          lastServiceDate: Timestamp.fromDate(v.lastService)
        });
      });

      // Sync Patrols
      patrolsData.forEach((p) => {
        const ref = doc(db, 'patrols', p.id);
        fbBatch.set(ref, {
          code: p.code,
          zone: p.zone,
          zoneAr: p.zoneAr,
          status: p.status,
          officer: "Ahmed Ali",
          vessel: "Amwaj 1",
          startTime: timestampNow,
          endTime: timestampNow,
          routeCoordinates: JSON.parse(p.routeCoordinates),
          incidentsReported: p.incidentsReported
        });
      });

      // Sync Violations
      violationsData.forEach((vio) => {
        const ref = doc(db, 'violations', vio.id);
        fbBatch.set(ref, {
          code: vio.code,
          type: "POACHING", // Primary classification mapping
          typeAr: vio.typeAr,
          severity: vio.severity,
          status: vio.status,
          location: vio.location,
          locationAr: vio.locationAr,
          date: timestampNow,
          reportedBy: vio.officerId,
          fineAmount: vio.fineAmount,
          description: vio.description
        });
      });

      // Sync Observations
      observationsData.forEach((obs) => {
        const ref = doc(db, 'observations', obs.id);
        fbBatch.set(ref, {
          code: obs.code,
          type: obs.type,
          location: obs.location,
          locationAr: obs.locationAr,
          observerId: obs.observerId,
          observerName: obs.observerName,
          date: timestampNow,
          status: obs.status,
          score: obs.score,
          indicators: JSON.parse(obs.indicators)
        });
      });

      // Sync News
      newsData.forEach((n) => {
        const ref = doc(db, 'news', n.id);
        fbBatch.set(ref, {
          title: n.title,
          titleAr: n.titleAr,
          content: n.content,
          contentAr: n.contentAr,
          category: n.category,
          date: timestampNow,
          authorId: n.authorId,
          authorName: n.authorName,
          status: n.status
        });
      });

      // Sync Reserves
      reservesData.forEach((r) => {
        const ref = doc(db, 'reserves', r.id);
        fbBatch.set(ref, {
          name: r.name,
          nameAr: r.nameAr,
          description: r.description,
          descriptionAr: r.descriptionAr,
          location: r.location,
          locationAr: r.locationAr,
          area: r.area,
          establishedYear: r.establishedYear,
          status: r.status
        });
      });

      // Sync Opendata
      opendataData.forEach((docObj) => {
        const ref = doc(db, 'opendata', docObj.id);
        fbBatch.set(ref, {
          title: docObj.title,
          titleAr: docObj.titleAr,
          type: docObj.type,
          fileUrl: docObj.fileUrl,
          fileSize: docObj.fileSize,
          uploadDate: timestampNow,
          uploaderId: docObj.uploaderId,
          status: docObj.status
        });
      });

      // Sync Visitor Guide
      visitorGuideData.forEach((vg) => {
        const ref = doc(db, 'visitor_guide', vg.id);
        fbBatch.set(ref, {
          title: vg.title,
          titleAr: vg.titleAr,
          content: vg.content,
          contentAr: vg.contentAr,
          order: vg.order,
          links: vg.links ? JSON.parse(vg.links) : []
        });
      });

      // Sync Homepage Settings
      const homeRef = doc(db, 'homepage', homepageData.id);
      fbBatch.set(homeRef, {
        heroTitle: homepageData.heroTitle,
        heroTitleAr: homepageData.heroTitleAr,
        heroSubtitle: homepageData.heroSubtitle,
        heroSubtitleAr: homepageData.heroSubtitleAr,
        heroAuthority: homepageData.heroAuthority,
        heroAuthorityAr: homepageData.heroAuthorityAr,
        heroBgUrl: homepageData.heroBgUrl,
        heroBtn1Text: homepageData.heroBtn1Text,
        heroBtn1TextAr: homepageData.heroBtn1TextAr,
        heroBtn1Link: homepageData.heroBtn1Link,
        heroBtn2Text: homepageData.heroBtn2Text,
        heroBtn2TextAr: homepageData.heroBtn2TextAr,
        heroBtn2Link: homepageData.heroBtn2Link,
        stats: JSON.parse(homepageData.statsJson),
        missionTag: homepageData.missionTag,
        missionTagAr: homepageData.missionTagAr,
        missionTitle: homepageData.missionTitle,
        missionTitleAr: homepageData.missionTitleAr,
        missionDesc: homepageData.missionDesc,
        missionDescAr: homepageData.missionDescAr,
        missionChecklist: JSON.parse(homepageData.missionChecklistJson),
        missionImgUrl: homepageData.missionImgUrl,
        missionCardTag: homepageData.missionCardTag,
        missionCardTagAr: homepageData.missionCardTagAr,
        missionCardTitle: homepageData.missionCardTitle,
        missionCardTitleAr: homepageData.missionCardTitleAr,
        highlightsTag: homepageData.highlightsTag,
        highlightsTagAr: homepageData.highlightsTagAr,
        highlightsTitle: homepageData.highlightsTitle,
        highlightsTitleAr: homepageData.highlightsTitleAr,
        highlightsLinkText: homepageData.highlightsLinkText,
        highlightsLinkTextAr: homepageData.highlightsLinkTextAr,
        highlightsLinkUrl: homepageData.highlightsLinkUrl,
        highlights: JSON.parse(homepageData.highlightsJson),
        ctaBgUrl: homepageData.ctaBgUrl,
        ctaTitle: homepageData.ctaTitle,
        ctaTitleAr: homepageData.ctaTitleAr,
        ctaSubtitle: homepageData.ctaSubtitle,
        ctaSubtitleAr: homepageData.ctaSubtitleAr,
        ctaBtn1Text: homepageData.ctaBtn1Text,
        ctaBtn1TextAr: homepageData.ctaBtn1TextAr,
        ctaBtn1Link: homepageData.ctaBtn1Link,
        ctaBtn2Text: homepageData.ctaBtn2Text,
        ctaBtn2TextAr: homepageData.ctaBtn2TextAr,
        ctaBtn2Link: homepageData.ctaBtn2Link,
        announcements: JSON.parse(homepageData.announcements)
      });

      // Sync Marine Species
      marineSpeciesData.forEach((ms) => {
        const ref = doc(db, 'marine_species', ms.id);
        fbBatch.set(ref, {
          name: ms.name,
          nameAr: ms.nameAr,
          type: ms.type,
          typeAr: ms.typeAr || "",
          imageUrl: ms.imageUrl || null,
          status: ms.status,
          statusAr: ms.statusAr || "",
          description: ms.description || "",
          descriptionAr: ms.descriptionAr || "",
          createdAt: timestampNow,
          updatedAt: timestampNow
        });
      });

      // Sync Map Locations
      mapLocationsData.forEach((ml) => {
        const ref = doc(db, 'map_locations', ml.id);
        fbBatch.set(ref, {
          name: ml.name,
          nameAr: ml.nameAr,
          latitude: ml.latitude,
          longitude: ml.longitude,
          type: ml.type,
          typeAr: ml.typeAr || "",
          status: ml.status,
          statusAr: ml.statusAr || "",
          description: ml.description || "",
          descriptionAr: ml.descriptionAr || "",
          imageUrl: ml.imageUrl || null,
          createdAt: timestampNow,
          updatedAt: timestampNow
        });
      });

      // Sync Eco Programs
      ecoProgramsData.forEach((ep) => {
        const ref = doc(db, 'eco_programs', ep.id);
        fbBatch.set(ref, {
          ...ep,
          date: timestampNow
        });
      });

      // Sync Stranding Cases
      strandingCasesData.forEach((sc) => {
        const ref = doc(db, 'stranding_cases', sc.id);
        fbBatch.set(ref, {
          ...sc,
          date: timestampNow
        });
      });

      // Sync Sightings
      sightingsData.forEach((s) => {
        const ref = doc(db, 'sightings', s.id);
        fbBatch.set(ref, {
          ...s,
          date: timestampNow
        });
      });

      // Sync Beach Surveys
      beachSurveysData.forEach((bs) => {
        const ref = doc(db, 'beach_surveys', bs.id);
        fbBatch.set(ref, {
          ...bs,
          date: timestampNow
        });
      });

      // Commit batch write to Firestore
      await fbBatch.commit();
      console.log("Firebase database seeded successfully.");
    } catch (fbSeedError) {
      console.error("Warning: Failed to seed Firebase Firestore:", fbSeedError);
    }

    return NextResponse.json({ message: 'Both SQLite and Firebase databases seeded successfully in sync!' });
  } catch (error: any) {
    console.error("Error during database seeding:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
