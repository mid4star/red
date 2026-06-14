'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGISStore } from '../store/gisStore';
import L from 'leaflet';
import 'leaflet.heat';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import FeatureFormModal from './FeatureFormModal';
import GISSearch from './GISSearch';
import { Layers, Settings2, Eye, EyeOff, ChevronUp, ChevronDown, Clock, Printer, ChevronLeft, ChevronRight, MapPin, GitCommit, Hexagon, Edit3, Trash2, X, Plus, Minus, Square, Compass } from 'lucide-react';
import BasemapSwitcher from './BasemapSwitcher';
import FeatureDetailPanel from './FeatureDetailPanel';
import LayerManagerModal from './LayerManagerModal';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getLayerIconSvg = (layerId: string, color: string) => {
  let innerIcon = '';
  
  if (layerId === 'layer-reserves') {
    // Shield
    innerIcon = `<path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 10.5H7.5v-1h4.5V7h1v4.5h4.5v1H13V17h-1v-4.5z" fill="white"/>`;
  } else if (layerId === 'layer-violations' || layerId === 'layer-eia-violations') {
    // Alert Triangle
    innerIcon = `<path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" fill="white"/>`;
  } else if (layerId === 'layer-eia-inspections') {
    // Clipboard Check
    innerIcon = `<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zM10 17l-3.5-3.5 1.41-1.41L10 14.17l5.09-5.09 1.41 1.41L10 17z" fill="white"/>`;
  } else if (layerId === 'layer-eia-accidents') {
    // Alert Circle
    innerIcon = `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white"/>`;
  } else if (layerId === 'layer-eco-reports') {
    // Leaf
    innerIcon = `<path d="M17 8C8 10 5.9 16.17 6 20c3.83.1 10-2 12-11 .83-3.75-1-1-1-1zm-5 7.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>`;
  } else if (layerId === 'layer-strandings') {
    // Lifebuoy
    innerIcon = `<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="white"/>`;
  } else if (layerId === 'layer-sightings') {
    // Eye
    innerIcon = `<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="white"/>`;
  } else if (layerId === 'layer-beach-surveys') {
    // Waves
    innerIcon = `<path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z" fill="white"/>`;
  } else {
    // Default Dot
    innerIcon = `<circle cx="12" cy="10" r="3.5" fill="white"/>`;
  }

  return `
    <div style="position: relative; width: 30px; height: 42px; display: flex; align-items: center; justify-content: center;">
      <!-- Pin background shape -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="30" height="42" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      </svg>
      <!-- Inner Symbol -->
      <div style="position: absolute; top: 6px; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="14" height="14">
          ${innerIcon}
        </svg>
      </div>
    </div>
  `;
};

const createCustomMarkerIcon = (layerId: string, color: string) => {
  return L.divIcon({
    html: getLayerIconSvg(layerId, color),
    className: 'custom-gis-pin',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40]
  });
};

function MapReference({ setMap }: { setMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map, setMap]);
  return null;
}

function GeomanInit({ setDraftFeature, privateMode }: { setDraftFeature: (data: any) => void, privateMode?: 'projects' | 'buoys' | 'diving' }) {
  const map = useMap();
  const { layers } = useGISStore();

  useEffect(() => {
    let active = true;

    const initGeoman = async () => {
      // Import Geoman JS dynamically to avoid SSR execution
      await import('@geoman-io/leaflet-geoman-free');
      
      if (!active || !map) return;

      if ((map as any).pm) {
        // Enable Measurements
        (map as any).pm.setGlobalOptions({ 
          measurements: { measurement: true, displayFormat: 'metric' }
        });

        map.off('pm:create');
        map.on('pm:create', async (e: any) => {
          const layer = e.layer;
          let type = 'Point';
          let coordinates: any = [];

          if (layer instanceof L.Marker) {
             type = 'Point';
             const ll = layer.getLatLng();
             coordinates = [ll.lat, ll.lng];
          } else if (layer instanceof L.Polygon) {
             type = 'Polygon';
             const latlngs = layer.getLatLngs() as any;
             coordinates = [latlngs[0].map((ll: any) => [ll.lat, ll.lng])];
          } else if (layer instanceof L.Polyline) {
             type = 'LineString';
             const latlngs = layer.getLatLngs() as any[];
             coordinates = latlngs.map((ll: any) => [ll.lat, ll.lng]);
          }

          const draft = useGISStore.getState().dashboardDraftFeature;
          const currentLayers = privateMode ? layers.filter(l => l.category === (privateMode === 'projects' ? 'project' : privateMode)) : layers;
          
          let targetLayerId = 'default';
          if (draft) {
             targetLayerId = draft.layerId;
          } else if (currentLayers.length > 0) {
             // Find the first unlocked layer, or just use the first layer
             const unlocked = currentLayers.find(l => !l.isLocked);
             targetLayerId = unlocked ? unlocked.id : currentLayers[0].id;
          }
          
          setDraftFeature({
            leafletLayer: layer,
            type,
            coordinates,
            layerId: targetLayerId,
            properties: draft ? draft.properties : undefined
          });
        });
      }
    };

    initGeoman();

    return () => {
      active = false;
      if (map) {
        map.off('pm:create');
      }
    }
  }, [map, setDraftFeature, layers, privateMode]);

  return null;
}

function SearchHandler() {
  const map = useMap();
  const { features, searchedFeatureId, setSearchedFeatureId } = useGISStore();

  useEffect(() => {
    if (searchedFeatureId) {
      const feature = features.find(f => f.id === searchedFeatureId);
      if (feature) {
        if (feature.type === 'Point') {
          map.flyTo(feature.coordinates as [number, number], 14, { duration: 1.5 });
        } else if (feature.type === 'Polygon' || feature.type === 'LineString') {
          const coords = feature.type === 'Polygon' ? feature.coordinates[0] : feature.coordinates;
          if (coords && coords.length > 0) {
            map.flyTo(coords[0] as [number, number], 14, { duration: 1.5 });
          }
        }
      }
      // Reset after flying so we can search again later if needed
      // Actually keeping it is fine, or we reset it. Let's reset it after a timeout
      const t = setTimeout(() => setSearchedFeatureId(null), 2000);
      return () => clearTimeout(t);
    }
  }, [searchedFeatureId, features, map, setSearchedFeatureId]);

  return null;
}

function HeatmapOverlay({ layer, features }: { layer: any, features: any[] }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (!layer.isVisible || layer.type !== 'heatmap' || features.length === 0) return;
    
    // Extract lat/lng pairs from features
    const points = features
      .filter(f => f.type === 'Point' && f.coordinates)
      .map(f => [f.coordinates[0], f.coordinates[1], 1]); // Lat, Lng, Intensity

    if (points.length === 0) return;

    const heat = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, layer.isVisible, layer.type, features]);

  return null;
}

export default function MapComponent({ isArabic, privateMode }: { isArabic: boolean, privateMode?: 'projects' | 'buoys' | 'diving' }) {
  const { 
    layers, 
    features, 
    addOrUpdateFeature, 
    timelineFilterDate, 
    setTimelineFilterDate,
    setSelectedFeatureId, 
    activeBasemap,
    toggleLayerVisibility,
    setLayerOpacity,
    moveLayerUp,
    moveLayerDown
  } = useGISStore();
  
  const displayedLayers = React.useMemo(() => {
    if (!privateMode) return layers;
    const cat = privateMode === 'projects' ? 'project' : privateMode;
    return layers.filter(l => l.category === cat);
  }, [layers, privateMode]);

  const [draftFeature, setDraftFeature] = React.useState<any>(null);
  const [isLayersOpen, setIsLayersOpen] = React.useState(true);
  const [showManager, setShowManager] = React.useState(false);
  const [mapInstance, setMapInstance] = React.useState<L.Map | null>(null);
  const [activeMode, setActiveMode] = React.useState<string | null>(null);

  const layersPanelRef = React.useRef<HTMLDivElement>(null);
  const timelinePanelRef = React.useRef<HTMLDivElement>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (layersPanelRef.current) {
      L.DomEvent.disableClickPropagation(layersPanelRef.current);
      L.DomEvent.disableScrollPropagation(layersPanelRef.current);
    }
  }, [isLayersOpen]);

  React.useEffect(() => {
    if (timelinePanelRef.current) {
      L.DomEvent.disableClickPropagation(timelinePanelRef.current);
      L.DomEvent.disableScrollPropagation(timelinePanelRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (toolbarRef.current) {
      L.DomEvent.disableClickPropagation(toolbarRef.current);
      L.DomEvent.disableScrollPropagation(toolbarRef.current);
    }
  }, [activeMode]);

  // Synchronize Leaflet Geoman events with React activeMode state
  React.useEffect(() => {
    if (!mapInstance) return;

    const handleDrawStart = (e: any) => {
      setActiveMode(e.shape);
    };

    const handleDrawEnd = () => {
      setActiveMode(null);
    };

    const handleEditToggle = (e: any) => {
      setActiveMode(e.enabled ? 'edit' : null);
    };

    const handleRemovalToggle = (e: any) => {
      setActiveMode(e.enabled ? 'delete' : null);
    };

    mapInstance.on('pm:drawstart', handleDrawStart);
    mapInstance.on('pm:drawend', handleDrawEnd);
    mapInstance.on('pm:globaleditmodetoggled', handleEditToggle);
    mapInstance.on('pm:globalremovalmodetoggled', handleRemovalToggle);

    return () => {
      mapInstance.off('pm:drawstart', handleDrawStart);
      mapInstance.off('pm:drawend', handleDrawEnd);
      mapInstance.off('pm:globaleditmodetoggled', handleEditToggle);
      mapInstance.off('pm:globalremovalmodetoggled', handleRemovalToggle);
    };
  }, [mapInstance]);

  // Handle auto-drawing when redirected from GIS Dashboard
  const { dashboardDraftFeature, setDashboardDraftFeature } = useGISStore();
  React.useEffect(() => {
    if (!mapInstance || !(mapInstance as any).pm) return;
    const pm = (mapInstance as any).pm;
    if (dashboardDraftFeature && dashboardDraftFeature.step === 'drawing') {
      const geomType = dashboardDraftFeature.properties.geometryType || 'Point';
      let mode = 'Marker';
      if (geomType === 'Polygon') mode = 'Polygon';
      if (geomType === 'LineString') mode = 'Line';
      
      const t = setTimeout(() => {
        pm.enableDraw(mode);
        setActiveMode(mode);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [mapInstance, dashboardDraftFeature]);

  const handleModeClick = (mode: string) => {
    if (!mapInstance || !(mapInstance as any).pm) return;
    
    if (mode === 'home') {
      mapInstance.flyTo(defaultCenter, 6, { duration: 1.5 });
      return;
    }
    
    const pm = (mapInstance as any).pm;

    // If clicking the currently active mode, disable everything
    if (activeMode === mode) {
      pm.disableDraw();
      if (pm.globalEditEnabled()) pm.disableGlobalEditMode();
      if (pm.globalRemovalEnabled()) pm.disableGlobalRemovalMode();
      setActiveMode(null);
      return;
    }

    // Disable any active mode first
    pm.disableDraw();
    if (pm.globalEditEnabled()) pm.disableGlobalEditMode();
    if (pm.globalRemovalEnabled()) pm.disableGlobalRemovalMode();

    // Enable the clicked mode
    if (mode === 'Marker' || mode === 'Line' || mode === 'Polygon' || mode === 'Rectangle') {
      pm.enableDraw(mode);
    } else if (mode === 'edit') {
      pm.enableGlobalEditMode();
    } else if (mode === 'delete') {
      pm.enableGlobalRemovalMode();
    }
  };

  // Timeline bounds
  const minDate = React.useMemo(() => {
    if (features.length === 0) return Date.now();
    const dates = features.map(f => new Date(f.updatedAt || f.createdAt || Date.now()).getTime());
    return Math.min(...dates);
  }, [features]);

  const maxDate = React.useMemo(() => Date.now(), []);

  React.useEffect(() => {
    if (timelineFilterDate === null && features.length > 0) {
      setTimelineFilterDate(maxDate);
    }
  }, [timelineFilterDate, features, maxDate, setTimelineFilterDate]);
  
  // default center somewhere in Red Sea
  const defaultCenter: [number, number] = [25.0, 36.0];

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-th-border shadow-inner z-0" id="gis-map-container">
      <GISSearch isArabic={isArabic} />
      
      {/* Floating info panel for dashboard drawing mode */}
      {dashboardDraftFeature && dashboardDraftFeature.step === 'drawing' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 border border-amber-400 animate-in slide-in-from-top-2 duration-300">
          <span>
            {isArabic 
              ? `نمط الرسم نشط: الرجاء رسم ${dashboardDraftFeature.properties.geometryType === 'Point' ? 'نقطة' : dashboardDraftFeature.properties.geometryType === 'Polygon' ? 'منطقة' : 'مسار'} للطبقة "${displayedLayers.find(l => l.id === dashboardDraftFeature.layerId)?.nameAr || ''}"`
              : `Drawing Mode Active: Please draw a ${dashboardDraftFeature.properties.geometryType} for layer "${displayedLayers.find(l => l.id === dashboardDraftFeature.layerId)?.name || ''}"`
            }
          </span>
          <button 
            onClick={() => setDashboardDraftFeature(null)}
            className="p-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <MapContainer 
        center={defaultCenter} 
        zoom={6} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        {/* Basemap Switcher Logic */}
        {activeBasemap === 'satellite' && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
        )}
        
        {activeBasemap === 'marine' && (
          <>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
            <TileLayer
              url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
              attribution='Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
            />
          </>
        )}

        {activeBasemap === 'terrain' && (
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution="Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)"
          />
        )}

        {activeBasemap === 'dark' && (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          />
        )}

        {activeBasemap === 'street' && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}
        
        <MapReference setMap={setMapInstance} />
        <GeomanInit setDraftFeature={setDraftFeature} privateMode={privateMode} />
        <SearchHandler />
        
        {/* Render Features based on visible layers and timeline */}
        {displayedLayers.filter(l => l.isVisible).map(layer => {
          const layerFeatures = features.filter(f => {
             if (f.layerId !== layer.id) return false;
             if (timelineFilterDate) {
               const featureTime = new Date(f.updatedAt || f.createdAt || Date.now()).getTime();
               return featureTime <= timelineFilterDate;
             }
             return true;
          });
          
          if (layer.type === 'heatmap') {
            return <HeatmapOverlay key={layer.id} layer={layer} features={layerFeatures} />;
          }

          return layerFeatures.map(feature => {
            if (feature.type === 'Point') {
               return (
                 <Marker 
                   key={feature.id} 
                   position={feature.coordinates as [number, number]} 
                   opacity={layer.opacity ?? 1}
                   icon={createCustomMarkerIcon(layer.id, layer.color || '#3b82f6')}
                   pmIgnore={layer.isLocked}
                   eventHandlers={{
                     'pm:edit': async (e: any) => {
                       const latlng = e.target.getLatLng();
                       const newCoords = [latlng.lat, latlng.lng];
                       const { addOrUpdateFeature, fetchData } = useGISStore.getState();
                       await addOrUpdateFeature(feature.layerId, feature.id, feature.type, newCoords, feature.properties);
                       fetchData();
                     },
                     'pm:remove': async () => {
                       const { removeFeature, fetchData } = useGISStore.getState();
                       await removeFeature(feature.id);
                       fetchData();
                     }
                   }}
                 >
                   <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                     <span className="font-bold text-xs">{isArabic ? feature.properties.nameAr : feature.properties.name}</span>
                   </Tooltip>
                   <Popup className="custom-popup" minWidth={250}>
                     <div className="p-1 flex flex-col gap-3" dir={isArabic ? 'rtl' : 'ltr'}>
                        {feature.properties.images && feature.properties.images[0] && (
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-th-surface2">
                            <img src={feature.properties.images[0]} alt="Feature" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-black text-lg text-th-text m-0">{isArabic ? feature.properties.nameAr : feature.properties.name}</h3>
                            {feature.properties.status && (
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                feature.properties.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                                feature.properties.status === 'critical' ? 'bg-red-500/10 text-red-650' :
                                'bg-th-muted/10 text-th-muted'
                              }`}>
                                {feature.properties.status}
                              </span>
                            )}
                          </div>
                          
                          {feature.properties.description && (
                            <p className="text-sm text-th-muted mt-1 leading-relaxed line-clamp-2">{isArabic ? feature.properties.descriptionAr : feature.properties.description}</p>
                          )}
                          
                          <button 
                            onClick={() => setSelectedFeatureId(feature.id)}
                            className="mt-3 w-full py-2 bg-teal-500/10 text-teal-500 font-bold text-xs rounded-lg hover:bg-teal-500 hover:text-white transition-colors"
                          >
                            {isArabic ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
                          </button>
                        </div>
                     </div>
                   </Popup>
                 </Marker>
               );
            }
            if (feature.type === 'Polygon') {
               return (
                 <Polygon 
                   key={feature.id} 
                   positions={feature.coordinates[0]} 
                   pmIgnore={layer.isLocked}
                   pathOptions={{ 
                     color: layer.color || '#3388ff', 
                     fillColor: layer.color || '#3388ff', 
                     fillOpacity: (layer.opacity ?? 1) * 0.4,
                     opacity: layer.opacity ?? 1,
                     pmIgnore: layer.isLocked
                   }}
                   eventHandlers={{
                     'pm:edit': async (e: any) => {
                       const lay = e.target;
                       const latlngs = lay.getLatLngs() as any;
                       const newCoords = [latlngs[0].map((ll: any) => [ll.lat, ll.lng])];
                       const { addOrUpdateFeature, fetchData } = useGISStore.getState();
                       await addOrUpdateFeature(feature.layerId, feature.id, feature.type, newCoords, feature.properties);
                       fetchData();
                     },
                     'pm:remove': async () => {
                       const { removeFeature, fetchData } = useGISStore.getState();
                       await removeFeature(feature.id);
                       fetchData();
                     }
                   }}
                 >
                   <Tooltip sticky direction="top" opacity={0.9}>
                     <span className="font-bold text-xs">{isArabic ? feature.properties.nameAr : feature.properties.name}</span>
                   </Tooltip>
                   <Popup className="custom-popup" minWidth={250}>
                     <div className="p-1 flex flex-col gap-3" dir={isArabic ? 'rtl' : 'ltr'}>
                        {feature.properties.images && feature.properties.images[0] && (
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-th-surface2">
                            <img src={feature.properties.images[0]} alt="Feature" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-black text-lg text-th-text m-0">{isArabic ? feature.properties.nameAr : feature.properties.name}</h3>
                            {feature.properties.status && (
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                feature.properties.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                                'bg-th-muted/10 text-th-muted'
                              }`}>
                                {feature.properties.status}
                              </span>
                            )}
                          </div>
                          
                          {feature.properties.description && (
                            <p className="text-sm text-th-muted mt-1 leading-relaxed line-clamp-2">{isArabic ? feature.properties.descriptionAr : feature.properties.description}</p>
                          )}
                          
                          <button 
                            onClick={() => setSelectedFeatureId(feature.id)}
                            className="mt-3 w-full py-2 bg-teal-500/10 text-teal-500 font-bold text-xs rounded-lg hover:bg-teal-500 hover:text-white transition-colors"
                          >
                            {isArabic ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
                          </button>
                        </div>
                     </div>
                   </Popup>
                 </Polygon>
               );
            }
            if (feature.type === 'LineString') {
               return (
                 <Polyline 
                   key={feature.id} 
                   positions={feature.coordinates} 
                   pmIgnore={layer.isLocked}
                   pathOptions={{ 
                     color: layer.color || '#3388ff', 
                     opacity: layer.opacity ?? 1,
                     weight: 4,
                     pmIgnore: layer.isLocked
                   }}
                   eventHandlers={{
                     'pm:edit': async (e: any) => {
                       const lay = e.target;
                       const latlngs = lay.getLatLngs() as any[];
                       const newCoords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
                       const { addOrUpdateFeature, fetchData } = useGISStore.getState();
                       await addOrUpdateFeature(feature.layerId, feature.id, feature.type, newCoords, feature.properties);
                       fetchData();
                     },
                     'pm:remove': async () => {
                       const { removeFeature, fetchData } = useGISStore.getState();
                       await removeFeature(feature.id);
                       fetchData();
                     }
                   }}
                 >
                   <Tooltip sticky direction="top" opacity={0.9}>
                     <span className="font-bold text-xs">{isArabic ? feature.properties.nameAr : feature.properties.name}</span>
                   </Tooltip>
                   <Popup className="custom-popup" minWidth={250}>
                     <div className="p-1 flex flex-col gap-3" dir={isArabic ? 'rtl' : 'ltr'}>
                        {feature.properties.images && feature.properties.images[0] && (
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-th-surface2">
                            <img src={feature.properties.images[0]} alt="Feature" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-black text-lg text-th-text m-0">{isArabic ? feature.properties.nameAr : feature.properties.name}</h3>
                            {feature.properties.status && (
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                feature.properties.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                                'bg-th-muted/10 text-th-muted'
                              }`}>
                                {feature.properties.status}
                              </span>
                            )}
                          </div>
                          
                          {feature.properties.description && (
                            <p className="text-sm text-th-muted mt-1 leading-relaxed line-clamp-2">{isArabic ? feature.properties.descriptionAr : feature.properties.description}</p>
                          )}
                          
                          <button 
                            onClick={() => setSelectedFeatureId(feature.id)}
                            className="mt-3 w-full py-2 bg-teal-500/10 text-teal-500 font-bold text-xs rounded-lg hover:bg-teal-500 hover:text-white transition-colors"
                          >
                            {isArabic ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
                          </button>
                        </div>
                     </div>
                   </Popup>
                 </Polyline>
               );
            }
            return null;
          });
        })}
      </MapContainer>

      {/* Floating Layer Management Panel */}
      {!isLayersOpen ? (
        <button
          onClick={() => setIsLayersOpen(true)}
          className={`absolute top-4 ${isArabic ? 'right-4' : 'left-4'} z-[1000] p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl hover:scale-105 transition-all text-slate-855 dark:text-slate-100 gis-floating-panel`}
          title={isArabic ? 'إظهار قائمة الطبقات' : 'Show Layer List'}
        >
          <Layers size={20} className="text-teal-500" />
        </button>
      ) : (
        <div
          ref={layersPanelRef}
          className={`absolute top-4 ${isArabic ? 'right-4' : 'left-4'} z-[1000] w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 max-h-[calc(100%-120px)] overflow-y-auto gis-floating-panel`}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers size={18} className="text-teal-500" />
              {isArabic ? 'طبقات البيانات' : 'Data Layers'}
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowManager(true)}
                className="p-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-500/20 transition-colors"
                title={isArabic ? 'إعدادات الطبقات' : 'Layer Settings'}
              >
                <Settings2 size={14} />
              </button>
              <button 
                onClick={() => setIsLayersOpen(false)}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={isArabic ? 'إخفاء' : 'Hide'}
              >
                {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2.5 overflow-y-auto pr-1 pl-1">
            {displayedLayers.map((layer, index) => (
              <div key={layer.id} className="flex flex-col p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-colors text-xs">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color || '#ccc' }} />
                     <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{isArabic ? layer.nameAr : layer.name}</span>
                   </div>
                   <div className="flex items-center gap-1 text-slate-400 dark:text-slate-550">
                     <button 
                       onClick={() => toggleLayerVisibility(layer.id)}
                       className={`p-1 rounded-md transition-colors ${layer.isVisible ? 'text-teal-500 hover:bg-teal-500/10' : 'text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800'}`}
                       title={isArabic ? 'إظهار/إخفاء' : 'Toggle Visibility'}
                     >
                       {layer.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                     </button>
                     <div className="flex flex-col text-slate-400 dark:text-slate-500">
                       <button onClick={() => moveLayerDown(layer.id)} disabled={index === 0} className="hover:text-teal-500 disabled:opacity-30">
                         <ChevronUp size={11} />
                       </button>
                       <button onClick={() => moveLayerUp(layer.id)} disabled={index === displayedLayers.length - 1} className="hover:text-teal-500 disabled:opacity-30">
                         <ChevronDown size={11} />
                       </button>
                     </div>
                   </div>
                 </div>
                 {layer.isVisible && (
                   <div className="mt-2 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/50 pt-1.5">
                     <span className="text-[9px] text-slate-500 dark:text-slate-400 shrink-0">{isArabic ? 'الشفافية' : 'Opacity'}</span>
                     <input 
                       type="range" 
                       min="0" max="1" step="0.1" 
                       value={layer.opacity ?? 1} 
                       onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                       className="w-full h-1 accent-teal-500 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer appearance-none outline-none"
                     />
                   </div>
                 )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Timeline Slider & Print Panel */}
      <div
        ref={timelinePanelRef}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[92%] md:w-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-300 gis-floating-panel"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-50">
            <Clock size={14} className="text-teal-500 animate-pulse" />
            {isArabic ? 'الخط الزمني للتحديثات' : 'Update Timeline'}
          </span>
          <span className="font-mono text-teal-650 dark:text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-md text-[10px]">
            {timelineFilterDate ? new Date(timelineFilterDate).toLocaleDateString() : ''}
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-500 hover:text-white transition-all text-[11px] font-bold border border-teal-500/20"
            title={isArabic ? 'طباعة الخريطة' : 'Print Map'}
          >
            <Printer size={12} />
            {isArabic ? 'طباعة' : 'Print'}
          </button>
        </div>
        <input 
          type="range" 
          min={minDate} 
          max={maxDate} 
          step={86400000} // 1 day in ms
          value={timelineFilterDate || maxDate} 
          onChange={e => setTimelineFilterDate(parseInt(e.target.value))}
          className="w-full accent-teal-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer appearance-none outline-none"
        />
      </div>

      {/* Floating Basemap Switcher */}
      <BasemapSwitcher isArabic={isArabic} />

      {/* Floating Detail Panel */}
      <FeatureDetailPanel isArabic={isArabic} />

      {/* Floating Custom Zoom Controls */}
      <div
        className={`absolute top-20 ${isArabic ? 'left-4' : 'right-4'} z-[1000] flex flex-col items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in duration-200 gis-floating-panel`}
      >
        <button
          onClick={() => mapInstance?.zoomIn()}
          className="p-2 rounded-xl text-teal-600 hover:bg-teal-500/10 dark:text-teal-400 transition-all hover:scale-105"
          title={isArabic ? 'تكبير الخريطة' : 'Zoom In'}
        >
          <Plus size={16} />
        </button>
        <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800" />
        <button
          onClick={() => mapInstance?.zoomOut()}
          className="p-2 rounded-xl text-teal-600 hover:bg-teal-500/10 dark:text-teal-400 transition-all hover:scale-105"
          title={isArabic ? 'تصغير الخريطة' : 'Zoom Out'}
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Floating Custom Drawing & Editing Toolbar */}
      <div
        ref={toolbarRef}
        className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} z-[1000] flex flex-row items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in duration-200 gis-floating-panel`}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {[
          { id: 'Marker', labelAr: 'إضافة نقطة', label: 'Add Point', icon: MapPin, color: 'text-teal-600 hover:bg-teal-500/10 dark:text-teal-400' },
          { id: 'Line', labelAr: 'رسم مسار', label: 'Draw Path', icon: GitCommit, color: 'text-blue-600 hover:bg-blue-500/10 dark:text-blue-400' },
          { id: 'Polygon', labelAr: 'رسم منطقة', label: 'Draw Zone', icon: Hexagon, color: 'text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400' },
          { id: 'Rectangle', labelAr: 'رسم مستطيل', label: 'Draw Rectangle', icon: Square, color: 'text-indigo-650 hover:bg-indigo-500/10 dark:text-indigo-400' },
          { id: 'edit', labelAr: 'تعديل المعالم', label: 'Edit Features', icon: Edit3, color: 'text-amber-600 hover:bg-amber-500/10 dark:text-amber-400' },
          { id: 'delete', labelAr: 'حذف المعالم', label: 'Delete Features', icon: Trash2, color: 'text-red-650 hover:bg-red-500/10 dark:text-red-400' },
          { id: 'home', labelAr: 'إعادة تعيين المنظور', label: 'Reset View', icon: Compass, color: 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-400' },
        ].map((btn) => {
          const Icon = btn.icon;
          const isActive = activeMode === btn.id;
          
          let activeBg = '';
          if (isActive) {
            if (btn.id === 'Marker') activeBg = 'bg-teal-500 text-white shadow-md shadow-teal-500/20';
            else if (btn.id === 'Line') activeBg = 'bg-blue-500 text-white shadow-md shadow-blue-500/20';
            else if (btn.id === 'Polygon') activeBg = 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
            else if (btn.id === 'Rectangle') activeBg = 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20';
            else if (btn.id === 'edit') activeBg = 'bg-amber-500 text-white shadow-md shadow-amber-500/20';
            else if (btn.id === 'delete') activeBg = 'bg-red-500 text-white shadow-md shadow-red-500/20';
          }

          return (
            <button
              key={btn.id}
              onClick={() => handleModeClick(btn.id)}
              className={`p-2 rounded-xl transition-all hover:scale-105 ${
                isActive ? activeBg : `${btn.color} text-slate-700 dark:text-slate-300`
              }`}
              title={isArabic ? btn.labelAr : btn.label}
            >
              <Icon size={16} />
            </button>
          );
        })}

        {activeMode && activeMode !== 'home' && (
          <>
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
            <button
              onClick={() => handleModeClick(activeMode)}
              className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 hover:scale-105 transition-all"
              title={isArabic ? 'إلغاء الوضع الحالي' : 'Cancel Mode'}
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>

      {/* Layer Manager Modal (Full screen overlay) */}
      {showManager && <LayerManagerModal isArabic={isArabic} onClose={() => setShowManager(false)} />}

      {draftFeature && (
        <FeatureFormModal 
          isArabic={isArabic}
          featureData={draftFeature}
          onClose={() => {
            if (draftFeature.leafletLayer) {
              draftFeature.leafletLayer.remove();
            }
            setDraftFeature(null);
            setDashboardDraftFeature(null);
          }}
          onSave={async (properties, layerId) => {
            await addOrUpdateFeature(
              layerId,
              null,
              draftFeature.type,
              draftFeature.coordinates,
              properties
            );
            if (draftFeature.leafletLayer) {
              draftFeature.leafletLayer.remove();
            }
            setDraftFeature(null);
            setDashboardDraftFeature(null);
          }}
        />
      )}
    </div>
  );
}
