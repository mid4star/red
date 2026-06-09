'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Plus, X, Pencil, Trash2, Save, Upload,
  FileText, Download, Archive, Globe, ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OpenDataDocument } from '@/lib/firebase/schema';

const TYPE_LABELS: Record<string, { en: string; ar: string; color: string }> = {
  ACADEMIC: { en: 'Academic', ar: 'أكاديمي', color: 'bg-indigo-500/10 text-indigo-400' },
  REPORT: { en: 'Report', ar: 'تقرير', color: 'bg-emerald-500/10 text-emerald-400' },
  DATASET: { en: 'Dataset', ar: 'مجموعة بيانات', color: 'bg-blue-500/10 text-blue-400' },
  GUIDELINE: { en: 'Guideline', ar: 'إرشادات', color: 'bg-amber-500/10 text-amber-400' },
};

const FILTERS = [
  { key: 'ALL', en: 'All', ar: 'الكل' },
  { key: 'ACADEMIC', en: 'Academic', ar: 'أكاديمي' },
  { key: 'REPORT', en: 'Reports', ar: 'تقارير' },
  { key: 'DATASET', en: 'Datasets', ar: 'مجموعات بيانات' },
  { key: 'GUIDELINE', en: 'Guidelines', ar: 'إرشادات' },
];

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const emptyDoc = (): Partial<OpenDataDocument> => ({
  title: '', titleAr: '', type: 'ACADEMIC', fileUrl: '', fileSize: 0, status: 'PUBLIC', uploaderId: 'admin',
});

export default function OpenDataCMSPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const [docs, setDocs] = useState<OpenDataDocument[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<OpenDataDocument>>(emptyDoc());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=opendata');
      if (res.ok) {
        const json = await res.json();
        setDocs(json.data || []);
      }
    } catch (err) { console.error('Error fetching opendata:', err); }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const filtered = filter === 'ALL' ? docs : docs.filter(d => d.type === filter);

  const openNew = () => { setForm(emptyDoc()); setEditingId(null); setShowEditor(true); };
  const openEdit = (d: OpenDataDocument) => { setForm({ ...d }); setEditingId(d.id!); setShowEditor(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, uploadDate: new Date().toISOString() };
      if (editingId) {
        const { id, ...rest } = payload as any;
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'opendata',
            action: 'UPDATE',
            id: editingId,
            data: rest
          })
        });
        if (!response.ok) throw new Error('Failed to update document');
      } else {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'opendata',
            action: 'ADD',
            data: payload
          })
        });
        if (!response.ok) throw new Error('Failed to add document');
      }
      setShowEditor(false);
      fetchDocs();
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
            collectionName: 'opendata',
            action: 'DELETE',
            id
          })
        });
        if (!response.ok) throw new Error('Failed to delete document');
        setShowEditor(false);
        fetchDocs();
      } catch (e) { console.error(e); }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setForm(prev => ({ ...prev, fileUrl: data.url, fileSize: data.size }));
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return '—';
    return ts.toDate().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={showEditor ? "max-w-[1200px] mx-auto space-y-6 pb-12" : "max-w-[1400px] mx-auto space-y-8"} dir={isAr ? 'rtl' : 'ltr'}>
      {showEditor ? (
        /* ── INLINE EDITOR VIEW ── */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <button 
              onClick={() => setShowEditor(false)}
              type="button"
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shrink-0"
            >
              <ArrowRight size={20} className={isAr ? '' : 'rotate-180'} />
            </button>
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase italic">
                {isAr ? 'بوابة البيانات' : 'Data Portal'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Database className="text-indigo-500" size={20} />
                {editingId ? (isAr ? 'تعديل المستند' : 'Edit Document') : (isAr ? 'مستند جديد' : 'New Document')}
              </h2>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto pt-4 space-y-6">
            {/* Title EN */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Title (English)</label>
              <input type="text" value={form.title || ''} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-500/30 transition-all"
                placeholder="Document title..." />
            </div>
            {/* Title AR */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">العنوان (عربي)</label>
              <input type="text" dir="rtl" value={form.titleAr || ''} onChange={(e) => setForm(p => ({ ...p, titleAr: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-500/30 transition-all"
                placeholder="عنوان المستند..." />
            </div>

            {/* Type + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'النوع' : 'Type'}</label>
                <select value={form.type || 'ACADEMIC'} onChange={(e) => setForm(p => ({ ...p, type: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white outline-none appearance-none">
                  <option value="ACADEMIC" className="bg-slate-800">Academic / أكاديمي</option>
                  <option value="REPORT" className="bg-slate-800">Report / تقرير</option>
                  <option value="DATASET" className="bg-slate-800">Dataset / بيانات</option>
                  <option value="GUIDELINE" className="bg-slate-800">Guideline / إرشادات</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'الحالة' : 'Status'}</label>
                <select value={form.status || 'PUBLIC'} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white outline-none appearance-none">
                  <option value="PUBLIC" className="bg-slate-800">{isAr ? 'عام' : 'Public'}</option>
                  <option value="ARCHIVED" className="bg-slate-800">{isAr ? 'مؤرشف' : 'Archived'}</option>
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'الملف' : 'File'}</label>
              <div className="flex items-center gap-4">
                {form.fileUrl && (
                  <span className="text-[11px] text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-lg truncate max-w-[200px]">
                    {form.fileUrl.split('/').pop()} ({formatSize(form.fileSize || 0)})
                  </span>
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-all text-[12px] font-bold">
                  <Upload size={16} />
                  {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع ملف' : 'Upload File')}
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
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
          </div>
        </div>
      ) : (
        /* ── MAIN DIRECTORY VIEW ── */
        <>
          {/* ── Header ───────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-indigo-500 rounded-full" />
                <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase italic">
                  {isAr ? 'بوابة البيانات' : 'Data Portal'}
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                {isAr ? 'البيانات المفتوحة' : 'Open Data'}
              </h1>
            </div>
            <Button intent="primary" onClick={openNew}
              className="rounded-2xl py-3.5 px-6 flex items-center gap-2.5 shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-indigo-500 text-white hover:bg-indigo-400 uppercase italic font-black">
              <Plus size={18} strokeWidth={3} />
              {isAr ? 'رفع مستند' : 'Upload Document'}
            </Button>
          </div>

          {/* ── Filter ───────────────────────────────────────── */}
          <div className="bg-slate-900/40 backdrop-blur-xl p-2 rounded-2xl border border-white/5 flex flex-wrap items-center gap-1">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                  filter === f.key ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}>
                {isAr ? f.ar : f.en}
              </button>
            ))}
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mr-auto ml-4">
              {filtered.length} {isAr ? 'مستند' : 'documents'}
            </span>
          </div>

          {/* ── Documents Table ───────────────────────────────── */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="py-20 text-center text-slate-500 text-sm italic">
                {isAr ? 'لا توجد مستندات. ارفع مستنداً للبدء.' : 'No documents found.'}
              </div>
            )}
            <AnimatePresence>
              {filtered.map((doc, i) => {
                const typeInfo = TYPE_LABELS[doc.type] || TYPE_LABELS.REPORT;
                return (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}>
                    <Card className="flex items-center gap-5 p-5 bg-slate-900/40 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all group">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <FileText size={24} className="text-indigo-400" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white tracking-tight truncate text-sm">
                          {isAr ? (doc.titleAr || doc.title) : (doc.title || doc.titleAr)}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${typeInfo.color}`}>
                            {isAr ? typeInfo.ar : typeInfo.en}
                          </span>
                          <span className="text-[10px] text-slate-500">{formatSize(doc.fileSize || 0)}</span>
                          <span className="text-[10px] text-slate-500">{formatDate(doc.uploadDate)}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <Badge color={doc.status === 'PUBLIC' ? 'success' : 'warning'} className="text-[9px] font-black px-2.5 py-1 shrink-0">
                        {doc.status === 'PUBLIC' ? (isAr ? 'عام' : 'Public') : (isAr ? 'مؤرشف' : 'Archived')}
                      </Badge>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                            <Download size={15} />
                          </a>
                        )}
                        <button onClick={() => openEdit(doc)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-teal-400 hover:bg-white/10 transition-all">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(doc.id!)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
