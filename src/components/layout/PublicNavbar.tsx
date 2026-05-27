'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PublicNavbar({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: isAr ? 'الرئيسية' : 'Home', href: `/${lang}` },
    { name: isAr ? 'المحميات' : 'Reserves', href: `/${lang}/reserves` },
    { name: isAr ? 'الأخبار والفعاليات' : 'News & Events', href: `/${lang}/news` },
    { name: isAr ? 'البيانات المفتوحة' : 'Open Data', href: `/${lang}/statistics` },
    { name: isAr ? 'دليل الزوار' : 'Visitor Guide', href: `/${lang}/guide` },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl' 
          : 'bg-transparent py-6'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          {/* ── Logo ────────────────────────────────────────────────────────── */}
          <Link href={`/${lang}`} className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.3)] group-hover:scale-110 transition-transform duration-500">
              <span className="text-white font-black text-xl italic uppercase tracking-tighter">R</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white italic leading-none tracking-tighter uppercase transition-colors group-hover:text-teal-400">
                {isAr ? 'محميات البحر الأحمر' : 'Red Sea Reserves'}
              </span>
              <span className="text-[9px] font-black text-teal-500 uppercase tracking-[0.3em] mt-1">Strategic Protectorate</span>
            </div>
          </Link>

          {/* ── Desktop Navigation ──────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className="relative group no-underline"
                >
                  <span className={`text-[13px] font-black uppercase italic tracking-widest transition-all duration-300 ${isActive ? 'text-teal-400' : 'text-white/70 group-hover:text-white'}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="navUnderline"
                      className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Action Buttons ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <Link 
              href={(() => {
                if (!pathname) return `/${isAr ? 'en' : 'ar'}`;
                const segments = pathname.split('/');
                if (segments.length > 1 && (segments[1] === 'ar' || segments[1] === 'en')) {
                  segments[1] = isAr ? 'en' : 'ar';
                  return segments.join('/');
                }
                return `/${isAr ? 'en' : 'ar'}`;
              })()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <Globe size={14} className="text-teal-400" />
              {isAr ? 'English' : 'عربي'}
            </Link>

            <Link href={`/${lang}/staff/login`} className="no-underline">
               <button className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-teal-500 text-[#001529] font-black text-[12px] tracking-tighter uppercase italic hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                  <User size={16} strokeWidth={3} />
                  {isAr ? 'بوابة الموظفين' : 'Staff Portal'}
               </button>
            </Link>

            <button 
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu Overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[#0a1628]/95 backdrop-blur-2xl border-b border-white/10 py-8 px-6 flex flex-col gap-6 lg:hidden"
          >
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-black text-white italic uppercase tracking-tighter hover:text-teal-400 transition-all"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
               <Link 
                 href={(() => {
                   if (!pathname) return `/${isAr ? 'en' : 'ar'}`;
                   const segments = pathname.split('/');
                   if (segments.length > 1 && (segments[1] === 'ar' || segments[1] === 'en')) {
                     segments[1] = isAr ? 'en' : 'ar';
                     return segments.join('/');
                   }
                   return `/${isAr ? 'en' : 'ar'}`;
                 })()}
                 onClick={() => setMobileMenuOpen(false)}
                 className="text-sm font-bold text-teal-400 uppercase tracking-widest"
               >
                  {isAr ? 'Switch to English' : 'التحويل للعربية'}
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
