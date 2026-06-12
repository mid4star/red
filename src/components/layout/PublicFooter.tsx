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
  
  const [config, setConfig] = React.useState<any>({
     facebookUrl: '#',
     twitterUrl: '#',
     youtubeUrl: '#',
     instagramUrl: '#',
     siteName: 'Red Sea Reserves',
     siteNameAr: 'محميات البحر الأحمر',
     siteSlogan: 'Conservation & Research Hub',
     siteSloganAr: 'مركز الحماية والأبحاث',
     siteStatus: 'Global Ops: ONLINE',
     siteStatusAr: 'حالة العمليات: نشط',
     siteLogoUrl: '',
  });

  React.useEffect(() => {
     fetch('/api/staff/query?collection=system_config')
        .then(r => r.json())
        .then(json => {
           if (json.success && json.data && json.data.length > 0) {
              const globalConfig = json.data.find((item: any) => item.id === 'global') || json.data[0];
              if (globalConfig) {
                 setConfig(globalConfig);
              }
           }
        })
        .catch(err => console.error(err));
  }, []);
  
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
        { name: isAr ? 'دليل الزوار' : 'Visitor Guide', href: `/${lang}/guide` },
        { name: isAr ? 'البحث العلمي' : 'Scientific Research', href: `/${lang}/statistics` },
        { name: isAr ? 'البيانات المفتوحة' : 'Open Data', href: `/${lang}/opendata` },
        { name: isAr ? 'القوانين واللوائح' : 'Laws & Regulations', href: `/${lang}/regulations` },
      ]
    },
    {
      title: isAr ? 'من نحن' : 'About Us',
      links: [
        { name: isAr ? 'الأهداف والاستراتيجية' : 'Mission & Strategy', href: `/${lang}/about#mission` },
        { name: isAr ? 'الهيكل التنظيمي' : 'Management Structure', href: `/${lang}/about#structure` },
        { name: isAr ? 'الوظائف' : 'Careers', href: `/${lang}/careers` },
        { name: isAr ? 'تواصل معنا' : 'Contact Us', href: `/${lang}/contact` },
      ]
    }
  ];

  return (
    <footer 
      className="bg-th-surface text-th-text pt-24 pb-12 overflow-hidden border-t border-th-border relative dark:bg-[#050b14] dark:border-white/5 transition-colors duration-300"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* ── Authority Info ────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              {config.siteLogoUrl ? (
                 <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shadow-[0_20px_40px_rgba(45,212,191,0.2)] bg-th-surface dark:bg-[#050b14]">
                    <img src={config.siteLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                 </div>
              ) : (
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-[0_20px_40px_rgba(45,212,191,0.2)]">
                   <span className="text-white font-black text-2xl italic tracking-tighter">R</span>
                 </div>
              )}
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-th-text dark:text-white italic leading-tight tracking-tighter uppercase">
                  {isAr ? config.siteNameAr : config.siteName}
                </h2>
                <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.2em] mt-1 italic">{isAr ? config.siteSloganAr : config.siteSlogan}</span>
              </div>
            </div>
            
            <p className="text-th-muted dark:text-slate-400 text-lg font-medium leading-relaxed max-w-md italic">
              {isAr 
                ? 'نحن حراس أحد أكثر النظم البيئية البحرية تنوعاً في العالم، ملتزمون بالحفاظ على تراث البحر الأحمر للأجيال القادمة.' 
                : 'Guardians of one of the world’s most biodiverse marine ecosystems, dedicated to preserving the Red Sea heritage for future generations.'}
            </p>

            <div className="flex gap-4">
              <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-th-input border border-th-border flex items-center justify-center text-th-muted hover:text-teal-500 hover:bg-th-surface2 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-white/10 transition-all duration-300">
                <svg className="w-5 h-5 animate-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href={config.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-th-input border border-th-border flex items-center justify-center text-th-muted hover:text-teal-500 hover:bg-th-surface2 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-white/10 transition-all duration-300">
                <svg className="w-5 h-5 animate-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href={config.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-th-input border border-th-border flex items-center justify-center text-th-muted hover:text-teal-500 hover:bg-th-surface2 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-white/10 transition-all duration-300">
                <svg className="w-5 h-5 animate-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
              <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-th-input border border-th-border flex items-center justify-center text-th-muted hover:text-teal-500 hover:bg-th-surface2 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-white/10 transition-all duration-300">
                <svg className="w-5 h-5 animate-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Link Columns ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
            {footerLinks.map((section, i) => (
              <div key={i} className="space-y-6">
                <h3 className="text-xs font-black text-th-text dark:text-white uppercase tracking-[0.3em] italic">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="text-sm font-bold text-th-muted hover:text-teal-500 dark:text-slate-500 dark:hover:text-teal-400 transition-colors flex items-center gap-2 group italic no-underline">
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
        <div className="pt-12 border-t border-th-border dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8 text-[11px] font-black text-th-muted dark:text-slate-600 uppercase tracking-widest">
             <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-teal-800" />
                © 2026 RSMA INTERNAL
             </span>
             <Link href="#" className="hover:text-th-text dark:hover:text-white transition-colors no-underline">Privacy Protocol</Link>
             <Link href="#" className="hover:text-th-text dark:hover:text-white transition-colors no-underline">Security Terms</Link>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-teal-900/10 border border-teal-500/10">
             <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
             <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{isAr ? config.siteStatusAr : config.siteStatus}</span>
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
