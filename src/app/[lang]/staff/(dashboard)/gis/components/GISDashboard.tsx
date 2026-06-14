'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Map, Layers, FileText, AlertTriangle, Box, Activity, Plus, Edit3, 
  Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Search, X, Sliders, ExternalLink, RefreshCw, Save, CheckSquare, Square
} from 'lucide-react';
import { useGISStore } from '../store/gisStore';
import FeatureFormModal from './FeatureFormModal';

export default function GISDashboard({ isArabic }: { isArabic: boolean }) {
  const { 
    layers, 
    features, 
    addOrUpdateFeature, 
    removeFeature, 
    addLayer, 
    removeLayer, 
    updateLayer,
    toggleLayerVisibility, 
    setLayerOpacity, 
    moveLayerUp, 
    moveLayerDown,
    setActiveTab,
    setSelectedFeatureId,
    setSearchedFeatureId,
    fetchData,
    isLoading
  } = useGISStore();

  // State for editing feature
  const [editingFeature, setEditingFeature] = useState<any>(null);
  
  // State for creating new layer
  const [isAddingLayer, setIsAddingLayer] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [newLayer, setNewLayer] = useState({ name: '', nameAr: '', category: 'project', color: '#10b981' });
  const [layerError, setLayerError] = useState('');

  // Search, sorting, and filter state for features list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayerFilter, setSelectedLayerFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Checkboxes / Bulk selection
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [bulkTargetLayerId, setBulkTargetLayerId] = useState('');

  // Feature Creation Dialog
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    layerId: '',
    type: 'Point',
    status: 'active',
    progress: 0,
    lat: '',
    lng: '',
    rawCoords: ''
  });

  // Prefill layerId when feature creation modal opens
  useEffect(() => {
    if (isCreatingFeature && layers.length > 0) {
      const unlockedLayers = layers.filter(l => !l.isLocked);
      setNewFeature(prev => ({
        ...prev,
        layerId: unlockedLayers.length > 0 ? unlockedLayers[0].id : layers[0].id
      }));
    }
  }, [isCreatingFeature, layers]);

  const assetLayers = layers.filter(l => l.category === 'asset').map(l => l.id);
  const projectLayers = layers.filter(l => l.category === 'project').map(l => l.id);
  const incidentLayers = layers.filter(l => l.category === 'reserve').map(l => l.id);

  // Statistics
  const stats = [
    { label: isArabic ? 'إجمالي الطبقات' : 'Total Layers', value: layers.length, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: isArabic ? 'إجمالي الأصول الجغرافية' : 'Total Assets', value: features.filter(f => assetLayers.includes(f.layerId)).length, icon: Box, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: isArabic ? 'موقع المشاريع البيئية' : 'Projects & Sites', value: features.filter(f => projectLayers.includes(f.layerId)).length, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: isArabic ? 'البلاغات والمحميات' : 'Incidents & Reserves', value: features.filter(f => incidentLayers.includes(f.layerId)).length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  // Handler for adding/updating layer
  const handleLayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLayer.name || !newLayer.nameAr) {
      setLayerError(isArabic ? 'يرجى إدخال اسم الطبقة باللغتين' : 'Please enter layer name in both languages');
      return;
    }

    if (editingLayerId) {
      const res = await updateLayer(editingLayerId, newLayer);
      if (res.success) {
        setIsAddingLayer(false);
        setEditingLayerId(null);
        setNewLayer({ name: '', nameAr: '', category: 'project', color: '#10b981' });
        setLayerError('');
        fetchData();
      } else {
        setLayerError(res.error || (isArabic ? 'فشل تعديل الطبقة' : 'Failed to update layer'));
      }
    } else {
      const res = await addLayer(newLayer);
      if (res.success) {
        setIsAddingLayer(false);
        setNewLayer({ name: '', nameAr: '', category: 'project', color: '#10b981' });
        setLayerError('');
        fetchData();
      } else {
        setLayerError(res.error || (isArabic ? 'فشل إضافة الطبقة' : 'Failed to add layer'));
      }
    }
  };

  // Handler for deleting layer
  const handleDeleteLayer = async (id: string) => {
    const confirmMsg = isArabic 
      ? 'هل أنت متأكد من حذف هذه الطبقة؟ سيؤدي ذلك لحذف جميع المعالم التابعة لها تلقائياً!' 
      : 'Are you sure you want to delete this layer? This will automatically delete all its associated features!';
    if (window.confirm(confirmMsg)) {
      const res = await removeLayer(id);
      if (res.success) {
        fetchData();
      } else {
        alert(isArabic ? res.error || 'فشل حذف الطبقة' : res.error || 'Failed to delete layer');
      }
    }
  };

  // Handler for deleting feature
  const handleDeleteFeature = async (id: string) => {
    const confirmMsg = isArabic 
      ? 'هل أنت متأكد من حذف هذا المعلم الجغرافي؟' 
      : 'Are you sure you want to delete this geospatial feature?';
    if (window.confirm(confirmMsg)) {
      await removeFeature(id);
    }
  };

  // Handler to locate feature on the map
  const handleLocateOnMap = (feature: any) => {
    setSelectedFeatureId(feature.id);
    setSearchedFeatureId(feature.id);
    setActiveTab('map');
  };

  // Sort function helper
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered and Sorted features list
  const filteredFeatures = useMemo(() => {
    let result = features.filter(f => {
      const name = f.properties.name?.toLowerCase() || '';
      const nameAr = f.properties.nameAr?.toLowerCase() || '';
      const desc = f.properties.description?.toLowerCase() || '';
      const descAr = f.properties.descriptionAr?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = name.includes(query) || nameAr.includes(query) || desc.includes(query) || descAr.includes(query);
      const matchesLayer = selectedLayerFilter === 'all' || f.layerId === selectedLayerFilter;
      const matchesType = typeFilter === 'all' || f.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || f.properties.status === statusFilter;
      
      return matchesSearch && matchesLayer && matchesType && matchesStatus;
    });

    result.sort((a, b) => {
      let aVal: any = '';
      let bVal: any = '';

      if (sortField === 'name') {
        aVal = isArabic ? a.properties.nameAr || '' : a.properties.name || '';
        bVal = isArabic ? b.properties.nameAr || '' : b.properties.name || '';
      } else if (sortField === 'layer') {
        const layerA = layers.find(l => l.id === a.layerId);
        const layerB = layers.find(l => l.id === b.layerId);
        aVal = layerA ? (isArabic ? layerA.nameAr : layerA.name) : '';
        bVal = layerB ? (isArabic ? layerB.nameAr : layerB.name) : '';
      } else if (sortField === 'type') {
        aVal = a.type || '';
        bVal = b.type || '';
      } else if (sortField === 'status') {
        aVal = a.properties.status || '';
        bVal = b.properties.status || '';
      } else if (sortField === 'progress') {
        aVal = a.properties.progress ?? 0;
        bVal = b.properties.progress ?? 0;
      } else if (sortField === 'updatedAt') {
        aVal = new Date(a.updatedAt || a.createdAt || 0).getTime();
        bVal = new Date(b.updatedAt || b.createdAt || 0).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [features, searchQuery, selectedLayerFilter, typeFilter, statusFilter, sortField, sortDirection, layers, isArabic]);

  const recentFeatures = useMemo(() => {
    return [...features].reverse().slice(0, 5);
  }, [features]);

  // Bulk select togglers
  const toggleSelectAll = () => {
    if (selectedFeatureIds.length === filteredFeatures.length) {
      setSelectedFeatureIds([]);
    } else {
      setSelectedFeatureIds(filteredFeatures.map(f => f.id));
    }
  };

  const toggleSelectFeature = (id: string) => {
    setSelectedFeatureIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    const confirmMsg = isArabic 
      ? `هل أنت متأكد من حذف ${selectedFeatureIds.length} معلم جيوغرافي محدد؟`
      : `Are you sure you want to delete the ${selectedFeatureIds.length} selected features?`;
    if (window.confirm(confirmMsg)) {
      const { bulkDeleteFeatures } = useGISStore.getState();
      await bulkDeleteFeatures(selectedFeatureIds);
      setSelectedFeatureIds([]);
      fetchData();
    }
  };

  const handleBulkMove = async () => {
    if (!bulkTargetLayerId) return;
    const { bulkMoveFeatures } = useGISStore.getState();
    await bulkMoveFeatures(selectedFeatureIds, bulkTargetLayerId);
    setSelectedFeatureIds([]);
    setBulkTargetLayerId('');
    fetchData();
  };

  const handleExportFeatures = (format: 'csv' | 'geojson') => {
    const selectedFeatures = features.filter(f => selectedFeatureIds.includes(f.id));
    if (selectedFeatures.length === 0) return;
    
    let fileContent = '';
    let fileName = `gis_features_export_${new Date().toISOString().split('T')[0]}`;
    let mimeType = 'text/plain';

    if (format === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        features: selectedFeatures.map(f => ({
          type: 'Feature',
          geometry: {
            type: f.type,
            coordinates: f.coordinates
          },
          properties: f.properties
        }))
      };
      fileContent = JSON.stringify(geojson, null, 2);
      fileName += '.geojson';
      mimeType = 'application/geo+json';
    } else {
      // CSV
      const headers = ['ID', 'Name (En)', 'Name (Ar)', 'Layer ID', 'Type', 'Status', 'Progress', 'Description (En)', 'Description (Ar)', 'Coordinates'];
      const rows = selectedFeatures.map(f => [
        f.id,
        f.properties.name || '',
        f.properties.nameAr || '',
        f.layerId,
        f.type,
        f.properties.status || '',
        f.properties.progress || '0',
        f.properties.description || '',
        f.properties.descriptionAr || '',
        JSON.stringify(f.coordinates)
      ]);
      
      fileContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
      fileName += '.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Feature Creation Submit
  const handleCreateFeatureSubmit = async () => {
    if (!newFeature.name || !newFeature.nameAr) {
      alert(isArabic ? 'يرجى إدخال اسم المعلم باللغتين' : 'Please enter feature name in both languages');
      return;
    }
    
    let coords: any = [];
    if (newFeature.type === 'Point') {
      const latitude = parseFloat(newFeature.lat);
      const longitude = parseFloat(newFeature.lng);
      if (isNaN(latitude) || isNaN(longitude)) {
        alert(isArabic ? 'يرجى إدخال إحداثيات صحيحة' : 'Please enter valid coordinate numbers');
        return;
      }
      coords = [latitude, longitude];
    } else {
      try {
        coords = JSON.parse(newFeature.rawCoords || '[]');
      } catch (e) {
        alert(isArabic ? 'صيغة الإحداثيات غير صحيحة' : 'Invalid coordinates JSON formatting');
        return;
      }
    }

    const properties = {
      name: newFeature.name,
      nameAr: newFeature.nameAr,
      description: newFeature.description,
      descriptionAr: newFeature.descriptionAr,
      status: newFeature.status,
      progress: newFeature.progress,
      images: [],
      readings: []
    };

    await addOrUpdateFeature(newFeature.layerId, null, newFeature.type, coords, properties);
    setIsCreatingFeature(false);
    // Reset form
    setNewFeature({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      layerId: layers[0]?.id || '',
      type: 'Point',
      status: 'active',
      progress: 0,
      lat: '',
      lng: '',
      rawCoords: ''
    });
    fetchData();
  };

  const handleTriggerMapDrawing = () => {
    if (!newFeature.name || !newFeature.nameAr) {
      alert(isArabic ? 'يرجى إدخال اسم المعلم باللغتين أولاً للرسم' : 'Please enter feature name in both languages first');
      return;
    }

    // Save state in store draft
    const draftProps = {
      name: newFeature.name,
      nameAr: newFeature.nameAr,
      description: newFeature.description,
      descriptionAr: newFeature.descriptionAr,
      status: newFeature.status,
      progress: newFeature.progress,
      geometryType: newFeature.type,
      images: [],
      readings: []
    };

    const { setDashboardDraftFeature } = useGISStore.getState();
    setDashboardDraftFeature({
      layerId: newFeature.layerId,
      properties: draftProps,
      step: 'drawing'
    });

    setIsCreatingFeature(false);
    setActiveTab('map');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Top stats bar ── */}
      <div className="flex justify-between items-center bg-th-surface border border-th-border p-4 rounded-2xl shadow-sm">
        <h2 className="font-extrabold text-th-text flex items-center gap-2 text-lg">
          <Activity size={20} className="text-teal-500" />
          {isArabic ? 'لوحة ملخص وتحليلات GIS' : 'GIS Dashboard Summary'}
        </h2>
        <button 
          onClick={fetchData} 
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-500 hover:text-white transition-all text-xs font-bold border border-teal-500/20 disabled:opacity-55"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isArabic ? 'تحديث البيانات' : 'Sync Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 flex items-center gap-4 bg-th-surface border-th-border hover:border-th-border-hover transition-colors shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-th-muted mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-th-text tracking-tight">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>
      
      {/* ── Layers and Features Management ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Features list management (Left / 2 columns) */}
        <Card className="p-6 lg:col-span-2 bg-th-surface border-th-border shadow-sm flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-th-border">
            <div>
              <h3 className="text-lg font-black text-th-text flex items-center gap-2">
                <Map size={18} className="text-teal-500" />
                {isArabic ? 'إدارة المعالم الجغرافية' : 'Geospatial Features Manager'}
              </h3>
              <p className="text-xs text-th-muted mt-1">{isArabic ? 'استعراض، تعديل، حذف، وتحديد المعالم على الخريطة' : 'View, edit, delete, and locate features on the map'}</p>
            </div>
            <button 
              onClick={() => setIsCreatingFeature(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all text-xs font-bold shadow-md shadow-teal-500/10"
            >
              <Plus size={15} />
              {isArabic ? 'إضافة معلم جغرافي' : 'Add Feature'}
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative flex-1 sm:col-span-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'البحث عن معالم جغرافية...' : 'Search geospatial features...'}
                className="w-full bg-th-surface border border-th-border rounded-lg pl-9 pr-9 py-2 text-xs text-th-text focus:outline-none focus:border-teal-500 transition-colors"
                dir={isArabic ? 'rtl' : 'ltr'}
              />
              <Search className={`absolute top-1/2 -translate-y-1/2 text-th-muted ${isArabic ? 'right-3' : 'left-3'}`} size={16} />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={`absolute top-1/2 -translate-y-1/2 text-th-muted hover:text-th-text ${isArabic ? 'left-3' : 'right-3'}`}>
                  <X size={14} />
                </button>
              )}
            </div>
            
            <div>
              <select 
                value={selectedLayerFilter}
                onChange={(e) => setSelectedLayerFilter(e.target.value)}
                className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-xs text-th-text focus:outline-none focus:border-teal-500"
              >
                <option value="all">{isArabic ? 'كل الطبقات' : 'All Layers'}</option>
                {layers.map(l => (
                  <option key={l.id} value={l.id}>{isArabic ? l.nameAr : l.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 bg-th-surface border border-th-border rounded-lg px-2 py-2 text-xs text-th-text focus:outline-none focus:border-teal-500"
              >
                <option value="all">{isArabic ? 'كل الأشكال' : 'All Shapes'}</option>
                <option value="Point">{isArabic ? 'نقطة (Point)' : 'Point'}</option>
                <option value="Polygon">{isArabic ? 'مضلع (Polygon)' : 'Polygon'}</option>
                <option value="LineString">{isArabic ? 'مسار (Line)' : 'LineString'}</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 bg-th-surface border border-th-border rounded-lg px-2 py-2 text-xs text-th-text focus:outline-none focus:border-teal-500"
              >
                <option value="all">{isArabic ? 'كل الحالات' : 'All Status'}</option>
                <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
                <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
                <option value="completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
                <option value="critical">{isArabic ? 'حرج' : 'Critical'}</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Panel */}
          {selectedFeatureIds.length > 0 && (
            <div className="bg-teal-500/10 border border-teal-500/35 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-250">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  {isArabic 
                    ? `تم تحديد ${selectedFeatureIds.length} معلم(معالم) جغرافية`
                    : `${selectedFeatureIds.length} feature(s) selected`
                  }
                </span>
                <button 
                  onClick={() => setSelectedFeatureIds([])}
                  className="text-[10px] text-th-muted hover:text-red-500 underline"
                >
                  {isArabic ? 'إلغاء التحديد' : 'Clear selection'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Bulk Move Layer */}
                <div className="flex items-center gap-1.5 bg-th-surface border border-th-border rounded-lg px-2 py-1">
                  <span className="text-[10px] text-th-muted whitespace-nowrap">{isArabic ? 'نقل إلى:' : 'Move to:'}</span>
                  <select 
                    value={bulkTargetLayerId}
                    onChange={(e) => setBulkTargetLayerId(e.target.value)}
                    className="bg-transparent border-none text-[11px] text-th-text focus:outline-none"
                  >
                    <option value="">{isArabic ? 'اختر الطبقة...' : 'Select layer...'}</option>
                    {layers.filter(l => !l.isLocked).map(l => (
                      <option key={l.id} value={l.id}>{isArabic ? l.nameAr : l.name}</option>
                    ))}
                  </select>
                  {bulkTargetLayerId && (
                    <button 
                      onClick={handleBulkMove}
                      className="px-2 py-0.5 bg-teal-500 text-white rounded text-[10px] font-bold hover:bg-teal-600"
                    >
                      {isArabic ? 'تطبيق' : 'Apply'}
                    </button>
                  )}
                </div>

                {/* Bulk Export */}
                <button 
                  onClick={() => handleExportFeatures('csv')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-500 hover:text-white transition-all text-[11px] font-bold border border-teal-500/20"
                >
                  <FileText size={12} />
                  {isArabic ? 'تصدير CSV' : 'Export CSV'}
                </button>
                <button 
                  onClick={() => handleExportFeatures('geojson')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-500 hover:text-white transition-all text-[11px] font-bold border border-teal-500/20"
                >
                  <Map size={12} />
                  {isArabic ? 'تصدير GeoJSON' : 'Export GeoJSON'}
                </button>

                {/* Bulk Delete */}
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 px-2.5 py-1 bg-red-500/15 text-red-650 dark:text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all text-[11px] font-bold border border-red-500/25"
                >
                  <Trash2 size={12} />
                  {isArabic ? 'حذف جماعي' : 'Bulk Delete'}
                </button>
              </div>
            </div>
          )}

          {/* Features Table */}
          <div className="overflow-x-auto border border-th-border rounded-xl">
            <table className="w-full text-start border-collapse text-xs" dir={isArabic ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="bg-th-surface2 text-th-muted border-b border-th-border font-bold">
                  <th className="p-3 text-center w-10">
                    <button 
                      onClick={toggleSelectAll}
                      className="p-1 rounded hover:bg-th-surface transition-colors inline-block"
                      title={isArabic ? 'تحديد الكل' : 'Select All'}
                    >
                      {selectedFeatureIds.length === filteredFeatures.length && filteredFeatures.length > 0 ? (
                        <CheckSquare size={15} className="text-teal-500" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                  <th className="p-3 text-start cursor-pointer hover:bg-th-surface/50" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      {isArabic ? 'المعلم' : 'Feature'}
                      {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="p-3 text-start cursor-pointer hover:bg-th-surface/50" onClick={() => handleSort('layer')}>
                    <div className="flex items-center gap-1">
                      {isArabic ? 'الطبقة' : 'Layer'}
                      {sortField === 'layer' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="p-3 text-start cursor-pointer hover:bg-th-surface/50" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-1">
                      {isArabic ? 'النوع' : 'Type'}
                      {sortField === 'type' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="p-3 text-start cursor-pointer hover:bg-th-surface/50" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      {isArabic ? 'الحالة' : 'Status'}
                      {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="p-3 text-start cursor-pointer hover:bg-th-surface/50" onClick={() => handleSort('progress')}>
                    <div className="flex items-center gap-1">
                      {isArabic ? 'الإنجاز' : 'Progress'}
                      {sortField === 'progress' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="p-3 text-center">{isArabic ? 'الخيارات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-th-border">
                {filteredFeatures.map(feature => {
                  const layer = layers.find(l => l.id === feature.layerId);
                  const isLocked = layer?.isLocked;
                  const isSelected = selectedFeatureIds.includes(feature.id);
                  return (
                    <tr key={feature.id} className={`hover:bg-th-surface2/50 transition-colors ${isSelected ? 'bg-teal-500/5' : ''}`}>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => toggleSelectFeature(feature.id)}
                          className="p-1 rounded text-th-muted hover:bg-th-surface transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare size={15} className="text-teal-500" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-th-text">{isArabic ? feature.properties.nameAr || 'بدون اسم' : feature.properties.name || 'Unnamed'}</div>
                        <div className="text-[10px] text-th-muted mt-0.5 line-clamp-1 max-w-[150px]">{isArabic ? feature.properties.descriptionAr : feature.properties.description}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: layer?.color || '#cbd5e1' }} />
                          <span className="font-medium">{layer ? (isArabic ? layer.nameAr : layer.name) : ''}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono bg-th-surface border border-th-border px-1.5 py-0.5 rounded text-[10px]">
                          {feature.type}
                        </span>
                      </td>
                      <td className="p-3">
                        {!isLocked ? (
                          <select 
                            value={feature.properties.status || 'active'}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              const updatedProps = {
                                ...feature.properties,
                                status: newStatus
                              };
                              await addOrUpdateFeature(feature.layerId, feature.id, feature.type, feature.coordinates, updatedProps);
                              fetchData();
                            }}
                            className="bg-th-surface border border-th-border rounded px-1.5 py-0.5 text-[10px] text-th-text font-bold focus:outline-none focus:border-teal-500"
                          >
                            <option value="active">{isArabic ? 'نشط / Active' : 'Active'}</option>
                            <option value="pending">{isArabic ? 'انتظار / Pending' : 'Pending'}</option>
                            <option value="completed">{isArabic ? 'مكتمل / Completed' : 'Completed'}</option>
                            <option value="critical">{isArabic ? 'حرج / Critical' : 'Critical'}</option>
                          </select>
                        ) : (
                          feature.properties.status && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold capitalize ${
                              feature.properties.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                              feature.properties.status === 'critical' ? 'bg-red-500/10 text-red-650 dark:text-red-400' :
                              'bg-th-muted/10 text-th-muted'
                            }`}>
                              {feature.properties.status}
                            </span>
                          )
                        )}
                      </td>
                      <td className="p-3">
                        {!isLocked ? (
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number" 
                              min="0" max="100"
                              value={feature.properties.progress ?? 0}
                              onChange={async (e) => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val)) val = 0;
                                if (val < 0) val = 0;
                                if (val > 100) val = 100;
                                
                                const updatedProps = {
                                  ...feature.properties,
                                  progress: val
                                };
                                await addOrUpdateFeature(feature.layerId, feature.id, feature.type, feature.coordinates, updatedProps);
                              }}
                              className="w-12 bg-th-surface border border-th-border rounded px-1 py-0.5 text-[10px] text-center font-bold text-th-text focus:outline-none focus:border-teal-500"
                            />
                            <span className="text-[10px] text-th-muted">%</span>
                          </div>
                        ) : (
                          feature.properties.progress !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-th-surface2 rounded-full h-2 overflow-hidden border border-th-border shrink-0">
                                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${feature.properties.progress}%` }} />
                              </div>
                              <span className="font-bold text-[10px] text-teal-500">{feature.properties.progress}%</span>
                            </div>
                          ) : '-'
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => handleLocateOnMap(feature)}
                            className="p-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-500 hover:text-white transition-all"
                            title={isArabic ? 'تحديد وعرض على الخريطة' : 'Locate on Map'}
                          >
                            <ExternalLink size={13} />
                          </button>
                          
                          {/* Only allow editing and deleting on custom, unlocked layers */}
                          {!isLocked ? (
                            <>
                              <button 
                                onClick={() => setEditingFeature(feature)}
                                className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                                title={isArabic ? 'تعديل المعلم' : 'Edit Feature'}
                              >
                                <Edit3 size={13} />
                              </button>
                              <button 
                                onClick={() => handleDeleteFeature(feature.id)}
                                className="p-1.5 bg-red-500/10 text-red-650 dark:text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                title={isArabic ? 'حذف المعلم' : 'Delete Feature'}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-th-muted select-none italic">{isArabic ? 'نظام مغلق' : 'system'}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredFeatures.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-th-muted">
                      {isArabic ? 'لا توجد معالم جغرافية تطابق البحث' : 'No geospatial features match search criteria'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        
        {/* Layers Summary card (Right / 1 column) */}
        <div className="flex flex-col gap-6">
          
          {/* Interactive Layers Manager Card */}
          <Card className="p-6 bg-th-surface border-th-border shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-th-border pb-3">
              <div>
                <h3 className="text-lg font-black text-th-text flex items-center gap-2">
                  <Layers size={18} className="text-teal-500" />
                  {isArabic ? 'طبقات البيانات' : 'Map Layers Manager'}
                </h3>
                <p className="text-xs text-th-muted mt-0.5">{isArabic ? 'إدارة تصنيفات الطبقات وعرضها' : 'Manage map categories and visibility'}</p>
              </div>
              
              <button 
                onClick={() => {
                  if (isAddingLayer) {
                    setIsAddingLayer(false);
                    setEditingLayerId(null);
                    setNewLayer({ name: '', nameAr: '', category: 'project', color: '#10b981' });
                  } else {
                    setIsAddingLayer(true);
                  }
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  isAddingLayer 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}
                title={isAddingLayer ? (isArabic ? 'إلغاء' : 'Cancel') : (isArabic ? 'إضافة طبقة جديدة' : 'Add New Layer')}
              >
                {isAddingLayer ? <X size={15} /> : <Plus size={15} />}
              </button>
            </div>

            {/* Inline Add/Edit Layer Form */}
            {isAddingLayer && (
              <form onSubmit={handleLayerSubmit} className="p-3 border border-teal-500/20 bg-teal-500/5 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-350">
                <h4 className="text-xs font-bold text-teal-605 dark:text-teal-400">
                  {editingLayerId 
                    ? (isArabic ? 'تعديل بيانات الطبقة' : 'Edit Layer Details')
                    : (isArabic ? 'إنشاء طبقة جغرافية مخصصة' : 'Create Custom Map Layer')
                  }
                </h4>
                
                {layerError && <p className="text-[10px] text-red-500 font-bold">{layerError}</p>}
                
                <div>
                  <label className="text-[10px] text-th-muted block mb-0.5">{isArabic ? 'اسم الطبقة (عربي)' : 'Layer Name (Ar)'}</label>
                  <input 
                    type="text" 
                    value={newLayer.nameAr} 
                    onChange={e => setNewLayer({...newLayer, nameAr: e.target.value})} 
                    className="w-full bg-th-surface border border-th-border rounded-lg px-2.5 py-1.5 text-xs text-th-text focus:outline-none focus:border-teal-500"
                    placeholder="مثال: الشعاب المرجانية"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-th-muted block mb-0.5">{isArabic ? 'اسم الطبقة (إنجليزي)' : 'Layer Name (En)'}</label>
                  <input 
                    type="text" 
                    value={newLayer.name} 
                    onChange={e => setNewLayer({...newLayer, name: e.target.value})} 
                    className="w-full bg-th-surface border border-th-border rounded-lg px-2.5 py-1.5 text-xs text-th-text focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Coral Reefs Protection"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-th-muted block mb-0.5">{isArabic ? 'التصنيف' : 'Category'}</label>
                    <select 
                      value={newLayer.category} 
                      onChange={e => setNewLayer({...newLayer, category: e.target.value})} 
                      className="w-full bg-th-surface border border-th-border rounded-lg px-2 py-1.5 text-xs text-th-text focus:outline-none focus:border-teal-500"
                    >
                      <option value="project">{isArabic ? 'مشروع' : 'Project'}</option>
                      <option value="asset">{isArabic ? 'أصل/مرفق' : 'Asset/Facility'}</option>
                      <option value="reserve">{isArabic ? 'بلاغ/محمية' : 'Incident/Zone'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-th-muted block mb-0.5">{isArabic ? 'اللون المميز' : 'Theme Color'}</label>
                    <input 
                      type="color" 
                      value={newLayer.color} 
                      onChange={e => setNewLayer({...newLayer, color: e.target.value})} 
                      className="w-full h-8 cursor-pointer bg-th-surface border border-th-border rounded-lg p-0.5"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600 transition-colors"
                >
                  {editingLayerId ? (isArabic ? 'حفظ التغييرات' : 'Save Changes') : (isArabic ? 'حفظ وإنشاء الطبقة' : 'Save & Build Layer')}
                </button>
              </form>
            )}

            {/* Layers Summary List */}
            <div className="space-y-3">
              {layers.map((layer, index) => {
                const isLocked = layer.isLocked;
                return (
                  <div key={layer.id} className="flex flex-col p-3 rounded-xl bg-th-surface2 border border-th-border hover:border-th-border-hover transition-all text-xs">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: layer.color || '#ccc' }} />
                         <div className="flex flex-col">
                           <span className="font-bold text-th-text">{isArabic ? layer.nameAr : layer.name}</span>
                           <span className="text-[9px] text-th-muted capitalize">{layer.category}</span>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-1.5">
                         <button 
                           onClick={() => toggleLayerVisibility(layer.id)}
                           className={`p-1.5 rounded-md transition-colors ${layer.isVisible ? 'text-teal-500 hover:bg-teal-500/10' : 'text-th-muted hover:bg-th-surface'}`}
                           title={isArabic ? 'إظهار/إخفاء' : 'Toggle Visibility'}
                         >
                           {layer.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                         </button>
                         
                         <div className="flex flex-col text-th-muted">
                           <button onClick={() => moveLayerDown(layer.id)} disabled={index === 0} className="hover:text-teal-500 disabled:opacity-30">
                             <ChevronUp size={11} />
                           </button>
                           <button onClick={() => moveLayerUp(layer.id)} disabled={index === layers.length - 1} className="hover:text-teal-500 disabled:opacity-30">
                             <ChevronDown size={11} />
                           </button>
                         </div>

                         {!isLocked && (
                           <>
                             <button 
                               onClick={() => {
                                 setEditingLayerId(layer.id);
                                 setNewLayer({
                                   name: layer.name,
                                   nameAr: layer.nameAr,
                                   category: layer.category,
                                   color: layer.color || '#cbd5e1'
                                 });
                                 setIsAddingLayer(true);
                               }}
                               className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors"
                               title={isArabic ? 'تعديل الطبقة' : 'Edit Layer'}
                             >
                               <Edit3 size={13} />
                             </button>
                             <button 
                               onClick={() => handleDeleteLayer(layer.id)}
                               className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                               title={isArabic ? 'حذف الطبقة' : 'Delete Layer'}
                             >
                               <Trash2 size={13} />
                             </button>
                           </>
                         )}
                       </div>
                     </div>

                     {layer.isVisible && (
                       <div className="mt-2.5 flex items-center gap-2 border-t border-th-border/40 pt-2">
                         <span className="text-[9px] text-th-muted shrink-0">{isArabic ? 'الشفافية' : 'Opacity'}</span>
                         <input 
                           type="range" 
                           min="0" max="1" step="0.1" 
                           value={layer.opacity ?? 1} 
                           onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                           className="w-full h-1 accent-teal-500 bg-th-surface border-none rounded-lg cursor-pointer appearance-none outline-none shrink-1"
                         />
                         <span className="text-[9px] font-mono text-teal-500 font-bold shrink-0">{Math.round((layer.opacity ?? 1) * 100)}%</span>
                       </div>
                     )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Activities summary */}
          <Card className="p-6 bg-th-surface border-th-border shadow-sm">
            <h3 className="text-lg font-bold text-th-text mb-4">
              {isArabic ? 'النشاطات الحديثة' : 'Recent Activities'}
            </h3>
            <div className="flex flex-col gap-3.5">
              {recentFeatures.map((feature) => (
                <div key={feature.id} className="flex items-start gap-3 p-3 rounded-xl bg-th-surface2 border border-th-border">
                   <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0 mt-0.5">
                     <Map size={16} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between gap-2">
                       <h4 className="font-bold text-th-text text-xs truncate">{isArabic ? feature.properties.nameAr || 'بدون اسم' : feature.properties.name || 'Unnamed'}</h4>
                       <button 
                         onClick={() => handleLocateOnMap(feature)}
                         className="text-teal-500 hover:text-teal-600 shrink-0"
                         title={isArabic ? 'عرض الخريطة' : 'View map'}
                       >
                         <ExternalLink size={12} />
                       </button>
                     </div>
                     <p className="text-[10px] text-th-muted mt-0.5 line-clamp-1">{isArabic ? feature.properties.descriptionAr : feature.properties.description}</p>
                   </div>
                </div>
              ))}
              {recentFeatures.length === 0 && (
                <p className="text-th-muted text-xs text-center py-4">{isArabic ? 'لا توجد نشاطات حديثة' : 'No recent activities'}</p>
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* Feature Edit Form Modal */}
      {editingFeature && (
        <FeatureFormModal 
          isArabic={isArabic}
          featureData={editingFeature}
          onClose={() => setEditingFeature(null)}
          onSave={async (properties, layerId) => {
            await addOrUpdateFeature(
              layerId,
              editingFeature.id,
              editingFeature.type,
              editingFeature.coordinates,
              properties
            );
            setEditingFeature(null);
            fetchData(); // reload dashboard
          }}
        />
      )}

      {/* Feature Creation Dialog Modal */}
      {isCreatingFeature && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-th-surface w-full max-w-xl rounded-2xl border border-th-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between p-4 border-b border-th-border bg-th-surface2 shrink-0">
              <h2 className="font-bold text-lg text-th-text">{isArabic ? 'إضافة معلم جغرافي جديد' : 'Create New Geospatial Feature'}</h2>
              <button onClick={() => setIsCreatingFeature(false)} className="p-2 rounded-lg text-th-muted hover:bg-th-surface hover:text-th-text transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الاسم (عربي)' : 'Name (Ar)'}</label>
                  <input 
                    type="text" 
                    value={newFeature.nameAr} 
                    onChange={e => setNewFeature({...newFeature, nameAr: e.target.value})} 
                    className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500" 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الاسم (إنجليزي)' : 'Name (En)'}</label>
                  <input 
                    type="text" 
                    value={newFeature.name} 
                    onChange={e => setNewFeature({...newFeature, name: e.target.value})} 
                    className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الطبقة المستهدفة' : 'Target Layer'}</label>
                <select 
                  value={newFeature.layerId} 
                  onChange={e => setNewFeature({...newFeature, layerId: e.target.value})} 
                  className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500"
                >
                  {layers.filter(l => !l.isLocked).map(l => (
                    <option key={l.id} value={l.id}>{isArabic ? l.nameAr : l.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'نوع الهندسة الجغرافية' : 'Geometry Type'}</label>
                  <select 
                    value={newFeature.type} 
                    onChange={e => setNewFeature({...newFeature, type: e.target.value})} 
                    className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500"
                  >
                    <option value="Point">{isArabic ? 'نقطة (موقع)' : 'Point (Marker)'}</option>
                    <option value="Polygon">{isArabic ? 'مضلع (منطقة)' : 'Polygon (Zone)'}</option>
                    <option value="LineString">{isArabic ? 'خط مسار' : 'LineString (Path)'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الحالة' : 'Status'}</label>
                  <select 
                    value={newFeature.status} 
                    onChange={e => setNewFeature({...newFeature, status: e.target.value})} 
                    className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500"
                  >
                    <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
                    <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
                    <option value="completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
                    <option value="critical">{isArabic ? 'حرج' : 'Critical'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الوصف' : 'Description'}</label>
                <textarea 
                  value={isArabic ? newFeature.descriptionAr : newFeature.description} 
                  onChange={e => setNewFeature(isArabic ? {...newFeature, descriptionAr: e.target.value} : {...newFeature, description: e.target.value})} 
                  rows={2} 
                  className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Coordinates input */}
              {newFeature.type === 'Point' ? (
                <div className="grid grid-cols-2 gap-4 p-3 bg-th-surface2 rounded-xl border border-th-border">
                  <div>
                    <label className="text-xs font-bold text-teal-650 dark:text-teal-400 mb-1 block">{isArabic ? 'خط العرض (Latitude)' : 'Latitude'}</label>
                    <input 
                      type="number" 
                      step="0.000001" 
                      placeholder="e.g. 25.12345" 
                      value={newFeature.lat} 
                      onChange={e => setNewFeature({...newFeature, lat: e.target.value})} 
                      className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-teal-650 dark:text-teal-400 mb-1 block">{isArabic ? 'خط الطول (Longitude)' : 'Longitude'}</label>
                    <input 
                      type="number" 
                      step="0.000001" 
                      placeholder="e.g. 36.12345" 
                      value={newFeature.lng} 
                      onChange={e => setNewFeature({...newFeature, lng: e.target.value})} 
                      className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500" 
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-th-surface2 rounded-xl border border-th-border space-y-2.5">
                  <p className="text-[11px] text-th-muted">
                    {isArabic 
                      ? 'للمضلعات والمسارات، يفضل رسمها مباشرة على الخريطة لضمان الدقة المكانية، أو يمكنك كتابة مصفوفة الإحداثيات أدناه.' 
                      : 'For polygons and paths, drawing on the map is highly recommended. Alternatively, you can paste the coordinates JSON array below.'
                    }
                  </p>
                  <div>
                    <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'مصفوفة الإحداثيات (JSON)' : 'Coordinates JSON Array'}</label>
                    <textarea 
                      placeholder="[[25.1, 36.1], [25.2, 36.2], ...]"
                      value={newFeature.rawCoords}
                      onChange={e => setNewFeature({...newFeature, rawCoords: e.target.value})}
                      rows={2}
                      className="w-full font-mono bg-th-surface border border-th-border rounded-lg px-3 py-2 text-xs text-th-text focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 shrink-0 border-t border-th-border">
                <button 
                  onClick={handleCreateFeatureSubmit}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 text-white text-xs font-black rounded-xl hover:bg-teal-600 transition-colors"
                >
                  <Save size={15} />
                  {isArabic ? 'حفظ المعلم (إحداثيات ثابتة)' : 'Save Feature (Static Coords)'}
                </button>
                <button 
                  onClick={handleTriggerMapDrawing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <Map size={15} />
                  {isArabic ? 'تحديد ورسم على الخريطة' : 'Draw Location on Map'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
