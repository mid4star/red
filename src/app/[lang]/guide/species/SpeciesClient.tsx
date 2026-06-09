'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowLeft, 
  Heart, 
  Info, 
  X, 
  Shield, 
  Activity, 
  Layers, 
  Compass, 
  BookOpen, 
  Eye,
  Loader2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { MarineSpecies } from '@/lib/firebase/schema';

export default function SpeciesClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';

  const [species, setSpecies] = useState<MarineSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState<MarineSpecies | null>(null);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const res = await fetch('/api/staff/query?collection=marine_species');
        const json = await res.json();
        if (json.success) {
          setSpecies(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecies();
  }, []);

  // Filter logic
  const filteredSpecies = species.filter(spec => {
    const nameText = isAr ? (spec.nameAr || spec.name) : spec.name;
    const typeText = isAr ? (spec.typeAr || spec.type) : spec.type;
    const matchesSearch = nameText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          typeText.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeCategory === 'all') return matchesSearch;

    if (activeCategory === 'mammals') {
      const isMammal = spec.type.toLowerCase().includes('mammal') || (spec.typeAr || '').includes('ثدييات');
      return matchesSearch && isMammal;
    }
    if (activeCategory === 'reptiles') {
      const isReptile = spec.type.toLowerCase().includes('reptile') || (spec.typeAr || '').includes('زواحف');
      return matchesSearch && isReptile;
    }
    if (activeCategory === 'fish') {
      const isFish = spec.type.toLowerCase().includes('fish') || 
                     spec.type.toLowerCase().includes('giant') || 
                     spec.type.toLowerCase().includes('wrasse') ||
                     (spec.typeAr || '').includes('أسماك');
      return matchesSearch && isFish;
    }

    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const stat = status.toLowerCase();
    if (stat.includes('critical') || stat.includes('بشدة')) {
      return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' };
    }
    if (stat.includes('endangered') || stat.includes('انقراض')) {
      return { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' };
    }
    if (stat.includes('vulnerable') || stat.includes('هش') || stat.includes('مهدد')) {
      return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' };
    }
    return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' };
  };

  return (
    <div className="bg-th-bg text-th-text min-h-screen flex flex-col transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      {/* Main Container */}
      <main className="flex-grow pt-40 pb-24 px-6 max-w-7xl mx-auto w-full space-y-12">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link 
            href={`/${lang}/guide`}
            className="flex items-center gap-2 text-slate-400 hover:text-teal-400 font-mono text-[11px] font-black uppercase tracking-wider transition-colors group"
          >
            <ArrowLeft size={16} className={`group-hover:-translate-x-1 transition-transform ${isAr ? 'rotate-180' : ''}`} />
            {isAr ? 'العودة لدليل الميدان' : 'Back to Field Guide'}
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>{isAr ? 'الرئيسية' : 'Home'}</span>
            <span>/</span>
            <span>{isAr ? 'دليل الزوار' : 'Visitor Guide'}</span>
            <span>/</span>
            <span className="text-teal-400">{isAr ? 'موسوعة الكائنات' : 'Species Encyclopedia'}</span>
          </div>
        </div>

        {/* Heading Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.05)]">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">
              {isAr ? 'قاعدة بيانات الأنواع البحرية المحمية' : 'Protected Marine Species Database'}
            </span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
              {isAr ? 'موسوعة الكائنات البحرية' : 'Marine Species Encyclopedia'}
            </h1>
            <p className="text-lg text-slate-400 font-medium italic leading-relaxed">
              {isAr 
                ? 'استكشف الدليل المعرفي لجميع الكائنات البحرية الخاضعة للحماية والاتفاقيات الدولية في البحر الأحمر.' 
                : 'Explore the ecological directory of all marine creatures protected under national mandates and international treaties in the Red Sea.'}
            </p>
          </div>
        </section>

        {/* Search & Category Filter Controls */}
        <section className="p-6 md:p-8 rounded-[2.5rem] bg-[#0c1b2f]/50 backdrop-blur-2xl border border-white/5 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder={isAr ? 'ابحث عن كائن أو نوع...' : 'Search species or type...'} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-th-surface border border-th-border rounded-2xl py-4 pr-4 ${isAr ? 'pl-4 pr-12' : 'pl-12 pr-4'} text-th-text placeholder-th-muted focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium text-sm shadow-sm`}
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-start md:justify-end">
              {[
                { id: 'all', label: isAr ? 'الكل' : 'All' },
                { id: 'mammals', label: isAr ? 'الثدييات البحرية' : 'Mammals' },
                { id: 'reptiles', label: isAr ? 'الزواحف البحرية' : 'Reptiles' },
                { id: 'fish', label: isAr ? 'الأسماك والعمالقة' : 'Fish & Giants' },
              ].map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border font-mono ${
                      isActive 
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.08)]' 
                        : 'bg-[#081220]/40 text-slate-400 border-white/5 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Species Grid */}
        <section>
          {loading ? (
            <div className="text-center text-slate-500 font-mono py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-teal-400" size={36} />
              <span className="tracking-widest text-sm">{isAr ? 'جاري تحميل سجلات الكائنات...' : 'RETRIEVING SPECIES ARCHIVES...'}</span>
            </div>
          ) : filteredSpecies.length === 0 ? (
            <div className="text-center text-slate-500 font-mono py-32 rounded-[3rem] border border-dashed border-white/5 bg-[#0c1b2f]/20">
              <Compass className="mx-auto text-slate-600 mb-4 animate-pulse" size={48} />
              <p className="text-lg italic mb-2">{isAr ? 'لم يتم العثور على نتائج تطابق بحثك.' : 'NO SPECIES MATCH YOUR CRITERIA.'}</p>
              <p className="text-xs text-slate-600 uppercase tracking-widest">{isAr ? 'جرب كلمات بحث أخرى' : 'Try refining your search keyword'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSpecies.map((spec, i) => {
                const statusStyles = getStatusColor(spec.statusAr || spec.status);
                return (
                  <motion.div
                    key={spec.id || i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    onClick={() => setSelectedSpecies(spec)}
                    className="group relative overflow-hidden rounded-[2.5rem] bg-[#0c1b2f]/40 backdrop-blur-3xl border border-white/5 hover:border-teal-500/20 transition-all duration-500 shadow-2xl flex flex-col cursor-pointer min-h-[440px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                  >
                    {/* Visual Card Deco Bracket */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10 rounded-tr-[2.5rem] pointer-events-none group-hover:border-teal-500/30 transition-colors" />
                    
                    {/* Image Area */}
                    <div className="relative h-60 w-full overflow-hidden">
                      <img 
                        src={spec.imageUrl || '/marsa_alam_dugong_underwater_1774861424689.png'} 
                        alt={spec.name}
                        className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[2.5s] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1b2f] via-transparent to-transparent opacity-90" />
                      
                      {/* Protection Status Badge */}
                      <div className="absolute top-6 left-6">
                        <span className={`px-4 py-1.5 rounded-xl border ${statusStyles.bg} ${statusStyles.border} ${statusStyles.text} text-[9px] font-black uppercase tracking-widest italic shadow-lg`}>
                          {isAr ? spec.statusAr || spec.status : spec.status}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest italic block">
                          {isAr ? spec.typeAr || spec.type : spec.type}
                        </span>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white group-hover:text-teal-400 transition-colors leading-tight">
                          {isAr ? spec.nameAr : spec.name}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium italic leading-relaxed line-clamp-3">
                          {isAr 
                            ? (spec.descriptionAr || '').replace(/<[^>]*>/g, '') 
                            : (spec.description || '').replace(/<[^>]*>/g, '')}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-600">
                          ID: {spec.id?.slice(0, 8).toUpperCase() || 'N/A'}
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider italic text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          {isAr ? 'افتح ملف التقرير' : 'Access Profile'}
                          <span className={`inline-block ${isAr ? 'rotate-180' : ''}`}>→</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Premium Detail Drawer/Modal */}
      <AnimatePresence>
        {selectedSpecies && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpecies(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-lg cursor-pointer"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-5xl bg-[#081220]/95 border border-teal-500/20 rounded-[3rem] shadow-[0_0_100px_rgba(45,212,191,0.15)] flex flex-col lg:flex-row overflow-hidden z-10 text-white min-h-[500px]"
            >
              {/* Sci-Fi Decorative Brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-teal-400 rounded-tl-3xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-teal-400 rounded-tr-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-teal-400 rounded-bl-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-400 rounded-br-3xl pointer-events-none"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedSpecies(null)}
                className="absolute top-6 right-6 z-30 p-3 rounded-2xl bg-black/60 border border-white/10 hover:border-teal-500/50 hover:bg-teal-500/10 hover:scale-105 text-white transition-all shadow-lg"
              >
                <X size={20} />
              </button>

              {/* Image Column */}
              <div className="lg:w-[45%] relative min-h-[300px] lg:min-h-full h-auto">
                <img 
                  src={selectedSpecies.imageUrl || '/marsa_alam_dugong_underwater_1774861424689.png'} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt={selectedSpecies.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#081220] via-transparent to-transparent" />
                
                {/* Float status tag */}
                <div className="absolute top-6 left-6">
                  <span className={`px-4 py-1.5 rounded-xl border ${getStatusColor(selectedSpecies.statusAr || selectedSpecies.status).bg} ${getStatusColor(selectedSpecies.statusAr || selectedSpecies.status).border} ${getStatusColor(selectedSpecies.statusAr || selectedSpecies.status).text} text-[9px] font-black uppercase tracking-widest italic shadow-lg`}>
                    {isAr ? selectedSpecies.statusAr || selectedSpecies.status : selectedSpecies.status}
                  </span>
                </div>
              </div>

              {/* Info Column */}
              <div className="lg:w-[55%] p-8 md:p-14 flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] italic block mb-1">
                      {isAr ? selectedSpecies.typeAr || selectedSpecies.type : selectedSpecies.type}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-tight">
                      {isAr ? selectedSpecies.nameAr : selectedSpecies.name}
                    </h3>
                  </div>

                  <div className="w-16 h-1 bg-teal-500/30 rounded-full" />

                  <p className="text-base text-slate-300 font-medium italic leading-relaxed">
                    {isAr ? selectedSpecies.descriptionAr || selectedSpecies.description : selectedSpecies.description}
                  </p>
                </div>

                {/* Telemetry Visual Details Grid */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                  <div className="p-4 rounded-2xl bg-[#0c1b2f]/50 border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">{isAr ? 'مؤشر الحماية' : 'PROTECTION INDEX'}</span>
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-teal-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-teal-300 italic">{isAr ? 'حماية قصوى' : 'MAX MANDATE'}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-[#0c1b2f]/50 border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">{isAr ? 'حالة التواجد' : 'OBSERVATION STATUS'}</span>
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-orange-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-orange-300 italic">{isAr ? 'مرصود ميدانياً' : 'FIELD OBSERVED'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>ID: {selectedSpecies.id?.toUpperCase() || 'N/A'}</span>
                  <span>REGION: RED_SEA</span>
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
