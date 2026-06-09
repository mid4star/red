'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Search, 
  Database, 
  BookOpen, 
  Layers, 
  Loader2,
  Calendar,
  HardDrive
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { OpenDataDocument } from '@/lib/firebase/schema';

export default function OpenDataClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';

  const [documents, setDocuments] = useState<OpenDataDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/staff/query?collection=opendata');
        const json = await res.json();
        if (json.success) {
          setDocuments(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'ACADEMIC': return BookOpen;
      case 'DATASET': return Database;
      default: return FileText;
    }
  };

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case 'ACADEMIC': return isAr ? 'ورقة بحثية أكاديمية' : 'Academic Study';
      case 'REPORT': return isAr ? 'تقرير بيئي رسمي' : 'Environmental Report';
      case 'DATASET': return isAr ? 'مجموعة بيانات خام' : 'Raw Dataset';
      case 'GUIDELINE': return isAr ? 'دليل إرشادي معتمد' : 'Regulatory Guideline';
      default: return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return '';
    const dateObj = new Date(dateValue);
    return dateObj.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredDocs = documents.filter(doc => {
    const titleText = isAr ? (doc.titleAr || doc.title) : doc.title;
    const typeLabel = getDocTypeLabel(doc.type);
    const matchesSearch = titleText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          typeLabel.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeType === 'all') return matchesSearch;
    return matchesSearch && doc.type === activeType;
  });

  return (
    <div className="bg-th-bg text-th-text min-h-screen flex flex-col transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <PublicNavbar lang={lang} />

      <main className="flex-grow pt-40 pb-24 px-6 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Header Briefing */}
        <section className="flex flex-col mb-4 border-b border-th-border pb-12">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="space-y-6 max-w-3xl"
          >
             <div className="flex items-center gap-3">
                <div className="flex gap-1">
                   <div className="w-1 h-5 bg-teal-500 rounded-full animate-pulse" />
                   <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                   {isAr ? 'أرشيف البيانات العلمية المفتوحة' : 'Open Scientific Data Archives'}
                </span>
             </div>
             <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight lg:leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 pb-2">
                {isAr ? 'بوابة البيانات المفتوحة' : 'Open Data Portal'}
             </h1>
             <p className="text-lg md:text-xl text-th-muted max-w-2xl font-medium leading-relaxed">
                {isAr 
                   ? 'مستودعنا العام للدراسات الأكاديمية ومجموعات البيانات والتقارير التنظيمية حول النظام البيئي لمحميات البحر الأحمر.' 
                   : 'Our public archives for academic studies, biological datasets, and administrative reports concerning the Red Sea ecosystem.'}
             </p>
          </motion.div>
        </section>

        {/* Filter Controls */}
        <section className="p-6 md:p-8 rounded-[2.5rem] bg-[#0c1b2f]/50 backdrop-blur-2xl border border-white/5 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder={isAr ? 'ابحث عن ملف أو دراسة...' : 'Search document or study...'} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-[#081220]/80 border border-white/10 rounded-2xl py-4 pr-4 ${isAr ? 'pl-4 pr-12' : 'pl-12 pr-4'} text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium text-sm`}
              />
            </div>

            {/* Document Types Filter */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-start md:justify-end">
              {[
                { id: 'all', label: isAr ? 'الكل' : 'All' },
                { id: 'ACADEMIC', label: isAr ? 'أبحاث' : 'Studies' },
                { id: 'REPORT', label: isAr ? 'تقارير' : 'Reports' },
                { id: 'DATASET', label: isAr ? 'بيانات خام' : 'Datasets' },
                { id: 'GUIDELINE', label: isAr ? 'لوائح' : 'Guidelines' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border font-mono ${
                    activeType === type.id 
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.08)]' 
                      : 'bg-[#081220]/40 text-slate-400 border-white/5 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Documents Directory */}
        <section>
          {loading ? (
            <div className="text-center text-slate-500 font-mono py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-teal-400" size={36} />
              <span className="tracking-widest text-sm">{isAr ? 'جاري الاتصال بقاعدة البيانات...' : 'CONNECTING TO DATA ARCHIVES...'}</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center text-slate-500 font-mono py-32 rounded-[3rem] border border-dashed border-white/5 bg-[#0c1b2f]/20">
              <Layers className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-lg italic mb-2">{isAr ? 'لا توجد مستندات تطابق تصنيفك.' : 'NO DOCUMENTS FOUND.'}</p>
              <p className="text-xs text-slate-600 uppercase tracking-widest">{isAr ? 'سنقوم بإضافة سجلات جديدة قريباً' : 'Check back later for newly uploaded datasets'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredDocs.map((docObj, i) => {
                const IconComponent = getDocIcon(docObj.type);
                return (
                  <motion.div
                    key={docObj.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="p-8 rounded-[2rem] bg-[#0c1b2f]/40 border border-white/5 hover:border-teal-500/20 transition-all flex flex-col justify-between space-y-6 shadow-xl relative"
                  >
                    {/* Top Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[9px] font-black text-teal-400 uppercase tracking-widest italic">
                          {getDocTypeLabel(docObj.type)}
                        </span>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{formatDate(docObj.uploadDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                          <IconComponent size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white hover:text-teal-400 transition-colors leading-tight italic">
                          {isAr ? docObj.titleAr : docObj.title}
                        </h3>
                      </div>
                    </div>

                    {/* Bottom Metadata & Download Button */}
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                        <HardDrive size={12} />
                        <span>{formatFileSize(docObj.fileSize)}</span>
                      </div>

                      <a
                        href={docObj.fileUrl}
                        download
                        className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#001529] font-black text-xs uppercase tracking-wider italic transition-all flex items-center gap-2 no-underline"
                      >
                        {isAr ? 'تحميل الملف' : 'Download'}
                        <Download size={14} />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <PublicFooter lang={lang} />
    </div>
  );
}
