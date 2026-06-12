'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CompactFileUpload } from '@/components/ui/CompactFileUpload';

interface QuickSpeciesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  onSuccess: (newSpecies: any) => void;
}

export default function QuickSpeciesDrawer({ isOpen, onClose, lang, onSuccess }: QuickSpeciesDrawerProps) {
  const isAr = lang === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    nameAr: '',
    type: 'FISH',
    status: 'LEAST_CONCERN',
    description: '',
    descriptionAr: '',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/staff/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: 'marine_species',
          action: 'ADD',
          data: formData
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save species');
      
      onSuccess(json.data);
      onClose();
      setFormData({
        name: '',
        nameAr: '',
        type: 'FISH',
        status: 'LEAST_CONCERN',
        description: '',
        descriptionAr: '',
        imageUrl: ''
      });
    } catch (error) {
      console.error('Error adding species:', error);
      alert(isAr ? 'فشل في حفظ الكائن' : 'Failed to save species');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6" dir={isAr ? 'rtl' : 'ltr'}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="relative w-full max-w-2xl bg-th-surface border border-th-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-th-border bg-th-surface2">
              <h2 className="text-lg font-black text-th-text tracking-wide">
                {isAr ? 'تسجيل كائن بحري جديد' : 'Register New Marine Species'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-th-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-th-bg">
              <form id="species-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'الاسم العلمي / الإنجليزي *' : 'Name (En) *'}</label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'الاسم بالعربية *' : 'Name (Ar) *'}</label>
                    <Input required value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} />
                  </div>
                  
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'الفصيلة' : 'Type'}</label>
                    <select 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full h-10 bg-th-input border border-th-border rounded-lg px-3 text-th-text text-sm focus:outline-none focus:border-teal-500"
                    >
                      <option value="FISH">{isAr ? 'أسماك' : 'Fish'}</option>
                      <option value="MAMMAL">{isAr ? 'ثدييات بحرية' : 'Marine Mammal'}</option>
                      <option value="REPTILE">{isAr ? 'زواحف (سلاحف)' : 'Reptile'}</option>
                      <option value="BIRD">{isAr ? 'طيور بحرية' : 'Bird'}</option>
                      <option value="CORAL">{isAr ? 'شعاب مرجانية' : 'Coral'}</option>
                      <option value="INVERTEBRATE">{isAr ? 'لافقاريات' : 'Invertebrate'}</option>
                      <option value="PLANT">{isAr ? 'نباتات بحرية' : 'Plant'}</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'حالة الحفظ' : 'Conservation Status'}</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full h-10 bg-th-input border border-th-border rounded-lg px-3 text-th-text text-sm focus:outline-none focus:border-teal-500"
                    >
                      <option value="LEAST_CONCERN">{isAr ? 'غير مهدد' : 'Least Concern'}</option>
                      <option value="VULNERABLE">{isAr ? 'معرض للانقراض' : 'Vulnerable'}</option>
                      <option value="ENDANGERED">{isAr ? 'مهدد بالانقراض' : 'Endangered'}</option>
                      <option value="CRITICALLY_ENDANGERED">{isAr ? 'مهدد بخطر أقصى' : 'Critically Endangered'}</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'وصف الكائن (إنجليزي)' : 'Description (En)'}</label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full min-h-[60px] bg-th-input border border-th-border rounded-lg p-3 text-th-text text-sm focus:outline-none focus:border-teal-500 custom-scrollbar"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'وصف الكائن (عربي)' : 'Description (Ar)'}</label>
                    <textarea 
                      value={formData.descriptionAr} 
                      onChange={e => setFormData({...formData, descriptionAr: e.target.value})}
                      className="w-full min-h-[60px] bg-th-input border border-th-border rounded-lg p-3 text-th-text text-sm focus:outline-none focus:border-teal-500 custom-scrollbar"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'صورة الكائن' : 'Image'}</label>
                    <CompactFileUpload 
                      endpoint="imageUploader"
                      onUploadComplete={(files) => setFormData({...formData, imageUrl: files[0]?.url})}
                      lang={lang}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-th-border bg-th-surface2 flex items-center justify-end gap-3">
              <Button type="button" onClick={onClose} disabled={isSubmitting} className="bg-th-surface border border-th-border text-th-text hover:bg-th-surface2">
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                type="submit" 
                form="species-form"
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-500 text-white min-w-[120px] shadow-lg shadow-teal-900/20"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isAr ? 'حفظ الكائن' : 'Save Species')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
