'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, Trash2, Eye, ToggleLeft, ToggleRight,
  Link as LinkIcon, Megaphone, Type, Globe, Microscope, 
  Shield, Zap, CheckCircle2, Image, List, Settings
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HomepageSettings } from '@/lib/firebase/schema';

const DOC_ID = 'home-config';

const defaultSettings: HomepageSettings = {
  heroTitle: 'Protect. Explore. Marvel.',
  heroTitleAr: 'احمِ.. استكشف.. انبهر',
  heroSubtitle: 'Discover the majesty of the world’s most enchanting marine ecosystem, where turquoise horizons meet untamed biodiversity.',
  heroSubtitleAr: 'اكتشف روعة أحد أكثر النظم البيئية البحرية سحراً في الكوكب، حيث تلتقي المياه الفيروزية بالطبيعة الخلابة.',
  heroAuthority: 'Red Sea Marine Authority',
  heroAuthorityAr: 'جهاز محميات البحر الأحمر',
  heroBgUrl: '/red_sea_aerial_hd.png',
  heroBtn1Text: 'Begin Exploration',
  heroBtn1TextAr: 'ابدأ الاستكشاف',
  heroBtn1Link: '/guide',
  heroBtn2Text: 'Interactive Map',
  heroBtn2TextAr: 'خريطة المحميات',
  heroBtn2Link: '/reserves',
  
  stats: [
    { value: '35,000', label: 'km² Protected Area', labelAr: 'كيلومتر مربع من المحميات', icon: 'Globe' },
    { value: '1,200+', label: 'Protected Species', labelAr: 'من الأنواع المحمية', icon: 'Microscope' },
    { value: '40', label: 'Marine Reservoirs', labelAr: 'محمية بحرية وبرية', icon: 'Shield' },
    { value: '2.5M', label: 'Annual Visitors', labelAr: 'زائر سنوي للمحميات', icon: 'Eye' },
  ],
  
  missionTag: 'Protecting the Vision',
  missionTagAr: 'حماية الرؤية المستقبلية',
  missionTitle: 'Commitment to the Blue Heritage',
  missionTitleAr: 'مهمتنا هي صون التراث الطبيعي',
  missionDesc: 'Implementing standard ecosystem preservation practices through community engagement and regular field surveys, ensuring resource sustainability.',
  missionDescAr: 'نعمل على تطبيق أعلى المعايير الدولية في إدارة المحميات من خلال إشراك المجتمع المحلي والمسوحات الميدانية المستمرة لضمان استدامة الموارد.',
  missionChecklist: [
    { text: 'Environmental Patrols', textAr: 'دوريات بيئية' },
    { text: 'Biodiversity Protection', textAr: 'صون التنوع' },
    { text: 'Environmental Awareness', textAr: 'وعي بيئي' },
    { text: 'Smart Management', textAr: 'إدارة ذكية' }
  ],
  missionImgUrl: '/sea_turtle_close_up_1774790619989.png',
  missionCardTag: 'Current Status',
  missionCardTagAr: 'الوضع الحالي',
  missionCardTitle: 'Peak Ecological Health Index',
  missionCardTitleAr: 'أعلى مستويات الصحة البيئية',

  highlightsTag: 'Explore the Arcana',
  highlightsTagAr: 'اكتشف روائع الطبيعة',
  highlightsTitle: 'Reserve Highlights',
  highlightsTitleAr: 'عجائب المحميات',
  highlightsLinkText: 'Explore All Reserves',
  highlightsLinkTextAr: 'تصفح جميع المحميات',
  highlightsLinkUrl: '/reserves',
  highlights: [
    {
      id: 'reserve_northern_islands',
      title: 'Northern Islands Protectorate',
      titleAr: 'محمية الجزر الشمالية',
      desc: 'A pristine archipelago serving as a critical sanctuary for marine turtles and migratory birds.',
      descAr: 'أرخبيل بكر يعد ملاذاً حرجاً للسلاحف البحرية والطيور المهاجرة.',
      img: '/red_sea_hero_aerial_1774790601114.png',
      tag: 'PREMIUM DESTINATION',
      tagAr: 'وجهة استثنائية'
    },
    {
      id: 'reserve_wadi_el_gemal',
      title: 'Wadi El Gemal National Park',
      titleAr: 'محمية وادي الجمال',
      desc: 'A vast expanse of coastal lagoons and desert peaks, home to the ancient emerald mines.',
      descAr: 'مساحات شاسعة من المناطق الساحلية والجبلية، موطن لمناجم الزمرد القديمة.',
      img: '/wadi_el_gemal_mangroves_aerial_1774861445577.png',
      tag: 'ECOLOGICAL HERITAGE',
      tagAr: 'تراث بيئي'
    },
    {
      id: 'reserve_gebel_elba',
      title: 'Gebel Elba Biosphere',
      titleAr: 'محمية جبل علبة',
      desc: 'An unparalleled mist oasis in the desert with unique biodiversity and lush green peaks.',
      descAr: 'واحة ضبابية فريدة في الصحراء تتميز بتنوع بيولوجي فريد وقمم جبلية خضراء.',
      img: '/red_sea_sunset_mountains_1774790636632.png',
      tag: 'BIODIVERSITY HUB',
      tagAr: 'مركز التنوع البيولوجي'
    },
    {
      id: 'reserve_coral_reef',
      title: 'Coral Reef Protectorate',
      titleAr: 'محمية الحيد المرجاني',
      desc: 'Vibrant and resilient coral reef systems offering world-class diving experiences.',
      descAr: 'أنظمة شعاب مرجانية نابضة بالحياة ومرنة تقدم تجارب غوص بمستوى عالمي.',
      img: '/brother_islands_reef_wall_1774861464852.png',
      tag: 'MARINE SANCTUARY',
      tagAr: 'ملاذ بحري'
    }
  ],

  ctaBgUrl: '/red_sea_sunset_mountains_1774790636632.png',
  ctaTitle: 'Elevate Your Marine Perspective',
  ctaTitleAr: 'ابدأ رحلتك نحو الرقي البيئي',
  ctaSubtitle: 'Join the guardianship. Experience the world’s most precious marine territories.',
  ctaSubtitleAr: 'انضم إلينا في حماية وتجربة أغلى الكنوز البحرية على وجه الأرض.',
  ctaBtn1Text: 'Book a Visit',
  ctaBtn1TextAr: 'احجز زيارة الآن',
  ctaBtn1Link: '/reserves',
  ctaBtn2Text: 'Support Conservation',
  ctaBtn2TextAr: 'دعم جهود الصون',
  ctaBtn2Link: '/guide',

  announcements: [],
};

const AVAILABLE_ICONS = [
  'Globe', 'Microscope', 'Shield', 'Eye', 'MapPin', 'Zap', 
  'Droplets', 'Waves', 'Navigation', 'CheckCircle2', 'Calendar'
];

export default function HomepageCMSPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'mission' | 'highlights' | 'cta' | 'announcements'>('hero');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/staff/query?collection=homepage&t=${Date.now()}`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const record = json.data[0];
          setSettings({
            heroTitle: record.heroTitle || defaultSettings.heroTitle,
            heroTitleAr: record.heroTitleAr || defaultSettings.heroTitleAr,
            heroSubtitle: record.heroSubtitle || defaultSettings.heroSubtitle,
            heroSubtitleAr: record.heroSubtitleAr || defaultSettings.heroSubtitleAr,
            heroAuthority: record.heroAuthority || defaultSettings.heroAuthority,
            heroAuthorityAr: record.heroAuthorityAr || defaultSettings.heroAuthorityAr,
            heroBgUrl: record.heroBgUrl || defaultSettings.heroBgUrl,
            heroBtn1Text: record.heroBtn1Text || defaultSettings.heroBtn1Text,
            heroBtn1TextAr: record.heroBtn1TextAr || defaultSettings.heroBtn1TextAr,
            heroBtn1Link: record.heroBtn1Link || defaultSettings.heroBtn1Link,
            heroBtn2Text: record.heroBtn2Text || defaultSettings.heroBtn2Text,
            heroBtn2TextAr: record.heroBtn2TextAr || defaultSettings.heroBtn2TextAr,
            heroBtn2Link: record.heroBtn2Link || defaultSettings.heroBtn2Link,
            
            stats: record.stats && record.stats.length > 0 ? record.stats : defaultSettings.stats,
            
            missionTag: record.missionTag || defaultSettings.missionTag,
            missionTagAr: record.missionTagAr || defaultSettings.missionTagAr,
            missionTitle: record.missionTitle || defaultSettings.missionTitle,
            missionTitleAr: record.missionTitleAr || defaultSettings.missionTitleAr,
            missionDesc: record.missionDesc || defaultSettings.missionDesc,
            missionDescAr: record.missionDescAr || defaultSettings.missionDescAr,
            missionChecklist: record.missionChecklist && record.missionChecklist.length > 0 ? record.missionChecklist : defaultSettings.missionChecklist,
            missionImgUrl: record.missionImgUrl || defaultSettings.missionImgUrl,
            missionCardTag: record.missionCardTag || defaultSettings.missionCardTag,
            missionCardTagAr: record.missionCardTagAr || defaultSettings.missionCardTagAr,
            missionCardTitle: record.missionCardTitle || defaultSettings.missionCardTitle,
            missionCardTitleAr: record.missionCardTitleAr || defaultSettings.missionCardTitleAr,

            highlightsTag: record.highlightsTag || defaultSettings.highlightsTag,
            highlightsTagAr: record.highlightsTagAr || defaultSettings.highlightsTagAr,
            highlightsTitle: record.highlightsTitle || defaultSettings.highlightsTitle,
            highlightsTitleAr: record.highlightsTitleAr || defaultSettings.highlightsTitleAr,
            highlightsLinkText: record.highlightsLinkText || defaultSettings.highlightsLinkText,
            highlightsLinkTextAr: record.highlightsLinkTextAr || defaultSettings.highlightsLinkTextAr,
            highlightsLinkUrl: record.highlightsLinkUrl || defaultSettings.highlightsLinkUrl,
            highlights: record.highlights && record.highlights.length > 0 ? record.highlights : defaultSettings.highlights,

            ctaBgUrl: record.ctaBgUrl || defaultSettings.ctaBgUrl,
            ctaTitle: record.ctaTitle || defaultSettings.ctaTitle,
            ctaTitleAr: record.ctaTitleAr || defaultSettings.ctaTitleAr,
            ctaSubtitle: record.ctaSubtitle || defaultSettings.ctaSubtitle,
            ctaSubtitleAr: record.ctaSubtitleAr || defaultSettings.ctaSubtitleAr,
            ctaBtn1Text: record.ctaBtn1Text || defaultSettings.ctaBtn1Text,
            ctaBtn1TextAr: record.ctaBtn1TextAr || defaultSettings.ctaBtn1TextAr,
            ctaBtn1Link: record.ctaBtn1Link || defaultSettings.ctaBtn1Link,
            ctaBtn2Text: record.ctaBtn2Text || defaultSettings.ctaBtn2Text,
            ctaBtn2TextAr: record.ctaBtn2TextAr || defaultSettings.ctaBtn2TextAr,
            ctaBtn2Link: record.ctaBtn2Link || defaultSettings.ctaBtn2Link,

            announcements: record.announcements || [],
          });
          setSettingsId(record.id);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/staff/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: 'homepage',
          action: settingsId ? 'UPDATE' : 'ADD',
          id: settingsId || DOC_ID,
          data: settings
        })
      });
      if (!response.ok) throw new Error('Failed to save settings');
      const json = await response.json();
      if (json.success) {
        setSettingsId(json.id);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const updateStat = (index: number, field: string, value: string) => {
    setSettings(prev => {
      const list = prev.stats ? [...prev.stats] : [];
      if (list[index]) {
        list[index] = { ...list[index], [field]: value };
      }
      return { ...prev, stats: list };
    });
  };

  const updateMissionChecklist = (index: number, field: string, value: string) => {
    setSettings(prev => {
      const list = prev.missionChecklist ? [...prev.missionChecklist] : [];
      if (list[index]) {
        list[index] = { ...list[index], [field]: value };
      }
      return { ...prev, missionChecklist: list };
    });
  };

  const updateHighlight = (index: number, field: string, value: string) => {
    setSettings(prev => {
      const list = prev.highlights ? [...prev.highlights] : [];
      if (list[index]) {
        list[index] = { ...list[index], [field]: value };
      }
      return { ...prev, highlights: list };
    });
  };

  // Announcements helpers
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

  const TABS = [
    { id: 'hero', name: 'القسم الرئيسي (Hero)', nameEn: 'Hero Section', icon: Type },
    { id: 'stats', name: 'الإحصائيات (Stats)', nameEn: 'Stats Row', icon: Globe },
    { id: 'mission', name: 'المهمة الاستراتيجية', nameEn: 'Strategic Mission', icon: Shield },
    { id: 'highlights', name: 'عجائب المحميات', nameEn: 'Spotlights', icon: Eye },
    { id: 'cta', name: 'دعوة العمل (CTA)', nameEn: 'Call to Action', icon: Megaphone },
    { id: 'announcements', name: 'شريط الإعلانات', nameEn: 'Announcements', icon: Megaphone },
  ] as const;

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
          <h1 className="text-4xl font-black text-th-text tracking-tighter uppercase italic">
            {isAr ? 'تخصيص الصفحة الرئيسية' : 'Homepage Customization'}
          </h1>
        </div>
        <Button intent="primary" onClick={handleSave}
          className={`rounded-2xl py-3.5 px-8 flex items-center gap-2.5 uppercase italic font-black transition-all ${
            saved ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:bg-blue-400'
          } text-th-text`}>
          <Save size={18} />
          {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : saved ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
        </Button>
      </div>

      {/* ── Tabs Navigation ───────────────────────────────── */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-th-border no-scrollbar scroll-smooth">
        {TABS.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                isActive
                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                  : 'text-th-muted border-transparent hover:text-th-text hover:bg-th-surface'
              }`}
            >
              <TabIcon size={16} />
              {isAr ? tab.name : tab.nameEn}
            </button>
          );
        })}
      </div>

      {/* ── Editing Panels ────────────────────────────────── */}
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'hero' && (
            <motion.div key="hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="p-6 bg-th-surface2 backdrop-blur-xl border-th-border space-y-6">
                <div className="pb-4 border-b border-th-border">
                  <h2 className="text-lg font-bold text-th-text">{isAr ? 'قسم البطل (Hero Section)' : 'Hero Section'}</h2>
                  <p className="text-xs text-th-muted">{isAr ? 'التحكم بنصوص وخلفية وأزرار بداية الصفحة' : 'Customize top page texts, buttons, and visual background'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Section */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">English Content</p>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">Authority Title</label>
                      <input type="text" value={settings.heroAuthority}
                        onChange={(e) => setSettings(p => ({ ...p, heroAuthority: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">Hero Title</label>
                      <input type="text" value={settings.heroTitle}
                        onChange={(e) => setSettings(p => ({ ...p, heroTitle: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">Hero Subtitle</label>
                      <textarea rows={3} value={settings.heroSubtitle}
                        onChange={(e) => setSettings(p => ({ ...p, heroSubtitle: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all resize-none" />
                    </div>
                  </div>

                  {/* Arabic Section */}
                  <div className="space-y-4" dir="rtl">
                    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">المحتوى العربي</p>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">الجهة الراعية</label>
                      <input type="text" value={settings.heroAuthorityAr}
                        onChange={(e) => setSettings(p => ({ ...p, heroAuthorityAr: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">العنوان الرئيسي</label>
                      <input type="text" value={settings.heroTitleAr}
                        onChange={(e) => setSettings(p => ({ ...p, heroTitleAr: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">العنوان الفرعي</label>
                      <textarea rows={3} value={settings.heroSubtitleAr}
                        onChange={(e) => setSettings(p => ({ ...p, heroSubtitleAr: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all resize-none" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-th-border pt-6 space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">{isAr ? 'رابط الصورة الخلفية' : 'Hero Background Image URL'}</label>
                    <input type="text" value={settings.heroBgUrl}
                      onChange={(e) => setSettings(p => ({ ...p, heroBgUrl: e.target.value }))}
                      className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none focus:border-teal-500/30 transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Button 1 */}
                    <div className="p-4 rounded-xl bg-th-surface border border-th-border space-y-4">
                      <h3 className="text-xs font-bold text-teal-400">{isAr ? 'الزر الرئيسي (الأول)' : 'Primary Action Button (1)'}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">Text (EN)</label>
                          <input type="text" value={settings.heroBtn1Text}
                            onChange={(e) => setSettings(p => ({ ...p, heroBtn1Text: e.target.value }))}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">النص (عربي)</label>
                          <input type="text" value={settings.heroBtn1TextAr}
                            onChange={(e) => setSettings(p => ({ ...p, heroBtn1TextAr: e.target.value }))}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">Link Path / URL</label>
                        <input type="text" value={settings.heroBtn1Link}
                          onChange={(e) => setSettings(p => ({ ...p, heroBtn1Link: e.target.value }))}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                      </div>
                    </div>

                    {/* Button 2 */}
                    <div className="p-4 rounded-xl bg-th-surface border border-th-border space-y-4">
                      <h3 className="text-xs font-bold text-teal-400">{isAr ? 'الزر الثانوي (الثاني)' : 'Secondary Action Button (2)'}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">Text (EN)</label>
                          <input type="text" value={settings.heroBtn2Text}
                            onChange={(e) => setSettings(p => ({ ...p, heroBtn2Text: e.target.value }))}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">النص (عربي)</label>
                          <input type="text" value={settings.heroBtn2TextAr}
                            onChange={(e) => setSettings(p => ({ ...p, heroBtn2TextAr: e.target.value }))}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">Link Path / URL</label>
                        <input type="text" value={settings.heroBtn2Link}
                          onChange={(e) => setSettings(p => ({ ...p, heroBtn2Link: e.target.value }))}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="p-6 bg-th-surface2 backdrop-blur-xl border-th-border space-y-6">
                <div className="pb-4 border-b border-th-border">
                  <h2 className="text-lg font-bold text-th-text">{isAr ? 'الإحصائيات (Statistics Grid)' : 'Impact Statistics'}</h2>
                  <p className="text-xs text-th-muted">{isAr ? 'تحرير البطاقات الأربع للمؤشرات والإنجازات' : 'Configure the four counters displayed below the hero'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {settings.stats?.map((stat, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-th-surface border border-th-border space-y-4">
                      <div className="flex items-center justify-between border-b border-th-border pb-2">
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                          {isAr ? `البطاقة ${idx + 1}` : `Stat Counter ${idx + 1}`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1.5 block">Stat Value</label>
                          <input type="text" value={stat.value}
                            onChange={(e) => updateStat(idx, 'value', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1.5 block">Icon Class</label>
                          <select value={stat.icon}
                            onChange={(e) => updateStat(idx, 'icon', e.target.value)}
                            className="w-full bg-th-input border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none">
                            {AVAILABLE_ICONS.map(ic => (
                              <option key={ic} value={ic}>{ic}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1.5 block">Label (EN)</label>
                          <input type="text" value={stat.label}
                            onChange={(e) => updateStat(idx, 'label', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1.5 block">التسمية (عربي)</label>
                          <input type="text" value={stat.labelAr}
                            onChange={(e) => updateStat(idx, 'labelAr', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'mission' && (
            <motion.div key="mission" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="p-6 bg-th-surface2 backdrop-blur-xl border-th-border space-y-6">
                <div className="pb-4 border-b border-th-border">
                  <h2 className="text-lg font-bold text-th-text">{isAr ? 'المهمة الاستراتيجية (Strategic Mission)' : 'Strategic Mission Section'}</h2>
                  <p className="text-xs text-th-muted">{isAr ? 'تخصيص نصوص المهمة والقائمة والبطاقة العائمة والصورة' : 'Customize mission statements, checklist, floats, and side image'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* EN inputs */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">English Content</p>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">Section Tag</label>
                      <input type="text" value={settings.missionTag}
                        onChange={(e) => setSettings(p => ({ ...p, missionTag: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">Section Title</label>
                      <input type="text" value={settings.missionTitle}
                        onChange={(e) => setSettings(p => ({ ...p, missionTitle: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">Section Description</label>
                      <textarea rows={4} value={settings.missionDesc}
                        onChange={(e) => setSettings(p => ({ ...p, missionDesc: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none resize-none" />
                    </div>
                  </div>

                  {/* AR inputs */}
                  <div className="space-y-4" dir="rtl">
                    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">المحتوى العربي</p>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">الوسم العلوي</label>
                      <input type="text" value={settings.missionTagAr}
                        onChange={(e) => setSettings(p => ({ ...p, missionTagAr: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">العنوان الرئيسي</label>
                      <input type="text" value={settings.missionTitleAr}
                        onChange={(e) => setSettings(p => ({ ...p, missionTitleAr: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">وصف القسم</label>
                      <textarea rows={4} value={settings.missionDescAr}
                        onChange={(e) => setSettings(p => ({ ...p, missionDescAr: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none resize-none" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-th-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Checklist */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-teal-400">{isAr ? 'قائمة عناصر التحقق (Checklist)' : 'Checklist Items (4 Items)'}</h3>
                    {settings.missionChecklist?.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="text" value={item.text} placeholder="Text (EN)"
                          onChange={(e) => updateMissionChecklist(idx, 'text', e.target.value)}
                          className="flex-1 bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        <input type="text" dir="rtl" value={item.textAr} placeholder="النص (عربي)"
                          onChange={(e) => updateMissionChecklist(idx, 'textAr', e.target.value)}
                          className="flex-1 bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                      </div>
                    ))}
                  </div>

                  {/* Image & Float Card */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-teal-400">{isAr ? 'الصورة والبطاقة الجانبية' : 'Image & Float Card Settings'}</h3>
                    <div>
                      <label className="text-[9px] font-bold text-th-muted mb-1 block">Side Image URL</label>
                      <input type="text" value={settings.missionImgUrl}
                        onChange={(e) => setSettings(p => ({ ...p, missionImgUrl: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-th-border pt-3">
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">Card Tag (EN)</label>
                        <input type="text" value={settings.missionCardTag}
                          onChange={(e) => setSettings(p => ({ ...p, missionCardTag: e.target.value }))}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">وسم البطاقة (عربي)</label>
                        <input type="text" value={settings.missionCardTagAr}
                          onChange={(e) => setSettings(p => ({ ...p, missionCardTagAr: e.target.value }))}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">Card Title (EN)</label>
                        <input type="text" value={settings.missionCardTitle}
                          onChange={(e) => setSettings(p => ({ ...p, missionCardTitle: e.target.value }))}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">عنوان البطاقة (عربي)</label>
                        <input type="text" value={settings.missionCardTitleAr}
                          onChange={(e) => setSettings(p => ({ ...p, missionCardTitleAr: e.target.value }))}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'highlights' && (
            <motion.div key="highlights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="p-6 bg-th-surface2 backdrop-blur-xl border-th-border space-y-6">
                <div className="pb-4 border-b border-th-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-th-text">{isAr ? 'عجائب المحميات المميزة (Highlights)' : 'Highlight Destinations'}</h2>
                    <p className="text-xs text-th-muted">{isAr ? 'تحرير البطاقات الأربع للمحميات المميزة المعروضة' : 'Configure the four card highlights shown on the homepage'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-th-border pb-6">
                  <div>
                    <label className="text-[10px] font-bold text-th-muted uppercase block mb-1.5">Section Title</label>
                    <input type="text" value={settings.highlightsTitle}
                      onChange={(e) => setSettings(p => ({ ...p, highlightsTitle: e.target.value }))}
                      className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-th-muted uppercase block mb-1.5">العنوان الرئيسي</label>
                    <input type="text" dir="rtl" value={settings.highlightsTitleAr}
                      onChange={(e) => setSettings(p => ({ ...p, highlightsTitleAr: e.target.value }))}
                      className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none text-right" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-th-muted uppercase block mb-1.5">Section Tag</label>
                    <input type="text" value={settings.highlightsTag}
                      onChange={(e) => setSettings(p => ({ ...p, highlightsTag: e.target.value }))}
                      className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-th-muted uppercase block mb-1.5">الوسم الفرعي</label>
                    <input type="text" dir="rtl" value={settings.highlightsTagAr}
                      onChange={(e) => setSettings(p => ({ ...p, highlightsTagAr: e.target.value }))}
                      className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none text-right" />
                  </div>
                </div>

                {/* Grid for Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {settings.highlights?.map((hl, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-th-surface border border-th-border space-y-4">
                      <h3 className="text-xs font-bold text-teal-400 border-b border-th-border pb-2">
                        {isAr ? `البطاقة المميزة ${idx + 1}` : `Spotlight Card ${idx + 1}`}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">Reserve ID (Link)</label>
                          <input type="text" value={hl.id}
                            onChange={(e) => updateHighlight(idx, 'id', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">Image URL</label>
                          <input type="text" value={hl.img}
                            onChange={(e) => updateHighlight(idx, 'img', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">Tag (EN)</label>
                          <input type="text" value={hl.tag}
                            onChange={(e) => updateHighlight(idx, 'tag', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">الوسم (عربي)</label>
                          <input type="text" value={hl.tagAr}
                            onChange={(e) => updateHighlight(idx, 'tagAr', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">Title (EN)</label>
                          <input type="text" value={hl.title}
                            onChange={(e) => updateHighlight(idx, 'title', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">العنوان (عربي)</label>
                          <input type="text" value={hl.titleAr}
                            onChange={(e) => updateHighlight(idx, 'titleAr', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">Description (EN)</label>
                        <textarea rows={2} value={hl.desc}
                          onChange={(e) => updateHighlight(idx, 'desc', e.target.value)}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none resize-none" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">الوصف (عربي)</label>
                        <textarea rows={2} dir="rtl" value={hl.descAr}
                          onChange={(e) => updateHighlight(idx, 'descAr', e.target.value)}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none resize-none text-right" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'cta' && (
            <motion.div key="cta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="p-6 bg-th-surface2 backdrop-blur-xl border-th-border space-y-6">
                <div className="pb-4 border-b border-th-border">
                  <h2 className="text-lg font-bold text-th-text">{isAr ? 'دعوة العمل (Call to Action - CTA)' : 'Call to Action Section'}</h2>
                  <p className="text-xs text-th-muted">{isAr ? 'تحرير العنوان والخلفية والأزرار للقسم الختامي' : 'Configure backgrounds and action paths for the bottom section'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* EN inputs */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">English Content</p>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">CTA Title</label>
                      <input type="text" value={settings.ctaTitle}
                        onChange={(e) => setSettings(p => ({ ...p, ctaTitle: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">CTA Subtitle</label>
                      <textarea rows={3} value={settings.ctaSubtitle}
                        onChange={(e) => setSettings(p => ({ ...p, ctaSubtitle: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none resize-none" />
                    </div>
                  </div>

                  {/* AR inputs */}
                  <div className="space-y-4" dir="rtl">
                    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">المحتوى العربي</p>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">العنوان الرئيسي</label>
                      <input type="text" value={settings.ctaTitleAr}
                        onChange={(e) => setSettings(p => ({ ...p, ctaTitleAr: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">الوصف الفرعي</label>
                      <textarea rows={3} value={settings.ctaSubtitleAr}
                        onChange={(e) => setSettings(p => ({ ...p, ctaSubtitleAr: e.target.value }))}
                        className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none resize-none" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-th-border pt-6 space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">Background Image URL</label>
                    <input type="text" value={settings.ctaBgUrl}
                      onChange={(e) => setSettings(p => ({ ...p, ctaBgUrl: e.target.value }))}
                      className="w-full bg-th-surface border border-th-border rounded-xl py-3 px-4 text-sm text-th-text outline-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CTA Button 1 */}
                    <div className="p-4 rounded-xl bg-th-surface border border-th-border space-y-4">
                      <h3 className="text-xs font-bold text-teal-400">{isAr ? 'الزر الأول لـ CTA' : 'Action Button 1'}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">Text (EN)</label>
                          <input type="text" value={settings.ctaBtn1Text}
                            onChange={(e) => setSettings(p => ({ ...p, ctaBtn1Text: e.target.value }))}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">النص (عربي)</label>
                          <input type="text" value={settings.ctaBtn1TextAr}
                            onChange={(e) => setSettings(p => ({ ...p, ctaBtn1TextAr: e.target.value }))}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">Link Path / URL</label>
                        <input type="text" value={settings.ctaBtn1Link}
                          onChange={(e) => setSettings(p => ({ ...p, ctaBtn1Link: e.target.value }))}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                      </div>
                    </div>

                    {/* CTA Button 2 */}
                    <div className="p-4 rounded-xl bg-th-surface border border-th-border space-y-4">
                      <h3 className="text-xs font-bold text-teal-400">{isAr ? 'الزر الثاني لـ CTA' : 'Action Button 2'}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">Text (EN)</label>
                          <input type="text" value={settings.ctaBtn2Text}
                            onChange={(e) => setSettings(p => ({ ...p, ctaBtn2Text: e.target.value }))}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">النص (عربي)</label>
                          <input type="text" value={settings.ctaBtn2TextAr}
                            onChange={(e) => setSettings(p => ({ ...p, ctaBtn2TextAr: e.target.value }))}
                            className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none text-right" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">Link Path / URL</label>
                        <input type="text" value={settings.ctaBtn2Link}
                          onChange={(e) => setSettings(p => ({ ...p, ctaBtn2Link: e.target.value }))}
                          className="w-full bg-th-surface border border-th-border rounded-lg py-2 px-3 text-xs text-th-text outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'announcements' && (
            <motion.div key="announcements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="p-6 bg-th-surface2 backdrop-blur-xl border-th-border space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-th-border">
                  <div>
                    <h2 className="text-lg font-bold text-th-text">{isAr ? 'الإعلانات والشريط العلوي' : 'Announcements Banner'}</h2>
                    <p className="text-xs text-th-muted">{isAr ? 'إعلانات تظهر في شريط أعلى الصفحة الرئيسية للموقع' : 'Top banners displayed to all site visitors'}</p>
                  </div>
                  <button onClick={addAnnouncement}
                    className="px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-all text-xs font-bold flex items-center gap-2">
                    <Plus size={14} /> {isAr ? 'إضافة إعلان' : 'Add'}
                  </button>
                </div>

                {settings.announcements.length === 0 && (
                  <p className="text-center text-th-muted text-sm italic py-8">
                    {isAr ? 'لا توجد إعلانات نشطة حالياً.' : 'No announcements created yet.'}
                  </p>
                )}

                <div className="space-y-4">
                  {settings.announcements.map((ann, i) => (
                    <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-th-surface border border-th-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-th-muted uppercase tracking-widest">
                          {isAr ? `إعلان ${i + 1}` : `Announcement ${i + 1}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateAnnouncement(ann.id, 'active', !ann.active)}
                            className={`transition-all ${ann.active ? 'text-teal-400' : 'text-slate-600'}`}>
                            {ann.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                          <button onClick={() => removeAnnouncement(ann.id)}
                            className="p-1.5 rounded-lg text-th-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block">Text (EN)</label>
                          <input type="text" value={ann.text} placeholder="Announcement text"
                            onChange={(e) => updateAnnouncement(ann.id, 'text', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-xl py-2.5 px-3.5 text-xs text-th-text" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-th-muted mb-1 block text-right">النص (عربي)</label>
                          <input type="text" dir="rtl" value={ann.textAr} placeholder="نص الإعلان بالعربية"
                            onChange={(e) => updateAnnouncement(ann.id, 'textAr', e.target.value)}
                            className="w-full bg-th-surface border border-th-border rounded-xl py-2.5 px-3.5 text-xs text-th-text text-right" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-th-muted mb-1 block">Redirect Link (Optional)</label>
                        <div className="flex items-center gap-2">
                          <LinkIcon size={14} className="text-th-muted shrink-0" />
                          <input type="text" value={ann.link || ''} placeholder="e.g. /reserves or https://..."
                            onChange={(e) => updateAnnouncement(ann.id, 'link', e.target.value)}
                            className="flex-1 bg-th-surface border border-th-border rounded-xl py-2.5 px-3.5 text-xs text-th-text" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Dynamic Live Preview Card ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-0 overflow-hidden bg-th-surface2 backdrop-blur-xl border-th-border">
            <div className="px-5 py-3 border-b border-th-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-th-muted" />
                <span className="text-[10px] font-bold text-th-muted uppercase tracking-widest">
                  {isAr 
                    ? `معاينة مباشرة: ${TABS.find(t => t.id === activeTab)?.name}` 
                    : `Live Preview: ${TABS.find(t => t.id === activeTab)?.nameEn}`}
                </span>
              </div>
              <span className="text-[9px] font-black uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded">
                {activeTab.toUpperCase()}
              </span>
            </div>

            {/* Announcements Banner (always visible if announcements tab or if there's an active announcement) */}
            {settings.announcements?.some(a => a.active) && (
              <div className="bg-teal-500 text-[#001529] py-2.5 px-6 text-center text-xs font-black tracking-tight flex items-center justify-center gap-2">
                <Megaphone size={14} />
                <span>
                  {isAr 
                    ? settings.announcements.find(a => a.active)?.textAr 
                    : settings.announcements.find(a => a.active)?.text}
                </span>
              </div>
            )}

            <div className="p-6 bg-th-surface2/95 min-h-[240px] flex items-center justify-center relative overflow-hidden">
              {activeTab === 'hero' && (
                <div className="w-full text-center relative z-10 py-6">
                  <div className="absolute inset-0 z-0">
                    <img src={settings.heroBgUrl} alt="Preview BG" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/80 to-[#0a1628]" />
                  </div>
                  <div className="relative z-10 space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400 italic">
                      {isAr ? settings.heroAuthorityAr : settings.heroAuthority}
                    </p>
                    <h2 className="text-3xl font-black text-th-text tracking-tight leading-none uppercase italic">
                      {isAr ? settings.heroTitleAr : settings.heroTitle}
                    </h2>
                    <p className="text-xs text-th-muted max-w-xl mx-auto italic">
                      {isAr ? settings.heroSubtitleAr : settings.heroSubtitle}
                    </p>
                    <div className="pt-4 flex items-center justify-center gap-3">
                      <button className="px-5 py-2.5 rounded-xl bg-teal-500 text-[#001529] text-[10px] font-black uppercase italic">
                        {isAr ? settings.heroBtn1TextAr : settings.heroBtn1Text}
                      </button>
                      <button className="px-5 py-2.5 rounded-xl bg-th-surface border border-th-border text-th-text text-[10px] font-black uppercase italic">
                        {isAr ? settings.heroBtn2TextAr : settings.heroBtn2Text}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="w-full max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 py-4">
                  {settings.stats?.map((stat, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-th-border text-center">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mx-auto mb-3">
                        <Globe size={16} />
                      </div>
                      <div className="text-xl font-black text-th-text mb-1">{stat.value}</div>
                      <div className="text-[9px] font-bold text-th-muted uppercase tracking-wider">{isAr ? stat.labelAr : stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'mission' && (
                <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 py-4 items-center">
                  <div className="flex-1 space-y-3">
                    <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest italic">{isAr ? settings.missionTagAr : settings.missionTag}</span>
                    <h3 className="text-xl font-black text-th-text italic">{isAr ? settings.missionTitleAr : settings.missionTitle}</h3>
                    <p className="text-xs text-th-muted line-clamp-3 italic">{isAr ? settings.missionDescAr : settings.missionDesc}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {settings.missionChecklist?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-th-text font-bold text-[10px] uppercase italic">
                          <CheckCircle2 className="text-teal-400" size={12} />
                          {isAr ? item.textAr : item.text}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-32 h-32 rounded-xl overflow-hidden border border-th-border relative shrink-0">
                    <img src={settings.missionImgUrl} alt="Mission" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 right-1 p-1.5 rounded-lg bg-slate-900/80 border border-th-border text-[8px] font-bold text-center">
                      {isAr ? settings.missionCardTitleAr : settings.missionCardTitle}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'highlights' && (
                <div className="w-full max-w-4xl mx-auto space-y-4 py-4">
                  <div className="flex items-end justify-between border-b border-th-border pb-2">
                    <div>
                      <span className="text-[9px] font-black text-teal-400 uppercase tracking-wider">{isAr ? settings.highlightsTagAr : settings.highlightsTag}</span>
                      <h3 className="text-lg font-black text-th-text italic leading-none">{isAr ? settings.highlightsTitleAr : settings.highlightsTitle}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {settings.highlights?.map((hl, idx) => (
                      <div key={idx} className="relative h-40 rounded-xl overflow-hidden border border-th-border">
                        <img src={hl.img} alt={hl.title} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="text-[7px] font-bold text-teal-400 uppercase">{isAr ? hl.tagAr : hl.tag}</span>
                          <h4 className="text-xs font-black text-th-text truncate leading-tight">{isAr ? hl.titleAr : hl.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'cta' && (
                <div className="w-full text-center relative z-10 py-6">
                  <div className="absolute inset-0 z-0">
                    <img src={settings.ctaBgUrl} alt="CTA Preview BG" className="w-full h-full object-cover opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/95 to-[#0a1628]" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-black text-th-text uppercase italic tracking-tighter">
                      {isAr ? settings.ctaTitleAr : settings.ctaTitle}
                    </h3>
                    <p className="text-xs text-th-muted max-w-lg mx-auto italic">
                      {isAr ? settings.ctaSubtitleAr : settings.ctaSubtitle}
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button className="px-6 py-2 rounded-xl bg-teal-500 text-[#001529] text-[10px] font-black uppercase italic">
                        {isAr ? settings.ctaBtn1TextAr : settings.ctaBtn1Text}
                      </button>
                      <button className="px-6 py-2 rounded-xl bg-th-surface border border-th-border text-th-text text-[10px] font-black uppercase italic">
                        {isAr ? settings.ctaBtn2TextAr : settings.ctaBtn2Text}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="w-full text-center py-8 space-y-2">
                  <Megaphone size={32} className="text-teal-400 mx-auto animate-bounce" />
                  <h3 className="text-sm font-bold text-th-text">{isAr ? 'شريط الإعلانات العلوي' : 'Announcements Top Banner'}</h3>
                  <p className="text-xs text-th-muted max-w-md mx-auto">
                    {isAr 
                      ? 'يتم عرض الإعلان النشط في الشريط الملون بأعلى كافة صفحات الموقع لجذب انتباه الزوار.' 
                      : 'Active announcements will render at the top banner of all public pages.'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  );
}
