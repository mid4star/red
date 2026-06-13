'use client';

import React, { useState, useMemo } from 'react';
import { useGISStore } from '../store/gisStore';
import { Card } from '@/components/ui/Card';
import { 
  Download, FileText, Calendar, Sliders, CheckSquare, Square, 
  Search, Printer, MapPin, Database, ChevronRight, LayoutList 
} from 'lucide-react';

export default function GISReports({ isArabic }: { isArabic: boolean }) {
  const { features, layers } = useGISStore();
  
  // ── 1. Filters State ──
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGeometry, setSelectedGeometry] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minProgress, setMinProgress] = useState<number>(0);
  const [maxProgress, setMaxProgress] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ── 2. Column Selection State ──
  const [selectedColumns, setSelectedColumns] = useState<{ [key: string]: boolean }>({
    name: true,
    description: true,
    layer: true,
    type: true,
    status: true,
    progress: true,
    coords: false,
    updatedAt: true
  });

  // ── 3. Apply Multi-Dimensional Filtering ──
  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      // A. Layer Filter
      const layerMatch = selectedLayer === 'all' || f.layerId === selectedLayer;
      
      // B. Status Filter
      const statusMatch = selectedStatus === 'all' || f.properties?.status === selectedStatus;
      
      // C. Geometry Filter
      const geometryMatch = selectedGeometry === 'all' || f.type === selectedGeometry;
      
      // D. Progress Filter
      const progressVal = f.properties?.progress ?? 0;
      const progressMatch = progressVal >= minProgress && progressVal <= maxProgress;
      
      // E. Date Range Filter
      const fTime = new Date(f.updatedAt || f.createdAt || Date.now()).getTime();
      let dateMatch = true;
      if (startDate) {
        const startMs = new Date(startDate).getTime();
        if (fTime < startMs) dateMatch = false;
      }
      if (endDate) {
        const endMs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000; // end of selected day
        if (fTime > endMs) dateMatch = false;
      }
      
      // F. Keyword Search Filter
      const name = f.properties?.name?.toLowerCase() || '';
      const nameAr = f.properties?.nameAr?.toLowerCase() || '';
      const desc = f.properties?.description?.toLowerCase() || '';
      const descAr = f.properties?.descriptionAr?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      const searchMatch = !query || name.includes(query) || nameAr.includes(query) || desc.includes(query) || descAr.includes(query);

      return layerMatch && statusMatch && geometryMatch && progressMatch && dateMatch && searchMatch;
    });
  }, [features, selectedLayer, selectedStatus, selectedGeometry, minProgress, maxProgress, startDate, endDate, searchQuery]);

  // ── 4. Exporters ──

  // Column Selector Toggler
  const toggleColumn = (col: string) => {
    setSelectedColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  // CSV Exporter (Only outputs selected columns)
  const exportCSV = () => {
    const csvHeaders: string[] = [];
    if (selectedColumns.name) csvHeaders.push(isArabic ? 'الاسم' : 'Name');
    if (selectedColumns.description) csvHeaders.push(isArabic ? 'الوصف' : 'Description');
    if (selectedColumns.layer) csvHeaders.push(isArabic ? 'الطبقة' : 'Layer');
    if (selectedColumns.type) csvHeaders.push(isArabic ? 'نوع الشكل' : 'Geometry Type');
    if (selectedColumns.status) csvHeaders.push(isArabic ? 'الحالة' : 'Status');
    if (selectedColumns.progress) csvHeaders.push(isArabic ? 'نسبة الإنجاز' : 'Progress');
    if (selectedColumns.coords) csvHeaders.push(isArabic ? 'الإحداثيات' : 'Coordinates');
    if (selectedColumns.updatedAt) csvHeaders.push(isArabic ? 'تاريخ التحديث' : 'Updated At');

    const csvRows = filteredFeatures.map(f => {
      const rowData: string[] = [];
      const layer = layers.find(l => l.id === f.layerId);
      const layerName = layer ? (isArabic ? layer.nameAr : layer.name) : '';
      
      if (selectedColumns.name) {
        rowData.push(`"${(isArabic ? f.properties.nameAr || '' : f.properties.name || '').replace(/"/g, '""')}"`);
      }
      if (selectedColumns.description) {
        rowData.push(`"${(isArabic ? f.properties.descriptionAr || '' : f.properties.description || '').replace(/"/g, '""')}"`);
      }
      if (selectedColumns.layer) {
        rowData.push(`"${layerName.replace(/"/g, '""')}"`);
      }
      if (selectedColumns.type) {
        rowData.push(`"${f.type}"`);
      }
      if (selectedColumns.status) {
        rowData.push(`"${f.properties.status || ''}"`);
      }
      if (selectedColumns.progress) {
        rowData.push(`"${f.properties.progress || 0}%"`);
      }
      if (selectedColumns.coords) {
        rowData.push(`"${JSON.stringify(f.coordinates).replace(/"/g, '""')}"`);
      }
      if (selectedColumns.updatedAt) {
        rowData.push(`"${f.updatedAt ? new Date(f.updatedAt).toLocaleDateString() : ''}"`);
      }
      return rowData.join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [csvHeaders.join(','), ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gis_custom_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // GeoJSON Exporter (For external GIS applications)
  const exportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: filteredFeatures.map(f => ({
        type: 'Feature',
        geometry: {
          type: f.type === 'LineString' ? 'LineString' : f.type === 'Polygon' ? 'Polygon' : 'Point',
          coordinates: f.coordinates
        },
        properties: {
          id: f.id,
          layerId: f.layerId,
          ...f.properties
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gis_spatial_export_${new Date().toISOString().split('T')[0]}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // HTML Print Report (Generate A4 structured PDF/HTML template)
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const activeCols = Object.keys(selectedColumns).filter(col => selectedColumns[col]);
    
    // Generate Column Headers
    const getHeaderLabel = (col: string) => {
      if (col === 'name') return isArabic ? 'الاسم' : 'Name';
      if (col === 'description') return isArabic ? 'الوصف' : 'Description';
      if (col === 'layer') return isArabic ? 'الطبقة' : 'Layer';
      if (col === 'type') return isArabic ? 'نوع الشكل' : 'Geometry';
      if (col === 'status') return isArabic ? 'الحالة' : 'Status';
      if (col === 'progress') return isArabic ? 'الإنجاز' : 'Progress';
      if (col === 'coords') return isArabic ? 'الإحداثيات' : 'Coords';
      if (col === 'updatedAt') return isArabic ? 'تاريخ التحديث' : 'Updated At';
      return col;
    };

    const getRowValue = (f: any, col: string) => {
      if (col === 'name') return isArabic ? f.properties.nameAr || 'بدون اسم' : f.properties.name || 'Unnamed';
      if (col === 'description') return isArabic ? f.properties.descriptionAr || '-' : f.properties.description || '-';
      if (col === 'layer') {
        const layer = layers.find(l => l.id === f.layerId);
        return layer ? (isArabic ? layer.nameAr : layer.name) : '-';
      }
      if (col === 'type') return f.type;
      if (col === 'status') return f.properties.status || '-';
      if (col === 'progress') return `${f.properties.progress || 0}%`;
      if (col === 'coords') return JSON.stringify(f.coordinates).substring(0, 40) + '...';
      if (col === 'updatedAt') return f.updatedAt ? new Date(f.updatedAt).toLocaleDateString() : '-';
      return '';
    };

    const tableHeadersHTML = activeCols.map(col => `<th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: ${isArabic ? 'right' : 'left'}; font-size: 11px;">${getHeaderLabel(col)}</th>`).join('');
    
    const tableRowsHTML = filteredFeatures.map(f => {
      const colsHTML = activeCols.map(col => `<td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 11px;">${getRowValue(f, col)}</td>`).join('');
      return `<tr>${colsHTML}</tr>`;
    }).join('');

    const statsHTML = `
      <div style="display: flex; gap: 15px; margin-bottom: 20px; text-align: ${isArabic ? 'right' : 'left'};" dir="${isArabic ? 'rtl' : 'ltr'}">
        <div style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
          <span style="font-size: 10px; color: #888; font-weight: bold; text-transform: uppercase;">${isArabic ? 'إجمالي العناصر' : 'Total Items'}</span>
          <div style="font-size: 18px; font-weight: black; margin-top: 4px;">${filteredFeatures.length}</div>
        </div>
        <div style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
          <span style="font-size: 10px; color: #888; font-weight: bold; text-transform: uppercase;">${isArabic ? 'النقاط' : 'Points'}</span>
          <div style="font-size: 18px; font-weight: black; margin-top: 4px;">${filteredFeatures.filter(f => f.type === 'Point').length}</div>
        </div>
        <div style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
          <span style="font-size: 10px; color: #888; font-weight: bold; text-transform: uppercase;">${isArabic ? 'المناطق والمسارات' : 'Polygons/Lines'}</span>
          <div style="font-size: 18px; font-weight: black; margin-top: 4px;">${filteredFeatures.filter(f => f.type !== 'Point').length}</div>
        </div>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>${isArabic ? 'تقرير البيانات الجغرافية GIS' : 'GIS Spatial Data Report'}</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 40px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body dir="${isArabic ? 'rtl' : 'ltr'}">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0d9488; padding-bottom: 15px; margin-bottom: 25px;">
            <div>
              <h1 style="font-size: 20px; margin: 0; color: #0d9488; font-weight: 900;">${isArabic ? 'نظم المعلومات الجغرافية - تقرير مخصص' : 'Enterprise GIS - Custom Spatial Report'}</h1>
              <p style="font-size: 11px; color: #666; margin: 4px 0 0 0;">${isArabic ? 'المنصة البيئية المتكاملة للبحر الأحمر' : 'Red Sea Integrated Ecological Platform'}</p>
            </div>
            <div style="text-align: ${isArabic ? 'left' : 'right'}; font-size: 10px; color: #666;">
              <div>${isArabic ? 'تاريخ التوليد:' : 'Generated At:'} ${new Date().toLocaleString()}</div>
              <div>${isArabic ? 'نطاق البحث:' : 'Filters:'} ${selectedLayer !== 'all' ? selectedLayer : (isArabic ? 'جميع الطبقات' : 'All Layers')}</div>
            </div>
          </div>
          
          ${statsHTML}

          <table>
            <thead>
              <tr>${tableHeadersHTML}</tr>
            </thead>
            <tbody>
              ${tableRowsHTML}
            </tbody>
          </table>

          <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 15px; display: flex; justify-content: space-between; font-size: 9px; color: #999;">
            <span>${isArabic ? 'سري وتخص صانع القرار' : 'CONFIDENTIAL - FOR DECISION MAKER USE ONLY'}</span>
            <span>Red Sea GIS System &copy; 2026</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ── 1. Page Header ── */}
      <Card className="p-6 bg-th-surface border-th-border shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-th-border/40 pb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
               <FileText size={20} />
             </div>
             <div>
               <h2 className="text-xl font-black text-th-text m-0">{isArabic ? 'منشئ التقارير الجغرافية المتقدم' : 'Advanced GIS Report Builder'}</h2>
               <p className="text-xs text-th-muted mt-0.5">{isArabic ? 'تحكم في خصائص التصدير، نوع الهندسة، النطاق الزمني والأعمدة الفورية' : 'Filter, customize columns, and export data in multiple formats'}</p>
             </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button 
              onClick={exportCSV}
              disabled={filteredFeatures.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-650 disabled:opacity-50 transition-colors font-bold text-xs"
              title={isArabic ? 'تصدير بصيغة CSV' : 'Export Excel/CSV'}
            >
              <Download size={14} />
              {isArabic ? 'تصدير CSV' : 'Export CSV'}
            </button>
            <button 
              onClick={exportGeoJSON}
              disabled={filteredFeatures.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors font-bold text-xs"
              title={isArabic ? 'تصدير GeoJSON للخرائط' : 'Export GeoJSON'}
            >
              <Database size={14} />
              {isArabic ? 'تصدير GeoJSON' : 'GeoJSON'}
            </button>
            <button 
              onClick={handlePrintReport}
              disabled={filteredFeatures.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-th-text border border-th-border rounded-xl disabled:opacity-50 transition-colors font-bold text-xs"
              title={isArabic ? 'طباعة التقرير أو الحفظ كـ PDF' : 'Print Report / Save PDF'}
            >
              <Printer size={14} />
              {isArabic ? 'طباعة' : 'Print'}
            </button>
          </div>
        </div>

        {/* ── 2. Filters Grid (Multi-dimensional) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-th-surface2 border border-th-border">
          {/* Search Input */}
          <div className="md:col-span-3 lg:col-span-4 relative">
            <label className="text-[10px] font-bold text-th-muted block mb-1.5 uppercase">{isArabic ? 'البحث بالاسم أو الوصف' : 'Search by Name or Description'}</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder={isArabic ? 'اكتب كلمة مفتاحية للبحث...' : 'Type search keyword...'} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-th-surface border border-th-border rounded-xl pr-10 pl-3 py-2 text-xs text-th-text focus:outline-none focus:border-teal-500"
              />
              <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-th-muted" />
            </div>
          </div>

          {/* Layer Filter */}
          <div>
            <label className="text-[10px] font-bold text-th-muted block mb-1.5 uppercase">{isArabic ? 'الطبقة الجغرافية' : 'Map Layer'}</label>
            <select 
              value={selectedLayer} 
              onChange={e => setSelectedLayer(e.target.value)}
              className="w-full bg-th-surface border border-th-border rounded-xl px-3 py-2 text-xs font-bold text-th-text focus:outline-none focus:border-teal-500"
            >
              <option value="all">{isArabic ? 'جميع الطبقات' : 'All Layers'}</option>
              {layers.map(l => (
                <option key={l.id} value={l.id}>{isArabic ? l.nameAr : l.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-bold text-th-muted block mb-1.5 uppercase">{isArabic ? 'حالة العنصر' : 'Status'}</label>
            <select 
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-th-surface border border-th-border rounded-xl px-3 py-2 text-xs font-bold text-th-text focus:outline-none focus:border-teal-500"
            >
              <option value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
              <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
              <option value="critical">{isArabic ? 'حرج / طارئ' : 'Critical'}</option>
            </select>
          </div>

          {/* Geometry Filter */}
          <div>
            <label className="text-[10px] font-bold text-th-muted block mb-1.5 uppercase">{isArabic ? 'نوع الشكل الهندسي' : 'Geometry Type'}</label>
            <select 
              value={selectedGeometry} 
              onChange={e => setSelectedGeometry(e.target.value)}
              className="w-full bg-th-surface border border-th-border rounded-xl px-3 py-2 text-xs font-bold text-th-text focus:outline-none focus:border-teal-500"
            >
              <option value="all">{isArabic ? 'جميع الأشكال' : 'All Geometries'}</option>
              <option value="Point">{isArabic ? 'نقاط (Point)' : 'Points'}</option>
              <option value="Polygon">{isArabic ? 'مضلعات (Polygon)' : 'Polygons'}</option>
              <option value="LineString">{isArabic ? 'مسارات (LineString)' : 'LineStrings'}</option>
            </select>
          </div>

          {/* Date Start */}
          <div>
            <label className="text-[10px] font-bold text-th-muted block mb-1.5 uppercase">{isArabic ? 'من تاريخ التحديث' : 'Start Date'}</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-th-surface border border-th-border rounded-xl px-3 py-2 text-xs text-th-text focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Date End */}
          <div>
            <label className="text-[10px] font-bold text-th-muted block mb-1.5 uppercase">{isArabic ? 'إلى تاريخ التحديث' : 'End Date'}</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-th-surface border border-th-border rounded-xl px-3 py-2 text-xs text-th-text focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Progress Bounds */}
          <div className="md:col-span-2 flex items-center gap-3 bg-th-surface border border-th-border p-2 rounded-xl">
             <div className="flex-1">
               <label className="text-[9px] text-th-muted font-bold block mb-1 uppercase">{isArabic ? 'أدنى نسبة إنجاز' : 'Min Progress'}</label>
               <input 
                 type="number" min="0" max="100" value={minProgress} 
                 onChange={e => setMinProgress(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                 className="w-full bg-th-surface2 border border-th-border rounded-lg px-2 py-1 text-xs text-center font-bold text-th-text focus:outline-none focus:border-teal-500"
               />
             </div>
             <ChevronRight size={14} className="text-th-muted mt-3 shrink-0" />
             <div className="flex-1">
               <label className="text-[9px] text-th-muted font-bold block mb-1 uppercase">{isArabic ? 'أقصى نسبة إنجاز' : 'Max Progress'}</label>
               <input 
                 type="number" min="0" max="100" value={maxProgress} 
                 onChange={e => setMaxProgress(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                 className="w-full bg-th-surface2 border border-th-border rounded-lg px-2 py-1 text-xs text-center font-bold text-th-text focus:outline-none focus:border-teal-500"
               />
             </div>
          </div>
        </div>

        {/* ── 3. Column Selector Checklist ── */}
        <div className="p-4 rounded-2xl bg-th-surface2 border border-th-border space-y-3">
          <h3 className="text-[10px] font-black text-teal-650 dark:text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
            <LayoutList size={14} />
            {isArabic ? 'أعمدة وخصائص التقرير المحددة' : 'Select Report Columns & Properties'}
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'name', labelAr: 'الاسم', label: 'Name' },
              { id: 'description', labelAr: 'الوصف والتفاصيل', label: 'Description' },
              { id: 'layer', labelAr: 'الطبقة الجغرافية', label: 'Map Layer' },
              { id: 'type', labelAr: 'نوع الهندسة', label: 'Geometry' },
              { id: 'status', labelAr: 'الحالة', label: 'Status' },
              { id: 'progress', labelAr: 'نسبة الإنجاز', label: 'Progress Rate' },
              { id: 'coords', labelAr: 'إحداثيات الشكل الجغرافي', label: 'Coordinates Array' },
              { id: 'updatedAt', labelAr: 'آخر تحديث', label: 'Last Updated Date' },
            ].map(col => {
              const active = selectedColumns[col.id];
              return (
                <button
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    active 
                      ? 'bg-teal-500/10 text-teal-500 border-teal-500/30 shadow-sm' 
                      : 'bg-th-surface text-th-muted border-th-border hover:bg-th-surface2'
                  }`}
                >
                  {active ? <CheckSquare size={13} /> : <Square size={13} />}
                  {isArabic ? col.labelAr : col.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. Live Summary Stats ── */}
        <div className="flex items-center justify-between text-xs text-th-muted p-2 border-t border-th-border/30">
          <span className="font-medium">{isArabic ? `تم العثور على ${filteredFeatures.length} سجل مطابق` : `Found ${filteredFeatures.length} matching records`}</span>
          <span className="font-mono text-[10px]">{isArabic ? 'مزامنة فورية بقواعد البيانات' : 'Real-time SQLite database sync'}</span>
        </div>

        {/* ── 5. Detailed Table View ── */}
        <div className="overflow-x-auto rounded-xl border border-th-border">
          <table className="w-full text-left border-collapse" dir={isArabic ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="border-b border-th-border bg-th-surface2">
                {selectedColumns.name && <th className="p-3 text-xs font-bold text-th-muted uppercase tracking-wider">{isArabic ? 'الاسم' : 'Name'}</th>}
                {selectedColumns.layer && <th className="p-3 text-xs font-bold text-th-muted uppercase tracking-wider">{isArabic ? 'الطبقة' : 'Layer'}</th>}
                {selectedColumns.type && <th className="p-3 text-xs font-bold text-th-muted uppercase tracking-wider">{isArabic ? 'نوع الشكل' : 'Geometry'}</th>}
                {selectedColumns.status && <th className="p-3 text-xs font-bold text-th-muted uppercase tracking-wider">{isArabic ? 'الحالة' : 'Status'}</th>}
                {selectedColumns.progress && <th className="p-3 text-xs font-bold text-th-muted uppercase tracking-wider">{isArabic ? 'الإنجاز' : 'Progress'}</th>}
                {selectedColumns.coords && <th className="p-3 text-xs font-bold text-th-muted uppercase tracking-wider">{isArabic ? 'الإحداثيات' : 'Coords'}</th>}
                {selectedColumns.updatedAt && <th className="p-3 text-xs font-bold text-th-muted uppercase tracking-wider">{isArabic ? 'تاريخ التحديث' : 'Updated At'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-th-border">
              {filteredFeatures.map(f => {
                const layer = layers.find(l => l.id === f.layerId);
                const layerName = layer ? (isArabic ? layer.nameAr : layer.name) : '';
                return (
                  <tr key={f.id} className="hover:bg-th-surface2/50 transition-colors">
                    {selectedColumns.name && (
                      <td className="p-3">
                        <div className="font-bold text-sm text-th-text">{isArabic ? f.properties.nameAr : f.properties.name}</div>
                        {selectedColumns.description && (
                          <div className="text-[10px] text-th-muted line-clamp-1 max-w-[200px]">{isArabic ? f.properties.descriptionAr : f.properties.description}</div>
                        )}
                      </td>
                    )}
                    {selectedColumns.layer && <td className="p-3 text-xs text-th-text">{layerName}</td>}
                    {selectedColumns.type && (
                      <td className="p-3">
                        <span className="font-mono bg-th-surface border border-th-border px-1.5 py-0.5 rounded text-[10px]">
                          {f.type}
                        </span>
                      </td>
                    )}
                    {selectedColumns.status && (
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          f.properties.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                          f.properties.status === 'critical' ? 'bg-red-500/10 text-red-650' :
                          'bg-th-muted/10 text-th-muted'
                        }`}>
                          {f.properties.status || '-'}
                        </span>
                      </td>
                    )}
                    {selectedColumns.progress && <td className="p-3 text-xs font-bold text-teal-500">{f.properties.progress || 0}%</td>}
                    {selectedColumns.coords && (
                      <td className="p-3 text-[10px] font-mono text-th-muted truncate max-w-[150px]" title={JSON.stringify(f.coordinates)}>
                        {JSON.stringify(f.coordinates)}
                      </td>
                    )}
                    {selectedColumns.updatedAt && (
                      <td className="p-3 text-xs text-th-muted">
                        {f.updatedAt ? new Date(f.updatedAt).toLocaleDateString() : '-'}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredFeatures.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-th-muted text-sm italic">
                    {isArabic ? 'لا توجد بيانات مطابقة للفلاتر المعنية' : 'No spatial data matches the filter criteria'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
