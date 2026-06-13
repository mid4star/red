'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Waves,
  Edit3,
  Trash2,
  X,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface Vessel {
  id?: string;
  code?: string | null;
  name: string;
  nameAr?: string | null;
  regNumber: string;
  type?: string | null;
  status: string;
  fuelLevel: number;
  healthScore: number;
  engineHours: number;
}


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
    <Card className="p-5 border border-th-border hover:shadow-2xl hover:shadow-teal-500/10 transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-th-muted">
             {isAr ? stat.labelAr : stat.label}
          </p>
          <h3 className="text-2xl font-black text-th-text tracking-tight">{stat.value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function VesselCard({ 
  vessel, 
  isAr, 
  onEdit, 
  onDelete,
  activeMenuId,
  setActiveMenuId
}: { 
  vessel: Vessel, 
  isAr: boolean,
  onEdit: (v: Vessel) => void,
  onDelete: (v: Vessel) => void,
  activeMenuId: string | null,
  setActiveMenuId: (id: string | null) => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500';
      case 'MISSION': return 'bg-blue-500';
      case 'MAINTENANCE': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-400';
      case 'MISSION': return 'text-blue-400';
      case 'MAINTENANCE': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    if (isAr) {
      switch (status) {
        case 'ACTIVE': return 'نشط';
        case 'MAINTENANCE': return 'صيانة';
        case 'MISSION': return 'في مهمة';
        default: return status;
      }
    }
    return status;
  };

  const getTypeLabel = (type: string | null | undefined) => {
    if (!type) return '';
    if (isAr) {
      switch (type) {
        case 'PATROL': return 'دورية';
        case 'RESEARCH': return 'بحثي';
        case 'RESCUE': return 'إنقاذ';
        default: return type;
      }
    }
    return type;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className="group border border-th-border overflow-hidden hover:shadow-[0_0_30px_rgba(45,212,191,0.1)] transition-all duration-500 bg-th-surface2 relative">
        {/* Card Header & Visual */}
        <div className="relative h-48 bg-th-surface overflow-hidden border-b border-th-border">
           <div className="absolute inset-0 bg-gradient-to-t from-th-surface2 via-th-surface2/20 to-transparent z-10" />
           
           {/* Placeholder for Vessel Image */}
           <div className="absolute inset-0 flex items-center justify-center bg-th-input">
              <div className="relative">
                 <Waves size={80} className="text-teal-500/10 animate-pulse" />
                 <Ship size={48} className="text-th-text/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
              </div>
           </div>

           {/* Top Badges / Options Dropdown */}
           <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-20 flex gap-2`}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(activeMenuId === vessel.id ? null : (vessel.id || null));
                }}
                aria-label={isAr ? 'خيارات الوحدة' : 'Vessel options'}
                className="w-11 h-11 rounded-full bg-th-surface/50 backdrop-blur-md text-th-text border border-th-border flex items-center justify-center hover:bg-th-surface2 transition-all"
              >
                 <MoreVertical size={18} />
              </button>

              {activeMenuId === vessel.id && (
                <div className={`absolute top-10 ${isAr ? 'left-0' : 'right-0'} bg-th-surface border border-th-border rounded-xl shadow-2xl p-1.5 z-30 min-w-[120px] backdrop-blur-xl text-th-text`}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(vessel);
                      setActiveMenuId(null);
                    }}
                    className={`w-full text-xs font-bold text-th-muted hover:text-th-text hover:bg-th-surface2 rounded-lg flex items-center gap-2 p-2 ${isAr ? 'text-right' : 'text-left'}`}
                  >
                    <Edit3 size={14} className="text-teal-400" />
                    <span>{isAr ? 'تعديل' : 'Edit'}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(vessel);
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
           
            <div className={`absolute bottom-4 ${isAr ? 'right-4' : 'left-4'} z-20`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">#{vessel.code || 'NO-CODE'}</span>
                <span className="text-[10px] font-bold text-th-muted bg-th-input px-1.5 py-0.5 rounded border border-th-border">
                  {vessel.regNumber}
                </span>
              </div>
              <h3 className="text-th-text text-lg font-bold tracking-tight">
                {isAr ? vessel.nameAr || vessel.name : vessel.name}
              </h3>
           </div>
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-5">
           <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-th-muted flex items-center gap-1.5">
                 <Tag size={14} className="text-teal-400" />
                 {getTypeLabel(vessel.type)}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(vessel.status)}`} />
                <span className={`text-[11px] font-bold tracking-tight ${getStatusTextColor(vessel.status)}`}>
                   {getStatusLabel(vessel.status)}
                </span>
              </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-th-input/40 border border-th-border/40">
                 <div className="flex items-center gap-2 mb-1">
                    <Fuel size={14} className="text-blue-400" />
                    <span className="text-xs font-bold text-th-muted uppercase">{isAr ? 'الوقود' : 'Fuel'}</span>
                 </div>
                 <div className="flex items-end justify-between">
                    <span className="text-sm font-bold text-th-text">{vessel.fuelLevel}%</span>
                    <div className="w-12 h-1 bg-th-border rounded-full overflow-hidden mb-1">
                       <div className="h-full bg-blue-500 rounded-full" style={{ width: `${vessel.fuelLevel}%` }} />
                    </div>
                 </div>
              </div>
              <div className="p-3 rounded-2xl bg-th-input/40 border border-th-border/40">
                 <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-indigo-400" />
                    <span className="text-xs font-bold text-th-muted uppercase">{isAr ? 'ساعات' : 'Hours'}</span>
                 </div>
                 <span className="text-sm font-bold text-th-text">{vessel.engineHours.toLocaleString()}</span>
              </div>
           </div>

           {/* Capacity/Health Bar */}
           <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                 <span className="text-[10px] font-bold text-th-muted uppercase tracking-tighter italic">
                    {isAr ? 'الحالة التشغيلية' : 'Operational Health'}
                 </span>
                 <span className="text-[10px] font-black text-th-text">{vessel.healthScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-th-border/40 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ${vessel.healthScore > 80 ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.3)]' : vessel.healthScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                   style={{ width: `${vessel.healthScore}%` }} 
                 />
              </div>
           </div>

           {/* Footer Action */}
           <div className="pt-2 flex gap-2">
              <Button 
                intent="primary" 
                onClick={() => onEdit(vessel)}
                className="flex-1 text-[11px] font-black py-2.5 shadow-[0_0_15px_rgba(20,184,166,0.2)] bg-teal-500 text-[#001529] hover:bg-teal-400 uppercase italic"
              >
                 {isAr ? 'إدارة الوحدة' : 'Manage Unit'}
              </Button>
              <Button 
                intent="outline" 
                onClick={() => onEdit(vessel)}
                className="px-3 border-th-border bg-th-input hover:bg-th-surface/80"
              >
                 <Settings2 size={16} className="text-th-muted" />
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
  const [fleetData, setFleetData] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  // Form fields matching Vessel Prisma Model
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [type, setType] = useState('PATROL');
  const [status, setStatus] = useState('ACTIVE');
  const [fuelLevel, setFuelLevel] = useState<string>('100');
  const [healthScore, setHealthScore] = useState<string>('100');
  const [engineHours, setEngineHours] = useState<string>('0');

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

  const resetFormFields = () => {
    setCode('');
    setName('');
    setNameAr('');
    setRegNumber('');
    setType('PATROL');
    setStatus('ACTIVE');
    setFuelLevel('100');
    setHealthScore('100');
    setEngineHours('0');
    setEditingVessel(null);
  };

  const startEditing = (v: Vessel) => {
    setEditingVessel(v);
    setCode(v.code || '');
    setName(v.name);
    setNameAr(v.nameAr || '');
    setRegNumber(v.regNumber);
    setType(v.type || 'PATROL');
    setStatus(v.status || 'ACTIVE');
    setFuelLevel(String(v.fuelLevel));
    setHealthScore(String(v.healthScore));
    setEngineHours(String(v.engineHours));
    setShowModal(true);
  };

  // Submit Add or Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regNumber) return;

    const parsedFuel = parseFloat(fuelLevel) || 0;
    const parsedHealth = parseFloat(healthScore) || 0;
    const parsedHours = parseFloat(engineHours) || 0;

    if (parsedFuel < 0 || parsedFuel > 100 || parsedHealth < 0 || parsedHealth > 100) {
      alert(isArabic 
        ? 'يجب أن تكون قيم الوقود والحالة التشغيلية بين 0 و 100' 
        : 'Fuel level and Health score values must be between 0 and 100'
      );
      return;
    }

    setSubmitting(true);
    try {
      const vesselData = {
        code,
        name,
        nameAr,
        regNumber,
        type,
        status,
        fuelLevel: parsedFuel,
        healthScore: parsedHealth,
        engineHours: parsedHours,
      };

      if (editingVessel?.id) {
        // Edit Vessel
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'fleet',
            action: 'UPDATE',
            id: editingVessel.id,
            data: vesselData
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to update vessel');
        }
      } else {
        // Add Vessel
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'fleet',
            action: 'ADD',
            data: vesselData
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to add vessel');
        }
      }

      resetFormFields();
      setShowModal(false);
      fetchFleet();
    } catch (err: any) {
      console.error('Error saving vessel:', err);
      const errMsg = err.message || String(err);
      const isUniqueError = errMsg.includes('Unique constraint') || errMsg.includes('regNumber');
      alert(isArabic 
        ? isUniqueError 
          ? `رقم التسجيل "${regNumber}" مستخدم بالفعل. يرجى استخدام رقم تسجيل مختلف.`
          : `حدث خطأ أثناء حفظ البيانات: ${errMsg}` 
        : isUniqueError
          ? `Registration number "${regNumber}" already exists. Please use a different registration number.`
          : `Error saving vessel data: ${errMsg}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Vessel
  const handleDelete = async (vessel: Vessel) => {
    if (!vessel.id) return;
    const confirmMsg = isArabic 
      ? `هل أنت متأكد من حذف الوحدة البحرية "${vessel.nameAr || vessel.name}" نهائياً من النظام؟`
      : `Are you sure you want to permanently delete vessel "${vessel.name}"?`;
    
    if (confirm(confirmMsg)) {
      setSubmitting(true);
      try {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'fleet',
            action: 'DELETE',
            id: vessel.id
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to delete vessel');
        }
        fetchFleet();
      } catch (err: any) {
        console.error('Error deleting vessel:', err);
        alert(isArabic 
          ? `حدث خطأ أثناء حذف الوحدة: ${err.message || err}`
          : `Error deleting vessel: ${err.message || err}`
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Compute dynamic stats based on database values
  const totalVessels = fleetData.length;
  const activeMissions = fleetData.filter(v => v.status === 'MISSION').length;
  const maintenanceCount = fleetData.filter(v => v.status === 'MAINTENANCE').length;
  
  const dynamicStats = [
    { label: 'Total Vessels', labelAr: 'إجمالي الوحدات البحرية', value: String(totalVessels), icon: Ship, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Missions', labelAr: 'مهمات نشطة', value: String(activeMissions), icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Scheduled Maintenance', labelAr: 'صيانة مجدولة', value: String(maintenanceCount), icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Safety Compliance', labelAr: 'امتثال السلامة', value: '98%', icon: ShieldCheck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ];

  // Filter and search
  const filteredData = fleetData.filter(v => {
    if (filter !== 'ALL' && v.status !== filter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = v.name?.toLowerCase().includes(query) || false;
      const nameArMatch = v.nameAr?.toLowerCase().includes(query) || false;
      const codeMatch = v.code?.toLowerCase().includes(query) || false;
      const regMatch = v.regNumber?.toLowerCase().includes(query) || false;
      const typeMatch = v.type?.toLowerCase().includes(query) || false;
      return nameMatch || nameArMatch || codeMatch || regMatch || typeMatch;
    }
    
    return true;
  });

  return (
    <div 
      className={showModal ? "space-y-6 max-w-[1600px] mx-auto relative pb-12 animate-in fade-in duration-700" : "max-w-[1600px] mx-auto space-y-6 relative animate-in fade-in duration-700"} 
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={() => setActiveMenuId(null)}
    >
      {showModal ? (
        /* ── INLINE FORM VIEW (BORDERLESS REDESIGN) ── */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 pb-4 border-b border-th-border">
            <button 
              onClick={() => setShowModal(false)}
              type="button"
              className="p-2.5 rounded-2xl bg-th-input border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface/80 transition-all flex items-center justify-center shrink-0"
            >
              <ArrowRight size={20} className={isArabic ? '' : 'rotate-180'} />
            </button>
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                {isArabic ? 'إدارة الأصول' : 'Asset Management'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-th-text tracking-tight flex items-center gap-2">
                <Ship className="text-teal-400" size={20} />
                {editingVessel 
                  ? (isArabic ? 'تعديل بيانات الوحدة البحرية' : 'Edit Vessel Details')
                  : (isArabic ? 'إضافة وحدة بحرية جديدة' : 'Add New Vessel')
                }
              </h2>
            </div>
          </div>

          {/* Form Content - Directly on page background */}
          <div className="w-full max-w-4xl mx-auto pt-4">
            <form onSubmit={handleFormSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="vessel-code" className="text-xs font-black text-th-muted uppercase tracking-widest">
                    {isArabic ? 'رمز الوحدة' : 'Vessel Code'}
                  </label>
                  <Input 
                    id="vessel-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. V-102"
                    className="h-11 rounded-xl transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vessel-reg" className="text-xs font-black text-th-muted uppercase tracking-widest">
                    {isArabic ? 'رقم التسجيل الموحد *' : 'Registration Number *'}
                  </label>
                  <Input 
                    id="vessel-reg"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. REG-776"
                    className="h-11 rounded-xl transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="vessel-name-en" className="text-xs font-black text-th-muted uppercase tracking-widest">
                    {isArabic ? 'الاسم بالإنجليزية *' : 'Name (EN) *'}
                  </label>
                  <Input 
                    id="vessel-name-en"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Red Sea Guardian"
                    className="h-11 rounded-xl transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vessel-name-ar" className="text-xs font-black text-th-muted uppercase tracking-widest">
                    {isArabic ? 'الاسم بالعربية *' : 'Name (AR) *'}
                  </label>
                  <Input 
                    id="vessel-name-ar"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="e.g. حارس البحر الأحمر"
                    className="h-11 rounded-xl transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vessel-type" className="text-xs font-black text-th-muted uppercase tracking-widest">
                    {isArabic ? 'نوع الوحدة' : 'Vessel Type'}
                  </label>
                  <select 
                    id="vessel-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-11 bg-th-input border border-th-border text-th-text rounded-xl px-3 focus:bg-th-surface/80 focus:border-teal-500/50 transition-all text-xs font-bold cursor-pointer"
                  >
                    <option value="PATROL" className="bg-th-surface text-th-text">{isArabic ? 'دورية (PATROL)' : 'Patrol'}</option>
                    <option value="RESEARCH" className="bg-th-surface text-th-text">{isArabic ? 'بحثي (RESEARCH)' : 'Research'}</option>
                    <option value="RESCUE" className="bg-th-surface text-th-text">{isArabic ? 'إنقاذ (RESCUE)' : 'Rescue'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vessel-status" className="text-xs font-black text-th-muted uppercase tracking-widest">
                    {isArabic ? 'الحالة التشغيلية' : 'Status'}
                  </label>
                  <select 
                    id="vessel-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-11 bg-th-input border border-th-border text-th-text rounded-xl px-3 focus:bg-th-surface/80 focus:border-teal-500/50 transition-all text-xs font-bold cursor-pointer"
                  >
                    <option value="ACTIVE" className="bg-th-surface text-th-text">{isArabic ? 'نشط (ACTIVE)' : 'Active'}</option>
                    <option value="MAINTENANCE" className="bg-th-surface text-th-text">{isArabic ? 'صيانة (MAINTENANCE)' : 'Maintenance'}</option>
                    <option value="MISSION" className="bg-th-surface text-th-text">{isArabic ? 'في مهمة (MISSION)' : 'Mission'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vessel-fuel" className="text-xs font-black text-th-muted uppercase tracking-widest">
                    {isArabic ? 'مستوى الوقود (%)' : 'Fuel Level (%)'}
                  </label>
                  <Input 
                    id="vessel-fuel"
                    type="number"
                    min="0"
                    max="100"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(e.target.value)}
                    className="h-11 rounded-xl transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vessel-health" className="text-xs font-black text-th-muted uppercase tracking-widest">
                    {isArabic ? 'مؤشر الحالة الصحية للوحدة (%)' : 'Health Score (%)'}
                  </label>
                  <Input 
                    id="vessel-health"
                    type="number"
                    min="0"
                    max="100"
                    value={healthScore}
                    onChange={(e) => setHealthScore(e.target.value)}
                    className="h-11 rounded-xl transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vessel-hours" className="text-xs font-black text-th-muted uppercase tracking-widest">
                    {isArabic ? 'ساعات تشغيل المحرك' : 'Engine Hours'}
                  </label>
                  <Input 
                    id="vessel-hours"
                    type="number"
                    min="0"
                    value={engineHours}
                    onChange={(e) => setEngineHours(e.target.value)}
                    className="h-11 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-th-border">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-th-muted hover:text-th-text transition-colors"
                  disabled={submitting}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-500 text-[#0c1628] font-black rounded-xl py-3 px-8 text-xs uppercase tracking-wider italic flex items-center gap-2"
                >
                  {submitting 
                    ? <Loader2 className="animate-spin" size={16} /> 
                    : (editingVessel ? (isArabic ? 'تحديث الوحدة' : 'Update Vessel') : (isArabic ? 'إضافة الوحدة' : 'Create Vessel'))
                  }
                </Button>
              </div>

            </form>
          </div>
        </div>
      ) : (
        /* ── MAIN DIRECTORY VIEW ── */
        <>
          {/* ── Page Header ──────────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between bg-th-surface2 p-4 md:p-6 rounded-2xl border border-th-border shadow-sm gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                  <Ship size={24} />
               </div>
               <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 block mb-1">
                     {isArabic ? 'إدارة الأصول' : 'Asset Management'}
                 </span>
                 <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-th-text uppercase m-0 leading-none">
                   {isArabic ? 'أساطيل ومعدات الهيئة' : 'Red Sea Fleet'}
                 </h1>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-start shrink-0">
               <div className="relative group w-full sm:w-auto min-w-[200px]">
                  <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-th-muted group-focus-within:text-teal-400 transition-colors`} size={16} />
                  <input 
                    type="text" 
                    placeholder={isArabic ? 'ابحث...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-th-input border border-th-border rounded-xl h-11 ${isArabic ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-sm font-medium text-th-text placeholder:text-th-dim outline-none ring-0 shadow-sm focus:border-teal-500/30 transition-all`}
                  />
               </div>
               <Button 
                 onClick={() => { resetFormFields(); setShowModal(true); }}
                 className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 px-4 sm:px-6 rounded-xl h-11 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
               >
                  <Plus size={18} />
                  <span className="font-bold tracking-wide">{isArabic ? 'إضافة أصل' : 'Add Asset'}</span>
               </Button>
            </div>
          </div>

          {/* ── Summary Stats ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dynamicStats.map((stat, idx) => (
              <StatCard key={idx} stat={stat} isAr={isArabic} />
            ))}
          </div>

          {/* ── Filters & Tabs ───────────────────────────────────────────────────── */}
          <div className="bg-th-surface p-2 rounded-2xl border border-th-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1">
               {['ALL', 'ACTIVE', 'MISSION', 'MAINTENANCE'].map((t) => (
                 <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`
                      px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all
                      ${filter === t 
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                        : 'text-th-muted hover:text-th-text hover:bg-th-surface2 border border-transparent'
                      }
                    `}
                 >
                   {t === 'ALL' ? (isArabic ? 'الكل' : 'All Assets') : t}
                 </button>
               ))}
            </div>
            
            <div className="flex items-center gap-3 pr-2">
               <span className="text-[11px] font-bold text-th-muted uppercase tracking-widest px-3 border-r border-th-border">
                 {isArabic ? `${filteredData.length} وحدات` : `${filteredData.length} units`}
               </span>
               <button className="p-2.5 rounded-xl bg-th-input border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface/80 transition-all">
                  <Filter size={18} />
               </button>
               <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Settings2 size={18} />
               </button>
            </div>
          </div>

          {/* ── Main Grid ────────────────────────────────────────────────────────── */}
          {filteredData.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-900/10 rounded-3xl border border-dashed border-white/5">
              {isArabic ? 'لا توجد وحدات بحرية متطابقة' : 'No matching vessels found'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
               <AnimatePresence mode="popLayout">
                 {filteredData.map((vessel) => (
                    <VesselCard 
                      key={vessel.id} 
                      vessel={vessel} 
                      isAr={isArabic}
                      onEdit={startEditing}
                      onDelete={handleDelete}
                      activeMenuId={activeMenuId}
                      setActiveMenuId={setActiveMenuId}
                    />
                 ))}
               </AnimatePresence>
            </div>
          )}
        </>
      )}

    </div>
  );
}
