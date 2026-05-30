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

// Fix client-side check
const isClient = typeof window !== 'undefined';

// Custom glowing divIcons
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

// Sighting icons scale by count
const createSightingIcon = (count: number, isSelected: boolean = false) => {
  if (!isClient) return null;
  const baseSize = isSelected ? 36 : 24;
  const countFactor = Math.min(10, count);
  const size = baseSize + countFactor * 2;
  const dotSize = (isSelected ? 16 : 10) + countFactor * 1.5;
  const shadowColor = 'rgba(99,102,241,0.8)';
  const pingColorClass = 'bg-indigo-400';
  const colorClass = 'bg-indigo-500';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${pingColorClass} opacity-60"></span>
        <span class="relative inline-flex rounded-full ${colorClass} border-2 border-white shadow-[0_0_12px_${shadowColor}]" style="width: ${dotSize}px; height: ${dotSize}px;"></span>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const icons = {
  eco_programs: isClient ? createCustomIcon('bg-teal-500', 'bg-teal-400', 'rgba(20,184,166,0.8)') : null,
  stranding_alive: isClient ? createCustomIcon('bg-emerald-500', 'bg-emerald-400', 'rgba(16,185,129,0.8)') : null,
  stranding_dead: isClient ? createCustomIcon('bg-rose-500', 'bg-rose-400', 'rgba(244,63,94,0.8)') : null,
  beach_surveys: isClient ? createCustomIcon('bg-amber-500', 'bg-amber-400', 'rgba(245,158,11,0.8)') : null,
};

const selectedIcons = {
  eco_programs: isClient ? createSelectedIcon('bg-teal-500', 'bg-teal-400', 'rgba(20,184,166,1)') : null,
  stranding_alive: isClient ? createSelectedIcon('bg-emerald-500', 'bg-emerald-400', 'rgba(16,185,129,1)') : null,
  stranding_dead: isClient ? createSelectedIcon('bg-rose-500', 'bg-rose-400', 'rgba(244,63,94,1)') : null,
  beach_surveys: isClient ? createSelectedIcon('bg-amber-500', 'bg-amber-400', 'rgba(245,158,11,1)') : null,
};

export interface EcoMapItem {
  id: string;
  dataType: 'eco_programs' | 'stranding_cases' | 'sightings' | 'beach_surveys';
  latitude: number;
  longitude: number;
  locationName: string;
  locationNameAr?: string | null;
  date: Date | string;
  
  program?: string;
  subType?: string | null;
  observerName?: string;
  details?: string | null;
  attachedFileUrl?: string | null;
  
  status?: string;
  species?: string | null;
  speciesAr?: string | null;
  description?: string | null;
  
  count?: number;
  notes?: string | null;
}

interface EcoMapProps {
  items: EcoMapItem[];
  activeItem: EcoMapItem | null;
  onItemSelect: (item: EcoMapItem) => void;
  onMapClick?: (latitude: number, longitude: number) => void;
  lang: string;
}

// Subcomponent to handle programmatically flying to the selected marker
function MapController({ activeItem }: { activeItem: EcoMapItem | null }) {
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
      map.flyTo([lat, lng], 11, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [activeItem, map]);

  return null;
}

// Subcomponent to capture coordinate clicks
function MapEventsHandler({ onMapClick }: { onMapClick?: (latitude: number, longitude: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const onClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, onMapClick]);

  return null;
}

export default function EcoMap({ items, activeItem, onItemSelect, onMapClick, lang }: EcoMapProps) {
  const isArabic = lang === 'ar';
  const defaultCenter: [number, number] = [26.0, 34.5]; // Red Sea region
  const defaultZoom = 7;

  const [currentStyle, setCurrentStyle] = useState<'satellite' | 'dark' | 'streets' | 'voyager'>('satellite');
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

  useEffect(() => {
    if (activeItem) {
      const key = `${activeItem.dataType}-${activeItem.id}`;
      const marker = markerRefs.current[key];
      if (marker) {
        const timer = setTimeout(() => {
          marker.openPopup();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [activeItem]);

  const getMarkerIcon = (item: EcoMapItem, isSelected: boolean) => {
    if (item.dataType === 'sightings') {
      return createSightingIcon(item.count || 1, isSelected) || undefined;
    }
    if (item.dataType === 'stranding_cases') {
      const statusKey = item.status === 'ALIVE' ? 'stranding_alive' : 'stranding_dead';
      return (isSelected ? selectedIcons[statusKey] : icons[statusKey]) || undefined;
    }
    const typeKey = item.dataType;
    return (isSelected ? selectedIcons[typeKey] : icons[typeKey]) || undefined;
  };

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
            attributionControl={false}
          >
            {/* Dynamic Tile Layer based on selected style */}
            <TileLayer
              key={currentStyle}
              attribution={mapStyles.find(s => s.id === currentStyle)?.attribution}
              url={mapStyles.find(s => s.id === currentStyle)?.url || ''}
            />

            <MapController activeItem={activeItem} />
            <MapEventsHandler onMapClick={onMapClick} />

            {items.map((item) => {
              const isSelected = activeItem?.id === item.id;
              const icon = getMarkerIcon(item, isSelected);
              const lat = Number(item.latitude);
              const lng = Number(item.longitude);

              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker
                  key={`${item.dataType}-${item.id}`}
                  position={[lat, lng]}
                  icon={icon}
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
                    <div className="p-1.5 min-w-[220px] text-slate-800" dir={isArabic ? 'rtl' : 'ltr'}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          item.dataType === 'stranding_cases' ? (item.status === 'ALIVE' ? 'bg-emerald-500' : 'bg-rose-500') :
                          item.dataType === 'sightings' ? 'bg-indigo-500' :
                          item.dataType === 'eco_programs' ? 'bg-teal-500' : 'bg-amber-500'
                        }`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {item.dataType === 'eco_programs' ? (isArabic ? 'برنامج الرصد' : 'Eco Program') :
                           item.dataType === 'stranding_cases' ? (isArabic ? 'حالة جنوح' : 'Stranding Case') :
                           item.dataType === 'sightings' ? (isArabic ? 'مشاهدة كائنات' : 'Sighting') :
                           (isArabic ? 'مسح شاطئي' : 'Beach Survey')}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 mb-1 leading-snug">
                        {item.dataType === 'eco_programs' && (isArabic ? `رصد ${item.program}` : `Survey: ${item.program}`)}
                        {item.dataType === 'stranding_cases' && (isArabic ? `${item.speciesAr || item.species} (${item.status === 'ALIVE' ? 'حي' : 'نافق'})` : `${item.species} (${item.status})`)}
                        {item.dataType === 'sightings' && (isArabic ? `${item.speciesAr || item.species}` : `${item.species}`)}
                        {item.dataType === 'beach_surveys' && (isArabic ? 'مسح نفايات وأنقاض الشاطئ' : 'Beach Cleanliness Survey')}
                      </h4>

                      <p className="text-[11px] text-slate-600 mb-2 font-medium">📍 {isArabic ? (item.locationNameAr || item.locationName) : item.locationName}</p>

                      <div className="border-t border-slate-100 pt-2 space-y-1.5 text-[11px] text-slate-600">
                        <div>
                          <strong>{isArabic ? 'التاريخ:' : 'Date:'}</strong> {new Date(item.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                        </div>

                        {item.dataType === 'eco_programs' && (
                          <>
                            {item.subType && (
                              <div>
                                <strong>{isArabic ? 'النوع الفرعي:' : 'Sub-type:'}</strong> {item.subType}
                              </div>
                            )}
                            <div>
                              <strong>{isArabic ? 'المراقب الميداني:' : 'Observer:'}</strong> {item.observerName}
                            </div>
                            {item.details && (
                              <div className="italic text-slate-500 mt-1 max-h-[60px] overflow-y-auto">
                                "{item.details}"
                              </div>
                            )}
                            {item.attachedFileUrl && (
                              <a href={item.attachedFileUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-700 underline font-bold flex items-center gap-1 mt-1.5">
                                📄 {isArabic ? 'الملف المرفق للرصد' : 'Attached Report'}
                              </a>
                            )}
                          </>
                        )}

                        {item.dataType === 'stranding_cases' && (
                          <>
                            {item.description && (
                              <div className="italic text-slate-500 mt-1 max-h-[60px] overflow-y-auto">
                                "{item.description}"
                              </div>
                            )}
                            {item.attachedFileUrl && (
                              <a href={item.attachedFileUrl} target="_blank" rel="noreferrer" className="text-rose-600 hover:text-rose-700 underline font-bold flex items-center gap-1 mt-1.5">
                                📄 {isArabic ? 'صورة/ملف الحالة' : 'Case Media/File'}
                              </a>
                            )}
                          </>
                        )}

                        {item.dataType === 'sightings' && (
                          <>
                            <div>
                              <strong>{isArabic ? 'العدد المرصود:' : 'Count:'}</strong> {item.count}
                            </div>
                            <div>
                              <strong>{isArabic ? 'المراقب الميداني:' : 'Observer:'}</strong> {item.observerName}
                            </div>
                            {item.notes && (
                              <div className="italic text-slate-500 mt-1 max-h-[60px] overflow-y-auto">
                                "{item.notes}"
                              </div>
                            )}
                          </>
                        )}

                        {item.dataType === 'beach_surveys' && (
                          <>
                            {item.description && (
                              <div className="italic text-slate-500 mt-1 max-h-[60px] overflow-y-auto">
                                "{item.description}"
                              </div>
                            )}
                            {item.attachedFileUrl && (
                              <a href={item.attachedFileUrl} target="_blank" rel="noreferrer" className="text-amber-600 hover:text-amber-700 underline font-bold flex items-center gap-1 mt-1.5">
                                📄 {isArabic ? 'تقرير مسح الشاطئ' : 'Survey Details Report'}
                              </a>
                            )}
                          </>
                        )}
                        
                        <div className="text-[9px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-50">
                          Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* GIS Legend Overlay */}
          <div 
            className={`absolute bottom-6 ${isArabic ? 'left-6' : 'right-6'} z-[1000] bg-[#0a1628]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl space-y-3 min-w-[200px] pointer-events-auto transition-all hover:border-teal-500/30 animate-in fade-in slide-in-from-bottom-2 duration-300`}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h5 className="text-[10px] font-black text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-500 rounded-full" />
                {isArabic ? 'مفتاح رصد البيئة' : 'Eco GIS Legend'}
              </h5>
              <span className="text-[8px] bg-teal-500/10 text-teal-400 font-extrabold px-1.5 py-0.5 rounded uppercase">
                GIS
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 group cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 border border-white/20 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {isArabic ? 'برامج الرصد البيئي' : 'Eco Programs'}
                </span>
              </div>
              
              <div className="flex items-center gap-2.5 group cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white/20 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1">
                  {isArabic ? 'جنوح (حي)' : 'Strandings (Alive)'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 group cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white/20 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1">
                  {isArabic ? 'جنوح (نافق)' : 'Strandings (Dead)'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 group cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border border-white/20 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {isArabic ? 'المشاهدات المرصودة' : 'Species Sightings'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 group cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white/20 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {isArabic ? 'مسوحات الشواطئ' : 'Beach Surveys'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Map Leaflet Styling overrides */}
      <style jsx global>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.96);
        }
        .leaflet-container {
          font-family: inherit;
        }
        
        .selected-marker-pulse {
          z-index: 1000 !important;
        }
      `}</style>
    </div>
  );
}
