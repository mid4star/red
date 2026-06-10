'use client';

import React, { useState } from 'react';
import { UploadDropzone } from '@/utils/uploadthing';
import { Card } from '@/components/ui/Card';
import { X, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import "@uploadthing/react/styles.css";

export interface FileUploadProps {
  endpoint: 'imageUploader' | 'documentUploader' | 'mediaUploader';
  onUploadComplete: (files: {name: string, url: string, type: string}[]) => void;
  onUploadError?: (error: Error) => void;
  onUploadBegin?: () => void;
  lang: string;
}

export function FileUpload({ endpoint, onUploadComplete, onUploadError, onUploadBegin, lang }: FileUploadProps) {
  const isArabic = lang === 'ar';
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string, type: string}[]>([]);
  const [, setIsUploading] = useState(false);

  const handleRemove = (urlToRemove: string) => {
    const updated = uploadedFiles.filter(f => f.url !== urlToRemove);
    setUploadedFiles(updated);
    onUploadComplete(updated);
  };

  return (
    <div className="w-full space-y-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden relative shadow-inner p-1">
        <UploadDropzone
          endpoint={endpoint}
          config={{ mode: "auto" }}
          onUploadBegin={() => {
            setIsUploading(true);
            if (onUploadBegin) onUploadBegin();
          }}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            if (res) {
              const newFiles = res.map(f => ({ name: f.name, url: f.url, type: f.type }));
              const combined = [...uploadedFiles, ...newFiles];
              setUploadedFiles(combined);
              onUploadComplete(combined);
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false);
            if (onUploadError) onUploadError(error);
            else alert(isArabic ? `حدث خطأ أثناء الرفع: ${error.message}` : `Upload error: ${error.message}`);
          }}
          appearance={{
            container: "w-full min-h-[160px] p-6 flex flex-col items-center justify-center border-2 border-dashed border-teal-500/30 bg-transparent rounded-xl hover:bg-white/5 transition-all outline-none",
            label: "text-slate-300 font-bold tracking-wide mt-4 hover:text-teal-400 transition-colors cursor-pointer",
            allowedContent: "text-slate-500 text-xs mt-2",
            button: "mt-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl px-6 py-2 font-bold shadow-lg shadow-teal-500/20 transition-all ut-uploading:bg-teal-500/50 ut-uploading:cursor-not-allowed",
          }}
          content={{
            label: isArabic ? 'اختر ملفاً أو اسحبه هنا' : 'Choose a file or drag & drop',
            allowedContent: isArabic ? 'يدعم الصور، PDF، و Word' : 'Supports Images, PDF, Word',
            button({ ready }) {
              if (ready) return isArabic ? 'رفع الملفات' : 'Upload Files';
              return isArabic ? 'جاري التحضير...' : 'Getting ready...';
            }
          }}
        />
      </Card>

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              {isArabic ? 'الملفات المرفوعة' : 'Uploaded Files'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {uploadedFiles.map((file) => {
                const isImage = file.type.includes('image');
                return (
                  <motion.div 
                    key={file.url}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 shadow-sm group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isImage ? 'bg-teal-500/20 text-teal-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                        {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white truncate pr-2" title={file.name}>
                          {file.name}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5 text-teal-400">
                          <CheckCircle size={12} />
                          <span className="text-[10px] uppercase font-bold tracking-wide">
                            {isArabic ? 'مكتمل' : 'Complete'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(file.url)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title={isArabic ? 'حذف' : 'Remove'}
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
