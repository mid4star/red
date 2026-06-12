'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SpeciesSelectorProps {
  value: string;
  onChange: (val: string) => void;
  lang: string;
  onAddNew: () => void;
  speciesList: any[];
}

export default function SpeciesSelector({ value, onChange, lang, onAddNew, speciesList }: SpeciesSelectorProps) {
  const isAr = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = speciesList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.nameAr && s.nameAr.includes(searchTerm))
  );

  const displayValue = speciesList.find(s => s.name === value || s.nameAr === value)?.nameAr || value;

  return (
    <div className="relative w-full" ref={wrapperRef} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex gap-2">
        <div 
          className="flex-1 h-10 bg-th-input border border-th-border rounded-lg px-3 flex items-center cursor-pointer text-sm text-th-text"
          onClick={() => setIsOpen(!isOpen)}
        >
          {displayValue || (isAr ? 'اختر الكائن...' : 'Select Species...')}
        </div>
        <Button 
          type="button"
          onClick={onAddNew}
          className="w-10 h-10 p-0 bg-teal-500/10 text-teal-600 hover:bg-teal-500 hover:text-white rounded-lg flex-shrink-0"
          title={isAr ? 'إضافة كائن جديد' : 'Add New Species'}
        >
          <Plus size={18} />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-th-surface border border-th-border rounded-xl shadow-xl z-[10000] overflow-hidden max-h-64 flex flex-col">
          <div className="p-2 border-b border-th-border flex items-center gap-2 bg-th-surface2">
            <Search size={14} className="text-th-muted" />
            <input 
              type="text" 
              className="flex-1 bg-transparent border-none outline-none text-xs text-th-text" 
              placeholder={isAr ? 'ابحث...' : 'Search...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-th-muted">
                {isAr ? 'لم يتم العثور على نتائج' : 'No results found'}
                <Button 
                  type="button" 
                  className="w-full mt-2 bg-transparent text-teal-500 hover:text-teal-600 hover:bg-th-surface border border-dashed border-teal-500/30"
                  onClick={() => {
                    setIsOpen(false);
                    onAddNew();
                  }}
                >
                  <Plus size={14} className={isAr ? 'ml-1' : 'mr-1'} />
                  {isAr ? 'إضافة هذا الكائن' : 'Add this species'}
                </Button>
              </div>
            ) : (
              filtered.map(s => (
                <div 
                  key={s.id} 
                  className={`p-2 flex items-center gap-3 cursor-pointer hover:bg-th-surface2 rounded-lg transition-colors ${value === s.name ? 'bg-teal-500/10' : ''}`}
                  onClick={() => {
                    onChange(s.name);
                    setIsOpen(false);
                  }}
                >
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt={s.name} className="w-8 h-8 rounded-md object-cover bg-th-surface2" />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-th-surface2 flex items-center justify-center text-[10px] text-th-muted uppercase font-bold">
                      {s.name.substring(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-th-text truncate">{isAr && s.nameAr ? s.nameAr : s.name}</div>
                    <div className="text-[10px] text-th-muted truncate">{isAr ? s.name : s.nameAr}</div>
                  </div>
                  {value === s.name && <Check size={14} className="text-teal-500" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
