'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home, Save, Plus, X, Trash2, Eye, ToggleLeft, ToggleRight,
  Link as LinkIcon, Megaphone, Type
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { HomepageSettings } from '@/lib/firebase/schema';

const DOC_ID = 'home-config';

const defaultSettings: HomepageSettings = {
  heroTitle: 'Red Sea Marine Authority',
  heroTitleAr: 'هيئة محميات البحر الأحمر',
  heroSubtitle: 'Preserving the Red Sea ecosystem for future generations',
  heroSubtitleAr: 'حماية النظام البيئي للبحر الأحمر للأجيال القادمة',
  announcements: [],
};

export default function HomepageCMSPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const docRef = doc(db, 'homepage_settings', DOC_ID);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSettings(snap.data() as HomepageSettings);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'homepage_settings', DOC_ID);
      await setDoc(docRef, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addAnnouncement = () => {
    setSettings(prev => ({
      ...prev,
      announcements: [...prev.announcements, {
        id: `ann-${Date.now()}`,
        text: '',
        textAr: '',
        link: '',
        active: true,
      }],
    }));
  };

  const updateAnnouncement = (id: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      announcements: prev.announcements.map(a => a.id === id ? { ...a, [field]: value } : a),
    }));
  };

  const removeAnnouncement = (id: string) => {
    setSettings(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-500 rounded-full" />
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase italic">
              {isAr ? 'تخصيص الواجهة' : 'Interface Customization'}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            {isAr ? 'الصفحة الرئيسية' : 'Homepage Settings'}
          </h1>
        </div>
        <Button intent="primary" onClick={handleSave}
          className={`rounded-2xl py-3.5 px-8 flex items-center gap-2.5 uppercase italic font-black transition-all ${
            saved ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:bg-blue-400'
          } text-white`}>
          <Save size={18} />
          {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : saved ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
        </Button>
      </div>

      {/* ── Hero Section Settings ─────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 bg-slate-900/40 backdrop-blur-xl border-white/5 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Type size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">{isAr ? 'قسم البطل (Hero)' : 'Hero Section'}</h2>
              <p className="text-[11px] text-slate-500">{isAr ? 'النص الرئيسي في أعلى الصفحة' : 'Main text at the top of the page'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Hero */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-[9px] font-black text-white">EN</span>
                English
              </p>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Hero Title</label>
                <input type="text" value={settings.heroTitle}
                  onChange={(e) => setSettings(p => ({ ...p, heroTitle: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500/30 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Hero Subtitle</label>
                <textarea rows={2} value={settings.heroSubtitle}
                  onChange={(e) => setSettings(p => ({ ...p, heroSubtitle: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500/30 transition-all resize-none" />
              </div>
            </div>
            {/* Arabic Hero */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-[9px] font-black text-white">AR</span>
                العربية
              </p>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">العنوان الرئيسي</label>
                <input type="text" dir="rtl" value={settings.heroTitleAr}
                  onChange={(e) => setSettings(p => ({ ...p, heroTitleAr: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500/30 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">العنوان الفرعي</label>
                <textarea rows={2} dir="rtl" value={settings.heroSubtitleAr}
                  onChange={(e) => setSettings(p => ({ ...p, heroSubtitleAr: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500/30 transition-all resize-none" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Live Preview ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-0 overflow-hidden bg-slate-900/40 backdrop-blur-xl border-white/5">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <Eye size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isAr ? 'معاينة مباشرة' : 'Live Preview'}</span>
          </div>
          <div className="relative h-48 bg-gradient-to-br from-[#001529] via-[#0a1628] to-[#001529] flex items-center justify-center text-center px-8 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                {isAr ? settings.heroTitleAr : settings.heroTitle}
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                {isAr ? settings.heroSubtitleAr : settings.heroSubtitle}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Announcements ─────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6 bg-slate-900/40 backdrop-blur-xl border-white/5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Megaphone size={20} className="text-amber-400" />
              </div>
              <div>
                <h2 className="font-bold text-white">{isAr ? 'الإعلانات والشريط العلوي' : 'Announcements Banner'}</h2>
                <p className="text-[11px] text-slate-500">{isAr ? 'إعلانات تظهر في أعلى الصفحة' : 'Top banners displayed to visitors'}</p>
              </div>
            </div>
            <button onClick={addAnnouncement}
              className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all text-[12px] font-bold flex items-center gap-2">
              <Plus size={14} /> {isAr ? 'إضافة' : 'Add'}
            </button>
          </div>

          {settings.announcements.length === 0 && (
            <p className="text-center text-slate-500 text-sm italic py-8">
              {isAr ? 'لا توجد إعلانات. أضف إعلاناً جديداً.' : 'No announcements. Add one to display on the homepage.'}
            </p>
          )}

          <div className="space-y-4">
            {settings.announcements.map((ann, i) => (
              <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {isAr ? `إعلان ${i + 1}` : `Announcement ${i + 1}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateAnnouncement(ann.id, 'active', !ann.active)}
                      className={`transition-all ${ann.active ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {ann.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <button onClick={() => removeAnnouncement(ann.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" value={ann.text} placeholder="Announcement text (EN)"
                    onChange={(e) => updateAnnouncement(ann.id, 'text', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-blue-500/30 transition-all" />
                  <input type="text" dir="rtl" value={ann.textAr} placeholder="نص الإعلان (عربي)"
                    onChange={(e) => updateAnnouncement(ann.id, 'textAr', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-blue-500/30 transition-all" />
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon size={14} className="text-slate-500 shrink-0" />
                  <input type="text" value={ann.link || ''} placeholder={isAr ? 'رابط (اختياري)' : 'Link URL (optional)'}
                    onChange={(e) => updateAnnouncement(ann.id, 'link', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-blue-500/30 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  );
}
