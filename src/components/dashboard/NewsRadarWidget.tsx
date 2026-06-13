'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Radio, Newspaper, Calendar, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';

export default function NewsRadarWidget({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/staff/news-radar');
        const data = await res.json();
        if (data.success && data.articles) {
          // Show only top 3 articles
          setArticles(data.articles.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return isAr ? `منذ ${days} أيام` : `${days} days ago`;
    if (hours > 0) return isAr ? `منذ ${hours} ساعات` : `${hours} hours ago`;
    return isAr ? 'منذ أقل من ساعة' : 'Less than an hour ago';
  };

  return (
    <Card className="flex flex-col border border-th-border shadow-lg bg-th-surface/80 backdrop-blur-xl overflow-hidden mt-6">
      <div className="p-4 md:p-6 border-b border-th-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-th-text dark:text-white tracking-tight uppercase">
              {isAr ? 'الرادار الإخباري - أحدث الأخبار' : 'News Radar - Latest Intel'}
            </h3>
            <p className="text-[11px] font-bold text-th-muted uppercase tracking-widest mt-1">
              {isAr ? 'تم فلترتها بواسطة الذكاء الاصطناعي' : 'Filtered by AI Algorithm'}
            </p>
          </div>
        </div>
        <Link href={`/${lang}/staff/radar`}>
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-th-surface2 hover:bg-amber-500/10 text-th-text hover:text-amber-500 border border-th-border hover:border-amber-500/30 transition-all text-xs font-bold uppercase tracking-widest w-full sm:w-auto">
            {isAr ? 'تصفح المزيد' : 'View All Intel'}
            {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </Link>
      </div>

      <div className="p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-50">
            <Radio size={32} className="animate-ping text-amber-500 mb-4" />
            <span className="text-xs font-bold tracking-widest uppercase">{isAr ? 'جاري المسح...' : 'Scanning...'}</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-th-muted text-sm font-medium">
            {isAr ? 'لا توجد أخبار جديدة متوافقة مع معايير البحث.' : 'No new articles match the tracking criteria.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {articles.map((article, idx) => (
              <div key={idx} className="flex flex-col gap-3 p-4 rounded-2xl bg-th-surface2 border border-th-border hover:border-amber-500/40 transition-colors group">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-th-surface border border-th-border text-[9px] font-black uppercase text-th-muted truncate max-w-[120px]">
                    <Newspaper size={10} className="text-amber-500" />
                    {article.source || 'News'}
                  </span>
                  <span className="text-[10px] font-bold text-th-muted flex items-center gap-1">
                    <Calendar size={10} />
                    {getTimeAgo(article.pubDate)}
                  </span>
                </div>
                
                <h4 className="text-sm font-black text-th-text leading-relaxed line-clamp-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {article.title}
                </h4>

                <div className="mt-auto pt-3 border-t border-th-border/50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase">
                    {isAr ? 'صلة: ' : 'Score: '}{article.score}
                  </span>
                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-th-muted hover:text-amber-500 transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
