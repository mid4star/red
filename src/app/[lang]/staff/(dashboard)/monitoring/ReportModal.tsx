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
      case 'eco_programs': return <Activity size={24} className="text-teal-600 print-icon" />;
      case 'stranding_cases': return <AlertCircle size={24} className="text-rose-600 print-icon" />;
      case 'sightings': return <Compass size={24} className="text-indigo-600 print-icon" />;
      case 'beach_surveys': return <Waves size={24} className="text-amber-600 print-icon" />;
      default: return <FileText size={24} className="text-slate-600 print-icon" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 no-print-bg backdrop-blur-sm bg-slate-900/80 transition-all duration-300">
      
      {/* Background click to close (no-print) */}
      <div className="absolute inset-0 no-print cursor-pointer" onClick={onClose} />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] print-modal-container"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        
        {/* Header - No Print (Action bar) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
               {getIcon()}
             </div>
             <div>
               <h3 className="font-black text-slate-800 text-lg">{getReportTitle()}</h3>
               <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">ID: {item.id}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">{isAr ? 'طباعة التقرير (PDF)' : 'Print to PDF'}</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content */}
        <div className="overflow-y-auto p-8 print-content bg-white text-slate-900 w-full h-full">
           
           {/* Report Header for Print */}
           <div className="border-b-2 border-slate-900 pb-6 mb-8 print-header">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900 mb-1">
                     {isAr ? 'محميات البحر الأحمر' : 'Red Sea Reserves'}
                   </h1>
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                     {isAr ? 'إدارة الرصد البيئي' : 'Environmental Monitoring Dept.'}
                   </p>
                </div>
                <div className="text-right text-slate-500 text-sm font-mono">
                  {formatDate(new Date().toISOString())}
                </div>
             </div>
             <h2 className="text-3xl font-black text-slate-900">{getReportTitle()}</h2>
             <p className="text-slate-500 font-mono mt-2">REF: {item.id}</p>
           </div>

           {/* Core Data Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
              
              {/* Common Fields */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                   <Calendar size={12} /> {isAr ? 'تاريخ التقرير' : 'Report Date'}
                </span>
                <p className="text-base font-bold text-slate-900">{formatDate(item.date)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                   <MapPin size={12} /> {isAr ? 'الموقع' : 'Location'}
                </span>
                <p className="text-base font-bold text-slate-900">
                  {isAr ? (item.locationNameAr || item.locationName) : item.locationName}
                  <span className="block text-xs text-slate-500 font-mono mt-0.5">
                    {item.latitude}, {item.longitude}
                  </span>
                </p>
              </div>

              {/* Conditional Fields based on DataType */}
              {item.dataType === 'eco_programs' && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                      <Activity size={12} /> {isAr ? 'نوع البرنامج' : 'Program Type'}
                    </span>
                    <p className="text-base font-bold text-slate-900">{item.program}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                      <FileText size={12} /> {isAr ? 'التصنيف الفرعي' : 'Subtype'}
                    </span>
                    <p className="text-base font-bold text-slate-900">{item.subType || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                      <User size={12} /> {isAr ? 'اسم الراصد' : 'Observer'}
                    </span>
                    <p className="text-base font-bold text-slate-900">{item.observerName}</p>
                  </div>
                </>
              )}

              {item.dataType === 'stranding_cases' && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                      <AlertCircle size={12} /> {isAr ? 'الفصيلة' : 'Species'}
                    </span>
                    <p className="text-base font-bold text-slate-900">{isAr ? (item.speciesAr || item.species) : item.species}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                      <Activity size={12} /> {isAr ? 'الحالة' : 'Status'}
                    </span>
                    <p className="text-base font-bold text-slate-900">{item.status}</p>
                  </div>
                </>
              )}

              {item.dataType === 'sightings' && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                      <Compass size={12} /> {isAr ? 'الكائن' : 'Species'}
                    </span>
                    <p className="text-base font-bold text-slate-900">{isAr ? (item.speciesAr || item.species) : item.species}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                      <FileText size={12} /> {isAr ? 'العدد المرصود' : 'Count'}
                    </span>
                    <p className="text-base font-bold text-slate-900">{item.count}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                      <User size={12} /> {isAr ? 'اسم الراصد' : 'Observer'}
                    </span>
                    <p className="text-base font-bold text-slate-900">{item.observerName}</p>
                  </div>
                </>
              )}

           </div>

           {/* Descriptive Text Area */}
           {(item.details || item.description || item.notes) && (
             <div className="mb-10">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-3 border-b border-slate-200 pb-2">
                   <FileText size={12} /> {isAr ? 'تفاصيل وملاحظات التقرير' : 'Report Details & Notes'}
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.details || item.description || item.notes}
                </p>
             </div>
           )}

           {/* Attachments Section (if applicable) */}
           {item.attachedFileUrl && (
             <div className="mb-10 no-print">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5 mb-3 border-b border-slate-200 pb-2">
                   {isAr ? 'المرفقات' : 'Attachments'}
                </span>
                <a 
                  href={item.attachedFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all"
                >
                  <FileText size={16} />
                  {isAr ? 'عرض الملف المرفق' : 'View Attached File'}
                </a>
             </div>
           )}

           {/* Print Footer / Signatures */}
           <div className="mt-16 pt-8 border-t-2 border-slate-900 flex justify-between items-end print-footer hidden-on-screen">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">
                   {isAr ? 'توقيع الراصد / المفتش' : 'Observer / Inspector Signature'}
                 </p>
                 <div className="w-48 border-b border-slate-400"></div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">
                   {isAr ? 'توقيع مدير القسم' : 'Department Manager Signature'}
                 </p>
                 <div className="w-48 border-b border-slate-400 inline-block"></div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
