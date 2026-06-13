'use client';

import React from 'react';
import { Map, Construction, Compass, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function GISPage({ params: { lang } }: { params: { lang: string } }) {
  const isArabic = lang === 'ar';

  return (
    <div className="max-w-[1600px] mx-auto space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between bg-th-surface2 p-4 md:p-6 rounded-2xl border border-th-border shadow-sm gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
              <Map size={24} />
           </div>
           <div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 block mb-1">
                 {isArabic ? 'التحليل المكاني' : 'Spatial Analysis'}
             </span>
             <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-th-text uppercase m-0 leading-none">
                 {isArabic ? 'نظم المعلومات الجغرافية' : 'GIS & Maps'}
             </h1>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-start shrink-0">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-500/20 shadow-inner">
            <Construction size={18} className="animate-pulse" />
            <span className="text-sm">{isArabic ? 'قريباً - تحت الإنشاء' : 'Coming Soon'}</span>
          </div>
        </div>
      </div>

      <div className="min-h-[50vh] flex items-center justify-center">
        <Card className="max-w-2xl w-full p-10 md:p-16 flex flex-col items-center justify-center text-center bg-th-surface backdrop-blur-xl border border-th-border shadow-xl rounded-3xl relative overflow-hidden group">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full filter blur-[80px] -z-10 group-hover:bg-teal-500/20 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-[80px] -z-10 group-hover:bg-blue-500/20 transition-all duration-1000" />
          
          {/* Animated Icon Grid */}
          <div className="relative mb-10">
            <div className="w-24 h-24 rounded-full bg-teal-500/10 flex items-center justify-center relative z-10 animate-pulse">
              <Map size={48} className="text-teal-500" />
            </div>
            <Compass size={24} className="text-blue-400 absolute -top-4 -right-4 animate-[spin_10s_linear_infinite]" />
            <Navigation size={24} className="text-emerald-400 absolute -bottom-4 -left-4 animate-bounce" />
          </div>

          <h2 className="text-3xl font-black text-th-text mb-4 tracking-tight drop-shadow-sm">
            {isArabic ? 'نظام الخرائط التفاعلية' : 'Interactive Mapping System'}
          </h2>
          
          <p className="text-lg text-th-muted font-medium max-w-lg leading-relaxed">
            {isArabic 
              ? 'هذا القسم مخصص للخرائط التفاعلية وتحليل البيانات الجغرافية للمحميات. يجري حالياً بناء وتجهيز هذا النظام وسيكون متاحاً قريباً.' 
              : 'This section is dedicated to interactive mapping and spatial data analysis for the reserves. The system is currently under construction and will be available soon.'}
          </p>
        </Card>
      </div>
    </div>
  );
}
