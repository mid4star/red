'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Compass, 
  Map, 
  Activity, 
  Users, 
  Target, 
  Eye, 
  TrendingUp,
  Award
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function AboutClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';

  // Support scrolling to hash on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const objectives = [
    {
      icon: Shield,
      title: isAr ? 'حماية التنوع البيولوجي' : 'Biodiversity Preservation',
      desc: isAr 
        ? 'إنشاء مناطق حماية صارمة لمنع الصيد الجائر وتدمير الموائل الحيوية كالشعاب المرجانية وأشجار المانجروف.' 
        : 'Establishing strict protection zones to prevent overfishing and protect critical habitats like coral reefs and mangroves.',
    },
    {
      icon: Compass,
      title: isAr ? 'السياحة المستدامة' : 'Sustainable Ecotourism',
      desc: isAr 
        ? 'تنظيم أنشطة الغوص والرحلات البحرية لضمان عدم إلحاق الضرر بالبيئة البحرية الفريدة.' 
        : 'Regulating diving and vessel excursions to ensure zero impact on the fragile marine wilderness.',
    },
    {
      icon: Map,
      title: isAr ? 'نظم خرائط المحميات' : 'GIS & Mapping Systems',
      desc: isAr 
        ? 'استخدام تكنولوجيا الاستشعار عن بعد ونظم المعلومات الجغرافية لمراقبة جودة المياه وتتبع الكائنات البحرية.' 
        : 'Utilizing geographic data and GIS maps to monitor water quality and trace migratory species.',
    },
    {
      icon: Activity,
      title: isAr ? 'الاستجابة السريعة للمخالفات' : 'Rapid Patrol Operations',
      desc: isAr 
        ? 'إرسال دوريات بحرية مجهزة لفرض القوانين البيئية والتعامل مع حوادث التلوث أو الشحط فوراً.' 
        : 'Deploying state-of-the-art patrol vessels to enforce environmental laws and respond to oil spills or groundings.',
    }
  ];

  const departments = [
    {
      name: isAr ? 'مجلس الإدارة والقيادة العليا' : 'Executive Board & Directorate',
      role: isAr ? 'رسم السياسات العامة وإقرار الخطط الاستراتيجية للهيئة بالتنسيق مع الجهات الوزارية.' : 'Formulating policies and strategic directions in coordination with ministerial stakeholders.',
      color: 'from-teal-500 to-emerald-500'
    },
    {
      name: isAr ? 'إدارة العمليات والدوريات البحرية' : 'Operations & Patrols Command',
      role: isAr ? 'تنفيذ الدوريات الميدانية على مدار الساعة، وإدارة أسطول السفن، وفرض القوانين وملاحقة المخالفين.' : 'Executing 24/7 patrol tasks, fleet management, and enforcement of ecological mandates.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: isAr ? 'إدارة نظم المعلومات الجغرافية (GIS)' : 'GIS Mapping & Spatial Data',
      role: isAr ? 'معالجة البيانات الجغرافية، والخرائط ثلاثية الأبعاد، وتصور الحالة البيئية للمحميات.' : 'Processing geographic data, 3D mapping, and visualization of environmental statuses.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: isAr ? 'إدارة تقييم الأثر البيئي (EIA)' : 'Environmental Impact Assessment',
      role: isAr ? 'مراجعة وتفتيش المشاريع الساحلية والاستثمارية، والتحقق من التزام المنشآت بالحدود البيئية.' : 'Reviewing coastal development permits and conducting regular inspections for compliance.',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: isAr ? 'إدارة البحث العلمي وحماية الأنواع' : 'Scientific Research & Ecology',
      role: isAr ? 'إجراء المسوحات الدورية للشعاب والأنواع البحرية، ودراسة حالات الجنوح ووضع برامج الإكثار.' : 'Conducting biological surveys, studying stranding cases, and designing preservation programs.',
      color: 'from-cyan-500 to-teal-500'
    }
  ];

  return (
    <div className="bg-[#0a1628] text-white min-h-screen flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      <main className="flex-grow pt-40 pb-24 px-6 max-w-7xl mx-auto w-full space-y-32">
        
        {/* ── MISSION SECTION ──────────────────────────────────────────────── */}
        <section id="mission" className="space-y-12 scroll-mt-32">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Target size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">
              {isAr ? 'رؤيتنا ورسالتنا الاستراتيجية' : 'Strategic Vision & Mission'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
                {isAr ? 'الأهداف والاستراتيجية' : 'Mission & Strategy'}
              </h1>
              <p className="text-xl text-slate-400 font-medium italic leading-relaxed">
                {isAr 
                  ? 'نهدف إلى تحقيق التوازن الأمثل بين التنمية المستدامة والمحافظة الصارمة على بيئة البحر الأحمر الفريدة التي تعد كنزاً وطنياً للأجيال القادمة.' 
                  : 'We aim to establish the optimal equilibrium between sustainable development and the strict preservation of the unique Red Sea ecosystem.'}
              </p>
              <div className="p-8 rounded-[2rem] bg-[#0c1b2f]/50 border border-white/5 space-y-4">
                <h4 className="text-lg font-black text-teal-400 uppercase italic">
                  {isAr ? 'الرسالة السامية' : 'Our Solemn Vow'}
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  {isAr 
                    ? 'كحراس مكلفين بالسيادة على الموارد الطبيعية، نلتزم بمكافحة التهديدات البيئية، وتعزيز البحث العلمي، والمشاركة المجتمعية الفعالة لحماية محمياتنا البحرية.' 
                    : 'As designated stewards of natural heritage, we pledge to combat ecological threats, promote scientific inquiry, and foster public awareness to safeguard our marine sanctuaries.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {objectives.map((obj, i) => {
                const Icon = obj.icon;
                return (
                  <div key={i} className="p-6 rounded-2xl bg-[#0c1b2f]/30 border border-white/5 space-y-4 hover:border-teal-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-teal-400 transition-colors">{obj.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed italic">{obj.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── STRUCTURE SECTION ────────────────────────────────────────────── */}
        <section id="structure" className="space-y-12 scroll-mt-32">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">
              {isAr ? 'الهيكل التنظيمي للمركز' : 'Administrative Structure'}
            </span>
          </div>

          <div className="space-y-12">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                {isAr ? 'الهيكل الإداري والفني' : 'Management Structure'}
              </h2>
              <p className="text-base text-slate-400 font-medium italic">
                {isAr 
                  ? 'يتكون الهيكل التنظيمي لهيئتنا من إدارات فنية متخصصة تعمل بتناغم تام لتحقيق أهداف الرصد والحماية والامتثال البيئي.' 
                  : 'The Authority operates through structured technical divisions, seamlessly integrated to deliver monitoring, protection, and legal compliance.'}
              </p>
            </div>

            {/* Visual Org Map Layout */}
            <div className="space-y-8 max-w-4xl mx-auto relative pl-4 md:pl-0">
              {/* Connecting Vertical Line */}
              <div className="absolute top-4 bottom-4 left-6 md:left-1/2 w-0.5 bg-gradient-to-b from-teal-500/20 via-blue-500/20 to-teal-500/20 transform md:-translate-x-1/2" />

              {departments.map((dept, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex flex-col md:flex-row items-start md:items-center relative ${isEven ? 'md:justify-start' : 'md:justify-end'}`}
                  >
                    {/* Bullet Point */}
                    <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-teal-500 transform -translate-x-1.5 md:-translate-x-2 z-10" />

                    <div className={`w-full md:w-[45%] p-6 rounded-[2rem] bg-[#0c1b2f]/60 border border-white/5 hover:border-teal-500/20 transition-all ml-12 md:ml-0 ${isEven ? 'md:mr-8' : 'md:ml-8'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${dept.color}`} />
                        <h4 className="text-md font-black text-white">{dept.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic">{dept.role}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
