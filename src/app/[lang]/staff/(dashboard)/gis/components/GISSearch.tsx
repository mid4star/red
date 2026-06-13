'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGISStore } from '../store/gisStore';
import { Search, MapPin } from 'lucide-react';
import L from 'leaflet';

export default function GISSearch({ isArabic }: { isArabic: boolean }) {
  const { features, setSearchedFeatureId } = useGISStore();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current);
      L.DomEvent.disableScrollPropagation(containerRef.current);
    }
  }, []);

  const filteredFeatures = features.filter(f => {
    if (!query) return false;
    const name = f.properties.name?.toLowerCase() || '';
    const nameAr = f.properties.nameAr?.toLowerCase() || '';
    const desc = f.properties.description?.toLowerCase() || '';
    const descAr = f.properties.descriptionAr?.toLowerCase() || '';
    const q = query.toLowerCase();
    
    return name.includes(q) || nameAr.includes(q) || desc.includes(q) || descAr.includes(q);
  }).slice(0, 5); // limit to 5 results

  return (
    <div ref={containerRef} className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[300px] md:w-[400px]">
      <div className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isArabic ? 'بحث في الخريطة...' : 'Search in map...'}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-2xl focus:outline-none focus:border-teal-500 transition-colors gis-floating-panel"
          dir={isArabic ? 'rtl' : 'ltr'}
        />
        <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 dark:text-slate-500" size={18} />
      </div>

      {isOpen && query && filteredFeatures.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden gis-floating-panel" dir={isArabic ? 'rtl' : 'ltr'}>
          {filteredFeatures.map(feature => (
            <button 
              key={feature.id}
              onClick={() => {
                setSearchedFeatureId(feature.id);
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full text-start flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0 mt-0.5">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{isArabic ? feature.properties.nameAr : feature.properties.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{isArabic ? feature.properties.descriptionAr : feature.properties.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query && filteredFeatures.length === 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 text-center gis-floating-panel" dir={isArabic ? 'rtl' : 'ltr'}>
          <p className="text-sm text-slate-500 dark:text-slate-400">{isArabic ? 'لا توجد نتائج' : 'No results found'}</p>
        </div>
      )}
    </div>
  );
}
