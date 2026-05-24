'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  ShieldCheck, 
  Droplets, 
  Navigation, 
  ArrowRight, 
  Activity,
  Globe,
  Waves,
  Zap,
  Info,
  Calendar,
  Compass
} from 'lucide-react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

const RESERVES = [
  {
    id: 'RS-N01',
    name: 'Northern Islands',
    nameAr: 'محمية الجزر الشمالية',
    desc: 'A pristine archipelago serving as a critical sanctuary for marine turtles and migratory birds in the northern Red Sea.',
    descAr: 'أرخبيل بكر يعد ملاذاً حرجاً للسلاحف البحرية والطيور المهاجرة في شمال البحر الأحمر.',
    img: '/red_sea_hero_aerial_1774790601114.png',
    coords: '27.2288° N, 33.8541° E',
    speciesCount: 750,
    healthIndex: 9.7,
    status: 'PRIME PROTECTORATE',
    statusAr: 'محمية ذات أولوية قصوى'
  },
  {
    id: 'WG-M02',
    name: 'Wadi El Gemal',
    nameAr: 'محمية وادي الجمال',
    desc: 'A vast expanse of coastal lagoons, mangroves, and desert peaks. Home to the legendary emerald mines and dugong populations.',
    descAr: 'مساحات شاسعة من البحيرات الساحلية والمنجروف والقمم الجبلية. موطن لمناجم الزمرد التاريخية ومجتمعات الأطوم.',
    img: '/wadi_el_gemal_mangroves_aerial_1774861445577.png',
    coords: '24.6644° N, 35.0886° E',
    speciesCount: 650,
    healthIndex: 9.4,
    status: 'NATURE RESERVE',
    statusAr: 'محمية طبيعية ووطنية'
  },
  {
    id: 'GE-S03',
    name: 'Gebel Elba',
    nameAr: 'محمية جبل علبة',
    desc: 'An unparalleled mist oasis in the desert offering unique biodiversity, rich flora, and a meeting point of distinct ecosystems.',
    descAr: 'واحة ضبابية فريدة في الصحراء توفر تنوعاً بيولوجياً نادراً ونباتات غنية، وتعتبر نقطة التقاء لنظم بيئية متميزة.',
    img: '/red_sea_sunset_mountains_1774790636632.png',
    coords: '22.1833° N, 36.3333° E',
    speciesCount: 920,
    healthIndex: 9.8,
    status: 'BIOSPHERE RESERVE',
    statusAr: 'محمية محيط حيوي'
  },
  {
    id: 'CR-M04',
    name: 'Coral Reef Protectorate',
    nameAr: 'محمية الحيد المرجاني',
    desc: 'Vibrant, resilient, and extensive coral reef systems providing critical habitat for diverse marine life and world-class diving.',
    descAr: 'أنظمة شعاب مرجانية نابضة بالحياة وممتدة توفر موائل حرجة للحياة البحرية المتنوعة وتجارب غوص عالمية.',
    img: '/brother_islands_reef_wall_1774861464852.png',
    coords: '25.3131° N, 34.8569° E',
    speciesCount: 1100,
    healthIndex: 9.9,
    status: 'MARINE SANCTUARY',
    statusAr: 'ملاذ بحري'
  }
];

export default function ReservesClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';

  return (
    <div className="bg-[#0a1628] text-white min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[150px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] pointer-events-none" />

         <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6 relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Compass size={24} strokeWidth={2.5} />
               </div>
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">Strategic Spatial Intelligence</span>
            </div>
            
            <h1 className="text-6xl md:text-[6rem] font-black leading-[0.9] tracking-tighter uppercase italic drop-shadow-2xl">
               {isAr ? 'شبكة المحميات البحرية' : 'Marine Reserves Network'}
            </h1>
            
            <p className="text-xl md:text-2xl font-medium text-slate-400 max-w-3xl italic">
               {isAr 
                 ? 'مركز القيادة المكانية لاستكشاف أغلى النظم البيئية وأكثرها تنوعاً في البحر الأحمر.' 
                 : 'Spatial command hub for exploring the most precious and diverse ecosystems in the Red Sea territory.'}
            </p>
         </div>
      </section>

      {/* ── Interactive Reserves Grid ────────────────────────────────────── */}
      <section className="pb-40 px-6">
         <div className="max-w-7xl mx-auto space-y-32">
            {RESERVES.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row gap-20 items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                 {/* Visual HUD Container */}
                 <div className="lg:w-3/5 relative group">
                    <div className="absolute -inset-4 bg-teal-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="aspect-[16/10] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
                       <img 
                         src={item.img} 
                         alt={item.name}
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-60" />
                       
                       {/* Floating HUD Elements */}
                       <div className="absolute top-8 left-8 flex flex-col gap-4">
                          <div className="px-5 py-2.5 rounded-2xl bg-[#0a1628]/80 backdrop-blur-xl border border-white/10 flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                             <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">{isAr ? item.statusAr : item.status}</span>
                          </div>
                       </div>

                       <div className="absolute bottom-8 right-8 left-8 flex justify-between items-end">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest italic">{isAr ? 'الإحداثيات المكانية' : 'Spatial Coordinates'}</p>
                             <p className="text-sm font-black italic tracking-tighter text-white uppercase">{item.coords}</p>
                          </div>
                          <div className="flex gap-4">
                             <div className="text-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Health index</p>
                                <p className={`text-xl font-black font-mono leading-none ${item.healthIndex > 9.5 ? 'text-emerald-500' : 'text-teal-400'}`}>{item.healthIndex}</p>
                             </div>
                             <div className="text-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Species</p>
                                <p className="text-xl font-black font-mono leading-none text-white">{item.speciesCount}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Information Briefing */}
                 <div className="lg:w-2/5 space-y-10">
                    <div className="space-y-4">
                       <span className="text-[11px] font-black text-teal-500 uppercase tracking-[0.3em] font-mono">{item.id}</span>
                       <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                          {isAr ? item.nameAr : item.name}
                       </h2>
                    </div>

                    <p className="text-xl text-slate-400 font-medium leading-relaxed italic border-l-2 border-teal-500/30 pl-6 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-6">
                       {isAr ? item.descAr : item.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Protection Type</h4>
                          <p className="text-sm font-bold text-white uppercase italic">{isAr ? 'درجة أولى' : 'Type I Sanctuary'}</p>
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Deployment Area</h4>
                          <p className="text-sm font-bold text-white uppercase italic">{isAr ? 'منطقة مركزية' : 'Core Alpha Zone'}</p>
                       </div>
                    </div>

                    <div className="pt-6">
                       <button className="px-10 py-5 rounded-2xl bg-teal-500 text-[#001529] font-black text-sm tracking-tighter uppercase italic hover:bg-teal-400 transition-all flex items-center gap-3 shadow-[0_20px_40px_rgba(45,212,191,0.1)] group">
                          {isAr ? 'تقارير الميدان التفصيلية' : 'Detailed Field Briefings'}
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* ── Global Network Stats ─────────────────────────────────────────── */}
      <section className="py-40 bg-slate-900/40 relative">
         <div className="max-w-7xl mx-auto px-6 text-center space-y-16 relative z-10">
            <div className="space-y-4 max-w-2xl mx-auto">
               <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                  {isAr ? 'ذكاء الشبكة الموحد' : 'Unified Network Intelligence'}
               </h2>
               <p className="text-lg text-slate-400 font-medium italic italic">
                  {isAr 
                    ? 'نحن نراقب آلاف الهكتارات من الشعاب المرجانية والأنواع النادرة من خلال شبكة استشعار ورقابة ذكية.' 
                    : 'Monitoring thousands of reef hectares and rare species via an integrated sensory intelligence network.'}
               </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
               {[
                 { l: 'Total Coverage', v: '9,442 ha', i: Globe },
                 { l: 'Active Sensors', v: '158 Units', i: Zap },
                 { l: 'Patrol Strength', v: '4.2 Ops/D', i: ShieldCheck },
                 { l: 'Reef Stability', v: '98.2%', i: Activity },
               ].map((stat, i) => (
                 <div key={i} className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 mx-auto border border-teal-500/20 shadow-[0_0_30px_rgba(45,212,191,0.1)]">
                       <stat.i size={28} />
                    </div>
                    <div className="text-3xl font-black text-white font-mono tracking-tighter italic">{stat.v}</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{stat.l}</div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
