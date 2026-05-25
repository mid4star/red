'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, X, Pencil, Trash2, Save, Image as ImageIcon,
  TreePine, Waves, Globe
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReserveProfile } from '@/lib/firebase/schema';
import RichTextEditor from '@/components/ui/RichTextEditor';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-500/10 text-emerald-400',
  CLOSED: 'bg-rose-500/10 text-rose-400',
  RESTRICTED: 'bg-amber-500/10 text-amber-400',
};

const emptyReserve = (): Partial<ReserveProfile> => ({
  name: '', nameAr: '', description: '', descriptionAr: '',
  location: '', locationAr: '', area: 0, establishedYear: 2020,
  imageUrl: '', status: 'OPEN',
});

export default function ReservesCMSPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const [reserves, setReserves] = useState<ReserveProfile[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ReserveProfile>>(emptyReserve());
  const [langTab, setLangTab] = useState<'ar' | 'en'>('ar');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchReserves = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=reserves');
      if (res.ok) {
        const json = await res.json();
        setReserves(json.data || []);
      }
    } catch (err) { console.error('Error fetching reserves:', err); }
  };

  useEffect(() => {
    fetchReserves();
  }, []);

  const openNew = () => { setForm(emptyReserve()); setEditingId(null); setShowEditor(true); };
  const openEdit = (r: ReserveProfile) => { setForm({ ...r }); setEditingId(r.id!); setShowEditor(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId) {
        const { id, ...rest } = payload as any;
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'reserves',
            action: 'UPDATE',
            id: editingId,
            data: rest
          })
        });
        if (!response.ok) throw new Error('Failed to update reserve');
      } else {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'reserves',
            action: 'ADD',
            data: payload
          })
        });
        if (!response.ok) throw new Error('Failed to add reserve');
      }
      setShowEditor(false);
      fetchReserves();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من الحذف؟' : 'Confirm delete?')) {
      try {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'reserves',
            action: 'DELETE',
            id
          })
        });
        if (!response.ok) throw new Error('Failed to delete reserve');
        setShowEditor(false);
        fetchReserves();
      } catch (e) { console.error(e); }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setForm(prev => ({ ...prev, imageUrl: data.url }));
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase italic">
              {isAr ? 'بيانات المحميات' : 'Reserve Profiles'}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            {isAr ? 'إدارة المحميات' : 'Reserves Manager'}
          </h1>
        </div>
        <Button intent="primary" onClick={openNew}
          className="rounded-2xl py-3.5 px-6 flex items-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-emerald-500 text-[#001529] hover:bg-emerald-400 uppercase italic font-black">
          <Plus size={18} strokeWidth={3} />
          {isAr ? 'إضافة محمية' : 'Add Reserve'}
        </Button>
      </div>

      {/* ── Reserves Grid ─────────────────────────────────────── */}
      {reserves.length === 0 && (
        <div className="py-20 text-center text-slate-500 text-sm italic">
          {isAr ? 'لا توجد محميات. أضف محمية للبدء.' : 'No reserves found. Add a reserve to get started.'}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {reserves.map((reserve, i) => (
            <motion.div key={reserve.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="group overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-xl hover:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-500">
                {/* Cover Image */}
                <div className="relative h-48 bg-[#0a1628] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
                  {reserve.imageUrl ? (
                    <img src={reserve.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <TreePine size={60} className="text-emerald-500/10" />
                    </div>
                  )}
                  <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-20`}>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${STATUS_COLORS[reserve.status]}`}>
                      {reserve.status === 'OPEN' ? (isAr ? 'مفتوحة' : 'Open') : reserve.status === 'CLOSED' ? (isAr ? 'مغلقة' : 'Closed') : (isAr ? 'مقيدة' : 'Restricted')}
                    </span>
                  </div>
                  <div className={`absolute bottom-4 ${isAr ? 'right-4' : 'left-4'} z-20`}>
                    <h3 className="text-white font-bold text-lg tracking-tight">{isAr ? reserve.nameAr : reserve.name}</h3>
                    <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {isAr ? reserve.locationAr : reserve.location}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{isAr ? 'المساحة' : 'Area'}</p>
                      <p className="text-sm font-bold text-white">{reserve.area} km²</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{isAr ? 'التأسيس' : 'Est.'}</p>
                      <p className="text-sm font-bold text-white">{reserve.establishedYear}</p>
                    </div>
                  </div>
                  <Button intent="outline" onClick={() => openEdit(reserve)}
                    className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <Pencil size={14} /> {isAr ? 'تعديل' : 'Edit'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Editor Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-start justify-center pt-8 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && setShowEditor(false)}>
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-3xl bg-[#0d1b2a] rounded-3xl border border-white/10 shadow-2xl mb-10">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">
                  {editingId ? (isAr ? 'تعديل المحمية' : 'Edit Reserve') : (isAr ? 'محمية جديدة' : 'New Reserve')}
                </h2>
                <button onClick={() => setShowEditor(false)} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-6">
                {/* Lang Tabs */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl w-fit">
                  <button onClick={() => setLangTab('ar')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'ar' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400'}`}>العربية</button>
                  <button onClick={() => setLangTab('en')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'en' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400'}`}>English</button>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{langTab === 'ar' ? 'اسم المحمية (عربي)' : 'Reserve Name (English)'}</label>
                  <input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                    value={langTab === 'ar' ? (form.nameAr || '') : (form.name || '')}
                    onChange={(e) => setForm(p => ({ ...p, [langTab === 'ar' ? 'nameAr' : 'name']: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-500/30 transition-all"
                    placeholder={langTab === 'ar' ? 'مثال: محمية رأس محمد' : 'e.g. Ras Mohammed Reserve'} />
                </div>

                {/* Location */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{langTab === 'ar' ? 'الموقع (عربي)' : 'Location (English)'}</label>
                  <input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                    value={langTab === 'ar' ? (form.locationAr || '') : (form.location || '')}
                    onChange={(e) => setForm(p => ({ ...p, [langTab === 'ar' ? 'locationAr' : 'location']: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-500/30 transition-all" />
                </div>

                {/* Area + Year + Status */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'المساحة (كم²)' : 'Area (km²)'}</label>
                    <input type="number" value={form.area || 0} onChange={(e) => setForm(p => ({ ...p, area: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white outline-none focus:border-teal-500/30 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'سنة التأسيس' : 'Est. Year'}</label>
                    <input type="number" value={form.establishedYear || 2020} onChange={(e) => setForm(p => ({ ...p, establishedYear: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white outline-none focus:border-teal-500/30 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'الحالة' : 'Status'}</label>
                    <select value={form.status || 'OPEN'} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as any }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white outline-none appearance-none">
                      <option value="OPEN" className="bg-slate-800">{isAr ? 'مفتوحة' : 'Open'}</option>
                      <option value="CLOSED" className="bg-slate-800">{isAr ? 'مغلقة' : 'Closed'}</option>
                      <option value="RESTRICTED" className="bg-slate-800">{isAr ? 'مقيدة' : 'Restricted'}</option>
                    </select>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'صورة الغلاف' : 'Cover Image'}</label>
                  <div className="flex items-center gap-4">
                    {form.imageUrl && <img src={form.imageUrl} alt="" className="w-20 h-14 object-cover rounded-xl border border-white/10" />}
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-all text-[12px] font-bold">
                      <ImageIcon size={16} />
                      {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع صورة' : 'Upload')}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                    {langTab === 'ar' ? 'الوصف (عربي)' : 'Description (English)'}
                  </label>
                  <RichTextEditor
                    value={langTab === 'ar' ? (form.descriptionAr || '') : (form.description || '')}
                    onChange={(val) => setForm(p => ({ ...p, [langTab === 'ar' ? 'descriptionAr' : 'description']: val }))}
                    placeholder={langTab === 'ar' ? 'اكتب وصف المحمية...' : 'Write reserve description...'}
                    dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-white/5">
                {editingId && (
                  <button onClick={() => handleDelete(editingId)} className="px-4 py-2.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-[12px] font-bold flex items-center gap-2">
                    <Trash2 size={14} /> {isAr ? 'حذف' : 'Delete'}
                  </button>
                )}
                <div className={`flex gap-3 ${!editingId ? 'ml-auto' : ''}`}>
                  <Button intent="outline" onClick={() => setShowEditor(false)} className="border-white/10 bg-white/5 text-slate-300">{isAr ? 'إلغاء' : 'Cancel'}</Button>
                  <Button intent="primary" onClick={handleSave} className="bg-teal-500 text-[#001529] hover:bg-teal-400 font-black flex items-center gap-2 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                    <Save size={16} /> {saving ? (isAr ? 'حفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
