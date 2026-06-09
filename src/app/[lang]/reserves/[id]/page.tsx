'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, MapPin, Calendar, ShieldCheck, 
  Globe, Compass, CheckCircle2, Shield, Activity, Microscope, 
  Eye, FileText, Send, User, Mail, CalendarDays, Key, Loader2,
  X, Coins, Ticket, Camera, Trees, Anchor, Bird, Ban, AlertTriangle, Heart, Sparkles, Navigation,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

const RESERVE_GALLERIES: Record<string, { src: string; caption: string; captionAr: string }[]> = {
  reserve_northern_islands: [
    { src: '/red_sea_hero_aerial_1774790601114.png', caption: 'Stunning aerial view of the Northern Islands protectorate', captionAr: 'منظر جوي ساحر لأرخبيل الجزر الشمالية المحمية' },
    { src: '/sea_turtle_close_up_1774790619989.png', caption: 'Green sea turtle nesting on sandy beaches of the archipelago', captionAr: 'سلحفاة خضراء معششة على الشواطئ الرملية للجزر' },
    { src: '/red_sea_sunset_mountains_1774790636632.png', caption: 'Sunset hues over the pristine coastal lagoons', captionAr: 'ألوان الغروب الساحرة على البحيرات الساحلية البكر' },
  ],
  reserve_wadi_el_gemal: [
    { src: '/wadi_el_gemal_mangroves_aerial_1774861445577.png', caption: 'Dense and vibrant coastal mangrove forests', captionAr: 'غابات المنجروف الكثيفة والحيوية على طول الساحل' },
    { src: '/sea_turtle_close_up_1774790619989.png', caption: 'Endangered hawksbill sea turtle swimming near the shallow reefs', captionAr: 'سلحفاة صقرية المنقار المهددة بالانقراض تسبح قرب الشعاب' },
    { src: '/marsa_alam_dugong_underwater_1774861424689.png', caption: 'Rare Dugong grazing peacefully in shallow seagrass meadows', captionAr: 'عروس البحر (الأطوم) يتغذى بسلام في مراعي أعشاب البحر' },
  ],
  reserve_gebel_elba: [
    { src: '/red_sea_sunset_mountains_1774790636632.png', caption: 'Mist-shrouded green peaks of the Elba biosphere reserve', captionAr: 'القمم الخضراء المغطاة بالضباب في محمية جبل علبة' },
    { src: '/red_sea_hero_aerial_1774790601114.png', caption: 'Diverse terrestrial and coastal boundary tracks', captionAr: 'المسارات البرية والساحلية المتنوعة في قطاع المحمية' },
    { src: '/sea_turtle_close_up_1774790619989.png', caption: 'Unique biodiversity records along the mountain foothills', captionAr: 'رصد فريد للتنوع البيولوجي على طول سفوح الجبال' },
  ],
  reserve_coral_reef: [
    { src: '/brother_islands_reef_wall_1774861464852.png', caption: 'Spectacular vertical coral walls at the Brother Islands', captionAr: 'حوائط مرجانية عمودية مذهلة في أعماق جزر الأخوة' },
    { src: '/marsa_alam_dugong_underwater_1774861424689.png', caption: 'Bustling reef environment hosting schools of pelagic fish', captionAr: 'بيئة الشعاب المرجانية النابضة بالحياة تجمع قروش وأسماك البحر' },
    { src: '/sea_turtle_close_up_1774790619989.png', caption: 'Hawksbill sea turtle grazing on marine sponges', captionAr: 'سلحفاة صقرية المنقار تتغذى على الإسفنج البحري في الأعماق' },
  ]
};

export default function ReserveDetailPage({ params }: { params: { lang: string; id: string } }) {
  const { lang, id } = params;
  const isAr = lang === 'ar';

  const [reserve, setReserve] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State for visit permit request
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [permitForm, setPermitForm] = useState({ name: '', email: '', date: '', reason: '' });
  const [submittingPermit, setSubmittingPermit] = useState(false);
  const [permitSuccess, setPermitSuccess] = useState(false);

  // Dynamic content parsers
  const getActivities = () => {
    if (!reserve) return [];
    const val = isAr ? reserve.activitiesAr : reserve.activities;
    if (!val) return [];
    return val.split(/[,،]/).map((s: string) => s.trim()).filter(Boolean);
  };

  const getFamousSpecies = () => {
    if (!reserve) return [];
    const val = isAr ? reserve.famousSpeciesAr : reserve.famousSpecies;
    if (!val) return [];
    return val.split(/[,،]/).map((s: string) => s.trim()).filter(Boolean);
  };

  const getRules = () => {
    if (!reserve) return [];
    const val = isAr ? reserve.rulesAr : reserve.rules;
    if (!val) return [];
    return val.split(/[,،]/).map((s: string) => s.trim()).filter(Boolean);
  };

  const getTicketPrices = () => {
    if (!reserve) return null;
    const val = isAr ? reserve.ticketPriceAr : reserve.ticketPrice;
    if (!val) return null;
    const parts = val.split('|').map((s: string) => s.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    return parts.map((part: string) => {
      const subParts = part.split(':').map((s: string) => s.trim());
      if (subParts.length >= 2) {
        return { category: subParts[0], price: subParts[1] };
      }
      return { category: isAr ? 'رسوم الدخول' : 'Entry Fee', price: part };
    });
  };

  const getActivityIcon = (act: string) => {
    const name = act.toLowerCase();
    if (name.includes('dive') || name.includes('diving') || name.includes('غوص') || name.includes('سنوركل') || name.includes('snorkel') || name.includes('سباحة') || name.includes('swimming')) {
      return <Anchor className="text-teal-400" size={20} />;
    }
    if (name.includes('bird') || name.includes('طيور') || name.includes('رصد')) {
      return <Bird className="text-teal-400" size={20} />;
    }
    if (name.includes('photo') || name.includes('تصوير') || name.includes('camera') || name.includes('فوتوغرافي')) {
      return <Camera className="text-teal-400" size={20} />;
    }
    if (name.includes('sail') || name.includes('إبحار') || name.includes('boat') || name.includes('قارب') || name.includes('شراعي')) {
      return <Compass className="text-teal-400" size={20} />;
    }
    if (name.includes('walk') || name.includes('مسير') || name.includes('hike') || name.includes('hiking') || name.includes('تجول')) {
      return <Navigation className="text-teal-400 animate-pulse" size={20} />;
    }
    if (name.includes('mine') || name.includes('أثر') || name.includes('جولة') || name.includes('heritage') || name.includes('tour') || name.includes('تراث')) {
      return <Sparkles className="text-teal-400" size={20} />;
    }
    return <Activity className="text-teal-400" size={20} />;
  };

  const getSpeciesIcon = (spec: string) => {
    const name = spec.toLowerCase();
    if (name.includes('turtle') || name.includes('سلحفاة') || name.includes('سلاحف')) {
      return <ShieldCheck className="text-emerald-400" size={20} />;
    }
    if (name.includes('shark') || name.includes('قرش') || name.includes('قروش') || name.includes('fish') || name.includes('سمك') || name.includes('سمكة') || name.includes('dugong') || name.includes('أطوم') || name.includes('manta') || name.includes('عروس')) {
      return <Heart className="text-rose-400" size={20} />;
    }
    if (name.includes('falcon') || name.includes('صقر') || name.includes('عقاب') || name.includes('osprey') || name.includes('vulture') || name.includes('طيور') || name.includes('طائر') || name.includes('نسار')) {
      return <Bird className="text-sky-400" size={20} />;
    }
    if (name.includes('tree') || name.includes('شجر') || name.includes('نبات') || name.includes('flora') || name.includes('mangrove') || name.includes('منجروف')) {
      return <Trees className="text-emerald-400" size={20} />;
    }
    return <Sparkles className="text-teal-400" size={20} />;
  };

  const getSpeciesStatus = (spec: string) => {
    const name = spec.toLowerCase();
    if (name.includes('turtle') || name.includes('سلحفاة') || name.includes('سلاحف') || name.includes('shark') || name.includes('قرش') || name.includes('قروش') || name.includes('wrasse') || name.includes('نابليون') || name.includes('vulture') || name.includes('رخمة')) {
      return {
        text: isAr ? 'مهدد بالانقراض' : 'Endangered',
        color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      };
    }
    if (name.includes('dugong') || name.includes('أطوم') || name.includes('عروس البحر') || name.includes('falcon') || name.includes('صقر') || name.includes('ibex') || name.includes('وعل') || name.includes('sheep') || name.includes('أروي') || name.includes('blood tree') || name.includes('دم الأخوين')) {
      return {
        text: isAr ? 'عرضة للانقراض' : 'Vulnerable',
        color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      };
    }
    return {
      text: isAr ? 'محمي بيئياً' : 'Protected',
      color: 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
    };
  };

  const activities = getActivities();
  const famousSpecies = getFamousSpecies();
  const rules = getRules();
  const ticketPrices = getTicketPrices();

  const [activeSlide, setActiveSlide] = useState(0);

  const getGalleryImages = () => {
    if (!reserve) return [];
    if (reserve.gallery) {
      try {
        const parsed = JSON.parse(reserve.gallery);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing reserve gallery JSON:", e);
      }
    }
    const defaultGallery = [
      { src: reserve.img, caption: isAr ? 'صورة الغلاف الرسمية للمحمية' : 'Official Reserve Cover Image', captionAr: 'صورة الغلاف الرسمية للمحمية' },
      { src: '/sea_turtle_close_up_1774790619989.png', caption: 'Protected marine life', captionAr: 'الحياة البحرية المحمية' },
      { src: '/red_sea_hero_aerial_1774790601114.png', caption: 'Aerial coastal briefing', captionAr: 'المنظور الجوي للمنطقة الساحلية' }
    ];
    return RESERVE_GALLERIES[id] || defaultGallery;
  };

  const gallery = getGalleryImages();

  // Auto-play effect
  useEffect(() => {
    if (gallery.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % gallery.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [gallery.length]);

  useEffect(() => {
    const fetchReserveDetails = async () => {
      try {
        const res = await fetch('/api/staff/query?collection=reserves');
        const json = await res.json();
        if (json.success && json.data) {
          const item = json.data.find((r: any) => r.id === id);
          if (item) {
            setReserve({
              ...item,
              img: item.imageUrl || '/red_sea_hero_aerial_1774790601114.png',
              coords: item.coords || '26.5000° N, 34.8000° E',
              speciesCount: item.speciesCount || 500,
              healthIndex: item.healthIndex || 9.5,
              statusAr: item.statusAr || (item.status === 'OPEN' ? 'مفتوحة' : item.status === 'CLOSED' ? 'مغلقة' : 'مقيدة'),
            });
          }
        }
      } catch (err) {
        console.error('Error fetching reserve details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReserveDetails();
  }, [id]);

  const handlePermitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPermit(true);
    // Simulate API request
    setTimeout(() => {
      setSubmittingPermit(false);
      setPermitSuccess(true);
      setPermitForm({ name: '', email: '', date: '', reason: '' });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="bg-th-bg text-th-text min-h-screen flex flex-col justify-between transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
        <PublicNavbar lang={lang} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40">
          <Loader2 className="animate-spin text-teal-400" size={40} />
          <span className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono">
            {isAr ? 'جاري استدعاء البيانات الجغرافية للمحمية...' : 'Retrieving reserve geographic data...'}
          </span>
        </div>
        <PublicFooter lang={lang} />
      </div>
    );
  }

  if (!reserve) {
    return (
      <div className="bg-th-bg text-th-text min-h-screen flex flex-col justify-between transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
        <PublicNavbar lang={lang} />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-40 max-w-xl mx-auto text-center px-6">
          <Shield className="text-rose-500 scale-125" size={48} />
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            {isAr ? 'المحمية غير موجودة' : 'Reserve Profile Not Found'}
          </h2>
          <p className="text-slate-400 italic font-medium leading-relaxed">
            {isAr 
              ? 'لم يتم العثور على المحمية المطلوبة في السجلات النشطة للوزارة.' 
              : 'The requested reserve coordinate profile could not be loaded from active registers.'}
          </p>
          <Link href={`/${lang}/reserves`} className="no-underline">
            <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {isAr ? 'العودة للمحميات' : 'Back to Reserves'}
            </button>
          </Link>
        </div>
        <PublicFooter lang={lang} />
      </div>
    );
  }

  const isStatusOpen = reserve.status === 'OPEN';
  const isStatusRestricted = reserve.status === 'RESTRICTED';

  return (
    <div className="bg-th-bg text-th-text min-h-screen flex flex-col justify-between transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      <main className="transition-colors duration-300">

      {/* ── Immersive Hero Header ────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[480px] flex items-end justify-center px-6 overflow-hidden" style={{ backgroundColor: 'var(--hero-bg, #0a1628)' }}>
        {/* Cover Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src={reserve.img} 
            alt={isAr ? reserve.nameAr : reserve.name}
            className="w-full h-full object-cover scale-105"
          />
          {/* Full-screen frosted overlay — white/opaque in light, subtle in dark */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: 'var(--hero-overlay)' }}
          />
          {/* Bottom-to-top gradient blending into page bg */}
          <div 
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ background: 'var(--hero-overlay-bottom)' }}
          />
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-28 left-6 right-6 flex justify-between items-center z-30 pointer-events-none">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 italic">
            <Compass size={14} className="animate-spin-slow" />
            <span>{isAr ? 'تفاصيل قطاع المحمية' : 'Reserve Sector Profile'}</span>
          </div>
          <Link href={`/${lang}/reserves`} className="pointer-events-auto">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 hover:border-teal-500/50 text-th-text hover:text-teal-400 text-xs font-black uppercase tracking-widest transition-all shadow-sm">
              {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              {isAr ? 'الشبكة الموحدة' : 'Unified Network'}
            </button>
          </Link>
        </div>

        {/* Title Content */}
        <div className="relative z-30 max-w-7xl mx-auto w-full pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/30 text-[10px] font-black text-teal-500 uppercase tracking-widest italic block w-fit backdrop-blur-sm">
              {isAr ? reserve.statusAr : reserve.name.toUpperCase() + ' PROFILE'}
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight text-th-text drop-shadow-sm">
              {isAr ? reserve.nameAr : reserve.name}
            </h1>
            <p className="text-sm font-black text-th-dim uppercase tracking-wider flex items-center gap-1.5 italic">
              <MapPin size={16} className="text-teal-400" />
              {isAr ? reserve.locationAr : reserve.location}
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => {
                setPermitSuccess(false);
                setShowPermitModal(true);
              }}
              className="px-8 py-4.5 rounded-2xl bg-teal-500 text-[#001529] font-black text-xs tracking-widest uppercase italic hover:bg-teal-400 transition-all shadow-[0_0_30px_rgba(45,212,191,0.25)] flex items-center gap-2.5"
            >
              <FileText size={16} />
              {isAr ? 'طلب تصريح دخول' : 'Request Visit Permit'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Details Content Section ────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Description & Overview */}
            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-th-surface border border-th-border shadow-xl relative overflow-hidden space-y-6">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-teal-400 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-teal-400 rounded-tr-lg pointer-events-none" />

              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white border-b border-white/5 pb-4">
                {isAr ? 'الملخص والتوصيف البيئي' : 'Ecological Overview'}
              </h2>
              
              <div 
                className="text-th-muted font-medium italic leading-relaxed space-y-4
                  [&>h1]:text-th-text [&>h1]:font-black [&>h1]:text-2xl [&>h1]:mt-6 [&>h1]:mb-3 [&>h1]:uppercase [&>h1]:italic [&>h1]:tracking-tighter
                  [&>h2]:text-th-text [&>h2]:font-black [&>h2]:text-xl [&>h2]:mt-5 [&>h2]:mb-2 [&>h2]:uppercase [&>h2]:italic [&>h2]:tracking-tighter
                  [&>p]:mb-4 [&>p]:leading-relaxed
                  [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-2 [&>ul]:mb-4 [&>ul]:text-th-muted
                  [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:space-y-2 [&>ol]:mb-4 [&>ol]:text-th-muted
                  [&>li]:text-th-muted [&>li]:italic
                  [&>strong]:text-th-text [&>strong]:font-bold"
                dangerouslySetInnerHTML={{ 
                  __html: isAr ? reserve.descriptionAr : reserve.description 
                }}
              />
            </div>

            {/* Activities Section */}
            {activities.length > 0 && (
              <div className="p-8 sm:p-10 rounded-[2.5rem] bg-th-surface border border-th-border shadow-xl relative overflow-hidden space-y-6">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-teal-400 rounded-tl-lg pointer-events-none" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-teal-400 rounded-tr-lg pointer-events-none" />

                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white border-b border-white/5 pb-4 flex items-center gap-3">
                  <Compass size={24} className="text-teal-400 animate-spin-slow" />
                  {isAr ? 'الأنشطة الاستكشافية المتاحة' : 'Available Exploration Activities'}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activities.map((activity, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      className="p-5 rounded-2xl bg-th-surface2 border border-th-border hover:border-teal-500/30 transition-all flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-all flex-shrink-0">
                        {getActivityIcon(activity)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                          {activity}
                        </h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-semibold font-mono">
                          {isAr ? 'نشاط مرخص بيئياً' : 'Eco-Permitted Activity'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Famous Species Section */}
            {famousSpecies.length > 0 && (
              <div className="p-8 sm:p-10 rounded-[2.5rem] bg-th-surface border border-th-border shadow-xl relative overflow-hidden space-y-6">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-teal-400 rounded-tl-lg pointer-events-none" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-teal-400 rounded-tr-lg pointer-events-none" />

                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white border-b border-white/5 pb-4 flex items-center gap-3">
                  <Trees size={24} className="text-emerald-400" />
                  {isAr ? 'أشهر كائنات المحمية' : 'Featured Reserve Wildlife'}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {famousSpecies.map((species, idx) => {
                    const status = getSpeciesStatus(species);
                    return (
                      <motion.div 
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="p-5 rounded-2xl bg-th-surface2 border border-th-border hover:border-emerald-500/30 transition-all flex items-start gap-4 group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all flex-shrink-0 mt-0.5">
                          {getSpeciesIcon(species)}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {species}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-block ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Immersive Photo Gallery Slideshow */}
            {gallery.length > 0 && (
              <div className="p-8 sm:p-10 rounded-[2.5rem] bg-th-surface border border-th-border shadow-xl relative overflow-hidden space-y-6">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-teal-400 rounded-tl-lg pointer-events-none" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-teal-400 rounded-tr-lg pointer-events-none" />

                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white border-b border-white/5 pb-4 flex items-center gap-3">
                  <Camera size={24} className="text-teal-400" />
                  {isAr ? 'المعرض المرئي للمحمية' : 'Sanctuary Visual Gallery'}
                </h2>

                {/* Slideshow Container */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/5 group-gallery">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeSlide}
                      src={gallery[activeSlide].src}
                      alt={isAr ? gallery[activeSlide].captionAr : gallery[activeSlide].caption}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Dark gradient shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 pointer-events-none" />

                  {/* Arrows */}
                  {gallery.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveSlide(prev => (prev - 1 + gallery.length) % gallery.length)}
                        className="absolute top-1/2 -translate-y-1/2 left-4 p-2.5 rounded-xl bg-slate-950/70 border border-white/15 hover:border-teal-500/50 hover:bg-teal-500/20 text-white transition-all z-10"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => setActiveSlide(prev => (prev + 1) % gallery.length)}
                        className="absolute top-1/2 -translate-y-1/2 right-4 p-2.5 rounded-xl bg-slate-950/70 border border-white/15 hover:border-teal-500/50 hover:bg-teal-500/20 text-white transition-all z-10"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Bottom Info & Caption */}
                  <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="px-4 py-2.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/10 max-w-md">
                      <p className="text-xs font-bold text-slate-200 leading-relaxed italic">
                        {isAr ? gallery[activeSlide].captionAr : gallery[activeSlide].caption}
                      </p>
                    </div>

                    {/* Progress Dots */}
                    {gallery.length > 1 && (
                      <div className="flex gap-2 self-center md:self-auto bg-slate-950/40 p-2 rounded-xl border border-white/10">
                        {gallery.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveSlide(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${activeSlide === idx ? 'bg-teal-400 w-4' : 'bg-white/20'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Biodiversity Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Species metric */}
              <div className="p-8 rounded-[2rem] bg-th-surface border border-th-border hover:border-teal-500/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                  <Microscope size={24} />
                </div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">
                  {isAr ? 'الكائنات المرصودة' : 'Biodiversity Records'}
                </h4>
                <div className="text-3xl font-black text-white font-mono tracking-tighter mb-2">
                  {reserve.speciesCount}+ {isAr ? 'نوع محمي' : 'Species'}
                </div>
                <p className="text-xs text-slate-400 italic leading-relaxed">
                  {isAr 
                    ? 'يحتوي هذا النطاق المائي على تنوع بيئي فريد يشمل طيوراً مهاجرة ونباتات ساحلية نادرة.' 
                    : 'This reserve coordinates support complex marine life forms including migratory birds.'}
                </p>
              </div>

              {/* Health index metric */}
              <div className="p-8 rounded-[2rem] bg-th-surface border border-th-border hover:border-teal-500/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">
                  {isAr ? 'مؤشر الصحة البيئية' : 'Ecological Health'}
                </h4>
                <div className="text-3xl font-black text-white font-mono tracking-tighter mb-2">
                  {reserve.healthIndex} / 10.0 EHI
                </div>
                <p className="text-xs text-slate-400 italic leading-relaxed">
                  {isAr 
                    ? 'يعتمد المؤشر على نسبة ابيضاض الشعاب المرجانية واستقرار الكائنات الثديية.' 
                    : 'The health score rates the reef stability index and absence of major coral threats.'}
                </p>
              </div>
            </div>

            {/* Engagement Rules */}
            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-th-surface border border-th-border space-y-6">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-rose-400 flex items-center gap-2">
                <Ban className="text-rose-500" size={20} />
                {isAr ? 'قوانين المحمية وقواعد السلامة' : 'Sanctuary Rules & Protocols'}
              </h3>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                {isAr 
                  ? 'يخضع نطاق المحمية لإشراف الهيئة العامة لحماية البيئة البحرية. يرجى الامتثال التام للأنظمة التالية لتجنب العقوبات البيئية.' 
                  : 'The reserve coordinates are strictly monitored by rangers. Adherence to the following protocols is mandatory to prevent citations.'}
              </p>
              <ul className="space-y-3">
                {(rules.length > 0 ? rules : (
                  isAr ? [
                    'يُحظر تماماً جمع القواقع أو عينات الرمال.',
                    'الالتزام بمسافة رصد لا تقل عن 2 متر من الثدييات البحرية.',
                    'استخدام واقيات شمس صديقة للشعاب المرجانية وقابلة للتحلل.',
                    'يُمنع استخدام البلاستيك أحادي الاستخدام داخل المحمية.'
                  ] : [
                    'No shell harvesting or sand sampling allowed.',
                    'Keep a minimum of 2m distance from all marine life.',
                    'Use only reef-safe biodegradable sunscreens.',
                    'Single-use plastics are strictly prohibited onboard.'
                  ]
                )).map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-400 italic font-medium">
                    <CheckCircle2 className="text-teal-500 flex-shrink-0 mt-0.5" size={14} />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Side Telemetry Panel */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Technical Specifications */}
            <div className="p-8 rounded-[2.5rem] bg-th-surface border border-th-border shadow-xl relative overflow-hidden space-y-6">
              {/* Corner brackets */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-teal-400 rounded-tr-lg pointer-events-none" />
              
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-teal-400 italic font-mono flex items-center gap-2">
                <Globe size={16} className="animate-spin-slow" />
                {isAr ? 'القياسات والبيانات الفنية' : 'Technical Specifications'}
              </h3>
              
              <div className="space-y-4">
                <div className="p-4.5 rounded-2xl bg-th-surface2 border border-th-border space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{isAr ? 'سنة الإعلان الرسمي' : 'Declaration Year'}</span>
                  <p className="text-lg font-black text-white font-mono">{reserve.establishedYear}</p>
                </div>

                <div className="p-4.5 rounded-2xl bg-th-surface2 border border-th-border space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{isAr ? 'المساحة المحمية' : 'Protected Area'}</span>
                  <p className="text-lg font-black text-white font-mono">{reserve.area.toLocaleString()} km²</p>
                </div>

                <div className="p-4.5 rounded-2xl bg-th-surface2 border border-th-border space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{isAr ? 'الإحداثيات المكانية' : 'Coordinates'}</span>
                  <p className="text-lg font-black text-white font-mono tracking-tighter">{reserve.coords}</p>
                </div>

                <div className="p-4.5 rounded-2xl bg-th-surface2 border border-th-border space-y-1.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic block">{isAr ? 'الحالة التشغيلية' : 'Operational Status'}</span>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider block w-fit ${
                    isStatusOpen 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : isStatusRestricted 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {isAr 
                      ? (isStatusOpen ? 'مفتوح للزيارة' : isStatusRestricted ? 'زيارات مشروطة' : 'منطقة مغلقة') 
                      : reserve.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Prices Card */}
            {ticketPrices && (
              <div className="p-8 rounded-[2.5rem] bg-th-surface border border-th-border shadow-xl relative overflow-hidden space-y-6">
                {/* Corner brackets */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-teal-400 rounded-tr-lg pointer-events-none" />
                
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-teal-400 italic font-mono flex items-center gap-2">
                  <Ticket size={16} />
                  {isAr ? 'أسعار التذاكر ورسوم الدخول' : 'Entry Ticket Fees'}
                </h3>
                
                <div className="space-y-4">
                  {ticketPrices.map((priceItem, idx) => (
                    <div key={idx} className="p-4.5 rounded-2xl bg-th-surface2 border border-th-border flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Coins className="text-amber-400 animate-pulse" size={16} />
                        <span className="text-xs font-bold text-slate-300">{priceItem.category}</span>
                      </div>
                      <p className="text-base font-black text-teal-400 font-mono">{priceItem.price}</p>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-500 italic leading-relaxed text-center">
                    {isAr 
                      ? 'ملاحظة: تذهب العوائد مباشرة لتمويل مبادرات حماية البيئة البحرية وصيانة الأرصفة العائمة.' 
                      : 'Note: Ticket proceeds directly support marine research and monitoring patrols.'}
                  </p>
                </div>
              </div>
            )}

            {/* Visit Request Card */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-teal-500 to-teal-700 text-[#001529] shadow-xl space-y-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
                {isAr ? 'هل تخطط لزيارة المحمية؟' : 'Apply for Access Permit'}
              </h3>
              <p className="text-xs font-bold opacity-80 leading-relaxed italic">
                {isAr 
                  ? 'يتطلب القيام بأنشطة غوص ترفيهية أو علمية استصدار تصريح دخول إلكتروني مسبق لضمان تطبيق لوائح الأثر الصفري.'
                  : 'Scientific or commercial operations inside restricted coordinates require an approved entry ticket.'}
              </p>
              <button 
                onClick={() => {
                  setPermitSuccess(false);
                  setShowPermitModal(true);
                }}
                className="w-full py-4 rounded-xl bg-[#001529] text-teal-400 font-black text-xs tracking-widest uppercase italic hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                {isAr ? 'قدّم طلبك الآن' : 'Apply Online Now'}
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ── Interactive Access Permit Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showPermitModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPermitModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#071324]/95 border border-teal-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_80px_rgba(45,212,191,0.2)] flex flex-col z-10 text-white"
            >
              {/* Decorative Corner Brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br-2xl pointer-events-none" />

              {/* Close button */}
              <button 
                onClick={() => setShowPermitModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/50 hover:bg-teal-500/10 text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest block mb-1 font-mono">
                    {isAr ? 'استمارة الانتشار الميداني' : 'Field Access Permit'}
                  </span>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                    {isAr ? 'تصريح دخول إلكتروني' : 'Entry Permit Request'}
                  </h3>
                </div>

                <div className="w-full h-px bg-white/5" />

                {permitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <ShieldCheck size={32} />
                    </div>
                    <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">
                      {isAr ? 'تم استلام طلبك بنجاح' : 'Request Transmitted'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed italic max-w-sm mx-auto">
                      {isAr 
                        ? 'تم تسجيل طلب التصريح في السجلات التكتيكية. سيتم إرسال كود التصريح والتعليمات الأمنية لبريدك الإلكتروني بعد مراجعة المسؤولين.' 
                        : 'Your spatial permit request has been filed. Access coordinates and terms will be sent to your email post review.'}
                    </p>
                    <button 
                      onClick={() => setShowPermitModal(false)}
                      className="px-6 py-3.5 rounded-xl bg-teal-500 text-[#001529] font-black text-xs tracking-widest uppercase italic hover:bg-teal-400 transition-all mt-4"
                    >
                      {isAr ? 'إغلاق النافذة' : 'Close Console'}
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handlePermitSubmit} className="space-y-4 font-sans text-sm">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{isAr ? 'الاسم بالكامل' : 'Full Name'}</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          type="text" 
                          required
                          value={permitForm.name}
                          onChange={(e) => setPermitForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={isAr ? 'مثال: مصطفى لايق' : 'e.g. Mostafa Layek'}
                          className="w-full bg-[#081220] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          type="email" 
                          required
                          value={permitForm.email}
                          onChange={(e) => setPermitForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="name@domain.com"
                          className="w-full bg-[#081220] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{isAr ? 'تاريخ الزيارة المقترح' : 'Proposed Date'}</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          type="date" 
                          required
                          value={permitForm.date}
                          onChange={(e) => setPermitForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-[#081220] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white outline-none focus:border-teal-500/50 transition-all text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{isAr ? 'الغرض البيئي من الزيارة' : 'Reason for Visit'}</label>
                      <textarea 
                        required
                        rows={3}
                        value={permitForm.reason}
                        onChange={(e) => setPermitForm(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder={isAr ? 'مثال: غوص ترفيهي وتصوير فوتوغرافي للشعاب' : 'e.g. Scientific exploration or recreational photography'}
                        className="w-full bg-[#081220] border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={submittingPermit}
                      className="w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#001529] font-black text-xs tracking-widest uppercase italic transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {submittingPermit ? (
                        <>
                          <Loader2 className="animate-spin text-[#001529]" size={16} />
                          {isAr ? 'جاري التسجيل...' : 'TRANSMITTING...'}
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          {isAr ? 'إرسال طلب التصريح' : 'Transmit Request'}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
