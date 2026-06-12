'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';

interface StatsProps {
  costsCount: number;
  inspectionsCount: number;
  violationsCount: number;
  accidentsCount: number;
  lang: string;
}

export default function EIAStats({
  costsCount,
  inspectionsCount,
  violationsCount,
  accidentsCount,
  lang
}: StatsProps) {
  const isAr = lang === 'ar';

  const baseCardClass = "relative overflow-hidden p-4 md:p-5 border border-th-border bg-th-surface2 rounded-2xl group hover:border-teal-500/30 transition-all duration-300 shadow-sm cursor-default";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5" dir={isAr ? 'rtl' : 'ltr'}>
      <Card className={baseCardClass}>
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-1">{isAr ? 'تكاليف' : 'Costs'}</p>
            <span className="text-2xl md:text-3xl font-black text-th-text font-mono tracking-tight">{costsCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <FileText size={24} strokeWidth={2.5} />
          </div>
        </div>
      </Card>

      <Card className={baseCardClass}>
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-1">{isAr ? 'تفتيش' : 'Inspections'}</p>
            <span className="text-2xl md:text-3xl font-black text-th-text font-mono tracking-tight">{inspectionsCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <ShieldAlert size={24} strokeWidth={2.5} />
          </div>
        </div>
      </Card>

      <Card className={baseCardClass}>
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-1">{isAr ? 'مخالفات' : 'Violations'}</p>
            <span className="text-2xl md:text-3xl font-black text-th-text font-mono tracking-tight">{violationsCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <AlertTriangle size={24} strokeWidth={2.5} />
          </div>
        </div>
      </Card>

      <Card className={baseCardClass}>
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-th-muted mb-1">{isAr ? 'حوادث' : 'Accidents'}</p>
            <span className="text-2xl md:text-3xl font-black text-th-text font-mono tracking-tight">{accidentsCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <Clock size={24} strokeWidth={2.5} />
          </div>
        </div>
      </Card>
    </div>
  );
}
