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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5" dir={isAr ? 'rtl' : 'ltr'}>
      <Card className="p-4 md:p-5 border-none bg-th-surface2 backdrop-blur-xl group hover:bg-th-surface transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-0.5">{isAr ? 'برامج الرصد' : 'Eco Programs'}</p>
            <span className="text-xl md:text-2xl font-black text-th-text font-mono">{ecoProgramsCount}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-5 border-none bg-th-surface2 backdrop-blur-xl group hover:bg-th-surface transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-0.5">{isAr ? 'حالات الجنوح' : 'Strandings'}</p>
            <span className="text-xl md:text-2xl font-black text-th-text font-mono">{strandingCasesCount}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-5 border-none bg-th-surface2 backdrop-blur-xl group hover:bg-th-surface transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Navigation size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-0.5">{isAr ? 'المشاهدات' : 'Sightings'}</p>
            <span className="text-xl md:text-2xl font-black text-th-text font-mono">{sightingsCount}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-5 border-none bg-th-surface2 backdrop-blur-xl group hover:bg-th-surface transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Waves size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-0.5">{isAr ? 'مسوحات الشواطئ' : 'Beach Surveys'}</p>
            <span className="text-xl md:text-2xl font-black text-th-text font-mono">{beachSurveysCount}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
