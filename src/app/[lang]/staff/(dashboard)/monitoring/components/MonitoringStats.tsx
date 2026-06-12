'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Activity, Navigation, AlertCircle, Waves } from 'lucide-react';

interface StatsProps {
  ecoProgramsCount: number;
  strandingCasesCount: number;
  sightingsCount: number;
  beachSurveysCount: number;
  lang: string;
}

export default function MonitoringStats({
  ecoProgramsCount,
  strandingCasesCount,
  sightingsCount,
  beachSurveysCount,
  lang
}: StatsProps) {
  const isAr = lang === 'ar';

  const baseCardClass = "relative overflow-hidden p-4 md:p-5 border border-th-border bg-th-surface2 rounded-2xl group hover:border-teal-500/30 transition-all duration-300 shadow-sm cursor-default";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5" dir={isAr ? 'rtl' : 'ltr'}>
      <Card className={baseCardClass}>
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-1">{isAr ? 'برامج الرصد' : 'Eco Programs'}</p>
            <span className="text-2xl md:text-3xl font-black text-th-text font-mono tracking-tight">{ecoProgramsCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <Activity size={24} strokeWidth={2.5} />
          </div>
        </div>
      </Card>

      <Card className={baseCardClass}>
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-1">{isAr ? 'حالات الجنوح' : 'Strandings'}</p>
            <span className="text-2xl md:text-3xl font-black text-th-text font-mono tracking-tight">{strandingCasesCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <AlertCircle size={24} strokeWidth={2.5} />
          </div>
        </div>
      </Card>

      <Card className={baseCardClass}>
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-1">{isAr ? 'المشاهدات' : 'Sightings'}</p>
            <span className="text-2xl md:text-3xl font-black text-th-text font-mono tracking-tight">{sightingsCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <Navigation size={24} strokeWidth={2.5} />
          </div>
        </div>
      </Card>

      <Card className={baseCardClass}>
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-1">{isAr ? 'مسوحات الشواطئ' : 'Beach Surveys'}</p>
            <span className="text-2xl md:text-3xl font-black text-th-text font-mono tracking-tight">{beachSurveysCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <Waves size={24} strokeWidth={2.5} />
          </div>
        </div>
      </Card>
    </div>
  );
}
