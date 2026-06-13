'use client';

import React, { useRef, useEffect } from 'react';
import { useGISStore } from '../store/gisStore';
import { X, Calendar, Activity, Info, BarChart3, Clock, AlertCircle, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import L from 'leaflet';

export default function FeatureDetailPanel({ isArabic }: { isArabic: boolean }) {
  const { selectedFeatureId, setSelectedFeatureId, features, layers } = useGISStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current);
      L.DomEvent.disableScrollPropagation(containerRef.current);
    }
  }, [selectedFeatureId]); // run when selectedFeatureId changes to bind to DOM
  
  if (!selectedFeatureId) return null;

  const feature = features.find(f => f.id === selectedFeatureId);
  if (!feature) return null;

  const layer = layers.find(l => l.id === feature.layerId);
  const name = isArabic ? feature.properties.nameAr : feature.properties.name;
  const description = isArabic ? feature.properties.descriptionAr : feature.properties.description;
  const layerName = layer ? (isArabic ? layer.nameAr : layer.name) : '';

  return (
    <div 
      ref={containerRef}
      className={`absolute top-4 bottom-4 ${isArabic ? 'left-4' : 'right-4'} w-[350px] md:w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[1010] flex flex-col animate-in slide-in-from-${isArabic ? 'left' : 'right'} duration-300 rounded-2xl overflow-hidden gis-floating-panel`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 shrink-0">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Info size={18} className="text-teal-500" />
          {isArabic ? 'التفاصيل الكاملة' : 'Full Details'}
        </h2>
        <button 
          onClick={() => setSelectedFeatureId(null)} 
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-350 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
        
        {/* Cover Images Gallery */}
        {feature.properties.images && feature.properties.images.length > 0 ? (
          <div className="w-full h-48 rounded-xl overflow-hidden bg-th-surface2 border border-th-border relative group">
             <img src={feature.properties.images[0]} alt={name} className="w-full h-full object-cover" />
             {feature.properties.images.length > 1 && (
               <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-bold">
                 + {feature.properties.images.length - 1} {isArabic ? 'صور إضافية' : 'More Images'}
               </div>
             )}
          </div>
        ) : (
          <div className="w-full h-32 rounded-xl bg-th-surface2 border border-th-border flex flex-col items-center justify-center text-th-muted">
            <Info size={24} className="mb-2 opacity-50" />
            <span className="text-xs font-bold">{isArabic ? 'لا توجد وسائط' : 'No Media Available'}</span>
          </div>
        )}

        {/* Basic Info */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h1 className="text-2xl font-black text-th-text m-0 leading-tight">{name}</h1>
            {feature.properties.status && (
              <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${
                feature.properties.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                feature.properties.status === 'critical' ? 'bg-red-500/10 text-red-600' :
                'bg-th-muted/10 text-th-muted'
              }`}>
                {feature.properties.status}
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-th-muted leading-relaxed mb-4">{description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-th-surface2 border border-th-border rounded-lg text-xs font-bold text-th-text">
               <Layers size={14} className="text-teal-500" />
               {layerName}
             </div>
             {(feature.createdAt || feature.updatedAt) && (
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-th-surface2 border border-th-border rounded-lg text-xs font-bold text-th-text">
                 <Calendar size={14} className="text-teal-500" />
                 {new Date(feature.updatedAt || feature.createdAt!).toLocaleDateString()}
               </div>
             )}
          </div>
        </div>

        {/* Progress & Status */}
        {feature.properties.progress !== undefined && (
          <div className="p-4 bg-th-surface2 border border-th-border rounded-xl">
            <h3 className="text-xs font-bold text-th-text flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-teal-500" />
              {isArabic ? 'نسبة الإنجاز والحالة' : 'Progress & Status'}
            </h3>
            <div className="flex justify-between text-2xl font-black text-teal-500 mb-2">
              <span>{feature.properties.progress}%</span>
            </div>
            <div className="w-full bg-th-surface rounded-full h-3 overflow-hidden border border-th-border">
              <div className="bg-gradient-to-r from-teal-400 to-teal-500 h-full rounded-full transition-all duration-1000" style={{ width: `${feature.properties.progress}%` }}></div>
            </div>
          </div>
        )}

        {/* Environmental Readings (Enlarged) */}
        {feature.properties.readings && feature.properties.readings.length > 0 && (
          <div className="p-4 bg-th-surface2 border border-th-border rounded-xl">
            <h3 className="text-sm font-bold text-th-text flex items-center gap-2 mb-4">
              <Activity size={16} className="text-teal-500" />
              {isArabic ? 'تحليل المراقبة البيئية' : 'Environmental Monitoring Analysis'}
            </h3>
            
            <div className="h-40 w-full bg-th-surface rounded-lg p-2 border border-th-border">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feature.properties.readings} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="date" tickFormatter={(t) => new Date(t).toLocaleDateString()} fontSize={9} stroke="#888" />
                  <YAxis fontSize={9} stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    labelFormatter={(l) => new Date(l).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {feature.properties.readings.map((r: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-th-border/50 last:border-0">
                  <span className="font-bold text-th-muted">{new Date(r.date).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <span className="text-th-text">{r.type}</span>
                    <span className="font-bold text-teal-500">{r.value} {r.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Data (For experts) */}
        <div className="p-4 bg-th-surface2 border border-th-border rounded-xl">
           <h3 className="text-xs font-bold text-th-text flex items-center gap-2 mb-2">
             <AlertCircle size={14} className="text-teal-500" />
             {isArabic ? 'تفاصيل مكانية' : 'Spatial Details'}
           </h3>
           <div className="text-[10px] font-mono text-th-muted break-all bg-th-surface p-2 rounded border border-th-border max-h-32 overflow-y-auto">
             Type: {feature.type}
             <br />
             Coordinates: {JSON.stringify(feature.coordinates).substring(0, 50)}...
           </div>
        </div>

      </div>
    </div>
  );
}
