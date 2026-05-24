'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToCollection } from '@/lib/firebase/db';
import { Observation } from '@/lib/firebase/schema';
import { Timestamp, query, orderBy, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Microscope, 
  Wind, 
  Navigation, 
  Eye, 
  ShieldCheck, 
  AlertCircle, 
  Calendar,
  Waves,
  ChevronRight,
  Plus,
  ArrowRight,
  Download,
  Search,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

// ── Mock Data ───────────────────────────────────────────────────────────────

const TREND_DATA = [
  { time: '08:00', temp: 24.2, ph: 8.12, salinity: 39.8 },
  { time: '10:00', temp: 24.5, ph: 8.11, salinity: 40.1 },
  { time: '12:00', temp: 25.1, ph: 8.09, salinity: 40.3 },
  { time: '14:00', temp: 25.8, ph: 8.08, salinity: 40.2 },
  { time: '16:00', temp: 25.5, ph: 8.10, salinity: 39.9 },
  { time: '18:00', temp: 24.9, ph: 8.12, salinity: 39.7 },
  { time: '20:00', temp: 24.4, ph: 8.13, salinity: 39.6 },
];

const DATA_ZONES = [
  { id: 'Z-01', name: 'Northern Islands Zone', nameAr: 'منطقة الجزر الشمالية', status: 'ACTIVE', reportCount: 142, lastEntry: 'Today 09:30', lastEntryAr: 'اليوم 09:30', quality: 'HIGH', type: 'WATER_QUALITY', typeAr: 'جودة المياه' },
  { id: 'Z-02', name: 'Coral Reef Bed A', nameAr: 'حيد مرجاني أ', status: 'ACTIVE', reportCount: 84, lastEntry: 'Yesterday 14:15', lastEntryAr: 'الأمس 14:15', quality: 'GOOD', type: 'REEF_HEALTH', typeAr: 'صحة الشعاب' },
  { id: 'Z-03', name: 'Wadi El Gemal South', nameAr: 'جنوب وادي الجمال', status: 'WARNING', reportCount: 12, lastEntry: '3 Days Ago', lastEntryAr: 'منذ 3 أيام', quality: 'POOR', type: 'METEOROLOGY', typeAr: 'الأرصاد' },
  { id: 'Z-04', name: 'Gebel Elba Sector', nameAr: 'قطاع جبل علبة', status: 'ACTIVE', reportCount: 201, lastEntry: 'Today 11:45', lastEntryAr: 'اليوم 11:45', quality: 'HIGH', type: 'BIODIVERSITY', typeAr: 'التنوع البيولوجي' },
];

// The initial observations mock is removed. Instead, data is fetched from Firebase.

const MetricCard = ({ icon: Icon, label, value, unit, trend, color }: any) => (
  <Card className="p-5 border-none bg-slate-900/40 backdrop-blur-xl group hover:bg-slate-900/60 transition-all duration-500">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{label}</p>
        <div className="flex items-end gap-1.5">
          <span className="text-2xl font-black text-white font-mono tracking-tighter leading-none">{value}</span>
          <span className="text-xs font-bold text-slate-400 pb-0.5">{unit}</span>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          <Zap size={10} className="fill-current" />
          <span dir="ltr">{trend > 0 ? '+' : ''}{trend}%</span>
        </div>
      )}
    </div>
  </Card>
);

export default function MonitoringClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'pending'>('all');
  const [observations, setObservations] = useState<Observation[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Form State
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<'CORAL' | 'FAUNA' | 'THREAT' | 'WEATHER'>('CORAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Subscribe to Firebase real-time updates for observations
    const q = query(collection(db, 'observations'), orderBy('date', 'desc'));
    const unsubscribe = subscribeToCollection<Observation>('observations', (data) => {
      setObservations(data);
    }, q);
    
    return () => unsubscribe();
  }, []);

  const filteredObservations = observations.filter(obs => {
    if (activeTab === 'all') return true;
    if (activeTab === 'verified') return obs.status === 'VERIFIED';
    if (activeTab === 'pending') return obs.status === 'PENDING';
    return true;
  });

  const handleCommit = async () => {
    if (!newLocation) return;
    setIsSubmitting(true);
    try {
      const newObs: Omit<Observation, 'id'> = {
        code: `OBS-24-${Math.floor(Math.random() * 10000)}`,
        type: newCategory,
        location: newLocation,
        locationAr: newLocation, // Fallback to same string if no translation service
        observerId: 'user-123', // Hardcoded for now
        observerName: 'Current User',
        date: new Date().toISOString() as any, // Send as ISO string
        status: 'PENDING',
        score: parseFloat((Math.random() * 10).toFixed(1)),
        indicators: [] // Optional
      };
      
      const response = await fetch('/api/staff/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: 'observations',
          action: 'ADD',
          data: newObs
        })
      });
      if (!response.ok) throw new Error('Failed to save observation');
      
      setNewLocation('');
    } catch (error) {
      console.error("Error committing observation: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── Header Area ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                <Microscope size={18} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500">
               {isAr ? 'الاستخبارات الاستراتيجية' : 'Strategic Intelligence'}
             </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            {isAr ? 'الرصد البيئي المتطور' : 'Environmental Monitoring'}
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            {isAr ? 'إدخال وتحليل البيانات الميدانية والملاحظات المسجلة يدوياً' : 'Manual data entry and analysis of field observations'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm tracking-tight hover:bg-white/10 transition-all group">
            <Download size={18} className="text-slate-400 group-hover:text-white transition-colors" />
            {isAr ? 'تصدير التقارير' : 'Export Intelligence'}
          </button>
          <button className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-teal-500 text-[#001529] font-black text-sm tracking-tighter uppercase italic hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]">
            <Plus size={18} strokeWidth={3} />
            {isAr ? 'إضافة رصد جديد' : 'New Observation'}
          </button>
        </div>
      </div>

      {/* ── Summary Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon={Activity} label={isAr ? 'الملاحظات الشهرية' : "Monthly Observations"} value="1,245" unit={isAr ? 'تقرير' : "Rpts"} trend={12.4} color="emerald" />
        <MetricCard icon={CheckCircle2} label={isAr ? 'تقارير معتمدة' : "Verified Reports"} value="982" unit={isAr ? 'تقرير' : "Rpts"} trend={5.2} color="teal" />
        <MetricCard icon={Microscope} label={isAr ? 'قيد المراجعة' : "Pending Review"} value="64" unit={isAr ? 'تقرير' : "Rpts"} trend={-1.4} color="orange" />
        <MetricCard icon={ShieldCheck} label={isAr ? 'باحثين نشطين' : "Active Researchers"} value="128" unit={isAr ? 'مستخدم' : "Users"} trend={2.1} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column: Network & Stations (3 Cols) ───────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none bg-slate-900/40 backdrop-blur-xl p-6 h-full">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">{isAr ? 'مناطق إدخال البيانات' : 'Data Entry Zones'}</h2>
                <Badge color="teal" size="sm">{isAr ? 'يدوي' : 'MANUAL'}</Badge>
             </div>
             
             <div className="space-y-4">
                {DATA_ZONES.map((zone) => (
                  <div key={zone.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[10px] font-mono font-bold text-teal-400/80 tracking-widest">{zone.id}</span>
                       <div className="flex items-center gap-1.5 font-mono text-[9px] font-black text-white/40">
                          <CheckCircle2 size={10} />
                          {zone.reportCount} {isAr ? 'سجل' : 'Logs'}
                       </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1 tracking-tight group-hover:text-teal-400 transition-colors uppercase italic">{isAr ? zone.nameAr : zone.name}</h3>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-500 uppercase">{isAr ? zone.typeAr : zone.type.replace('_', ' ')}</span>
                       <span className="text-[9px] font-black text-white/20 tracking-widest uppercase">{isAr ? 'آخر إدخال:' : 'Last Entry:'} {isAr ? zone.lastEntryAr : zone.lastEntry}</span>
                    </div>
                  </div>
                ))}
             </div>
             
             <button className="w-full mt-6 p-4 rounded-xl border border-dashed border-white/10 text-slate-500 text-[11px] font-bold uppercase tracking-widest hover:border-teal-500/50 hover:text-white transition-all">
                {isAr ? 'عرض كافة النقاط' : 'View All Reporting Points'}
             </button>
          </Card>
        </div>

        {/* ── Middle Column: Trends & Observations (6 Cols) ─────────────────── */}
        <div className="lg:col-span-6 space-y-6">
          {/* Historical Trends Card */}
          <Card className="p-6 border-none bg-slate-900/40 backdrop-blur-xl h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div className="space-y-1">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">{isAr ? 'التوجهات البيئية' : 'Environmental Trends'}</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{isAr ? 'مصفوفة حرارة وملوحة السطح' : 'Surface Temperature & Salinity Matrix'}</p>
               </div>
               <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 text-[10px] font-black tracking-widest uppercase">{isAr ? '٢٤ ساعة' : '24H'}</button>
                  <button className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-500 text-[10px] font-black tracking-widest uppercase hover:text-white transition-all">{isAr ? '٧ أيام' : '7D'}</button>
               </div>
            </div>
            
            <div className="flex-1 w-full min-h-0" dir="ltr">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#64748b', fontWeight: 'bold' }}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#64748b', fontWeight: 'bold' }}
                      domain={['dataMin - 1', 'dataMax + 1']}
                      orientation={isAr ? 'right' : 'left'}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                      }}
                      labelStyle={{ color: '#94a3b8', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      itemStyle={{ fontSize: '12px', fontWeight: '800' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      name={isAr ? 'الحرارة' : 'Temp'}
                      stroke="#14b8a6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorTemp)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Observations Table Card */}
          <Card className="p-6 border-none bg-slate-900/40 backdrop-blur-xl">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">{isAr ? 'الاستخبارات الميدانية' : 'Field Intelligence'}</h2>
                <div className="flex gap-4">
                   {[
                     { id: 'all', en: 'all', ar: 'الكل' },
                     { id: 'verified', en: 'verified', ar: 'معتمد' },
                     { id: 'pending', en: 'pending', ar: 'قيد المراجعة' }
                   ].map((tab) => (
                     <button 
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id as any)}
                       className={`text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === tab.id ? 'text-teal-400' : 'text-slate-500 hover:text-white'}`}
                     >
                       {isAr ? tab.ar : tab.en}
                     </button>
                   ))}
                </div>
             </div>
             
             <div className="space-y-4">
                <AnimatePresence>
                  {filteredObservations.map((obs) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={obs.id} 
                      className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer"
                    >
                      <div className={`p-2.5 rounded-xl ${obs.type === 'THREAT' ? 'bg-red-500/10 text-red-500' : 'bg-teal-500/10 text-teal-400'}`}>
                         {obs.type === 'THREAT' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3 mb-0.5">
                            <h4 className="text-sm font-bold text-white tracking-tight uppercase italic">{obs.code}: {isAr ? obs.locationAr : obs.location}</h4>
                            <span className="text-[10px] font-black text-slate-500 px-2 py-0.5 bg-white/5 rounded italic tracking-tighter">
                              {isAr ? 'بواسطة' : 'BY'} {obs.observerName}
                            </span>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="text-[11px] font-bold text-slate-400">{obs.date?.toDate ? obs.date.toDate().toLocaleString(isAr ? 'ar-EG' : 'en-US') : 'N/A'}</span>
                            <span className={`text-[10px] font-black tracking-widest uppercase ${obs.status === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                               {isAr ? (obs.status === 'VERIFIED' ? 'معتمد' : 'معلق') : obs.status}
                            </span>
                         </div>
                      </div>
                      <div className="text-center md:text-right">
                         <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">{isAr ? 'التقييم' : 'SCORE'}</p>
                         <div className={`text-xl font-black font-mono tracking-tighter ${obs.score > 8 ? 'text-emerald-500' : 'text-amber-500'}`}>{obs.score}</div>
                      </div>
                      <ChevronRight size={16} className={`text-white/10 ${isAr ? 'rotate-180' : ''}`} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredObservations.length === 0 && (
                  <div className="text-center py-8 text-slate-500 font-bold text-sm">
                    {isAr ? 'لا توجد ملاحظات تطابق الفلتر' : 'No observations match the filter'}
                  </div>
                )}
             </div>
          </Card>
        </div>

        {/* ── Right Column: New Observation Hub (3 Cols) ─────────────────────── */}
        <div className="lg:col-span-3">
          <Card className="border-none bg-slate-900/40 backdrop-blur-xl p-6 h-full lg:border-l border-t lg:border-t-0 border-white/5">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400">
                   <Plus size={18} strokeWidth={3} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">{isAr ? 'سجل الرصد' : 'Observation Log'}</h2>
             </div>
             
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-2.5 mx-1 italic">
                    {isAr ? 'السياق المكاني' : 'Location Context'}
                  </label>
                  <div className="relative group">
                    <Navigation className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-400 transition-colors`} size={16} />
                    <Input 
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder={isAr ? 'أدخل إحداثيات أو اسم المنطقة...' : 'Enter reef or station co-ords...'} 
                      className={`${isAr ? 'pr-11 pl-4' : 'pl-11 pr-4'} w-full h-12 bg-[#050b14]/50 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:border-teal-500/50`} 
                    />
                  </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-2.5 mx-1 italic">
                     {isAr ? 'فئة الرصد' : 'Observation Category'}
                   </label>
                   <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'CORAL', en: 'CORAL', ar: 'مرجان' }, 
                        { id: 'FAUNA', en: 'FAUNA', ar: 'حياة بحرية' }, 
                        { id: 'THREAT', en: 'THREAT', ar: 'تهديد' }, 
                        { id: 'WEATHER', en: 'WEATHER', ar: 'طقس' }
                      ].map((cat) => (
                        <button 
                          key={cat.id} 
                          onClick={() => setNewCategory(cat.id as any)}
                          className={`p-3 rounded-2xl border text-[10px] font-black tracking-widest transition-all ${newCategory === cat.id ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-white/5 border-white/5 text-[#94a3b8] hover:border-teal-500/50 hover:text-white'}`}
                        >
                           {isAr ? cat.ar : cat.en}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-2.5 mx-1 italic">
                     {isAr ? 'مؤشرات الهشاشة' : 'Vulnerability Indicators'}
                   </label>
                   <div className="space-y-3">
                      {[
                        { name: 'Bleaching Probability', nameAr: 'احتمالية التبييض', score: 23, color: 'emerald' },
                        { name: 'Invasive Species detected', nameAr: 'رصد فصائل غازية', score: 68, color: 'red' },
                        { name: 'Sedimentation Impact', nameAr: 'تأثير الترسبات', score: 42, color: 'amber' },
                      ].map((item, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-[#0f172a]/40 border border-white/5">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-slate-300">{isAr ? item.nameAr : item.name}</span>
                              <span className={`text-[10px] font-black text-${item.color}-400`} dir="ltr">{item.score}%</span>
                           </div>
                           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden" dir="ltr">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                className={`h-full bg-${item.color}-500`}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                   <button 
                     onClick={handleCommit}
                     disabled={isSubmitting || !newLocation}
                     className="w-full py-4 rounded-2xl bg-teal-500 text-[#001529] font-black text-sm tracking-tighter uppercase italic hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_rgba(45,212,191,0.1)] flex items-center justify-center gap-3"
                   >
                      {isSubmitting ? (
                         <div className="w-5 h-5 border-2 border-[#001529]/30 border-t-[#001529] rounded-full animate-spin" />
                      ) : (
                        <>
                          {isAr ? 'تأكيد الرصد' : 'Commit Observation'}
                          <ArrowRight size={18} strokeWidth={3} className={isAr ? 'rotate-180' : ''} />
                        </>
                      )}
                   </button>
                   <p className="text-center mt-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                     {isAr ? 'موقع: بروتوكول العمليات الأمنية 4.2' : 'Signed: Sec OPS Protocol 4.2'}
                   </p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
