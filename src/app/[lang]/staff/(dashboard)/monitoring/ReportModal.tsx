'use client';

import React from 'react';
import { X, Printer, MapPin, Calendar, Activity, AlertCircle, Compass, Waves, User, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  lang: string;
}

export default function ReportModal({ isOpen, onClose, item, lang }: ReportModalProps) {
  if (!isOpen || !item) return null;

  const isAr = lang === 'ar';

  const handlePrint = () => {
    window.print();
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
    switch (item.dataType) {
      case 'eco_programs': return isAr ? 'تقرير برنامج بيئي' : 'Ecological Program Report';
      case 'stranding_cases': return isAr ? 'تقرير حالة جنوح' : 'Stranding Case Report';
      case 'sightings': return isAr ? 'تقرير مشاهدة كائنات' : 'Wildlife Sighting Report';
      case 'beach_surveys': return isAr ? 'تقرير مسح شاطئي' : 'Beach Survey Report';
      default: return isAr ? 'تقرير الرصد البيئي' : 'Environmental Monitoring Report';
    }
  };

  const getIcon = () => {
    switch (item.dataType) {
      case 'eco_programs': return <Activity size={24} className="text-teal-500 print-icon" />;
      case 'stranding_cases': return <AlertCircle size={24} className="text-rose-500 print-icon" />;
      case 'sightings': return <Compass size={24} className="text-indigo-500 print-icon" />;
      case 'beach_surveys': return <Waves size={24} className="text-amber-500 print-icon" />;
      default: return <FileText size={24} className="text-slate-500 print-icon" />;
    }
  };

  const FieldCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: React.ReactNode }) => (
    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-1 transition-all hover:bg-slate-100 dark:hover:bg-white/[0.04]">
      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
         <Icon size={12} className="text-teal-600 dark:text-teal-400" /> {label}
      </span>
      <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white break-words">
        {value}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 no-print-bg backdrop-blur-md bg-black/60 dark:bg-[#050b14]/80 transition-all duration-300">
      
      {/* Background click to close (no-print) */}
      <div className="absolute inset-0 no-print cursor-pointer" onClick={onClose} />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#0a1628] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-white/10 print-modal-container"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        
        {/* Header - No Print (Action bar) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-[#0d1b2a]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3.5">
             <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center">
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
              className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content */}
        <div className="overflow-y-auto p-6 md:p-10 print-content text-slate-900 dark:text-slate-100 flex-1 min-h-0 w-full custom-scrollbar bg-white dark:bg-transparent">
           
           {/* Report Header for Print */}
           <div className="border-b-2 border-slate-800 dark:border-white/20 pb-6 mb-8 print-header">
             <div className="flex justify-between items-start mb-5">
                <div>
                   <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">
                     {isAr ? 'محميات البحر الأحمر' : 'Red Sea Reserves'}
                   </h1>
                   <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                     {isAr ? 'إدارة الرصد البيئي' : 'Environmental Monitoring Dept.'}
                   </p>
                </div>
                <div className="text-right text-slate-500 dark:text-slate-400 text-sm font-mono font-bold bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                  {formatDate(new Date().toISOString())}
                </div>
             </div>
             <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-6 mb-1">{getReportTitle()}</h2>
             <p className="text-slate-500 dark:text-slate-400 font-mono text-sm tracking-wide">REF: {item.id}</p>
           </div>

           {/* Core Data Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              
              <FieldCard icon={Calendar} label={isAr ? 'تاريخ التقرير' : 'Report Date'} value={formatDate(item.date)} />
              
              <FieldCard 
                icon={MapPin} 
                label={isAr ? 'الموقع' : 'Location'} 
                value={
                  <>
                    {isAr ? (item.locationNameAr || item.locationName) : item.locationName}
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 font-medium bg-slate-200/50 dark:bg-black/20 inline-block px-2 py-0.5 rounded">
                      {item.latitude}, {item.longitude}
                    </span>
                  </>
                } 
              />

              {/* Conditional Fields based on DataType */}
              {item.dataType === 'eco_programs' && (
                <>
                  <FieldCard icon={Activity} label={isAr ? 'نوع البرنامج' : 'Program Type'} value={item.program} />
                  <FieldCard icon={FileText} label={isAr ? 'التصنيف الفرعي' : 'Subtype'} value={item.subType || '—'} />
                  <FieldCard icon={User} label={isAr ? 'اسم الراصد' : 'Observer'} value={item.observerName} />
                </>
              )}

              {item.dataType === 'stranding_cases' && (
                <>
                  <FieldCard icon={AlertCircle} label={isAr ? 'الفصيلة' : 'Species'} value={isAr ? (item.speciesAr || item.species) : item.species} />
                  <FieldCard icon={Activity} label={isAr ? 'الحالة' : 'Status'} value={item.status} />
                </>
              )}

              {item.dataType === 'sightings' && (
                <>
                  <FieldCard icon={Compass} label={isAr ? 'الكائن' : 'Species'} value={isAr ? (item.speciesAr || item.species) : item.species} />
                  <FieldCard icon={Activity} label={isAr ? 'العدد المرصود' : 'Count'} value={item.count} />
                  <FieldCard icon={User} label={isAr ? 'اسم الراصد' : 'Observer'} value={item.observerName} />
                </>
              )}

           </div>

           {/* Descriptive Text Area */}
           {(item.details || item.description || item.notes) && (
             <div className="mb-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-5 md:p-6">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-white/10 pb-3">
                   <FileText size={14} className="text-teal-600 dark:text-teal-400" /> {isAr ? 'تفاصيل وملاحظات التقرير' : 'Report Details & Notes'}
                </span>
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                  {item.details || item.description || item.notes}
                </p>
             </div>
           )}

           {/* Attachments Section (if applicable) */}
           {item.attachedFileUrl && (
             <div className="mb-8 no-print">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4">
                   {isAr ? 'المرفقات المرتبطة' : 'Linked Attachments'}
                </span>
                <a 
                  href={item.attachedFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl text-sm font-bold transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                     <FileText size={16} />
                  </div>
                  {isAr ? 'عرض أو تحميل الملف المرفق' : 'View / Download Attached File'}
                </a>
             </div>
           )}

           {/* Print Footer / Signatures */}
           <div className="mt-16 pt-8 border-t-2 border-slate-800 dark:border-white/20 flex justify-between items-end print-footer hidden-on-screen">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8">
                   {isAr ? 'توقيع الراصد / المفتش' : 'Observer / Inspector Signature'}
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
}
