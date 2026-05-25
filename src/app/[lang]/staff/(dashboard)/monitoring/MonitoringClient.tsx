'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Observation } from '@/lib/firebase/schema';
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
  Zap,
  X,
  Loader2,
  Edit3
} from 'lucide-react';
import { 
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
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form / Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [type, setType] = useState<'CORAL' | 'FAUNA' | 'THREAT' | 'WEATHER'>('CORAL');
  const [location, setLocation] = useState('');
  const [locationAr, setLocationAr] = useState('');
  const [observerId, setObserverId] = useState('');
  const [status, setStatus] = useState<'VERIFIED' | 'PENDING' | 'REJECTED'>('PENDING');
  const [score, setScore] = useState('5.0');

  // Vulnerability Indicators
  const [bleaching, setBleaching] = useState('23');
  const [invasive, setInvasive] = useState('68');
  const [sedimentation, setSedimentation] = useState('42');

  // Quick Add Sidebar Fields
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<'CORAL' | 'FAUNA' | 'THREAT' | 'WEATHER'>('CORAL');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchObservations = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=observations');
      const json = await res.json();
      if (json.success) {
        setObservations(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=users');
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        
        // Default to active session if available
        const raw = localStorage.getItem('active_user_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.employeeId) {
            const found = json.data.find((u: any) => u.employeeId === parsed.employeeId || u.id === parsed.employeeId);
            if (found) {
              setObserverId(found.id);
              return;
            }
          }
        }
        if (json.data.length > 0 && !observerId) {
          setObserverId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchObservations();
    fetchUsers();
  }, []);

  const resetFormFields = () => {
    setCode('');
    setType('CORAL');
    setLocation('');
    setLocationAr('');
    setStatus('PENDING');
    setScore('5.0');
    setBleaching('23');
    setInvasive('68');
    setSedimentation('42');
    setEditingObservation(null);

    const raw = localStorage.getItem('active_user_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const found = users.find(u => u.employeeId === parsed.employeeId || u.id === parsed.employeeId);
        if (found) {
          setObserverId(found.id);
          return;
        }
      } catch (e) {}
    }
    if (users.length > 0) {
      setObserverId(users[0].id);
    }
  };

  const startEditing = (obs: Observation) => {
    setEditingObservation(obs);
    setCode(obs.code || '');
    setType(obs.type || 'CORAL');
    setLocation(obs.location || '');
    setLocationAr(obs.locationAr || '');
    setObserverId(obs.observerId || '');
    setStatus(obs.status || 'PENDING');
    setScore(String(obs.score || 5.0));

    // Parse indicators if they are present
    const indicatorsList = obs.indicators || [];
    const bInd = indicatorsList.find((i: any) => i.name && i.name.includes('Bleaching'));
    const iInd = indicatorsList.find((i: any) => i.name && i.name.includes('Invasive'));
    const sInd = indicatorsList.find((i: any) => i.name && i.name.includes('Sedimentation'));

    setBleaching(String(bInd ? bInd.value : 23));
    setInvasive(String(iInd ? iInd.value : 68));
    setSedimentation(String(sInd ? sInd.value : 42));
    
    setShowModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !observerId) return;

    setIsSubmitting(true);
    try {
      const selectedUser = users.find(u => u.id === observerId || u.employeeId === observerId);
      const observerName = selectedUser ? (isAr ? selectedUser.nameAr || selectedUser.name : selectedUser.name) : 'Staff Researcher';

      const indicatorsArray = [
        { name: 'Bleaching Probability', nameAr: 'احتمالية التبييض', value: parseInt(bleaching) || 0 },
        { name: 'Invasive Species detected', nameAr: 'رصد فصائل غازية', value: parseInt(invasive) || 0 },
        { name: 'Sedimentation Impact', nameAr: 'تأثير الترسبات', value: parseInt(sedimentation) || 0 }
      ];

      const obsData = {
        code: code || `OBS-26-${Math.floor(1000 + Math.random() * 9000)}`,
        type,
        location,
        locationAr: locationAr || location,
        observerId,
        observerName,
        date: editingObservation?.date || new Date().toISOString(),
        status,
        score: parseFloat(score) || 5.0,
        indicators: indicatorsArray
      };

      if (editingObservation?.id) {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'observations',
            action: 'UPDATE',
            id: editingObservation.id,
            data: obsData
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to update observation');
        }
      } else {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'observations',
            action: 'ADD',
            data: obsData
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to add observation');
        }
      }

      resetFormFields();
      setShowModal(false);
      await fetchObservations();
    } catch (err: any) {
      console.error('Error saving observation:', err);
      alert(isAr ? `خطأ أثناء الحفظ: ${err.message}` : `Error saving observation: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommit = async () => {
    if (!newLocation) return;
    setIsSubmitting(true);
    try {
      let observerName = 'Staff Member';
      let currentObserverId = 'user-123';
      const raw = localStorage.getItem('active_user_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.employeeId) {
          currentObserverId = parsed.employeeId;
          observerName = isAr ? parsed.nameAr || parsed.name : parsed.name;
        }
      }

      const indicatorsArray = [
        { name: 'Bleaching Probability', nameAr: 'احتمالية التبييض', value: parseInt(bleaching) || 0 },
        { name: 'Invasive Species detected', nameAr: 'رصد فصائل غازية', value: parseInt(invasive) || 0 },
        { name: 'Sedimentation Impact', nameAr: 'تأثير الترسبات', value: parseInt(sedimentation) || 0 }
      ];

      const newObs = {
        code: `OBS-26-${Math.floor(1000 + Math.random() * 9000)}`,
        type: newCategory,
        location: newLocation,
        locationAr: newLocation,
        observerId: currentObserverId,
        observerName,
        date: new Date().toISOString(),
        status: 'PENDING',
        score: parseFloat((Math.random() * 10).toFixed(1)),
        indicators: indicatorsArray
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
      await fetchObservations();
    } catch (error) {
      console.error("Error committing observation: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (obs: Observation) => {
    if (!obs.id) return;
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف هذا التقرير البيئي "${obs.code}"؟`
      : `Are you sure you want to permanently delete observation "${obs.code}"?`;
    
    if (confirm(confirmMsg)) {
      setLoading(true);
      try {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'observations',
            action: 'DELETE',
            id: obs.id
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to delete observation');
        }
        await fetchObservations();
      } catch (err: any) {
        console.error('Error deleting observation:', err);
        alert(isAr ? `خطأ أثناء الحذف: ${err.message}` : `Error deleting observation: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatObsDate = (ts: any) => {
    if (!ts) return 'N/A';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString(isAr ? 'ar-EG' : 'en-US');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredObservations = observations.filter(obs => {
    if (activeTab === 'all') return true;
    if (activeTab === 'verified') return obs.status === 'VERIFIED';
    if (activeTab === 'pending') return obs.status === 'PENDING';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* ── Header Area ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                <Microscope size={18} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500">
               {isAr ? 'الاستخبارات البيئية' : 'Environmental Intelligence'}
             </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            {isAr ? 'الرصد البيئي المتطور' : 'Environmental Monitoring'}
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            {isAr ? 'إدخال وتحليل البيانات البيئية الميدانية والملاحظات المسجلة' : 'Manual data entry and analysis of field observations'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm tracking-tight hover:bg-white/10 transition-all group">
            <Download size={18} className="text-slate-400 group-hover:text-white transition-colors" />
            {isAr ? 'تصدير التقارير' : 'Export Intelligence'}
          </button>
          <button 
            onClick={() => { resetFormFields(); setShowModal(true); }}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-teal-500 text-[#001529] font-black text-sm tracking-tighter uppercase italic hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]"
          >
            <Plus size={18} strokeWidth={3} />
            {isAr ? 'إضافة رصد جديد' : 'New Observation'}
          </button>
        </div>
      </div>

      {/* ── Summary Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon={Activity} label={isAr ? 'الملاحظات الميدانية' : "Total Observations"} value={observations.length} unit={isAr ? 'تقرير' : "Rpts"} trend={12.4} color="emerald" />
        <MetricCard icon={CheckCircle2} label={isAr ? 'تقارير معتمدة' : "Verified Reports"} value={observations.filter(o => o.status === 'VERIFIED').length} unit={isAr ? 'تقرير' : "Rpts"} trend={5.2} color="teal" />
        <MetricCard icon={Microscope} label={isAr ? 'قيد المراجعة' : "Pending Review"} value={observations.filter(o => o.status === 'PENDING').length} unit={isAr ? 'تقرير' : "Rpts"} trend={-1.4} color="orange" />
        <MetricCard icon={ShieldCheck} label={isAr ? 'باحثين مسجلين' : "Registered Researchers"} value={users.length} unit={isAr ? 'مستخدم' : "Users"} trend={2.1} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column: Network & Stations (3 Cols) ───────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none bg-slate-900/40 backdrop-blur-xl p-6 h-full">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">{isAr ? 'مناطق إدخال البيانات' : 'Data Entry Zones'}</h2>
                <Badge color="teal" size="sm">{isAr ? 'نشط' : 'ACTIVE'}</Badge>
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
                      className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer justify-between"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`p-2.5 rounded-xl shrink-0 ${obs.type === 'THREAT' ? 'bg-red-500/10 text-red-500' : 'bg-teal-500/10 text-teal-400'}`}>
                           {obs.type === 'THREAT' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        </div>
                        <div className="min-w-0 flex-1">
                           <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <h4 className="text-sm font-bold text-white tracking-tight uppercase italic truncate">{obs.code}: {isAr ? obs.locationAr : obs.location}</h4>
                              <span className="text-[9px] font-black text-slate-500 px-1.5 py-0.5 bg-white/5 rounded italic tracking-tighter">
                                {isAr ? 'بواسطة' : 'BY'} {obs.observerName}
                              </span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-[11px] font-bold text-slate-400">{formatObsDate(obs.date)}</span>
                              <span className={`text-[10px] font-black tracking-widest uppercase ${obs.status === 'VERIFIED' ? 'text-emerald-500' : obs.status === 'REJECTED' ? 'text-red-500' : 'text-amber-500'}`}>
                                 {isAr ? (obs.status === 'VERIFIED' ? 'معتمد' : obs.status === 'REJECTED' ? 'مرفوض' : 'معلق') : obs.status}
                              </span>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                           <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">{isAr ? 'التقييم' : 'SCORE'}</p>
                           <div className={`text-lg font-black font-mono tracking-tighter ${obs.score > 8 ? 'text-emerald-500' : obs.score > 5 ? 'text-amber-500' : 'text-orange-500'}`}>{obs.score}</div>
                        </div>
                        
                        <div className="flex gap-1.5">
                          <Button 
                            size="sm" 
                            intent="ghost" 
                            onClick={() => startEditing(obs)}
                            className="text-slate-400 hover:text-white h-8 px-2.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 border-transparent rounded-xl"
                          >
                            <Edit3 size={12} />
                          </Button>
                          <Button 
                            size="sm" 
                            intent="ghost" 
                            onClick={() => handleDelete(obs)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 border-transparent rounded-xl"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
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
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">{isAr ? 'تسجيل رصد سريع' : 'Quick Obs Log'}</h2>
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
                          type="button"
                          className={`p-3 rounded-2xl border text-[10px] font-black tracking-widest transition-all ${newCategory === cat.id ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-white/5 border-white/5 text-[#94a3b8] hover:border-teal-500/50 hover:text-white'}`}
                        >
                           {isAr ? cat.ar : cat.en}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block mb-2.5 mx-1 italic">
                     {isAr ? 'مؤشرات الهشاشة (نسبة مئوية)' : 'Vulnerability Indicators (%)'}
                   </label>
                   <div className="space-y-3">
                      {[
                        { name: 'Bleaching Probability', nameAr: 'احتمالية التبييض', value: bleaching, setValue: setBleaching, color: 'emerald' },
                        { name: 'Invasive Species detected', nameAr: 'رصد فصائل غازية', value: invasive, setValue: setInvasive, color: 'red' },
                        { name: 'Sedimentation Impact', nameAr: 'تأثير الترسبات', value: sedimentation, setValue: setSedimentation, color: 'amber' },
                      ].map((item, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-[#0f172a]/40 border border-white/5">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-slate-300">{isAr ? item.nameAr : item.name}</span>
                              <span className={`text-[10px] font-black text-${item.color}-400`} dir="ltr">{item.value}%</span>
                           </div>
                           <input 
                             type="range"
                             min="0"
                             max="100"
                             value={item.value}
                             onChange={(e) => item.setValue(e.target.value)}
                             className="w-full accent-teal-500 bg-white/5 h-1 rounded-lg cursor-pointer"
                           />
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
                          {isAr ? 'تأكيد الرصد السريع' : 'Commit Quick Obs'}
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

      {/* Glassmorphic Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-[700px] p-8 border border-white/10 bg-[#0c1628]/95 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black text-white tracking-tight mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
              <Microscope className="text-teal-400" size={24} />
              {editingObservation 
                ? (isAr ? 'تعديل تقرير الرصد البيئي' : 'Edit Observation Report')
                : (isAr ? 'تسجيل تقرير رصد جديد' : 'Record New Observation')
              }
            </h2>

            <form onSubmit={handleModalSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isAr ? 'رقم التقرير' : 'Observation Code'}
                  </label>
                  <Input 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. OBS-26-4829"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isAr ? 'الباحث المسؤول *' : 'Observer/Researcher *'}
                  </label>
                  {users.length > 0 ? (
                    <select
                      value={observerId}
                      onChange={(e) => setObserverId(e.target.value)}
                      className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
                      required
                    >
                      <option value="">{isAr ? 'اختر الباحث...' : 'Select Observer...'}</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {isAr ? u.nameAr || u.name : u.name} ({u.employeeId})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input 
                      value={observerId}
                      onChange={(e) => setObserverId(e.target.value)}
                      placeholder="e.g. user-123"
                      className="bg-[#050b14] border-white/10 text-white rounded-xl"
                      required
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isAr ? 'الموقع بالإنجليزية *' : 'Location (EN) *'}
                  </label>
                  <Input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Northern Reefs Bed A"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isAr ? 'الموقع بالعربية *' : 'Location (AR) *'}
                  </label>
                  <Input 
                    value={locationAr}
                    onChange={(e) => setLocationAr(e.target.value)}
                    placeholder="مثال: قطاع الشعاب الشمالية أ"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isAr ? 'فئة الرصد البيئي' : 'Observation Category'}
                  </label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
                  >
                    <option value="CORAL">{isAr ? 'بيئة الشعاب المرجانية (CORAL)' : 'Coral Reef Bed'}</option>
                    <option value="FAUNA">{isAr ? 'الحياة البحرية والحيوانية (FAUNA)' : 'Marine Fauna'}</option>
                    <option value="THREAT">{isAr ? 'التهديدات والمخاطر البيئية (THREAT)' : 'Threat / Risk'}</option>
                    <option value="WEATHER">{isAr ? 'أرصاد وحالة طقس (WEATHER)' : 'Weather & Climate'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isAr ? 'حالة الاعتماد' : 'Verification Status'}
                  </label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
                  >
                    <option value="PENDING">{isAr ? 'معلق / تحت المراجعة (PENDING)' : 'Pending Review'}</option>
                    <option value="VERIFIED">{isAr ? 'معتمد ومؤكد (VERIFIED)' : 'Verified'}</option>
                    <option value="REJECTED">{isAr ? 'مرفوض (REJECTED)' : 'Rejected'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isAr ? 'التقييم العام للموقع (0.0 - 10.0)' : 'Overall Quality Score (0.0 - 10.0)'}
                  </label>
                  <Input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

              </div>

              {/* Dynamic Vulnerability Indicators sliders inside modal */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'مؤشرات التقييم الهيكلي' : 'Structural Assessment Indicators'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Bleaching Probability', nameAr: 'احتمالية التبييض', value: bleaching, setValue: setBleaching, color: 'emerald' },
                    { name: 'Invasive Species detected', nameAr: 'رصد فصائل غازية', value: invasive, setValue: setInvasive, color: 'red' },
                    { name: 'Sedimentation Impact', nameAr: 'تأثير الترسبات', value: sedimentation, setValue: setSedimentation, color: 'amber' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[#050b14]/80 border border-white/5">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-300">{isAr ? item.nameAr : item.name}</span>
                          <span className={`text-[10px] font-black text-teal-400`} dir="ltr">{item.value}%</span>
                       </div>
                       <input 
                         type="range"
                         min="0"
                         max="100"
                         value={item.value}
                         onChange={(e) => item.setValue(e.target.value)}
                         className="w-full accent-teal-500 bg-white/5 h-1 rounded-lg cursor-pointer"
                       />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-500 text-[#0c1628] font-black rounded-xl py-2.5 px-6"
                >
                  {isSubmitting 
                    ? <Loader2 className="animate-spin" size={16} /> 
                    : (editingObservation ? (isAr ? 'تحديث الرصد' : 'Update Observation') : (isAr ? 'حفظ الرصد' : 'Submit Observation'))
                  }
                </Button>
              </div>

            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
