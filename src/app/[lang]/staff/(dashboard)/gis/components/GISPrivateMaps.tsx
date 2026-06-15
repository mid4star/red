import React from 'react';
import { useGISStore } from '../store/gisStore';
import { Briefcase, Anchor, Waves, Shield } from 'lucide-react';
import GISMap from './GISMap';
import ProtectedAreasMap from './ProtectedAreasMap';

interface GISPrivateMapsProps {
  isArabic: boolean;
}

export default function GISPrivateMaps({ isArabic }: GISPrivateMapsProps) {
  const { privateMapTab, setPrivateMapTab } = useGISStore();

  // If reserves-boundaries tab is active, render dedicated ProtectedAreasMap
  const isReservesMode = privateMapTab === 'reserves-boundaries';

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] min-h-[600px] gap-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap p-1 bg-th-surface border border-th-border rounded-xl w-max shadow-sm gap-1">
        <button
          onClick={() => setPrivateMapTab('projects')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            privateMapTab === 'projects'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-th-muted hover:text-th-text hover:bg-th-surface2'
          }`}
        >
          <Briefcase size={18} />
          {isArabic ? 'خريطة المشاريع' : 'Projects Map'}
        </button>
        <button
          onClick={() => setPrivateMapTab('buoys')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            privateMapTab === 'buoys'
              ? 'bg-indigo-500 text-white shadow-md'
              : 'text-th-muted hover:text-th-text hover:bg-th-surface2'
          }`}
        >
          <Anchor size={18} />
          {isArabic ? 'خريطة الشمندورات البحرية' : 'Marine Buoys Map'}
        </button>
        <button
          onClick={() => setPrivateMapTab('diving')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            privateMapTab === 'diving'
              ? 'bg-cyan-500 text-white shadow-md'
              : 'text-th-muted hover:text-th-text hover:bg-th-surface2'
          }`}
        >
          <Waves size={18} />
          {isArabic ? 'خريطة مواقع الغوص والسنوركلاينج' : 'Diving & Snorkeling Sites Map'}
        </button>
        <button
          onClick={() => setPrivateMapTab('reserves-boundaries')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            privateMapTab === 'reserves-boundaries'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-th-muted hover:text-th-text hover:bg-th-surface2'
          }`}
        >
          <Shield size={18} />
          {isArabic ? 'حدود المحميات' : 'PA Boundaries'}
        </button>
      </div>

      <div className="flex-1 w-full relative rounded-2xl overflow-hidden border border-th-border shadow-md">
        {!isReservesMode && (
          <div className="absolute bottom-6 left-6 z-[400] bg-th-surface/90 backdrop-blur-md p-4 rounded-xl border border-th-border shadow-lg">
             <h3 className="text-lg font-black text-th-text flex items-center gap-2">
               {privateMapTab === 'projects' && <><Briefcase className="text-blue-500" size={20} /> {isArabic ? 'خريطة المشاريع' : 'Projects Map'}</>}
               {privateMapTab === 'buoys' && <><Anchor className="text-indigo-500" size={20} /> {isArabic ? 'خريطة الشمندورات البحرية' : 'Marine Buoys Map'}</>}
               {privateMapTab === 'diving' && <><Waves className="text-cyan-500" size={20} /> {isArabic ? 'خريطة مواقع الغوص والسنوركلاينج' : 'Diving & Snorkeling Sites Map'}</>}
             </h3>
             <p className="text-xs text-th-muted mt-1 max-w-xs">
               {isArabic ? 'يتم عرض الطبقات الخاصة بهذا القسم بدقة عالية. يمكنك استخدام أدوات الخريطة للتحكم.' : 'High-precision layers for this section are displayed here. Use map tools to control.'}
             </p>
          </div>
        )}
        
        <div className="w-full h-full">
          {isReservesMode ? (
            <ProtectedAreasMap isArabic={isArabic} />
          ) : (
            <GISMap isArabic={isArabic} privateMode={privateMapTab} />
          )}
        </div>
      </div>
    </div>
  );
}
