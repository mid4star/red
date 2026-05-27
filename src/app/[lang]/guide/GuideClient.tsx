'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Map, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  Waves, 
  Globe, 
  Zap, 
  Compass, 
  Eye, 
  Shield, 
  Droplets,
  Microscope,
  LifeBuoy,
  FileText,
  Navigation,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { VisitorGuideSection, MarineSpecies, MapLocation } from '@/lib/firebase/schema';

// Dynamically import TopographyMap to bypass Next.js SSR leaflet errors
const TopographyMap = dynamic(() => import('@/components/guide/TopographyMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#070f1e] flex items-center justify-center rounded-[4rem] border border-white/10 min-h-[450px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-teal-400" size={32} />
        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          Loading GIS Telemetry Map...
        </span>
      </div>
    </div>
  )
});

export default function GuideClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';

  const [guideSections, setGuideSections] = useState<VisitorGuideSection[]>([]);
  const [species, setSpecies] = useState<MarineSpecies[]>([]);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSpecies, setSelectedSpecies] = useState<MarineSpecies | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [resGuide, resSpecies, resLocations] = await Promise.all([
          fetch('/api/staff/query?collection=visitor_guide').then(r => r.json()),
          fetch('/api/staff/query?collection=marine_species').then(r => r.json()),
          fetch('/api/staff/query?collection=map_locations').then(r => r.json())
        ]);

        if (resGuide.success) {
          const sorted = [...resGuide.data].sort((a, b) => (a.order || 0) - (b.order || 0));
          setGuideSections(sorted);
        }
        if (resSpecies.success) {
          setSpecies(resSpecies.data);
        }
        if (resLocations.success) {
          setLocations(resLocations.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  return (
    <div className="bg-[#0a1628] text-white min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      {/* ── Strategic Field Briefing Header ───────────────────────────────── */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto space-y-12">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
               <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">
               {isAr ? 'دليل الانتشار التكتيكي' : 'Tactical Deployment Guide'}
            </span>
         </div>
         
         <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
            <div className="max-w-4xl space-y-6">
               <h1 className="text-4xl md:text-6xl lg:text-[7.5rem] font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1] drop-shadow-2xl">
                  {isAr ? 'دليل الإحاطة الميداني' : 'Strategic Field Briefing'}
               </h1>
            </div>
            <div className="flex flex-col items-end gap-4">
               <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-teal-900/10 border border-teal-500/10">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest italic">
                     {isAr ? 'حالة النظام: قطاعات مفتوحة' : 'System Status: Sectors Open'}
                  </span>
               </div>
            </div>
         </div>
      </section>

      {/* ── Sectional Intel ─────────────────────────────────────────────── */}
      <section className="pb-40 px-6 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {loading ? (
               <div className="col-span-3 text-center text-slate-500 font-mono py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-teal-400" size={24} />
                  <span>{isAr ? 'جاري تحميل البيانات الميدانية...' : 'LOADING FIELD INTEL TELEMETRY...'}</span>
               </div>
            ) : guideSections.length === 0 ? (
               <div className="col-span-3 text-center text-slate-500 font-mono py-20">
                  {isAr ? 'لا توجد أقسام إحاطة متاحة حالياً.' : 'NO FIELD BRIEFING SECTIONS AVAILABLE.'}
               </div>
            ) : (
               guideSections.map((section, i) => {
                  const icons = [Compass, ShieldCheck, LifeBuoy, BookOpen];
                  const IconComponent = icons[i % icons.length] || Compass;
                  return (
                     <motion.div 
                       key={section.id || i}
                       initial={{ opacity: 0, y: 30 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.15 }}
                       viewport={{ once: true }}
                       className="group p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] bg-[#0c1b2f]/60 backdrop-blur-3xl border border-white/5 hover:border-teal-500/20 transition-all shadow-2xl relative flex flex-col justify-between h-auto lg:h-[500px]"
                     >
                        <div className="space-y-8">
                           <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(45,212,191,0.05)]">
                              <IconComponent size={32} />
                           </div>
                           <div className="space-y-4">
                              <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-tight group-hover:text-teal-400 transition-colors">
                                 {isAr ? section.titleAr : section.title}
                              </h3>
                              <p className="text-base text-slate-400 font-medium italic leading-relaxed line-clamp-[6]">
                                 {isAr ? section.contentAr : section.content}
                              </p>
                           </div>
                        </div>

                        <div className="space-y-4 mt-8">
                           {section.links && section.links.map((link: any, j: number) => (
                             <div key={j} className="flex justify-between items-center group/link cursor-pointer">
                                <span className="text-[11px] font-black text-slate-500 group-hover/link:text-teal-400 uppercase tracking-[0.2em] italic transition-colors">
                                   {isAr ? link.nAr : link.n}
                                </span>
                                <ArrowRight size={14} className="text-slate-700 group-hover/link:text-teal-500 group-hover/link:translate-x-1 transition-all" />
                             </div>
                           ))}
                        </div>
                     </motion.div>
                  );
               })
            )}
         </div>
      </section>

      {/* ── Species Tactical Encyclopedia ─────────────────────────────────── */}
      <section className="py-40 bg-slate-900/40 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-2/5 space-y-10">
               <div className="space-y-4">
                  <span className="text-[11px] font-black text-teal-400 uppercase tracking-[0.4em] italic leading-tight">
                     {isAr ? 'مركز معلومات الأنواع' : 'Species Intelligence Hub'}
                  </span>
                  <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1]">
                     {isAr ? 'موسوعة الكائنات البحرية' : 'Marine Species Encyclopedia'}
                  </h2>
               </div>
               <p className="text-xl text-slate-400 font-medium italic leading-relaxed">
                  {isAr 
                    ? 'مركز بيانات استراتيجي لجميع الكائنات البحرية المحمية في إقليم البحر الأحمر.' 
                    : 'A strategic data hub for all protected marine species within the Red Sea territory.'}
               </p>
               <button 
                 onClick={() => {
                   if (species.length > 0) setSelectedSpecies(species[0]);
                 }}
                 className="px-10 py-5 rounded-2xl bg-teal-500 text-[#001529] font-black text-sm tracking-tighter uppercase italic hover:bg-teal-400 transition-all flex items-center gap-3"
               >
                  {isAr ? 'افتح الموسوعة الكاملة' : 'Deploy Full Encyclopedia'}
                  <FileText size={18} />
               </button>
            </div>

            <div className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-8">
               {loading ? (
                  <div className="col-span-2 text-center text-slate-500 font-mono py-20 flex flex-col items-center justify-center gap-3">
                     <Loader2 className="animate-spin text-teal-400" size={24} />
                     <span>{isAr ? 'جاري تحميل الكائنات...' : 'LOADING SPECIES TELEMETRY...'}</span>
                  </div>
               ) : species.length === 0 ? (
                  <div className="col-span-2 text-center text-slate-500 font-mono py-20">
                     {isAr ? 'لا توجد كائنات مسجلة حالياً.' : 'NO REGISTERED SPECIES FOUND.'}
                  </div>
               ) : (
                  species.map((spec, i) => (
                    <div 
                      key={spec.id || i} 
                      onClick={() => setSelectedSpecies(spec)}
                      className="group relative h-80 sm:h-96 rounded-2xl sm:rounded-[3rem] overflow-hidden border border-white/5 cursor-pointer shadow-xl"
                    >
                       <img 
                         src={spec.imageUrl || '/marsa_alam_dugong_underwater_1774861424689.png'} 
                         className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" 
                         alt={spec.name} 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-80" />
                       
                       <div className="absolute top-8 left-8">
                          <span className="px-4 py-1.5 rounded-xl bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-[9px] font-black text-orange-400 uppercase tracking-widest italic">
                             {isAr ? spec.statusAr || spec.status : spec.status}
                          </span>
                       </div>

                       <div className="absolute bottom-8 left-8 right-8 space-y-1">
                          <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white group-hover:text-teal-400 transition-colors">
                             {isAr ? spec.nameAr : spec.name}
                          </h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                             {isAr ? spec.typeAr || spec.type : spec.type}
                          </p>
                       </div>
                    </div>
                  ))
               )}
            </div>
         </div>
      </section>

      {/* ── Interactive Site Map Preview ─────────────────────────────────── */}
      <section className="py-40 px-6 max-w-7xl mx-auto space-y-12">
         <div className="text-center space-y-4">
            <span className="text-[11px] font-black text-teal-400 uppercase tracking-[0.4em] italic">
               {isAr ? 'نظام تحديد المواقع الجغرافي اللحظي' : 'REAL-TIME GIS LOCATIONS SYSTEM'}
            </span>
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none opacity-20">
               {isAr ? 'استكشف التضاريس' : 'Explore the Topography'}
            </h2>
         </div>
         
         <div className="h-[350px] sm:h-[600px] w-full relative">
            <TopographyMap 
               locations={locations} 
               lang={lang} 
               selectedLocation={selectedLocation} 
               onSelectLocation={setSelectedLocation} 
            />
         </div>
      </section>

      {/* ── Premium Detail Modal for Species ─────────────────────────────── */}
      <AnimatePresence>
        {selectedSpecies && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpecies(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#081220]/95 border border-teal-500/30 rounded-[2.5rem] shadow-[0_0_80px_rgba(45,212,191,0.2)] flex flex-col md:flex-row z-10 text-white"
            >
              {/* Sci-Fi Decorative Corner Brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-2xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br-2xl pointer-events-none"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedSpecies(null)}
                className="absolute top-6 right-6 z-20 p-2.5 rounded-xl bg-black/50 border border-white/10 hover:border-teal-500/50 hover:bg-teal-500/10 hover:scale-105 text-white transition-all"
              >
                <X size={20} />
              </button>

              {/* Species Image Side */}
              <div className="md:w-1/2 relative h-56 md:h-auto min-h-[220px] md:min-h-[350px]">
                <img 
                  src={selectedSpecies.imageUrl || '/marsa_alam_dugong_underwater_1774861424689.png'} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt={selectedSpecies.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#081220] via-transparent to-transparent" />
                
                {/* Status Indicator */}
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 rounded-xl bg-orange-500/25 backdrop-blur-md border border-orange-500/40 text-[9px] font-black text-orange-400 uppercase tracking-widest italic shadow-lg">
                    {isAr ? selectedSpecies.statusAr || selectedSpecies.status : selectedSpecies.status}
                  </span>
                </div>
              </div>

              {/* Species Details Side */}
              <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] italic block mb-1">
                       {isAr ? selectedSpecies.typeAr || selectedSpecies.type : selectedSpecies.type}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                      {isAr ? selectedSpecies.nameAr : selectedSpecies.name}
                    </h3>
                  </div>

                  <div className="w-16 h-1 bg-teal-500/30 rounded-full" />

                  <p className="text-base text-slate-300 font-medium italic leading-relaxed">
                    {isAr ? selectedSpecies.descriptionAr || selectedSpecies.description : selectedSpecies.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-teal-500/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>SPECIES_TELEMETRY: {selectedSpecies.id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
                  <span>SECTOR: RED_SEA_HQ</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PublicFooter lang={lang} />
    </div>
  );
}
