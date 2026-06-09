'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Send, 
  FileCheck, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function CareersClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [selectedJob, setSelectedJob] = useState<string>('Marine Patrol Ranger');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const jobs = [
    {
      id: 'job_01',
      title: 'Marine Patrol Ranger',
      titleAr: 'مراقب دوريات وحارس محمية',
      dept: 'Operations & Fleet Command',
      deptAr: 'إدارة العمليات والدوريات',
      loc: 'Wadi El Gemal Sector',
      locAr: 'قطاع محمية وادي الجمال',
      type: 'Full-time',
      typeAr: 'دوام كامل',
      desc: 'Conduct marine patrols, check vessel permits, enforce eco rules, and report marine stranding or violations in the reserve area.',
      descAr: 'القيام بالدوريات البحرية اليومية، وتفتيش تراخيص السفن، وفرض القوانين البيئية، ورصد وتوثيق المخالفات أو حالات جنوح الكائنات البحرية.'
    },
    {
      id: 'job_02',
      title: 'Marine Conservation Biologist',
      titleAr: 'باحث بيولوجي لحماية الحياة البحرية',
      dept: 'Scientific Research Division',
      deptAr: 'إدارة البحث العلمي وحماية الأنواع',
      loc: 'Northern Islands Sector',
      locAr: 'قطاع الجزر الشمالية',
      type: 'Full-time',
      typeAr: 'دوام كامل',
      desc: 'Lead underwater coral surveys, monitor seagrass beds health, study dugong foraging patterns, and author official preservation reports.',
      descAr: 'قيادة مسوحات الشعاب المرجانية تحت الماء، ومراقبة صحة مراعي أعشاب البحر، ودراسة سلوكيات تغذية الأطوم وسلاحف البحر وصياغة تقارير الحماية.'
    },
    {
      id: 'job_03',
      title: 'GIS Spatial Data Analyst',
      titleAr: 'محلل خرائط وبيانات جغرافية (GIS)',
      dept: 'GIS Mapping & Spatial Data',
      deptAr: 'إدارة نظم المعلومات الجغرافية والخرائط',
      loc: 'Hurghada HQ',
      locAr: 'المقر الرئيسي بالغردقة',
      type: 'Full-time',
      typeAr: 'دوام كامل',
      desc: 'Process geographic map data, assist in reserve zone mapping, and maintain spatial database records.',
      descAr: 'معالجة البيانات الجغرافية للمحميات، وتحديث الخرائط الرقمية التفاعلية وقواعد البيانات المكانية.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;
    setFormSubmitted(true);
  };

  return (
    <div className="bg-th-bg text-th-text min-h-screen flex flex-col transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      <main className="flex-grow pt-40 pb-24 px-6 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Header Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">
              {isAr ? 'انضم لحماة كنوز البحر الأحمر' : 'Join the Guardians of the Red Sea'}
            </span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
              {isAr ? 'الفرص الوظيفية' : 'Career Opportunities'}
            </h1>
            <p className="text-lg text-slate-400 font-medium italic leading-relaxed">
              {isAr 
                ? 'ابحث عن مكانك معنا وساهم بمهاراتك في إدارة وحماية أكثر النظم البيئية المائية تنوعاً وثراءً في العالم.' 
                : 'Discover your role with us and apply your skills to manage and preserve one of the most biodiverse marine ecosystems globally.'}
            </p>
          </div>
        </section>

        {/* Vacancies & Application form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Active Jobs List */}
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] italic mb-6">
              {isAr ? 'الوظائف الشاغرة الحالية' : 'Active Vacancies'}
            </h3>

            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-8 rounded-[2rem] bg-[#0c1b2f]/40 border border-white/5 hover:border-teal-500/20 transition-all flex flex-col justify-between space-y-6 shadow-xl relative"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[9px] font-black text-teal-400 uppercase tracking-widest italic">
                      {isAr ? job.deptAr : job.dept}
                    </span>
                    
                    <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                      {isAr ? job.typeAr : job.type}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white leading-tight italic">
                    {isAr ? job.titleAr : job.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed italic">
                    {isAr ? job.descAr : job.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>{isAr ? job.locAr : job.loc}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedJob(job.title);
                      // Scroll to form on mobile
                      const formElement = document.getElementById('apply-form');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="text-xs font-black uppercase tracking-wider italic text-teal-400 flex items-center gap-1 hover:translate-x-1 transition-transform"
                  >
                    {isAr ? 'تقديم طلب توظيف' : 'Apply For Role'}
                    <span className={`inline-block ${isAr ? 'rotate-180' : ''}`}>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div id="apply-form" className="lg:col-span-5 scroll-mt-32">
            <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#0c1b2f]/60 border border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-2xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-2xl pointer-events-none"></div>

              <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.3em] italic">
                {isAr ? 'طلب الانضمام للمحميات' : 'Join Our Team Application'}
              </h3>

              <AnimatePresence mode="wait">
                {!formSubmitted ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-5"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                        {isAr ? 'الاسم بالكامل' : 'Full Name'}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder={isAr ? 'أدخل اسمك الكامل...' : 'Enter your full name...'}
                        className="w-full bg-[#081220]/80 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                        {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder={isAr ? 'username@domain.com' : 'username@domain.com'}
                        className="w-full bg-[#081220]/80 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                        {isAr ? 'رقم الهاتف المباشر' : 'Direct Phone Number'}
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder={isAr ? '+20 123 4567 890' : '+20 123 4567 890'}
                        className="w-full bg-[#081220]/80 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                        {isAr ? 'الوظيفة المستهدفة' : 'Targeted Vacancy'}
                      </label>
                      <select
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                        className="w-full bg-[#081220]/80 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium"
                      >
                        {jobs.map((j) => (
                          <option key={j.id} value={j.title} className="bg-[#081220] text-white">
                            {isAr ? j.titleAr : j.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                        {isAr ? 'رسالة الدوافع (نبذة مختصرة)' : 'Cover Letter / Statement'}
                      </label>
                      <textarea
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder={isAr ? 'اكتب باختصار سبب رغبتك بالانضمام للمحميات...' : 'Describe why you want to join the marine protectorate team...'}
                        className="w-full bg-[#081220]/80 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium resize-none"
                      />
                    </div>

                    {/* Resume Upload dummy field */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                        {isAr ? 'السيرة الذاتية (PDF)' : 'CV Document (PDF)'}
                      </label>
                      <div className="p-4 rounded-xl border border-dashed border-white/10 bg-[#081220]/30 flex items-center justify-center text-center cursor-pointer hover:border-teal-500/30 transition-all">
                        <span className="text-xs text-slate-500 italic">{isAr ? 'اضغط لاختيار ملف السيرة الذاتية...' : 'Click to select CV document...'}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#001529] font-black text-sm tracking-tighter uppercase italic transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(20,184,166,0.15)]"
                    >
                      {isAr ? 'إرسال طلب التوظيف' : 'Submit Application'}
                      <Send size={16} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 text-center space-y-4"
                  >
                    <CheckCircle2 className="mx-auto text-teal-400" size={56} />
                    <h4 className="text-xl font-black text-white italic">{isAr ? 'تم إرسال طلبك بنجاح' : 'Submission Completed'}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto italic">
                      {isAr 
                        ? 'شكراً لاهتمامك بالانضمام إلينا. سيقوم فريق الموارد البشرية بمراجعة ملفك والتواصل معك قريباً.' 
                        : 'Thank you for your interest. Our HR department will review your application and correspond shortly.'}
                    </p>
                    <button
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', notes: '' });
                      }}
                      className="px-6 py-2.5 rounded-xl border border-white/10 hover:border-teal-500/30 text-xs font-mono text-slate-400 hover:text-teal-400 transition-all"
                    >
                      {isAr ? 'تقديم طلب آخر' : 'Submit Another File'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </section>

      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
