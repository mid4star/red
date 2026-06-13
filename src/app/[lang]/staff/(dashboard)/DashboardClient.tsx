'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Activity, ShieldAlert, Waves, Map as MapIcon, 
  Users, Clock, TrendingUp, TrendingDown, Zap, Maximize2,
  BellRing, CheckCircle2, AlertTriangle, Info, Ship, Navigation, 
  FileText, Anchor, Mail, PlayCircle, Eye, BrainCircuit, Droplets,
  Skull, Radar, ActivitySquare
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import UnifiedAIAssistant from '@/components/dashboard/UnifiedAIAssistant';
import ReportGeneratorModal from '@/components/reports/ReportGeneratorModal';
import NewsRadarWidget from '@/components/dashboard/NewsRadarWidget';
import DashboardWeatherWidget from '@/components/dashboard/DashboardWeatherWidget';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export interface SmartInsight {
  id: string;
  type: 'BIODIVERSITY' | 'OFFENDER' | 'POLLUTION' | 'EIA' | 'MORTALITY_CORRELATION' | 'THREAT_VECTOR' | 'FLEET_RISK';
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DashboardData {
  stats: {
    totalPatrols: number;
    activeViolations: number;
    surveys: number;
    vesselsReady: number;
    totalVessels: number;
    activeUsers: number;
  };
  feed: Array<{
    id: string;
    type: 'PATROL' | 'VIOLATION' | 'NEWS' | 'EIA';
    title: string;
    message: string;
    time: string;
    severity?: string;
    user?: string;
  }>;
  chartData: Array<{
    name: string;
    patrols: number;
    violations: number;
  }>;
  insights: SmartInsight[];
}

export default function DashboardClient({ lang, data }: { lang: string, data: DashboardData }) {
  const isArabic = lang === 'ar';
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PATROLS' | 'VIOLATIONS'>('ALL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Force scroll to top on load to fix the issue where it opens at the AI assistant
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const stats = [
    { label: 'إجمالي الدوريات', labelEn: 'Total Patrols', value: data.stats.totalPatrols, icon: Waves, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'المخالفات النشطة', labelEn: 'Active Violations', value: data.stats.activeViolations, icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'المسوحات البيئية', labelEn: 'Eco Surveys', value: data.stats.surveys, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'جاهزية الأسطول', labelEn: 'Fleet Readiness', value: `${data.stats.vesselsReady}/${data.stats.totalVessels}`, icon: Anchor, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  ];

  const filteredFeed = data.feed.filter(item => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PATROLS') return item.type === 'PATROL';
    if (activeTab === 'VIOLATIONS') return item.type === 'VIOLATION';
    return true;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[1600px] mx-auto space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* ── Page Header & Welcome ────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-end justify-between gap-6 pb-4 border-b border-th-border relative">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
             <span className="w-8 h-1 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
             <span className="text-[10px] font-black tracking-[0.2em] text-teal-500 uppercase italic">
                 {isArabic ? 'نظام القيادة الاستراتيجي' : 'Strategic Command System'}
             </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-th-text dark:text-white tracking-tighter drop-shadow-lg">
            {isArabic ? 'لوحة العمليات المركزية' : 'Central Command Center'}
          </h1>
          <p className="text-th-muted dark:text-slate-400 text-sm font-medium">
             {isArabic ? 'إدارة البيانات المركزية المترابطة بالذكاء الاصطناعي' : 'AI-Correlated Centralized Data Management'}
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
           <Button 
             onClick={() => setIsReportModalOpen(true)}
             className="rounded-2xl border-th-border bg-th-surface text-th-text hover:bg-th-surface2 px-5 flex items-center gap-2 text-[12px] font-bold shadow-sm"
           >
              <BarChart3 size={16} className="text-teal-500" />
              {isArabic ? 'إنشاء تقرير' : 'Generate Report'}
           </Button>
        </div>
      </motion.div>

      {/* ── Hero Map Section ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden border border-th-border shadow-lg group">
         <div className="absolute inset-0 bg-slate-900 transition-colors duration-500 overflow-hidden">
           <video 
             autoPlay 
             loop 
             muted 
             playsInline 
             poster="/dashboard_hero_banner.png"
             className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-transform duration-1000 group-hover:scale-105 pointer-events-none"
             preload="metadata"
           >
             <source src="/uploads/fb5aeb9a-9b3c-4415-bdfd-be9004c79c2e.mp4" type="video/mp4" />
           </video>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent transition-colors duration-500" />
         </div>
         
         <DashboardWeatherWidget isArabic={isArabic} />

         <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10 pointer-events-none">
            <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-4 rounded-2xl shadow-xl max-w-sm transition-colors duration-500">
               <div className="flex items-center gap-3 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: '#ffffff' }}>{isArabic ? 'حالة الشبكة' : 'Network Status'}</h3>
               </div>
               <p className="text-xs leading-relaxed font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {isArabic ? 'جميع الأجهزة وأطقم الدوريات متصلة بقاعدة البيانات المركزية. التزامن الحي لـ 24 قاعدة بيانات يعمل بكفاءة 100%.' : 'All field devices connected. Deep DB correlation active.'}
               </p>
            </div>
            
            <div className="hidden md:flex gap-4">
               <div className="flex flex-col items-end">
                 <span className="text-3xl font-black drop-shadow-md" style={{ color: '#ffffff' }}>{data.stats.activeUsers}</span>
                 <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#2dd4bf' }}>{isArabic ? 'المستخدمين النشطين' : 'Active Users'}</span>
               </div>
            </div>
         </div>
      </motion.div>

      {/* ── Analytics Overview Stats ────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-5 border border-th-border bg-th-surface/80 backdrop-blur-xl shadow-sm hover:shadow-md hover:border-th-border/80 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                   <Icon size={20} />
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-th-muted uppercase tracking-widest mb-1">
                  {isArabic ? stat.label : stat.labelEn}
                </h4>
                <p className="text-2xl font-black text-th-text dark:text-white tracking-tight">{stat.value}</p>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-[0.03] dark:opacity-[0.02] text-current">
                 <Icon size={100} />
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* ── AI Neural Insights Engine ────────────────────────────────────────── */}
      {data.insights && data.insights.length > 0 && (
        <motion.div variants={itemVariants} className="relative w-full rounded-3xl overflow-hidden border border-th-border shadow-lg transition-colors duration-500">
          {/* Neural Background */}
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <img src="/neural_insights_bg.png" alt="Neural Background" className="w-full h-full object-cover opacity-10 dark:opacity-20 invert dark:invert-0" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop'; }} />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 dark:from-slate-950 dark:via-slate-950/80 to-transparent transition-colors duration-500" />
          </div>

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/20 dark:border-teal-500/30 text-teal-600 dark:text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)] dark:shadow-[0_0_15px_rgba(20,184,166,0.3)] animate-pulse">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                  {isArabic ? 'التحليل البيئي المتقدم' : 'Advanced Environmental Analysis'}
                </h2>
                <p className="text-teal-600 dark:text-teal-400/80 text-xs font-bold tracking-widest uppercase mt-1">
                  {isArabic ? 'تحليل شامل وترابط لجميع قواعد البيانات (20+ جدول)' : 'Comprehensive Cross-Table Correlation Engine'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {data.insights.map((insight) => {
                const isCritical = insight.severity === 'CRITICAL' || insight.severity === 'HIGH';
                let Icon = Info;
                let colorTheme = '';

                switch (insight.type) {
                  case 'MORTALITY_CORRELATION':
                    Icon = Skull;
                    colorTheme = 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10';
                    break;
                  case 'THREAT_VECTOR':
                    Icon = ActivitySquare;
                    colorTheme = 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10';
                    break;
                  case 'FLEET_RISK':
                    Icon = Ship;
                    colorTheme = 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10';
                    break;
                  case 'BIODIVERSITY':
                    Icon = Radar;
                    colorTheme = 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10';
                    break;
                  case 'OFFENDER':
                    Icon = AlertTriangle;
                    colorTheme = 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10';
                    break;
                  case 'POLLUTION':
                  case 'EIA':
                  default:
                    Icon = Droplets;
                    colorTheme = isCritical ? 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10' :
                                              'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10';
                    break;
                }

                return (
                  <motion.div key={insight.id} whileHover={{ y: -5, scale: 1.02 }} className={`p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden group ${colorTheme}`}>
                    {/* Glowing dot */}
                    <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto flex h-2 w-2">
                      {isCritical && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>}
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-950/50 shadow-sm">
                        <Icon size={18} className="text-current" />
                      </div>
                      <h3 className="font-bold text-sm tracking-wide text-slate-800 dark:text-white">{insight.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-white/80 leading-relaxed font-medium">
                      {insight.message}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Main Layout Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Analytics Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-6 border border-th-border shadow-lg bg-th-surface/80 backdrop-blur-xl h-[450px] flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-lg font-bold text-th-text dark:text-white tracking-tight">{isArabic ? 'تحليل العمليات والمخالفات' : 'Operations & Violations Analysis'}</h3>
                   <p className="text-[11px] text-th-muted font-medium uppercase tracking-widest mt-1">{isArabic ? 'آخر 30 يوم من العمليات الميدانية' : 'Last 30 Days of Field Operations'}</p>
                </div>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 text-[11px] font-bold text-th-text border border-th-border bg-th-surface2 rounded-xl px-3 py-1.5 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>{isArabic ? 'الدوريات' : 'Patrols'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-[11px] font-bold text-th-text border border-th-border bg-th-surface2 rounded-xl px-3 py-1.5 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>{isArabic ? 'المخالفات' : 'Violations'}</span>
                   </div>
                </div>
             </div>
             
             <div className="flex-1 w-full -ml-4 mt-2">
                {mounted && (
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={data.chartData}>
                       <defs>
                         <linearGradient id="colorPatrol" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                         <linearGradient id="colorViol" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
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
                         contentStyle={{borderRadius: '16px', border: '1px solid rgba(150,150,150,0.2)', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)', padding: '12px'}} 
                         itemStyle={{fontSize: '12px', fontWeight: 700}}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="patrols" 
                         stroke="#6366f1" 
                         strokeWidth={3}
                         fillOpacity={1} 
                         fill="url(#colorPatrol)" 
                         animationDuration={1500}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="violations" 
                         stroke="#f43f5e" 
                         strokeWidth={3}
                         fillOpacity={1} 
                         fill="url(#colorViol)" 
                         animationDuration={1500}
                       />
                     </AreaChart>
                   </ResponsiveContainer>
                )}
             </div>
          </Card>
        </motion.div>

        {/* Intelligence Feed */}
        <motion.div variants={itemVariants} className="h-[450px] flex flex-col gap-4">
           <Card className="flex-1 border border-th-border shadow-lg flex flex-col overflow-hidden bg-th-surface/80 backdrop-blur-xl">
              <div className="p-4 border-b border-th-border flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <BellRing size={18} className="text-th-text dark:text-white" />
                       <h3 className="font-bold text-th-text dark:text-white text-sm tracking-tight">{isArabic ? 'خلاصة التنبيهات' : 'Intelligence Feed'}</h3>
                    </div>
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                 </div>
                 
                 <div className="flex gap-2">
                   {['ALL', 'PATROLS', 'VIOLATIONS'].map(tab => (
                     <button 
                       key={tab}
                       onClick={() => setActiveTab(tab as any)}
                       className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                         activeTab === tab 
                          ? 'bg-th-text text-th-surface dark:bg-white dark:text-slate-900' 
                          : 'bg-th-surface2 text-th-muted hover:bg-th-border'
                       }`}
                     >
                       {isArabic ? (tab === 'ALL' ? 'الكل' : tab === 'PATROLS' ? 'الدوريات' : 'المخالفات') : tab}
                     </button>
                   ))}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                 <AnimatePresence mode="popLayout">
                   {filteredFeed.length > 0 ? filteredFeed.map((item) => {
                     const isViolation = item.type === 'VIOLATION';
                     const isPatrol = item.type === 'PATROL';
                     const Icon = isViolation ? AlertTriangle : isPatrol ? Ship : FileText;
                     const colorClass = isViolation ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 
                                        isPatrol ? 'text-teal-500 bg-teal-500/10 border-teal-500/20' : 
                                        'text-sky-500 bg-sky-500/10 border-sky-500/20';

                     return (
                       <motion.div 
                         layout
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         key={item.id} 
                         className="flex gap-3 p-3 rounded-2xl hover:bg-th-surface2 transition-colors border border-transparent hover:border-th-border group"
                       >
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${colorClass}`}>
                           <Icon size={16} />
                         </div>
                         <div className="flex-1 min-w-0 flex flex-col justify-center">
                           <div className="flex items-center justify-between mb-1">
                             <span className={`text-[10px] font-bold uppercase tracking-wider ${isViolation ? 'text-rose-500' : isPatrol ? 'text-teal-500' : 'text-sky-500'}`}>
                                {item.title}
                             </span>
                             <span className="text-[9px] text-th-muted font-medium">{item.time}</span>
                           </div>
                           <p className="text-[12px] font-medium text-th-text leading-snug line-clamp-2">
                              {item.message}
                           </p>
                           {item.user && (
                             <p className="text-[10px] text-th-muted mt-1 font-semibold opacity-70">By: {item.user}</p>
                           )}
                         </div>
                       </motion.div>
                     );
                   }) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-th-muted opacity-50 gap-2">
                       <CheckCircle2 size={32} />
                       <span className="text-xs font-bold uppercase tracking-widest">{isArabic ? 'لا توجد تنبيهات' : 'No Alerts'}</span>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </Card>
        </motion.div>
      </div>

      {/* ── News Radar Widget ────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <NewsRadarWidget lang={lang} />
      </motion.div>

      {/* ── Unified AI Assistant ────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="pt-4">
        <UnifiedAIAssistant lang={lang} />
      </motion.div>

      <ReportGeneratorModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        lang={lang} 
      />

    </motion.div>
  );
}
