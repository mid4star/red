'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, X, Pencil, Trash2, Save, Image as ImageIcon,
  TreePine, Waves, Globe, ArrowRight
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
  imageUrl: '', status: 'OPEN', coords: '', speciesCount: 0,
  healthIndex: 0, statusAr: '', activities: '', activitiesAr: '',
  rules: '', rulesAr: '', ticketPrice: '', ticketPriceAr: '',
  famousSpecies: '', famousSpeciesAr: '',
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

  const getGallerySlides = (): { src: string; caption: string; captionAr: string }[] => {
    if (!form.gallery) return [];
    try {
      return JSON.parse(form.gallery) || [];
    } catch (e) {
      return [];
    }
  };

  const setGallerySlides = (slides: { src: string; caption: string; captionAr: string }[]) => {
    setForm(prev => ({ ...prev, gallery: JSON.stringify(slides) }));
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', files[0]);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        const currentSlides = getGallerySlides();
        const updated = [...currentSlides, { src: data.url, caption: '', captionAr: '' }];
        setGallerySlides(updated);
      }
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  };

  const handleRemoveGallerySlide = (indexToRemove: number) => {
    const currentSlides = getGallerySlides();
    const updated = currentSlides.filter((_, idx) => idx !== indexToRemove);
    setGallerySlides(updated);
  };

  const handleGalleryCaptionChange = (index: number, langKey: 'caption' | 'captionAr', value: string) => {
    const currentSlides = getGallerySlides();
    const updated = currentSlides.map((slide, idx) => {
      if (idx === index) {
        return { ...slide, [langKey]: value };
      }
      return slide;
    });
    setGallerySlides(updated);
  };

  return (
    <div className={showEditor ? "max-w-[1200px] mx-auto space-y-6 pb-12" : "max-w-[1400px] mx-auto space-y-8"} dir={isAr ? 'rtl' : 'ltr'}>
      {showEditor ? (
        /* ── INLINE EDITOR VIEW ── */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 pb-4 border-b border-th-border">
            <button 
              onClick={() => setShowEditor(false)}
              type="button"
              className="p-2.5 rounded-2xl bg-th-surface border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface2 transition-all flex items-center justify-center shrink-0"
            >
              <ArrowRight size={20} className={isAr ? '' : 'rotate-180'} />
            </button>
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase italic">
                {isAr ? 'إدارة المحميات' : 'Reserves Manager'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-th-text tracking-tight flex items-center gap-2">
                <TreePine className="text-emerald-500" size={20} />
                {editingId ? (isAr ? 'تعديل المحمية' : 'Edit Reserve') : (isAr ? 'محمية جديدة' : 'New Reserve')}
              </h2>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto pt-4 space-y-6">
            {/* Lang Tabs */}
            <div className="flex gap-2 bg-th-surface p-1 rounded-xl w-fit">
              <button onClick={() => setLangTab('ar')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'ar' ? 'bg-teal-500/20 text-teal-400' : 'text-th-muted hover:text-th-text'}`}>العربية</button>
              <button onClick={() => setLangTab('en')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'en' ? 'bg-teal-500/20 text-teal-400' : 'text-th-muted hover:text-th-text'}`}>English</button>
            </div>

            {/* Name */}
            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{langTab === 'ar' ? 'اسم المحمية (عربي)' : 'Reserve Name (English)'}</label>
              <input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                value={langTab === 'ar' ? (form.nameAr || '') : (form.name || '')}
                onChange={(e) => setForm(p => ({ ...p, [langTab === 'ar' ? 'nameAr' : 'name']: e.target.value }))}
                className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text placeholder:text-th-muted outline-none focus:border-teal-500/30 transition-all"
                placeholder={langTab === 'ar' ? 'مثال: محمية رأس محمد' : 'e.g. Ras Mohammed Reserve'} />
            </div>

            {/* Location */}
            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{langTab === 'ar' ? 'الموقع (عربي)' : 'Location (English)'}</label>
              <input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                value={langTab === 'ar' ? (form.locationAr || '') : (form.location || '')}
                onChange={(e) => setForm(p => ({ ...p, [langTab === 'ar' ? 'locationAr' : 'location']: e.target.value }))}
                className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text placeholder:text-th-muted outline-none focus:border-teal-500/30 transition-all" />
            </div>

            {/* Area + Year + Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'المساحة (كم²)' : 'Area (km²)'}</label>
                <input type="number" value={form.area || 0} onChange={(e) => setForm(p => ({ ...p, area: Number(e.target.value) }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'سنة التأسيس' : 'Est. Year'}</label>
                <input type="number" value={form.establishedYear || 2020} onChange={(e) => setForm(p => ({ ...p, establishedYear: Number(e.target.value) }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'الحالة' : 'Status'}</label>
                <select value={form.status || 'OPEN'} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as any }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none appearance-none">
                  <option value="OPEN" className="bg-th-surface2">{isAr ? 'مفتوحة' : 'Open'}</option>
                  <option value="CLOSED" className="bg-th-surface2">{isAr ? 'مغلقة' : 'Closed'}</option>
                  <option value="RESTRICTED" className="bg-th-surface2">{isAr ? 'مقيدة' : 'Restricted'}</option>
                </select>
              </div>
            </div>

            {/* Coordinates + Arabic Status Label */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'الإحداثيات الجغرافية' : 'Coordinates'}</label>
                <input type="text" value={form.coords || ''} onChange={(e) => setForm(p => ({ ...p, coords: e.target.value }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all"
                  placeholder="e.g. 27.2288° N, 33.8541° E" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'حالة الحماية (عربي)' : 'Arabic Status Title'}</label>
                <input type="text" value={form.statusAr || ''} onChange={(e) => setForm(p => ({ ...p, statusAr: e.target.value }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all"
                  placeholder="مثال: محمية ذات أولوية قصوى" />
              </div>
            </div>

            {/* Species Count + Health Index */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'عدد الأنواع المحمية' : 'Species Count'}</label>
                <input type="number" value={form.speciesCount || 0} onChange={(e) => setForm(p => ({ ...p, speciesCount: Number(e.target.value) }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'مؤشر الصحة البيئية' : 'Health Index'}</label>
                <input type="number" step="0.1" value={form.healthIndex || 0} onChange={(e) => setForm(p => ({ ...p, healthIndex: Number(e.target.value) }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all" />
              </div>
            </div>

            {/* Activities + Famous Species */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {langTab === 'ar' ? 'الأنشطة المتاحة (عربي)' : 'Activities (English)'}
                </label>
                <input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  value={langTab === 'ar' ? (form.activitiesAr || '') : (form.activities || '')}
                  onChange={(e) => setForm(p => ({ ...p, [langTab === 'ar' ? 'activitiesAr' : 'activities']: e.target.value }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all"
                  placeholder={langTab === 'ar' ? 'مثال: غوص، رصد الطيور' : 'e.g. Scuba diving, Bird watching'} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {langTab === 'ar' ? 'أشهر الكائنات (عربي)' : 'Famous Species (English)'}
                </label>
                <input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  value={langTab === 'ar' ? (form.famousSpeciesAr || '') : (form.famousSpecies || '')}
                  onChange={(e) => setForm(p => ({ ...p, [langTab === 'ar' ? 'famousSpeciesAr' : 'famousSpecies']: e.target.value }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all"
                  placeholder={langTab === 'ar' ? 'مثال: الأطوم، السلاحف الخضراء' : 'e.g. Dugong, Green Turtles'} />
              </div>
            </div>

            {/* Rules + Ticket Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {langTab === 'ar' ? 'أهم القوانين (عربي)' : 'Rules (English)'}
                </label>
                <input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  value={langTab === 'ar' ? (form.rulesAr || '') : (form.rules || '')}
                  onChange={(e) => setForm(p => ({ ...p, [langTab === 'ar' ? 'rulesAr' : 'rules']: e.target.value }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all"
                  placeholder={langTab === 'ar' ? 'مثال: يمنع الرسو على المرجان' : 'e.g. No anchoring on reefs'} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {langTab === 'ar' ? 'أسعار التذاكر (عربي)' : 'Ticket Prices (English)'}
                </label>
                <input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  value={langTab === 'ar' ? (form.ticketPriceAr || '') : (form.ticketPrice || '')}
                  onChange={(e) => setForm(p => ({ ...p, [langTab === 'ar' ? 'ticketPriceAr' : 'ticketPrice']: e.target.value }))}
                  className="w-full bg-th-surface border border-th-border rounded-xl py-3.5 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all"
                  placeholder={langTab === 'ar' ? 'مثال: 50 ج.م للمصريين' : 'e.g. 50 EGP for Egyptians'} />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'صورة الغلاف' : 'Cover Image'}</label>
              <div className="flex items-center gap-4">
                {form.imageUrl && <img src={form.imageUrl} alt="" className="w-20 h-14 object-cover rounded-xl border border-th-border" />}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-th-surface border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface2 cursor-pointer transition-all text-[12px] font-bold">
                  <ImageIcon size={16} />
                  {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع صورة' : 'Upload')}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                {langTab === 'ar' ? 'الوصف (عربي)' : 'Description (English)'}
              </label>
              <RichTextEditor
                value={langTab === 'ar' ? (form.descriptionAr || '') : (form.description || '')}
                onChange={(val) => setForm(p => ({ ...p, [langTab === 'ar' ? 'descriptionAr' : 'description']: val }))}
                placeholder={langTab === 'ar' ? 'اكتب وصف المحمية...' : 'Write reserve description...'}
                dir={langTab === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Photo Gallery Manager */}
            <div className="pt-4 border-t border-th-border">
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-4 block">
                {isAr ? 'معرض الصور للمحمية' : 'Reserve Photo Gallery'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {getGallerySlides().map((slide, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-th-surface border border-th-border space-y-3 relative group/slide">
                    <button
                      type="button"
                      onClick={() => handleRemoveGallerySlide(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover/slide:opacity-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                    <img src={slide.src} alt="" className="w-full h-32 object-cover rounded-xl border border-th-border" />
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={slide.captionAr || ''}
                        onChange={(e) => handleGalleryCaptionChange(idx, 'captionAr', e.target.value)}
                        placeholder={isAr ? 'تسمية توضيحية بالعربية' : 'Arabic Caption'}
                        className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none focus:border-teal-500/30"
                      />
                      <input
                        type="text"
                        value={slide.caption || ''}
                        onChange={(e) => handleGalleryCaptionChange(idx, 'caption', e.target.value)}
                        placeholder={isAr ? 'تسمية توضيحية بالإنجليزية' : 'English Caption'}
                        className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none focus:border-teal-500/30"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-th-surface border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface2 cursor-pointer transition-all text-[12px] font-bold w-fit">
                <Plus size={16} />
                {isAr ? 'إضافة صورة للمعرض' : 'Add Gallery Image'}
                <input type="file" accept="image/*" onChange={handleGalleryImageUpload} className="hidden" />
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-th-border">
              {editingId && (
                <button onClick={() => handleDelete(editingId)} className="px-4 py-2.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all text-[12px] font-bold flex items-center gap-2">
                  <Trash2 size={14} /> {isAr ? 'حذف' : 'Delete'}
                </button>
              )}
              <div className={`flex gap-3 ${!editingId ? 'ml-auto' : ''}`}>
                <Button intent="outline" onClick={() => setShowEditor(false)} className="border-th-border bg-th-surface text-th-muted hover:bg-th-surface2">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button intent="primary" onClick={handleSave} className="bg-teal-500 text-[#001529] hover:bg-teal-400 font-black flex items-center gap-2 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                  <Save size={16} />
                  {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── MAIN DIRECTORY VIEW ── */
        <>
          {/* ── Header ───────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase italic">
                  {isAr ? 'بيانات المحميات' : 'Reserve Profiles'}
                </span>
              </div>
              <h1 className="text-4xl font-black text-th-text tracking-tighter uppercase italic">
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
            <div className="py-20 text-center text-th-muted text-sm italic">
              {isAr ? 'لا توجد محميات. أضف محمية للبدء.' : 'No reserves found. Add a reserve to get started.'}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {reserves.map((reserve, i) => (
                <motion.div key={reserve.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="group overflow-hidden border border-th-border bg-th-surface2 backdrop-blur-xl hover:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-500">
                    {/* Cover Image */}
                    <div className="relative h-48 bg-th-surface2 overflow-hidden">
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
                        <h3 className="text-th-text font-bold text-lg tracking-tight">{isAr ? reserve.nameAr : reserve.name}</h3>
                        <p className="text-[11px] text-th-muted flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {isAr ? reserve.locationAr : reserve.location}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-th-surface border border-th-border">
                          <p className="text-[9px] font-bold text-th-muted uppercase">{isAr ? 'المساحة' : 'Area'}</p>
                          <p className="text-sm font-bold text-th-text">{reserve.area} km²</p>
                        </div>
                        <div className="p-3 rounded-xl bg-th-surface border border-th-border">
                          <p className="text-[9px] font-bold text-th-muted uppercase">{isAr ? 'التأسيس' : 'Est.'}</p>
                          <p className="text-sm font-bold text-th-text">{reserve.establishedYear}</p>
                        </div>
                      </div>
                      <Button intent="outline" onClick={() => openEdit(reserve)}
                        className="w-full border-th-border bg-th-surface text-th-text hover:bg-th-surface2 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <Pencil size={14} /> {isAr ? 'تعديل' : 'Edit'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
