export type MapLayerType = 'base' | 'feature' | 'heatmap';
export type FeatureCategory = 'project' | 'asset' | 'reserve' | 'poi' | 'incident' | 'boundary';

export interface GISLayer {
  id: string;
  name: string;
  nameAr: string;
  type: MapLayerType;
  category: FeatureCategory;
  isVisible: boolean;
  opacity: number;
  isLocked: boolean;
  color?: string;
  order: number;
}

export interface GISFeature {
  id: string;
  layerId: string;
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: any[] | any;
  properties: {
    name: string;
    nameAr: string;
    description?: string;
    descriptionAr?: string;
    status?: 'active' | 'pending' | 'completed' | 'critical';
    progress?: number;
    images?: string[];
    readings?: {
      date: string;
      type: string;
      value: number;
      unit: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    [key: string]: any;
  }
}
