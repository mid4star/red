'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  MapPin,
  Scale,
  User,
  ArrowRight,
  Edit3,
  Trash2,
  Filter,
  FileText,
  Gavel,
  Ship,
  TrendingUp,
  X,
  ChevronRight,
  Eye,
  BadgeAlert,
  Banknote,
  Shield
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Violation {
  id?: string;
  code?: string | null;
  date?: string | Date;
  officerId: string;
  locationLat: number;
  locationLng: number;
  types?: string | null;
  typeAr?: string | null;
  severity: string;
  status: string;
  violatorName?: string | null;
  vesselName?: string | null;
  actionTaken?: string | null;
  fineAmount?: number | null;
  location?: string | null;
  locationAr?: string | null;
  description?: string | null;
  officer?: { name?: string; nameAr?: string; employeeId?: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSeverityConfig(severity: string) {
  switch (severity) {
    case 'HIGH':
      return {
        label: 'HIGH',
        labelAr: 'حرجة',
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        dot: 'bg-rose-500',
        barColor: 'bg-rose-500',
        rowBorder: 'border-l-rose-500',
        badgeColor: 'danger' as const,
      };
    case 'MEDIUM':
      return {
        label: 'MEDIUM',
        labelAr: 'متوسطة',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        barColor: 'bg-amber-500',
        rowBorder: 'border-l-amber-500',
        badgeColor: 'warning' as const,
      };
    default:
      return {
        label: 'LOW',
        labelAr: 'منخفضة',
        bg: 'bg-slate-500/15',
        border: 'border-slate-500/30',
        text: 'text-slate-400',
        dot: 'bg-slate-400',
        barColor: 'bg-slate-400',
        rowBorder: 'border-l-slate-500',
        badgeColor: 'primary' as const,
      };
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'INVESTIGATING':
      return {
        label: 'Investigating',
        labelAr: 'قيد التحقيق',
        color: 'text-amber-400',
        dot: 'bg-amber-500 animate-pulse',
        bg: 'bg-amber-500/10',
      };
    case 'RESOLVED':
      return {
        label: 'Resolved',
        labelAr: 'تم الحل',
        color: 'text-emerald-400',
        dot: 'bg-emerald-500',
        bg: 'bg-emerald-500/10',
      };
    default:
      return {
        label: 'Open',
        labelAr: 'جديد',
        color: 'text-rose-400',
        dot: 'bg-rose-500 animate-pulse',
        bg: 'bg-rose-500/10',
      };
  }
}

function formatDate(date: any): string {
  if (!date) return '—';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, labelAr, color, bg, trend, isAr }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5 border border-white/5 bg-slate-900/40 backdrop-blur-xl hover:border-white/10 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={20} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
              <TrendingUp size={11} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {isAr ? labelAr : label}
        </p>
        <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
        <div className={`absolute -bottom-3 -right-3 opacity-[0.04] ${color}`}>
          <Icon size={80} />
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function ViolationDetailPanel({ violation, isAr, onEdit, onDelete, onClose }: {
  violation: Violation;
  isAr: boolean;
  onEdit: (v: Violation) => void;
  onDelete: (v: Violation) => void;
  onClose: () => void;
}) {
  const sev = getSeverityConfig(violation.severity);
  const sta = getStatusConfig(violation.status);

  return (
    <motion.div
      key={violation.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden h-full"
    >
      {/* Panel Header */}
      <div className={`p-5 border-b border-white/10 bg-gradient-to-r from-slate-950/60 to-slate-900/20`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] font-black tracking-widest uppercase ${sev.text} bg-white/5 px-2 py-0.5 rounded-full border ${sev.border}`}>
                {isAr ? sev.labelAr : sev.label}
              </span>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${sta.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sta.dot}`} />
                <span className={`text-[10px] font-black uppercase tracking-wide ${sta.color}`}>
                  {isAr ? sta.labelAr : sta.label}
                </span>
              </div>
            </div>
            <h3 className="text-base font-black text-white tracking-tight leading-tight">
              {isAr ? violation.typeAr : violation.types}
            </h3>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5 font-mono">
              #{violation.code || violation.id?.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
            aria-label="Close panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Panel Body — scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-detail-scrollbar">

        {/* Date & Location */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              {isAr ? 'تاريخ البلاغ' : 'Report Date'}
            </p>
            <p className="text-xs font-bold text-white">{formatDate(violation.date)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              {isAr ? 'الإحداثيات' : 'Coordinates'}
            </p>
            <p className="text-[10px] font-bold text-teal-400 font-mono">
              {violation.locationLat?.toFixed(4)}, {violation.locationLng?.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={13} className="text-teal-400 shrink-0" />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {isAr ? 'الموقع' : 'Location'}
            </p>
          </div>
          <p className="text-xs font-bold text-white">
            {isAr ? violation.locationAr : violation.location}
          </p>
        </div>

        {/* Violator & Vessel */}
        {(violation.violatorName || violation.vesselName) && (
          <div className="grid grid-cols-1 gap-3">
            {violation.violatorName && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <User size={13} className="text-indigo-400 shrink-0" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {isAr ? 'اسم المخالف' : 'Violator'}
                  </p>
                </div>
                <p className="text-xs font-bold text-white">{violation.violatorName}</p>
              </div>
            )}
            {violation.vesselName && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Ship size={13} className="text-cyan-400 shrink-0" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {isAr ? 'القارب / الوسيلة' : 'Vessel'}
                  </p>
                </div>
                <p className="text-xs font-bold text-white">{violation.vesselName}</p>
              </div>
            )}
          </div>
        )}

        {/* Fine Amount */}
        {violation.fineAmount !== undefined && violation.fineAmount !== null && violation.fineAmount > 0 && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Banknote size={13} className="text-emerald-400 shrink-0" />
              <p className="text-[9px] font-black text-emerald-400/70 uppercase tracking-widest">
                {isAr ? 'قيمة الغرامة' : 'Fine Amount'}
              </p>
            </div>
            <p className="text-sm font-black text-emerald-400">
              {violation.fineAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
            </p>
          </div>
        )}

        {/* Action Taken */}
        {violation.actionTaken && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Gavel size={13} className="text-rose-400 shrink-0" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {isAr ? 'الإجراء المتخذ' : 'Action Taken'}
              </p>
            </div>
            <p className="text-xs font-bold text-white leading-relaxed">{violation.actionTaken}</p>
          </div>
        )}

        {/* Description */}
        {violation.description && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={13} className="text-slate-400 shrink-0" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {isAr ? 'تفاصيل الانتهاك' : 'Description'}
              </p>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">{violation.description}</p>
          </div>
        )}
      </div>

      {/* Panel Footer — Actions */}
      <div className="p-4 border-t border-white/10 flex gap-2 shrink-0">
        <button
          onClick={() => onEdit(violation)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
        >
          <Edit3 size={13} />
          {isAr ? 'تعديل' : 'Edit'}
        </button>
        <button
          onClick={() => onDelete(violation)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold uppercase tracking-wider"
        >
          <Trash2 size={13} />
          {isAr ? 'حذف' : 'Delete'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ViolationsPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';

  // Data state
  const [violations, setViolations] = useState<Violation[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingViolation, setEditingViolation] = useState<Violation | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form fields
  const [code, setCode] = useState('');
  const [types, setTypes] = useState('');
  const [typeAr, setTypeAr] = useState('');
  const [severity, setSeverity] = useState('LOW');
  const [status, setStatus] = useState('OPEN');
  const [violatorName, setViolatorName] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [fineAmount, setFineAmount] = useState('0');
  const [location, setLocation] = useState('');
  const [locationAr, setLocationAr] = useState('');
  const [locationLat, setLocationLat] = useState('27.7128');
  const [locationLng, setLocationLng] = useState('34.2131');
  const [description, setDescription] = useState('');
  const [officerId, setOfficerId] = useState('');

  // ── Data Fetching ──
  const fetchViolations = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=violations');
      const json = await res.json();
      if (json.success) setViolations(json.data);
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
        const raw = localStorage.getItem('active_user_session');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const found = json.data.find((u: any) => u.employeeId === parsed.employeeId || u.id === parsed.employeeId);
            if (found) { setOfficerId(found.id); return; }
          } catch {}
        }
        if (json.data.length > 0) setOfficerId(json.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchViolations();
    fetchUsers();
  }, []);

  // ── Form Helpers ──
  const resetForm = () => {
    setCode(''); setTypes(''); setTypeAr(''); setSeverity('LOW'); setStatus('OPEN');
    setViolatorName(''); setVesselName(''); setActionTaken(''); setFineAmount('0');
    setLocation(''); setLocationAr(''); setLocationLat('27.7128'); setLocationLng('34.2131');
    setDescription(''); setEditingViolation(null);
    const raw = localStorage.getItem('active_user_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const found = users.find(u => u.employeeId === parsed.employeeId || u.id === parsed.employeeId);
        if (found) { setOfficerId(found.id); return; }
      } catch {}
    }
    if (users.length > 0) setOfficerId(users[0].id);
  };

  const startEditing = (v: Violation) => {
    setEditingViolation(v);
    setCode(v.code || '');
    setTypes(v.types || '');
    setTypeAr(v.typeAr || '');
    setSeverity(v.severity || 'LOW');
    setStatus(v.status === 'NEW' ? 'OPEN' : (v.status || 'OPEN'));
    setViolatorName(v.violatorName || '');
    setVesselName(v.vesselName || '');
    setActionTaken(v.actionTaken || '');
    setFineAmount(String(v.fineAmount || 0));
    setLocation(v.location || '');
    setLocationAr(v.locationAr || '');
    setLocationLat(String(v.locationLat || 27.7128));
    setLocationLng(String(v.locationLng || 34.2131));
    setDescription(v.description || '');
    setOfficerId(v.officerId || '');
    setShowForm(true);
  };

  // ── Submit ──
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!types || !location || !officerId) return;
    setSubmitting(true);
    try {
      const data = {
        code: code || `VIO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        types, typeAr: typeAr || types, severity, status,
        violatorName: violatorName || null, vesselName: vesselName || null,
        actionTaken: actionTaken || null, fineAmount: parseFloat(fineAmount) || 0,
        location, locationAr: locationAr || location,
        locationLat: parseFloat(locationLat) || 27.7128,
        locationLng: parseFloat(locationLng) || 34.2131,
        description, officerId,
      };
      const endpoint = '/api/staff/mutate';
      const body = editingViolation?.id
        ? JSON.stringify({ collectionName: 'violations', action: 'UPDATE', id: editingViolation.id, data })
        : JSON.stringify({ collectionName: 'violations', action: 'ADD', data });

      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed');
      }
      resetForm();
      setShowForm(false);
      fetchViolations();
    } catch (err: any) {
      alert(isAr ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (v: Violation) => {
    if (!v.id) return;
    const msg = isAr
      ? `هل أنت متأكد من حذف البلاغ "${v.code}" نهائياً؟`
      : `Permanently delete report "${v.code}"?`;
    if (!confirm(msg)) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/staff/mutate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionName: 'violations', action: 'DELETE', id: v.id }),
      });
      if (!response.ok) { const e = await response.json(); throw new Error(e.error); }
      if (selectedViolation?.id === v.id) setSelectedViolation(null);
      fetchViolations();
    } catch (err: any) {
      alert(isAr ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Computed Stats ──
  const stats = useMemo(() => {
    const total = violations.length;
    const high = violations.filter(v => v.severity === 'HIGH').length;
    const investigating = violations.filter(v => v.status === 'INVESTIGATING').length;
    const totalFines = violations.reduce((sum, v) => sum + (v.fineAmount || 0), 0);
    return { total, high, investigating, totalFines };
  }, [violations]);

  // ── Filtered Data ──
  const filtered = useMemo(() => {
    return violations.filter(v => {
      if (filterSeverity !== 'ALL' && v.severity !== filterSeverity) return false;
      if (filterStatus === 'OPEN' && v.status !== 'OPEN' && v.status !== 'NEW') return false;
      if (filterStatus !== 'ALL' && filterStatus !== 'OPEN' && v.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          v.code?.toLowerCase().includes(q) ||
          v.types?.toLowerCase().includes(q) ||
          v.typeAr?.toLowerCase().includes(q) ||
          v.violatorName?.toLowerCase().includes(q) ||
          v.vesselName?.toLowerCase().includes(q) ||
          v.location?.toLowerCase().includes(q) ||
          v.locationAr?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [violations, filterSeverity, filterStatus, searchQuery]);

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            {isAr ? 'جاري تحميل السجل...' : 'Loading Violations...'}
          </span>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // INLINE FORM VIEW
  // ────────────────────────────────────────────────────────────────────────────

  if (showForm) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-4 duration-500" dir={isAr ? 'rtl' : 'ltr'}>

        {/* Back Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/10">
          <button
            onClick={() => { resetForm(); setShowForm(false); }}
            type="button"
            aria-label={isAr ? 'رجوع' : 'Go back'}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shrink-0"
          >
            <ArrowRight size={20} className={isAr ? '' : 'rotate-180'} />
          </button>
          <div>
            <span className="text-[10px] font-black tracking-[0.2em] text-rose-400 uppercase italic">
              {isAr ? 'مركز الانتهاكات والتسجيل' : 'Infractions Registry'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-rose-500" size={20} />
              {editingViolation
                ? (isAr ? 'تعديل تقرير المخالفة' : 'Edit Violation Report')
                : (isAr ? 'تسجيل مخالفة جديدة' : 'Record New Violation')
              }
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="w-full max-w-4xl mx-auto pt-2">
          <form onSubmit={handleFormSubmit} className="space-y-8">

            {/* Section: Identity */}
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-rose-500/50 inline-block" />
                {isAr ? 'هوية البلاغ' : 'Report Identity'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="v-code" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'رقم البلاغ' : 'Report Code'}
                  </label>
                  <Input id="v-code" value={code} onChange={e => setCode(e.target.value)}
                    placeholder="e.g. VIO-2026-110"
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="v-officer" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'الضابط المسؤول *' : 'Reporting Officer *'}
                  </label>
                  {users.length > 0 ? (
                    <select id="v-officer" value={officerId} onChange={e => setOfficerId(e.target.value)} required
                      className="w-full h-11 bg-[#050b14]/40 border border-white/10 text-white rounded-xl px-3 focus:border-rose-500/50 transition-all text-xs font-bold cursor-pointer">
                      <option value="" className="bg-[#0a1628]">{isAr ? 'اختر الضابط...' : 'Select Officer...'}</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id} className="bg-[#0a1628]">
                          {isAr ? u.nameAr || u.name : u.name} ({u.employeeId})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input id="v-officer" value={officerId} onChange={e => setOfficerId(e.target.value)}
                      placeholder="Officer ID" required
                      className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                  )}
                </div>
              </div>
            </div>

            {/* Section: Infraction Details */}
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-rose-500/50 inline-block" />
                {isAr ? 'تفاصيل الانتهاك' : 'Infraction Details'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="v-type-en" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'نوع الانتهاك (EN) *' : 'Infraction Type (EN) *'}
                  </label>
                  <Input id="v-type-en" value={types} onChange={e => setTypes(e.target.value)} required
                    placeholder="e.g. Illegal Fishing"
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="v-type-ar" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'نوع الانتهاك (AR)' : 'Infraction Type (AR)'}
                  </label>
                  <Input id="v-type-ar" value={typeAr} onChange={e => setTypeAr(e.target.value)}
                    placeholder="مثال: صيد غير قانوني"
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="v-severity" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'درجة الخطورة' : 'Severity Level'}
                  </label>
                  <select id="v-severity" value={severity} onChange={e => setSeverity(e.target.value)}
                    className="w-full h-11 bg-[#050b14]/40 border border-white/10 text-white rounded-xl px-3 focus:border-rose-500/50 transition-all text-xs font-bold cursor-pointer">
                    <option value="LOW" className="bg-[#0a1628]">{isAr ? 'منخفضة (LOW)' : 'Low'}</option>
                    <option value="MEDIUM" className="bg-[#0a1628]">{isAr ? 'متوسطة (MEDIUM)' : 'Medium'}</option>
                    <option value="HIGH" className="bg-[#0a1628]">{isAr ? 'حرجة (HIGH)' : 'High'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="v-status" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'حالة البلاغ' : 'Case Status'}
                  </label>
                  <select id="v-status" value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full h-11 bg-[#050b14]/40 border border-white/10 text-white rounded-xl px-3 focus:border-rose-500/50 transition-all text-xs font-bold cursor-pointer">
                    <option value="OPEN" className="bg-[#0a1628]">{isAr ? 'جديد / مفتوح' : 'New / Open'}</option>
                    <option value="INVESTIGATING" className="bg-[#0a1628]">{isAr ? 'قيد التحقيق' : 'Investigating'}</option>
                    <option value="RESOLVED" className="bg-[#0a1628]">{isAr ? 'تم الحل' : 'Resolved'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Parties */}
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-rose-500/50 inline-block" />
                {isAr ? 'الأطراف المعنية' : 'Involved Parties'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="v-violator" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'اسم المخالف' : 'Violator Name'}
                  </label>
                  <Input id="v-violator" value={violatorName} onChange={e => setViolatorName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="v-vessel" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'اسم القارب / الوسيلة' : 'Vessel / Vehicle Name'}
                  </label>
                  <Input id="v-vessel" value={vesselName} onChange={e => setVesselName(e.target.value)}
                    placeholder="e.g. Al-Jareh"
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                </div>
              </div>
            </div>

            {/* Section: Location */}
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-rose-500/50 inline-block" />
                {isAr ? 'بيانات الموقع' : 'Location Data'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="v-loc-en" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'الموقع بالإنجليزية *' : 'Location (EN) *'}
                  </label>
                  <Input id="v-loc-en" value={location} onChange={e => setLocation(e.target.value)} required
                    placeholder="e.g. Sector 4 - Protected Reef"
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="v-loc-ar" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'الموقع بالعربية *' : 'Location (AR) *'}
                  </label>
                  <Input id="v-loc-ar" value={locationAr} onChange={e => setLocationAr(e.target.value)} required
                    placeholder="القطاع 4 - الشعاب المحمية"
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="v-lat" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'خط العرض *' : 'Latitude *'}
                  </label>
                  <Input id="v-lat" type="number" step="0.0001" value={locationLat} onChange={e => setLocationLat(e.target.value)} required
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3 font-mono" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="v-lng" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'خط الطول *' : 'Longitude *'}
                  </label>
                  <Input id="v-lng" type="number" step="0.0001" value={locationLng} onChange={e => setLocationLng(e.target.value)} required
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3 font-mono" />
                </div>
              </div>
            </div>

            {/* Section: Resolution */}
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-rose-500/50 inline-block" />
                {isAr ? 'القرارات والغرامات' : 'Resolution & Fines'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="v-fine" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'قيمة الغرامة المالية (ج.م)' : 'Fine Amount (EGP)'}
                  </label>
                  <Input id="v-fine" type="number" min="0" value={fineAmount} onChange={e => setFineAmount(e.target.value)}
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="v-action" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'الإجراء المتخذ' : 'Action Taken'}
                  </label>
                  <Input id="v-action" value={actionTaken} onChange={e => setActionTaken(e.target.value)}
                    placeholder={isAr ? 'مثال: إنذار رسمي وغرامة' : 'e.g. Issued citation and warning'}
                    className="bg-[#050b14]/40 border-white/10 text-white rounded-xl focus:border-rose-500/50 py-3" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="v-desc" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'تفاصيل ووصف الانتهاك' : 'Description of Violation'}
                  </label>
                  <textarea id="v-desc" value={description} onChange={e => setDescription(e.target.value)} rows={4}
                    placeholder={isAr ? 'اكتب وصفاً تفصيلياً للمخالفة المشهودة...' : 'Write a detailed description of the observed violation...'}
                    className="w-full bg-[#050b14]/40 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500/50 transition-all text-xs font-medium placeholder:text-slate-600 resize-none" />
                </div>
              </div>
            </div>

            {/* Submit Row */}
            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }} disabled={submitting}
                className="px-6 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <Button type="submit" disabled={submitting}
                className="bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl py-3 px-8 text-xs uppercase tracking-wider italic flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                {submitting
                  ? <Loader2 className="animate-spin" size={16} />
                  : (editingViolation
                    ? (isAr ? 'تحديث البلاغ' : 'Update Report')
                    : (isAr ? 'تسجيل البلاغ' : 'Submit Report'))
                }
              </Button>
            </div>
          </form>
        </div>

        <style jsx global>{`
          .custom-detail-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-detail-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-detail-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
        `}</style>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MAIN DIRECTORY VIEW
  // ────────────────────────────────────────────────────────────────────────────

  const statusTabs = [
    { key: 'ALL', label: 'All', labelAr: 'الكل' },
    { key: 'OPEN', label: 'Open', labelAr: 'جديد' },
    { key: 'INVESTIGATING', label: 'Investigating', labelAr: 'قيد التحقيق' },
    { key: 'RESOLVED', label: 'Resolved', labelAr: 'تم الحل' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-4 border-b border-white/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-rose-500 rounded-full" />
            <span className="text-[10px] font-black tracking-[0.2em] text-rose-400 uppercase italic">
              {isAr ? 'مركز الانتهاكات' : 'Infractions Center'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
            {isAr ? 'سجل المخالفات' : 'Violations Tracker'}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {isAr
              ? `${violations.length} بلاغ مسجل في النظام — آخر تحديث الآن`
              : `${violations.length} reports in system — live data`}
          </p>
        </div>

        <Button
          intent="primary"
          onClick={() => { resetForm(); setShowForm(true); }}
          className="rounded-2xl py-3.5 px-6 flex items-center gap-2.5 shadow-[0_0_24px_rgba(244,63,94,0.25)] bg-rose-500 text-white hover:bg-rose-400 uppercase italic font-black shrink-0"
        >
          <Plus size={18} strokeWidth={3} />
          {isAr ? 'بلاغ جديد' : 'New Report'}
        </Button>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShieldAlert}
          value={stats.total}
          label="Total Reports" labelAr="إجمالي البلاغات"
          color="text-rose-400" bg="bg-rose-500/10"
          isAr={isAr}
        />
        <StatCard
          icon={BadgeAlert}
          value={stats.high}
          label="Critical (HIGH)" labelAr="بلاغات حرجة"
          color="text-rose-500" bg="bg-rose-500/15"
          isAr={isAr}
        />
        <StatCard
          icon={Clock}
          value={stats.investigating}
          label="Under Investigation" labelAr="قيد التحقيق"
          color="text-amber-400" bg="bg-amber-500/10"
          isAr={isAr}
        />
        <StatCard
          icon={Banknote}
          value={`${stats.totalFines.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`}
          label="Total Fines" labelAr="إجمالي الغرامات"
          color="text-emerald-400" bg="bg-emerald-500/10"
          isAr={isAr}
        />
      </div>

      {/* ── Toolbar: Search + Filters ── */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0 group">
          <Search className={`absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-400 transition-colors`} size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث عن مخالفة، مخالف، موقع...' : 'Search violations, violator, location...'}
            className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-rose-500/30 focus:ring-2 focus:ring-rose-500/10 transition-all`}
          />
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-1 shrink-0">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(s => {
            const active = filterSeverity === s;
            const cfg = s !== 'ALL' ? getSeverityConfig(s) : null;
            return (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${
                  active
                    ? s === 'ALL'
                      ? 'bg-white/10 text-white border border-white/20'
                      : `${cfg?.bg} ${cfg?.text} border ${cfg?.border}`
                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {s === 'ALL' ? (isAr ? 'الكل' : 'All') : (isAr ? cfg?.labelAr : cfg?.label)}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 hidden md:block shrink-0" />

        {/* Status tabs */}
        <div className="flex items-center gap-1 shrink-0">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${
                filterStatus === tab.key
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {isAr ? tab.labelAr : tab.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest shrink-0 hidden md:block">
          {filtered.length} {isAr ? 'نتيجة' : 'results'}
        </span>
      </div>

      {/* ── Master-Detail Layout ── */}
      <div className={`grid gap-5 transition-all duration-300 ${selectedViolation ? 'grid-cols-1 lg:grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>

        {/* LEFT: Violations Table */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400" />
              <span className="text-[11px] font-black text-white uppercase tracking-widest">
                {isAr ? 'سجل المخالفات' : 'Violations Log'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {filtered.length} / {violations.length}
            </span>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <ShieldAlert size={28} className="text-rose-400/50" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                {isAr ? 'لا توجد مخالفات' : 'No Violations Found'}
              </p>
              <p className="text-slate-600 text-xs font-medium">
                {isAr ? 'جرب تغيير معايير البحث أو الفلتر' : 'Try adjusting search or filter criteria'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className={`px-4 py-3 ${isAr ? 'text-right' : 'text-left'} text-[10px] font-black text-slate-500 uppercase tracking-widest w-[120px]`}>
                      {isAr ? 'رمز البلاغ' : 'Code'}
                    </th>
                    <th className={`px-4 py-3 ${isAr ? 'text-right' : 'text-left'} text-[10px] font-black text-slate-500 uppercase tracking-widest`}>
                      {isAr ? 'نوع المخالفة' : 'Type'}
                    </th>
                    <th className={`px-4 py-3 ${isAr ? 'text-right' : 'text-left'} text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell`}>
                      {isAr ? 'الموقع' : 'Location'}
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {isAr ? 'الخطورة' : 'Severity'}
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">
                      {isAr ? 'الحالة' : 'Status'}
                    </th>
                    <th className={`px-4 py-3 ${isAr ? 'text-right' : 'text-left'} text-[10px] font-black text-slate-500 uppercase tracking-widest hidden lg:table-cell`}>
                      {isAr ? 'الغرامة' : 'Fine'}
                    </th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((v, idx) => {
                      const sev = getSeverityConfig(v.severity);
                      const sta = getStatusConfig(v.status);
                      const isSelected = selectedViolation?.id === v.id;
                      return (
                        <motion.tr
                          key={v.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => setSelectedViolation(isSelected ? null : v)}
                          className={`border-b border-white/5 cursor-pointer transition-all duration-200 border-l-[3px] ${sev.rowBorder} ${
                            isSelected
                              ? 'bg-rose-500/8 border-white/10'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          {/* Code */}
                          <td className="px-4 py-3.5">
                            <span className="text-[10px] font-black text-slate-400 font-mono tracking-wider">
                              #{v.code || v.id?.slice(0, 8)}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="text-xs font-bold text-white leading-tight line-clamp-1">
                                {isAr ? v.typeAr : v.types}
                              </p>
                              {(v.violatorName || v.vesselName) && (
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                                  {v.violatorName && `👤 ${v.violatorName}`}
                                  {v.violatorName && v.vesselName && ' · '}
                                  {v.vesselName && `🚢 ${v.vesselName}`}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={11} className="text-teal-400 shrink-0" />
                              <span className="text-[11px] font-medium text-slate-400 line-clamp-1">
                                {isAr ? v.locationAr : v.location}
                              </span>
                            </div>
                          </td>

                          {/* Severity */}
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${sev.bg} ${sev.text} border ${sev.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                              {isAr ? sev.labelAr : sev.label}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${sta.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sta.dot}`} />
                              <span className={`text-[10px] font-black uppercase ${sta.color}`}>
                                {isAr ? sta.labelAr : sta.label}
                              </span>
                            </div>
                          </td>

                          {/* Fine */}
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            {v.fineAmount && v.fineAmount > 0 ? (
                              <span className="text-[11px] font-black text-emerald-400">
                                {v.fineAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-600">—</span>
                            )}
                          </td>

                          {/* Arrow */}
                          <td className="px-3 py-3.5">
                            <ChevronRight
                              size={14}
                              className={`transition-all duration-200 ${isSelected ? 'text-rose-400 rotate-90' : 'text-slate-600 group-hover:text-slate-400'}`}
                            />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT: Detail Panel */}
        <AnimatePresence>
          {selectedViolation && (
            <ViolationDetailPanel
              key={selectedViolation.id}
              violation={selectedViolation}
              isAr={isAr}
              onEdit={startEditing}
              onDelete={handleDelete}
              onClose={() => setSelectedViolation(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-detail-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-detail-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-detail-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
      `}</style>
    </div>
  );
}
