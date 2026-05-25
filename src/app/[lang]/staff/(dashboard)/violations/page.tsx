'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Violation } from '@/lib/firebase/schema';
import { AlertTriangle, Plus, CheckCircle2, Clock } from 'lucide-react';

export default function ViolationsPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=violations');
      const json = await res.json();
      if (json.success) {
        setViolations(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const columns = [
    { title: isArabic ? 'جديد' : 'New', status: 'OPEN', icon: AlertTriangle, color: 'text-rose-400' },
    { title: isArabic ? 'قيد المعالجة' : 'Processing', status: 'INVESTIGATING', icon: Clock, color: 'text-amber-400' },
    { title: isArabic ? 'تم الحل' : 'Resolved', status: 'RESOLVED', icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-[1500px] mx-auto" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <div className="w-8 h-1 bg-rose-500 rounded-full" />
             <span className="text-[10px] font-black tracking-[0.2em] text-rose-400 uppercase italic">
                 {isArabic ? 'مركز الانتهاكات' : 'Infractions Center'}
             </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{isArabic ? 'إدارة المخالفات' : 'Violations Tracking'}</h1>
        </div>
        <Button intent="primary" className="rounded-2xl py-3.5 px-6 flex items-center gap-2.5 shadow-[0_0_20px_rgba(244,63,94,0.2)] bg-rose-500 text-white hover:bg-rose-400 uppercase italic font-black">
          <Plus size={18} strokeWidth={3} />
          {isArabic ? 'بلاغ جديد' : 'New Report'}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {columns.map(col => {
          const Icon = col.icon;
          return (
          <div key={col.status} className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-4 flex flex-col border border-white/5">
            <h3 className="font-bold mb-4 flex justify-between items-center text-white pb-3 border-b border-white/5">
              <span className="flex items-center gap-2">
                <Icon size={16} className={col.color} />
                <span className="tracking-tight uppercase">{col.title}</span>
              </span>
              <Badge className="bg-white/10 text-white border-none">{violations.filter(v => v.status === col.status).length}</Badge>
            </h3>
            
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {violations.filter(v => v.status === col.status).map(violation => (
                <Card key={violation.id} interactive className="p-4 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors border-l-4 border-l-rose-500">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black tracking-widest text-slate-500">{violation.code}</span>
                    <Badge size="sm" color={violation.severity === 'HIGH' ? 'danger' : 'warning'} className="text-[9px] font-black px-2">
                      {violation.severity}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm mb-1 text-white">{isArabic ? violation.typeAr : violation.type}</h4>
                  <p className="text-[11px] text-slate-400 mb-3 font-medium line-clamp-2">{violation.description}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2">
                    <span className="text-[10px] font-bold text-teal-400 tracking-tight uppercase flex items-center gap-1">📍 {isArabic ? violation.locationAr : violation.location}</span>
                    <Button size="sm" intent="ghost" className="text-slate-400 hover:text-white h-7 px-3 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 border-transparent">Edit</Button>
                  </div>
                </Card>
              ))}
              
              {violations.filter(v => v.status === col.status).length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm italic font-medium uppercase tracking-widest">
                  {isArabic ? 'لا توجد بلاغات' : 'No Reports Found'}
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
