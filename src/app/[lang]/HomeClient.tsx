'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronDown, 
  MapPin, 
  Shield, 
  Zap, 
  Globe, 
  Droplets, 
  Waves,
  Navigation,
  ExternalLink,
  Info,
  CheckCircle2,
  Calendar,
  Eye,
  Microscope
} from 'lucide-react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

import { 
  Heart,
  Anchor,
  Compass,
  FileText
} from 'lucide-react';

const STATS = [
  { value: '35,000', label: 'km² Protected Area', labelAr: 'كيلومتر مربع من المحميات', icon: Globe },
  { value: '1,200+', label: 'Protected Species', labelAr: 'من الأنواع المحمية', icon: Microscope },
  { value: '40', label: 'Marine Reservoirs', labelAr: 'محمية بحرية وبرية', icon: Shield },
  { value: '2.5M', label: 'Annual Visitors', labelAr: 'زائر سنوي للمحميات', icon: Eye },
];

const HIGHLIGHTS = [
  {
    id: 'reserve_northern_islands',
    title: 'Northern Islands Protectorate',
    titleAr: 'محمية الجزر الشمالية',
    desc: 'A pristine archipelago serving as a critical sanctuary for marine turtles and migratory birds.',
    descAr: 'أرخبيل بكر يعد ملاذاً حرجاً للسلاحف البحرية والطيور المهاجرة.',
    img: '/red_sea_hero_aerial_1774790601114.png',
    tag: 'PREMIUM DESTINATION',
    tagAr: 'وجهة استثنائية'
  },
  {
    id: 'reserve_wadi_el_gemal',
    title: 'Wadi El Gemal',
    titleAr: 'محمية وادي الجمال',
    desc: 'A vast expanse of coastal lagoons and desert peaks, home to the ancient emerald mines.',
    descAr: 'مساحات شاسعة من المناطق الساحلية والجبلية، موطن لمناجم الزمرد القديمة.',
    img: '/wadi_el_gemal_mangroves_aerial_1774861445577.png',
    tag: 'ECOLOGICAL HERITAGE',
    tagAr: 'تراث بيئي'
  },
  {
    id: 'reserve_gebel_elba',
    title: 'Gebel Elba',
    titleAr: 'محمية جبل علبة',
    desc: 'An unparalleled mist oasis in the desert with unique biodiversity and lush green peaks.',
    descAr: 'واحة ضبابية فريدة في الصحراء تتميز بتنوع بيولوجي فريد وقمم جبلية خضراء.',
    img: '/red_sea_sunset_mountains_1774790636632.png',
    tag: 'BIODIVERSITY HUB',
    tagAr: 'مركز التنوع البيولوجي'
  },
  {
    id: 'reserve_coral_reef',
    title: 'Coral Reef Protectorate',
    titleAr: 'محمية الحيد المرجاني',
    desc: 'Vibrant and resilient coral reef systems offering world-class diving experiences.',
    descAr: 'أنظمة شعاب مرجانية نابضة بالحياة ومرنة تقدم تجارب غوص بمستوى عالمي.',
    img: '/brother_islands_reef_wall_1774861464852.png',
    tag: 'MARINE SANCTUARY',
    tagAr: 'ملاذ بحري'
  }
];

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Globe,
  Microscope,
  Shield,
  Eye,
  MapPin,
  Zap,
  Droplets,
  Waves,
  Navigation,
  ExternalLink,
  Info,
  CheckCircle2,
  Calendar,
  Heart,
  Anchor,
  Compass,
  FileText
};

function getIconComponent(iconName: string) {
  return ICON_MAP[iconName] || Globe;
}

export default function HomeClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/staff/query?collection=homepage&t=${Date.now()}`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setData(json.data[0]);
        }
      } catch (e) {
        console.error('Failed to load homepage settings:', e);
      }
    };
    load();
  }, []);

  const getLocalizedLink = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('/')) {
      // Avoid prefixing double language codes
      const cleanUrl = url.replace(/^\/(en|ar)/, '');
      return `/${lang}${cleanUrl}`;
    }
    return url;
  };

  // Resolve values with safe fallbacks
  const heroTitleVal = (isAr ? data?.heroTitleAr : data?.heroTitle) || (isAr ? 'احمِ.. استكشف.. انبهر' : 'Protect. Explore. Marvel.');
  const heroSubtitleVal = (isAr ? data?.heroSubtitleAr : data?.heroSubtitle) || (isAr ? 'اكتشف روعة أحد أكثر النظم البيئية البحرية سحراً في الكوكب، حيث تلتقي المياه الفيروزية بالطبيعة الخلابة.' : 'Discover the majesty of the world’s most enchanting marine ecosystem, where turquoise horizons meet untamed biodiversity.');
  const heroAuthorityVal = (isAr ? data?.heroAuthorityAr : data?.heroAuthority) || (isAr ? 'جهاز محميات البحر الأحمر' : 'Red Sea Marine Authority');
  const heroBgUrlVal = data?.heroBgUrl || '/red_sea_aerial_hd.png';
  const heroBtn1TextVal = (isAr ? data?.heroBtn1TextAr : data?.heroBtn1Text) || (isAr ? 'ابدأ الاستكشاف' : 'Begin Exploration');
  const heroBtn1LinkVal = data?.heroBtn1Link || '/guide';
  const heroBtn2TextVal = (isAr ? data?.heroBtn2TextAr : data?.heroBtn2Text) || (isAr ? 'خريطة المحميات' : 'Interactive Map');
  const heroBtn2LinkVal = data?.heroBtn2Link || '/reserves';

  // Stats
  let statsList = STATS;
  if (data?.stats && Array.isArray(data.stats) && data.stats.length > 0) {
    statsList = data.stats.map((item: any) => ({
      value: item.value,
      label: item.label,
      labelAr: item.labelAr,
      icon: getIconComponent(item.icon)
    }));
  }

  // Mission
  const missionTagVal = (isAr ? data?.missionTagAr : data?.missionTag) || (isAr ? 'حماية الرؤية المستقبلية' : 'Protecting the Vision');
  const missionTitleVal = (isAr ? data?.missionTitleAr : data?.missionTitle) || (isAr ? 'مهمتنا هي صون التراث الطبيعي' : 'Commitment to the Blue Heritage');
  const missionDescVal = (isAr ? data?.missionDescAr : data?.missionDesc) || (isAr ? 'نعمل على تطبيق أعلى المعايير الدولية في إدارة المحميات من خلال إشراك المجتمع المحلي والمسوحات الميدانية المستمرة لضمان استدامة الموارد.' : 'Implementing standard ecosystem preservation practices through community engagement and regular field surveys, ensuring resource sustainability.');
  
  let missionChecklistVal = [
    { text: 'Environmental Patrols', textAr: 'دوريات بيئية' },
    { text: 'Biodiversity Protection', textAr: 'صون التنوع' },
    { text: 'Environmental Awareness', textAr: 'وعي بيئي' },
    { text: 'Smart Management', textAr: 'إدارة ذكية' }
  ];
  if (data?.missionChecklist && Array.isArray(data.missionChecklist) && data.missionChecklist.length > 0) {
    missionChecklistVal = data.missionChecklist;
  }
  const missionImgUrlVal = data?.missionImgUrl || '/sea_turtle_close_up_1774790619989.png';
  const missionCardTagVal = (isAr ? data?.missionCardTagAr : data?.missionCardTag) || (isAr ? 'الوضع الحالي' : 'Current Status');
  const missionCardTitleVal = (isAr ? data?.missionCardTitleAr : data?.missionCardTitle) || (isAr ? 'أعلى مستويات الصحة البيئية' : 'Peak Ecological Health Index');

  // Highlights
  const highlightsTagVal = (isAr ? data?.highlightsTagAr : data?.highlightsTag) || (isAr ? 'اكتشف روائع الطبيعة' : 'Explore the Arcana');
  const highlightsTitleVal = (isAr ? data?.highlightsTitleAr : data?.highlightsTitle) || (isAr ? 'عجائب المحميات' : 'Reserve Highlights');
  const highlightsLinkTextVal = (isAr ? data?.highlightsLinkTextAr : data?.highlightsLinkText) || (isAr ? 'تصفح جميع المحميات' : 'Explore All Reserves');
  const highlightsLinkUrlVal = data?.highlightsLinkUrl || '/reserves';

  let highlightsList = HIGHLIGHTS;
  if (data?.highlights && Array.isArray(data.highlights) && data.highlights.length > 0) {
    highlightsList = data.highlights;
  }

  // CTA
  const ctaBgUrlVal = data?.ctaBgUrl || '/red_sea_sunset_mountains_1774790636632.png';
  const ctaTitleVal = (isAr ? data?.ctaTitleAr : data?.ctaTitle) || (isAr ? 'ابدأ رحلتك نحو الرقي البيئي' : 'Elevate Your Marine Perspective');
  const ctaSubtitleVal = (isAr ? data?.ctaSubtitleAr : data?.ctaSubtitle) || (isAr ? 'انضم إلينا في حماية وتجربة أغلى الكنوز البحرية على وجه الأرض.' : 'Join the guardianship. Experience the world’s most precious marine territories.');
  const ctaBtn1TextVal = (isAr ? data?.ctaBtn1TextAr : data?.ctaBtn1Text) || (isAr ? 'احجز زيارة الآن' : 'Book a Visit');
  const ctaBtn1LinkVal = data?.ctaBtn1Link || '/reserves';
  const ctaBtn2TextVal = (isAr ? data?.ctaBtn2TextAr : data?.ctaBtn2Text) || (isAr ? 'دعم جهود الصون' : 'Support Conservation');
  const ctaBtn2LinkVal = data?.ctaBtn2Link || '/guide';

  return (
    <div className="bg-th-bg text-th-text overflow-hidden transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      <main className="transition-colors duration-300">
         {/* ── Hero Section ─────────────────────────────────────────────────── */}
         <section className="relative min-h-screen flex flex-col pt-20 px-6 overflow-hidden bg-th-bg">
         {/* Immersive Background */}
         <div className="absolute inset-0 z-0">
            <img 
              src={heroBgUrlVal} 
              alt="Red Sea Hero"
              className="w-full h-full object-cover scale-105"
            />
            <div 
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: 'var(--hero-overlay)' }}
            />
            <div 
              className="absolute inset-0 z-20 pointer-events-none"
              style={{ background: 'var(--hero-overlay-bottom)' }}
            />
         </div>

         {/* Main content — centered in remaining space */}
         <div className="relative z-30 flex-1 flex items-center justify-center py-16">
            <div className="max-w-7xl mx-auto w-full text-center">
               <motion.div
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className="space-y-6"
               >
                  <div className="flex items-center justify-center gap-2 mb-4">
                     <div className="w-12 h-px bg-teal-500/50" />
                     <span className="text-xs font-bold uppercase tracking-widest text-teal-500 italic">{heroAuthorityVal}</span>
                     <div className="w-12 h-px bg-teal-500/50" />
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-[7.5rem] font-black leading-tight lg:leading-[1.05] tracking-tighter uppercase italic drop-shadow-2xl text-th-text">
                     {heroTitleVal}
                  </h1>

                  <p className="text-xl md:text-2xl font-medium text-th-dim max-w-3xl mx-auto italic drop-shadow-lg">
                     {heroSubtitleVal}
                  </p>

                  <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                     <Link href={getLocalizedLink(heroBtn1LinkVal)} className="no-underline">
                        <button className="px-10 py-5 rounded-2xl bg-teal-500 text-[#001529] font-black text-sm tracking-tighter uppercase italic hover:bg-teal-400 transition-all shadow-[0_20px_40px_rgba(45,212,191,0.2)] flex items-center gap-3 group">
                           {heroBtn1TextVal}
                           <ArrowRight size={20} className={`transition-transform ${isAr ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                        </button>
                     </Link>
                     <Link href={getLocalizedLink(heroBtn2LinkVal)} className="no-underline">
                        <button className="px-10 py-5 rounded-2xl bg-white/20 border border-th-border backdrop-blur-md font-black text-sm tracking-tighter uppercase italic hover:bg-white/30 transition-all flex items-center gap-3 text-th-text">
                           <MapPin size={20} className="text-teal-400" />
                           {heroBtn2TextVal}
                        </button>
                     </Link>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* Scroll Indicator — always at the bottom of the hero section */}
         <motion.div
           animate={{ y: [0, 8, 0] }}
           transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
           className="relative z-30 flex flex-col items-center gap-1.5 text-th-dim/50 pb-6"
         >
            <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'انزل لأسفل لرؤية المهمة' : 'Scroll for Mission'}</span>
            <ChevronDown size={16} />
         </motion.div>
      </section>

      {/* ── Impact Statistics Row ─────────────────────────────────────────── */}
      <section className="relative z-40 px-6 -mt-4">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               {statsList.map((stat, i) => {
                 const Icon = stat.icon;
                 return (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     viewport={{ once: true }}
                     className="p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-th-surface backdrop-blur-2xl border border-th-border shadow-2xl group hover:bg-th-surface2 transition-all"
                   >
                      <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                         <Icon size={24} />
                      </div>
                      <div className="text-4xl font-black text-th-text mb-2 font-mono tracking-tighter">{stat.value}</div>
                      <div className="text-sm font-bold text-th-dim uppercase tracking-widest italic">{isAr ? stat.labelAr : stat.label}</div>
                   </motion.div>
                 );
               })}
            </div>
         </div>
      </section>

      {/* ── Strategic Mission Section ─────────────────────────────────────── */}
      <section className="py-32 px-6 container mx-auto">
         <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-center">
            <div className="w-full lg:w-1/2 space-y-10">
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-teal-500 uppercase tracking-widest italic">{missionTagVal}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1] text-th-text">
                     {missionTitleVal}
                  </h2>
               </div>
               
               <p className="text-xl text-th-dim font-medium leading-relaxed italic">
                  {missionDescVal}
               </p>

               <div className="flex gap-8">
                  <div className="space-y-4">
                     {missionChecklistVal.slice(0, 2).map((item, index) => (
                       <div key={index} className="flex items-center gap-3 text-th-text font-black text-sm uppercase italic">
                          <CheckCircle2 className="text-teal-500" size={18} />
                          {isAr ? item.textAr : item.text}
                       </div>
                     ))}
                  </div>
                  <div className="space-y-4">
                     {missionChecklistVal.slice(2, 4).map((item, index) => (
                       <div key={index} className="flex items-center gap-3 text-th-text font-black text-sm uppercase italic">
                          <CheckCircle2 className="text-teal-500" size={18} />
                          {isAr ? item.textAr : item.text}
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="w-full lg:w-1/2 mt-20 lg:mt-0 relative">
               <div className="w-full aspect-[4/3] lg:aspect-square rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/10 relative group">
                  <img 
                    src={missionImgUrlVal} 
                    alt="Marine Life"
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 p-5 sm:bottom-8 sm:left-8 sm:p-8 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/10 max-w-xs">
                     <Zap size={24} className="text-teal-400 mb-4" />
                     <p className="text-xs font-bold uppercase tracking-widest text-th-dim mb-1 italic">{missionCardTagVal}</p>
                     <p className="text-lg font-black italic tracking-tighter uppercase text-th-text">{missionCardTitleVal}</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── Spotlight Destinations ────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-th-surface2/20 transition-colors duration-300">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
               <div className="space-y-3">
                  <span className="text-xs font-bold text-teal-500 uppercase tracking-widest italic">{highlightsTagVal}</span>
                  <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1] text-th-text">{highlightsTitleVal}</h2>
               </div>
               <Link href={getLocalizedLink(highlightsLinkUrlVal)} className="group flex items-center gap-3 text-xs font-bold text-teal-400 uppercase tracking-widest italic no-underline">
                  {highlightsLinkTextVal}
                  <div className="w-10 h-10 rounded-full border border-teal-500/30 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-[#001529] transition-all">
                     <ArrowRight size={16} className={isAr ? 'rotate-180' : ''} />
                  </div>
               </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {highlightsList.map((item, i) => (
                 <Link href={getLocalizedLink(`/reserves/${item.id}`)} key={i} className="no-underline block">
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.15 }}
                     className="dark group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer shadow-xl hover:shadow-teal-500/5 transition-all w-full"
                   >
                      <img 
                        src={item.img} 
                        alt={item.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out grayscale-[0.1]"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10, 22, 40, 0.95) 0%, transparent 60%, rgba(0,0,0,0.4) 100%)' }} />
                      
                      <div className="absolute top-8 left-8 right-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all focus-within:opacity-100">
                         <span className="px-4 py-1.5 rounded-full bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-xs font-bold text-teal-400 uppercase tracking-widest italic">
                            {isAr ? item.tagAr : item.tag}
                         </span>
                      </div>

                      <div className="absolute bottom-10 left-10 right-10 space-y-4">
                         <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white transition-colors group-hover:text-teal-400">
                            {isAr ? item.titleAr : item.title}
                         </h3>
                         <p className="text-sm font-medium text-slate-300 leading-relaxed italic opacity-80 group-hover:opacity-100 transition-all">
                            {isAr ? item.descAr : item.desc}
                         </p>
                         <div className="pt-4 overflow-hidden">
                            <div className="w-12 h-px bg-teal-500 group-hover:w-full transition-all duration-700" />
                         </div>
                      </div>
                   </motion.div>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* ── Call to Action ────────────────────────────────────────────────── */}
      <section className="relative py-40 px-6 overflow-hidden bg-th-bg">
         <div className="absolute inset-0 z-0">
            <img 
              src={ctaBgUrlVal} 
              className="w-full h-full object-cover opacity-25 scale-110"
              alt="Sunset Background"
            />
            <div 
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, var(--page-bg-real) 0%, transparent 40%, transparent 60%, var(--page-bg-real) 100%)'
              }}
            />
         </div>
         
         <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1] text-white">
               {ctaTitleVal}
            </h2>
            <p className="text-xl md:text-2xl font-bold text-slate-200 drop-shadow-md italic">
               {ctaSubtitleVal}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
               <Link href={getLocalizedLink(ctaBtn1LinkVal)} className="no-underline">
                  <button className="px-12 py-6 rounded-3xl bg-teal-500 text-[#001529] font-black text-lg tracking-tighter uppercase italic hover:bg-teal-400 transition-all shadow-2xl w-full sm:w-auto">
                     {ctaBtn1TextVal}
                  </button>
               </Link>
               <Link href={getLocalizedLink(ctaBtn2LinkVal)} className="no-underline">
                  <button className="px-12 py-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-lg tracking-tighter uppercase italic hover:bg-white/10 transition-all backdrop-blur-xl w-full sm:w-auto">
                     {ctaBtn2TextVal}
                  </button>
               </Link>
            </div>
         </div>
      </section>
      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
