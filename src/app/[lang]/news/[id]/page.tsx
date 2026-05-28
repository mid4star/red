'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
   Calendar,
   Clock,
   ArrowLeft,
   ArrowRight,
   Share2,
   Link2,
   CheckCircle,
   BookOpen,
   ChevronRight,
   Loader2,
   Compass
} from 'lucide-react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { NewsArticle } from '@/lib/firebase/schema';

export default function NewsArticlePage({ params }: { params: { lang: string; id: string } }) {
   const { lang, id } = params;
   const isAr = lang === 'ar';
   
   const [article, setArticle] = useState<NewsArticle | null>(null);
   const [otherNews, setOtherNews] = useState<NewsArticle[]>([]);
   const [loading, setLoading] = useState(true);
   const [shareUrl, setShareUrl] = useState('');
   const [copied, setCopied] = useState(false);

   useEffect(() => {
      setShareUrl(window.location.href);
   }, []);

   useEffect(() => {
      const fetchArticleData = async () => {
         try {
            const res = await fetch('/api/staff/query?collection=news');
            const json = await res.json();
            if (json.success && json.data) {
               const allNews = json.data as NewsArticle[];
               const published = allNews.filter((item: any) => item.status === 'PUBLISHED');
               
               const current = published.find((item: any) => item.id === id);
               if (current) {
                  setArticle(current);
               }
               // Get up to 3 other recent news articles
               setOtherNews(published.filter((item: any) => item.id !== id).slice(0, 3));
            }
         } catch (e) {
            console.error('Error loading news article:', e);
         } finally {
            setLoading(false);
         }
      };
      fetchArticleData();
   }, [id]);

   const formatDate = (timestamp: any) => {
      if (!timestamp) return '';
      const dateObj = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
      return dateObj.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      });
   };

   const getReadTime = (item: NewsArticle) => {
      const contentText = isAr ? item.contentAr || item.content : item.content;
      if (!contentText) return isAr ? 'دقيقة واحدة' : '1 min';
      const cleanText = contentText.replace(/<[^>]*>/g, '');
      const wordCount = cleanText.trim().split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 200);
      return isAr ? `${minutes} دقائق` : `${minutes} min`;
   };

   const handleCopyLink = () => {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const articleTitle = article ? (isAr ? article.titleAr : article.title) : '';

   // Social share links
   const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(articleTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(articleTitle + ' ' + shareUrl)}`
   };

   if (loading) {
      return (
         <div className="bg-[#0a1628] text-white min-h-screen flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
            <PublicNavbar lang={lang} />
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40">
               <Loader2 className="animate-spin text-teal-400" size={40} />
               <span className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono">
                  {isAr ? 'جاري تحميل تفاصيل الخبر...' : 'Loading news details...'}
               </span>
            </div>
            <PublicFooter lang={lang} />
         </div>
      );
   }

   if (!article) {
      return (
         <div className="bg-[#0a1628] text-white min-h-screen flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
            <PublicNavbar lang={lang} />
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-40 max-w-xl mx-auto text-center px-6">
               <BookOpen className="text-rose-500 scale-125" size={48} />
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  {isAr ? 'الخبر غير موجود' : 'News Article Not Found'}
               </h2>
               <p className="text-slate-400 italic font-medium leading-relaxed">
                  {isAr 
                     ? 'لم يتم العثور على الخبر المطلوب أو تم نقله لمكان آخر.' 
                     : 'The requested article could not be located in our active news feed.'}
               </p>
               <Link href={`/${lang}/news`} className="no-underline">
                  <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                     {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                     {isAr ? 'العودة لغرفة الأخبار' : 'Back to News Feed'}
                  </button>
               </Link>
            </div>
            <PublicFooter lang={lang} />
         </div>
      );
   }

   return (
      <div className="bg-[#0a1628] text-white min-h-screen flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
         <PublicNavbar lang={lang} />

         {/* ── Breadcrumb and Header Details ────────────────────────────────────── */}
         <section className="relative pt-40 pb-12 px-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-8">
               <Link
                  href={`/${lang}/news`}
                  className="flex items-center gap-2 text-xs font-bold text-teal-400/80 hover:text-teal-400 uppercase tracking-widest transition-colors w-fit"
               >
                  <ArrowLeft size={14} className={isAr ? 'rotate-180' : ''} />
                  {isAr ? 'العودة للمركز الإعلامي' : 'Return to Media Hub'}
               </Link>

               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mt-4">
                  <div className="space-y-4 max-w-4xl">
                     <div className="flex items-center gap-4 text-[10px] font-black text-teal-400 uppercase tracking-widest italic">
                        <span className="px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20">
                           {article.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                           <Calendar size={12} />
                           {formatDate(article.date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                           <Clock size={12} />
                           {getReadTime(article)}
                        </span>
                     </div>
                     <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter text-white leading-tight">
                        {isAr ? article.titleAr : article.title}
                     </h1>
                     <div className="flex items-center gap-2 text-xs text-slate-400 font-medium italic">
                        <span>{isAr ? 'بواسطة:' : 'By:'}</span>
                        <span className="text-teal-400 font-bold">
                           {article.authorName || (isAr ? 'مسؤول النظام' : 'System Administrator')}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* ── Main Layout (Body + Sidebar sharing) ────────────────────────────────── */}
         <section className="pb-32 px-6 max-w-7xl mx-auto w-full flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
               
               {/* Main article body */}
               <div className="lg:col-span-8 space-y-8">
                  {/* Hero Cover Image */}
                  <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative">
                     <img
                        src={article.imageUrl || '/red_sea_hero_aerial_1774790601114.png'}
                        className="w-full h-full object-cover"
                        alt={articleTitle}
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Rich Text Editor Content */}
                  <div className="p-8 sm:p-12 rounded-[2.5rem] bg-[#0c1b2f]/40 border border-white/5 backdrop-blur-3xl relative overflow-hidden shadow-inner">
                     {/* Sci-Fi Decorative Corner Brackets */}
                     <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400/20 rounded-tl-2xl pointer-events-none" />
                     <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400/20 rounded-tr-2xl pointer-events-none" />
                     <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-400/20 rounded-bl-2xl pointer-events-none" />
                     <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-400/20 rounded-br-2xl pointer-events-none" />

                     <div
                        className="text-slate-300 font-medium italic leading-relaxed space-y-6 text-base md:text-lg
                           [&>h1]:text-white [&>h1]:font-black [&>h1]:text-2xl [&>h1]:mt-8 [&>h1]:mb-4 [&>h1]:uppercase [&>h1]:italic [&>h1]:tracking-tighter [&>h1]:border-b [&>h1]:border-white/5 [&>h1]:pb-2
                           [&>h2]:text-white [&>h2]:font-black [&>h2]:text-xl [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:uppercase [&>h2]:italic [&>h2]:tracking-tighter
                           [&>h3]:text-white [&>h3]:font-black [&>h3]:text-lg [&>h3]:mt-5 [&>h3]:mb-2 [&>h3]:uppercase [&>h3]:italic [&>h3]:tracking-tighter
                           [&>p]:mb-4 [&>p]:leading-relaxed
                           [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-2 [&>ul]:mb-6 [&>ul]:text-slate-300
                           [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:space-y-2 [&>ol]:mb-6 [&>ol]:text-slate-300
                           [&>li]:text-slate-300 [&>li]:italic
                           [&>a]:text-teal-400 [&>a]:underline hover:[&>a]:text-teal-300
                           [&>strong]:text-white [&>strong]:font-bold"
                        dangerouslySetInnerHTML={{
                           __html: isAr ? article.contentAr || article.content : article.content
                        }}
                     />
                  </div>
               </div>

               {/* Share sidebar and technical details */}
               <div className="lg:col-span-4 space-y-6">
                  {/* Share panel */}
                  <div className="p-8 rounded-[2rem] bg-[#0c1b2f]/60 border border-white/5 backdrop-blur-3xl space-y-6 relative overflow-hidden">
                     <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.3em] italic">
                        {isAr ? 'مشاركة الخبر' : 'Share Article'}
                     </h3>
                     
                     <div className="grid grid-cols-2 gap-4">
                        {/* Facebook */}
                        <a
                           href={shareLinks.facebook}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 hover:bg-white/10 text-slate-300 hover:text-teal-400 transition-all font-bold text-xs uppercase tracking-wider italic no-underline"
                        >
                           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                           </svg>
                           <span>Facebook</span>
                        </a>

                        {/* Twitter */}
                        <a
                           href={shareLinks.twitter}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 hover:bg-white/10 text-slate-300 hover:text-teal-400 transition-all font-bold text-xs uppercase tracking-wider italic no-underline"
                        >
                           {/* Custom inline X/Twitter SVG */}
                           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                           </svg>
                           <span>Twitter / X</span>
                        </a>

                        {/* LinkedIn */}
                        <a
                           href={shareLinks.linkedin}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 hover:bg-white/10 text-slate-300 hover:text-teal-400 transition-all font-bold text-xs uppercase tracking-wider italic no-underline"
                        >
                           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                              <rect x="2" y="9" width="4" height="12" />
                              <circle cx="4" cy="4" r="2" />
                           </svg>
                           <span>LinkedIn</span>
                        </a>

                        {/* WhatsApp */}
                        <a
                           href={shareLinks.whatsapp}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 hover:bg-white/10 text-slate-300 hover:text-teal-400 transition-all font-bold text-xs uppercase tracking-wider italic no-underline"
                        >
                           {/* WhatsApp inline SVG */}
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.953 11.488.953 6.05 1.01 1.624 5.378 1.62 10.806c-.001 1.702.447 3.366 1.3 4.803l-.955 3.486 3.682-.941z" />
                           </svg>
                           <span>WhatsApp</span>
                        </a>
                     </div>

                     <div className="w-full h-px bg-white/5" />

                     {/* Copy Link Button */}
                     <button
                        onClick={handleCopyLink}
                        className="w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#001529] font-black text-xs tracking-widest uppercase italic transition-all flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(20,184,166,0.15)]"
                     >
                        {copied ? (
                           <>
                              <CheckCircle size={16} />
                              <span>{isAr ? 'تم النسخ!' : 'Copied Link!'}</span>
                           </>
                        ) : (
                           <>
                              <Link2 size={16} />
                              <span>{isAr ? 'نسخ الرابط المباشر' : 'Copy Direct Link'}</span>
                           </>
                        )}
                     </button>
                  </div>

                  {/* Metadata telemetry card */}
                  <div className="p-8 rounded-[2rem] bg-[#0c1b2f]/30 border border-white/5 space-y-4">
                     <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                        ARTICLE DETAILS
                     </span>
                     <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between">
                           <span className="text-slate-500">ID:</span>
                           <span className="text-slate-300 font-bold uppercase">{article.id?.substring(0, 12)}...</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-slate-500">FORMAT:</span>
                           <span className="text-slate-300 font-bold">ARTICLE_JSON</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-slate-500">PUBLISHER:</span>
                           <span className="text-teal-400 font-bold">{article.authorName ? 'VERIFIED' : 'ADMIN'}</span>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </section>

         {/* ── Related Intelligence (Other news) ────────────────────────────────── */}
         {otherNews.length > 0 && (
            <section className="bg-[#071120] border-t border-white/5 py-24 px-6">
               <div className="max-w-7xl mx-auto w-full space-y-12">
                  <div className="flex items-center gap-3">
                     <Compass className="text-teal-400 animate-spin-slow" size={20} />
                     <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">
                        {isAr ? 'أخبار ذات صلة' : 'Related Articles'}
                     </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {otherNews.map((item, i) => (
                        <Link 
                           href={`/${lang}/news/${item.id}`} 
                           key={item.id || i}
                           className="group flex flex-col h-full bg-[#0c1b2f]/40 border border-white/5 rounded-2xl sm:rounded-[2rem] overflow-hidden hover:bg-[#0c1b2f]/60 transition-all cursor-pointer no-underline"
                        >
                           <div className="h-48 relative overflow-hidden">
                              <img
                                 src={item.imageUrl || '/red_sea_hero_aerial_1774790601114.png'}
                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                                 alt={isAr ? item.titleAr : item.title}
                              />
                           </div>
                           <div className="p-6 flex-1 flex flex-col space-y-4">
                              <div className="text-[10px] font-black text-slate-500 uppercase italic">
                                 {formatDate(item.date)}
                              </div>
                              <h4 className="text-lg font-black uppercase italic tracking-tighter leading-tight text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                                 {isAr ? item.titleAr : item.title}
                              </h4>
                              <div className="pt-2 mt-auto">
                                 <span className="flex items-center gap-2 text-[10px] font-black text-teal-400 uppercase tracking-widest italic">
                                    {isAr ? 'قراءة الخبر' : 'Read Article'}
                                    <ChevronRight size={14} />
                                 </span>
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            </section>
         )}

         <PublicFooter lang={lang} />
      </div>
   );
}
