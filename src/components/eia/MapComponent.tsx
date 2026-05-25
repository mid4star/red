'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, Eye, Map, Compass } from 'lucide-react';

const mapStyles = [
  {
    id: 'satellite' as const,
    name: 'Satellite',
    nameAr: 'قمر صناعي',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  {
    id: 'dark' as const,
    name: 'Dark Tech',
    nameAr: 'تقني مظلم',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  {
    id: 'streets' as const,
    name: 'Streets',
    nameAr: 'شوارع وتفاصيل',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    id: 'voyager' as const,
    name: 'Voyager',
    nameAr: 'تضاريس وملاحة',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
];

// Fix Leaflet marker icons issues
const isClient = typeof window !== 'undefined';

// Custom glowing divIcons for a premium GIS dashboard look
const createCustomIcon = (colorClass: string, pingColorClass: string, shadowColor: string) => {
  if (!isClient) return null;
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full ${pingColorClass} opacity-60"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${colorClass} border-2 border-white shadow-[0_0_12px_${shadowColor}]"></span>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -10]
  });
};

// Custom glowing divIcons for selected/active markers (larger size and stronger pulse)
const createSelectedIcon = (colorClass: string, pingColorClass: string, shadowColor: string) => {
  if (!isClient) return null;
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full ${pingColorClass} opacity-80"></span>
        <span class="relative inline-flex rounded-full h-5.5 w-5.5 ${colorClass} border-2 border-white shadow-[0_0_20px_6px_${shadowColor}] scale-125 transition-transform duration-300"></span>
      </div>
    `,
    className: 'custom-div-icon selected-marker-pulse',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -15]
  });
};

const icons = {
  violation: isClient ? createCustomIcon('bg-rose-500', 'bg-rose-400', 'rgba(244,63,94,0.8)') : null,
  accident: isClient ? createCustomIcon('bg-amber-500', 'bg-amber-400', 'rgba(245,158,11,0.8)') : null,
  inspection: isClient ? createCustomIcon('bg-emerald-500', 'bg-emerald-400', 'rgba(16,185,129,0.8)') : null,
};

const selectedIcons = {
  violation: isClient ? createSelectedIcon('bg-rose-500', 'bg-rose-400', 'rgba(244,63,94,1)') : null,
  accident: isClient ? createSelectedIcon('bg-amber-500', 'bg-amber-400', 'rgba(245,158,11,1)') : null,
  inspection: isClient ? createSelectedIcon('bg-emerald-500', 'bg-emerald-400', 'rgba(16,185,129,1)') : null,
};

export interface MapItem {
  id: string;
  dataType: 'inspection' | 'violation' | 'accident';
  latitude: number;
  longitude: number;
  locationName: string;
  type: string;
  date: Date | string;
  details: string;
  studyFileUrl?: string | null;
  reportFileUrl?: string | null;
  entityName?: string;
  entityType?: string;
  inspectorName?: string;
}

interface MapComponentProps {
  items: MapItem[];
  activeItem: MapItem | null;
  onItemSelect: (item: MapItem) => void;
  lang: string;
}

// Subcomponent to handle map programmatic movement (flyTo)
function MapController({ activeItem }: { activeItem: MapItem | null }) {
  const map = useMap();
  const prevActiveRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeItem) return;
    
    // Prevent redundant flying if already focused
    if (prevActiveRef.current === activeItem.id) return;
    prevActiveRef.current = activeItem.id;

    const lat = Number(activeItem.latitude);
    const lng = Number(activeItem.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 10, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [activeItem, map]);

  return null;
}

export default function MapComponent({ items, activeItem, onItemSelect, lang }: MapComponentProps) {
  const isArabic = lang === 'ar';
  const defaultCenter: [number, number] = [25.5, 36.0]; // Red Sea center
  const defaultZoom = 6;

  const [currentStyle, setCurrentStyle] = useState<'satellite' | 'dark' | 'streets' | 'voyager'>('satellite');
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

  useEffect(() => {
    if (activeItem) {
      const key = `${activeItem.dataType}-${activeItem.id}`;
      const marker = markerRefs.current[key];
      if (marker) {
        // Open the popup programmatically after a short delay to wait for map flyTo movement
        const timer = setTimeout(() => {
          marker.openPopup();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [activeItem]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {isClient && (
        <div 
          className="absolute top-4 right-4 z-[1000] flex gap-1.5 bg-[#0a1628]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl pointer-events-auto"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {mapStyles.map((style) => {
            const isActive = currentStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setCurrentStyle(style.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300 ${
                  isActive 
                    ? 'bg-teal-500 text-[#001529] shadow-lg scale-105' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={isArabic ? style.nameAr : style.name}
              >
                {style.id === 'satellite' && <Globe size={14} />}
                {style.id === 'dark' && <Eye size={14} />}
                {style.id === 'streets' && <Map size={14} />}
                {style.id === 'voyager' && <Compass size={14} />}
                <span className="hidden md:inline">{isArabic ? style.nameAr : style.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {isClient && (
        <>
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', background: '#0a1628' }}
          >
            {/* Dynamic Tile Layer based on selected style */}
            <TileLayer
              key={currentStyle}
              attribution={mapStyles.find(s => s.id === currentStyle)?.attribution}
              url={mapStyles.find(s => s.id === currentStyle)?.url || ''}
            />

            <MapController activeItem={activeItem} />

            {items.map((item) => {
              const isSelected = activeItem?.id === item.id;
              const icon = isSelected 
                ? selectedIcons[item.dataType] 
                : icons[item.dataType];
              const lat = Number(item.latitude);
              const lng = Number(item.longitude);

              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker
                  key={`${item.dataType}-${item.id}`}
                  position={[lat, lng]}
                  icon={icon || undefined}
                  ref={(ref) => {
                    if (ref) {
                      markerRefs.current[`${item.dataType}-${item.id}`] = ref;
                    }
                  }}
                  eventHandlers={{
                    click: () => {
                      onItemSelect(item);
                    },
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 min-w-[200px] text-slate-800" dir={isArabic ? 'rtl' : 'ltr'}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          item.dataType === 'violation' ? 'bg-rose-500' :
                          item.dataType === 'accident' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {item.dataType === 'violation' ? (isArabic ? 'مخالفة بيئية' : 'Environmental Violation') :
                           item.dataType === 'accident' ? (isArabic ? 'حادث بيئي' : 'Environmental Accident') :
                           (isArabic ? 'معاينة ميدانية' : 'Field Inspection')}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 mb-1 leading-snug">{item.type}</h4>
                      <p className="text-[11px] text-slate-600 mb-2 font-medium">📍 {item.locationName}</p>

                      <div className="border-t border-slate-100 pt-2 space-y-1 text-[11px] text-slate-600">
                        <div>
                          <strong>{isArabic ? 'التاريخ:' : 'Date:'}</strong> {new Date(item.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                        </div>
                        
                        {item.dataType === 'inspection' && (
                          <>
                            <div>
                              <strong>{isArabic ? 'الباحث المعاين:' : 'Inspector:'}</strong> {item.inspectorName}
                            </div>
                            <div className="flex flex-col gap-1 pt-1.5">
                              {item.studyFileUrl && (
                                <a href={item.studyFileUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-700 underline font-bold flex items-center gap-1">
                                  📄 {isArabic ? 'دراسة الأثر البيئي' : 'EIA Study File'}
                                </a>
                              )}
                              {item.reportFileUrl && (
                                <a href={item.reportFileUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-700 underline font-bold flex items-center gap-1">
                                  📄 {isArabic ? 'تقرير الرد النهائي' : 'Final Response Report'}
                                </a>
                              )}
                            </div>
                          </>
                        )}

                        {item.dataType === 'violation' && (
                          <>
                            <div>
                              <strong>{isArabic ? 'الجهة المخالفة:' : 'Responsible Entity:'}</strong> {item.entityName} ({item.entityType === 'PROJECT' ? (isArabic ? 'مشروع' : 'Project') : (isArabic ? 'شخص' : 'Person')})
                            </div>
                          </>
                        )}

                        {item.dataType === 'accident' && (
                          <>
                            <div className="line-clamp-2 italic text-slate-500 mb-1">
                              "{item.details}"
                            </div>
                            {item.reportFileUrl && (
                              <a href={item.reportFileUrl} target="_blank" rel="noreferrer" className="text-amber-600 hover:text-amber-700 underline font-bold flex items-center gap-1 pt-1">
                                📄 {isArabic ? 'التقرير الفني للحادث' : 'Technical Report'}
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Premium GIS Legend Overlay */}
          <div 
            className={`absolute bottom-6 ${isArabic ? 'left-6' : 'right-6'} z-[1000] bg-[#0a1628]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl space-y-3 min-w-[180px] pointer-events-auto transition-all hover:border-teal-500/30 animate-in fade-in slide-in-from-bottom-2 duration-300`}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h5 className="text-[10px] font-black text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-500 rounded-full" />
                {isArabic ? 'مفتاح الخريطة' : 'GIS Legend'}
              </h5>
              <span className="text-[8px] bg-teal-500/10 text-teal-400 font-extrabold px-1.5 py-0.5 rounded uppercase">
                EIA
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 group cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white/20 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {isArabic ? 'معاينات ميدانية' : 'Field Inspections'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 group cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white/20 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {isArabic ? 'مخالفات بيئية' : 'Violations'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 group cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white/20 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {isArabic ? 'حوادث وبلاغات الشعاب' : 'Accidents & Spills'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Map Leaflet Styling Custom overrides */}
      <style jsx global>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
        }
        .leaflet-container {
          font-family: inherit;
        }
        
        /* Custom styling override to make selected marker animations even smoother */
        .selected-marker-pulse {
          z-index: 1000 !important;
        }
      `}</style>
    </div>
  );
}
