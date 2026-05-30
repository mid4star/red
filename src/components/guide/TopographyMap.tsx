'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  X, 
  Globe, 
  Eye, 
  Map as MapIcon, 
  ShieldCheck, 
  Leaf, 
  Waves, 
  Calendar, 
  ArrowRight,
  ArrowLeft,
  Info,
  Plus,
  Minus
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapLocation } from '@/lib/firebase/schema';

const mapStyles = [
  {
    id: 'satellite' as const,
    name: 'Satellite',
    nameAr: 'قمر صناعي',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  {
    id: 'dark' as const,
    name: 'Dark Tech',
    nameAr: 'تقني مظلم',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  },
  {
    id: 'streets' as const,
    name: 'Streets',
    nameAr: 'شوارع وتفاصيل',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap'
  },
  {
    id: 'voyager' as const,
    name: 'Voyager',
    nameAr: 'تضاريس وملاحة',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  }
];

const isClient = typeof window !== 'undefined';

// Custom nature-themed pin creator
const createNaturePin = (isSelected: boolean, color = '#10b981') => {
  if (!isClient) return null;
  
  const size = isSelected ? 32 : 20;
  const dotSize = isSelected ? 12 : 8;
  const pulseSize = isSelected ? 28 : 16;
  
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
        <span class="animate-ping absolute inline-flex rounded-full opacity-75 animate-pulse" style="width: ${pulseSize}px; height: ${pulseSize}px; background-color: ${color}40;"></span>
        <span class="relative inline-flex rounded-full border border-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" style="width: ${dotSize}px; height: ${dotSize}px; background-color: ${color};"></span>
      </div>
    `,
    className: 'custom-nature-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const RESERVES_METADATA = [
  {
    id: 'reserve_northern_islands',
    name: 'Northern Islands Protectorate',
    nameAr: 'محمية الجزر الشمالية',
    description: 'A pristine archipelago serving as a critical sanctuary for nesting marine turtles (Hawksbill and Green) and migratory birds in the northern Red Sea. Features rich coral reefs and deep blue waters.',
    descriptionAr: 'أرخبيل بكر يعد ملاذاً حرجاً لتكاثر السلاحف البحرية (صقرية المنقار والخضراء) والطيور البحرية المهاجرة في شمال البحر الأحمر. تتميز المحمية بحدائق المرجان المتنوعة والمياه العميقة.',
    area: '1,990 km²',
    areaAr: '١,٩٩٠ كم²',
    established: '2006',
    establishedAr: '٢٠٠٦',
    speciesCount: 750,
    speciesCountAr: '٧٥٠',
    healthIndex: 9.7,
    status: 'Strict Sanctuary',
    statusAr: 'منطقة حماية صارمة',
    color: '#00f5d4', // very vibrant teal
    center: [27.35, 33.92] as [number, number],
    zoom: 10,
    polygon: [
      [27.75, 33.55],
      [27.75, 33.95],
      [27.60, 34.25],
      [27.25, 34.15],
      [27.08, 34.00],
      [27.05, 33.90],
      [27.15, 33.82],
      [27.30, 33.70],
      [27.50, 33.60],
    ] as [number, number][]
  },
  {
    id: 'reserve_wadi_el_gemal',
    name: 'Wadi El Gemal National Park',
    nameAr: 'محمية وادي الجمال الوطنية',
    description: 'A vast coastal and marine reserve encompassing mangroves, seagrass meadows, and desert mountains. Key sanctuary for the endangered dugong, green turtles, and rich prehistoric archaeological sites.',
    descriptionAr: 'محمية ساحلية وبحرية شاسعة تشمل أشجار المانجروف، ومراعي الأعشاب البحرية، والجبال الصحراوية. ملاذ أساسي للأطوم (عروس البحر) المهدد بالانقراض، والسلاحف الخضراء، وتضم مواقع أثرية تاريخية.',
    area: '6,770 km²',
    areaAr: '٦,٧٧٠ كم²',
    established: '2003',
    establishedAr: '٢٠٠٣',
    speciesCount: 650,
    speciesCountAr: '٦٥٠',
    healthIndex: 9.4,
    status: 'National Park',
    statusAr: 'محمية طبيعية وطنية',
    color: '#00e676', // very vibrant bright green
    center: [24.50, 34.95] as [number, number],
    zoom: 10,
    polygon: [
      [24.88, 34.60],
      [24.88, 35.15],
      [24.72, 35.32],
      [24.45, 35.35],
      [24.12, 35.30],
      [24.08, 34.85],
      [24.30, 34.65],
      [24.60, 34.50],
    ] as [number, number][]
  },
  {
    id: 'reserve_gebel_elba',
    name: 'Gebel Elba Protectorate',
    nameAr: 'محمية جبل علبة الطبيعية',
    description: 'Egypt’s largest protectorate and an extraordinary mist oasis in the desert. The moisture supports an incredibly dense vegetation cover, unique flora, acacia woodlands, and rare fauna.',
    descriptionAr: 'أكبر محمية طبيعية في مصر وواحة ضبابية استثنائية في وسط الصحراء. تدعم الرطوبة والضباب غطاء نباتياً كثيفاً فريداً، وغابات السنط والحيوانات النادرة.',
    area: '35,600 km²',
    areaAr: '٣٥,٦٠٠ كم²',
    established: '1986',
    establishedAr: '١٩٨٦',
    speciesCount: 920,
    speciesCountAr: '٩٢٠',
    healthIndex: 9.8,
    status: 'Biosphere Reserve',
    statusAr: 'محمية محيط حيوي طبيعي',
    color: '#3d5afe', // very vibrant indigo/blue
    center: [22.40, 35.90] as [number, number],
    zoom: 9,
    polygon: [
      [23.00, 34.90],
      [23.00, 36.50],
      [22.45, 36.85],
      [22.18, 37.00],
      [22.00, 36.90],
      [22.00, 35.00],
      [22.35, 34.90],
      [22.70, 34.85],
    ] as [number, number][]
  },
  {
    id: 'reserve_coral_reef',
    name: 'Coral Reef Protectorate',
    nameAr: 'محمية الحيد المرجاني الفريدة',
    description: 'Protects the central offshore islands and deep reef systems of the Red Sea, including the Brothers, Daedalus, and Rocky Islands. Renowned for its resilient corals, vertical drop-offs, and sharks.',
    descriptionAr: 'تحمي الجزر البحرية العميقة ونظم الشعاب المرجانية في وسط البحر الأحمر، بما في ذلك جزر الإخوة، وديدالوس، وروكي. تشتهر بالشعاب المرجانية الصلبة والتيارات والمنحدرات العميقة وحيوانات القرش.',
    area: '3,200 km²',
    areaAr: '٣,٢٠٠ كم²',
    established: '1995',
    establishedAr: '١٩٩٥',
    speciesCount: 1100,
    speciesCountAr: '١,١٠٠',
    healthIndex: 9.9,
    status: 'Marine Sanctuary',
    statusAr: 'ملاذ بحري محمي',
    color: '#ff9100', // very vibrant orange
    center: [25.65, 34.90] as [number, number],
    zoom: 9,
    polygon: [
      [26.50, 34.50],
      [26.50, 35.10],
      [25.40, 36.10],
      [23.70, 36.50],
      [23.35, 36.15],
      [24.50, 35.40],
      [25.80, 34.60],
    ] as [number, number][]
  }
];

// Map zoom & flyTo controller
function MapController({ 
  selectedLocation, 
  selectedReserve 
}: { 
  selectedLocation: MapLocation | null;
  selectedReserve: typeof RESERVES_METADATA[0] | null;
}) {
  const map = useMap();
  const lastActiveId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedLocation) {
      if (lastActiveId.current === selectedLocation.id) return;
      lastActiveId.current = selectedLocation.id || null;

      const lat = Number(selectedLocation.latitude);
      const lng = Number(selectedLocation.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 11, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      }
    } else if (selectedReserve) {
      if (lastActiveId.current === selectedReserve.id) return;
      lastActiveId.current = selectedReserve.id;

      map.flyTo(selectedReserve.center, selectedReserve.zoom, {
        duration: 1.8,
        easeLinearity: 0.2
      });
    }
  }, [selectedLocation, selectedReserve, map]);

  return null;
}

interface TopographyMapProps {
  locations: MapLocation[];
  lang: string;
  selectedLocation: MapLocation | null;
  onSelectLocation: (loc: MapLocation | null) => void;
}

type ActiveSelection = 
  | { type: 'location'; data: MapLocation }
  | { type: 'reserve'; data: typeof RESERVES_METADATA[0] };

export default function TopographyMap({ locations, lang, selectedLocation, onSelectLocation }: TopographyMapProps) {
  const isAr = lang === 'ar';
  const mapCenter: [number, number] = [25.0, 35.0];
  const defaultZoom = 6;

  const [currentStyle, setCurrentStyle] = useState<'satellite' | 'dark' | 'streets' | 'voyager'>('satellite');
  
  const [activeSelection, setActiveSelection] = useState<ActiveSelection | null>(null);
  const [hoveredReserveId, setHoveredReserveId] = useState<string | null>(null);

  // Sync external selection from parent
  useEffect(() => {
    if (selectedLocation) {
      setActiveSelection({ type: 'location', data: selectedLocation });
    } else {
      if (activeSelection?.type === 'location') {
        setActiveSelection(null);
      }
    }
  }, [selectedLocation]);

  const handleSelectReserve = (reserve: typeof RESERVES_METADATA[0]) => {
    setActiveSelection({ type: 'reserve', data: reserve });
    onSelectLocation(null); // Clear selected location site pin
  };

  const handleClearSelection = () => {
    setActiveSelection(null);
    onSelectLocation(null);
  };

  const getActiveReserve = () => {
    if (activeSelection?.type === 'reserve') {
      return activeSelection.data;
    }
    return null;
  };

  // Custom Zoom Control Component inside MapContainer
  function CustomZoom() {
    const map = useMap();
    return (
      <div 
        className={`absolute bottom-6 ${isAr ? 'right-6 left-auto' : 'left-6 right-auto'} z-[1000] flex flex-col bg-[#0a1628]/95 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-2xl pointer-events-auto`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            map.zoomIn();
          }}
          className="w-8 h-8 rounded-xl bg-white/0 hover:bg-white/10 text-white flex items-center justify-center transition-all duration-300 active:scale-95"
          title={isAr ? 'تكبير' : 'Zoom In'}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            map.zoomOut();
          }}
          className="w-8 h-8 rounded-xl bg-white/0 hover:bg-white/10 text-white flex items-center justify-center transition-all duration-300 active:scale-95 border-t border-white/5"
          title={isAr ? 'تصغير' : 'Zoom Out'}
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative flex flex-col md:block md:h-[680px]" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Map Container: Full-Bleed Edge-to-Edge Map ─────────────────────────── */}
      <div className="w-full h-[450px] md:absolute md:inset-0 md:h-full z-10 border-y border-white/10 bg-white/5 flex flex-col shadow-2xl">
        <div className="w-full h-full overflow-hidden relative flex-grow">
          
          {/* Map Layer Switcher (Glass Floating Capsule) */}
          {isClient && (
            <div 
              className={`absolute top-4 ${isAr ? 'left-4 right-auto' : 'right-4 left-auto'} z-[1000] flex gap-1 bg-[#0a1628]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl pointer-events-auto`}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {mapStyles.map((style) => {
                const isActive = currentStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setCurrentStyle(style.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all duration-300 ${
                      isActive 
                        ? 'bg-emerald-500 text-[#001529] shadow-lg scale-105' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={isAr ? style.nameAr : style.name}
                  >
                    {style.id === 'satellite' && <Globe size={11} />}
                    {style.id === 'dark' && <Eye size={11} />}
                    {style.id === 'streets' && <MapIcon size={11} />}
                    {style.id === 'voyager' && <Compass size={11} />}
                    <span className="hidden sm:inline ml-1">{isAr ? style.nameAr : style.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Leaflet Map (Default ZoomControl disabled) */}
          {isClient && (
            <MapContainer
              center={mapCenter}
              zoom={defaultZoom}
              scrollWheelZoom={true}
              zoomControl={false}
              style={{ width: '100%', height: '100%', background: '#070f1e' }}
              className="z-10"
              attributionControl={false}
            >
              <TileLayer
                key={currentStyle}
                attribution={mapStyles.find(s => s.id === currentStyle)?.attribution}
                url={mapStyles.find(s => s.id === currentStyle)?.url || ''}
              />

              <MapController 
                selectedLocation={selectedLocation} 
                selectedReserve={getActiveReserve()} 
              />

              {/* Custom Glassmorphic Zoom Control */}
              <CustomZoom />

              {/* Render Reserves Polygons */}
              {RESERVES_METADATA.map((reserve) => {
                const isSelected = activeSelection?.type === 'reserve' && activeSelection.data.id === reserve.id;
                const isHovered = hoveredReserveId === reserve.id;
                
                return (
                  <Polygon
                    key={reserve.id}
                    positions={reserve.polygon}
                    pathOptions={{
                      color: reserve.color,
                      weight: isSelected ? 4.5 : isHovered ? 3.5 : 2.2,
                      fillColor: reserve.color,
                      fillOpacity: isSelected ? 0.38 : isHovered ? 0.26 : 0.16
                    }}
                    eventHandlers={{
                      mouseover: () => setHoveredReserveId(reserve.id),
                      mouseout: () => setHoveredReserveId(null),
                      click: () => handleSelectReserve(reserve)
                    }}
                  >
                    <Tooltip sticky direction="top" opacity={0.9} className="!bg-slate-900/90 !border-slate-800 !text-white !p-2 !rounded-xl !shadow-2xl !font-sans !border">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: reserve.color }} />
                        <span className="font-bold text-xs">{isAr ? reserve.nameAr : reserve.name}</span>
                      </div>
                    </Tooltip>
                  </Polygon>
                );
              })}

              {/* Render Locations Markers */}
              {locations.map((loc) => {
                const isSelected = activeSelection?.type === 'location' && activeSelection.data.id === loc.id;
                
                const isRestricted = loc.status === 'RESTRICTED';
                const markerColor = isRestricted ? '#f59e0b' : '#10b981'; // amber or emerald
                
                const icon = createNaturePin(isSelected, markerColor);
                const lat = Number(loc.latitude);
                const lng = Number(loc.longitude);

                if (isNaN(lat) || !lng) return null;

                return (
                  <Marker
                    key={loc.id}
                    position={[lat, lng]}
                    icon={icon || undefined}
                    eventHandlers={{
                      click: () => {
                        onSelectLocation(loc);
                      }
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.9} className="!bg-slate-900/90 !border-slate-800 !text-white !p-2 !rounded-xl !shadow-2xl !font-sans !border">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs">{isAr ? loc.nameAr : loc.name}</span>
                        <span className="text-[9px] text-slate-400">{isAr ? loc.typeAr || loc.type : loc.type}</span>
                      </div>
                    </Tooltip>
                  </Marker>
                );
              })}
            </MapContainer>
          )}

        </div>
      </div>

      {/* ── Desktop Corner Overlays, Mobile Stack ────────────────────────────── */}
      {/* Reserve Explorer Panel */}
      <div 
        className={`w-full p-4 md:p-0 md:w-[320px] md:absolute md:top-6 ${
          isAr ? 'md:right-6 md:left-auto' : 'md:left-6 md:right-auto'
        } z-[1000] pointer-events-auto mt-6 md:mt-0`}
      >
        <div className="rounded-[2rem] bg-[#0c1b2f]/95 backdrop-blur-md border border-white/10 p-1.5 shadow-2xl">
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#0c1b2f]/40 p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
              <Leaf className="text-emerald-400 w-4.5 h-4.5" />
              <span className="text-[11px] font-black text-white uppercase tracking-[0.15em]">
                {isAr ? 'مستكشف المحميات البحرية' : 'Marine Reserves Explorer'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {RESERVES_METADATA.map((reserve) => {
                const isSelected = activeSelection?.type === 'reserve' && activeSelection.data.id === reserve.id;
                return (
                  <button
                    key={reserve.id}
                    onClick={() => handleSelectReserve(reserve)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl text-[10px] sm:text-xs font-black border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isAr ? 'text-right' : 'text-left'
                    } ${
                      isSelected 
                        ? 'bg-white/15 text-white border-white/25 shadow-lg scale-[1.03]' 
                        : 'bg-white/0 text-slate-400 border-transparent hover:bg-white/5 hover:text-white hover:translate-y-[-1px]'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-500" 
                      style={{ backgroundColor: reserve.color }} 
                    />
                    <span className="truncate">
                      {isAr 
                        ? reserve.nameAr.replace('محمية ', '') 
                        : reserve.name.replace(' Protectorate', '').replace(' National Park', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Ecological Details Panel */}
      <div 
        className={`w-full p-4 md:p-0 md:w-[340px] md:absolute md:bottom-6 ${
          isAr ? 'md:left-6 md:right-auto' : 'md:right-6 md:left-auto'
        } z-[1000] pointer-events-auto mt-6 md:mt-0`}
      >
        <div className="rounded-[2.2rem] bg-[#0c1b2f]/95 backdrop-blur-md border border-white/10 p-1.5 shadow-2xl flex flex-col">
          <div className="rounded-[calc(2.2rem-0.375rem)] bg-[#0c1b2f]/50 p-6 flex-grow flex flex-col justify-between min-h-[300px] md:min-h-[260px]">
            <AnimatePresence mode="wait">
              {activeSelection ? (
                <motion.div
                  key={activeSelection.type + '-' + (activeSelection.type === 'reserve' ? activeSelection.data.id : activeSelection.data.id)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="flex flex-col h-full justify-between gap-6"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {activeSelection.type === 'reserve' 
                            ? (isAr ? 'ملف المحمية الطبيعية' : 'Reserve Profile')
                            : (isAr ? 'تفاصيل الموقع البيئي' : 'Ecological Site Details')}
                        </span>
                      </div>
                      <button 
                        onClick={handleClearSelection}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {/* Name and Tag */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight text-white mb-1">
                        {activeSelection.type === 'reserve' 
                          ? (isAr ? activeSelection.data.nameAr : activeSelection.data.name)
                          : (isAr ? activeSelection.data.nameAr : activeSelection.data.name)}
                      </h3>
                      <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {activeSelection.type === 'reserve'
                          ? (isAr ? activeSelection.data.statusAr : activeSelection.data.status)
                          : (isAr ? activeSelection.data.typeAr || activeSelection.data.type : activeSelection.data.type)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                      {activeSelection.type === 'reserve'
                        ? (isAr ? activeSelection.data.descriptionAr : activeSelection.data.description)
                        : (isAr ? activeSelection.data.descriptionAr || activeSelection.data.description : activeSelection.data.description || 'No description available.')}
                    </p>

                    {/* Stats Grid */}
                    {activeSelection.type === 'reserve' ? (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Globe size={11} className="text-slate-500" />
                            <span className="text-[8px] uppercase font-bold">{isAr ? 'المساحة' : 'Area'}</span>
                          </div>
                          <span className="text-xs font-black font-mono text-white">{isAr ? activeSelection.data.areaAr : activeSelection.data.area}</span>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Waves size={11} className="text-slate-500" />
                            <span className="text-[8px] uppercase font-bold">{isAr ? 'مؤشر الصحة' : 'Health Index'}</span>
                          </div>
                          <span className="text-xs font-black font-mono text-emerald-400">{activeSelection.data.healthIndex} <span className="text-[9px] text-slate-500 font-normal">/ 10</span></span>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Leaf size={11} className="text-slate-500" />
                            <span className="text-[8px] uppercase font-bold">{isAr ? 'التنوع الحيوي' : 'Biodiversity'}</span>
                          </div>
                          <span className="text-xs font-black font-mono text-white">{isAr ? activeSelection.data.speciesCountAr : activeSelection.data.speciesCount} <span className="text-[8px] text-slate-500 font-normal">{isAr ? 'نوع' : 'species'}</span></span>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Calendar size={11} className="text-slate-500" />
                            <span className="text-[8px] uppercase font-bold">{isAr ? 'التأسيس' : 'Est. Year'}</span>
                          </div>
                          <span className="text-xs font-black font-mono text-white">{isAr ? activeSelection.data.establishedAr : activeSelection.data.established}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Compass size={11} className="text-slate-500" />
                            <span className="text-[8px] uppercase font-bold">{isAr ? 'دائرة العرض' : 'Latitude'}</span>
                          </div>
                          <span className="text-[11px] font-black font-mono text-white">{Number(activeSelection.data.latitude).toFixed(4)}° N</span>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Compass size={11} className="text-slate-500" />
                            <span className="text-[8px] uppercase font-bold">{isAr ? 'خط الطول' : 'Longitude'}</span>
                          </div>
                          <span className="text-[11px] font-black font-mono text-white">{Number(activeSelection.data.longitude).toFixed(4)}° E</span>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col gap-0.5 col-span-2">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Info size={11} className="text-slate-500" />
                            <span className="text-[8px] uppercase font-bold">{isAr ? 'حالة الحماية للموقع' : 'Site Protection Status'}</span>
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl mt-1 border w-max ${
                            activeSelection.data.status?.toUpperCase() === 'ACTIVE' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {isAr 
                              ? activeSelection.data.statusAr || activeSelection.data.status 
                              : activeSelection.data.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Nested CTA Button for Reserves */}
                  {activeSelection.type === 'reserve' && (
                    <a
                      href={`/${lang}/reserves/${activeSelection.data.id}`}
                      className="group/btn mt-2 w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#001529] font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] shadow-lg shadow-emerald-500/10"
                    >
                      <span className="font-sans font-black tracking-tight">{isAr ? 'تصفح الدليل الكامل للمحمية' : 'View Full Reserve Guide'}</span>
                      <div className="w-7 h-7 rounded-full bg-[#001529]/10 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-[2px] group-hover/btn:scale-105">
                        {isAr ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                      </div>
                    </a>
                  )}
                </motion.div>
              ) : (
                /* Empty Prompt State */
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="flex flex-col items-center justify-center text-center gap-4 py-8 h-full"
                >
                  <div className="w-16 h-16 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                    <Compass size={28} className="animate-spin-slow text-slate-400" />
                  </div>
                  <div className="space-y-1.5 max-w-[280px]">
                    <h4 className="text-sm font-black text-slate-200">
                      {isAr ? 'استكشف ساحل البحر الأحمر' : 'Explore the Red Sea Coast'}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {isAr 
                        ? 'اختر محمية طبيعية من مستكشف القائمة بالأعلى أو اضغط على موقع على الخريطة لعرض المؤشرات البيئية والتفاصيل.' 
                        : 'Select a protectorate from the explorer above or click a site on the map to display environmental data.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
