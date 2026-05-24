'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamic import to prevent SSR issues with Quill
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false, loading: () => <div className="h-64 bg-white/5 rounded-xl animate-pulse" /> });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
}

export default function RichTextEditor({ value, onChange, placeholder, dir = 'ltr' }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'color', 'background',
    'blockquote', 'code-block', 'link', 'image',
  ];

  return (
    <div className="rich-editor-wrapper" dir={dir}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      <style jsx global>{`
        .rich-editor-wrapper .ql-toolbar {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1) !important;
          border-radius: 12px 12px 0 0;
        }
        .rich-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #94a3b8 !important;
        }
        .rich-editor-wrapper .ql-toolbar .ql-fill {
          fill: #94a3b8 !important;
        }
        .rich-editor-wrapper .ql-toolbar .ql-picker-label {
          color: #94a3b8 !important;
        }
        .rich-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2dd4bf !important;
        }
        .rich-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #2dd4bf !important;
        }
        .rich-editor-wrapper .ql-container {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.1) !important;
          border-radius: 0 0 12px 12px;
          min-height: 250px;
          font-family: inherit;
          font-size: 14px;
          color: #e2e8f0;
        }
        .rich-editor-wrapper .ql-editor {
          min-height: 250px;
          color: #e2e8f0;
        }
        .rich-editor-wrapper .ql-editor.ql-blank::before {
          color: #475569;
          font-style: normal;
        }
        .rich-editor-wrapper .ql-editor h1, 
        .rich-editor-wrapper .ql-editor h2, 
        .rich-editor-wrapper .ql-editor h3 {
          color: #f1f5f9;
        }
        .rich-editor-wrapper .ql-picker-options {
          background: #1e293b !important;
          border-color: rgba(255,255,255,0.1) !important;
          border-radius: 8px;
        }
        .rich-editor-wrapper .ql-picker-item {
          color: #94a3b8 !important;
        }
        .rich-editor-wrapper .ql-picker-item:hover {
          color: #2dd4bf !important;
        }
        .rich-editor-wrapper .ql-snow .ql-tooltip {
          background: #1e293b;
          border-color: rgba(255,255,255,0.1);
          color: #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        .rich-editor-wrapper .ql-snow .ql-tooltip input[type=text] {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          color: #e2e8f0;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
