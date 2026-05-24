'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToCollection } from '@/lib/firebase/db';
import { Patrol } from '@/lib/firebase/schema';
import { query, where, collection, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Shield, 
  Map as MapIcon, 
  Zap, 
  Activity, 
  Waves, 
  Ship, 
  Clock, 
  MapPin, 
  MoreVertical, 
  Navigation, 
  Compass, 
  Fuel, 
  Wind,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Menu
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ─── Constants & Mock Data ───────────────────────────────────────────────────

const MISSION_STATS = [
  { label: 'Active Patrols', labelAr: 'الدوريات النشطة', value: '4', trend: 'Active', icon: Ship, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Coverage Area', labelAr: 'مساحة التغطية', value: '840 km²', trend: '+12%', icon: MapIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { label: 'Avg Fuel/Unit', labelAr: 'معدل الوقود/الوحدة', value: '62%', trend: '-4%', icon: Fuel, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Command Alerts', labelAr: 'تنبيهات القيادة', value: '2', trend: 'High', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

// Real-time data will replace the mocks below

// ─── Child Components ───────────────────────────────────────────────────────

function TacticalStat({ stat, isAr }: { stat: typeof MISSION_STATS[0], isAr: boolean }) {
  const Icon = stat.icon;
  return (
    <Card className="p-5 border-none shadow-sm hover:shadow-md transition-all group relative overflow-hidden bg-slate-900/40 backdrop-blur-xl">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
           <Icon size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
           {stat.trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
           {isAr ? stat.labelAr : stat.label}
        </p>
        <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-5 text-white group-hover:scale-125 transition-transform duration-700">
         <Icon size={80} />
      </div>
    </Card>
  );
}

function ActiveUnitCard({ unit, isAr }: { unit: Patrol, isAr: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-teal-500/30 transition-all hover:shadow-lg group">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-teal-400 group-hover:rotate-12 transition-transform">
                <Ship size={20} />
             </div>
             <div>
                <h4 className="font-bold text-white text-sm tracking-tight">{unit.vessel}</h4>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase italic">{unit.id}</p>
             </div>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors">
             <MoreVertical size={18} />
          </button>
       </div>

       <div className="space-y-3 px-1">
          <div className="flex items-center justify-between text-[11px]">
             <span className="text-slate-400 flex items-center gap-1.5"><Navigation size={12} /> {isAr ? unit.zoneAr : unit.zone}</span>
             <Badge color={unit.status === 'ACTIVE' ? 'success' : 'warning'} className="text-[9px] font-black px-2 py-0.5">
                {unit.status}
             </Badge>
          </div>
          <div className="flex items-center justify-between text-[11px]">
             <span className="text-slate-400 flex items-center gap-1.5"><Zap size={12} /> {unit.officer}</span>
             <span className="font-bold text-slate-300">4 Crew</span>
          </div>
          
          <div className="pt-2 border-t border-white/5">
             <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase italic">Operational Health</span>
                <span className="text-[9px] font-black text-white">95%</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `95%` }} />
             </div>
          </div>
       </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PatrolsPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  
  const [activePatrols, setActivePatrols] = useState<Patrol[]>([]);
  const [recentMissions, setRecentMissions] = useState<Patrol[]>([]);

  useEffect(() => {
    // Sub to active patrols
    const qActive = query(collection(db, 'patrols'), where('status', 'in', ['ACTIVE', 'STANDBY', 'EMERGENCY']));
    const unsubActive = subscribeToCollection<Patrol>('patrols', setActivePatrols, qActive);
    
    // Sub to completed patrols
    const qCompleted = query(collection(db, 'patrols'), where('status', '==', 'COMPLETED'), orderBy('startTime', 'desc'));
    const unsubCompleted = subscribeToCollection<Patrol>('patrols', setRecentMissions, qCompleted);

    return () => {
      unsubActive();
      unsubCompleted();
    };
  }, []);

  return (
    <div className="max-w-[1500px] mx-auto space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <span className="w-8 h-1 bg-teal-500 rounded-full" />
             <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                 {isArabic ? 'وحدة السيطرة البحرية' : 'Marine Control Unit'}
             </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            {isArabic ? 'عمليات الدوريات النشطة' : 'Active Patrol Operations'}
          </h1>
        </div>

        <div className="flex gap-3">
           <Button intent="outline" className="rounded-2xl border-white/10 px-5 flex items-center gap-2 text-[12px] font-bold shadow-sm bg-white/5 text-white hover:bg-white/10">
              <Compass size={16} className="text-teal-400" />
              {isArabic ? 'خريطة الأسطول' : 'Fleet Map'}
           </Button>
           <Button intent="primary" className="rounded-2xl px-6 flex items-center gap-2 text-[12px] font-bold shadow-[0_0_20px_rgba(45,212,191,0.2)] bg-teal-500 text-[#001529] hover:bg-teal-400 uppercase italic">
              <Plus size={18} strokeWidth={3} />
              {isArabic ? 'تسجيل دورية' : 'Log New Patrol'}
           </Button>
        </div>
      </div>

      {/* ── Summary Stats Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MISSION_STATS.map((stat, idx) => (
          <TacticalStat key={idx} stat={stat} isAr={isArabic} />
        ))}
      </div>

      {/* ── Command Center Main Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tactical Map HUD Card */}
        <div className="lg:col-span-2">
           <Card className="h-[550px] border-none shadow-lg overflow-hidden relative group bg-[#0a1628]">
              {/* GIS HUD Elements Overlay */}
              <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                 <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-2xl min-w-[180px]">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Marine Weather</p>
                    <div className="flex items-center justify-between text-white">
                       <span className="text-xl font-bold font-mono tracking-tighter">24°C</span>
                       <Wind size={18} className="text-teal-400" />
                       <span className="text-[11px] font-bold text-teal-400">12 kt</span>
                    </div>
                 </div>
                 <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5 shadow-2xl">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Sync Status</p>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                       <span className="text-[11px] font-bold text-white tracking-tight">Database Synchronized</span>
                    </div>
                 </div>
              </div>

              {/* Map Mock Illustration */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
              </div>

              {/* Central Map Controls HUD */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-6 py-3 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-3xl flex items-center gap-8">
                 <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] italic">Strategic Tracking Active</span>
                 </div>
                 <div className="flex gap-6">
                    <button className="text-white/50 hover:text-white transition-colors"><MapIcon size={18} /></button>
                    <button className="text-white/50 hover:text-white transition-colors"><Compass size={18} /></button>
                    <button className="text-white/50 hover:text-white transition-colors"><Menu size={18} /></button>
                 </div>
              </div>

              {/* Centered Large Map UI Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="w-24 h-24 border border-teal-500/20 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                 </div>
                 <p className="mt-4 text-[10px] font-black text-teal-500/50 uppercase tracking-[0.5em] italic">Tactical Area Delta</p>
              </div>
           </Card>
        </div>

        {/* Active Unit Sidebar */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-white text-sm tracking-tight">{isArabic ? 'الوحدات الميدانية' : 'Units On-Field'}</h3>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest px-2 py-0.5 bg-teal-500/10 rounded-full">
                 {activePatrols.length} Live
              </span>
           </div>
           <div className="space-y-4 h-[490px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                 {activePatrols.map((unit, idx) => (
                    <motion.div 
                      key={unit.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <ActiveUnitCard unit={unit} isAr={isArabic} />
                    </motion.div>
                 ))}
                 {activePatrols.length === 0 && (
                   <div className="p-4 text-center text-slate-500 font-bold text-xs uppercase tracking-widest border border-white/5 bg-white/5 rounded-2xl">
                      {isArabic ? 'لا توجد وحدات نشطة' : 'No Active Units'}
                   </div>
                 )}
              </AnimatePresence>
           </div>
        </div>

      </div>

      {/* ── Tactical History Table Section ──────────────────────────────────── */}
      <Card className="border-none shadow-lg overflow-hidden bg-slate-900/40 backdrop-blur-xl">
         <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h3 className="text-lg font-bold text-white tracking-tight">{isArabic ? 'تاريخ المهمات التكتيكية' : 'Tactical Mission History'}</h3>
               <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest italic">{isArabic ? 'سجل العمليات المكتملة لآخر 7 أيام' : 'Completed operation logs for the last 7 days'}</p>
            </div>
            
            <div className="flex gap-2">
               <div className="relative group">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400" />
                  <input 
                    type="text" 
                    placeholder="Search mission ID..." 
                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-[12px] font-medium outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/30 transition-all min-w-[220px] text-white placeholder:text-slate-500"
                  />
               </div>
               <button className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Filter size={18} />
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-sm">
               <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                     <th className="py-4 px-6">{isArabic ? 'المعرف' : 'ID'}</th>
                     <th className="py-4 px-6">{isArabic ? 'المركب' : 'Unit Vessel'}</th>
                     <th className="py-4 px-6">{isArabic ? 'التاريخ' : 'Deployed Date'}</th>
                     <th className="py-4 px-6">{isArabic ? 'المدة' : 'Duration'}</th>
                     <th className="py-4 px-6">{isArabic ? 'المسافة' : 'Distance'}</th>
                     <th className="py-4 px-6">{isArabic ? 'المخالفات' : 'Violations'}</th>
                     <th className="py-4 px-6">{isArabic ? 'الحالة' : 'Outcome'}</th>
                  </tr>
               </thead>
               <tbody>
                  {recentMissions.map((mission) => (
                    <tr key={mission.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors text-center group">
                       <td className="py-4 px-6">
                          <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-teal-400 transition-colors">#{mission.code}</span>
                       </td>
                       <td className="py-4 px-6 font-bold text-white">{mission.vessel}</td>
                       <td className="py-4 px-6 text-slate-400">{mission.startTime?.toDate ? mission.startTime.toDate().toLocaleDateString() : ''}</td>
                       <td className="py-4 px-6 font-mono font-bold text-slate-500 italic">4.5h</td>
                       <td className="py-4 px-6 font-mono font-bold text-teal-400 tracking-tighter">24km</td>
                       <td className="py-4 px-6">
                          {mission.incidentsReported > 0 ? (
                            <div className="flex items-center justify-center gap-1 text-red-400 font-black italic">
                               <AlertCircle size={14} />
                               <span>{mission.incidentsReported} Found</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-bold">—</span>
                          )}
                       </td>
                       <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-tighter">
                             <CheckCircle2 size={14} />
                             {mission.status}
                          </div>
                       </td>
                    </tr>
                  ))}
                  {recentMissions.length === 0 && (
                     <tr>
                        <td colSpan={7} className="py-8 text-slate-500 font-bold text-xs uppercase tracking-widest">
                           {isArabic ? 'لا توجد سجلات مكتملة' : 'No completed logs'}
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
         
         <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
            <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-teal-400 transition-colors">
               Load Extended Tactical History
            </button>
         </div>
      </Card>

      <div className="h-20" /> {/* Spacer */}
    </div>
  );
}
