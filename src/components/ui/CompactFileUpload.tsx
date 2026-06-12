'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CompactFileUploadProps {
  endpoint: string;
  onUploadComplete: (files: { url: string; name: string; type: string }[]) => void;
  lang: string;
  accept?: string;
}

export function CompactFileUpload({ endpoint, onUploadComplete, lang, accept = 'image/*,application/pdf' }: CompactFileUploadProps) {
  const isAr = lang === 'ar';
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`/api/upload?endpoint=${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      const fileData = { url: data.url, name: file.name, type: file.type };
      setUploadedFile(fileData);
      onUploadComplete([fileData]);
    } catch (error) {
      console.error('Upload error:', error);
      alert(isAr ? 'فشل رفع الملف' : 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadedFile) {
    const isImage = uploadedFile.type.startsWith('image/');
    return (
      <div className="flex items-center justify-between p-2 bg-th-surface2 border border-th-border rounded-lg group">
        <div className="flex items-center gap-3 overflow-hidden">
          {isImage ? (
            <img src={uploadedFile.url} alt="Uploaded" className="w-10 h-10 object-cover rounded-md border border-th-border/50" />
          ) : (
            <div className="w-10 h-10 bg-teal-500/10 text-teal-600 rounded-md flex items-center justify-center shrink-0">
              <File size={20} />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-th-text truncate" title={uploadedFile.name}>{uploadedFile.name}</span>
            <span className="text-[10px] text-teal-500 font-medium">
              {isAr ? 'تم الرفع بنجاح' : 'Uploaded successfully'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setUploadedFile(null);
            onUploadComplete([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="p-1.5 text-th-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors shrink-0 mx-1"
          title={isAr ? 'إزالة الملف' : 'Remove file'}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`w-full flex items-center justify-center gap-2 p-3 border border-dashed border-th-border rounded-lg cursor-pointer transition-all ${
          isUploading ? 'bg-th-surface2 cursor-wait' : 'bg-th-input hover:bg-th-surface hover:border-teal-500/50 hover:text-teal-500 group'
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 size={18} className="animate-spin text-teal-500" />
            <span className="text-xs font-bold text-th-text">{isAr ? 'جاري الرفع...' : 'Uploading...'}</span>
          </>
        ) : (
          <>
            <UploadCloud size={18} className="text-th-muted group-hover:text-teal-500 transition-colors" />
            <span className="text-xs font-medium text-th-muted group-hover:text-teal-600 transition-colors">
              {isAr ? 'انقر لرفع ملف أو صورة' : 'Click to upload file or image'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
