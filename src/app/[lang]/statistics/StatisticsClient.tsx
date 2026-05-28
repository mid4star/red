'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  HelpCircle, 
  Search,
  Globe,
  Waves,
  Zap,
  Info,
  ShieldCheck,
  Activity,
  History,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

const DATA_CATEGORIES = [
  { id: 'env', name: 'Environmental Metrics', count: '1.2M Data Points' },
  { id: 'bio', name: 'Biodiversity Census', count: '14,200 Records' },
  { id: 'ops', name: 'Operational Analytics', count: '850 Missions' },
];

const HEALTH_DATA = [
  { month: 'Jan', health: 92, coverage: 85 },
  { month: 'Feb', health: 94, coverage: 86 },
  { month: 'Mar', health: 93, coverage: 87 },
  { month: 'Apr', health: 95, coverage: 88 },
  { month: 'May', health: 97, coverage: 89 },
  { month: 'Jun', health: 96, coverage: 90 },
];

const SPECIES_DIST = [
  { name: 'Corals', value: 45, color: '#2dd4bf' },
  { name: 'Fish', value: 35, color: '#0ea5e9' },
  { name: 'Mammals', value: 12, color: '#f59e0b' },
  { name: 'Other', value: 8, color: '#8b5cf6' },
];

export default function StatisticsClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-[#0a1628] text-white min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      {/* ── Intelligence Header ─────────────────────────────────────────── */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto space-y-8">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
               <Layers size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">Open Data Guidelines</span>
         </div>
         
         <div className="flex flex-col lg:flex-row justify-between items-end gap-10 border-b border-white/5 pb-16">
            <div className="max-w-3xl space-y-6">
               <h1 className="text-4xl md:text-5xl lg:text-[7rem] font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1] drop-shadow-2xl">
                  {isAr ? 'مركز البيانات المفتوحة' : 'Open Ecological Data'}
               </h1>
               <p className="text-xl md:text-2xl font-medium text-slate-400 italic">
                  {isAr 
                    ? 'الوصول المباشر إلى البيانات البيئية والإحصائيات الخاصة بمحميات البحر الأحمر.' 
                    : 'Direct access to ecological data and metric datasets for the Red Sea reserves.'}
               </p>
            </div>
            <div className="hidden lg:flex gap-4">
               <button className="px-8 py-4 rounded-2xl bg-teal-500 text-[#001529] font-black text-xs tracking-widest uppercase italic shadow-2xl">
                  {isAr ? 'طلب بيانات مخصصة' : 'Request Dataset'}
               </button>
            </div>
         </div>
      </section>

      {/* ── Real-Time Telemetry Dashboard ─────────────────────────────────── */}
      <section className="pb-40 px-6 max-w-7xl mx-auto space-y-8">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Ecological Index Chart */}
            <div className="lg:col-span-8 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] bg-[#0c1b2f]/60 backdrop-blur-3xl border border-white/5 shadow-2xl space-y-8">
               <div className="flex justify-between items-center">
                  <div className="space-y-1">
                     <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Data Trends Over Time</h3>
                     <p className="text-2xl font-black uppercase italic tracking-tighter">Ecological Health Index (EHI)</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase italic">Alpha Sector</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase italic">Beta Range</span>
                     </div>
                  </div>
               </div>

               <div className="h-80 w-full">
                  {mounted && (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={HEALTH_DATA}>
                           <defs>
                              <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorCov" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis 
                              dataKey="month" 
                              stroke="#475569" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(v) => v.toUpperCase()}
                           />
                           <YAxis hide />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                              itemStyle={{ color: '#2dd4bf', fontWeight: 'bold' }}
                           />
                           <Area type="monotone" dataKey="health" stroke="#2dd4bf" strokeWidth={4} fillOpacity={1} fill="url(#colorHealth)" />
                           <Area type="monotone" dataKey="coverage" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorCov)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  )}
               </div>
            </div>

            {/* Diversity Breakdown */}
            <div className="lg:col-span-4 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] bg-[#0c1b2f]/60 backdrop-blur-3xl border border-white/5 shadow-2xl flex flex-col items-center justify-center space-y-10 relative overflow-hidden">
               <div className="absolute top-8 left-8">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Data Category Breakdown</h3>
               </div>
               
               <div className="h-64 w-full">
                  {mounted && (
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={SPECIES_DIST}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={8}
                              dataKey="value"
                           >
                              {SPECIES_DIST.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                           </Pie>
                           <Tooltip />
                        </PieChart>
                     </ResponsiveContainer>
                  )}
               </div>

               <div className="w-full space-y-3">
                  {SPECIES_DIST.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic">
                       <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                       </span>
                       <span className="text-white">{item.value}%</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* ── Dataset Selection Grid ────────────────────────────────────────── */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
            {DATA_CATEGORIES.map((cat, i) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-all cursor-pointer relative overflow-hidden"
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
                       <BarChart3 size={24} />
                    </div>
                    <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-colors">
                       <Download size={18} />
                    </button>
                 </div>
                 <h4 className="text-xl font-black uppercase italic tracking-tighter mb-1 select-none">{cat.name}</h4>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{cat.count}</p>
                 <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={80} />
                 </div>
              </motion.div>
            ))}
         </div>

         {/* ── Export Protocols ──────────────────────────────────────────────── */}
         <div className="p-6 sm:p-12 rounded-2xl sm:rounded-[3.5rem] bg-gradient-to-br from-teal-500 to-teal-700 text-[#001529] relative overflow-hidden group">
            <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 scale-[4] rotate-12 transition-transform duration-1000 group-hover:scale-[4.5]">
               <ArrowUpRight size={100} />
            </div>
            <div className="relative z-10 lg:flex items-center justify-between gap-10">
               <div className="space-y-4 max-w-xl">
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                     {isAr ? 'تصدير البيانات البيئية المفتوحة' : 'Open Data Export'}
                  </h3>
                  <p className="text-lg font-bold italic opacity-80 leading-relaxed italic">
                     {isAr 
                       ? 'قم بتنزيل البيانات بالصيغ القياسية لأغراض البحث والدراسات العلمية.' 
                       : 'Download data packets in standard formats for research and academic study purposes.'}
                  </p>
               </div>
               <div className="flex flex-col sm:flex-row gap-4 mt-8 lg:mt-0">
                  <button className="px-10 py-5 rounded-2xl bg-[#001529] text-teal-400 font-black text-xs tracking-widest uppercase italic flex items-center gap-3">
                     <FileJson size={20} />
                     JSON PACKET
                  </button>
                  <button className="px-10 py-5 rounded-2xl bg-[#001529]/10 border border-[#001529]/20 text-[#001529] font-black text-xs tracking-widest uppercase italic flex items-center gap-3">
                     <FileSpreadsheet size={20} />
                     CSV DATASET
                  </button>
               </div>
            </div>
         </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
