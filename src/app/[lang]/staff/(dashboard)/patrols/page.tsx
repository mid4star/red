'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Menu,
  Edit3,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface PatrolWithRelations {
  id?: string;
  code?: string | null;
  zone?: string | null;
  zoneAr?: string | null;
  vesselId?: string | null;
  areaCovered?: number | null;
  duration?: number | null;
  weather?: string | null;
  observations?: string | null;
  status: 'ACTIVE' | 'STANDBY' | 'EMERGENCY' | 'COMPLETED';
  startTime?: any;
  endTime?: any;
  routeCoordinates?: { lat: number; lng: number }[];
  incidentsReported?: number;

  vessel?: string;
  vesselAr?: string;
  officer?: string;
  officerAr?: string;
  members?: any[];
}

// ─── Child Components ───────────────────────────────────────────────────────

function TacticalStat({ stat, isAr }: { stat: { label: string, labelAr: string, value: string, trend: string, icon: any, color: string, bg: string }, isAr: boolean }) {
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

function ActiveUnitCard({ 
  unit, 
  isAr, 
  onEdit, 
  onDelete, 
  activeMenuId, 
  setActiveMenuId 
}: { 
  unit: PatrolWithRelations, 
  isAr: boolean,
  onEdit: (p: PatrolWithRelations) => void,
  onDelete: (p: PatrolWithRelations) => void,
  activeMenuId: string | null,
  setActiveMenuId: (id: string | null) => void
}) {
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'EMERGENCY': return 'danger';
      case 'STANDBY': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-teal-500/30 transition-all hover:shadow-lg group relative">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-teal-400 group-hover:rotate-12 transition-transform">
                <Ship size={20} />
             </div>
             <div>
                <h4 className="font-bold text-white text-sm tracking-tight">{isAr ? (unit.vesselAr || unit.vessel) : unit.vessel}</h4>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase italic">#{unit.code || unit.id?.slice(0, 8)}</p>
             </div>
          </div>
          
          <div className="relative">
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 setActiveMenuId(activeMenuId === unit.id ? null : (unit.id || null));
               }}
               className="text-slate-500 hover:text-white transition-colors p-1"
             >
                <MoreVertical size={18} />
             </button>
             {activeMenuId === unit.id && (
               <div className={`absolute top-8 ${isAr ? 'left-0' : 'right-0'} bg-[#0c1628]/95 border border-white/10 rounded-xl shadow-2xl p-1.5 z-30 min-w-[120px] backdrop-blur-xl`}>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     onEdit(unit);
                     setActiveMenuId(null);
                   }}
                   className={`w-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 p-2 ${isAr ? 'text-right' : 'text-left'}`}
                 >
                   <Edit3 size={14} className="text-teal-400" />
                   <span>{isAr ? 'تعديل' : 'Edit'}</span>
                 </button>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     onDelete(unit);
                     setActiveMenuId(null);
                   }}
                   className={`w-full text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 p-2 ${isAr ? 'text-right' : 'text-left'}`}
                 >
                   <Trash2 size={14} />
                   <span>{isAr ? 'حذف' : 'Delete'}</span>
                 </button>
               </div>
             )}
          </div>
       </div>

       <div className="space-y-3 px-1">
          <div className="flex items-center justify-between text-[11px]">
             <span className="text-slate-400 flex items-center gap-1.5"><Navigation size={12} /> {isAr ? unit.zoneAr : unit.zone}</span>
             <Badge color={getBadgeColor(unit.status)} className="text-[9px] font-black px-2 py-0.5">
                {unit.status}
             </Badge>
          </div>
          <div className="flex items-center justify-between text-[11px]">
             <span className="text-slate-400 flex items-center gap-1.5"><Zap size={12} /> {isAr ? (unit.officerAr || unit.officer) : unit.officer}</span>
             <span className="font-bold text-slate-300">
                {unit.duration ? `${unit.duration}h` : '—'}
             </span>
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
  
  // Mobile responsiveness states
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobilePanel, setMobilePanel] = useState<'data' | 'map'>('data');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activePatrols, setActivePatrols] = useState<PatrolWithRelations[]>([]);
  const [recentMissions, setRecentMissions] = useState<PatrolWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPatrol, setEditingPatrol] = useState<PatrolWithRelations | null>(null);
  
  // Available lists for selects
  const [vessels, setVessels] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);

  // Form fields
  const [code, setCode] = useState('');
  const [zone, setZone] = useState('');
  const [zoneAr, setZoneAr] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [areaCovered, setAreaCovered] = useState('0');
  const [duration, setDuration] = useState('0');
  const [weather, setWeather] = useState('');
  const [observations, setObservations] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'STANDBY' | 'EMERGENCY' | 'COMPLETED'>('ACTIVE');
  const [incidentsReported, setIncidentsReported] = useState('0');

  const fetchPatrols = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=patrols');
      const json = await res.json();
      if (json.success) {
        const allPatrols = json.data as PatrolWithRelations[];
        const active = allPatrols.filter(p => ['ACTIVE', 'STANDBY', 'EMERGENCY'].includes(p.status));
        const completed = allPatrols.filter(p => p.status === 'COMPLETED');
        setActivePatrols(active);
        setRecentMissions(completed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVesselsAndOfficers = async () => {
    try {
      const [vesselsRes, officersRes] = await Promise.all([
        fetch('/api/staff/query?collection=fleet'),
        fetch('/api/staff/query?collection=users')
      ]);
      const vesselsJson = await vesselsRes.json();
      const officersJson = await officersRes.json();
      
      if (vesselsJson.success) {
        setVessels(vesselsJson.data);
      }
      if (officersJson.success) {
        setOfficers(officersJson.data);
      }
    } catch (e) {
      console.error('Error fetching vessels and officers:', e);
    }
  };

  useEffect(() => {
    fetchPatrols();
    fetchVesselsAndOfficers();
  }, []);

  const resetFormFields = () => {
    setCode('');
    setZone('');
    setZoneAr('');
    setVesselId('');
    setOfficerId('');
    setAreaCovered('0');
    setDuration('0');
    setWeather('');
    setObservations('');
    setStatus('ACTIVE');
    setIncidentsReported('0');
    setEditingPatrol(null);
  };

  const startEditing = (p: PatrolWithRelations) => {
    setEditingPatrol(p);
    setCode(p.code || '');
    setZone(p.zone || '');
    setZoneAr(p.zoneAr || '');
    setVesselId(p.vesselId || '');
    setOfficerId(p.members && p.members.length > 0 ? p.members[0].id : '');
    setAreaCovered(String(p.areaCovered || 0));
    setDuration(String(p.duration || 0));
    setWeather(p.weather || '');
    setObservations(p.observations || '');
    setStatus(p.status || 'ACTIVE');
    setIncidentsReported(String(p.incidentsReported || 0));
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone || !zoneAr || !vesselId || !officerId) {
      alert(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const parsedArea = parseFloat(areaCovered) || 0;
    const parsedDuration = parseFloat(duration) || 0;
    const parsedIncidents = parseInt(incidentsReported, 10) || 0;

    if (parsedArea < 0 || parsedDuration < 0 || parsedIncidents < 0) {
      alert(isArabic 
        ? 'يجب أن تكون القيم الرقمية أكبر من أو تساوي 0' 
        : 'Numeric values must be greater than or equal to 0'
      );
      return;
    }

    setSubmitting(true);
    try {
      const patrolData = {
        code,
        zone,
        zoneAr,
        vesselId,
        officerId,
        areaCovered: parsedArea,
        duration: parsedDuration,
        weather,
        observations,
        status,
        incidentsReported: parsedIncidents,
        routeCoordinates: editingPatrol?.routeCoordinates || []
      };

      if (editingPatrol?.id) {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'patrols',
            action: 'UPDATE',
            id: editingPatrol.id,
            data: patrolData
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to update patrol');
        }
      } else {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'patrols',
            action: 'ADD',
            data: patrolData
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to add patrol');
        }
      }

      resetFormFields();
      setShowModal(false);
      fetchPatrols();
    } catch (err: any) {
      console.error('Error saving patrol:', err);
      alert(isArabic 
        ? `حدث خطأ أثناء حفظ البيانات: ${err.message || err}`
        : `Error saving patrol data: ${err.message || err}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (patrol: PatrolWithRelations) => {
    if (!patrol.id) return;
    const confirmMsg = isArabic 
      ? `هل أنت متأكد من حذف الدورية "${patrol.code || patrol.id}" نهائياً من النظام؟`
      : `Are you sure you want to permanently delete patrol "${patrol.code || patrol.id}"?`;
    
    if (confirm(confirmMsg)) {
      setSubmitting(true);
      try {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'patrols',
            action: 'DELETE',
            id: patrol.id
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to delete patrol');
        }
        fetchPatrols();
      } catch (err: any) {
        console.error('Error deleting patrol:', err);
        alert(isArabic 
          ? `حدث خطأ أثناء حذف الدورية: ${err.message || err}`
          : `Error deleting patrol: ${err.message || err}`
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const formatMissionDate = (startTime: any) => {
    if (!startTime) return '';
    const d = startTime.toDate ? startTime.toDate() : new Date(startTime);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
  };

  const totalCoverage = [...activePatrols, ...recentMissions].reduce((sum, p) => sum + (p.areaCovered || 0), 0);
  const totalIncidents = [...activePatrols, ...recentMissions].reduce((sum, p) => sum + (p.incidentsReported || 0), 0);
  
  const dynamicStats = [
    { label: 'Active Patrols', labelAr: 'الدوريات النشطة', value: String(activePatrols.length), trend: 'Active', icon: Ship, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Coverage Area', labelAr: 'مساحة التغطية', value: `${totalCoverage.toFixed(0)} km²`, trend: '+12%', icon: MapIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Avg Fuel/Unit', labelAr: 'معدل الوقود/الوحدة', value: '62%', trend: '-4%', icon: Fuel, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Command Alerts', labelAr: 'تنبيهات القيادة', value: String(totalIncidents), trend: 'High', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const filteredMissions = recentMissions.filter(mission => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const codeMatch = mission.code?.toLowerCase().includes(query) || false;
    const vesselMatch = mission.vessel?.toLowerCase().includes(query) || false;
    const officerMatch = mission.officer?.toLowerCase().includes(query) || false;
    const zoneMatch = mission.zone?.toLowerCase().includes(query) || false;
    return codeMatch || vesselMatch || officerMatch || zoneMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="max-w-[1500px] mx-auto space-y-8 relative" 
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={() => setActiveMenuId(null)}
    >
      
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <span className="w-8 h-1 bg-teal-500 rounded-full" />
             <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                 {isArabic ? 'وحدة السيطرة البحرية' : 'Marine Control Unit'}
             </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter">
            {isArabic ? 'عمليات الدوريات النشطة' : 'Active Patrol Operations'}
          </h1>
        </div>

        <div className="flex gap-3">
           <Button intent="outline" className="rounded-2xl border-white/10 px-5 flex items-center gap-2 text-[12px] font-bold shadow-sm bg-white/5 text-white hover:bg-white/10">
              <Compass size={16} className="text-teal-400" />
              {isArabic ? 'خريطة الأسطول' : 'Fleet Map'}
           </Button>
           <Button 
             onClick={() => { resetFormFields(); setShowModal(true); }}
             intent="primary" 
             className="rounded-2xl px-6 flex items-center gap-2 text-[12px] font-bold shadow-[0_0_20px_rgba(45,212,191,0.2)] bg-teal-500 text-[#001529] hover:bg-teal-400 uppercase italic"
           >
              <Plus size={18} strokeWidth={3} />
              {isArabic ? 'تسجيل دورية' : 'Log New Patrol'}
           </Button>
        </div>
      </div>

      {/* Mobile View Toggle: Map vs Data */}
      {isMobile && (
        <div className="flex p-1 bg-[#0a1628]/90 backdrop-blur-2xl border border-white/10 rounded-2xl mb-4 gap-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => setMobilePanel('data')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mobilePanel === 'data'
                ? 'bg-teal-500 text-[#001529] shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield size={14} className="shrink-0" />
            {isArabic ? 'لوحة العمليات والوحدات' : 'Operations & Units'}
          </button>
          <button
            type="button"
            onClick={() => setMobilePanel('map')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mobilePanel === 'map'
                ? 'bg-teal-500 text-[#001529] shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={14} className="shrink-0" />
            {isArabic ? 'الخريطة التكتيكية' : 'Tactical Map'}
          </button>
        </div>
      )}

      {/* ── Summary Stats Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dynamicStats.map((stat, idx) => (
          <TacticalStat key={idx} stat={stat} isAr={isArabic} />
        ))}
      </div>

      {/* ── Command Center Main Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tactical Map HUD Card */}
        <div className={`lg:col-span-2 ${isMobile && mobilePanel !== 'map' ? 'hidden' : ''}`}>
           <Card className={`${isMobile ? 'h-[320px]' : 'h-[550px]'} border-none shadow-lg overflow-hidden relative group bg-[#0a1628]`}>
              {/* GIS HUD Elements Overlay */}
              <div className="absolute top-3 right-3 md:top-6 md:right-6 z-20 flex flex-row md:flex-col gap-2 md:gap-3">
                 <div className="p-2 md:p-3.5 rounded-xl md:rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-2xl min-w-[110px] md:min-w-[180px]">
                    <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 md:mb-2">Marine Weather</p>
                    <div className="flex items-center justify-between gap-1.5 text-white">
                       <span className="text-sm md:text-xl font-bold font-mono tracking-tighter">24°C</span>
                       <Wind size={14} className="text-teal-400 shrink-0" />
                       <span className="text-[9px] md:text-[11px] font-bold text-teal-400 shrink-0">12 kt</span>
                    </div>
                 </div>
                 <div className="p-2 md:p-3.5 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md border border-white/5 shadow-2xl hidden sm:block">
                    <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 md:mb-2">Sync Status</p>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                       <span className="text-[9px] md:text-[11px] font-bold text-white tracking-tight">Database Synchronized</span>
                    </div>
                 </div>
              </div>

              {/* Map Mock Illustration */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
              </div>

              {/* Central Map Controls HUD */}
              <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-20 px-3 py-2 md:px-6 md:py-3 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-3xl flex items-center gap-4 md:gap-8">
                 <div className="hidden md:flex items-center gap-3 border-r border-white/10 pr-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] italic">Strategic Tracking Active</span>
                 </div>
                 <div className="flex gap-4 md:gap-6">
                    <button className="text-white/50 hover:text-white transition-colors"><MapIcon size={16} /></button>
                    <button className="text-white/50 hover:text-white transition-colors"><Compass size={16} /></button>
                    <button className="text-white/50 hover:text-white transition-colors"><Menu size={16} /></button>
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
        <div className={`space-y-4 ${isMobile && mobilePanel !== 'data' ? 'hidden' : ''}`} onClick={(e) => e.stopPropagation()}>
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
                      <ActiveUnitCard 
                        unit={unit} 
                        isAr={isArabic} 
                        onEdit={startEditing}
                        onDelete={handleDelete}
                        activeMenuId={activeMenuId}
                        setActiveMenuId={setActiveMenuId}
                      />
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
      <div className={isMobile && mobilePanel !== 'data' ? 'hidden' : ''}>
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
                    placeholder={isArabic ? 'ابحث عن المعرف أو المركب...' : 'Search mission ID...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                     <th className="py-4 px-6">{isArabic ? 'المساحة' : 'Area'}</th>
                     <th className="py-4 px-6">{isArabic ? 'المخالفات' : 'Violations'}</th>
                     <th className="py-4 px-6">{isArabic ? 'الحالة' : 'Outcome'}</th>
                     <th className="py-4 px-6">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredMissions.map((mission) => (
                    <tr key={mission.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors text-center group">
                       <td className="py-4 px-6">
                          <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-teal-400 transition-colors">#{mission.code}</span>
                       </td>
                       <td className="py-4 px-6 font-bold text-white">{isArabic ? (mission.vesselAr || mission.vessel) : mission.vessel}</td>
                       <td className="py-4 px-6 text-slate-400">{formatMissionDate(mission.startTime)}</td>
                       <td className="py-4 px-6 font-mono font-bold text-slate-500 italic">
                          {mission.duration ? `${mission.duration}h` : '—'}
                       </td>
                       <td className="py-4 px-6 font-mono font-bold text-teal-400 tracking-tighter">
                          {mission.areaCovered ? `${mission.areaCovered} km²` : '—'}
                       </td>
                       <td className="py-4 px-6">
                          {(mission.incidentsReported ?? 0) > 0 ? (
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
                       <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                             <button 
                               onClick={() => startEditing(mission)}
                               className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                               title={isArabic ? 'تعديل' : 'Edit'}
                             >
                                <Edit3 size={14} className="text-teal-400" />
                             </button>
                             <button 
                               onClick={() => handleDelete(mission)}
                               className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                               title={isArabic ? 'حذف' : 'Delete'}
                             >
                                <Trash2 size={14} className="text-rose-400" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {filteredMissions.length === 0 && (
                      <tr>
                         <td colSpan={8} className="py-8 text-slate-500 font-bold text-xs uppercase tracking-widest">
                            {isArabic ? 'لا توجد سجلات مطابقة' : 'No matching logs'}
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
      </div>

      {/* ── Add/Edit Modal Form ──────────────────────────────────────────────── */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[999] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <Card 
            className="w-full max-w-[700px] p-5 md:p-8 border border-white/10 bg-[#0c1628]/95 rounded-2xl md:rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black text-white tracking-tight mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
              <Ship className="text-teal-400" size={24} />
              {editingPatrol 
                ? (isArabic ? 'تعديل بيانات الدورية' : 'Edit Patrol Details')
                : (isArabic ? 'تسجيل دورية جديدة' : 'Log New Patrol')
              }
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'رمز الدورية *' : 'Patrol Code *'}
                  </label>
                  <Input 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. PAT-204"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'المنطقة (EN) *' : 'Zone (EN) *'}
                  </label>
                  <Input 
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="e.g. Sector Delta"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'المنطقة (AR) *' : 'Zone (AR) *'}
                  </label>
                  <Input 
                    value={zoneAr}
                    onChange={(e) => setZoneAr(e.target.value)}
                    placeholder="e.g. قطاع دلتا"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'المركب المستخدم *' : 'Deployed Vessel *'}
                  </label>
                  <select 
                    value={vesselId}
                    onChange={(e) => setVesselId(e.target.value)}
                    className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
                    required
                  >
                    <option value="">{isArabic ? 'اختر مركباً...' : 'Select vessel...'}</option>
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {isArabic ? v.nameAr || v.name : v.name} {v.code ? `(${v.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'ضابط الدورية *' : 'Patrol Officer *'}
                  </label>
                  <select 
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
                    required
                  >
                    <option value="">{isArabic ? 'اختر ضابطاً...' : 'Select officer...'}</option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {isArabic ? o.nameAr || o.name : o.name} ({o.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'المساحة المغطاة (كم²)' : 'Area Covered (km²)'}
                  </label>
                  <Input 
                    type="number"
                    step="any"
                    min="0"
                    value={areaCovered}
                    onChange={(e) => setAreaCovered(e.target.value)}
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'المدة (ساعات)' : 'Duration (Hours)'}
                  </label>
                  <Input 
                    type="number"
                    step="any"
                    min="0"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'حالة الطقس' : 'Weather Conditions'}
                  </label>
                  <Input 
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    placeholder="e.g. Clear, 12kt Wind"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'الحالة التشغيلية *' : 'Status *'}
                  </label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
                    required
                  >
                    <option value="ACTIVE">{isArabic ? 'نشط (ACTIVE)' : 'Active'}</option>
                    <option value="STANDBY">{isArabic ? 'استعداد (STANDBY)' : 'Standby'}</option>
                    <option value="EMERGENCY">{isArabic ? 'طوارئ (EMERGENCY)' : 'Emergency'}</option>
                    <option value="COMPLETED">{isArabic ? 'مكتمل (COMPLETED)' : 'Completed'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'المخالفات المرصودة' : 'Incidents Reported'}
                  </label>
                  <Input 
                    type="number"
                    min="0"
                    value={incidentsReported}
                    onChange={(e) => setIncidentsReported(e.target.value)}
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {isArabic ? 'الملاحظات الرئيسية' : 'Observations'}
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder={isArabic ? 'أدخل ملاحظات الدورية هنا...' : 'Enter patrol observations here...'}
                  className="w-full h-24 bg-[#050b14] border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:border-teal-500 text-sm placeholder:text-slate-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  disabled={submitting}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-500 text-[#0c1628] font-black rounded-xl py-2.5 px-6"
                >
                  {submitting 
                    ? <Loader2 className="animate-spin" size={16} /> 
                    : (editingPatrol ? (isArabic ? 'تحديث الدورية' : 'Update Patrol') : (isArabic ? 'تسجيل الدورية' : 'Log Patrol'))
                  }
                </Button>
              </div>

            </form>
          </Card>
        </div>
      )}

      <div className="h-20" /> {/* Spacer */}
    </div>
  );
}
