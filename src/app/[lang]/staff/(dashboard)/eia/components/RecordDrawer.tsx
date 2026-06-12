'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RecordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  lang: string;
}

export default function RecordDrawer({
  isOpen,
  onClose,
  title,
  isSubmitting,
  onSubmit,
  children,
  lang
}: RecordDrawerProps) {
  const isAr = lang === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: isAr ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isAr ? '-100%' : '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`fixed top-0 bottom-0 ${isAr ? 'left-0' : 'right-0'} w-full md:w-[450px] lg:w-[500px] bg-th-surface border-${isAr ? 'r' : 'l'} border-th-border shadow-2xl z-[9999] flex flex-col`}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between p-5 border-b border-th-border bg-th-surface2">
              <h2 className="text-lg font-black text-th-text tracking-wide">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-th-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-th-bg">
              <form id="record-form" onSubmit={onSubmit} className="space-y-5">
                {children}
              </form>
            </div>

            <div className="p-5 border-t border-th-border bg-th-surface2 flex items-center justify-end gap-3">
              <Button type="button" onClick={onClose} disabled={isSubmitting} className="bg-th-surface border border-th-border text-th-text hover:bg-th-surface2">
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                type="submit" 
                form="record-form"
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-500 text-white min-w-[120px] shadow-lg shadow-teal-900/20"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Save size={16} />
                    {isAr ? 'حفظ السجل' : 'Save Record'}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
