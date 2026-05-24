'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Target, 
  CheckCircle2, 
  ChevronRight, 
  Tag,
  Navigation,
  Globe,
  Waves,
  Zap,
  Info,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

const EVENTS = [
  {
    id: 'EV-4422',
    title: 'Volunteer Reef Restoration Mission',
    titleAr: 'مهمة تطوعية لترميم الشعاب المرجانية',
    date: 'April 12, 2026',
    time: '08:00 AM',
    location: 'Wadi El Gemal Sector B',
    locationAr: 'قطاع وادي الجمال - المنطقة ب',
    category: 'CONSERVATION OPS',
    categoryAr: 'عمليات الحفظ',
    slots: '12/40 Slots Available',
    slotsAr: 'متبقي 12 من أصل 40 مقعد',
    img: '/wadi_el_gemal_mangroves_aerial_1774861445577.png',
    status: 'ACTIVE'
  },
  {
    id: 'EV-4425',
    title: 'Marine Biodiversity Awareness Lecture',
    titleAr: 'محاضرة التوعية بالتنوع البيولوجي البحري',
    date: 'May 05, 2026',
    time: '18:30 PM',
    location: 'Gebel Elba Info Hub',
    locationAr: 'مركز معلومات جبل علبة',
    category: 'EDUCATION',
    categoryAr: 'التوعية التعليمية',
    slots: 'OPEN ACCESS',
    slotsAr: 'متاح للجميع',
    img: '/red_sea_sunset_mountains_1774790636632.png',
    status: 'SCHEDULED'
  },
  {
    id: 'EV-4430',
    title: 'Underwater Photography Championship',
    titleAr: 'بطولة التصوير تحت الماء للمحترفين',
    date: 'June 15, 2026',
    time: '07:00 AM',
    location: 'Coral Reef Deep Site',
    locationAr: 'موقع الحيد المرجاني العميق',
    category: 'COMMUNITY',
    categoryAr: 'فعاليات المجتمع',
    slots: '5/20 Slots Available',
    slotsAr: 'متبقي 5 من أصل 20 مقعد',
    img: '/brother_islands_reef_wall_1774861464852.png',
    status: 'URGENT'
  }
];

export default function EventsClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';

  return (
    <div className="bg-[#0a1628] text-white min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      {/* ── Strategic Mission Header ────────────────────────────────────────── */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-10">
         <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <CalendarDays size={24} strokeWidth={2.5} />
               </div>
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">Civic Deployment Schedule</span>
            </div>
            <h1 className="text-7xl md:text-[8rem] font-black uppercase italic tracking-tighter leading-[0.8] drop-shadow-2xl">
               {isAr ? 'جدول المهام المجتمعية' : 'Mission Schedule'}
            </h1>
         </div>
         
         <div className="flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-white transition-all cursor-pointer">
               {isAr ? 'عرض التقويم' : 'Calendar Grid'}
            </div>
            <div className="px-6 py-3 rounded-2xl bg-teal-500 text-[#001529] text-[11px] font-black uppercase tracking-widest italic shadow-2xl">
               {isAr ? 'الفعاليات النشطة' : 'Active Missions'}
            </div>
         </div>
      </section>

      {/* ── Event Timeline ─────────────────────────────────────────────────── */}
      <section className="pb-40 px-6 max-w-7xl mx-auto space-y-12">
         {EVENTS.map((event, i) => (
           <motion.div
             key={event.id}
             initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
             className="relative flex flex-col lg:flex-row bg-[#0c1b2f]/60 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden group hover:border-teal-500/20 transition-all shadow-2xl"
           >
              {/* Media Hub */}
              <div className="lg:w-1/3 h-80 lg:h-auto relative overflow-hidden">
                 <img src={event.img} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[3s]" alt={event.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-60" />
                 <div className="absolute top-8 left-8">
                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase italic border ${event.status === 'URGENT' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'}`}>
                       {event.status}
                    </div>
                 </div>
              </div>

              {/* Intel Briefing */}
              <div className="lg:w-2/3 p-12 lg:p-16 flex flex-col justify-between space-y-10">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] font-black text-teal-500 uppercase tracking-[0.3em] font-mono">{event.id}</span>
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                          <Tag size={12} className="text-teal-800" />
                          {isAr ? event.categoryAr : event.category}
                       </div>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none group-hover:text-teal-400 transition-colors">
                       {isAr ? event.titleAr : event.title}
                    </h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-white/5">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Date Delta</p>
                          <p className="text-sm font-bold text-white uppercase italic">{event.date}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Commence Protocol</p>
                          <p className="text-sm font-bold text-white uppercase italic">{event.time}</p>
                       </div>
                       <div className="space-y-2 lg:col-span-2">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Zone Assignment</p>
                          <div className="flex items-center gap-2">
                             <Navigation size={14} className="text-teal-500" />
                             <p className="text-sm font-bold text-white uppercase italic">{isAr ? event.locationAr : event.location}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-6">
                    <div className="flex items-center gap-4">
                       <div className="flex -space-x-3 overflow-hidden">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-[#0a1628] bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black">
                               OP{i}
                            </div>
                          ))}
                       </div>
                       <div className="text-[11px] font-black text-teal-400 uppercase tracking-widest italic">
                          {isAr ? event.slotsAr : event.slots}
                       </div>
                    </div>
                    <button className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm tracking-tighter uppercase italic hover:bg-teal-500 hover:text-black hover:border-teal-500 transition-all flex items-center gap-3 group">
                       {isAr ? 'تسجيل في المهمة' : 'Enroll in Mission'}
                       <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>

              {/* Progress HUD */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.02]">
                 <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '65%' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                 />
              </div>
           </motion.div>
         ))}
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
