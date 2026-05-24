'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Activity, 
  ShieldAlert, 
  Waves, 
  Map as MapIcon, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Maximize2,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_DASHBOARD_DATA } from '@/lib/mockData';

// ─── Constants & Mock Data ───────────────────────────────────────────────────

const CHART_DATA = [
  { name: '01', patrols: 400, violations: 240, health: 95 },
  { name: '05', patrols: 300, violations: 139, health: 92 },
  { name: '10', patrols: 200, violations: 980, health: 88 },
  { name: '15', patrols: 278, violations: 390, health: 90 },
  { name: '20', patrols: 189, violations: 480, health: 94 },
  { name: '25', patrols: 239, violations: 380, health: 96 },
  { name: '30', patrols: 349, violations: 430, health: 91 },
];

const ANALYTICS_STATS = [
  { label: 'Total Patrols', labelAr: 'إجمالي الدوريات', value: '1,280', trend: '+12.5%', isUp: true, icon: Waves, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Active Violations', labelAr: 'المخالفات النشطة', value: '34', trend: '-8.2%', isUp: false, icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { label: 'Eco Surveys', labelAr: 'المسوحات البيئية', value: '412', trend: '+15.3%', isUp: true, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Resource Efficiency', labelAr: 'كفاءة الموارد', value: '94.8%', trend: '+2.1%', isUp: true, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

// ─── Components ──────────────────────────────────────────────────────────────

function AnalyticsStat({ stat, isAr }: { stat: typeof ANALYTICS_STATS[0], isAr: boolean }) {
  const Icon = stat.icon;
  return (
    <Card className="p-5 border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-sm hover:shadow-md hover:border-white/10 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
           <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
           {stat.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
           <span>{stat.trend}</span>
        </div>
      </div>
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {isAr ? stat.labelAr : stat.label}
        </h4>
        <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-[0.02] text-slate-900">
         <Icon size={80} />
      </div>
    </Card>
  );
}

function ActivityItem({ activity, isAr }: { activity: any, isAr: boolean }) {
  const isHigh = activity.severity === 'HIGH';
  return (
    <div className="flex gap-4 p-3.5 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
        isHigh ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-white/5 text-slate-400 border-white/10'
      }`}>
        {isHigh ? <AlertTriangle size={18} /> : <Info size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isHigh ? 'text-rose-500' : 'text-slate-400'}`}>
             {activity.type}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{activity.time}</span>
        </div>
        <p className="text-[12.5px] font-medium text-slate-300 leading-snug line-clamp-2">
           {activity.message}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* ── Page Header & Welcome ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <span className="w-8 h-1 bg-teal-500 rounded-full" />
             <span className="text-[10px] font-black tracking-[0.2em] text-teal-600 uppercase italic">
                 {isArabic ? 'نظام القيادة الاستراتيجي' : 'Strategic Command System'}
             </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            {isArabic ? 'لوحة العمليات المركزية' : 'Central Command Center'}
          </h1>
          <p className="text-slate-400 text-sm font-medium">
             {isArabic ? 'نظام إدارة محميات البحر الأحمر - جمهورية مصر العربية' : 'Red Sea Reserves Management - Arab Republic of Egypt'}
          </p>
        </div>

        <div className="flex gap-3">
           <Button intent="outline" className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 px-5 flex items-center gap-2 text-[12px] font-bold shadow-sm">
              <BarChart3 size={16} className="text-slate-400" />
              {isArabic ? 'تقارير الأداء' : 'Performance Reports'}
           </Button>
           <Button intent="primary" className="rounded-2xl px-6 flex items-center gap-2 text-[12px] font-bold shadow-xl shadow-teal-500/20">
              <Maximize2 size={16} />
              {isArabic ? 'وضع العرض التقديمي' : 'Presentation Mode'}
           </Button>
        </div>
      </div>

      {/* ── Analytics Overview Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ANALYTICS_STATS.map((stat, idx) => (
          <AnalyticsStat key={idx} stat={stat} isAr={isArabic} />
        ))}
      </div>

      {/* ── Main Command Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Strategic Overview Map */}
        <div className="lg:col-span-2">
          <Card className="h-[500px] border-none overflow-hidden relative shadow-lg group">
            <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white shadow-2xl">
                  <MapIcon size={20} />
               </div>
               <div className="flex flex-col">
                  <h3 className="text-white font-bold text-sm tracking-tight">{isArabic ? 'خريطة الملاحظات الميدانية' : 'Field Observations Map'}</h3>
                  <div className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                     <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Active Ops</span>
                  </div>
               </div>
            </div>
            
            {/* GIS Integration Preview UI */}
            <div className="absolute inset-0 bg-slate-950 flex shadow-inner">
               {/* Grid Pattern Overlay */}
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]" />
               
               {/* Simulated Map Markers/Lines */}
               <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] border border-teal-500/20 rounded-full animate-ping opacity-30 origin-center" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                 <div className="relative">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-full border border-teal-500/30 flex items-center justify-center animate-pulse">
                       <Ship className="text-teal-400" size={24} />
                    </div>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-teal-600 text-white text-[10px] font-bold shadow-2xl whitespace-nowrap">
                       Vessel Amwaj-1 • 12kt
                    </div>
                 </div>
               </div>
            </div>

            {/* Float HUD Elements */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
               <div className="p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white shadow-2xl min-w-[160px]">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Environmental Load</p>
                  <div className="flex items-end justify-between">
                     <span className="text-lg font-black tracking-tight">84.2%</span>
                     <TrendingUp className="text-emerald-400 mb-1" size={14} />
                  </div>
                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-400 w-[84%]" />
                  </div>
               </div>
               <div className="p-3 rounded-2xl bg-teal-600 border border-teal-400/30 text-white shadow-2xl flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white/10">
                     <Users size={16} />
                  </div>
                  <span className="text-[11px] font-bold tracking-tight">12 Teams Onfield</span>
               </div>
            </div>
          </Card>
        </div>

        {/* Intelligence Feed & Critical Alerts */}
        <div className="h-[500px] flex flex-col gap-6">
           <Card className="flex-1 border border-white/5 shadow-lg flex flex-col overflow-hidden bg-slate-900/40 backdrop-blur-xl">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <BellRing size={18} className="text-white" />
                    <h3 className="font-bold text-white text-sm tracking-tight">{isArabic ? 'خلاصة التنبيهات' : 'Intelligence Feed'}</h3>
                 </div>
                 <Badge color="warning" className="text-[10px] font-bold uppercase tracking-tighter">Latest</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                 {MOCK_DASHBOARD_DATA.alerts.map(alert => (
                   <ActivityItem key={alert.id} activity={alert} isAr={isArabic} />
                 ))}
                 {/* Duplicate for demo density */}
                 {MOCK_DASHBOARD_DATA.alerts.map(alert => (
                   <ActivityItem key={`d-${alert.id}`} activity={{...alert, id: `d-${alert.id}`, time: '2h ago'}} isAr={isArabic} />
                 ))}
              </div>
              <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                 <button className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
                    {isArabic ? 'عرض جميع التنبيهات' : 'Show All Intelligence'}
                 </button>
              </div>
           </Card>
        </div>
      </div>

      {/* ── Secondary Command Row: Analytics & Activity ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        
        {/* Performance Analytics Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6 border border-white/5 shadow-lg bg-slate-900/40 backdrop-blur-xl h-[420px] flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-lg font-bold text-white tracking-tight">{isArabic ? 'تحليل الأداء التشغيلي' : 'Operational Efficiency Analytics'}</h3>
                   <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">{isArabic ? 'آخر 30 يوم من العمليات' : 'Last 30 Days of Field Operations'}</p>
                </div>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 text-[11px] font-bold text-white border border-white/10 bg-white/5 rounded-xl px-3 py-1.5 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>{isArabic ? 'الدوريات' : 'Patrols'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-[11px] font-bold text-white border border-white/10 bg-white/5 rounded-xl px-3 py-1.5 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>{isArabic ? 'المخالفات' : 'Violations'}</span>
                   </div>
                </div>
             </div>
             
             <div className="flex-1 w-full -ml-4">
                {mounted && (
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={CHART_DATA}>
                       <defs>
                         <linearGradient id="colorPatrol" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                         <linearGradient id="colorViol" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                         dy={10}
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                       />
                       <Tooltip 
                         contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.9)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)', padding: '12px'}} 
                         itemStyle={{fontSize: '12px', fontWeight: 700}}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="patrols" 
                         stroke="#6366f1" 
                         strokeWidth={3}
                         fillOpacity={1} 
                         fill="url(#colorPatrol)" 
                       />
                       <Area 
                         type="monotone" 
                         dataKey="violations" 
                         stroke="#f43f5e" 
                         strokeWidth={3}
                         fillOpacity={1} 
                         fill="url(#colorViol)" 
                       />
                     </AreaChart>
                   </ResponsiveContainer>
                )}
             </div>
          </Card>
        </div>

        {/* Simplified Recent Command Actions */}
        <Card className="p-6 border border-white/5 shadow-lg bg-[#0a1628]/80 backdrop-blur-xl h-[420px] flex flex-col text-white">
           <div className="flex items-center gap-2 mb-8">
              <Zap size={20} className="text-teal-400" />
              <h3 className="font-bold text-white text-lg tracking-tight">{isArabic ? 'سجل العمليات' : 'Operation Log'}</h3>
           </div>
           
           <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar-dark pr-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="relative pl-6 rtl:pl-0 rtl:pr-6 border-l border-white/10 rtl:border-l-0 rtl:border-r">
                   <div className="absolute top-0 -left-[5px] rtl:-left-auto rtl:-right-[5px] w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                   <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-teal-400 uppercase tracking-wider italic">COMMAND EXEC</span>
                         <span className="text-[9px] text-white/40 uppercase">14:2{i} PM</span>
                      </div>
                      <p className="text-[12px] font-medium leading-relaxed text-slate-300">
                         {isArabic ? 'تم تمرير أمر صيانة دورية للمركبة Amwaj 2' : `Staff ID-0${i} authorized new patrol mission at Wadi El Gemal.`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px]">👮</div>
                         <span className="text-[10px] font-bold text-white/60">Col. S. Hassan</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="mt-8">
              <Button intent="primary" fullWidth className="bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl py-3 text-[11px] font-bold uppercase tracking-widest tracking-wide">
                 {isArabic ? 'سجل الأوامر الكامل' : 'Open Full Command Log'}
              </Button>
           </div>
        </Card>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
      
    </div>
  );
}

// Simulated icon from lucide-react if needed, but I imported Ship and others correctly.
const Ship = ({ size, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M19.38 20A2.42 2.42 0 0 0 22 17.5c0-1.2-1-2.5-3.5-2.5s-4 1.5-6.5 1.5-4-1.5-6.5-1.5-3.5 1.3-3.5 2.5 1.5 2.5 2.62 2.5" />
    <path d="m19 15-7-7-7 7" />
    <path d="M12 2v6" />
  </svg>
);
