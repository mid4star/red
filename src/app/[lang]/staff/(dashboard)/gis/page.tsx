'use client';

import React, { useEffect } from 'react';
import { Map as MapIcon, BarChart3, LayoutDashboard, Settings } from 'lucide-react';
import { useGISStore } from './store/gisStore';
import GISDashboard from './components/GISDashboard';
import GISMap from './components/GISMap';
import GISAnalytics from './components/GISAnalytics';
import GISReports from './components/GISReports';
import { FileText } from 'lucide-react';

export default function GISPage({ params: { lang } }: { params: { lang: string } }) {
  const isArabic = lang === 'ar';
  const { activeTab, setActiveTab, fetchData } = useGISStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* ── Page Header & Navigation ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-th-surface2 p-4 md:p-6 rounded-2xl border border-th-border shadow-sm gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
              <MapIcon size={24} />
           </div>
           <div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 block mb-1">
                 {isArabic ? 'التحليل المكاني' : 'Spatial Analysis'}
             </span>
             <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-th-text uppercase m-0 leading-none">
                 {isArabic ? 'نظم المعلومات الجغرافية' : 'Enterprise GIS'}
             </h1>
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-th-surface border border-th-border rounded-xl">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-teal-500 text-white shadow-md' : 'text-th-muted hover:text-th-text hover:bg-th-surface2'}`}
          >
            <LayoutDashboard size={16} />
            {isArabic ? 'لوحة القيادة' : 'Dashboard'}
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-teal-500 text-white shadow-md' : 'text-th-muted hover:text-th-text hover:bg-th-surface2'}`}
          >
            <MapIcon size={16} />
            {isArabic ? 'الخريطة' : 'Map View'}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-teal-500 text-white shadow-md' : 'text-th-muted hover:text-th-text hover:bg-th-surface2'}`}
          >
            <BarChart3 size={16} />
            {isArabic ? 'التحليلات' : 'Analytics'}
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-teal-500 text-white shadow-md' : 'text-th-muted hover:text-th-text hover:bg-th-surface2'}`}
          >
            <FileText size={16} />
            {isArabic ? 'التقارير' : 'Reports'}
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="w-full">
        {activeTab === 'dashboard' && <GISDashboard isArabic={isArabic} />}
        {activeTab === 'map' && <GISMap isArabic={isArabic} />}
        {activeTab === 'analytics' && <GISAnalytics isArabic={isArabic} />}
        {activeTab === 'reports' && <GISReports isArabic={isArabic} />}
      </div>
    </div>
  );
}
