'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, Plus, X, Calendar, Tag, Eye, Pencil, Trash2,
  Image as ImageIcon, Save, FileText, Globe, ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NewsArticle } from '@/lib/firebase/schema';
import RichTextEditor from '@/components/ui/RichTextEditor';

const CATEGORIES = [
  { key: 'ALL', label: 'All', labelAr: 'الكل' },
  { key: 'NEWS', label: 'News', labelAr: 'أخبار' },
  { key: 'EVENT', label: 'Events', labelAr: 'فعاليات' },
  { key: 'REPORT', label: 'Reports', labelAr: 'تقارير' },
  { key: 'REGULATION', label: 'Regulations', labelAr: 'لوائح' },
];

const CATEGORY_COLORS: Record<string, string> = {
  NEWS: 'bg-blue-500/10 text-blue-400',
  EVENT: 'bg-amber-500/10 text-amber-400',
  REPORT: 'bg-emerald-500/10 text-emerald-400',
  REGULATION: 'bg-rose-500/10 text-rose-400',
};

const emptyArticle = (): Partial<NewsArticle> => ({
  title: '', titleAr: '', content: '', contentAr: '',
  category: 'NEWS', imageUrl: '', status: 'DRAFT',
  authorName: 'Admin', authorId: 'admin',
});

export default function NewsCMSPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<NewsArticle>>(emptyArticle());
  const [langTab, setLangTab] = useState<'ar' | 'en'>('ar');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=news');
      if (res.ok) {
        const json = await res.json();
        setArticles(json.data || []);
      }
    } catch (err) { console.error('Error fetching news:', err); }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filtered = filter === 'ALL' ? articles : articles.filter(a => a.category === filter);

  const openNew = () => { setForm(emptyArticle()); setEditingId(null); setShowEditor(true); };
  const openEdit = (a: NewsArticle) => { setForm({ ...a }); setEditingId(a.id!); setShowEditor(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, date: new Date().toISOString() };
      if (editingId) {
        const { id, ...rest } = payload as any;
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'news',
            action: 'UPDATE',
            id: editingId,
            data: rest
          })
        });
        if (!response.ok) throw new Error('Failed to update news');
      } else {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'news',
            action: 'ADD',
            data: payload
          })
        });
        if (!response.ok) throw new Error('Failed to add news');
      }
      setShowEditor(false);
      fetchArticles();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      try {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'news',
            action: 'DELETE',
            id
          })
        });
        if (!response.ok) throw new Error('Failed to delete news');
        setShowEditor(false);
        fetchArticles();
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

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
              <span className="text-[10px] font-black tracking-[0.2em] text-amber-400 uppercase italic">
                {isAr ? 'نظام النشر' : 'Publishing System'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Newspaper className="text-amber-500" size={20} />
                {editingId ? (isAr ? 'تعديل المقال' : 'Edit Article') : (isAr ? 'مقال جديد' : 'New Article')}
              </h2>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto pt-4 space-y-6">
            {/* Language Tabs */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl w-fit">
              <button onClick={() => setLangTab('ar')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'ar' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}>
                العربية
              </button>
              <button onClick={() => setLangTab('en')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'en' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-white'}`}>
                English
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                {langTab === 'ar' ? 'العنوان (عربي)' : 'Title (English)'}
              </label>
              <input
                type="text"
                value={langTab === 'ar' ? (form.titleAr || '') : (form.title || '')}
                onChange={(e) => setForm(prev => ({ ...prev, [langTab === 'ar' ? 'titleAr' : 'title']: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-500/30 focus:ring-2 focus:ring-teal-500/10 transition-all"
                dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                placeholder={langTab === 'ar' ? 'أدخل العنوان...' : 'Enter title...'}
              />
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  {isAr ? 'التصنيف' : 'Category'}
                </label>
                <select
                  value={form.category || 'NEWS'}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white outline-none focus:border-teal-500/30 transition-all appearance-none"
                >
                  <option value="NEWS" className="bg-slate-800">News / أخبار</option>
                  <option value="EVENT" className="bg-slate-800">Event / فعالية</option>
                  <option value="REPORT" className="bg-slate-800">Report / تقرير</option>
                  <option value="REGULATION" className="bg-slate-800">Regulation / لائحة</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  {isAr ? 'الحالة' : 'Status'}
                </label>
                <select
                  value={form.status || 'DRAFT'}
                  onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white outline-none focus:border-teal-500/30 transition-all appearance-none"
                >
                  <option value="DRAFT" className="bg-slate-800">{isAr ? 'مسودة' : 'Draft'}</option>
                  <option value="PUBLISHED" className="bg-slate-800">{isAr ? 'منشور' : 'Published'}</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                {isAr ? 'صورة الغلاف' : 'Cover Image'}
              </label>
              <div className="flex items-center gap-4">
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="" className="w-20 h-14 object-cover rounded-xl border border-white/10" />
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all text-[12px] font-bold">
                  <ImageIcon size={16} />
                  {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع صورة' : 'Upload Image')}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Rich Text Content */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                {langTab === 'ar' ? 'المحتوى (عربي)' : 'Content (English)'}
              </label>
              <RichTextEditor
                value={langTab === 'ar' ? (form.contentAr || '') : (form.content || '')}
                onChange={(val) => setForm(prev => ({ ...prev, [langTab === 'ar' ? 'contentAr' : 'content']: val }))}
                placeholder={langTab === 'ar' ? 'اكتب المحتوى هنا...' : 'Write content here...'}
                dir={langTab === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              {editingId && (
                <button onClick={() => handleDelete(editingId)} className="px-4 py-2.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all text-[12px] font-bold flex items-center gap-2">
                  <Trash2 size={14} /> {isAr ? 'حذف' : 'Delete'}
                </button>
              )}
              <div className={`flex gap-3 ${!editingId ? 'ml-auto' : ''}`}>
                <Button intent="outline" onClick={() => setShowEditor(false)} className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  intent="primary"
                  onClick={handleSave}
                  className="bg-teal-500 text-[#001529] hover:bg-teal-400 font-black flex items-center gap-2 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                >
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
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-amber-500 rounded-full" />
                <span className="text-[10px] font-black tracking-[0.2em] text-amber-400 uppercase italic">
                  {isAr ? 'نظام النشر' : 'Publishing System'}
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                {isAr ? 'الأخبار والفعاليات' : 'News & Events'}
              </h1>
            </div>
            <Button
              intent="primary"
              onClick={openNew}
              className="rounded-2xl py-3.5 px-6 flex items-center gap-2.5 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-amber-500 text-[#001529] hover:bg-amber-400 uppercase italic font-black"
            >
              <Plus size={18} strokeWidth={3} />
              {isAr ? 'مقال جديد' : 'New Article'}
            </Button>
          </div>

          {/* ── Category Filter ─────────────────────────────────────────── */}
          <div className="bg-slate-900/40 backdrop-blur-xl p-2 rounded-2xl border border-white/5 flex flex-wrap gap-1">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                  filter === c.key
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {isAr ? c.labelAr : c.label}
              </button>
            ))}
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mr-auto ml-4">
              {filtered.length} {isAr ? 'عنصر' : 'items'}
            </span>
          </div>

          {/* ── Articles List ────────────────────────────────────────────── */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="py-20 text-center text-slate-500 text-sm italic">
                {isAr ? 'لا توجد مقالات. أضف مقالاً جديداً للبدء.' : 'No articles found. Add a new article to get started.'}
              </div>
            )}
            <AnimatePresence>
              {filtered.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="flex items-center gap-5 p-5 bg-slate-900/40 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all group">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                      {article.imageUrl ? (
                        <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={24} className="text-slate-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white tracking-tight truncate text-sm">
                        {isAr ? (article.titleAr || article.title) : (article.title || article.titleAr)}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${CATEGORY_COLORS[article.category]}`}>
                          {article.category}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar size={11} /> {formatDate(article.date)}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <Badge
                      color={article.status === 'PUBLISHED' ? 'success' : 'warning'}
                      className="text-[9px] font-black px-2.5 py-1 shrink-0"
                    >
                      {article.status === 'PUBLISHED' ? (isAr ? 'منشور' : 'Published') : (isAr ? 'مسودة' : 'Draft')}
                    </Badge>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEdit(article)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-teal-400 hover:bg-white/10 transition-all">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(article.id!)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                        <Trash2 size={15} />
                      </button>
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
