'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ShieldAlert, Loader2, Plus, MapPin, Calendar, User, FileText, Tag, Activity, Clock, DollarSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import EIAStats from './components/EIAStats';
import DataGrid from './components/DataGrid';
import RecordDrawer from './components/RecordDrawer';
import type { MapItem } from '@/components/eia/MapComponent';
import EIAReportModal from './EIAReportModal';

const MapComponent = dynamic(() => import('@/components/eia/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-th-surface border border-th-border rounded-2xl min-h-[400px]">
      <Loader2 className="animate-spin text-teal-400 mb-2" size={32} />
    </div>
  )
});

interface EIAMainProps {
  lang: string;
}

type TabType = 'costs' | 'inspections' | 'violations' | 'accidents';

export default function EIAMain({ lang }: EIAMainProps) {
  const isAr = lang === 'ar';
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [costs, setCosts] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [accidents, setAccidents] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>('costs');
  const [activeItem, setActiveItem] = useState<MapItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [selectedDetailType, setSelectedDetailType] = useState<TabType | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [formData, setFormData] = useState<any>({});
  
  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    setMounted(true);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [cRes, iRes, vRes, aRes] = await Promise.all([
        fetch('/api/eia/costs', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/eia/inspections', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/eia/violations', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/eia/accidents', { cache: 'no-store' }).then(r => r.json()),
      ]);

      setCosts(Array.isArray(cRes) ? cRes : []);
      setInspections(Array.isArray(iRes) ? iRes : []);
      setViolations(Array.isArray(vRes) ? vRes : []);
      setAccidents(Array.isArray(aRes) ? aRes : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const allMapItems = useMemo((): MapItem[] => {
    const items: MapItem[] = [];
    inspections.forEach(item => {
      items.push({
        id: item.id,
        dataType: 'inspection',
        latitude: item.latitude,
        longitude: item.longitude,
        locationName: item.locationName,
        type: item.locationName,
        date: item.date,
        details: item.inspectorName,
        studyFileUrl: item.studyFileUrl,
        reportFileUrl: item.reportFileUrl,
        inspectorName: item.inspectorName
      });
    });
    violations.forEach(item => {
      items.push({
        id: item.id,
        dataType: 'violation',
        latitude: item.latitude,
        longitude: item.longitude,
        locationName: item.locationName,
        type: item.type,
        date: item.date,
        details: item.entityName,
        entityName: item.entityName,
        entityType: item.entityType
      });
    });
    accidents.forEach(item => {
      items.push({
        id: item.id,
        dataType: 'accident',
        latitude: item.latitude,
        longitude: item.longitude,
        locationName: item.locationName,
        type: item.type,
        date: item.date,
        details: item.description,
        reportFileUrl: item.reportFileUrl
      });
    });
    return items;
  }, [inspections, violations, accidents]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (activeTab === 'costs') return; // Costs don't have location
    setFormData((prev: any) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
    if (!drawerOpen) setDrawerOpen(true);
  }, [activeTab, drawerOpen]);

  const handleEdit = (row: any) => {
    setFormData({
      ...row,
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      latitude: '',
      longitude: '',
      status: 'UNANSWERED',
      type: activeTab === 'violations' ? 'ردم وتغير في حرم الشاطئ' : activeTab === 'accidents' ? 'حوادث شحط أو ربط على الشعاب' : '',
      entityType: 'PROJECT'
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmMsg = isAr ? `هل أنت متأكد من مسح أو طلب حذف السجل؟` : `Are you sure you want to request deletion of this record?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/eia/${activeTab}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'REQUEST_DELETE', user: isAr ? 'مصطفى لايق' : 'M. Layaq' }),
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchAllData();
      if (activeItem?.id === id) setActiveItem(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let dataPayload: any = { ...formData };
      const isEdit = !!formData.id;
      
      if (isEdit) {
        dataPayload.action = 'EDIT';
        dataPayload.user = isAr ? 'مصطفى لايق' : 'M. Layaq';
      }
      
      if (activeTab !== 'costs') {
        dataPayload.latitude = parseFloat(dataPayload.latitude);
        dataPayload.longitude = parseFloat(dataPayload.longitude);
      }
      dataPayload.date = new Date(dataPayload.date).toISOString();

      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(`/api/eia/${activeTab}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataPayload),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      setDrawerOpen(false);
      await fetchAllData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetail = (item: any) => {
    setSelectedDetailItem(item);
    setSelectedDetailType(activeTab);
    setIsReportModalOpen(true);
  };

  const getColumns = (): any[] => {
    if (activeTab === 'costs') {
      return [
        { key: 'subject', header: <div className="flex items-center gap-1.5"><Tag size={14}/> {isAr ? 'الموضوع' : 'Subject'}</div>, render: (val: any) => <span className="font-bold">{val}</span> },
        { key: 'date', header: <div className="flex items-center gap-1.5"><Calendar size={14}/> {isAr ? 'التاريخ' : 'Date'}</div>, render: (val: any) => new Date(val).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') },
        { key: 'status', header: <div className="flex items-center gap-1.5"><Activity size={14}/> {isAr ? 'الحالة' : 'Status'}</div>, render: (val: any) => (
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${val === 'ANSWERED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
              {val === 'ANSWERED' ? (isAr ? 'تم الرد' : 'ANSWERED') : (isAr ? 'لم يتم الرد' : 'UNANSWERED')}
            </span>
          ) 
        },
        { key: 'details', header: <div className="flex items-center gap-1.5"><FileText size={14}/> {isAr ? 'تفاصيل' : 'Details'}</div>, render: (val: any) => <span className="text-th-muted line-clamp-2 break-words text-xs">{val || '-'}</span> },
        { key: 'view', header: <div className="flex items-center gap-1.5">{isAr ? 'عرض' : 'View'}</div>, render: (_: any, row: any) => (
          <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(row); }} className="p-1.5 text-teal-500 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg transition-colors"><Eye size={16}/></button>
        )}
      ];
    }
    if (activeTab === 'inspections') {
      return [
        { key: 'locationName', header: <div className="flex items-center gap-1.5"><MapPin size={14}/> {isAr ? 'الموقع' : 'Location'}</div>, render: (val: any) => <span className="font-bold">{val || '-'}</span> },
        { key: 'inspectorName', header: <div className="flex items-center gap-1.5"><User size={14}/> {isAr ? 'المفتش' : 'Inspector'}</div> },
        { key: 'date', header: <div className="flex items-center gap-1.5"><Calendar size={14}/> {isAr ? 'التاريخ' : 'Date'}</div>, render: (val: any) => new Date(val).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') },
        { key: 'view', header: <div className="flex items-center gap-1.5">{isAr ? 'عرض' : 'View'}</div>, render: (_: any, row: any) => (
          <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(row); }} className="p-1.5 text-teal-500 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg transition-colors"><Eye size={16}/></button>
        )}
      ];
    }
    if (activeTab === 'violations') {
      return [
        { key: 'type', header: <div className="flex items-center gap-1.5"><Tag size={14}/> {isAr ? 'نوع المخالفة' : 'Type'}</div>, render: (val: any) => <span className="font-bold">{val || '-'}</span> },
        { key: 'entityName', header: <div className="flex items-center gap-1.5"><User size={14}/> {isAr ? 'الجهة/الشخص' : 'Entity'}</div> },
        { key: 'locationName', header: <div className="flex items-center gap-1.5"><MapPin size={14}/> {isAr ? 'الموقع' : 'Location'}</div> },
        { key: 'date', header: <div className="flex items-center gap-1.5"><Calendar size={14}/> {isAr ? 'التاريخ' : 'Date'}</div>, render: (val: any) => new Date(val).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') },
        { key: 'view', header: <div className="flex items-center gap-1.5">{isAr ? 'عرض' : 'View'}</div>, render: (_: any, row: any) => (
          <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(row); }} className="p-1.5 text-teal-500 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg transition-colors"><Eye size={16}/></button>
        )}
      ];
    }
    return [
      { key: 'type', header: <div className="flex items-center gap-1.5"><Tag size={14}/> {isAr ? 'نوع الحادث' : 'Type'}</div>, render: (val: any) => <span className="font-bold">{val}</span> },
      { key: 'locationName', header: <div className="flex items-center gap-1.5"><MapPin size={14}/> {isAr ? 'الموقع' : 'Location'}</div> },
      { key: 'date', header: <div className="flex items-center gap-1.5"><Calendar size={14}/> {isAr ? 'التاريخ' : 'Date'}</div>, render: (val: any) => new Date(val).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') },
      { key: 'view', header: <div className="flex items-center gap-1.5">{isAr ? 'عرض' : 'View'}</div>, render: (_: any, row: any) => (
        <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(row); }} className="p-1.5 text-teal-500 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg transition-colors"><Eye size={16}/></button>
      )}
    ];
  };

  const currentDataRaw = 
    activeTab === 'costs' ? costs :
    activeTab === 'inspections' ? inspections :
    activeTab === 'violations' ? violations : accidents;

  // Apply filters
  const currentData = currentDataRaw.filter(item => {
    let matchStatus = true;
    let matchType = true;
    
    if (activeTab === 'costs' && filterStatus !== 'ALL') {
      matchStatus = item.status === filterStatus;
    }
    if (activeTab === 'violations' && filterType !== '') {
      matchType = item.type === filterType;
    }
    if (activeTab === 'accidents' && filterType !== '') {
      matchType = item.type === filterType;
    }
    
    return matchStatus && matchType;
  });

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <Loader2 className="animate-spin text-teal-500 mb-4" size={32} />
        <span className="text-th-muted font-medium text-sm">
          {isAr ? 'جاري تحميل نظام تقييم الأثر البيئي...' : 'Loading EIA system...'}
        </span>
      </div>
    );
  }

  const renderFilters = () => {
    if (activeTab === 'costs') {
      return (
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 px-3 text-sm bg-th-surface border border-th-border rounded-lg text-th-text focus:outline-none">
            <option value="ALL">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="ANSWERED">{isAr ? 'تم الرد' : 'Answered'}</option>
            <option value="UNANSWERED">{isAr ? 'لم يتم الرد' : 'Unanswered'}</option>
          </select>
        </div>
      );
    }
    if (activeTab === 'violations' || activeTab === 'accidents') {
      return (
        <div className="flex items-center gap-2">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-9 px-3 text-sm bg-th-surface border border-th-border rounded-lg text-th-text focus:outline-none max-w-[200px]">
            <option value="">{isAr ? 'كل الأنواع' : 'All Types'}</option>
            {activeTab === 'violations' ? (
              <>
                <option value="ردم وتغير في حرم الشاطئ">ردم وتغير في حرم الشاطئ</option>
                <option value="تلوث بيئي">تلوث بيئي</option>
                <option value="صيد جائر">صيد جائر</option>
                <option value="تعدي على الشعاب">تعدي على الشعاب</option>
              </>
            ) : (
              <>
                <option value="حوادث شحط أو ربط على الشعاب">حوادث شحط أو ربط على الشعاب</option>
                <option value="التلوث البيئي البحري">التلوث البيئي البحري</option>
              </>
            )}
          </select>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between bg-th-surface2 p-4 md:p-6 rounded-2xl border border-th-border shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
              <ShieldAlert size={24} />
           </div>
           <div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 block mb-1">
               {isAr ? 'نظام تقييم الأثر البيئي' : 'Environmental Impact Assessment'}
             </span>
             <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-th-text uppercase m-0 leading-none">
               {isAr ? 'تقييم الأثر البيئي' : 'EIA Dashboard'}
             </h1>
           </div>
        </div>
        <Button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 px-6 rounded-xl h-11 transition-all">
          <Plus size={18} className={isAr ? 'ml-2' : 'mr-2'} />
          <span className="font-bold tracking-wide">{isAr ? 'إضافة سجل جديد' : 'Add New Record'}</span>
        </Button>
      </div>

      <EIAStats 
        costsCount={costs.length}
        inspectionsCount={inspections.length}
        violationsCount={violations.length}
        accidentsCount={accidents.length}
        lang={lang}
      />

      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-th-surface2/80 backdrop-blur-md border border-th-border/50 rounded-2xl w-fit shadow-sm">
        {[
          { id: 'costs', label: isAr ? 'تكاليف بيئية' : 'Costs' },
          { id: 'inspections', label: isAr ? 'تفتيش بيئي' : 'Inspections' },
          { id: 'violations', label: isAr ? 'مخالفات' : 'Violations' },
          { id: 'accidents', label: isAr ? 'حوادث' : 'Accidents' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as TabType); setFilterType(''); setFilterStatus('ALL'); }}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-xl ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-[#1a2b44] shadow-md shadow-black/5 text-teal-600 dark:text-teal-400' 
                : 'text-th-muted hover:text-th-text hover:bg-th-surface/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Left Pane: Interactive Map */}
        <div className="lg:col-span-5 h-[400px] lg:h-full relative rounded-2xl overflow-hidden shadow-sm bg-th-surface border border-th-border">
          <MapComponent 
            items={allMapItems}
            activeItem={activeItem}
            onItemSelect={setActiveItem}
            onMapClick={handleMapClick}
          />
        </div>

        {/* Right Pane: DataGrid */}
        <div className="lg:col-span-7 h-[400px] lg:h-full">
          <DataGrid 
            columns={getColumns()}
            data={currentData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={(row) => {
              if (activeTab === 'costs') {
                handleOpenDetail(row);
                return;
              }
              const item = allMapItems.find(i => i.id === row.id);
              if (item) setActiveItem(item);
            }}
            lang={lang}
            filterContent={renderFilters()}
          />
        </div>
      </div>

      <RecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isAr ? 'تعديل السجل' : 'Edit Record'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        lang={lang}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'التاريخ *' : 'Date *'}</label>
            <Input type="date" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} required className="w-full" />
          </div>

          {activeTab !== 'costs' && (
            <>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-th-muted uppercase flex items-center gap-1">
                  <MapPin size={12} className="text-teal-500"/> 
                  {isAr ? 'خط العرض (Lat) *' : 'Latitude *'}
                </label>
                <Input type="text" value={formData.latitude || ''} onChange={e => setFormData({...formData, latitude: e.target.value})} required />
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-th-muted uppercase flex items-center gap-1">
                  <MapPin size={12} className="text-teal-500"/> 
                  {isAr ? 'خط الطول (Lng) *' : 'Longitude *'}
                </label>
                <Input type="text" value={formData.longitude || ''} onChange={e => setFormData({...formData, longitude: e.target.value})} required />
              </div>
            </>
          )}

          {activeTab === 'costs' && (
            <>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'الموضوع *' : 'Subject *'}</label>
                <Input type="text" value={formData.subject || ''} onChange={e => setFormData({...formData, subject: e.target.value})} required />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'التفاصيل *' : 'Details *'}</label>
                <textarea 
                  value={formData.details || ''} 
                  onChange={e => setFormData({...formData, details: e.target.value})} 
                  className="w-full min-h-[80px] bg-th-input border border-th-border rounded-lg p-3 text-th-text text-sm focus:outline-none focus:border-teal-500 custom-scrollbar"
                  required
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'الحالة' : 'Status'}</label>
                <select value={formData.status || 'UNANSWERED'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full h-10 bg-th-input border border-th-border rounded-lg px-3 text-th-text text-sm focus:outline-none focus:border-teal-500">
                  <option value="UNANSWERED">{isAr ? 'لم يتم الرد' : 'Unanswered'}</option>
                  <option value="ANSWERED">{isAr ? 'تم الرد' : 'Answered'}</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'inspections' && (
            <>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'اسم الموقع *' : 'Location Name *'}</label>
                <Input type="text" value={formData.locationName || ''} onChange={e => setFormData({...formData, locationName: e.target.value})} required />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'المفتش *' : 'Inspector *'}</label>
                <Input type="text" value={formData.inspectorName || ''} onChange={e => setFormData({...formData, inspectorName: e.target.value})} required />
              </div>
            </>
          )}

          {activeTab === 'violations' && (
            <>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'نوع المخالفة *' : 'Violation Type *'}</label>
                <select value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-10 bg-th-input border border-th-border rounded-lg px-3 text-th-text text-sm focus:outline-none focus:border-teal-500" required>
                  <option value="ردم وتغير في حرم الشاطئ">ردم وتغير في حرم الشاطئ</option>
                  <option value="تلوث بيئي">تلوث بيئي</option>
                  <option value="صيد جائر">صيد جائر</option>
                  <option value="تعدي على الشعاب">تعدي على الشعاب</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'موقع المخالفة *' : 'Location Name *'}</label>
                <Input type="text" value={formData.locationName || ''} onChange={e => setFormData({...formData, locationName: e.target.value})} required />
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'نوع الجهة' : 'Entity Type'}</label>
                <select value={formData.entityType || 'PROJECT'} onChange={e => setFormData({...formData, entityType: e.target.value})} className="w-full h-10 bg-th-input border border-th-border rounded-lg px-3 text-th-text text-sm focus:outline-none focus:border-teal-500">
                  <option value="PROJECT">{isAr ? 'مشروع' : 'Project'}</option>
                  <option value="PERSON">{isAr ? 'شخص' : 'Person'}</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'اسم الجهة/الشخص *' : 'Entity Name *'}</label>
                <Input type="text" value={formData.entityName || ''} onChange={e => setFormData({...formData, entityName: e.target.value})} required />
              </div>
            </>
          )}

          {activeTab === 'accidents' && (
            <>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'نوع الحادث *' : 'Accident Type *'}</label>
                <select value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-10 bg-th-input border border-th-border rounded-lg px-3 text-th-text text-sm focus:outline-none focus:border-teal-500" required>
                  <option value="حوادث شحط أو ربط على الشعاب">حوادث شحط أو ربط على الشعاب</option>
                  <option value="التلوث البيئي البحري">التلوث البيئي البحري</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'موقع الحادث *' : 'Location Name *'}</label>
                <Input type="text" value={formData.locationName || ''} onChange={e => setFormData({...formData, locationName: e.target.value})} required />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'الوصف *' : 'Description *'}</label>
                <textarea 
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full min-h-[80px] bg-th-input border border-th-border rounded-lg p-3 text-th-text text-sm focus:outline-none focus:border-teal-500 custom-scrollbar"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-1 col-span-2 pt-2 border-t border-th-border">
            <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'المرفقات' : 'Attachments'}</label>
            <FileUpload 
              endpoint="documentUploader"
              onUploadComplete={(files) => {
                if(activeTab === 'costs' || activeTab === 'violations') {
                  setFormData({...formData, files: files});
                } else if(activeTab === 'inspections') {
                  setFormData({...formData, reportFileUrl: files[0]?.url});
                } else if(activeTab === 'accidents') {
                  setFormData({...formData, reportFileUrl: files[0]?.url});
                }
              }}
              lang={lang}
            />
          </div>
        </div>
      </RecordDrawer>

      <EIAReportModal 
        isOpen={isReportModalOpen}
        onClose={() => { setIsReportModalOpen(false); setSelectedDetailItem(null); setSelectedDetailType(null); }}
        item={selectedDetailItem}
        type={selectedDetailType}
        lang={lang}
        currentUserRole="RESEARCHER"
      />
    </div>
  );
}
