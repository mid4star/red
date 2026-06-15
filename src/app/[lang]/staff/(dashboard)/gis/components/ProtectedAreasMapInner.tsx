'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Shield, Search, Filter, Layers, Eye, EyeOff, Navigation, Info,
  Leaf, Thermometer, Mountain, Shell, ChevronLeft, ChevronRight,
  X, Plus, Minus, Compass, BarChart3, Globe2, Waves, TreePine,
  MapPin, ArrowRight, Loader2, AlertTriangle, TrendingUp
} from 'lucide-react';
import { useGISStore } from '../store/gisStore';

// ─── API Constants ──────────────────────────────────────────
const PROXY = '/api/ecolytics';

// Helper to build proxy URL
function proxyUrl(endpoint: string, params?: Record<string, string>): string {
  const sp = new URLSearchParams({ endpoint, ...params });
  return `${PROXY}?${sp.toString()}`;
}

// ─── Types ──────────────────────────────────────────────────
interface ProtectedArea {
  name: string;
  name_eng: string;
  iso3: string;
  status: string;
  area_km2: number;
}

interface PAInfo {
  name: string;
  iso3: string;
  iucn_cat: string | null;
  iucn_label: string | null;
  desig: string;
  desig_type: string;
  status: string;
  status_year: number;
  gov_type: string | null;
  own_type: string | null;
  mang_auth: string | null;
  area_km2: number;
  marine_area_km2: number;
}

interface PAGeometry {
  type: string;
  coordinates: any[];
  center: [number, number]; // [lng, lat]
  area_km2: number;
}

interface NDVIStats {
  pa: string;
  year: number;
  mean_ndvi: number;
  band_areas: {
    [key: string]: {
      km2: number;
      pct: number;
      color: string;
      label: string;
    };
  };
  total_area_km2: number;
  vegetation_cover_pct: number;
  percentiles?: Record<string, number>;
}

interface TileOverlay {
  id: string;
  label: string;
  labelAr: string;
  icon: any;
  color: string;
  getUrl: (paName: string) => string;
}

// ─── Tile Overlay Definitions ───────────────────────────────
const TILE_OVERLAYS: TileOverlay[] = [
  {
    id: 'ndvi',
    label: 'NDVI Vegetation',
    labelAr: 'مؤشر الغطاء النباتي',
    icon: Leaf,
    color: '#22c55e',
    getUrl: (pa) => proxyUrl('tiles/ndvi', { pa, year: '2025' })
  },
  {
    id: 'climate',
    label: 'Climate Data',
    labelAr: 'البيانات المناخية',
    icon: Thermometer,
    color: '#f59e0b',
    getUrl: (pa) => proxyUrl('tiles/climate', { pa, year: '2024' })
  },
  {
    id: 'elevation',
    label: 'Elevation',
    labelAr: 'الارتفاعات',
    icon: Mountain,
    color: '#8b5cf6',
    getUrl: (pa) => proxyUrl('tiles/elevation', { pa })
  },
  {
    id: 'coral',
    label: 'Coral Reefs',
    labelAr: 'الشعاب المرجانية',
    icon: Shell,
    color: '#ec4899',
    getUrl: (pa) => proxyUrl('tiles/coral', { pa, buffer_km: '10' })
  }
];

// ─── Consistent Colors for PAs ──────────────────────────────
const PA_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#e11d48', '#0891b2', '#a855f7', '#65a30d',
  '#dc2626', '#0ea5e9', '#d946ef', '#ca8a04', '#059669',
  '#7c3aed', '#db2777', '#0d9488', '#c2410c', '#4f46e5',
  '#be185d', '#047857', '#9333ea', '#b91c1c', '#0284c7',
  '#a21caf'
];

// ─── Map FlyTo helper ───────────────────────────────────────
function FlyToHandler({ center, zoom }: { center: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 9, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

function MapRef({ setMap }: { setMap: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { setMap(map); }, [map, setMap]);
  return null;
}

// ─── Main Component ─────────────────────────────────────────
export default function ProtectedAreasMapInner({ isArabic }: { isArabic: boolean }) {
  const { activeBasemap } = useGISStore();

  // ─── State ────────────────────────────────────────────────
  const [allPAs, setAllPAs] = useState<ProtectedArea[]>([]);
  const [marinePAs, setMarinePAs] = useState<ProtectedArea[]>([]);
  const [filter, setFilter] = useState<'all' | 'marine' | 'terrestrial'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [geometries, setGeometries] = useState<Record<string, PAGeometry>>({});
  const [loadingGeometries, setLoadingGeometries] = useState<Record<string, boolean>>({});
  const [selectedPA, setSelectedPA] = useState<string | null>(null);
  const [paInfo, setPAInfo] = useState<PAInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [ndviStats, setNdviStats] = useState<NDVIStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState<Record<string, boolean>>({});
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [visiblePAs, setVisiblePAs] = useState<Record<string, boolean>>({});
  const [loadingAllGeo, setLoadingAllGeo] = useState(false);
  const [geoBatchProgress, setGeoBatchProgress] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const overlayPanelRef = useRef<HTMLDivElement>(null);
  const statsPanelRef = useRef<HTMLDivElement>(null);

  // Disable map interactions on panels
  useEffect(() => {
    [panelRef, overlayPanelRef, statsPanelRef].forEach(ref => {
      if (ref.current) {
        L.DomEvent.disableClickPropagation(ref.current);
        L.DomEvent.disableScrollPropagation(ref.current);
      }
    });
  }, [isPanelOpen, isStatsOpen]);

  // ─── Fetch PA List + Auto-load ALL geometries ─────────────
  const geometriesRef = useRef<Record<string, PAGeometry>>({});

  useEffect(() => {
    let cancelled = false;

    const loadEverything = async () => {
      setIsLoadingList(true);
      try {
        // 1) Fetch PA list
        const [allRes, marineRes] = await Promise.all([
          fetch(proxyUrl('pa/list', { iso3: 'EGY' })),
          fetch(proxyUrl('pa/list', { iso3: 'EGY', realm: 'marine' }))
        ]);
        const allData: ProtectedArea[] = await allRes.json();
        const marineData: ProtectedArea[] = await marineRes.json();
        if (cancelled) return;
        setAllPAs(allData);
        setMarinePAs(marineData);

        // Initialize all as visible
        const vis: Record<string, boolean> = {};
        allData.forEach(pa => { vis[pa.name_eng] = true; });
        setVisiblePAs(vis);
        setIsLoadingList(false);

        // 2) Auto-load ALL geometries
        setLoadingAllGeo(true);
        setGeoBatchProgress(0);

        for (let i = 0; i < allData.length; i++) {
          if (cancelled) return;
          const pa = allData[i];

          // Skip if already loaded
          if (geometriesRef.current[pa.name_eng]) {
            setGeoBatchProgress(Math.round(((i + 1) / allData.length) * 100));
            continue;
          }

          setLoadingGeometries(prev => ({ ...prev, [pa.name_eng]: true }));
          try {
            const res = await fetch(proxyUrl('pa/geometry', { name: pa.name_eng }));
            if (res.ok) {
              const data: PAGeometry = await res.json();
              if (!cancelled) {
                geometriesRef.current[pa.name_eng] = data;
                setGeometries(prev => ({ ...prev, [pa.name_eng]: data }));
              }
            }
          } catch (err) {
            console.error(`Failed to fetch geometry for ${pa.name_eng}:`, err);
          } finally {
            if (!cancelled) {
              setLoadingGeometries(prev => ({ ...prev, [pa.name_eng]: false }));
            }
          }

          setGeoBatchProgress(Math.round(((i + 1) / allData.length) * 100));
          // Small delay to not overwhelm the API
          await new Promise(r => setTimeout(r, 150));
        }

        if (!cancelled) {
          setLoadingAllGeo(false);
        }
      } catch (err) {
        console.error('Failed to fetch PA list:', err);
        if (!cancelled) {
          setIsLoadingList(false);
          setLoadingAllGeo(false);
        }
      }
    };
    loadEverything();
    return () => { cancelled = true; };
  }, []);

  // ─── Fetch Geometry for a single PA (on-demand) ───────────
  const fetchGeometry = useCallback(async (paNameEng: string) => {
    if (geometriesRef.current[paNameEng]) return;
    setLoadingGeometries(prev => ({ ...prev, [paNameEng]: true }));
    try {
      const res = await fetch(proxyUrl('pa/geometry', { name: paNameEng }));
      if (res.ok) {
        const data: PAGeometry = await res.json();
        geometriesRef.current[paNameEng] = data;
        setGeometries(prev => ({ ...prev, [paNameEng]: data }));
      }
    } catch (err) {
      console.error(`Failed to fetch geometry for ${paNameEng}:`, err);
    } finally {
      setLoadingGeometries(prev => ({ ...prev, [paNameEng]: false }));
    }
  }, []);

  // ─── Reload geometries (manual button) ────────────────────
  const loadAllGeometries = useCallback(async () => {
    const toLoad = allPAs.filter(pa => !geometriesRef.current[pa.name_eng]);
    if (toLoad.length === 0) return;

    setLoadingAllGeo(true);
    setGeoBatchProgress(0);

    for (let i = 0; i < toLoad.length; i++) {
      const pa = toLoad[i];
      setLoadingGeometries(prev => ({ ...prev, [pa.name_eng]: true }));
      try {
        const res = await fetch(proxyUrl('pa/geometry', { name: pa.name_eng }));
        if (res.ok) {
          const data: PAGeometry = await res.json();
          geometriesRef.current[pa.name_eng] = data;
          setGeometries(prev => ({ ...prev, [pa.name_eng]: data }));
        }
      } catch (err) {
        console.error(`Failed to fetch geometry for ${pa.name_eng}:`, err);
      } finally {
        setLoadingGeometries(prev => ({ ...prev, [pa.name_eng]: false }));
      }
      setGeoBatchProgress(Math.round(((i + 1) / toLoad.length) * 100));
      await new Promise(r => setTimeout(r, 150));
    }

    setLoadingAllGeo(false);
  }, [allPAs]);

  // ─── Fetch PA Info ────────────────────────────────────────
  const fetchPAInfo = useCallback(async (paNameEng: string) => {
    setLoadingInfo(true);
    setPAInfo(null);
    try {
      const res = await fetch(proxyUrl('pa/info', { name: paNameEng }));
      const data: PAInfo = await res.json();
      setPAInfo(data);
    } catch (err) {
      console.error(`Failed to fetch PA info for ${paNameEng}:`, err);
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  // ─── Fetch NDVI Stats ────────────────────────────────────
  const fetchNDVIStats = useCallback(async (paNameEng: string) => {
    setLoadingStats(true);
    setNdviStats(null);
    try {
      const res = await fetch(proxyUrl('tiles/ndvi/stats', { pa: paNameEng, year: '2025' }));
      const data: NDVIStats = await res.json();
      setNdviStats(data);
    } catch (err) {
      console.error(`Failed to fetch NDVI stats for ${paNameEng}:`, err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ─── When a PA is selected ────────────────────────────────
  useEffect(() => {
    if (selectedPA) {
      fetchGeometry(selectedPA);
      fetchPAInfo(selectedPA);
      fetchNDVIStats(selectedPA);
      const geo = geometries[selectedPA];
      if (geo?.center) {
        setFlyTarget([geo.center[1], geo.center[0]]); // API returns [lng, lat]
      }
    }
  }, [selectedPA]);

  // Fly to geometry center once it loads
  useEffect(() => {
    if (selectedPA && geometries[selectedPA]?.center) {
      const c = geometries[selectedPA].center;
      setFlyTarget([c[1], c[0]]);
    }
  }, [selectedPA, geometries]);

  // ─── Filter Logic ────────────────────────────────────────
  const marineNames = useMemo(() => new Set(marinePAs.map(p => p.name_eng)), [marinePAs]);

  const filteredPAs = useMemo(() => {
    let list = allPAs;
    if (filter === 'marine') {
      list = allPAs.filter(p => marineNames.has(p.name_eng));
    } else if (filter === 'terrestrial') {
      list = allPAs.filter(p => !marineNames.has(p.name_eng));
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.name_eng.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.area_km2 - a.area_km2);
  }, [allPAs, filter, searchTerm, marineNames]);

  // ─── Toggle overlay ──────────────────────────────────────
  const toggleOverlay = useCallback((id: string) => {
    setActiveOverlays(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ─── Toggle PA visibility ────────────────────────────────
  const togglePAVisibility = useCallback((paNameEng: string) => {
    setVisiblePAs(prev => ({ ...prev, [paNameEng]: !prev[paNameEng] }));
  }, []);

  // ─── Extract rings from API geometry (handles both Polygon and MultiPolygon) ───
  const extractRings = useCallback((geometry: PAGeometry): [number, number][][] => {
    const coords = geometry.coordinates;
    if (!coords || coords.length === 0) return [];

    const rings: [number, number][][] = [];

    // Detect nesting depth by drilling down until we find numbers
    // API coords come as [lng, lat], Leaflet needs [lat, lng]
    const processCoordArray = (arr: any): void => {
      if (!arr || arr.length === 0) return;
      // If arr[0] is a number, this is a single coordinate pair [lng, lat]
      if (typeof arr[0] === 'number') return;
      // If arr[0][0] is a number, this is a ring of coordinate pairs [[lng, lat], ...]
      if (Array.isArray(arr[0]) && typeof arr[0][0] === 'number') {
        // This is a ring — swap lng/lat to lat/lng
        const ring: [number, number][] = arr
          .filter((c: any) => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number')
          .map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        if (ring.length > 0) rings.push(ring);
        return;
      }
      // Otherwise, go deeper
      for (const item of arr) {
        if (Array.isArray(item)) {
          processCoordArray(item);
        }
      }
    };

    processCoordArray(coords);
    return rings;
  }, []);

  // ─── Get color for a PA ──────────────────────────────────
  const getPAColor = useCallback((index: number) => {
    return PA_COLORS[index % PA_COLORS.length];
  }, []);

  const defaultCenter: [number, number] = [26.0, 33.0];

  return (
    <div className="w-full h-full relative" id="protected-areas-map">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        {/* Basemap */}
        {activeBasemap === 'satellite' && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
        )}
        {activeBasemap === 'marine' && (
          <>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
            <TileLayer url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png" attribution="&copy; OpenSeaMap" />
          </>
        )}
        {activeBasemap === 'terrain' && (
          <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="&copy; OpenTopoMap" />
        )}
        {activeBasemap === 'dark' && (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
        )}
        {activeBasemap === 'street' && (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
        )}

        <MapRef setMap={setMapInstance} />
        <FlyToHandler center={flyTarget} />

        {/* Render PA Boundaries as Polygons */}
        {filteredPAs.map((pa, index) => {
          const geo = geometries[pa.name_eng];
          if (!geo || !visiblePAs[pa.name_eng]) return null;
          const color = getPAColor(index);
          const isSelected = selectedPA === pa.name_eng;
          const rings = extractRings(geo);
          if (rings.length === 0) return null;

          return rings.map((ring, ringIdx) => (
            <Polygon
              key={`${pa.name_eng}-${ringIdx}-${isSelected}`}
              positions={ring}
              pathOptions={{
                color: isSelected ? '#ffffff' : color,
                weight: isSelected ? 3 : 2,
                fillColor: color,
                fillOpacity: isSelected ? 0.45 : 0.25,
                opacity: 1,
                dashArray: isSelected ? '' : '4 4'
              }}
              eventHandlers={{
                click: () => {
                  setSelectedPA(pa.name_eng);
                  setIsStatsOpen(true);
                }
              }}
            >
              <Popup minWidth={280} maxWidth={350}>
                <div className="p-2 flex flex-col gap-2" dir={isArabic ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                      <Shield size={16} style={{ color }} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white m-0 leading-tight">
                        {isArabic ? pa.name : pa.name_eng}
                      </h3>
                      <span className="text-[10px] text-slate-500">{isArabic ? pa.name_eng : pa.name}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                      <span className="text-[9px] text-slate-500 block">{isArabic ? 'المساحة' : 'Area'}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{pa.area_km2.toLocaleString()} km²</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                      <span className="text-[9px] text-slate-500 block">{isArabic ? 'الحالة' : 'Status'}</span>
                      <span className="text-xs font-black text-emerald-600">{pa.status}</span>
                    </div>
                  </div>
                  {marineNames.has(pa.name_eng) && (
                    <div className="flex items-center gap-1 mt-1">
                      <Waves size={12} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-600">{isArabic ? 'محمية بحرية' : 'Marine Protected Area'}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedPA(pa.name_eng);
                      setIsStatsOpen(true);
                    }}
                    className="w-full py-2 bg-emerald-500/10 text-emerald-600 font-bold text-xs rounded-lg hover:bg-emerald-500 hover:text-white transition-colors mt-1"
                  >
                    {isArabic ? 'عرض التفاصيل والإحصائيات' : 'View Details & Statistics'}
                  </button>
                </div>
              </Popup>
            </Polygon>
          ));
        })}

        {/* Raster tile overlays for selected PA */}
        {selectedPA && TILE_OVERLAYS.map(overlay => {
          if (!activeOverlays[overlay.id]) return null;
          const tileUrl = overlay.getUrl(selectedPA);
          return (
            <TileLayer
              key={`${overlay.id}-${selectedPA}`}
              url={tileUrl}
              opacity={0.7}
              attribution={`${overlay.label} © Ecolytics`}
            />
          );
        })}
      </MapContainer>

      {/* ─── Floating Zoom Controls ──────────────────────────── */}
      <div className={`absolute top-20 ${isArabic ? 'left-4' : 'right-4'} z-[1000] flex flex-col items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl`}>
        <button onClick={() => mapInstance?.zoomIn()} className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 transition-all hover:scale-105" title="Zoom In">
          <Plus size={16} />
        </button>
        <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800" />
        <button onClick={() => mapInstance?.zoomOut()} className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 transition-all hover:scale-105" title="Zoom Out">
          <Minus size={16} />
        </button>
        <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800" />
        <button onClick={() => { setFlyTarget(null); setTimeout(() => setFlyTarget(defaultCenter), 50); }} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105" title="Reset">
          <Compass size={16} />
        </button>
      </div>

      {/* ─── Floating Side Panel (PA List) ───────────────────── */}
      {!isPanelOpen ? (
        <button
          onClick={() => setIsPanelOpen(true)}
          className={`absolute top-4 ${isArabic ? 'right-4' : 'left-4'} z-[1000] p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl hover:scale-105 transition-all`}
          title={isArabic ? 'قائمة المحميات' : 'Protected Areas List'}
        >
          <Shield size={20} className="text-emerald-500" />
        </button>
      ) : (
        <div
          ref={panelRef}
          className={`absolute top-4 ${isArabic ? 'right-4' : 'left-4'} z-[1000] w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100%-32px)] animate-in slide-in-from-left-2 duration-300`}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-emerald-500" />
                {isArabic ? 'المحميات الطبيعية' : 'Protected Areas'}
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                  {filteredPAs.length}
                </span>
              </h3>
              <button onClick={() => setIsPanelOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={14} className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-3' : 'left-3'} text-slate-400`} />
              <input
                type="text"
                placeholder={isArabic ? 'بحث عن محمية...' : 'Search protected area...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all`}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl gap-0.5">
              {[
                { id: 'all' as const, icon: Globe2, label: isArabic ? 'الكل' : 'All' },
                { id: 'marine' as const, icon: Waves, label: isArabic ? 'بحرية' : 'Marine' },
                { id: 'terrestrial' as const, icon: TreePine, label: isArabic ? 'أرضية' : 'Terrestrial' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    filter === f.id
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <f.icon size={12} />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Load All Geometries Button */}
            <button
              onClick={loadAllGeometries}
              disabled={loadingAllGeo}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-xl hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 border border-emerald-500/20"
            >
              {loadingAllGeo ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  {isArabic ? `جاري التحميل ${geoBatchProgress}%` : `Loading ${geoBatchProgress}%`}
                </>
              ) : (
                <>
                  <Layers size={12} />
                  {isArabic ? 'تحميل جميع الحدود' : 'Load All Boundaries'}
                </>
              )}
            </button>
          </div>

          {/* PA List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoadingList ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 size={24} className="animate-spin text-emerald-500" />
                <span className="text-xs text-slate-500">{isArabic ? 'جاري تحميل المحميات...' : 'Loading protected areas...'}</span>
              </div>
            ) : filteredPAs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                <AlertTriangle size={20} />
                <span className="text-xs">{isArabic ? 'لا توجد نتائج' : 'No results found'}</span>
              </div>
            ) : (
              filteredPAs.map((pa, index) => {
                const color = getPAColor(index);
                const hasGeo = !!geometries[pa.name_eng];
                const isLoading = loadingGeometries[pa.name_eng];
                const isSelected = selectedPA === pa.name_eng;
                const isVisible = visiblePAs[pa.name_eng] !== false;
                const isMarine = marineNames.has(pa.name_eng);

                return (
                  <div
                    key={pa.name_eng}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/5 border-emerald-500/40 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-150 dark:border-slate-800/80 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                    }`}
                    onClick={() => {
                      setSelectedPA(pa.name_eng);
                      fetchGeometry(pa.name_eng);
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-3 h-3 rounded-full mt-1 shrink-0 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900" style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}40` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                            {isArabic ? pa.name : pa.name_eng}
                          </span>
                          {isMarine && <Waves size={10} className="text-blue-500 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {isArabic ? pa.name_eng : pa.name}
                        </span>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5">
                            <MapPin size={8} />
                            {pa.area_km2.toLocaleString()} km²
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            pa.status === 'Designated' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {pa.status}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePAVisibility(pa.name_eng);
                          }}
                          className={`p-1 rounded-md transition-colors ${isVisible ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                          title={isArabic ? 'إظهار/إخفاء' : 'Toggle Visibility'}
                        >
                          {isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
                        </button>
                        {hasGeo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const geo = geometries[pa.name_eng];
                              if (geo?.center) {
                                setFlyTarget(null);
                                setTimeout(() => setFlyTarget([geo.center[1], geo.center[0]]), 50);
                              }
                            }}
                            className="p-1 rounded-md text-blue-500 hover:bg-blue-500/10 transition-colors"
                            title={isArabic ? 'التركيز على المحمية' : 'Fly to PA'}
                          >
                            <Navigation size={11} />
                          </button>
                        )}
                        {!hasGeo && !isLoading && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchGeometry(pa.name_eng);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title={isArabic ? 'تحميل الحدود' : 'Load Boundary'}
                          >
                            <ArrowRight size={11} />
                          </button>
                        )}
                        {isLoading && (
                          <div className="p-1">
                            <Loader2 size={11} className="animate-spin text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Loaded indicator */}
                    {hasGeo && (
                      <div className="absolute top-1 right-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── Floating Tile Overlay Controls ──────────────────── */}
      {selectedPA && (
        <div
          ref={overlayPanelRef}
          className={`absolute bottom-20 ${isArabic ? 'right-4' : 'left-4'} z-[1000] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 w-[260px] animate-in slide-in-from-bottom-2 duration-300`}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={12} className="text-emerald-500" />
              {isArabic ? 'طبقات التحليل' : 'Analysis Layers'}
            </span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full truncate max-w-[120px]">
              {selectedPA}
            </span>
          </div>
          <div className="space-y-1.5">
            {TILE_OVERLAYS.map(overlay => {
              const Icon = overlay.icon;
              const isActive = activeOverlays[overlay.id];
              return (
                <button
                  key={overlay.id}
                  onClick={() => toggleOverlay(overlay.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                  style={isActive ? { backgroundColor: overlay.color, boxShadow: `0 4px 14px ${overlay.color}40` } : {}}
                >
                  <Icon size={14} />
                  {isArabic ? overlay.labelAr : overlay.label}
                  <div className={`ml-auto w-3 h-3 rounded-full border-2 transition-all ${
                    isActive ? 'bg-white border-white/50' : 'border-slate-300 dark:border-slate-600'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Floating Stats Panel (Right Side) ───────────────── */}
      {isStatsOpen && selectedPA && (
        <div
          ref={statsPanelRef}
          className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} z-[1000] w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100%-80px)] animate-in slide-in-from-right-2 duration-300`}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Stats Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-500" />
                {isArabic ? 'تفاصيل المحمية' : 'PA Details'}
              </h3>
              <button onClick={() => setIsStatsOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* PA Info Card */}
            {loadingInfo ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={20} className="animate-spin text-emerald-500" />
              </div>
            ) : paInfo ? (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-3 border border-emerald-500/20">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1">{isArabic ? paInfo.name : selectedPA}</h4>
                  <p className="text-[10px] text-slate-500">{isArabic ? selectedPA : paInfo.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <InfoCard
                    label={isArabic ? 'المساحة الكلية' : 'Total Area'}
                    value={`${paInfo.area_km2.toLocaleString()} km²`}
                    color="emerald"
                  />
                  <InfoCard
                    label={isArabic ? 'المساحة البحرية' : 'Marine Area'}
                    value={`${paInfo.marine_area_km2?.toLocaleString() || 'N/A'} km²`}
                    color="blue"
                  />
                  <InfoCard
                    label={isArabic ? 'سنة التعيين' : 'Designation Year'}
                    value={paInfo.status_year?.toString() || 'N/A'}
                    color="amber"
                  />
                  <InfoCard
                    label={isArabic ? 'الحالة' : 'Status'}
                    value={paInfo.status}
                    color="violet"
                  />
                </div>

                {paInfo.desig && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                      {isArabic ? 'نوع التعيين' : 'Designation'}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{paInfo.desig}</span>
                  </div>
                )}

                {paInfo.desig_type && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                      {isArabic ? 'نوع الإدارة' : 'Designation Type'}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{paInfo.desig_type}</span>
                  </div>
                )}

                {paInfo.iucn_cat && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                      {isArabic ? 'تصنيف IUCN' : 'IUCN Category'}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{paInfo.iucn_cat} — {paInfo.iucn_label}</span>
                  </div>
                )}
              </div>
            ) : null}

            {/* NDVI Statistics */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-green-500" />
                {isArabic ? 'إحصائيات الغطاء النباتي (NDVI)' : 'Vegetation Statistics (NDVI)'}
              </h4>

              {loadingStats ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={20} className="animate-spin text-green-500" />
                </div>
              ) : ndviStats ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <InfoCard
                      label={isArabic ? 'متوسط NDVI' : 'Mean NDVI'}
                      value={ndviStats.mean_ndvi.toFixed(4)}
                      color="green"
                    />
                    <InfoCard
                      label={isArabic ? 'نسبة الغطاء النباتي' : 'Vegetation Cover'}
                      value={`${ndviStats.vegetation_cover_pct}%`}
                      color="lime"
                    />
                  </div>

                  {/* Band Areas Chart */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-2">
                      {isArabic ? 'توزيع الغطاء الأرضي' : 'Land Cover Distribution'}
                    </span>
                    {/* Stacked Bar */}
                    <div className="w-full h-4 rounded-full overflow-hidden flex mb-2">
                      {Object.entries(ndviStats.band_areas).map(([key, band]) => (
                        <div
                          key={key}
                          style={{ width: `${band.pct}%`, backgroundColor: band.color, minWidth: band.pct > 0 ? '2px' : '0' }}
                          title={`${band.label}: ${band.pct}%`}
                          className="transition-all"
                        />
                      ))}
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(ndviStats.band_areas).map(([key, band]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: band.color }} />
                          <span className="text-[9px] text-slate-600 dark:text-slate-400">
                            {band.label}: <strong>{band.pct}%</strong> ({band.km2.toLocaleString()} km²)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Percentiles */}
                  {ndviStats.percentiles && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-2">
                        {isArabic ? 'توزيع NDVI' : 'NDVI Percentiles'}
                      </span>
                      <div className="space-y-1">
                        {Object.entries(ndviStats.percentiles).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{key}</span>
                            <div className="flex-1 mx-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                style={{ width: `${Math.max(0, Math.min(100, ((val as number) + 1) * 50))}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300">{(val as number).toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-[10px] text-slate-400">{isArabic ? 'لا تتوفر إحصائيات' : 'No statistics available'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Bottom Info Bar ─────────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl px-5 py-2.5 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {isArabic ? 'حدود المحميات' : 'PA Boundaries'}
          </span>
        </div>
        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
        <span className="text-[10px] text-slate-500">
          {isArabic ? `${Object.keys(geometries).length} محمية محملة` : `${Object.keys(geometries).length} loaded`}
        </span>
        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
        <span className="text-[10px] text-slate-500">
          {isArabic ? `${filteredPAs.length} إجمالي` : `${filteredPAs.length} total`}
        </span>
        {selectedPA && (
          <>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[150px]">
              {selectedPA}
            </span>
            <button onClick={() => { setSelectedPA(null); setIsStatsOpen(false); setActiveOverlays({}); }} className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
              <X size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Info Card Sub-Component ────────────────────────────────
function InfoCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    blue: 'bg-blue-500/10 text-blue-600',
    amber: 'bg-amber-500/10 text-amber-600',
    violet: 'bg-violet-500/10 text-violet-600',
    green: 'bg-green-500/10 text-green-600',
    lime: 'bg-lime-500/10 text-lime-600',
    red: 'bg-red-500/10 text-red-600',
  };
  const cls = colorMap[color] || colorMap.emerald;

  return (
    <div className={`rounded-xl p-2.5 ${cls.split(' ')[0]}`}>
      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-0.5">{label}</span>
      <span className={`text-sm font-black ${cls.split(' ')[1]}`}>{value}</span>
    </div>
  );
}
