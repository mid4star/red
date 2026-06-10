'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(m => m.useMapEvents), { ssr: false });

interface LocationMarker {
  lat: number;
  lng: number;
  title: string;
  type: 'observation' | 'violation' | 'route-point';
}

interface PatrolMapProps {
  editable?: boolean;
  onRouteUpdate?: (coordinates: [number, number][]) => void;
  markers?: LocationMarker[];
  routeCoordinates?: [number, number][];
}

// Custom component to handle map clicks and drawing
function MapClickHandler({ editable, routeCoords, setRouteCoords, onUpdate }: { 
  editable: boolean, 
  routeCoords: [number, number][], 
  setRouteCoords: any,
  onUpdate: any 
}) {
  const map = useMapEvents({
    click(e: any) {
      if (editable) {
        const newCoords: [number, number][] = [...routeCoords, [e.latlng.lat, e.latlng.lng]];
        setRouteCoords(newCoords);
        if (onUpdate) onUpdate(newCoords);
      }
    }
  });
  return null;
}

export default function PatrolMap({ editable = false, onRouteUpdate, markers = [], routeCoordinates = [] }: PatrolMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [localRoute, setLocalRoute] = useState<[number, number][]>(routeCoordinates);

  useEffect(() => {
    setIsMounted(true);
    // Fix Leaflet marker icons in Next.js
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  if (!isMounted) {
    return <div className="w-full h-full bg-slate-900 flex items-center justify-center animate-pulse text-white">Loading Map...</div>;
  }

  // Red Sea center
  const center: [number, number] = [27.2579, 33.8116]; 

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={localRoute.length > 0 ? localRoute[0] : center} 
        zoom={9} 
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme tile layer
        />
        
        {editable && (
          <MapClickHandler 
            editable={editable} 
            routeCoords={localRoute} 
            setRouteCoords={setLocalRoute} 
            onUpdate={onRouteUpdate} 
          />
        )}

        {/* Draw Route */}
        {localRoute.length > 0 && (
          <Polyline positions={localRoute} color="#0d9488" weight={4} opacity={0.8} />
        )}

        {/* Custom Markers */}
        {markers.map((marker, idx) => (
          <Marker key={idx} position={[marker.lat, marker.lng]}>
            <Popup>
              <div className="text-slate-800 font-bold">{marker.title}</div>
              <div className="text-xs text-slate-500 uppercase">{marker.type}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {editable && (
        <div className="absolute top-4 right-4 z-[400] bg-[#0c1628]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg text-xs text-white">
          <p className="font-bold text-teal-400 mb-1">Interactive Drawing</p>
          <p className="text-slate-400">Click on the map to plot patrol route waypoints.</p>
          <button 
            onClick={() => { setLocalRoute([]); if (onRouteUpdate) onRouteUpdate([]); }}
            className="mt-2 text-rose-400 hover:text-rose-300 font-bold transition-colors w-full text-left"
          >
            Clear Route
          </button>
        </div>
      )}
    </div>
  );
}
