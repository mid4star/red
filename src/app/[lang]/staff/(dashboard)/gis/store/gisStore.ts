import { create } from 'zustand';
import { GISLayer, GISFeature } from '../types/gis.types';
import { 
  getGisLayers, 
  getGisFeatures, 
  saveGisFeature, 
  deleteGisFeature, 
  initDefaultLayers, 
  createGisLayer, 
  deleteGisLayer, 
  getExternalLayers, 
  updateLayerOpacity, 
  updateLayerOrder,
  updateGisLayer,
  bulkDeleteGisFeatures,
  bulkMoveGisFeatures
} from '../actions/gisActions';


interface GISState {
  activeTab: 'dashboard' | 'map' | 'analytics' | 'reports' | 'private-maps';
  setActiveTab: (tab: 'dashboard' | 'map' | 'analytics' | 'reports' | 'private-maps') => void;
  
  privateMapTab: 'projects' | 'buoys' | 'diving' | 'reserves-boundaries';
  setPrivateMapTab: (tab: 'projects' | 'buoys' | 'diving' | 'reserves-boundaries') => void;
  
  layers: GISLayer[];
  features: GISFeature[];
  isLoading: boolean;
  
  fetchData: () => Promise<void>;
  
  toggleLayerVisibility: (id: string) => void;
  
  selectedFeatureId: string | null;
  setSelectedFeatureId: (id: string | null) => void;
  
  addOrUpdateFeature: (layerId: string, featureId: string | null, type: string, coordinates: any, properties: any) => Promise<void>;
  removeFeature: (id: string) => Promise<void>;
  
  addLayer: (data: { name: string, nameAr: string, category: string, color: string }) => Promise<{success: boolean, error?: string}>;
  removeLayer: (id: string) => Promise<{success: boolean, error?: string}>;
  setLayerOpacity: (id: string, opacity: number) => Promise<void>;
  moveLayerUp: (id: string) => Promise<void>;
  moveLayerDown: (id: string) => Promise<void>;
  
  searchedFeatureId: string | null;
  setSearchedFeatureId: (id: string | null) => void;
  
  timelineFilterDate: number | null; // Timestamp
  setTimelineFilterDate: (dateMs: number | null) => void;
  
  activeBasemap: string;
  setActiveBasemap: (mapId: string) => void;

  updateLayer: (id: string, data: { name: string, nameAr: string, category: string, color: string }) => Promise<{success: boolean, error?: string}>;
  bulkDeleteFeatures: (ids: string[]) => Promise<{success: boolean, error?: string}>;
  bulkMoveFeatures: (ids: string[], targetLayerId: string) => Promise<{success: boolean, error?: string}>;

  dashboardDraftFeature: { layerId: string; properties: any; step: 'drawing' | null } | null;
  setDashboardDraftFeature: (data: { layerId: string; properties: any; step: 'drawing' | null } | null) => void;
}

export const useGISStore = create<GISState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  privateMapTab: 'projects',
  setPrivateMapTab: (tab) => set({ privateMapTab: tab }),
  
  layers: [],
  features: [],
  isLoading: false,
  activeBasemap: 'satellite',
  setActiveBasemap: (mapId) => set({ activeBasemap: mapId }),
  
  dashboardDraftFeature: null,
  setDashboardDraftFeature: (data) => set({ dashboardDraftFeature: data }),

  fetchData: async () => {
    set({ isLoading: true });
    try {
      await initDefaultLayers(); // ensure layers exist
      const layersRes = await getGisLayers();
      const featuresRes = await getGisFeatures();
      const externalRes = await getExternalLayers();
      
      let allLayers: any[] = [];
      let allFeatures: any[] = [];

      if (layersRes.success) {
        allLayers = [...(layersRes.data as any[])];
      }
      
      // Inject Virtual External Layers
      allLayers.push({
        id: 'layer-reserves',
        name: 'Reserves (Database)',
        nameAr: 'المحميات (القاعدة الأساسية)',
        category: 'reserve',
        color: '#10b981',
        isVisible: true,
        isLocked: true,
        opacity: 0.5,
        order: 999
      });
      allLayers.push({
        id: 'layer-violations',
        name: 'Incidents (Database)',
        nameAr: 'البلاغات (القاعدة الأساسية)',
        category: 'reserve',
        color: '#ef4444',
        isVisible: true,
        isLocked: true,
        opacity: 1.0,
        order: 1000
      });
      allLayers.push({
        id: 'layer-eia-inspections',
        name: 'EIA Inspections',
        nameAr: 'تقييم الأثر - المعاينات',
        category: 'project',
        color: '#0284c7',
        isVisible: true,
        isLocked: true,
        opacity: 1.0,
        order: 1001
      });
      allLayers.push({
        id: 'layer-eia-violations',
        name: 'EIA Violations',
        nameAr: 'تقييم الأثر - المخالفات',
        category: 'reserve',
        color: '#f97316',
        isVisible: true,
        isLocked: true,
        opacity: 1.0,
        order: 1002
      });
      allLayers.push({
        id: 'layer-eia-accidents',
        name: 'EIA Accidents',
        nameAr: 'تقييم الأثر - الحوادث',
        category: 'reserve',
        color: '#dc2626',
        isVisible: true,
        isLocked: true,
        opacity: 1.0,
        order: 1003
      });
      allLayers.push({
        id: 'layer-eco-reports',
        name: 'Eco Monitoring Reports',
        nameAr: 'الرصد البيئي - التقارير',
        category: 'asset',
        color: '#10b981',
        isVisible: true,
        isLocked: true,
        opacity: 1.0,
        order: 1004
      });
      allLayers.push({
        id: 'layer-strandings',
        name: 'Stranding Cases',
        nameAr: 'الرصد البيئي - حالات النفوق',
        category: 'reserve',
        color: '#8b5cf6',
        isVisible: true,
        isLocked: true,
        opacity: 1.0,
        order: 1005
      });
      allLayers.push({
        id: 'layer-sightings',
        name: 'Wildlife Sightings',
        nameAr: 'الرصد البيئي - المشاهدات',
        category: 'asset',
        color: '#ec4899',
        isVisible: true,
        isLocked: true,
        opacity: 1.0,
        order: 1006
      });
      allLayers.push({
        id: 'layer-beach-surveys',
        name: 'Beach Surveys',
        nameAr: 'الرصد البيئي - مسوح الشواطئ',
        category: 'asset',
        color: '#eab308',
        isVisible: true,
        isLocked: true,
        opacity: 1.0,
        order: 1007
      });

      // Inject Private Map Categories if missing
      if (!allLayers.find(l => l.category === 'project' && l.id === 'layer-projects')) {
        allLayers.push({
          id: 'layer-projects',
          name: 'General Projects',
          nameAr: 'المشاريع العامة',
          category: 'project',
          color: '#3b82f6',
          isVisible: true,
          isLocked: false,
          opacity: 1.0,
          order: 998
        });
      }
      if (!allLayers.find(l => l.category === 'buoys')) {
        allLayers.push({
          id: 'layer-marine-buoys',
          name: 'Marine Buoys',
          nameAr: 'الشمندورات البحرية',
          category: 'buoys',
          color: '#6366f1',
          isVisible: true,
          isLocked: false,
          opacity: 1.0,
          order: 997
        });
      }
      if (!allLayers.find(l => l.category === 'diving')) {
        allLayers.push({
          id: 'layer-diving-sites',
          name: 'Diving & Snorkeling Sites',
          nameAr: 'مواقع الغوص والسنوركلاينج',
          category: 'diving',
          color: '#06b6d4',
          isVisible: true,
          isLocked: false,
          opacity: 1.0,
          order: 996
        });
      }

      // Sort by order ascending (highest order goes on top in Leaflet, or we just render them in order)
      allLayers.sort((a, b) => a.order - b.order);

      set({ layers: allLayers });

      if (featuresRes.success) {
        allFeatures = (featuresRes.data || []).map(f => ({
          ...f,
          coordinates: JSON.parse(f.coordinates as string),
          properties: JSON.parse(f.properties as string)
        }));
      }

      if (externalRes.success && externalRes.data) {
        const extReserves = externalRes.data.reserveFeatures.map((f: any) => ({
          ...f,
          properties: JSON.parse(f.properties)
        }));
        const extViolations = externalRes.data.violationFeatures.map((f: any) => ({
          ...f,
          properties: JSON.parse(f.properties)
        }));
        const extInspections = (externalRes.data.inspectionFeatures || []).map((f: any) => ({
          ...f,
          properties: JSON.parse(f.properties)
        }));
        const extEiaViolations = (externalRes.data.eiaViolationFeatures || []).map((f: any) => ({
          ...f,
          properties: JSON.parse(f.properties)
        }));
        const extAccidents = (externalRes.data.accidentFeatures || []).map((f: any) => ({
          ...f,
          properties: JSON.parse(f.properties)
        }));
        const extEcoReports = (externalRes.data.ecoReportFeatures || []).map((f: any) => ({
          ...f,
          properties: JSON.parse(f.properties)
        }));
        const extStrandings = (externalRes.data.strandingFeatures || []).map((f: any) => ({
          ...f,
          properties: JSON.parse(f.properties)
        }));
        const extSightings = (externalRes.data.sightingFeatures || []).map((f: any) => ({
          ...f,
          properties: JSON.parse(f.properties)
        }));
        const extBeachSurveys = (externalRes.data.beachSurveyFeatures || []).map((f: any) => ({
          ...f,
          properties: JSON.parse(f.properties)
        }));
        
        allFeatures = [
          ...allFeatures, 
          ...extReserves, 
          ...extViolations,
          ...extInspections,
          ...extEiaViolations,
          ...extAccidents,
          ...extEcoReports,
          ...extStrandings,
          ...extSightings,
          ...extBeachSurveys
        ];
      }
      
      set({ features: allFeatures });
    } catch (e) {
      console.error("Failed to fetch GIS data", e);
    } finally {
      set({ isLoading: false });
    }
  },
  
  toggleLayerVisibility: (id) => set((state) => ({
    layers: state.layers.map(layer => 
      layer.id === id ? { ...layer, isVisible: !layer.isVisible } : layer
    )
  })),
  
  
  selectedFeatureId: null,
  setSelectedFeatureId: (id) => set({ selectedFeatureId: id }),

  searchedFeatureId: null,
  setSearchedFeatureId: (id) => set({ searchedFeatureId: id }),

  timelineFilterDate: null,
  setTimelineFilterDate: (dateMs) => set({ timelineFilterDate: dateMs }),

  addOrUpdateFeature: async (layerId, featureId, type, coordinates, properties) => {
    const res = await saveGisFeature(layerId, featureId, type, JSON.stringify(coordinates), JSON.stringify(properties));
    if (res.success && res.data) {
       const newFeature = {
         ...res.data,
         coordinates: JSON.parse(res.data.coordinates),
         properties: JSON.parse(res.data.properties)
       };
       set(state => {
         const exists = state.features.find(f => f.id === newFeature.id);
         if (exists) {
           return { features: state.features.map(f => f.id === newFeature.id ? newFeature as any : f) };
         } else {
           return { features: [...state.features, newFeature as any] };
         }
       });
    }
  },

  removeFeature: async (id) => {
    const res = await deleteGisFeature(id);
    if (res.success) {
      set(state => ({ features: state.features.filter(f => f.id !== id) }));
    }
  },

  addLayer: async (data) => {
    const res = await createGisLayer(data);
    if (res.success && res.data) {
      set(state => ({ layers: [...state.layers, res.data as any] }));
      return { success: true };
    }
    return { success: false, error: res.error };
  },

  removeLayer: async (id) => {
    const res = await deleteGisLayer(id);
    if (res.success) {
      set(state => ({
        layers: state.layers.filter(l => l.id !== id),
        features: state.features.filter(f => f.layerId !== id)
      }));
    }
    return res as any;
  },

  setLayerOpacity: async (id, opacity) => {
    // update local optimistically
    set(state => ({
      layers: state.layers.map(l => l.id === id ? { ...l, opacity } : l)
    }));
    await updateLayerOpacity(id, opacity);
  },

  moveLayerUp: async (id) => {
    const state = get();
    const idx = state.layers.findIndex(l => l.id === id);
    if (idx < state.layers.length - 1) {
      const layers = [...state.layers];
      // swap orders
      const tempOrder = layers[idx].order;
      layers[idx].order = layers[idx+1].order;
      layers[idx+1].order = tempOrder;
      
      // swap array positions
      const temp = layers[idx];
      layers[idx] = layers[idx+1];
      layers[idx+1] = temp;
      
      set({ layers });
      await updateLayerOrder(layers[idx].id, layers[idx].order);
      await updateLayerOrder(layers[idx+1].id, layers[idx+1].order);
    }
  },

  moveLayerDown: async (id) => {
    const state = get();
    const idx = state.layers.findIndex(l => l.id === id);
    if (idx > 0) {
      const layers = [...state.layers];
      // swap orders
      const tempOrder = layers[idx].order;
      layers[idx].order = layers[idx-1].order;
      layers[idx-1].order = tempOrder;
      
      // swap array positions
      const temp = layers[idx];
      layers[idx] = layers[idx-1];
      layers[idx-1] = temp;
      
      set({ layers });
      await updateLayerOrder(layers[idx].id, layers[idx].order);
      await updateLayerOrder(layers[idx-1].id, layers[idx-1].order);
    }
  },

  updateLayer: async (id, data) => {
    const res = await updateGisLayer(id, data);
    if (res.success && res.data) {
      set(state => ({
        layers: state.layers.map(l => l.id === id ? ({ ...l, ...res.data } as GISLayer) : l)
      }));
      return { success: true };
    }
    return { success: false, error: res.error };
  },

  bulkDeleteFeatures: async (ids) => {
    const res = await bulkDeleteGisFeatures(ids);
    if (res.success) {
      set(state => ({
        features: state.features.filter(f => !ids.includes(f.id))
      }));
      return { success: true };
    }
    return { success: false, error: res.error };
  },

  bulkMoveFeatures: async (ids, targetLayerId) => {
    const res = await bulkMoveGisFeatures(ids, targetLayerId);
    if (res.success) {
      set(state => ({
        features: state.features.map(f => ids.includes(f.id) ? { ...f, layerId: targetLayerId } : f)
      }));
      return { success: true };
    }
    return { success: false, error: res.error };
  }
}));
