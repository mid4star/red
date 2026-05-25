'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FleetVessel } from '@/lib/firebase/schema';
import { 
  Ship, 
  Search, 
  Plus, 
  Filter, 
  Activity, 
  ShieldCheck, 
  Settings2, 
  Fuel, 
  Clock, 
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Tag,
  Waves
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ─── Constants & Mock Data ───────────────────────────────────────────────────

const FLEET_STATS = [
  { label: 'Total Vessels', labelAr: 'إجمالي الوحدات البحرية', value: '12', icon: Ship, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Active Missions', labelAr: 'مهمات نشطة', value: '5', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Scheduled Maintenance', labelAr: 'صيانة مجدولة', value: '3', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Safety Compliance', labelAr: 'امتثال السلامة', value: '98%', icon: ShieldCheck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
];

// Mock data replaced with real-time Firebase subscription

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({ stat, isAr }: { stat: typeof FLEET_STATS[0], isAr: boolean }) {
  const Icon = stat.icon;
  return (
    <Card className="p-5 border-none bg-slate-900/40 backdrop-blur-xl shadow-none hover:shadow-2xl hover:shadow-teal-500/10 transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
             {isAr ? stat.labelAr : stat.label}
          </p>
          <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-5 text-white group-hover:scale-125 transition-transform duration-700">
         <Icon size={80} />
      </div>
    </Card>
  );
}

function VesselCard({ vessel, isAr }: { vessel: FleetVessel, isAr: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className="group border border-white/5 overflow-hidden hover:shadow-[0_0_30px_rgba(45,212,191,0.1)] transition-all duration-500 bg-slate-900/40 backdrop-blur-xl">
        {/* Card Header & Visual */}
        <div className="relative h-48 bg-slate-950 overflow-hidden border-b border-white/5">
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10" />
           
           {/* Placeholder for Vessel Image */}
           <div className="absolute inset-0 flex items-center justify-center bg-[#0a1628]">
              <div className="relative">
                 <Waves size={80} className="text-teal-500/10 animate-pulse" />
                 <Ship size={48} className="text-white/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
              </div>
           </div>

           {/* Top Badges */}
           <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-20 flex gap-2`}>
              <button className="w-8 h-8 rounded-full bg-slate-900/50 backdrop-blur-md text-slate-300 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                 <MoreVertical size={16} />
              </button>
           </div>
           
            <div className={`absolute bottom-4 ${isAr ? 'right-4' : 'left-4'} z-20`}>
              <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-0.5">#{vessel.code}</p>
              <h3 className="text-white text-lg font-bold tracking-tight">
                {isAr ? vessel.nameAr : vessel.name}
              </h3>
           </div>
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-5">
           <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                 <Tag size={14} className="text-teal-400" />
                 {vessel.type}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full animate-pulse ${vessel.status === 'ACTIVE' || vessel.status === 'MISSION' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className={`text-[11px] font-bold tracking-tight ${vessel.status === 'ACTIVE' || vessel.status === 'MISSION' ? 'text-emerald-400' : 'text-amber-400'}`}>
                   {vessel.status}
                </span>
              </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                 <div className="flex items-center gap-2 mb-1">
                    <Fuel size={14} className="text-blue-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{isAr ? 'الوقود' : 'Fuel'}</span>
                 </div>
                 <div className="flex items-end justify-between">
                    <span className="text-sm font-bold text-white">{vessel.fuelLevel}%</span>
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden mb-1">
                       <div className="h-full bg-blue-500 rounded-full" style={{ width: `${vessel.fuelLevel}%` }} />
                    </div>
                 </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                 <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-indigo-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{isAr ? 'ساعات' : 'Hours'}</span>
                 </div>
                 <span className="text-sm font-bold text-white">{vessel.engineHours.toLocaleString()}</span>
              </div>
           </div>

           {/* Capacity/Health Bar */}
           <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">
                    {isAr ? 'الحالة التشغيلية' : 'Operational Health'}
                 </span>
                 <span className="text-[10px] font-black text-white">{vessel.healthScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ${vessel.healthScore > 80 ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.3)]' : vessel.healthScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                   style={{ width: `${vessel.healthScore}%` }} 
                 />
              </div>
           </div>

           {/* Footer Action */}
           <div className="pt-2 flex gap-2">
              <Button intent="primary" className="flex-1 text-[11px] font-black py-2.5 shadow-[0_0_15px_rgba(20,184,166,0.2)] bg-teal-500 text-[#001529] hover:bg-teal-400 uppercase italic">
                {isAr ? 'إدارة الوحدة' : 'Manage Unit'}
              </Button>
              <Button intent="outline" className="px-3 border-white/10 bg-white/5 hover:bg-white/10">
                <Settings2 size={16} className="text-slate-400" />
              </Button>
           </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function FleetPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  const [filter, setFilter] = useState('ALL');
  const [fleetData, setFleetData] = useState<FleetVessel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFleet = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=fleet');
      const json = await res.json();
      if (json.success) {
        setFleetData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredData = filter === 'ALL' ? fleetData : fleetData.filter(v => v.status === filter);

  return (
    <div className="max-w-[1400px] mx-auto space-y-10" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <div className="w-8 h-1 bg-teal-500 rounded-full" />
             <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                 {isArabic ? 'إدارة الأصول' : 'Asset Management'}
             </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            {isArabic ? 'أساطيل ومعدات الهيئة' : 'Red Sea Fleet & Gear'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="relative group min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder={isArabic ? 'ابحث عن مركب أو معدة...' : 'Search for vessel or gear...'}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-[13px] font-medium text-white placeholder:text-slate-500 outline-none ring-0 shadow-sm focus:border-teal-500/30 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
           </div>
           <Button intent="primary" className="rounded-2xl py-3.5 px-6 flex items-center gap-2.5 shadow-[0_0_20px_rgba(45,212,191,0.2)] bg-teal-500 text-[#001529] hover:bg-teal-400 uppercase italic">
              <Plus size={18} strokeWidth={3} />
              <span className="font-black tracking-tight text-[13px]">{isArabic ? 'إضافة أصل' : 'Add New Asset'}</span>
           </Button>
        </div>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FLEET_STATS.map((stat, idx) => (
          <StatCard key={idx} stat={stat} isAr={isArabic} />
        ))}
      </div>

      {/* ── Filters & Tabs ───────────────────────────────────────────────────── */}
      <div className="bg-slate-900/40 backdrop-blur-xl p-2 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-1">
           {['ALL', 'ACTIVE', 'MISSION', 'MAINTENANCE'].map((t) => (
             <button
               key={t}
               onClick={() => setFilter(t)}
               className={`
                 px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all
                 ${filter === t 
                   ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                   : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                 }
               `}
             >
               {t === 'ALL' ? (isArabic ? 'الكل' : 'All Assets') : t}
             </button>
           ))}
        </div>
        
        <div className="flex items-center gap-3 pr-2">
           <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 border-r border-white/10">
             {isArabic ? `${filteredData.length} وحدات` : `${filteredData.length} units`}
           </span>
           <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <Filter size={18} />
           </button>
           <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <Settings2 size={18} />
           </button>
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
         <AnimatePresence mode="popLayout">
           {filteredData.map((vessel, idx) => (
              <VesselCard key={vessel.id} vessel={vessel} isAr={isArabic} />
           ))}
         </AnimatePresence>
      </div>

    </div>
  );
}
