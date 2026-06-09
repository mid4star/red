'use client';

import React from 'react';
import { Map, Construction, Compass, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function GISPage({ params: { lang } }: { params: { lang: string } }) {
  const isArabic = lang === 'ar';

  return (
    <div className={`p-6 md:p-12 min-h-[80vh] flex items-center justify-center ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <Card className="max-w-2xl w-full p-10 md:p-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-2xl rounded-3xl relative overflow-hidden group">
        
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

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight drop-shadow-sm">
          {isArabic ? 'نظم المعلومات الجغرافية' : 'GIS & Maps'}
        </h1>
        
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-lg leading-relaxed">
          {isArabic 
            ? 'هذا القسم مخصص للخرائط التفاعلية وتحليل البيانات الجغرافية للمحميات. يجري حالياً بناء وتجهيز هذا النظام وسيكون متاحاً قريباً.' 
            : 'This section is dedicated to interactive mapping and spatial data analysis for the reserves. The system is currently under construction and will be available soon.'}
        </p>

        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-500/20 shadow-inner">
          <Construction size={20} className="animate-pulse" />
          <span>{isArabic ? 'قريباً - تحت الإنشاء' : 'Coming Soon - Under Construction'}</span>
        </div>

      </Card>
    </div>
  );
}
