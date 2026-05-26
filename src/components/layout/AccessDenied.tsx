'use client';

import React from 'react';
import { Lock, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface AccessDeniedProps {
  lang: string;
  sectionNameEn: string;
  sectionNameAr: string;
}

export function AccessDenied({ lang, sectionNameEn, sectionNameAr }: AccessDeniedProps) {
  const isArabic = lang === 'ar';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-lg">
        {/* Decorative Glow */}
        <div className="absolute inset-0 bg-rose-500/10 rounded-[2.5rem] blur-3xl pointer-events-none" />
        
        {/* Main Card */}
        <div className="bg-[#0a1628]/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] text-center space-y-6 relative overflow-hidden">
          {/* Top Decorative Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500/0 via-rose-500 to-rose-500/0 opacity-50" />
          
          {/* Lock Icon Wrapper */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-xl relative animate-pulse-slow">
              <Lock size={36} />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-400">
              <ShieldAlert size={12} />
              <span>{isArabic ? 'وصول مقيد' : 'Restricted Protocol'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              {isArabic ? 'غير مصرح لك بدخول هذا القسم' : 'Unauthorized Access'}
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
              {isArabic 
                ? `عذراً، لا تمتلك الصلاحيات الكافية للوصول إلى قسم (${sectionNameAr}). يرجى مراجعة مدير النظام لتعديل صلاحيات حسابك.`
                : `You do not have the required credentials to access the (${sectionNameEn}) module. Please contact the administrator to request access.`
              }
            </p>
          </div>

          {/* Button to Dashboard */}
          <div className="pt-4 space-y-3">
            <Link href={`/${lang}/staff`} className="inline-block w-full">
              <button className="relative group overflow-hidden rounded-xl p-[1px] w-full max-w-xs mx-auto block">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-[#0a1628] rounded-xl py-3 px-6 flex items-center justify-center gap-2 transition-all group-hover:bg-opacity-0">
                  {isArabic ? <ArrowRight size={16} className="text-white" /> : <ArrowLeft size={16} className="text-white" />}
                  <span className="text-xs font-black uppercase tracking-widest text-white">
                    {isArabic ? 'العودة للوحة الرئيسية' : 'Return to Control Center'}
                  </span>
                </div>
              </button>
            </Link>

          </div>

          {/* v2.0 watermark */}
          <div className="pt-4 border-t border-white/5 text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">
            {isArabic ? 'بوابة محميات البحر الأحمر • نظام التحقق من الأمان' : 'Red Sea reserves • security verification'}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        .animate-pulse-slow {
          animation: pulseSlow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
