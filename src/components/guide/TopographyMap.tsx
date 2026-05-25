'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Shield, Compass, Navigation, X, Activity, Globe, Eye, Map } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapLocation } from '@/lib/firebase/schema';

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

const isClient = typeof window !== 'undefined';

// Custom glowing tactical radar pin creator
const createRadarPin = (isSelected: boolean) => {
  if (!isClient) return null;
  
  const sizeClass = isSelected ? 'w-10 h-10' : 'w-7 h-7';
  const pingSizeClass = isSelected ? 'h-9 w-9' : 'h-6 w-6';
  const dotSizeClass = isSelected ? 'h-4.5 w-4.5 border-2 shadow-[0_0_15px_rgba(45,212,191,0.8)]' : 'h-3 w-3 border shadow-[0_0_8px_rgba(45,212,191,0.5)]';
  const pingColor = isSelected ? 'bg-teal-400' : 'bg-teal-500/40';
  const dotColor = isSelected ? 'bg-teal-300' : 'bg-teal-400';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center ${sizeClass}">
        <span class="animate-ping absolute inline-flex ${pingSizeClass} rounded-full ${pingColor} opacity-75"></span>
        <span class="relative inline-flex rounded-full ${dotSizeClass} ${dotColor} border-white"></span>
      </div>
    `,
    className: 'custom-radar-pin',
    iconSize: isSelected ? [40, 40] : [28, 28],
    iconAnchor: isSelected ? [20, 20] : [14, 14],
    popupAnchor: [0, -10]
  });
};

// Map flyTo controller subcomponent
function MapController({ selectedLocation }: { selectedLocation: MapLocation | null }) {
  const map = useMap();
  const lastActiveId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedLocation) return;
    if (lastActiveId.current === selectedLocation.id) return;
    lastActiveId.current = selectedLocation.id || null;

    const lat = Number(selectedLocation.latitude);
    const lng = Number(selectedLocation.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 11, {
        duration: 1.8,
        easeLinearity: 0.2
      });
    }
  }, [selectedLocation, map]);

  return null;
}

interface TopographyMapProps {
  locations: MapLocation[];
  lang: string;
  selectedLocation: MapLocation | null;
  onSelectLocation: (loc: MapLocation | null) => void;
}

export default function TopographyMap({ locations, lang, selectedLocation, onSelectLocation }: TopographyMapProps) {
  const isAr = lang === 'ar';
  const mapCenter: [number, number] = [26.5, 34.8]; // Centered on Red Sea
  const defaultZoom = 6;

  const [currentStyle, setCurrentStyle] = useState<'satellite' | 'dark' | 'streets' | 'voyager'>('satellite');

  return (
    <div className="w-full h-full relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
      {isClient && (
        <div 
          className="absolute top-6 right-6 z-[1000] flex gap-1.5 bg-[#0a1628]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl pointer-events-auto"
          dir={isAr ? 'rtl' : 'ltr'}
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
                title={isAr ? style.nameAr : style.name}
              >
                {style.id === 'satellite' && <Globe size={14} />}
                {style.id === 'dark' && <Eye size={14} />}
                {style.id === 'streets' && <Map size={14} />}
                {style.id === 'voyager' && <Compass size={14} />}
                <span className="hidden md:inline">{isAr ? style.nameAr : style.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {isClient && (
        <MapContainer
          center={mapCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', background: '#070f1e' }}
          className="z-10"
        >
          {/* Dynamic Tile Layer based on selected style */}
          <TileLayer
            key={currentStyle}
            attribution={mapStyles.find(s => s.id === currentStyle)?.attribution}
            url={mapStyles.find(s => s.id === currentStyle)?.url || ''}
          />

          <MapController selectedLocation={selectedLocation} />

          {locations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            const icon = createRadarPin(isSelected);
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
              />
            );
          })}
        </MapContainer>
      )}

      {/* Futuristic Tactical HUD Overlay */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, x: isAr ? -30 : 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: isAr ? -30 : 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'} z-[1000] w-full max-w-sm bg-[#071324]/90 backdrop-blur-md border border-teal-500/20 p-6 rounded-3xl shadow-[0_0_50px_rgba(45,212,191,0.1)] text-white pointer-events-auto`}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Sci-Fi Decorative Corner Brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-teal-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-400 rounded-br-lg"></div>

            {/* Scanner Line Effect */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse opacity-60"></div>

            {/* HUD Header */}
            <div className="flex justify-between items-start border-b border-teal-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="text-teal-400 animate-pulse" size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 italic font-mono">
                  {isAr ? 'بيانات الموقع النشطة' : 'LOCATION telemetry'}
                </span>
              </div>
              <button 
                onClick={() => onSelectLocation(null)}
                className="p-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 hover:text-teal-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* HUD Body */}
            <div className="space-y-4 font-sans">
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">
                  {isAr ? selectedLocation.nameAr : selectedLocation.name}
                </h3>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/50">
                  {isAr ? selectedLocation.typeAr || selectedLocation.type : selectedLocation.type}
                </span>
              </div>

              {/* Coordinates HUD Grid */}
              <div className="grid grid-cols-2 gap-2 bg-[#0c1b2f] border border-teal-500/10 p-3 rounded-xl font-mono text-[11px] text-teal-300">
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider mb-0.5">LATITUDE</span>
                  <span className="font-semibold">{Number(selectedLocation.latitude).toFixed(6)}° N</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider mb-0.5">LONGITUDE</span>
                  <span className="font-semibold">{Number(selectedLocation.longitude).toFixed(6)}° E</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {isAr ? 'الحالة التشغيلية:' : 'Operational Status:'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  selectedLocation.status?.toUpperCase() === 'ACTIVE' 
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-orange-500/15 border border-orange-500/30 text-orange-400'
                }`}>
                  {isAr 
                    ? selectedLocation.statusAr || selectedLocation.status 
                    : selectedLocation.status}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic block">
                  {isAr ? 'الإيجاز البيئي' : 'Environmental Intel'}
                </span>
                <p className="text-[13px] text-slate-300 font-medium italic leading-relaxed">
                  {isAr 
                    ? selectedLocation.descriptionAr || selectedLocation.description 
                    : selectedLocation.description || 'No description available for this telemetry zone.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
