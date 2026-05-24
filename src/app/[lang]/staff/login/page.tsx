'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, MapPin, ChevronRight, Fingerprint, Activity, Zap } from 'lucide-react';
import Link from 'next/link';

const RESERVES = [
  { id: 'northern-islands', en: 'Northern Islands', ar: 'محمية الجزر الشمالية' },
  { id: 'wadi-el-gemal', en: 'Wadi El Gemal', ar: 'محمية وادي الجمال' },
  { id: 'gebel-elba', en: 'Gebel Elba', ar: 'محمية جبل علبة' },
  { id: 'coral-reef', en: 'Coral Reef Protectorate', ar: 'محمية الحيد المرجاني' },
];

export default function LoginPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedReserve, setSelectedReserve] = useState(RESERVES[0].id);

  return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Background HUD & Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(45,212,191,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 px-6 py-12 relative">
        
        {/* Left Side: Branding / Context */}
        <motion.div 
          initial={{ opacity: 0, x: isAr ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex flex-col justify-center space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 shadow-[0_0_30px_rgba(45,212,191,0.2)]">
              <Shield className="text-teal-400" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-[0.2em] uppercase italic">
                Red Sea Reserves
              </h2>
              <p className="text-xs font-bold text-teal-500 uppercase tracking-widest">
                Strategic Intelligence Hub
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-black text-white tracking-tighter leading-[1.1]">
              {isAr ? 'نظام التحكم المركزي' : 'Central Command System'}
            </h1>
            <p className="text-slate-400 font-medium text-lg max-w-md leading-relaxed">
              {isAr 
                ? 'قم بالولوج إلى لوحة المراقبة وإدارة البيانات لتوثيق وتحليل المهام الميدانية في المحميات.' 
                : 'Access the monitoring dashboard and data management system to document and analyze field missions across all reserves.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
               <Activity className="text-teal-500 mb-3" size={24} />
               <p className="text-sm font-bold text-white mb-1">{isAr ? 'رصد البيانات' : 'Data Logging'}</p>
               <p className="text-xs text-slate-400">{isAr ? 'توثيق المعلومات الميدانية' : 'Field intelligence records'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
               <Zap className="text-indigo-400 mb-3" size={24} />
               <p className="text-sm font-bold text-white mb-1">{isAr ? 'إدارة الدوريات' : 'Patrol Control'}</p>
               <p className="text-xs text-slate-400">{isAr ? 'تتبع وتحليل مسارات المهام' : 'Track & analyze missions'}</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[480px] mx-auto"
        >
          <div className="bg-[#0a1628]/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Top decorative elements */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0 opacity-50" />
            <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
              <Fingerprint size={120} />
            </div>

            <div className="mb-10 relative z-10">
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2">
                {isAr ? 'تسجيل الدخول' : 'Authentication'}
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                {isAr ? 'يرجى إدخال بيانات الاعتماد المعتمدة للوصول للنظام' : 'Enter your authorized credentials to access the system.'}
              </p>
            </div>

            <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
              
              {/* Employee ID */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {isAr ? 'رقم الموظف' : 'Operator ID'}
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors`}>
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder={isAr ? 'أدخل رقم هويتك الوظيفية' : 'Enter your staff ID'}
                    className={`w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {isAr ? 'كلمة المرور' : 'Access Code'}
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors`}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all`}
                  />
                </div>
              </div>

              {/* Reserve Location */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {isAr ? 'موقع التعيين' : 'Assigned Reserve'}
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors`}>
                    <MapPin size={18} />
                  </div>
                  <select 
                    value={selectedReserve}
                    onChange={(e) => setSelectedReserve(e.target.value)}
                    className={`w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-white appearance-none focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all cursor-pointer`}
                  >
                    {RESERVES.map(res => (
                      <option key={res.id} value={res.id} className="bg-[#0a1628] text-white">
                        {isAr ? res.ar : res.en}
                      </option>
                    ))}
                  </select>
                  {/* Custom Arrow */}
                  <div className={`absolute inset-y-0 ${isAr ? 'left-4' : 'right-4'} flex items-center pointer-events-none`}>
                     <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-500"></div>
                  </div>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end pt-2">
                <a href="#" className="text-xs font-bold text-teal-500 hover:text-teal-400 transition-colors">
                  {isAr ? 'هل نسيت رمز الدخول؟' : 'Forgot Access Code?'}
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Link href={`/${params.lang}/staff`} className="block w-full">
                  <button className="w-full relative group overflow-hidden rounded-2xl p-[1px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-[#0a1628] rounded-2xl py-4 px-8 flex items-center justify-center gap-3 transition-all group-hover:bg-opacity-0">
                      <span className="text-sm font-black uppercase tracking-widest text-white">
                        {isAr ? 'تأكيد الولوج' : 'Authorize Protocol'}
                      </span>
                      <ChevronRight size={18} className={`text-white transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </div>
                  </button>
                </Link>
              </div>

            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                 {isAr ? 'نظام تحكم الإدارة البيئية • v2.0' : 'Environmental Management Control • v2.0'}
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
