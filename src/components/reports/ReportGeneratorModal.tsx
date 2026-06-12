'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export default function ReportGeneratorModal({ isOpen, onClose, lang }: ReportGeneratorModalProps) {
  const isArabic = lang === 'ar';
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reserve, setReserve] = useState('ALL');
  const [reservesList, setReservesList] = useState<{id: string, name: string, nameAr: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    fetch('/api/staff/query?collection=reserves')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          const loadedReserves = data.data.map((r: any) => ({
            id: r.id,
            name: r.name,
            nameAr: r.nameAr
          }));
          setReservesList(loadedReserves);
        }
      })
      .catch(err => console.error("Failed to fetch reserves", err));
  }, []);

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      alert(isArabic ? 'يرجى تحديد فترة التقرير' : 'Please select a date range');
      return;
    }
    
    setIsGenerating(true);
    
    // Redirect to the report view with query params
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      reserve: reserve
    });
    
    window.location.href = `/${lang}/staff/report-view?${params.toString()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-th-surface border border-th-border rounded-3xl shadow-2xl overflow-hidden"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-th-border bg-th-surface2/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-th-text dark:text-white">
                    {isArabic ? 'إنشاء تقرير شامل' : 'Generate Comprehensive Report'}
                  </h2>
                  <p className="text-xs text-th-muted mt-1">
                    {isArabic ? 'استخراج البيانات من جميع قواعد بيانات المحميات' : 'Extract data from all reserves databases'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-th-surface2 text-th-muted transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-th-text flex items-center gap-2">
                      <Calendar size={16} className="text-indigo-500" />
                      {isArabic ? 'تاريخ البداية' : 'Start Date'}
                    </label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-th-surface2 border border-th-border rounded-xl px-4 py-3 text-sm text-th-text focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-th-text flex items-center gap-2">
                      <Calendar size={16} className="text-indigo-500" />
                      {isArabic ? 'تاريخ النهاية' : 'End Date'}
                    </label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-th-surface2 border border-th-border rounded-xl px-4 py-3 text-sm text-th-text focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-th-text flex items-center gap-2">
                    <MapPin size={16} className="text-teal-500" />
                    {isArabic ? 'المحمية (النطاق الجغرافي)' : 'Reserve (Geographic Scope)'}
                  </label>
                  <select 
                    value={reserve}
                    onChange={(e) => setReserve(e.target.value)}
                    className="w-full bg-th-surface2 border border-th-border rounded-xl px-4 py-3 text-sm text-th-text focus:outline-none focus:ring-2 focus:ring-teal-500/50 appearance-none"
                  >
                    <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white" value="ALL">{isArabic ? 'جميع المحميات والقطاعات' : 'All Reserves & Sectors'}</option>
                    {reservesList.map(r => (
                      <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white" key={r.id} value={r.id}>{isArabic ? r.nameAr : r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notice */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {isArabic 
                  ? 'سيتم تجميع البيانات من (الدوريات، المخالفات، المسوحات البيئية، الحوادث، وغيرها) وتوليد التقرير بتنسيق A4 احترافي جاهز للطباعة.'
                  : 'Data will be aggregated from (Patrols, Violations, Surveys, Incidents, etc.) and compiled into a professional A4 printable format.'}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-th-border bg-th-surface2/30 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} className="rounded-xl px-6">
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isArabic ? 'جاري التحضير...' : 'Preparing...'}
                  </>
                ) : (
                  isArabic ? 'توليد التقرير' : 'Generate Report'
                )}
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
