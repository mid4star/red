'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-th-surface2 rounded-2xl border border-th-border">
      <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
    </div>
  ) 
});

export default function GISMap({ isArabic }: { isArabic: boolean }) {
  return (
    <div className="w-full h-[calc(100vh-200px)] min-h-[600px] relative rounded-2xl overflow-hidden border border-th-border shadow-md animate-in fade-in duration-500 gis-map-container">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .gis-map-container, .gis-map-container * { visibility: visible; }
          .gis-map-container { position: absolute; left: 0; top: 0; width: 100%; height: 100vh; margin: 0; padding: 0; }
          .leaflet-control-container, .print-hide { display: none !important; }
        }
      `}} />
      <MapComponent isArabic={isArabic} />
    </div>
  );
}
