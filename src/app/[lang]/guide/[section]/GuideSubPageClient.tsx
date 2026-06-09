'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   BookOpen,
   Compass,
   ShieldCheck,
   LifeBuoy,
   FileText,
   Calendar,
   Shield,
   ClipboardList,
   Ban,
   ArrowLeft,
   ArrowRight,
   Check,
   AlertTriangle,
   Printer,
   Thermometer,
   Wind,
   Eye,
   Loader2,
   CheckCircle2,
   X,
   Phone,
   Wifi,
   Info,
   AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

const SECTIONS = [
   {
      id: 'permit',
      name: 'Permit Application',
      nameAr: 'طلب تصريح زيارة',
      icon: FileText,
      desc: 'Calculate fees and issue digital permits.',
      descAr: 'احسب الرسوم وأصدر تصاريح زيارة رقمية.'
   },
   {
      id: 'seasonal',
      name: 'Seasonal Weather Info',
      nameAr: 'البيانات الموسمية',
      icon: Calendar,
      desc: 'Analyze visibility and water temperature.',
      descAr: 'حلل مدى الرؤية وحالة الطقس ودرجات الحرارة.'
   },
   {
      id: 'etiquette',
      name: 'Marine Etiquette',
      nameAr: 'آداب التعامل مع البحر',
      icon: ShieldCheck,
      desc: 'Code of conduct and protection guidelines.',
      descAr: 'ميثاق السلوك الميداني وإرشادات حماية البيئة.'
   },
   {
      id: 'security',
      name: 'Safety & Security',
      nameAr: 'إرشادات السلامة والأمان',
      icon: Shield,
      desc: 'Emergency contacts and safety guidelines.',
      descAr: 'قنوات الاتصال الميداني وإجراءات الطوارئ.'
   },
   {
      id: 'checklist',
      name: 'Equipment Checklist',
      nameAr: 'قائمة مراجعة المعدات',
      icon: ClipboardList,
      desc: 'Required field and safety equipment checks.',
      descAr: 'قائمة بالمعدات الأساسية ومعدات السلامة المطلوبة.'
   },
   {
      id: 'prohibited',
      name: 'Prohibited Gear',
      nameAr: 'المعدات المحظورة',
      icon: Ban,
      desc: 'Illegal tools and corresponding environmental fines.',
      descAr: 'المعدات الممنوع حملها والغرامات البيئية المترتبة.'
   }
];

const RESERVES = [
   { id: 'northern', name: 'Northern Islands Protected Area', nameAr: 'محمية الجزر الشمالية' },
   { id: 'wadi_gemal', name: 'Wadi El Gemal National Park', nameAr: 'محمية وادي الجمال' },
   { id: 'gebel_elba', name: 'Gebel Elba National Park', nameAr: 'محمية جبل علبة' },
   { id: 'coral_reefs', name: 'Red Sea Barrier Coral Reefs', nameAr: 'محميات الشعاب المرجانية' }
];

const MONTHS_DATA = [
   { m: 'January', mAr: 'يناير', temp: 22, vis: 20, wind: 'Moderate / معتدل', wildlife: ['Dugong', 'Spinner Dolphins'], wildlifeAr: ['الأطوم', 'الدلافين الدوارة'], advice: 'Good visibility. Standard 5mm wetsuit recommended.', adviceAr: 'رؤية جيدة. يوصى ببدلة غوص 5 مم.' },
   { m: 'February', mAr: 'فبراير', temp: 21, vis: 22, wind: 'Moderate / معتدل', wildlife: ['Dugong', 'Green Turtles'], wildlifeAr: ['الأطوم', 'السلاحف الخضراء'], advice: 'Coolest water temperatures. Excellent marine mammal encounters.', adviceAr: 'أبرد درجات حرارة للمياه. فرصة ممتازة لمشاهدة الثدييات البحرية.' },
   { m: 'March', mAr: 'مارس', temp: 23, vis: 25, wind: 'Moderate / معتدل', wildlife: ['Spinner Dolphins', 'Manta Rays'], wildlifeAr: ['الدلافين الدوارة', 'شياطين البحر'], advice: 'Warming water. Transition season for migratory giants.', adviceAr: 'مياه دافئة تدريجياً. موسم انتقالي للقمم البحرية المهاجرة.' },
   { m: 'April', mAr: 'أبريل', temp: 24, vis: 28, wind: 'Calm / هادئ', wildlife: ['Whale Sharks', 'Hammerhead Sharks'], wildlifeAr: ['قرش الحوت', 'قرش أبو مطرقة'], advice: 'Optimal visibility starts. Calm seas and high plankton concentration.', adviceAr: 'تبدأ الرؤية المثالية. مياه هادئة وتركيز عالٍ للعوالق البحرية.' },
   { m: 'May', mAr: 'مايو', temp: 26, vis: 35, wind: 'Calm / هادئ', wildlife: ['Whale Sharks', 'Green Turtles'], wildlifeAr: ['قرش الحوت', 'السلاحف الخضراء'], advice: 'Peak Whale Shark sightings. Ideal for underwater photography.', adviceAr: 'ذروة مشاهدة قرش الحوت. مثالي للتصوير الفوتوغرافي تحت الماء.' },
   { m: 'June', mAr: 'يونيو', temp: 28, vis: 30, wind: 'Calm / هادئ', wildlife: ['Green Turtles', 'Hammerhead Sharks'], wildlifeAr: ['السلاحف الخضراء', 'قرش أبو مطرقة'], advice: 'Green turtles nesting season begins on offshore islands.', adviceAr: 'يبدأ موسم تعشيش السلاحف الخضراء على الجزر النائية.' },
   { m: 'July', mAr: 'يوليو', temp: 29, vis: 32, wind: 'Calm / هادئ', wildlife: ['Nesting Turtles', 'Whale Sharks'], wildlifeAr: ['السلاحف المعششة', 'قرش الحوت'], advice: 'Warm waters. Lightweight 3mm wetsuit or rash guards sufficient.', adviceAr: 'مياه دافئة جداً. بدلة غوص خفيفة 3 مم أو ملابس غوص تكفي.' },
   { m: 'August', mAr: 'أغسطس', temp: 30, vis: 30, wind: 'Calm / هادئ', wildlife: ['Hawksbill Turtles', 'Dugong'], wildlifeAr: ['السلاحف صقرية المنقار', 'الأطوم'], advice: 'Peak sea surface temperatures. Restrict midday sun exposure.', adviceAr: 'أعلى درجات حرارة لسطح البحر. تجنب التعرض للشمس في الظهيرة.' },
   { m: 'September', mAr: 'سبتمبر', temp: 28, vis: 35, wind: 'Calm / هادئ', wildlife: ['Hammerhead Sharks', 'Manta Rays'], wildlifeAr: ['قرش أبو مطرقة', 'شياطين البحر'], advice: 'Excellent deep reef action. Visibility is outstanding.', adviceAr: 'نشاط ممتاز في أعماق الشعاب المرجانية. الرؤية رائعة.' },
   { m: 'October', mAr: 'أكتوبر', temp: 27, vis: 30, wind: 'Moderate / معتدل', wildlife: ['Manta Rays', 'Spinner Dolphins'], wildlifeAr: ['شياطين البحر', 'الدلافين الدوارة'], advice: 'Pleasant air and water temperatures. High dolphin group encounters.', adviceAr: 'درجات حرارة هواء ومياه معتدلة ولطيفة. فرصة عالية للقاء الدلافين.' },
   { m: 'November', mAr: 'نوفمبر', temp: 25, vis: 25, wind: 'Moderate / معتدل', wildlife: ['Thresher Sharks', 'Dugong'], wildlifeAr: ['قرش الدراس', 'الأطوم'], advice: 'Start of cooler currents. Thresher sharks appear on outer drop-offs.', adviceAr: 'بداية التيارات الباردة. تظهر قروش الدراس في المنحدرات الخارجية.' },
   { m: 'December', mAr: 'ديسمبر', temp: 23, vis: 22, wind: 'Moderate / معتدل', wildlife: ['Whale Sharks', 'Spinner Dolphins'], wildlifeAr: ['قرش الحوت', 'الدلافين الدوارة'], advice: 'Winter marine briefing applies. Keep windbreaker jackets onboard.', adviceAr: 'تطبق إرشادات الشتاء البحرية. احتفظ بسترات واقية من الرياح.' }
];

const ETIQUETTE_DOS = [
   { title: 'Maintain Buoyancy Control', titleAr: 'التحكم في الطفو', desc: 'Prevent accidental contact with reefs by adjusting weights properly.', descAr: 'اضبط الأوزان بدقة لتفادي الاصطدام غير المقصود بالشعاب المرجانية.' },
   { title: 'Keep Safe Distance', titleAr: 'الحفاظ على مسافة آمنة', desc: 'Maintain at least 2 meters from turtles, dugongs, and sharks.', descAr: 'حافظ على مسافة لا تقل عن مترين من السلاحف والأطوم والقروش.' },
   { title: 'Listen to Local Guides', titleAr: 'اتباع توجيهات المرشدين', desc: 'Listen to professional briefings before diving or snorkeling.', descAr: 'استمع بتركيز لإحاطة المرشد المحترف قبل الغوص أو السباحة.' }
];

const ETIQUETTE_DONTS = [
   { title: 'Do Not Touch Corals', titleAr: 'لا تلمس الشعاب المرجانية', desc: 'Corals are living organisms; skin contact transfers harmful bacteria.', descAr: 'الشعاب كائنات حية؛ يسبب لمسها انتقال بكتيريا ضارة وتلف خلاياها.' },
   { title: 'No Glove Wear', titleAr: 'يمنع ارتداء القفازات', desc: 'Banned for recreational divers to prevent holding or damaging reefs.', descAr: 'يحظر على الغواصين الهواة منعاً للتمسك بالصخور المرجانية وتدميرها.' },
   { title: 'No Marine Collecting', titleAr: 'يمنع جمع الهياكل البحرية', desc: 'Taking shells, corals, or sand disturbs the fragile habitat ecosystem.', descAr: 'أخذ القواقع أو المرجان أو الرمال يخل بالنظام البيئي الحساس.' }
];

const PROHIBITED_ITEMS = [
   { name: 'Single-use Plastics', nameAr: 'البلاستيك أحادي الاستخدام', threat: 'CRITICAL / حرج', threatColor: 'text-red-500', fine: '20,000 EGP', fineAr: '20,000 ج.م', law: 'Law 4/1994 (Art. 39)', lawAr: 'قانون 4 لعام 1994 (مادة 39)', desc: 'Bags, cups, bottles. Indigestible and lethal to marine turtles and mammals.', descAr: 'الأكياس والأكواب والزجاجات. تبتلعها السلاحف والثدييات مما يسبب نفوقها.' },
   { name: 'Spearguns & Harpoons', nameAr: 'بنادق الصيد والحراب', threat: 'CRITICAL / حرج', threatColor: 'text-red-500', fine: '50,000 EGP + Gear Seizure', fineAr: '50,000 ج.م + مصادرة المعدات', law: 'Law 102/1983', lawAr: 'قانون 102 لعام 1983', desc: 'Any mechanical or manual spearing device. Fishing inside reserves is strictly illegal.', descAr: 'أي أداة صيد ميكانيكية أو يدوية. الصيد داخل المحميات مجرم تماماً.' },
   { name: 'Recreational Gloves', nameAr: 'قفازات الغوص الترفيهي', threat: 'HIGH / مرتفع', threatColor: 'text-orange-500', fine: '10,000 EGP', fineAr: '10,000 ج.م', law: 'Decree 264/1994', lawAr: 'قرار 264 لعام 1994', desc: 'Gloves without research permits. Encourages touching and breaking corals.', descAr: 'القفازات دون تصريح علمي. تشجع على التمسك بالشعاب وكسرها.' },
   { name: 'Organic Sample Containers', nameAr: 'حقائب جمع العينات العضوية', threat: 'CRITICAL / حرج', threatColor: 'text-red-500', fine: '100,000 EGP + Detention', fineAr: '100,000 ج.م + احتجاز', law: 'Law 102/1983 (Art. 3)', lawAr: 'قانون 102 لعام 1983 (مادة 3)', desc: 'Net bags used to collect shells, coral chunks, or live organisms.', descAr: 'الحقائب الشبكية المخصصة لجمع القواقع والمرجان أو الكائنات الحية.' }
];

const EMERGENCY_CHAMBERS = [
   { name: 'Hurghada Hyperbaric Center', nameAr: 'مركز الضغط العالي بالغردقة', status: 'ONLINE', statusAr: 'يعمل', phone: '+20 65 344 9150' },
   { name: 'Marsa Alam Deco Chamber', nameAr: 'غرفة ضغط مرسى علم', status: 'ONLINE', statusAr: 'يعمل', phone: '+20 12 224 3333' },
   { name: 'Sharm El Sheikh Chamber', nameAr: 'غرفة ضغط شرم الشيخ', status: 'ONLINE', statusAr: 'يعمل', phone: '+20 69 366 0922' }
];

const CHECKLIST_ITEMS = [
   { id: 'smb', name: 'Surface Marker Buoy (SMB) with Reel', nameAr: 'عوامة إشارة سطحية (SMB) مع بكرة خيط' },
   { id: 'computer', name: 'Personal Dive Computer', nameAr: 'كمبيوتر غوص شخصي' },
   { id: 'sunscreen', name: 'Reef-safe Biodegradable Sunscreen', nameAr: 'واقي شمس آمن للشعاب المرجانية' },
   { id: 'signal', name: 'Acoustic Signal Device (Whistle/Horn)', nameAr: 'جهاز إشارة صوتي (صافرة/بوق)' },
   { id: 'knife', name: 'Dive Knife or Line Cutter', nameAr: 'سكين غوص أو قاطع خيوط' },
   { id: 'torch', name: 'Backup Underwater Torch', nameAr: 'مصباح غوص احتياطي' }
];

export default function GuideSubPageClient({ lang, section }: { lang: string; section: string }) {
   const isAr = lang === 'ar';
   const [activeSection, setActiveSection] = useState(section);
   const [chambers, setChambers] = useState([
      { name: 'Hurghada Hyperbaric Center', nameAr: 'مركز الضغط العالي بالغردقة', status: 'ONLINE', statusAr: 'يعمل', phone: '+20 65 344 9150' },
      { name: 'Marsa Alam Deco Chamber', nameAr: 'غرفة ضغط مرسى علم', status: 'ONLINE', statusAr: 'يعمل', phone: '+20 12 224 3333' },
      { name: 'Sharm El Sheikh Chamber', nameAr: 'غرفة ضغط شرم الشيخ', status: 'ONLINE', statusAr: 'يعمل', phone: '+20 69 366 0922' }
   ]);

   // Fetch dynamic settings on mount
   useEffect(() => {
      fetch('/api/staff/query?collection=system_config')
         .then(r => r.json())
         .then(json => {
            if (json.success && json.data && json.data.length > 0) {
               const globalConfig = json.data.find((item: any) => item.id === 'global') || json.data[0];
               if (globalConfig) {
                  setChambers([
                     { name: 'Hurghada Hyperbaric Center', nameAr: 'مركز الضغط العالي بالغردقة', status: 'ONLINE', statusAr: 'يعمل', phone: globalConfig.chamberHurghada || '+20 65 344 9150' },
                     { name: 'Marsa Alam Deco Chamber', nameAr: 'غرفة ضغط مرسى علم', status: 'ONLINE', statusAr: 'يعمل', phone: globalConfig.chamberMarsa || '+20 12 224 3333' },
                     { name: 'Sharm El Sheikh Chamber', nameAr: 'غرفة ضغط شرم الشيخ', status: 'ONLINE', statusAr: 'يعمل', phone: globalConfig.chamberSharm || '+20 69 366 0922' }
                  ]);
               }
            }
         })
         .catch(err => console.error(err));
   }, []);

   // Sync dynamic section change from props
   useEffect(() => {
      if (SECTIONS.some(s => s.id === section)) {
         setActiveSection(section);
      }
   }, [section]);

   // State for Section 1: Permit Form
   const [reserve, setReserve] = useState('northern');
   const [activity, setActivity] = useState('diving');
   const [groupSize, setGroupSize] = useState(1);
   const [visitDate, setVisitDate] = useState('');
   const [isGeneratingPermit, setIsGeneratingPermit] = useState(false);
   const [generatedPermit, setGeneratedPermit] = useState<any>(null);
   const [generationProgress, setGenerationProgress] = useState(0);

   // State for Section 2: Seasonal month
   const [selectedMonth, setSelectedMonth] = useState(4); // May

   // State for Section 4: Emergency Simulator
   const [sosStep, setSosStep] = useState(0);
   const [sosActive, setSosActive] = useState(false);

   // State for Section 5: Equipment Checklist
   const [checkedGears, setCheckedGears] = useState<Record<string, boolean>>({});

   // Reset SOS when changing sections
   useEffect(() => {
      setSosActive(false);
      setSosStep(0);
   }, [activeSection]);

   // Calculate permit cost
   const permitCost = useMemo(() => {
      let baseRate = 10; // USD
      if (activity === 'snorkeling') baseRate = 5;
      if (activity === 'transit') baseRate = 2;
      if (activity === 'research') baseRate = 0;
      return baseRate * groupSize;
   }, [activity, groupSize]);

   const handleGeneratePermit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!visitDate) {
         alert(isAr ? 'برجاء اختيار تاريخ الزيارة' : 'Please select a visit date');
         return;
      }
      setIsGeneratingPermit(true);
      setGenerationProgress(0);

      const interval = setInterval(() => {
         setGenerationProgress((prev) => {
            if (prev >= 100) {
               clearInterval(interval);
               setIsGeneratingPermit(false);
               const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
               setGeneratedPermit({
                  id: `RED-PERMIT-${randomHex}`,
                  reserve: RESERVES.find(r => r.id === reserve),
                  activity,
                  groupSize,
                  date: visitDate,
                  issuedAt: new Date().toLocaleString(isAr ? 'ar-EG' : 'en-US')
               });
               return 100;
            }
            return prev + 20;
         });
      }, 300);
   };

   // Toggle equipment checklists
   const toggleGear = (id: string) => {
      setCheckedGears(prev => ({
         ...prev,
         [id]: !prev[id]
      }));
   };

   const readinessPercentage = useMemo(() => {
      const checkedCount = Object.values(checkedGears).filter(Boolean).length;
      return Math.round((checkedCount / CHECKLIST_ITEMS.length) * 100);
   }, [checkedGears]);

   return (
      <div className="bg-th-bg text-th-text min-h-screen font-sans flex flex-col justify-between transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
         <PublicNavbar lang={lang} />

         <main className="transition-colors duration-300">
         {/* ── Immersive Breadcrumbs Header ───────────────────────────────── */}
         <section className="pt-40 pb-12 px-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-8">
               <Link
                  href={`/${lang}/guide`}
                  className="flex items-center gap-2 text-xs font-bold text-teal-400/80 hover:text-teal-400 uppercase tracking-widest transition-colors w-fit"
               >
                  <ArrowLeft size={14} className={isAr ? 'rotate-180' : ''} />
                  {isAr ? 'العودة لدليل الإحاطة' : 'Return to Field Briefing'}
               </Link>
               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                  <div>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500/80 italic block mb-1">
                        {isAr ? 'وحدة الإحاطة التفاعلية' : 'INTELLIGENCE BRIEFING CONSOLE'}
                     </span>
                     <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                        {isAr ? 'مركز إرشادات الزوار الميداني' : 'Visitor Field Center'}
                     </h1>
                  </div>
                  <div className="px-5 py-2.5 rounded-xl bg-teal-900/10 border border-teal-500/20 text-teal-400 text-[10px] font-black tracking-widest uppercase italic flex items-center gap-2">
                     <Wifi size={12} className="animate-pulse text-emerald-400" />
                     {isAr ? 'تحديث البيانات: متصل وجاهز' : 'DATA STREAM: FEED ONLINE'}
                  </div>
               </div>
            </div>
         </section>

         {/* ── Console Layout ────────────────────────────────────────────── */}
         <section className="pb-32 px-6 max-w-7xl mx-auto w-full flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               
               {/* ── Navigation Sidebar ──────────────────────────────────────── */}
               <div className="lg:col-span-4 space-y-4">
                  <div className="p-6 rounded-[2rem] bg-[#0c1b2f]/50 border border-white/5 backdrop-blur-3xl space-y-4">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-2">
                        {isAr ? 'أقسام الإحاطة' : 'BRIEFING DIRECTORY'}
                     </span>
                     <div className="flex flex-col gap-2">
                        {SECTIONS.map((sec) => {
                           const Icon = sec.icon;
                           const isActive = activeSection === sec.id;
                           return (
                              <button
                                 key={sec.id}
                                 onClick={() => {
                                    setActiveSection(sec.id);
                                    window.history.pushState(null, '', `/${lang}/guide/${sec.id}`);
                                 }}
                                 className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-start transition-all relative overflow-hidden group ${isActive ? 'bg-teal-500/10 border-teal-500/40 text-white' : 'bg-slate-900/20 border-white/5 text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
                              >
                                 <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-900 text-slate-500 group-hover:text-teal-400'}`}>
                                    <Icon size={18} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="text-sm font-black uppercase tracking-tight italic">
                                       {isAr ? sec.nameAr : sec.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium italic">
                                       {isAr ? sec.descAr : sec.desc}
                                    </div>
                                 </div>
                                 {isActive && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                                 )}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               </div>

               {/* ── Main Briefing Display Pane ───────────────────────────────── */}
               <div className="lg:col-span-8">
                  <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#0c1b2f]/40 border border-white/5 backdrop-blur-3xl relative overflow-hidden min-h-[500px] flex flex-col justify-between">
                     
                     {/* Sci-Fi Decorative Corner Brackets */}
                     <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400/20 rounded-tl-2xl pointer-events-none" />
                     <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400/20 rounded-tr-2xl pointer-events-none" />
                     <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-400/20 rounded-bl-2xl pointer-events-none" />
                     <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-400/20 rounded-br-2xl pointer-events-none" />

                     <AnimatePresence mode="wait">
                        <motion.div
                           key={activeSection}
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -15 }}
                           transition={{ duration: 0.25 }}
                           className="space-y-8 flex-1"
                        >
                           
                           {/* SECTION 1: PERMIT APPLICATION */}
                           {activeSection === 'permit' && (
                              <div className="space-y-8">
                                 <div>
                                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-1">{isAr ? 'القسم الأول: تصريح الدخول الميداني' : 'SECTION_01: DEPLOYMENT CLEARANCE'}</span>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                       {isAr ? 'إصدار تصريح زيارة رقمي' : 'Permit Application'}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium italic mt-2 leading-relaxed">
                                       {isAr 
                                          ? 'قم بتعبئة بيانات الزيارة لحساب الرسوم الرسمية والحصول على تصريح أمني فوري مع رمز استجابة سريعة مشفر.' 
                                          : 'Input your visit parameters to calculate official fees and issue an instant clearance pass.'}
                                    </p>
                                 </div>

                                 {!generatedPermit ? (
                                    <form onSubmit={handleGeneratePermit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 p-6 rounded-2xl border border-white/5">
                                       <div className="space-y-2">
                                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                             {isAr ? 'المحمية المستهدفة' : 'Target Reserve'}
                                          </label>
                                          <select
                                             value={reserve}
                                             onChange={(e) => setReserve(e.target.value)}
                                             className="w-full bg-[#070f1e] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all font-semibold"
                                          >
                                             {RESERVES.map(r => (
                                                <option key={r.id} value={r.id}>{isAr ? r.nameAr : r.name}</option>
                                             ))}
                                          </select>
                                       </div>

                                       <div className="space-y-2">
                                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                             {isAr ? 'نوع النشاط المخطط' : 'Planned Activity'}
                                          </label>
                                          <select
                                             value={activity}
                                             onChange={(e) => setActivity(e.target.value)}
                                             className="w-full bg-[#070f1e] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all font-semibold"
                                          >
                                             <option value="diving">{isAr ? 'غوص ترفيهي ($10/فرد)' : 'Recreational Diving ($10/p)'}</option>
                                             <option value="snorkeling">{isAr ? 'سباحة سطحية ($5/فرد)' : 'Snorkeling ($5/p)'}</option>
                                             <option value="transit">{isAr ? 'مرور عابر باليخت ($2/فرد)' : 'Vessel Transit ($2/p)'}</option>
                                             <option value="research">{isAr ? 'بحث علمي وبحثي (مجانًا)' : 'Scientific Research (Free)'}</option>
                                          </select>
                                       </div>

                                       <div className="space-y-2">
                                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                             {isAr ? 'عدد أفراد المجموعة' : 'Group Size'}
                                          </label>
                                          <input
                                             type="number"
                                             min="1"
                                             max="50"
                                             value={groupSize}
                                             onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value) || 1))}
                                             className="w-full bg-[#070f1e] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all font-semibold"
                                          />
                                       </div>

                                       <div className="space-y-2">
                                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                             {isAr ? 'تاريخ الزيارة المتوقع' : 'Visit Date'}
                                          </label>
                                          <input
                                             type="date"
                                             value={visitDate}
                                             onChange={(e) => setVisitDate(e.target.value)}
                                             className="w-full bg-[#070f1e] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-teal-500/50 transition-all font-semibold"
                                          />
                                       </div>

                                       <div className="md:col-span-2 flex flex-col md:flex-row items-stretch md:items-center justify-between border-t border-white/5 pt-6 mt-2 gap-4">
                                          <div className="flex flex-col">
                                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                {isAr ? 'إجمالي رسوم التصريح المقدرة' : 'TOTAL ESTIMATED FEES'}
                                             </span>
                                             <span className="text-3xl font-black text-teal-400">
                                                {activity === 'research' ? (isAr ? 'مجاناً' : 'FREE') : `$${permitCost}`}
                                             </span>
                                          </div>
                                          <button
                                             type="submit"
                                             disabled={isGeneratingPermit}
                                             className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#001529] font-black text-sm tracking-tight uppercase italic transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                          >
                                             {isGeneratingPermit ? (
                                                <>
                                                   <Loader2 size={16} className="animate-spin" />
                                                   {isAr ? `جاري التوليد ${generationProgress}%...` : `GENERATING ${generationProgress}%...`}
                                                </>
                                             ) : (
                                                <>
                                                   <CheckCircle2 size={16} />
                                                   {isAr ? 'إصدار التصريح الرقمي' : 'Issue Digital Permit'}
                                                </>
                                             )}
                                          </button>
                                       </div>
                                    </form>
                                 ) : (
                                    <motion.div
                                       initial={{ scale: 0.95, opacity: 0 }}
                                       animate={{ scale: 1, opacity: 1 }}
                                       className="bg-slate-950 border border-teal-500/30 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(45,212,191,0.05)]"
                                    >
                                       {/* Cryptographic background text */}
                                       <div className="absolute right-4 bottom-4 opacity-5 font-mono text-[9px] pointer-events-none select-none tracking-widest max-w-[200px] break-all leading-tight">
                                          SECURE_HASH: 0x9AF87BC88DDEEF8E787687EEBCDEF88BCA99F2D
                                       </div>

                                       <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-white/10 pb-6">
                                          <div className="space-y-2">
                                             <div className="px-3 py-1 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[9px] font-black tracking-widest uppercase italic w-fit">
                                                {isAr ? 'تصريح عبور معتمد' : 'APPROVED FIELD PERMIT'}
                                             </div>
                                             <h3 className="text-2xl font-black text-white italic tracking-tight leading-none">
                                                {generatedPermit.reserve.nameAr}
                                             </h3>
                                             <span className="text-[11px] font-mono text-slate-500 font-bold tracking-widest block">
                                                UID: {generatedPermit.id}
                                             </span>
                                          </div>
                                          
                                          {/* QR Code SVG */}
                                          <div className="p-3 bg-white rounded-xl flex items-center justify-center shadow-lg border border-teal-500/20 shrink-0">
                                             <svg className="w-20 h-20 text-slate-900" viewBox="0 0 100 100">
                                                <rect width="100" height="100" fill="white" />
                                                {/* Simulated QR blocks */}
                                                <rect x="5" y="5" width="25" height="25" fill="black" />
                                                <rect x="10" y="10" width="15" height="15" fill="white" />
                                                <rect x="12" y="12" width="11" height="11" fill="black" />

                                                <rect x="70" y="5" width="25" height="25" fill="black" />
                                                <rect x="75" y="10" width="15" height="15" fill="white" />
                                                <rect x="77" y="12" width="11" height="11" fill="black" />

                                                <rect x="5" y="70" width="25" height="25" fill="black" />
                                                <rect x="10" y="75" width="15" height="15" fill="white" />
                                                <rect x="12" y="77" width="11" height="11" fill="black" />

                                                <rect x="40" y="40" width="20" height="20" fill="black" />
                                                <rect x="45" y="45" width="10" height="10" fill="white" />

                                                <rect x="35" y="10" width="10" height="10" fill="black" />
                                                <rect x="50" y="20" width="10" height="25" fill="black" />
                                                <rect x="15" y="40" width="15" height="10" fill="black" />
                                                <rect x="10" y="55" width="20" height="10" fill="black" />
                                                <rect x="45" y="70" width="20" height="15" fill="black" />
                                                <rect x="75" y="45" width="10" height="20" fill="black" />
                                                <rect x="80" y="75" width="15" height="15" fill="black" />
                                             </svg>
                                          </div>
                                       </div>

                                       <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                          <div>
                                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{isAr ? 'النشاط المسموح' : 'PERMITTED ACTIVITY'}</span>
                                             <span className="font-semibold text-white">
                                                {generatedPermit.activity === 'diving' && (isAr ? 'غوص استكشافي' : 'Recreational Diving')}
                                                {generatedPermit.activity === 'snorkeling' && (isAr ? 'سباحة سطحية' : 'Snorkeling')}
                                                {generatedPermit.activity === 'transit' && (isAr ? 'عبور عابر باليخت' : 'Vessel Transit')}
                                                {generatedPermit.activity === 'research' && (isAr ? 'دراسات بيئية بحثية' : 'Scientific Research')}
                                             </span>
                                          </div>
                                          <div>
                                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{isAr ? 'عدد الأفراد المشمولين' : 'TOTAL COVERED CLIENTS'}</span>
                                             <span className="font-semibold text-white">{generatedPermit.groupSize} {isAr ? 'أفراد' : 'Persons'}</span>
                                          </div>
                                          <div>
                                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{isAr ? 'تاريخ سريان التصريح' : 'VALIDITY DATE'}</span>
                                             <span className="font-semibold text-white">{generatedPermit.date}</span>
                                          </div>
                                          <div>
                                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{isAr ? 'تاريخ وساعة الإصدار' : 'TIMESTAMP ISSUED'}</span>
                                             <span className="font-mono text-teal-400 font-bold text-xs">{generatedPermit.issuedAt}</span>
                                          </div>
                                       </div>

                                       <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 pt-6">
                                          <button
                                             onClick={() => window.print()}
                                             className="flex-1 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
                                          >
                                             <Printer size={16} />
                                             {isAr ? 'طباعة التصريح البيئي' : 'Print Environmental Clearance'}
                                          </button>
                                          <button
                                             onClick={() => setGeneratedPermit(null)}
                                             className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#001529] font-black text-sm tracking-tight uppercase italic transition-all"
                                          >
                                             {isAr ? 'إصدار تصريح جديد' : 'Apply For New'}
                                          </button>
                                       </div>
                                    </motion.div>
                                 )}
                              </div>
                           )}

                           {/* SECTION 2: SEASONAL INTELLIGENCE */}
                           {activeSection === 'seasonal' && (
                              <div className="space-y-8">
                                 <div>
                                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-1">{isAr ? 'القسم الثاني: البيانات المناخية والموسمية' : 'SECTION_02: SEASONAL METRICS'}</span>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                       {isAr ? 'البيانات الموسمية والمناخية للغوص' : 'Seasonal Dive Intelligence'}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium italic mt-2 leading-relaxed">
                                       {isAr 
                                          ? 'استخدم شريط التمرير لمعاينة درجات الحرارة المتوقعة، ومدى الرؤية الأفقية، وأهم الكائنات البحرية المتواجدة طوال أشهر السنة.' 
                                          : 'Slide across months to check predicted temperature, visibility gauges, and seasonal wildlife activity.'}
                                    </p>
                                 </div>

                                 {/* Month Slider */}
                                 <div className="space-y-4 bg-slate-900/30 p-6 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'الشهر المختار' : 'SELECTED PERIOD'}</span>
                                       <span className="text-2xl font-black text-teal-400 italic">
                                          {isAr ? MONTHS_DATA[selectedMonth].mAr : MONTHS_DATA[selectedMonth].m}
                                       </span>
                                    </div>
                                    <input
                                       type="range"
                                       min="0"
                                       max="11"
                                       value={selectedMonth}
                                       onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                       className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
                                    />
                                    <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
                                       <span>JAN / ينا</span>
                                       <span>JUN / يون</span>
                                       <span>DEC / ديس</span>
                                    </div>
                                 </div>

                                 {/* Telemetry Dials & Conditions */}
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    
                                    {/* Temp */}
                                    <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center gap-4">
                                       <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                                          <Thermometer size={24} />
                                       </div>
                                       <div>
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{isAr ? 'حرارة المياه المتوسطة' : 'AVG WATER TEMP'}</span>
                                          <span className="text-2xl font-black text-white">{MONTHS_DATA[selectedMonth].temp}°C</span>
                                       </div>
                                    </div>

                                    {/* Visibility */}
                                    <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center gap-4">
                                       <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
                                          <Eye size={24} />
                                       </div>
                                       <div>
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{isAr ? 'مدى الرؤية الأفقية' : 'AVG VISIBILITY'}</span>
                                          <span className="text-2xl font-black text-white">{MONTHS_DATA[selectedMonth].vis}m</span>
                                       </div>
                                    </div>

                                    {/* Wind */}
                                    <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center gap-4">
                                       <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                          <Wind size={24} />
                                       </div>
                                       <div>
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{isAr ? 'حالة الرياح للامواج' : 'SURFACE WIND'}</span>
                                          <span className="text-base font-black text-white truncate max-w-[130px] block">
                                             {MONTHS_DATA[selectedMonth].wind}
                                          </span>
                                       </div>
                                    </div>

                                 </div>

                                 {/* Recommendations & Sighting Probabilities */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-6 rounded-2xl border border-teal-500/10">
                                    <div className="space-y-3">
                                       <div className="flex items-center gap-2 text-teal-400">
                                          <Info size={16} />
                                          <span className="text-xs font-black uppercase tracking-wider">{isAr ? 'إرشادات الانتشار الميدانية' : 'FIELD BRIEFING ADVICE'}</span>
                                       </div>
                                       <p className="text-sm font-medium italic text-slate-300 leading-relaxed">
                                          {isAr ? MONTHS_DATA[selectedMonth].adviceAr : MONTHS_DATA[selectedMonth].advice}
                                       </p>
                                    </div>
                                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                          {isAr ? 'أعلى احتمال لمشاهدة الحياة الفطرية' : 'PEAK WILDLIFE ENCOUNTERS'}
                                       </span>
                                       <div className="flex flex-wrap gap-2">
                                          {(isAr ? MONTHS_DATA[selectedMonth].wildlifeAr : MONTHS_DATA[selectedMonth].wildlife).map((w, idx) => (
                                             <span key={idx} className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-xs italic">
                                                {w}
                                             </span>
                                          ))}
                                       </div>
                                    </div>
                                 </div>

                              </div>
                           )}

                           {/* SECTION 3: MARINE ETIQUETTE */}
                           {activeSection === 'etiquette' && (
                              <div className="space-y-8">
                                 <div>
                                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-1">{isAr ? 'القسم الثالث: قواعد السلوك الميداني' : 'SECTION_03: ENGAGEMENT PROTOCOLS'}</span>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                       {isAr ? 'آداب التعامل مع البيئة البحرية' : 'Marine Engagement Etiquette'}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium italic mt-2 leading-relaxed">
                                       {isAr 
                                          ? 'يرجى الالتزام الصارم بميثاق السلوك لتفادي إحداث أضرار بالشعاب المرجانية الحساسة وتجنب توقيع الغرامات البيئية.' 
                                          : 'Adhere closely to zero-impact codes of engagement to safeguard fragile coral structures.'}
                                    </p>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    
                                    {/* DO's */}
                                    <div className="space-y-4">
                                       <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                          {isAr ? 'السلوكيات المطلوبة (افعل)' : 'Approved Operations (DO)'}
                                       </span>
                                       <div className="space-y-4">
                                          {ETIQUETTE_DOS.map((item, idx) => (
                                             <div key={idx} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-2">
                                                <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                                                   <Check size={14} strokeWidth={3} />
                                                   {isAr ? item.titleAr : item.title}
                                                </h4>
                                                <p className="text-xs font-medium text-slate-400 italic leading-relaxed">
                                                   {isAr ? item.descAr : item.desc}
                                                </p>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* DON'Ts */}
                                    <div className="space-y-4">
                                       <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                          {isAr ? 'السلوكيات الممنوعة (لا تفعل)' : 'Prohibited Actions (DON\'T)'}
                                       </span>
                                       <div className="space-y-4">
                                          {ETIQUETTE_DONTS.map((item, idx) => (
                                             <div key={idx} className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all space-y-2">
                                                <h4 className="text-sm font-black text-red-400 uppercase tracking-wide flex items-center gap-2">
                                                   <AlertTriangle size={14} />
                                                   {isAr ? item.titleAr : item.title}
                                                </h4>
                                                <p className="text-xs font-medium text-slate-400 italic leading-relaxed">
                                                   {isAr ? item.descAr : item.desc}
                                                </p>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                 </div>
                              </div>
                           )}

                           {/* SECTION 4: SECURITY PROTOCOL */}
                           {activeSection === 'security' && (
                              <div className="space-y-8">
                                 <div>
                                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-1">{isAr ? 'القسم الرابع: اتصالات الطوارئ البحرية' : 'SECTION_04: EMERGENCY COMMUNICATIONS'}</span>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                       {isAr ? 'البروتوكولات الأمنية والطوارئ البحرية' : 'Security & Emergency Protocols'}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium italic mt-2 leading-relaxed">
                                       {isAr 
                                          ? 'قائمة الترددات اللاسلكية المعتمدة وغرف العلاج بالأكسجين المضغوط النشطة في نطاق البحر الأحمر.' 
                                          : 'Official emergency frequencies and operational hyperbaric support stations within the sector.'}
                                    </p>
                                 </div>

                                 {/* Frequencies table */}
                                 <div className="bg-slate-900/30 rounded-2xl border border-white/5 p-6 space-y-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                       {isAr ? 'شبكة الترددات اللاسلكية المعتمدة' : 'RADIO DISTRICT FREQUENCIES'}
                                    </span>
                                    <div className="grid grid-cols-3 gap-4 text-xs border-b border-white/5 pb-2 text-slate-400 font-bold uppercase tracking-wider">
                                       <div>{isAr ? 'الجهة / الاستخدام' : 'SERVICE'}</div>
                                       <div>{isAr ? 'القناة' : 'CHANNEL'}</div>
                                       <div>{isAr ? 'التردد' : 'FREQUENCY'}</div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                       <div className="grid grid-cols-3 gap-4 font-semibold text-white">
                                          <div className="text-red-400">{isAr ? 'استغاثة دولية' : 'International Distress'}</div>
                                          <div className="font-mono text-xs">VHF Ch. 16</div>
                                          <div className="font-mono text-xs">156.800 MHz</div>
                                       </div>
                                       <div className="grid grid-cols-3 gap-4 font-semibold text-slate-300">
                                          <div>{isAr ? 'دورية حرس الحدود' : 'Border Patrol Operations'}</div>
                                          <div className="font-mono text-xs">VHF Ch. 14</div>
                                          <div className="font-mono text-xs">156.700 MHz</div>
                                       </div>
                                       <div className="grid grid-cols-3 gap-4 font-semibold text-slate-300">
                                          <div>{isAr ? 'مركز العمليات البيئي' : 'Environmental Agency'}</div>
                                          <div className="font-mono text-xs">VHF Ch. 08</div>
                                          <div className="font-mono text-xs">156.400 MHz</div>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Hyperbaric Chambers */}
                                 <div className="space-y-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                       {isAr ? 'مواقع غرف الأكسجين النشطة' : 'ACTIVE DIVER RECOMPRESSION CHAMBERS'}
                                    </span>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                       {chambers.map((ch, idx) => (
                                          <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
                                             <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-black text-white truncate max-w-[130px]">{isAr ? ch.nameAr : ch.name}</h4>
                                                <span className="px-2 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                   {isAr ? ch.statusAr : ch.status}
                                                </span>
                                             </div>
                                             <a
                                                href={`tel:${ch.phone.replace(/\s+/g, '')}`}
                                                className="flex items-center gap-2 text-xs font-bold text-teal-400/80 hover:text-teal-400 hover:scale-[1.02] transition-all w-fit"
                                             >
                                                <Phone size={12} />
                                                {ch.phone}
                                             </a>
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 {/* SOS emergency simulator */}
                                 <div className="bg-slate-950 p-6 rounded-2xl border border-red-500/20 space-y-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl pointer-events-none" />
                                    <div className="flex items-center gap-3">
                                       <AlertCircle size={20} className="text-red-400 animate-pulse" />
                                       <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                          {isAr ? 'محاكاة بروتوكول استغاثة الطوارئ' : 'EMERGENCY DISTRESS PROCEDURAL SIMULATOR'}
                                       </span>
                                    </div>

                                    {!sosActive ? (
                                       <button
                                          onClick={() => {
                                             setSosActive(true);
                                             setSosStep(1);
                                          }}
                                          className="px-6 py-3.5 rounded-xl bg-red-500/20 hover:bg-red-500/35 border border-red-500/40 text-red-200 font-bold text-xs uppercase tracking-wider transition-all"
                                       >
                                          {isAr ? 'بدء محاكاة الاستغاثة (SOS)' : 'Initialize Distress Simulator'}
                                       </button>
                                    ) : (
                                       <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className="space-y-4"
                                       >
                                          <div className="flex items-center justify-between">
                                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                {isAr ? `الخطوة ${sosStep} من 4` : `STEP ${sosStep} OF 4`}
                                             </span>
                                             <button onClick={() => setSosActive(false)} className="text-slate-500 hover:text-white">
                                                <X size={16} />
                                             </button>
                                          </div>
                                          {sosStep === 1 && (
                                             <div className="space-y-3">
                                                <p className="text-sm font-semibold text-white">
                                                   {isAr ? 'الخطوة 1: انتشال المصاب وعزله' : 'Step 1: Recovery and Isolation'}
                                                </p>
                                                <p className="text-xs text-slate-400 italic leading-relaxed">
                                                   {isAr
                                                      ? 'قم بانتشال الغواص فوراً وتثبيت أجهزة الطفو وتأمين المجرى الهوائي.'
                                                      : 'Immediately secure the diver on deck, establish buoyancy, and clear airways.'}
                                                </p>
                                             </div>
                                          )}
                                          {sosStep === 2 && (
                                             <div className="space-y-3">
                                                <p className="text-sm font-semibold text-white">
                                                   {isAr ? 'الخطوة 2: الإمداد بالأكسجين النقي' : 'Step 2: Pure Oxygen Administration'}
                                                </p>
                                                <p className="text-xs text-slate-400 italic leading-relaxed">
                                                   {isAr
                                                      ? 'ابدأ فوراً بإمداد المصاب بالأكسجين النقي 100% بمعدل تدفق مرتفع.'
                                                      : 'Administer 100% pure medical oxygen via demand valve immediately.'}
                                                </p>
                                             </div>
                                          )}
                                          {sosStep === 3 && (
                                             <div className="space-y-3">
                                                <p className="text-sm font-semibold text-white">
                                                   {isAr ? 'الخطوة 3: بث الاستغاثة وتحديد الإحداثيات' : 'Step 3: Radio Broadcast & Coordinates'}
                                                </p>
                                                <p className="text-xs text-slate-400 italic leading-relaxed">
                                                   {isAr
                                                      ? 'قم بإرسال رسالة "MAYDAY" على القناة 16 VHF وتحديد إحداثيات الـ GPS الحالية للمركب.'
                                                      : 'Broadcast MAYDAY alert on VHF Ch 16, clearly reciting your current GPS coordinates.'}
                                                </p>
                                             </div>
                                          )}
                                          {sosStep === 4 && (
                                             <div className="space-y-3">
                                                <p className="text-sm font-semibold text-white">
                                                   {isAr ? 'الخطوة 4: التنسيق مع غرف الضغط وتسهيل النقل' : 'Step 4: Chamber Liaison'}
                                                </p>
                                                <p className="text-xs text-slate-400 italic leading-relaxed">
                                                   {isAr
                                                      ? 'قم بالاتصال المباشر بأقرب غرفة ضغط عالي معتمدة لتجهيز الطاقم الطبي لاستقبال المصاب.'
                                                      : 'Contact hyperbaric personnel and prepare for immediate heli-evacuation or high-speed transit.'}
                                                </p>
                                             </div>
                                          )}

                                          <div className="flex gap-3 pt-2">
                                             {sosStep > 1 && (
                                                <button
                                                   onClick={() => setSosStep(prev => prev - 1)}
                                                   className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white border border-white/5"
                                                >
                                                   {isAr ? 'السابق' : 'Previous'}
                                                </button>
                                             )}
                                             {sosStep < 4 ? (
                                                <button
                                                   onClick={() => setSosStep(prev => prev + 1)}
                                                   className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-xs font-bold text-white"
                                                >
                                                   {isAr ? 'الخطوة التالية' : 'Next Step'}
                                                </button>
                                             ) : (
                                                <button
                                                   onClick={() => setSosActive(false)}
                                                   className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                                                >
                                                   {isAr ? 'إنهاء المحاكاة وبث البيانات' : 'Terminate & Close'}
                                                </button>
                                             )}
                                          </div>
                                       </motion.div>
                                    )}
                                 </div>

                              </div>
                           )}

                           {/* SECTION 5: EQUIPMENT CHECKLIST */}
                           {activeSection === 'checklist' && (
                              <div className="space-y-8">
                                 <div>
                                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-1">{isAr ? 'القسم الخامس: فحص معدات السلامة' : 'SECTION_05: COMPLIANCE GEARCHECK'}</span>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                       {isAr ? 'قائمة مراجعة المعدات الإلزامية' : 'Equipment Checklist'}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium italic mt-2 leading-relaxed">
                                       {isAr 
                                          ? 'قم بتأكيد حيازتك للمعدات الأساسية وأجهزة الأمان اللازمة قبل النزول للمياه.' 
                                          : 'Verify and check off mandatory field safety gear items to calculate readiness index.'}
                                    </p>
                                 </div>

                                 {/* Progress bar */}
                                 <div className="space-y-2 bg-slate-900/30 p-6 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center text-xs">
                                       <span className="font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'جاهزية المعدات' : 'GEAR READINESS'}</span>
                                       <span className="font-mono text-teal-400 font-bold">{readinessPercentage}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-[#070f1e] rounded-full overflow-hidden border border-white/5">
                                       <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${readinessPercentage}%` }}
                                          className={`h-full ${readinessPercentage === 100 ? 'bg-emerald-500' : 'bg-teal-500'} shadow-[0_0_10px_rgba(45,212,191,0.2)]`}
                                       />
                                    </div>
                                    <div className="text-[10px] font-mono italic text-slate-500 mt-2">
                                       {readinessPercentage === 100 
                                          ? (isAr ? 'بروتوكول السلامة: المعدات مكتملة وجاهزة للنزول' : 'SAFETY PROTOCOL: DISPATCH CLEARANCE GRANTED') 
                                          : (isAr ? 'يرجى تأكيد كافة المعدات لضمان سلامتك الميدانية' : 'PLEASE VERIFY ALL SAFETY APPARATUSES BEFORE LAUNCH')}
                                    </div>
                                 </div>

                                 {/* Checkboxes Grid */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {CHECKLIST_ITEMS.map((item) => {
                                       const isChecked = !!checkedGears[item.id];
                                       return (
                                          <button
                                             key={item.id}
                                             onClick={() => toggleGear(item.id)}
                                             className={`flex items-start gap-4 p-4 rounded-xl border text-start transition-all ${isChecked ? 'bg-teal-500/10 border-teal-500/40 text-white' : 'bg-slate-900/20 border-white/5 text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
                                          >
                                             <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isChecked ? 'bg-teal-500 border-teal-500 text-[#001529]' : 'border-slate-600'}`}>
                                                {isChecked && <Check size={14} strokeWidth={3} />}
                                             </div>
                                             <span className="text-xs font-bold uppercase tracking-tight italic">
                                                {isAr ? item.nameAr : item.name}
                                             </span>
                                          </button>
                                       );
                                    })}
                                 </div>

                              </div>
                           )}

                           {/* SECTION 6: PROHIBITED GEAR */}
                           {activeSection === 'prohibited' && (
                              <div className="space-y-8">
                                 <div>
                                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-1">{isAr ? 'القسم السادس: المعدات الميدانية المحظورة' : 'SECTION_06: BANNED FIELD EQUIPMENTS'}</span>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                       {isAr ? 'المعدات والأدوات المحظورة بيئياً' : 'Prohibited Field Gear'}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium italic mt-2 leading-relaxed">
                                       {isAr 
                                          ? 'يمنع حمل هذه المواد تماماً على متن اليخوت أو السفن. يحاكم المخالفون بغرامات بيئية مشددة وربما الاحتجاز ومصادرة القوارب.' 
                                          : 'Possession of the following items is strictly illegal onboard any vessel entering marine reserves.'}
                                    </p>
                                 </div>

                                 {/* Prohibited items Grid */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {PROHIBITED_ITEMS.map((item, idx) => (
                                       <div key={idx} className="p-6 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-red-500/30 transition-all flex flex-col justify-between space-y-4 group">
                                          <div className="space-y-2">
                                             <div className="flex justify-between items-center gap-2">
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight italic group-hover:text-red-400 transition-colors">
                                                   {isAr ? item.nameAr : item.name}
                                                </h4>
                                                <span className={`text-[9px] font-bold ${item.threatColor} uppercase tracking-widest font-mono shrink-0`}>
                                                   THREAT: {item.threat}
                                                </span>
                                             </div>
                                             <p className="text-xs text-slate-400 italic leading-relaxed">
                                                {isAr ? item.descAr : item.desc}
                                             </p>
                                          </div>
                                          
                                          <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 text-[10px] font-mono">
                                             <div className="flex flex-col">
                                                <span className="text-slate-500 font-bold uppercase">{isAr ? 'السند القانوني' : 'LEGAL ACT'}</span>
                                                <span className="text-slate-300 font-semibold">{isAr ? item.lawAr : item.law}</span>
                                             </div>
                                             <div className="flex flex-col items-start sm:items-end">
                                                <span className="text-slate-500 font-bold uppercase">{isAr ? 'الغرامة المقررة' : 'STATUTORY FINE'}</span>
                                                <span className="text-red-400 font-black text-sm">{isAr ? item.fineAr : item.fine}</span>
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>

                              </div>
                           )}

                        </motion.div>
                     </AnimatePresence>

                  </div>
               </div>

            </div>
         </section>
         </main>

         <PublicFooter lang={lang} />
      </div>
   );
}
