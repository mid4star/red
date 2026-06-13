'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGISStore } from '../store/gisStore';
import { Map, Mountain, Anchor, Moon, Navigation } from 'lucide-react';
import L from 'leaflet';

const BASEMAPS = [
  { id: 'satellite', nameAr: 'قمر صناعي', name: 'Satellite', icon: Navigation, descAr: 'صور فضائية دقيقة', desc: 'High-res imagery' },
  { id: 'marine', nameAr: 'بحري', name: 'Marine', icon: Anchor, descAr: 'أعماق ومسارات بحرية', desc: 'Depths & routes' },
  { id: 'terrain', nameAr: 'تضاريس', name: 'Terrain', icon: Mountain, descAr: 'طبوغرافيا وجبال', desc: 'Topography & mountains' },
  { id: 'dark', nameAr: 'داكن', name: 'Dark Mode', icon: Moon, descAr: 'مثالي للتحليلات', desc: 'Ideal for analytics' },
  { id: 'street', nameAr: 'شوارع', name: 'Street', icon: Map, descAr: 'خريطة قياسية', desc: 'Standard map' }
];

export default function BasemapSwitcher({ isArabic }: { isArabic: boolean }) {
  const { activeBasemap, setActiveBasemap } = useGISStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current);
      L.DomEvent.disableScrollPropagation(containerRef.current);
    }
  }, []);

  const activeMap = BASEMAPS.find(m => m.id === activeBasemap) || BASEMAPS[0];
  const ActiveIcon = activeMap.icon;

  return (
    <div ref={containerRef} className={`absolute bottom-6 ${isArabic ? 'right-6' : 'left-6'} z-[1000]`}>
      
      {/* Options Menu */}
      {isOpen && (
        <div className="mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 w-48 flex flex-col gap-1 animate-in slide-in-from-bottom-2 fade-in duration-200 gis-floating-panel">
          {BASEMAPS.map((map) => {
            const Icon = map.icon;
            const isActive = activeBasemap === map.id;
            return (
              <button
                key={map.id}
                onClick={() => {
                  setActiveBasemap(map.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full p-2 rounded-xl text-${isArabic ? 'right' : 'left'} transition-all ${
                  isActive ? 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-teal-500 text-white' : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}>
                  <Icon size={14} />
                </div>
                <div>
                  <div className="text-xs">{isArabic ? map.nameAr : map.name}</div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{isArabic ? map.descAr : map.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-2xl p-2 pr-4 pl-4 hover:scale-105 transition-all text-slate-850 dark:text-slate-100 gis-floating-panel"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="bg-teal-500 text-white p-2 rounded-full">
          <ActiveIcon size={16} />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold leading-none">{isArabic ? 'طبقة الأساس' : 'Basemap'}</span>
          <span className="text-xs font-black leading-none mt-1 text-slate-900 dark:text-white">{isArabic ? activeMap.nameAr : activeMap.name}</span>
        </div>
      </button>

    </div>
  );
}
