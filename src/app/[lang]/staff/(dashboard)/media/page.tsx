'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, MapPin, Newspaper, Database, BookOpen, 
  ArrowRight, ArrowLeft, Megaphone, TrendingUp 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const MODULES = [
  { 
    key: 'homepage', collection: 'homepage',
    name: 'Homepage Settings', nameAr: 'إعدادات الصفحة الرئيسية',
    desc: 'Control hero text, banners and featured content', descAr: 'تحكم في نصوص الواجهة والإعلانات والمحتوى المميز',
    icon: Home, color: 'blue', href: 'media/homepage',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    key: 'reserves', collection: 'reserves',
    name: 'Reserves Management', nameAr: 'إدارة المحميات',
    desc: 'Manage marine reserve profiles, descriptions and media', descAr: 'إدارة ملفات المحميات البحرية ووصفها وصورها',
    icon: MapPin, color: 'emerald', href: 'media/reserves',
    gradient: 'from-emerald-500 to-emerald-700',
  },
  {
    key: 'news', collection: 'news',
    name: 'News & Events', nameAr: 'الأخبار والفعاليات',
    desc: 'Publish news articles, events, reports and regulations', descAr: 'نشر المقالات والأخبار والفعاليات والتقارير واللوائح',
    icon: Newspaper, color: 'amber', href: 'media/news',
    gradient: 'from-amber-500 to-amber-700',
  },
  {
    key: 'opendata', collection: 'opendata',
    name: 'Open Data', nameAr: 'البيانات المفتوحة',
    desc: 'Upload research papers and public datasets', descAr: 'رفع الأبحاث والمستندات الأكاديمية والبيانات العامة',
    icon: Database, color: 'indigo', href: 'media/opendata',
    gradient: 'from-indigo-500 to-indigo-700',
  },
  {
    key: 'guide', collection: 'visitor_guide',
    name: 'Visitor Guide', nameAr: 'دليل الزوار',
    desc: 'Manage visitor guidelines, safety rules and sections', descAr: 'إدارة أقسام دليل الزوار والإرشادات وقواعد السلامة',
    icon: BookOpen, color: 'rose', href: 'media/guide',
    gradient: 'from-rose-500 to-rose-700',
  },
];

export default function MediaCenterPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      for (const m of MODULES) {
        try {
          const res = await fetch(`/api/staff/query?collection=${m.collection}`);
          if (res.ok) {
            const json = await res.json();
            setCounts(prev => ({ ...prev, [m.key]: (json.data || []).length }));
          }
        } catch (err) { console.error('Error fetching count for', m.key, err); }
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-10" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-amber-500 rounded-full" />
          <span className="text-[10px] font-black tracking-[0.2em] text-amber-400 uppercase italic">
            {isAr ? 'مركز إدارة المحتوى' : 'Content Management Hub'}
          </span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          {isAr ? 'المركز الإعلامي' : 'Media Center'}
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          {isAr 
            ? 'تحكم كامل في محتوى الموقع العام: الصفحة الرئيسية، المحميات، الأخبار، البيانات المفتوحة ودليل الزوار.'
            : 'Full control over public website content: homepage, reserves, news, open data and visitor guide.'}
        </p>
      </div>

      {/* ── Quick Stats Banner ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {MODULES.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-4 border border-white/5 text-center"
            >
              <Icon size={18} className={`mx-auto mb-2 text-${m.color}-400`} />
              <p className="text-2xl font-black text-white">{counts[m.key] ?? '—'}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                {isAr ? m.nameAr.split(' ')[0] : m.name.split(' ')[0]}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Module Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((m, i) => {
          const Icon = m.icon;
          const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
            >
              <Link href={`/${params.lang}/staff/${m.href}`} className="block group no-underline">
                <Card className="relative overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-xl hover:border-white/10 hover:shadow-[0_0_40px_rgba(45,212,191,0.08)] transition-all duration-500 p-0">
                  {/* Top gradient accent */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${m.gradient}`} />

                  <div className="p-6 space-y-5">
                    {/* Icon + Count */}
                    <div className="flex items-start justify-between">
                      <div className={`p-3.5 rounded-2xl bg-${m.color}-500/10 group-hover:bg-${m.color}-500/20 transition-colors`}>
                        <Icon size={28} className={`text-${m.color}-400`} />
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-white">{counts[m.key] ?? 0}</span>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          {isAr ? 'عنصر' : 'items'}
                        </p>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight mb-1.5 group-hover:text-teal-300 transition-colors">
                        {isAr ? m.nameAr : m.name}
                      </h3>
                      <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2">
                        {isAr ? m.descAr : m.desc}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest group-hover:tracking-[0.15em] transition-all">
                        {isAr ? 'إدارة' : 'Manage'}
                      </span>
                      <ArrowIcon size={16} className="text-teal-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
