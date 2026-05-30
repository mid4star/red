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

export default function HomeClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';

  return (
    <div className="bg-[#0a1628] text-white overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
         {/* Immersive Background */}
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#0a1628]/40 z-10" />
            <img 
              src="/red_sea_aerial_hd.png" 
              alt="Red Sea Hero"
              className="w-full h-full object-cover scale-105"
            />
            {/* Ambient Overlays */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0a1628] to-transparent z-20" />
            <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-[#0a1628]/60 to-transparent z-20" />
         </div>

         <div className="relative z-30 max-w-7xl mx-auto w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
               <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-12 h-px bg-teal-500/50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400 italic">{isAr ? 'جهاز محميات البحر الأحمر' : 'Red Sea Marine Authority'}</span>
                  <div className="w-12 h-px bg-teal-500/50" />
               </div>
               
               <h1 className="text-4xl md:text-6xl lg:text-[7.5rem] font-black leading-tight lg:leading-[1.05] tracking-tighter uppercase italic drop-shadow-2xl">
                  {isAr ? 'احمِ.. استكشف.. انبهر' : 'Protect. Explore. Marvel.'}
               </h1>
               
               <p className="text-xl md:text-2xl font-medium text-slate-200 max-w-3xl mx-auto italic drop-shadow-lg">
                  {isAr 
                    ? 'اكتشف روعة أحد أكثر النظم البيئية البحرية سحراً في الكوكب، حيث تلتقي المياه الفيروزية بالطبيعة الخلابة.' 
                    : 'Discover the majesty of the world’s most enchanting marine ecosystem, where turquoise horizons meet untamed biodiversity.'}
               </p>

               <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href={`/${lang}/guide`} className="no-underline">
                     <button className="px-10 py-5 rounded-2xl bg-teal-500 text-[#001529] font-black text-sm tracking-tighter uppercase italic hover:bg-teal-400 transition-all shadow-[0_20px_40px_rgba(45,212,191,0.2)] flex items-center gap-3 group">
                        {isAr ? 'ابدأ الاستكشاف' : 'Begin Exploration'}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  </Link>
                  <Link href={`/${lang}/reserves`} className="no-underline text-white">
                     <button className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md font-black text-sm tracking-tighter uppercase italic hover:bg-white/10 transition-all flex items-center gap-3">
                        <MapPin size={20} className="text-teal-400" />
                        {isAr ? 'خريطة المحميات' : 'Interactive Map'}
                     </button>
                  </Link>
               </div>
            </motion.div>
         </div>

         {/* Scroll Indicator */}
         <motion.div 
           animate={{ y: [0, 10, 0] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 text-white/40 flex flex-col items-center gap-2"
         >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isAr ? 'انزل لأسفل لرؤية المهمة' : 'Scroll for Mission'}</span>
            <ChevronDown size={20} />
         </motion.div>
      </section>

      {/* ── Impact Statistics Row ─────────────────────────────────────────── */}
      <section className="relative z-40 -mt-16 md:-mt-24 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               {STATS.map((stat, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   viewport={{ once: true }}
                   className="p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-slate-900/60 backdrop-blur-2xl border border-white/5 shadow-2xl group hover:bg-slate-900/80 transition-all"
                 >
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                       <stat.icon size={24} />
                    </div>
                    <div className="text-4xl font-black text-white mb-2 font-mono tracking-tighter">{stat.value}</div>
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">{isAr ? stat.labelAr : stat.label}</div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ── Strategic Mission Section ─────────────────────────────────────── */}
      <section className="py-32 px-6 container mx-auto">
         <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-center">
            <div className="w-full lg:w-1/2 space-y-10">
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <span className="text-[11px] font-black text-teal-500 uppercase tracking-[0.3em] italic">{isAr ? 'حماية الرؤية المستقبلية' : 'Protecting the Vision'}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1]">
                     {isAr ? 'مهمتنا هي صون التراث الطبيعي' : 'Commitment to the Blue Heritage'}
                  </h2>
               </div>
               
               <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
                  {isAr 
                    ? 'نعمل على تطبيق أعلى المعايير الدولية في إدارة المحميات من خلال إشراك المجتمع المحلي والمسوحات الميدانية المستمرة لضمان استدامة الموارد.' 
                    : 'Implementing standard ecosystem preservation practices through community engagement and regular field surveys, ensuring resource sustainability.'}
               </p>

               <div className="flex gap-8">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-white font-black text-sm uppercase italic">
                        <CheckCircle2 className="text-teal-400" size={18} />
                         {isAr ? 'دوريات بيئية' : 'Environmental Patrols'}
                     </div>
                     <div className="flex items-center gap-3 text-white font-black text-sm uppercase italic">
                        <CheckCircle2 className="text-teal-400" size={18} />
                        {isAr ? 'صون التنوع' : 'Biodiversity Protection'}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-white font-black text-sm uppercase italic">
                        <CheckCircle2 className="text-teal-400" size={18} />
                        {isAr ? 'وعي بيئي' : 'Environmental Awareness'}
                     </div>
                     <div className="flex items-center gap-3 text-white font-black text-sm uppercase italic">
                        <CheckCircle2 className="text-teal-400" size={18} />
                        {isAr ? 'إدارة ذكية' : 'Smart Management'}
                     </div>
                  </div>
               </div>
            </div>

            <div className="w-full lg:w-1/2 mt-20 lg:mt-0 relative">
               <div className="w-full aspect-[4/3] lg:aspect-square rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/10 relative group">
                  <img 
                    src="/sea_turtle_close_up_1774790619989.png" 
                    alt="Marine Life"
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 p-5 sm:bottom-8 sm:left-8 sm:p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 max-w-xs">
                     <Zap size={24} className="text-teal-400 mb-4" />
                     <p className="text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-1 italic">{isAr ? 'الوضع الحالي' : 'Current Status'}</p>
                     <p className="text-lg font-black italic tracking-tighter uppercase">{isAr ? 'أعلى مستويات الصحة البيئية' : 'Peak Ecological Health Index'}</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── Spotlight Destinations ────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-slate-900/20">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
               <div className="space-y-3">
                  <span className="text-[11px] font-black text-teal-400 uppercase tracking-[0.3em] italic">{isAr ? 'اكتشف روائع الطبيعة' : 'Explore the Arcana'}</span>
                  <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1]">{isAr ? 'عجائب المحميات' : 'Reserve Highlights'}</h2>
               </div>
               <Link href={`/${lang}/reserves`} className="group flex items-center gap-3 text-[12px] font-black text-teal-400 uppercase tracking-widest italic no-underline">
                  {isAr ? 'تصفح جميع المحميات' : 'Explore All Reserves'}
                  <div className="w-10 h-10 rounded-full border border-teal-500/30 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-[#001529] transition-all">
                     <ArrowRight size={16} />
                  </div>
               </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {HIGHLIGHTS.map((item, i) => (
                 <Link href={`/${lang}/reserves/${item.id}`} key={i} className="no-underline block">
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.15 }}
                     viewport={{ once: true }}
                     className="group relative h-[600px] rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer shadow-xl hover:shadow-teal-500/5 transition-all w-full"
                   >
                      <img 
                        src={item.img} 
                        alt={item.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out grayscale-[0.1]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-black/20" />
                      
                      <div className="absolute top-8 left-8 right-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all focus-within:opacity-100">
                         <span className="px-4 py-1.5 rounded-full bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-[9px] font-black text-teal-400 uppercase tracking-widest italic">
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
      <section className="relative py-40 px-6 overflow-hidden">
         <div className="absolute inset-0 z-0">
            <img 
              src="/red_sea_sunset_mountains_1774790636632.png" 
              className="w-full h-full object-cover opacity-20 scale-110"
              alt="Sunset Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-transparent to-[#0a1628]" />
         </div>
         
         <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1] italic">
               {isAr ? 'ابدأ رحلتك نحو الرقي البيئي' : 'Elevate Your Marine Perspective'}
            </h2>
            <p className="text-xl md:text-2xl font-bold text-slate-400 italic">
               {isAr 
                 ? 'انضم إلينا في حماية وتجربة أغلى الكنوز البحرية على وجه الأرض.' 
                 : 'Join the guardianship. Experience the world’s most precious marine territories.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
               <button className="px-12 py-6 rounded-3xl bg-teal-500 text-[#001529] font-black text-lg tracking-tighter uppercase italic hover:bg-teal-400 transition-all shadow-2xl">
                  {isAr ? 'احجز زيارة الآن' : 'Book a Visit'}
               </button>
               <button className="px-12 py-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-lg tracking-tighter uppercase italic hover:bg-white/10 transition-all backdrop-blur-xl">
                  {isAr ? 'دعم جهود الصون' : 'Support Conservation'}
               </button>
            </div>
         </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
