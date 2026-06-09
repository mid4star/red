'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
   Search,
   Calendar,
   Clock,
   FileText,
   ChevronRight,
   TrendingUp,
   Signal,
   Loader2
} from 'lucide-react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { NewsArticle } from '@/lib/firebase/schema';

const NEWS_CATEGORIES = [
   { id: 'all', name: 'News Feed', nameAr: 'آخر الأخبار والمستجدات' },
   { id: 'press', name: 'Press Releases', nameAr: 'بيانات صحفية' },
   { id: 'ops', name: 'Conservation Reports', nameAr: 'تقارير بيئية' },
   { id: 'video', name: 'Field Recordings', nameAr: 'تسجيلات ميدانية' },
];

export default function NewsClient({ lang }: { lang: string }) {
   const isAr = lang === 'ar';
   const [activeTab, setActiveTab] = useState('all');
   const [searchQuery, setSearchQuery] = useState('');
   const [news, setNews] = useState<NewsArticle[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchNews = async () => {
         try {
            const res = await fetch('/api/staff/query?collection=news');
            const json = await res.json();
            if (json.success) {
               const allNews = json.data as NewsArticle[];
               const published = allNews.filter((item: any) => item.status === 'PUBLISHED');
               setNews(published);
            }
         } catch (e) {
            console.error(e);
         } finally {
            setLoading(false);
         }
      };
      fetchNews();
   }, []);

   const formatDate = (timestamp: any) => {
      if (!timestamp) return '';
      const dateObj = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
      return dateObj.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      });
   };

   const getReadTime = (article: NewsArticle) => {
      const contentText = isAr ? article.contentAr || article.content : article.content;
      if (!contentText) return isAr ? 'دقيقة واحدة' : '1 min';
      const cleanText = contentText.replace(/<[^>]*>/g, '');
      const wordCount = cleanText.trim().split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 200);
      return isAr ? `${minutes} دقائق` : `${minutes} min`;
   };

   // Filter logic
   const filtered = news.filter((item) => {
      // 1. Tab category filter
      let matchesTab = false;
      if (activeTab === 'all') {
         matchesTab = true;
      } else if (activeTab === 'press') {
         matchesTab = item.category === 'NEWS' || item.category === 'REGULATION';
      } else if (activeTab === 'ops') {
         matchesTab = item.category === 'REPORT';
      } else if (activeTab === 'video') {
         matchesTab = item.category === 'EVENT';
      }

      if (!matchesTab) return false;

      // 2. Search query filter
      if (searchQuery.trim() === '') return true;

      const queryLower = searchQuery.toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(queryLower) ||
         (item.titleAr || '').toLowerCase().includes(queryLower);
      const contentMatch = (item.content || '').toLowerCase().includes(queryLower) ||
         (item.contentAr || '').toLowerCase().includes(queryLower);

      return titleMatch || contentMatch;
   });

    return (
       <div className="bg-th-bg text-th-text min-h-screen transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
          <PublicNavbar lang={lang} />

          <main className="transition-colors duration-300">
             <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 border-b border-white/5 pb-12">
               <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center gap-3">
                     <div className="flex gap-1.5">
                        <div className="w-1.5 h-6 bg-teal-500 rounded-full animate-pulse" />
                        <div className="w-1.5 h-6 bg-teal-500/50 rounded-full" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400 italic">
                        {isAr ? 'ابقى على اطلاع' : 'Media & News Center'}
                     </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-tight lg:leading-[1.1]">
                     {isAr ? 'المركز الإعلامي' : 'News & Media Feed'}
                  </h1>
               </div>

               <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 w-full md:w-auto">
                  {/* Search Input */}
                  <div className="relative w-full md:w-80 group">
                     <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors`} size={16} />
                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isAr ? 'ابحث في أخبار ومستجدات المحميات...' : 'Search news & updates...'}
                        className={`w-full ${isAr ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-th-surface hover:bg-th-surface2 focus:bg-th-surface border border-th-border focus:border-teal-500/50 rounded-2xl text-sm font-medium text-th-text placeholder-th-muted outline-none transition-all shadow-sm`}
                     />
                  </div>

                  <div className="flex flex-wrap gap-6 justify-start md:justify-end w-full md:w-auto">
                     {NEWS_CATEGORIES.map((cat) => (
                        <button
                           key={cat.id}
                           onClick={() => setActiveTab(cat.id)}
                           className={`text-[12px] font-black uppercase tracking-widest italic transition-all relative ${activeTab === cat.id ? 'text-teal-400' : 'text-slate-500 hover:text-white'}`}
                        >
                           {isAr ? cat.nameAr : cat.name}
                           {activeTab === cat.id && (
                              <motion.div layoutId="catLine" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                           )}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* ── Featured Articles ───────────────────────────────────────── */}
            {loading ? (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
                  <div className="lg:col-span-8 h-[500px] rounded-[2.5rem] bg-slate-900/40 border border-white/5 flex items-center justify-center">
                     <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-teal-400" size={32} />
                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                           {isAr ? 'جاري تحميل آخر الأخبار...' : 'Loading News Feed...'}
                        </span>
                     </div>
                  </div>
                  <div className="lg:col-span-4 flex flex-col gap-6">
                     <div className="flex-1 rounded-[2rem] bg-slate-900/40 border border-white/5 animate-pulse" />
                     <div className="h-[200px] rounded-[2rem] bg-slate-900/40 border border-white/5 animate-pulse" />
                  </div>
               </div>
            ) : news.length === 0 ? (
               <div className="text-center py-20 text-slate-500 border border-white/5 rounded-[2.5rem] bg-slate-900/20 mb-20 font-mono">
                  {isAr ? 'لا توجد أخبار منشورة حالياً.' : 'NO PUBLISHED NEWS ARTICLES YET.'}
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
                  {filtered[0] ? (
                     <Link href={`/${lang}/news/${filtered[0].id}`} className="lg:col-span-8 no-underline block">
                        <motion.div
                           initial={{ opacity: 0, x: -30 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="dark group relative h-[350px] sm:h-[500px] rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl cursor-pointer w-full"
                        >
                           <img
                              src={filtered[0].imageUrl || '/red_sea_hero_aerial_1774790601114.png'}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
                              alt="Featured News"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/60 to-transparent" />
                           <div className="absolute top-8 left-8">
                              <div className="px-5 py-2 rounded-xl bg-teal-500 text-[#001529] font-black text-[10px] tracking-widest uppercase italic">
                                 {isAr ? 'الخبر الرئيسي' : 'FEATURED ARTICLE'}
                              </div>
                           </div>
                           <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 space-y-2 sm:space-y-4">
                              <div className="flex items-center gap-4 text-[10px] font-black text-teal-400 uppercase tracking-widest italic">
                                 <span>{formatDate(filtered[0].date)}</span>
                                 <span>•</span>
                                 <span>{getReadTime(filtered[0])}</span>
                              </div>
                              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg group-hover:text-teal-400 transition-colors leading-tight">
                                 {isAr ? filtered[0].titleAr : filtered[0].title}
                              </h2>
                              <p className="text-lg font-medium text-slate-200 max-w-2xl italic leading-relaxed line-clamp-2">
                                 {isAr
                                    ? (filtered[0].contentAr ? filtered[0].contentAr.replace(/<[^>]*>/g, '') : '')
                                    : (filtered[0].content ? filtered[0].content.replace(/<[^>]*>/g, '') : '')}
                              </p>
                           </div>
                        </motion.div>
                     </Link>
                  ) : (
                     <div className="lg:col-span-8 h-[500px] rounded-[2.5rem] bg-slate-900/20 border border-white/5 flex items-center justify-center text-slate-500 font-mono text-center px-6">
                        {isAr ? 'لا توجد نتائج تطابق خيارات التصفية الحالية.' : 'NO FEATURED MATCHES FOUND FOR CURRENT FILTERS.'}
                     </div>
                  )}

                  <div className="lg:col-span-4 flex flex-col gap-6">
                     {filtered[1] ? (
                        <Link href={`/${lang}/news/${filtered[1].id}`} className="flex-1 no-underline block">
                           <div className="h-full p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-slate-900/60 border border-white/5 flex flex-col justify-between group cursor-pointer hover:bg-slate-900 transition-all">
                              <div className="flex items-center justify-between mb-4">
                                 <TrendingUp className="text-teal-500" size={24} />
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {isAr ? 'الأكثر قراءة' : 'Trending Articles'}
                                 </span>
                              </div>
                              <div className="space-y-2">
                                 <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-tight group-hover:text-teal-400 transition-colors line-clamp-2">
                                    {isAr ? filtered[1].titleAr : filtered[1].title}
                                 </h3>
                                 <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase italic mt-4">
                                    <Signal size={12} className="text-emerald-500" />
                                    OFFICIAL UPDATE
                                 </div>
                              </div>
                           </div>
                        </Link>
                     ) : (
                        <div className="flex-1 p-8 rounded-[2rem] bg-slate-900/60 border border-white/5 flex flex-col justify-between group cursor-pointer hover:bg-slate-900">
                           <div className="flex items-center justify-between mb-4">
                              <TrendingUp className="text-teal-500" size={24} />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trending Articles</span>
                           </div>
                           <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-tight group-hover:text-teal-400 transition-colors">
                              {isAr ? 'إرشادات المحميات الجديدة 2026' : 'New Reserve Guidelines 2026'}
                           </h3>
                           <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase italic mt-4">
                              <Signal size={12} className="text-emerald-500" />
                              OFFICIAL UPDATE
                           </div>
                        </div>
                     )}

                     <button
                        onClick={() => setActiveTab('ops')}
                        className="h-auto min-h-[160px] sm:h-[200px] rounded-2xl sm:rounded-[2rem] bg-teal-500 p-6 sm:p-8 flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-[0_20px_40px_rgba(45,212,191,0.1)] text-start"
                     >
                        <FileText className="absolute top-[-20px] right-[-20px] text-black/10 scale-[5] opacity-50" />
                        <div className="text-[12px] font-black text-black uppercase tracking-tighter italic">Resource Documents</div>
                        <div className="space-y-1">
                           <p className="text-3xl font-black text-black tracking-tighter uppercase italic leading-none">{isAr ? 'تصفح التقارير' : 'View Reports'}</p>
                           <p className="text-[10px] font-bold text-black/60 uppercase">{isAr ? 'التقارير البيئية الدورية' : 'Reserve Environmental Reports'}</p>
                        </div>
                     </button>
                  </div>
               </div>
            )}

            {/* ── News Articles List ───────────────────────────────────────────── */}
            {!loading && news.length > 0 && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-40">
                  {filtered.length <= 1 ? (
                     filtered.length === 0 ? null : (
                        <div className="col-span-full text-center py-10 text-slate-500 font-mono">
                           {isAr ? 'لا توجد أخبار إضافية في القائمة.' : 'NO ADDITIONAL NEWS ITEMS AVAILABLE.'}
                        </div>
                     )
                  ) : (
                     filtered.slice(1).map((item, i) => (
                        <Link href={`/${lang}/news/${item.id}`} key={item.id || i} className="no-underline block">
                           <motion.div
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: (i % 3) * 0.1 }}
                              viewport={{ once: true }}
                              className="group flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] overflow-hidden hover:bg-slate-900/60 transition-all cursor-pointer"
                           >
                              <div className="h-64 relative overflow-hidden">
                                 <img
                                    src={item.imageUrl || '/red_sea_hero_aerial_1774790601114.png'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                    alt={isAr ? item.titleAr : item.title}
                                 />
                                 <div className="absolute top-6 left-6 px-4 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-[9px] font-black tracking-widest uppercase italic text-teal-400">
                                    {item.category}
                                 </div>
                              </div>
                              <div className="p-8 flex-1 flex flex-col space-y-6">
                                 <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase italic">
                                    <span className="flex items-center gap-2">
                                       <Calendar size={12} className="text-teal-800" />
                                       {formatDate(item.date)}
                                    </span>
                                    <span className="flex items-center gap-2">
                                       <Clock size={12} className="text-teal-800" />
                                       {getReadTime(item)}
                                    </span>
                                 </div>
                                 <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none group-hover:text-teal-400 transition-colors line-clamp-2">
                                    {isAr ? item.titleAr : item.title}
                                 </h3>
                                 <p className="text-sm font-medium text-slate-400 italic leading-relaxed line-clamp-3">
                                    {isAr
                                       ? (item.contentAr ? item.contentAr.replace(/<[^>]*>/g, '') : '')
                                       : (item.content ? item.content.replace(/<[^>]*>/g, '') : '')
                                    }
                                 </p>
                                 <div className="pt-4 mt-auto">
                                    <span className="flex items-center gap-2 text-[11px] font-black text-teal-400 uppercase tracking-widest italic group-hover:gap-4 transition-all">
                                       {isAr ? 'اقرأ الخبر كاملاً' : 'Read Full Article'}
                                       <ChevronRight size={16} />
                                    </span>
                                 </div>
                              </div>
                           </motion.div>
                        </Link>
                     ))
                  )}
               </div>
            )}
             </section>
          </main>

          <PublicFooter lang={lang} />
       </div>
    );
}
