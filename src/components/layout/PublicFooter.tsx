'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Share2, 
  Mail, 
  Phone, 
  MapPin,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Info,
  Circle
} from 'lucide-react';

export function PublicFooter({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  
  const footerLinks = [
    {
      title: isAr ? 'المحميات' : 'Reserves',
      links: [
        { name: isAr ? 'الجزر الشمالية' : 'Northern Islands', href: `/${lang}/reserves/reserve_northern_islands` },
        { name: isAr ? 'وادي الجمال' : 'Wadi El Gemal', href: `/${lang}/reserves/reserve_wadi_el_gemal` },
        { name: isAr ? 'جبل علبة' : 'Gebel Elba', href: `/${lang}/reserves/reserve_gebel_elba` },
        { name: isAr ? 'الحيد المرجاني' : 'Coral Reef', href: `/${lang}/reserves/reserve_coral_reef` },
      ]
    },
    {
      title: isAr ? 'الموارد' : 'Resources',
      links: [
        { name: isAr ? 'دليل الزوار' : 'Visitor Guide', href: '#' },
        { name: isAr ? 'البحث العلمي' : 'Scientific Research', href: '#' },
        { name: isAr ? 'البيانات المفتوحة' : 'Open Data', href: '#' },
        { name: isAr ? 'القوانين واللوائح' : 'Laws & Regulations', href: '#' },
      ]
    },
    {
      title: isAr ? 'من نحن' : 'About Us',
      links: [
        { name: isAr ? 'الأهداف والاستراتيجية' : 'Mission & Strategy', href: '#' },
        { name: isAr ? 'الهيكل التنظيمي' : 'Management Structure', href: '#' },
        { name: isAr ? 'الوظائف' : 'Careers', href: '#' },
        { name: isAr ? 'تواصل معنا' : 'Contact Us', href: '#' },
      ]
    }
  ];

  return (
    <footer 
      className="bg-[#050b14] pt-24 pb-12 overflow-hidden border-t border-white/5 relative"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* ── Authority Info ────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-[0_20px_40px_rgba(45,212,191,0.2)]">
                <span className="text-white font-black text-2xl italic tracking-tighter">R</span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-white italic leading-tight tracking-tighter uppercase">
                  {isAr ? 'محميات البحر الأحمر' : 'Red Sea Reserves'}
                </h2>
                <span className="text-xs font-black text-teal-500 uppercase tracking-[0.4em] mt-1 italic">Authority Intelligence</span>
              </div>
            </div>
            
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md italic">
              {isAr 
                ? 'نحن حراس أحد أكثر النظم البيئية البحرية تنوعاً في العالم، ملتزمون بالحفاظ على تراث البحر الأحمر للأجيال القادمة.' 
                : 'Guardians of one of the world’s most biodiverse marine ecosystems, dedicated to preserving the Red Sea heritage for future generations.'}
            </p>

            <div className="flex gap-4">
              {[Globe, Share2, Mail, Info].map((Icon, i) => (
                <button key={i} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-white/10 transition-all duration-300">
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Link Columns ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
            {footerLinks.map((section, i) => (
              <div key={i} className="space-y-6">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="text-sm font-bold text-slate-500 hover:text-teal-400 transition-colors flex items-center gap-2 group italic no-underline">
                        {link.name}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Section ────────────────────────────────────────────────── */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8 text-[11px] font-black text-slate-600 uppercase tracking-widest">
             <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-teal-800" />
                © 2026 RSMA INTERNAL
             </span>
             <Link href="#" className="hover:text-white transition-colors no-underline">Privacy Protocol</Link>
             <Link href="#" className="hover:text-white transition-colors no-underline">Security Terms</Link>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-teal-900/10 border border-teal-500/10">
             <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
             <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Global Ops: ONLINE</span>
          </div>
        </div>
      </div>

      {/* ── Background Branding ────────────────────────────────────────────── */}
      <div className="absolute bottom-0 right-0 left-0 pointer-events-none opacity-[0.02] select-none text-center transform translate-y-1/2">
         <span className="text-[25vw] font-black italic tracking-tighter uppercase leading-none whitespace-nowrap">RED SEA AUTHORITY</span>
      </div>
    </footer>
  );
}
