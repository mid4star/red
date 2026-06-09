'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Anchor, 
  Eye, 
  Scale, 
  Activity, 
  Compass, 
  Info,
  LifeBuoy
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function RegulationsClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState('general');

  const categories = [
    { id: 'general', label: isAr ? 'لوائح البيئة العامة' : 'General Ecology', icon: Scale },
    { id: 'vessels', label: isAr ? 'شروط الملاحة والسفن' : 'Vessel Conduct', icon: Anchor },
    { id: 'diving', label: isAr ? 'تعليمات الغوص والأنشطة' : 'Diving & Excursions', icon: LifeBuoy },
  ];

  const regulationsData: Record<string, { code: string; title: string; titleAr: string; desc: string; descAr: string; penalty: string; penaltyAr: string }[]> = {
    general: [
      {
        code: 'LAW-4/1994',
        title: 'Protection of Marine Biodiversity',
        titleAr: 'قانون حماية التنوع البيولوجي المائي',
        desc: 'Strictly prohibits harvesting, damaging, or selling corals, sea shells, and any protected marine species inside the maritime boundaries of the reserves.',
        descAr: 'يحظر تماماً صيد أو حيازة أو بيع الشعاب المرجانية، الأصداف البحرية، والكائنات المحمية قانوناً داخل النطاق الجغرافي للمحميات.',
        penalty: 'Fine up to $50,000 and confiscation of vessel equipment.',
        penaltyAr: 'غرامة تصل إلى 50,000 دولار مع مصادرة القارب ومعدات الصيد المستخدمة.'
      },
      {
        code: 'DEC-102/1983',
        title: 'Waste Dumping & Pollution Prohibition',
        titleAr: 'حظر إلقاء المخلفات والتلوث البترولي',
        desc: 'Prohibits the discharge of oil, toxic chemicals, wastewater, or solid waste (including single-use plastics) into reserve waters.',
        descAr: 'يُمنع منعاً باتاً تصريف الزيوت، المواد الكيميائية السامة، مياه الصرف غير المعالجة، أو النفايات الصلبة والبلاستيكية داخل المياه الإقليمية للمحميات.',
        penalty: 'Mandatory vessel detention, clean-up restitution costs, and legal prosecution.',
        penaltyAr: 'احتجاز فوري للسفينة، تحمل تكاليف إزالة التلوث، وإحالة القضية للنيابة العامة.'
      }
    ],
    vessels: [
      {
        code: 'SPD-REG-12',
        title: 'Vessel Speed Constraints',
        titleAr: 'قيود سرعات القوارب والسفن',
        desc: 'Limits speed to 10 knots in shallow lagoons and 5 knots in core reserves and dolphin sanctuary habitats (such as Samadai House).',
        descAr: 'تُقيد سرعة القوارب بحد أقصى 10 عقد في البحيرات الضحلة و5 عقد في مناطق المحمية الحرجة ومساكن الدلافين (مثل بيت الدلافين في صمداي).',
        penalty: 'Yacht permit suspension for 3 months and financial fine.',
        penaltyAr: 'إيقاف ترخيص الإبحار لليخت لمدة 3 أشهر وغرامة مالية.'
      },
      {
        code: 'ANC-REG-03',
        title: 'Mooring & Anchoring Protocols',
        titleAr: 'بروتوكولات الرسو وإلقاء المخطاف',
        desc: 'Drops of anchors on live coral structures are strictly prohibited. Vessels must hook only to designated orange environmental mooring buoys.',
        descAr: 'يحظر إلقاء المخطاف (المرساة) على الشعاب المرجانية الحية. يجب على السفن الرسو فقط باستخدام الشمندورات البرتقالية البيئية المعتمدة.',
        penalty: 'Direct fine of $5,000 per damaged square meter of coral.',
        penaltyAr: 'غرامة مباشرة بقيمة 5,000 دولار عن كل متر مربع متضرر من المرجان.'
      }
    ],
    diving: [
      {
        code: 'DIV-PRO-01',
        title: 'Zero-Contact Dive Mandate',
        titleAr: 'بروتوكول الغوص منعدم الأثر البيئي',
        desc: 'Divers must maintain a minimum distance of 2 meters from reefs, turtles, and dugongs. Wearing gloves is prohibited without special scientific research licenses.',
        descAr: 'يجب على الغواصين الحفاظ على مسافة لا تقل عن مترين من المرجان، السلاحف، والأطوم. يمنع ارتداء القفازات بدون تصريح بحث علمي موثق.',
        penalty: 'Suspension of the dive guide license and blacklisting of the diver.',
        penaltyAr: 'إيقاف رخصة مرشد الغوص المسؤول وإدراج الغواص المخالف في القائمة السوداء.'
      },
      {
        code: 'EQP-REG-05',
        title: 'Mandatory Safety & Eco Gear',
        titleAr: 'معدات السلامة والمعدات البيئية الإلزامية',
        desc: 'All active divers must carry an SMB (Surface Marker Buoy) and a dive computer. Only reef-safe, biodegradable sunscreens are allowed onboard.',
        descAr: 'يلتزم كل غواص بحمل عوامة الإشارة السطحية (SMB) وكمبيوتر الغوص. يسمح فقط باستخدام واقيات الشمس القابلة للتحلل الحيوي والآمنة للشعاب.',
        penalty: 'Warning on first offense; subsequent suspension of operating center permit.',
        penaltyAr: 'إنذار للمركز في المرة الأولى، يليه إيقاف ترخيص مركز الغوص في حال التكرار.'
      }
    ]
  };

  return (
    <div className="bg-th-bg text-th-text min-h-screen flex flex-col transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      <main className="flex-grow pt-40 pb-24 px-6 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Header Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Scale size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">
              {isAr ? 'الامتثال القانوني والإنفاذ البيئي' : 'Legal Compliance & Enforcement'}
            </span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
              {isAr ? 'القوانين واللوائح' : 'Laws & Regulations'}
            </h1>
            <p className="text-lg text-slate-400 font-medium italic leading-relaxed">
              {isAr 
                ? 'الدليل القانوني الرسمي واللوائح الملزمة لجميع الزوار والقوارب ومراكز الغوص العاملة في إقليم المحميات.' 
                : 'The official legal guidelines and binding mandates for all visitors, vessels, and diving operations within the protected sectors.'}
            </p>
          </div>
        </section>

        {/* Categories Tabs */}
        <section className="flex flex-wrap gap-4 border-b border-white/5 pb-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border font-mono ${
                  isActive 
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.08)]' 
                    : 'bg-[#081220]/40 text-slate-400 border-white/5 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </section>

        {/* Regulations Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {regulationsData[activeTab].map((reg, i) => (
              <motion.div
                key={reg.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-[#0c1b2f]/40 border border-white/5 hover:border-teal-500/20 transition-all flex flex-col justify-between space-y-8 relative overflow-hidden shadow-xl"
              >
                {/* Visual Corner Bracket */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10 rounded-tr-[2.5rem]" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-400 tracking-wider">
                      {reg.code}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-orange-400 uppercase tracking-widest italic bg-orange-500/10 border border-orange-500/25 px-3 py-1 rounded-xl">
                      <ShieldAlert size={12} />
                      <span>{isAr ? 'عقوبات صارمة' : 'Mandatory Enforced'}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white hover:text-teal-400 transition-colors leading-tight italic">
                    {isAr ? reg.titleAr : reg.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm leading-relaxed italic">
                    {isAr ? reg.descAr : reg.desc}
                  </p>
                </div>

                {/* Fine / Penalty Panel */}
                <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/15 space-y-2">
                  <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Scale size={12} />
                    {isAr ? 'العقوبة القانونية المقررة' : 'Legal Penalty Mandate'}
                  </h4>
                  <p className="text-xs text-orange-200/90 leading-relaxed font-medium italic">
                    {isAr ? reg.penaltyAr : reg.penalty}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
