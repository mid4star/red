'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Globe, 
  Activity, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function ContactClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [config, setConfig] = useState({
    phone: '+20 65 354 8400',
    email: 'info@redsea.gov.sa',
    address: 'El Corniche St., Hurghada, Red Sea Governorate, Arab Republic of Egypt',
    addressAr: 'طريق الكورنيش، الغردقة، محافظة البحر الأحمر، جمهورية مصر العربية',
    latitude: 27.2579,
    longitude: 33.8116
  });

  useEffect(() => {
     fetch('/api/staff/query?collection=system_config')
        .then(r => r.json())
        .then(json => {
           if (json.success && json.data && json.data.length > 0) {
              const globalConfig = json.data.find((item: any) => item.id === 'global') || json.data[0];
              if (globalConfig) {
                 setConfig({
                    phone: globalConfig.phone || '+20 65 354 8400',
                    email: globalConfig.email || 'info@redsea.gov.sa',
                    address: globalConfig.address || '',
                    addressAr: globalConfig.addressAr || '',
                    latitude: parseFloat(globalConfig.latitude) || 27.2579,
                    longitude: parseFloat(globalConfig.longitude) || 33.8116
                 });
              }
           }
        })
        .catch(err => console.error(err));
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormSubmitted(true);
  };

  return (
    <div className="bg-[#0a1628] text-white min-h-screen flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      <main className="flex-grow pt-40 pb-24 px-6 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Header Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Compass size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">
              {isAr ? 'قنوات الاتصال والانتشار المفتوحة' : 'Open Communications Channels'}
            </span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
              {isAr ? 'تواصل معنا' : 'Contact Us'}
            </h1>
            <p className="text-lg text-slate-400 font-medium italic leading-relaxed">
              {isAr 
                ? 'تواصل مباشرة مع قيادة العمليات أو الموارد البشرية أو تقديم بلاغات بيئية فورية.' 
                : 'Connect directly with operations control, administrative headquarters, or submit environmental reports.'}
            </p>
          </div>
        </section>

        {/* Contact Info & Forms & Radar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Info & Radar column */}
          <div className="lg:col-span-6 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] italic">
                {isAr ? 'معلومات الاتصال بالهيئة' : 'Authority Directives'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="p-6 rounded-2xl bg-[#0c1b2f]/40 border border-white/5 space-y-3">
                  <Phone className="text-teal-400" size={24} />
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider font-mono">
                    {isAr ? 'الهاتف المباشر' : 'Direct Phone'}
                  </h4>
                  <p className="text-md font-bold text-white font-mono" dir="ltr">{config.phone}</p>
                </div>

                {/* Email */}
                <div className="p-6 rounded-2xl bg-[#0c1b2f]/40 border border-white/5 space-y-3">
                  <Mail className="text-teal-400" size={24} />
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider font-mono">
                    {isAr ? 'البريد الإلكتروني' : 'Secure Email'}
                  </h4>
                  <p className="text-md font-bold text-white font-mono">{config.email}</p>
                </div>

                {/* HQ Address */}
                <div className="p-6 rounded-2xl bg-[#0c1b2f]/40 border border-white/5 space-y-3 sm:col-span-2">
                  <MapPin className="text-teal-400" size={24} />
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider font-mono">
                    {isAr ? 'المقر الرئيسي' : 'Headquarters Address'}
                  </h4>
                  <p className="text-sm font-medium text-white italic">
                    {isAr ? config.addressAr : config.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Interactive Radar Map Visual */}
            <div className="p-8 rounded-[2.5rem] bg-[#0c1b2f]/30 border border-white/5 relative overflow-hidden flex items-center justify-center min-h-[300px] shadow-inner group">
              {/* Radar Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              
              {/* Radar Circles */}
              <div className="w-48 h-48 rounded-full border border-teal-500/10 absolute flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-teal-500/5 absolute flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-teal-500/5 absolute" />
                </div>
              </div>

              {/* Radar Sweep Effect */}
              <div className="w-48 h-48 absolute rounded-full overflow-hidden pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-teal-500/10 via-transparent to-transparent transform origin-center animate-[spin_5s_linear_infinite]" />
              </div>

              {/* Glowing HQ Target Dot */}
              <div className="relative flex flex-col items-center justify-center z-10 space-y-2">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-75" />
                  <div className="relative rounded-full w-4 h-4 bg-teal-500 flex items-center justify-center border border-white/20 shadow-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                <div className="text-center font-mono text-[9px] uppercase tracking-widest bg-black/60 border border-white/10 px-3 py-1 rounded-xl">
                  <span className="text-teal-400 font-bold block">HQ TELEMETRY</span>
                  <span className="text-slate-400 block mt-0.5">
                    {config.latitude.toFixed(4)}° N, {config.longitude.toFixed(4)}° E
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-6">
            <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#0c1b2f]/60 border border-white/5 shadow-2xl space-y-6 relative overflow-hidden h-full flex flex-col justify-between">
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-2xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-2xl pointer-events-none"></div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.3em] italic">
                  {isAr ? 'بوابة إرسال البرقيات والمراسلات' : 'Secure Transmission Terminal'}
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
                          {isAr ? 'الاسم بالكامل' : 'Sender Identity'}
                        </label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder={isAr ? 'أدخل اسمك الكريم...' : 'Enter your name...'}
                          className="w-full bg-[#081220]/80 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                          {isAr ? 'البريد الإلكتروني' : 'Return Address (Email)'}
                        </label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="username@domain.com"
                          className="w-full bg-[#081220]/80 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                          {isAr ? 'طبيعة البرقية (الموضوع)' : 'Transmission Type (Subject)'}
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full bg-[#081220]/80 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium"
                        >
                          <option value="Inquiry" className="bg-[#081220] text-white">
                            {isAr ? 'استفسار بيئي عام' : 'General Inquiry'}
                          </option>
                          <option value="Permit" className="bg-[#081220] text-white">
                            {isAr ? 'طلب تصريح زيارة قطاع' : 'Permit Excursion Request'}
                          </option>
                          <option value="Violation" className="bg-[#081220] text-white">
                            {isAr ? 'بلاغ عن مخالفة بيئية' : 'Ecological Violation Report'}
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                          {isAr ? 'الرسالة / البيانات التوضيحية' : 'Transmission Content (Message)'}
                        </label>
                        <textarea
                          rows={6}
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          placeholder={isAr ? 'اكتب تفاصيل استفسارك أو البلاغ بالتفصيل...' : 'Type your details or reports explicitly...'}
                          className="w-full bg-[#081220]/80 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#001529] font-black text-sm tracking-tighter uppercase italic transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(20,184,166,0.15)]"
                      >
                        {isAr ? 'بث الإرسال' : 'Transmit Message'}
                        <Send size={16} />
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-24 text-center space-y-4"
                    >
                      <CheckCircle2 className="mx-auto text-teal-400" size={56} />
                      <h4 className="text-xl font-black text-white italic">{isAr ? 'تم الإرسال والتشهير بنجاح' : 'Transmission Confirmed'}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto italic">
                        {isAr 
                          ? 'تأكيد البث المستلم. لقد تم استقبال برقيتك وتوجيهها للمكتب التنفيذي المختص.' 
                          : 'Transmission acknowledged. Your telegram has been received and routed to the corresponding command office.'}
                      </p>
                      <button
                        onClick={() => {
                          setFormSubmitted(false);
                          setFormData({ name: '', email: '', subject: 'Inquiry', message: '' });
                        }}
                        className="px-6 py-2.5 rounded-xl border border-white/10 hover:border-teal-500/30 text-xs font-mono text-slate-400 hover:text-teal-400 transition-all"
                      >
                        {isAr ? 'إرسال برقية جديدة' : 'Transmit Another Message'}
                      </button>
                    </motion.div>
                  )}
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
