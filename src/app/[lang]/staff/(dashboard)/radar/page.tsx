'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, RefreshCw, Radio, ExternalLink, Clock, AlertCircle, Newspaper, Calendar, Settings, X, Save, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewsRadarPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  
  const [config, setConfig] = useState({
    locationKeywords: [] as string[],
    environmentKeywords: [] as string[],
    negativeKeywords: [] as string[]
  });
  
  // Local state for comma separated inputs in modal
  const [locInput, setLocInput] = useState('');
  const [envInput, setEnvInput] = useState('');
  const [negInput, setNegInput] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('active_user_session');
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.role === 'ADMIN') setIsAdmin(true);
      } catch(e) {}
    }
  }, []);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/news-radar', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles);
        setConfig(data.config);
        setLocInput(data.config.locationKeywords.join(', '));
        setEnvInput(data.config.environmentKeywords.join(', '));
        setNegInput(data.config.negativeKeywords.join(', '));
        setLastRefreshed(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [autoRefresh, fetchNews]);

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      const payload = {
        locationKeywords: locInput.split(',').map(s => s.trim()).filter(Boolean),
        environmentKeywords: envInput.split(',').map(s => s.trim()).filter(Boolean),
        negativeKeywords: negInput.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await fetch('/api/staff/news-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowConfig(false);
        fetchNews(); // Refetch news with new algorithm rules
      }
    } catch (e) {
      console.error(e);
    }
    setSavingConfig(false);
  };

  const highlightKeywords = (text: string) => {
    if (!text || !config.environmentKeywords) return text;
    // Combine positive keywords for highlighting
    const allKeywords = [...config.environmentKeywords, ...config.locationKeywords];
    if (allKeywords.length === 0) return text;
    
    const regex = new RegExp(`(${allKeywords.join('|')})`, 'gi');
    
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (allKeywords.includes(part.toLowerCase())) {
        return <span key={i} className="bg-amber-500/20 text-amber-500 font-bold px-1 rounded shadow-sm border border-amber-500/20">{part}</span>;
      }
      return part;
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return isAr ? `منذ ${days} أيام` : `${days} days ago`;
    if (hours > 0) return isAr ? `منذ ${hours} ساعات` : `${hours} hours ago`;
    return isAr ? 'منذ أقل من ساعة' : 'Less than an hour ago';
  };

  return (
    <div className="p-4 md:p-8 space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-th-surface border border-th-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl shadow-sm relative">
            <Radio className="text-amber-600 dark:text-amber-400" size={28} strokeWidth={2.5} />
            {autoRefresh && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />}
            {autoRefresh && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-th-text tracking-tight uppercase">
              {isAr ? 'الرادار الإخباري' : 'News Radar'}
            </h1>
            <p className="text-th-muted text-sm font-medium tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              {isAr ? 'مدعوم بخوارزمية الفلترة الذكية للأخبار البيئية' : 'Powered by Smart Environmental Filtering Algorithm'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10 w-full xl:w-auto justify-between xl:justify-start">
          <label className="flex items-center gap-2 text-xs font-bold text-th-muted cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={e => setAutoRefresh(e.target.checked)}
              className="accent-amber-500 w-4 h-4 rounded border-th-border bg-th-surface2"
            />
            {isAr ? 'تحديث تلقائي' : 'Auto-refresh'}
          </label>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button 
                onClick={() => setShowConfig(true)}
                className="bg-th-surface2 border border-th-border text-th-text hover:bg-th-surface hover:text-amber-500 shadow-sm h-10 px-4 rounded-xl flex items-center gap-2"
              >
                <Settings size={16} />
                <span className="font-bold text-sm hidden md:inline">{isAr ? 'تعديل الخوارزمية' : 'Edit Algorithm'}</span>
              </Button>
            )}
            <Button 
              onClick={fetchNews} 
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-md h-10 px-4 rounded-xl flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-white/50' : ''} />
              <span className="font-bold text-sm">{isAr ? 'تحديث الآن' : 'Refresh'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-th-muted px-2">
        <Clock size={14} className="text-th-muted" />
        {isAr ? 'آخر تحديث:' : 'Last refreshed:'} <span className="font-bold">{lastRefreshed.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US')}</span>
        <span className="mx-2 opacity-30">|</span>
        <ShieldAlert size={14} className="text-emerald-500" />
        <span className="text-emerald-500 dark:text-emerald-400">{isAr ? 'تم تطبيق خوارزمية الاستبعاد وتصفية الأخبار المزعجة' : 'Exclusion algorithm active, spam filtered'}</span>
      </div>

      {loading && articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 min-h-[400px]">
          <div className="relative mb-6">
             <Radio size={56} className="text-amber-500/20" />
             <Radio size={56} className="text-amber-500 absolute top-0 left-0 animate-ping opacity-50" />
          </div>
          <p className="text-th-muted font-bold text-sm tracking-widest uppercase">
            {isAr ? 'الرادار يبحث ويحلل الأخبار...' : 'Radar scanning and analyzing news...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {articles.map((article, i) => (
              <motion.div
                key={article.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.5) }}
              >
                <Card className="h-full flex flex-col bg-th-surface border border-th-border rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all group relative">
                  {/* Score Badge */}
                  <div className={`absolute top-0 ${isAr ? 'left-0 rounded-br-2xl' : 'right-0 rounded-bl-2xl'} px-3 py-1.5 bg-gradient-to-r ${article.score >= 30 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'} text-white text-[10px] font-black tracking-widest uppercase z-10 shadow-sm flex items-center gap-1`}>
                    {article.score >= 30 ? '🔥 ' : '✅ '}
                    {isAr ? 'صلة: ' : 'Score: '}{article.score}
                  </div>

                  <div className="p-5 pt-7 flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-th-surface2 border border-th-border/50 text-[10px] font-black uppercase text-th-muted truncate max-w-[150px]">
                        <Newspaper size={12} className="text-amber-500" />
                        {article.source || (isAr ? 'مصدر غير معروف' : 'Unknown Source')}
                      </span>
                      <span className="text-[10px] font-bold text-th-muted flex items-center gap-1 whitespace-nowrap">
                        <Calendar size={12} />
                        {getTimeAgo(article.pubDate)}
                      </span>
                    </div>
                    
                    <h2 className="text-base font-black text-th-text leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-3" dir="auto">
                      {highlightKeywords(article.title)}
                    </h2>
                  </div>

                  <div className="p-4 border-t border-th-border bg-th-surface2 flex items-center justify-between">
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline"
                    >
                      {isAr ? 'قراءة الخبر كاملاً' : 'Read Full Article'}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 opacity-60">
          <ShieldAlert size={48} className="mb-4 text-emerald-500" />
          <p className="font-bold text-th-text text-center max-w-sm">
            {isAr ? 'تم حجب جميع الأخبار لأنها غير متعلقة بالبيئة (تم تطبيق الخوارزمية بنجاح).' : 'All news filtered out as irrelevant (Algorithm successfully applied).'}
          </p>
        </div>
      )}

      {/* --- CONFIG MODAL FOR ADMINS --- */}
      {showConfig && isAdmin && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfig(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-th-surface border border-th-border rounded-3xl w-full max-w-2xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-th-border flex justify-between items-center bg-th-surface2">
              <div>
                <h2 className="text-lg font-black text-th-text flex items-center gap-2">
                  <Settings className="text-amber-500" />
                  {isAr ? 'إعدادات خوارزمية الرادار' : 'Radar Algorithm Settings'}
                </h2>
                <p className="text-xs text-th-muted mt-1 font-medium">
                  {isAr ? 'الكلمات مفصولة بفاصلة (,) لتوجيه ذكاء البحث' : 'Comma separated words to guide the smart filtering'}
                </p>
              </div>
              <button onClick={() => setShowConfig(false)} className="p-2 bg-th-surface hover:bg-rose-500/10 text-th-muted hover:text-rose-500 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Positive Location Keywords */}
              <div>
                <label className="text-xs font-bold text-th-text uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {isAr ? 'كلمات المواقع الجغرافية (+10 نقاط)' : 'Location Keywords (+10 pts)'}
                </label>
                <textarea 
                  value={locInput}
                  onChange={(e) => setLocInput(e.target.value)}
                  className="w-full h-24 bg-th-surface2 border border-th-border rounded-xl p-3 text-sm text-th-text focus:outline-none focus:border-amber-500/50 resize-none custom-scrollbar"
                  placeholder="البحر الأحمر، الغردقة، مرسى علم..."
                  dir="auto"
                />
              </div>

              {/* Positive Env Keywords */}
              <div>
                <label className="text-xs font-bold text-th-text uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {isAr ? 'كلمات البيئة والمحميات (+15 نقطة)' : 'Environment Keywords (+15 pts)'}
                </label>
                <textarea 
                  value={envInput}
                  onChange={(e) => setEnvInput(e.target.value)}
                  className="w-full h-24 bg-th-surface2 border border-th-border rounded-xl p-3 text-sm text-th-text focus:outline-none focus:border-amber-500/50 resize-none custom-scrollbar"
                  placeholder="بيئة، محميات، تلوث، صيد..."
                  dir="auto"
                />
              </div>

              {/* Negative Keywords */}
              <div>
                <label className="text-xs font-bold text-th-text uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {isAr ? 'كلمات الاستبعاد (حظر مباشر)' : 'Exclusion Keywords (Instant Block)'}
                </label>
                <textarea 
                  value={negInput}
                  onChange={(e) => setNegInput(e.target.value)}
                  className="w-full h-24 bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-sm text-th-text focus:outline-none focus:border-rose-500/50 resize-none custom-scrollbar"
                  placeholder="حوثي، حرب، مرور، مباني، إسكندرية..."
                  dir="auto"
                />
              </div>
            </div>

            <div className="p-6 border-t border-th-border bg-th-surface2 flex justify-end gap-3 shrink-0">
              <Button intent="outline" onClick={() => setShowConfig(false)} className="border-th-border text-th-muted hover:text-th-text">
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={saveConfig} disabled={savingConfig} className="bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 border-none">
                <Save size={16} />
                {savingConfig ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الخوارزمية' : 'Save Algorithm')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
