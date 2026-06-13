import { GISLayer, GISFeature } from '../types/gis.types';

export const mockLayers: GISLayer[] = [
  { id: 'l1', name: 'Reserves Boundaries', nameAr: 'حدود المحميات', type: 'feature', category: 'reserve', isVisible: true, opacity: 0.8, isLocked: true, color: '#10b981', order: 1 },
  { id: 'l2', name: 'Current Projects', nameAr: 'المشروعات الحالية', type: 'feature', category: 'project', isVisible: true, opacity: 1, isLocked: false, color: '#3b82f6', order: 2 },
  { id: 'l3', name: 'Field Assets', nameAr: 'الأصول الميدانية', type: 'feature', category: 'asset', isVisible: false, opacity: 1, isLocked: false, color: '#f59e0b', order: 3 },
  { id: 'l4', name: 'Incidents & Reports', nameAr: 'البلاغات والتقارير', type: 'feature', category: 'incident', isVisible: true, opacity: 1, isLocked: false, color: '#ef4444', order: 4 },
];

export const mockFeatures: GISFeature[] = [
  {
    id: 'f1',
    layerId: 'l1',
    type: 'Polygon',
    // rough polygon somewhere near red sea
    coordinates: [[[35.0, 25.0], [35.5, 25.0], [35.5, 24.5], [35.0, 24.5]]],
    properties: {
      name: 'Wadi Gemal Reserve',
      nameAr: 'محمية وادي الجمال',
      description: 'A large national park located on the Red Sea coast.',
      descriptionAr: 'حديقة وطنية كبيرة تقع على ساحل البحر الأحمر.',
      status: 'active',
      images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80'],
    }
  },
  {
    id: 'f2',
    layerId: 'l2',
    type: 'Point',
    coordinates: [34.88, 25.10],
    properties: {
      name: 'Visitor Center Construction',
      nameAr: 'إنشاء مركز الزوار',
      progress: 65,
      status: 'active',
    }
  },
  {
    id: 'f3',
    layerId: 'l4',
    type: 'Point',
    coordinates: [35.2, 24.8],
    properties: {
      name: 'Coral Reef Damage Report',
      nameAr: 'بلاغ أضرار شعاب مرجانية',
      status: 'critical',
      descriptionAr: 'تم رصد أضرار بسبب قوارب سياحية',
    }
  }
];
