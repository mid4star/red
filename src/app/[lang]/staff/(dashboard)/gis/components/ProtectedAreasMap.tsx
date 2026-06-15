'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Dynamically import the actual map to avoid SSR issues with Leaflet
const ProtectedAreasMapInner = dynamic(() => import('./ProtectedAreasMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-th-surface2 rounded-2xl border border-th-border">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <span className="text-xs text-th-muted font-bold animate-pulse">Loading Protected Areas...</span>
      </div>
    </div>
  )
});

export default function ProtectedAreasMap({ isArabic }: { isArabic: boolean }) {
  return (
    <div className="w-full h-[calc(100vh-200px)] min-h-[600px] relative rounded-2xl overflow-hidden border border-th-border shadow-md animate-in fade-in duration-500">
      <ProtectedAreasMapInner isArabic={isArabic} />
    </div>
  );
}
