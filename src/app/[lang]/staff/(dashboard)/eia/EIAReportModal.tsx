'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Printer, MapPin, Calendar, Activity, AlertCircle, 
  Compass, Waves, User, FileText, ChevronUp, ChevronDown, 
  DollarSign, ShieldAlert, ClipboardList, Clock, CheckCircle2 
} from 'lucide-react';

interface EIAReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  type: 'costs' | 'inspections' | 'violations' | 'accidents' | null;
  lang: string;
}

export default function EIAReportModal({ isOpen, onClose, item, type, lang }: EIAReportModalProps) {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !item || !type || !mounted) return null;

  const isAr = lang === 'ar';

  const handlePrint = () => {
    window.print();
  };

  const handleScrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -300, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 300, behavior: 'smooth' });
    }
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReportTitle = () => {
    switch (type) {
      case 'costs': return isAr ? 'تقرير تقدير التكاليف' : 'Cost Estimation Report';
      case 'inspections': return isAr ? 'تقرير تفتيش بيئي' : 'Environmental Inspection Report';
      case 'violations': return isAr ? 'تقرير مخالفة بيئية' : 'Environmental Violation Report';
      case 'accidents': return isAr ? 'تقرير حادث بحري' : 'Marine Accident Report';
      default: return isAr ? 'تقرير الأثر البيئي' : 'EIA Report';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'costs': return <DollarSign size={24} className="text-emerald-500 print-icon" />;
      case 'inspections': return <ClipboardList size={24} className="text-indigo-500 print-icon" />;
      case 'violations': return <ShieldAlert size={24} className="text-rose-500 print-icon" />;
      case 'accidents': return <AlertCircle size={24} className="text-amber-500 print-icon" />;
      default: return <FileText size={24} className="text-slate-500 print-icon" />;
    }
  };

  const FieldCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: React.ReactNode }) => (
    <div className="bg-th-surface2 border border-th-border rounded-2xl p-4 flex flex-col gap-1 transition-all hover:bg-slate-100 dark:hover:bg-white/[0.04]">
      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
         <Icon size={12} className="text-teal-600 dark:text-teal-400" /> {label}
      </span>
      <p className="text-sm md:text-base font-bold text-th-text break-words">
        {value}
      </p>
    </div>
  );

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 transition-all duration-300 print-portal-root">
      
      {/* Background click to close (no-print) */}
      <div className="absolute inset-0 no-print cursor-pointer" onClick={onClose} />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl bg-th-surface shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border border-th-border print-modal-container"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        
        {/* Custom Scroll Buttons - No Print */}
        <div className={`absolute ${isAr ? 'left-6' : 'right-6'} bottom-6 flex flex-col gap-3 z-20 no-print`}>
           <button onClick={handleScrollUp} className="w-11 h-11 rounded-full bg-th-surface2 hover:bg-th-surface text-th-text flex items-center justify-center shadow-xl transition-transform hover:scale-110 backdrop-blur-md border border-white/10">
             <ChevronUp size={22} />
           </button>
           <button onClick={handleScrollDown} className="w-11 h-11 rounded-full bg-th-surface2 hover:bg-th-surface text-th-text flex items-center justify-center shadow-xl transition-transform hover:scale-110 backdrop-blur-md border border-white/10">
             <ChevronDown size={22} />
           </button>
        </div>

        {/* Header - No Print (Action bar) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-th-border bg-th-surface/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3.5">
             <div className="w-12 h-12 rounded-2xl bg-th-surface shadow-sm border border-th-border flex items-center justify-center">
               {getIcon()}
             </div>
             <div>
               <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">{getReportTitle()}</h3>
               <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">ID: {item.id}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-teal-500/20"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">{isAr ? 'طباعة PDF' : 'Print PDF'}</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-th-surface2 hover:bg-th-surface rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content */}
        <div 
          ref={scrollRef}
          className="overflow-y-auto p-6 md:p-10 print-content text-slate-900 dark:text-slate-100 flex-1 min-h-0 w-full bg-transparent dark:bg-transparent"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
           <style>{`
             .print-content::-webkit-scrollbar {
               display: none;
             }
           `}</style>
           
           {/* Report Header for Print */}
           <div className="border-b-2 border-slate-800 dark:border-white/20 pb-6 mb-8 print-header">
             <div className="flex justify-between items-start mb-5">
                <div>
                   <h1 className="text-2xl font-black uppercase tracking-widest text-th-text mb-1">
                     {isAr ? 'محميات البحر الأحمر' : 'Red Sea Reserves'}
                   </h1>
                   <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                     {isAr ? 'إدارة تقييم الأثر البيئي' : 'Environmental Impact Assessment Dept.'}
                   </p>
                </div>
                <div className="text-right text-slate-500 dark:text-slate-400 text-sm font-mono font-bold bg-th-surface2 px-3 py-1.5 rounded-lg border border-th-border">
                  {formatDate(new Date().toISOString())}
                </div>
             </div>
             <h2 className="text-3xl font-black text-th-text mt-6 mb-1">{getReportTitle()}</h2>
             <p className="text-slate-500 dark:text-slate-400 font-mono text-sm tracking-wide">REF: {item.id}</p>
           </div>

           {/* Core Data Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              
              <FieldCard icon={Calendar} label={isAr ? 'تاريخ التقرير' : 'Report Date'} value={formatDate(item.date)} />
              
              {type !== 'costs' && (
                <FieldCard 
                  icon={MapPin} 
                  label={isAr ? 'الموقع' : 'Location'} 
                  value={
                    <>
                      {isAr ? (item.locationNameAr || item.locationName) : item.locationName}
                      <span className="block text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 font-medium bg-th-surface2 inline-block px-2 py-0.5 rounded">
                        {item.latitude}, {item.longitude}
                      </span>
                    </>
                  } 
                />
              )}

              {/* Conditional Fields based on Type */}
              {type === 'costs' && (
                <>
                  <FieldCard icon={DollarSign} label={isAr ? 'الموضوع' : 'Subject'} value={item.subject} />
                  <FieldCard icon={Activity} label={isAr ? 'الحالة' : 'Status'} value={
                    item.status === 'ANSWERED' ? (isAr ? 'تم الرد' : 'Answered') : (isAr ? 'قيد الانتظار' : 'Unanswered')
                  } />
                </>
              )}

              {type === 'inspections' && (
                <>
                  <FieldCard icon={User} label={isAr ? 'اسم المفتش' : 'Inspector Name'} value={item.inspectorName} />
                </>
              )}

              {type === 'violations' && (
                <>
                  <FieldCard icon={ShieldAlert} label={isAr ? 'نوع المخالفة' : 'Violation Type'} value={item.type} />
                  <FieldCard icon={User} label={isAr ? 'الجهة المخالفة' : 'Violating Entity'} value={
                    `${item.entityName} (${item.entityType === 'PROJECT' ? (isAr ? 'مشروع' : 'Project') : (isAr ? 'شخص' : 'Person')})`
                  } />
                </>
              )}

              {type === 'accidents' && (
                <>
                  <FieldCard icon={AlertCircle} label={isAr ? 'نوع الحادث' : 'Accident Type'} value={item.type} />
                </>
              )}

           </div>

           {/* Descriptive Text Area */}
           {(item.details || item.description) && (
             <div className="mb-8 bg-th-surface2 border border-th-border rounded-2xl p-5 md:p-6">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-white/10 pb-3">
                   <FileText size={14} className="text-teal-600 dark:text-teal-400" /> {isAr ? 'تفاصيل وملاحظات' : 'Details & Notes'}
                </span>
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                  {item.details || item.description}
                </p>
             </div>
           )}

           {/* Attachments Section (if applicable) */}
           {item.studyFileUrl && (
             <div className="mb-4 no-print">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-3">
                   {isAr ? 'ملف دراسة تقييم الأثر' : 'EIA Study File'}
                </span>
                <a 
                  href={item.studyFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-3 bg-th-surface2 hover:bg-th-surface border border-th-border text-th-text rounded-xl text-sm font-bold transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-th-surface flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                     <FileText size={16} />
                  </div>
                  {isAr ? 'عرض أو تحميل الملف المرفق' : 'View / Download Attached File'}
                </a>
             </div>
           )}

           {item.reportFileUrl && (
             <div className="mb-4 no-print">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-3">
                   {isAr ? 'ملف التقرير' : 'Report File'}
                </span>
                <a 
                  href={item.reportFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-3 bg-th-surface2 hover:bg-th-surface border border-th-border text-th-text rounded-xl text-sm font-bold transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-th-surface flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                     <FileText size={16} />
                  </div>
                  {isAr ? 'عرض أو تحميل التقرير' : 'View / Download Report'}
                </a>
             </div>
           )}

           {item.files && item.files.length > 0 && (
             <div className="mb-8 no-print">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-3">
                   {isAr ? 'المرفقات المرتبطة' : 'Linked Attachments'}
                </span>
                <div className="flex flex-col gap-2">
                  {item.files.map((f: any, idx: number) => (
                    <a 
                      key={idx}
                      href={f.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-5 py-3 bg-th-surface2 hover:bg-th-surface border border-th-border text-th-text rounded-xl text-sm font-bold transition-all group w-fit max-w-full"
                    >
                      <div className="w-8 h-8 rounded-lg min-w-8 bg-th-surface flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                         <FileText size={16} />
                      </div>
                      <span className="truncate">{f.name || (isAr ? 'ملف مرفق' : 'Attached File')}</span>
                    </a>
                  ))}
                </div>
             </div>
           )}

           {/* Print Footer / Signatures */}
           <div className="mt-16 pt-8 border-t-2 border-slate-800 dark:border-white/20 flex justify-between items-end print-footer hidden-on-screen">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8">
                   {isAr ? 'توقيع المفتش / الباحث' : 'Inspector / Researcher Signature'}
                 </p>
                 <div className="w-48 border-b-2 border-slate-800 dark:border-slate-400"></div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8">
                   {isAr ? 'توقيع واعتماد مدير القسم' : 'Department Manager Signature & Approval'}
                 </p>
                 <div className="w-48 border-b-2 border-slate-800 dark:border-slate-400 inline-block"></div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
