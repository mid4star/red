'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  X, 
  Loader2, 
  ShieldAlert, 
  FileText,
  MapPin,
  Scale,
  User
} from 'lucide-react';

export interface Violation {
  id?: string;
  code?: string | null;
  date?: string | Date;
  officerId: string;
  locationLat: number;
  locationLng: number;
  types?: string | null;
  typeAr?: string | null;
  severity: string; // LOW, MEDIUM, HIGH
  status: string; // OPEN, INVESTIGATING, RESOLVED, NEW
  violatorName?: string | null;
  vesselName?: string | null;
  actionTaken?: string | null;
  fineAmount?: number | null;
  location?: string | null;
  locationAr?: string | null;
  description?: string | null;
}

export default function ViolationsPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  
  const [violations, setViolations] = useState<Violation[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form control states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingViolation, setEditingViolation] = useState<Violation | null>(null);

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

  const fetchViolations = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=violations');
      const json = await res.json();
      if (json.success) {
        setViolations(json.data);
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
        // Default officerId to current user if available in session, or first user
        const raw = localStorage.getItem('active_user_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.employeeId) {
            const foundUser = json.data.find((u: any) => u.employeeId === parsed.employeeId || u.id === parsed.employeeId);
            if (foundUser) {
              setOfficerId(foundUser.id);
              return;
            }
          }
        }
        if (json.data.length > 0 && !officerId) {
          setOfficerId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchViolations();
    fetchUsers();
  }, []);

  const resetFormFields = () => {
    setCode('');
    setTypes('');
    setTypeAr('');
    setSeverity('LOW');
    setStatus('OPEN');
    setViolatorName('');
    setVesselName('');
    setActionTaken('');
    setFineAmount('0');
    setLocation('');
    setLocationAr('');
    setLocationLat('27.7128');
    setLocationLng('34.2131');
    setDescription('');
    setEditingViolation(null);
    
    // Default officer ID to first user or active session
    const raw = localStorage.getItem('active_user_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const found = users.find(u => u.employeeId === parsed.employeeId || u.id === parsed.employeeId);
        if (found) {
          setOfficerId(found.id);
          return;
        }
      } catch (e) {}
    }
    if (users.length > 0) {
      setOfficerId(users[0].id);
    }
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
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!types || !location || !officerId) return;

    setSubmitting(true);
    try {
      const violationData = {
        code: code || `VIO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        types,
        typeAr: typeAr || types,
        severity,
        status,
        violatorName: violatorName || null,
        vesselName: vesselName || null,
        actionTaken: actionTaken || null,
        fineAmount: parseFloat(fineAmount) || 0,
        location,
        locationAr: locationAr || location,
        locationLat: parseFloat(locationLat) || 27.7128,
        locationLng: parseFloat(locationLng) || 34.2131,
        description,
        officerId,
      };

      if (editingViolation?.id) {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'violations',
            action: 'UPDATE',
            id: editingViolation.id,
            data: violationData
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to update violation');
        }
      } else {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'violations',
            action: 'ADD',
            data: violationData
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to add violation');
        }
      }

      resetFormFields();
      setShowModal(false);
      fetchViolations();
    } catch (err: any) {
      console.error('Error saving violation:', err);
      alert(isArabic 
        ? `حدث خطأ أثناء حفظ البلاغ: ${err.message || err}`
        : `Error saving violation: ${err.message || err}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (v: Violation) => {
    if (!v.id) return;
    const confirmMsg = isArabic 
      ? `هل أنت متأكد من حذف البلاغ "${v.code}" نهائياً من النظام؟`
      : `Are you sure you want to permanently delete report "${v.code}"?`;
    
    if (confirm(confirmMsg)) {
      setSubmitting(true);
      try {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'violations',
            action: 'DELETE',
            id: v.id
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to delete violation');
        }
        fetchViolations();
      } catch (err: any) {
        console.error('Error deleting violation:', err);
        alert(isArabic 
          ? `حدث خطأ أثناء حذف البلاغ: ${err.message || err}`
          : `Error deleting violation: ${err.message || err}`
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const columns = [
    { title: isArabic ? 'جديد' : 'New', status: 'OPEN', icon: AlertTriangle, color: 'text-rose-400' },
    { title: isArabic ? 'قيد المعالجة' : 'Processing', status: 'INVESTIGATING', icon: Clock, color: 'text-amber-400' },
    { title: isArabic ? 'تم الحل' : 'Resolved', status: 'RESOLVED', icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-[1500px] mx-auto relative" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10 mb-6 shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <div className="w-8 h-1 bg-rose-500 rounded-full" />
             <span className="text-[10px] font-black tracking-[0.2em] text-rose-400 uppercase italic">
                 {isArabic ? 'مركز الانتهاكات' : 'Infractions Center'}
             </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{isArabic ? 'إدارة المخالفات' : 'Violations Tracking'}</h1>
        </div>
        <Button 
          intent="primary" 
          onClick={() => { resetFormFields(); setShowModal(true); }}
          className="rounded-2xl py-3.5 px-6 flex items-center gap-2.5 shadow-[0_0_20px_rgba(244,63,94,0.2)] bg-rose-500 text-white hover:bg-rose-400 uppercase italic font-black"
        >
          <Plus size={18} strokeWidth={3} />
          {isArabic ? 'بلاغ جديد' : 'New Report'}
        </Button>
      </div>

      {/* Main Column Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
        {columns.map(col => {
          const Icon = col.icon;
          // Filter checks status. In SQLite, status can be 'NEW' or 'OPEN'. We match both under 'OPEN'.
          const colViolations = violations.filter(v => {
            if (col.status === 'OPEN') {
              return v.status === 'OPEN' || v.status === 'NEW';
            }
            return v.status === col.status;
          });

          return (
            <div key={col.status} className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-4 flex flex-col border border-white/5 overflow-hidden">
              <h3 className="font-bold mb-4 flex justify-between items-center text-white pb-3 border-b border-white/5 shrink-0">
                <span className="flex items-center gap-2">
                  <Icon size={16} className={col.color} />
                  <span className="tracking-tight uppercase">{col.title}</span>
                </span>
                <Badge className="bg-white/10 text-white border-none">{colViolations.length}</Badge>
              </h3>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
                {colViolations.map(violation => (
                  <Card key={violation.id} className="p-4 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors border-l-4 border-l-rose-500 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black tracking-widest text-slate-500">#{violation.code}</span>
                        <Badge size="sm" color={violation.severity === 'HIGH' ? 'danger' : violation.severity === 'MEDIUM' ? 'warning' : 'primary'} className="text-[9px] font-black px-2">
                          {violation.severity}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm mb-1 text-white">{isArabic ? violation.typeAr : violation.types}</h4>
                      <p className="text-[11px] text-slate-400 mb-3 font-medium line-clamp-2">{violation.description}</p>
                      
                      {/* Violator & Vessel Details */}
                      {(violation.violatorName || violation.vesselName) && (
                        <div className="text-[10px] text-slate-400 mb-2 font-mono flex flex-wrap gap-2 border-t border-white/5 pt-2">
                          {violation.violatorName && (
                            <span>👤 {isArabic ? 'المخالف:' : 'Violator:'} {violation.violatorName}</span>
                          )}
                          {violation.vesselName && (
                            <span>🚢 {isArabic ? 'القارب:' : 'Vessel:'} {violation.vesselName}</span>
                          )}
                        </div>
                      )}

                      {/* Fine Amount */}
                      {violation.fineAmount !== undefined && violation.fineAmount !== null && violation.fineAmount > 0 && (
                        <div className="text-[10px] text-emerald-400 font-extrabold mb-3">
                          💰 {isArabic ? 'الغرامة:' : 'Fine:'} {violation.fineAmount.toLocaleString()} {isArabic ? 'ج.م' : 'EGP'}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2 shrink-0">
                      <span className="text-[10px] font-bold text-teal-400 tracking-tight uppercase flex items-center gap-1">📍 {isArabic ? violation.locationAr : violation.location}</span>
                      <div className="flex gap-1.5">
                        <Button 
                          size="sm" 
                          intent="ghost" 
                          onClick={() => startEditing(violation)}
                          className="text-slate-400 hover:text-white h-7 px-2.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 border-transparent"
                        >
                          {isArabic ? 'تعديل' : 'Edit'}
                        </Button>
                        <Button 
                          size="sm" 
                          intent="ghost" 
                          onClick={() => handleDelete(violation)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 px-2.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 border-transparent"
                        >
                          {isArabic ? 'حذف' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {colViolations.length === 0 && (
                  <div className="py-12 text-center text-slate-500 text-sm italic font-medium uppercase tracking-widest border border-dashed border-white/5 rounded-2xl bg-white/5">
                    {isArabic ? 'لا توجد بلاغات' : 'No Reports Found'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
              <AlertTriangle className="text-rose-500" size={24} />
              {editingViolation 
                ? (isArabic ? 'تعديل تقرير المخالفة' : 'Edit Violation Report')
                : (isArabic ? 'تسجيل مخالفة جديدة' : 'Record New Violation')
              }
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'رقم البلاغ' : 'Report Code'}
                  </label>
                  <Input 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. VIO-2026-110"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'الضابط المسؤول *' : 'Reporting Officer *'}
                  </label>
                  {users.length > 0 ? (
                    <select
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-rose-500 text-sm cursor-pointer"
                      required
                    >
                      <option value="">{isArabic ? 'اختر الضابط...' : 'Select Officer...'}</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {isArabic ? u.nameAr || u.name : u.name} ({u.employeeId})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input 
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      placeholder="e.g. user_admin_01"
                      className="bg-[#050b14] border-white/10 text-white rounded-xl"
                      required
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'نوع الانتهاك (EN) *' : 'Infraction Type (EN) *'}
                  </label>
                  <Input 
                    value={types}
                    onChange={(e) => setTypes(e.target.value)}
                    placeholder="e.g. Illegal Fishing"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'نوع الانتهاك (AR) *' : 'Infraction Type (AR) *'}
                  </label>
                  <Input 
                    value={typeAr}
                    onChange={(e) => setTypeAr(e.target.value)}
                    placeholder="مثال: صيد غير قانوني"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'درجة الخطورة' : 'Severity Level'}
                  </label>
                  <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-rose-500 text-sm cursor-pointer"
                  >
                    <option value="LOW">{isArabic ? 'منخفضة (LOW)' : 'Low'}</option>
                    <option value="MEDIUM">{isArabic ? 'متوسطة (MEDIUM)' : 'Medium'}</option>
                    <option value="HIGH">{isArabic ? 'مرتفعة (HIGH)' : 'High'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'حالة البلاغ' : 'Case Status'}
                  </label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-rose-500 text-sm cursor-pointer"
                  >
                    <option value="OPEN">{isArabic ? 'جديد (OPEN)' : 'New / Open'}</option>
                    <option value="INVESTIGATING">{isArabic ? 'قيد التحقيق (INVESTIGATING)' : 'Investigating'}</option>
                    <option value="RESOLVED">{isArabic ? 'تم الحل (RESOLVED)' : 'Resolved'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'اسم المخالف' : 'Violator Name'}
                  </label>
                  <Input 
                    value={violatorName}
                    onChange={(e) => setViolatorName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'اسم القارب / الوسيلة' : 'Vessel / Vehicle Name'}
                  </label>
                  <Input 
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    placeholder="e.g. Al-Jareh"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'قيمة الغرامة المالية' : 'Fine Amount (EGP)'}
                  </label>
                  <Input 
                    type="number"
                    min="0"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(e.target.value)}
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'الإجراء المتخذ' : 'Action Taken'}
                  </label>
                  <Input 
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="e.g. Issued citation and warning"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'الموقع بالإنجليزية *' : 'Location (EN) *'}
                  </label>
                  <Input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sector 4 - Protected Reef"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'الموقع بالعربية *' : 'Location (AR) *'}
                  </label>
                  <Input 
                    value={locationAr}
                    onChange={(e) => setLocationAr(e.target.value)}
                    placeholder="مثال: القطاع 4 - الشعاب المحمية"
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'خط العرض (Latitude) *' : 'Latitude *'}
                  </label>
                  <Input 
                    type="number"
                    step="0.0001"
                    value={locationLat}
                    onChange={(e) => setLocationLat(e.target.value)}
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'خط الطول (Longitude) *' : 'Longitude *'}
                  </label>
                  <Input 
                    type="number"
                    step="0.0001"
                    value={locationLng}
                    onChange={(e) => setLocationLng(e.target.value)}
                    className="bg-[#050b14] border-white/10 text-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isArabic ? 'تفاصيل ووصف الانتهاك' : 'Description of Violation'}
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder={isArabic ? 'اكتب وصفاً تفصيلياً للمخالفة المشهودة...' : 'Write detailed description...'}
                    className="w-full bg-[#050b14] border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500 text-sm"
                  />
                </div>

              </div>

              {/* Actions buttons */}
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
                  className="bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl py-2.5 px-6"
                >
                  {submitting 
                    ? <Loader2 className="animate-spin" size={16} /> 
                    : (editingViolation ? (isArabic ? 'تحديث البلاغ' : 'Update Report') : (isArabic ? 'تسجيل البلاغ' : 'Submit Report'))
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
