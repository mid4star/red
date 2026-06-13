'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, MapPin, ChevronRight, Fingerprint, Activity, Zap, Sun, Moon, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/layout/ThemeProvider';

// Fallback while loading
const FALLBACK_RESERVES = [
  { id: 'northern-islands', en: 'Northern Islands', ar: 'محمية الجزر الشمالية' }
];

export default function LoginPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reserves, setReserves] = useState<{id: string, en: string, ar: string}[]>(FALLBACK_RESERVES);
  const [selectedReserve, setSelectedReserve] = useState(FALLBACK_RESERVES[0].id);

  React.useEffect(() => {
    fetch('/api/staff/query?collection=reserves')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          const loadedReserves = data.data.map((r: any) => ({
            id: r.id,
            en: r.name,
            ar: r.nameAr
          }));
          setReserves(loadedReserves);
          setSelectedReserve(loadedReserves[0].id);
        }
      })
      .catch(err => console.error("Failed to fetch reserves", err));
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter Email and Password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isAr ? 'بيانات الاعتماد غير صالحة' : 'Invalid credentials'));
      }

      // Successful login
      const reserveInfo = reserves.find(r => r.id === selectedReserve) || reserves[0];
      const sessionData = {
        ...data.user,
        reserveId: selectedReserve,
        reserve: reserveInfo?.en,
        reserveAr: reserveInfo?.ar,
      };

      localStorage.setItem('active_user_session', JSON.stringify(sessionData));
      window.dispatchEvent(new Event('user-session-changed'));
      
      router.push(`/${params.lang}/staff`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isAr ? 'حدث خطأ أثناء الاتصال بالخادم' : 'Failed to connect to authentication server'));
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050b14] flex items-center justify-center relative overflow-hidden transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Controls */}
      <div className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'} z-[100] flex gap-3 items-center`}>
        <Link
          href={`/${params.lang}`}
          className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 dark:bg-white/5 dark:border-white/10 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-white/10 transition-all cursor-pointer no-underline"
          title={isAr ? 'العودة للرئيسية' : 'Back to Home'}
        >
          <Home size={20} />
        </Link>
        <button
          onClick={toggleTheme}
          className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 dark:bg-white/5 dark:border-white/10 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 dark:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all cursor-pointer"
          title={isAr ? 'تغيير المظهر' : 'Toggle Theme'}
          aria-label="Toggle Theme"
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-500" />}
        </button>
      </div>

      {/* Background HUD & Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] dark:opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(45,212,191,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
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
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-500/20 flex items-center justify-center border border-teal-200 dark:border-teal-500/30 shadow-[0_0_30px_rgba(45,212,191,0.1)] dark:shadow-[0_0_30px_rgba(45,212,191,0.2)]">
              <Shield className="text-teal-600 dark:text-teal-400" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic">
                Red Sea Reserves
              </h2>
              <p className="text-xs font-bold text-teal-600 dark:text-teal-500 uppercase tracking-widest">
                Strategic Intelligence Hub
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1]">
              {isAr ? 'نظام التحكم المركزي' : 'Central Command System'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg max-w-md leading-relaxed">
              {isAr 
                ? 'قم بالولوج إلى لوحة المراقبة وإدارة البيانات لتوثيق وتحليل المهام الميدانية في المحميات.' 
                : 'Access the monitoring dashboard and data management system to document and analyze field missions across all reserves.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none backdrop-blur-sm">
               <Activity className="text-teal-600 dark:text-teal-500 mb-3" size={24} />
               <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{isAr ? 'رصد البيانات' : 'Data Logging'}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">{isAr ? 'توثيق المعلومات الميدانية' : 'Field intelligence records'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none backdrop-blur-sm">
               <Zap className="text-indigo-500 dark:text-indigo-400 mb-3" size={24} />
               <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{isAr ? 'إدارة الدوريات' : 'Patrol Control'}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">{isAr ? 'تتبع وتحليل مسارات المهام' : 'Track & analyze missions'}</p>
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
          <div className="bg-white dark:bg-[#0d1b2a]/95 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden transition-colors duration-300">
            
            {/* Top decorative elements */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0 opacity-50" />
            <div className="absolute top-10 right-10 opacity-[0.03] dark:opacity-5 pointer-events-none">
              <Fingerprint size={120} />
            </div>

            <div className="mb-8 relative z-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                {isAr ? 'تسجيل الدخول' : 'Authentication'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {isAr ? 'يرجى إدخال بيانات الاعتماد المعتمدة للوصول للنظام' : 'Enter your authorized credentials to access the system.'}
              </p>
            </div>

            <form className="space-y-5 relative z-10" onSubmit={handleLogin}>
              {/* Error Box */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3 backdrop-blur-md"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors`}>
                    <User size={18} />
                  </div>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAr ? 'user@rsmp-eg.com' : 'user@rsmp-eg.com'}
                    className={`w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all disabled:opacity-50`}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {isAr ? 'كلمة المرور' : 'Access Code'}
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors`}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    disabled={loading}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all disabled:opacity-50`}
                  />
                </div>
              </div>

              {/* Reserve Location */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {isAr ? 'موقع التعيين' : 'Assigned Reserve'}
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors`}>
                    <MapPin size={18} />
                  </div>
                  <select 
                    value={selectedReserve}
                    disabled={loading}
                    onChange={(e) => setSelectedReserve(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-slate-900 dark:text-white appearance-none focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all cursor-pointer disabled:opacity-50`}
                  >
                    {reserves.map(res => (
                      <option key={res.id} value={res.id} className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">
                        {isAr ? res.ar : res.en}
                      </option>
                    ))}
                  </select>
                  {/* Custom Arrow */}
                  <div className={`absolute inset-y-0 ${isAr ? 'left-4' : 'right-4'} flex items-center pointer-events-none`}>
                     <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-400 dark:border-t-slate-500"></div>
                  </div>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end pt-1">
                <a href="#" className="text-xs font-bold text-teal-500 hover:text-teal-400 transition-colors">
                  {isAr ? 'هل نسيت رمز الدخول؟' : 'Forgot Access Code?'}
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-2xl p-[1px] disabled:opacity-50 cursor-pointer block"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white dark:bg-[#0a1628] rounded-2xl py-4 px-8 flex items-center justify-center gap-3 transition-all group-hover:bg-opacity-0 group-hover:text-white">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-white transition-colors">
                          {isAr ? 'تأكيد الولوج' : 'Authorize Protocol'}
                        </span>
                        <ChevronRight size={18} className={`text-slate-900 dark:text-white group-hover:text-white transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>



            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/10 text-center relative z-10">
               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">
                 {isAr ? 'نظام تحكم الإدارة البيئية • v2.0' : 'Environmental Management Control • v2.0'}
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
