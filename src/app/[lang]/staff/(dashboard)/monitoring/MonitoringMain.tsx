'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Compass, Loader2, Plus, MapPin, Calendar, User, FileText, Tag, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import MonitoringStats from './components/MonitoringStats';
import DataGrid from './components/DataGrid';
import RecordDrawer from './components/RecordDrawer';
import QuickSpeciesDrawer from './components/QuickSpeciesDrawer';
import SpeciesSelector from './components/SpeciesSelector';
import type { EcoMapItem } from '@/components/monitoring/EcoMap';

const EcoMap = dynamic(() => import('@/components/monitoring/EcoMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-th-surface border border-th-border rounded-2xl min-h-[400px]">
      <Loader2 className="animate-spin text-teal-400 mb-2" size={32} />
    </div>
  )
});

interface MonitoringMainProps {
  lang: string;
}

type TabType = 'eco_programs' | 'stranding_cases' | 'sightings' | 'beach_surveys';

export default function MonitoringMain({ lang }: MonitoringMainProps) {
  const isAr = lang === 'ar';
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [ecoPrograms, setEcoPrograms] = useState<any[]>([]);
  const [strandingCases, setStrandingCases] = useState<any[]>([]);
  const [sightings, setSightings] = useState<any[]>([]);
  const [beachSurveys, setBeachSurveys] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>('eco_programs');
  const [activeItem, setActiveItem] = useState<EcoMapItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickSpeciesOpen, setQuickSpeciesOpen] = useState(false);
  const [marineSpecies, setMarineSpecies] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [epRes, scRes, sRes, bsRes, msRes] = await Promise.all([
        fetch('/api/staff/query?collection=eco_programs', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/staff/query?collection=stranding_cases', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/staff/query?collection=sightings', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/staff/query?collection=beach_surveys', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/staff/query?collection=marine_species', { cache: 'no-store' }).then(r => r.json()),
      ]);

      if (epRes.success) setEcoPrograms(epRes.data);
      if (scRes.success) setStrandingCases(scRes.data);
      if (sRes.success) setSightings(sRes.data);
      if (bsRes.success) setBeachSurveys(bsRes.data);
      if (msRes.success) setMarineSpecies(msRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const allMapItems = useMemo((): EcoMapItem[] => {
    return [
      ...ecoPrograms.map(ep => ({
        id: ep.id,
        dataType: 'eco_programs' as const,
        latitude: Number(ep.latitude),
        longitude: Number(ep.longitude),
        locationName: ep.location,
        locationNameAr: ep.locationAr,
        date: ep.date,
        program: ep.program,
        subType: ep.subType,
        observerName: ep.observerName,
        details: ep.details,
        attachedFileUrl: ep.attachedFileUrl,
      })),
      ...strandingCases.map(sc => ({
        id: sc.id,
        dataType: 'stranding_cases' as const,
        latitude: Number(sc.latitude),
        longitude: Number(sc.longitude),
        locationName: sc.location,
        locationNameAr: sc.locationAr,
        date: sc.date,
        status: sc.status,
        species: sc.species,
        speciesAr: sc.speciesAr,
        attachedFileUrl: sc.attachedFileUrl,
        description: sc.description,
      })),
      ...sightings.map(s => ({
        id: s.id,
        dataType: 'sightings' as const,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        locationName: s.location,
        locationNameAr: s.locationAr,
        date: s.date,
        species: s.species,
        speciesAr: s.speciesAr,
        count: Number(s.count),
        observerName: s.observerName,
        notes: s.notes,
      })),
      ...beachSurveys.map(bs => ({
        id: bs.id,
        dataType: 'beach_surveys' as const,
        latitude: Number(bs.latitude),
        longitude: Number(bs.longitude),
        locationName: bs.location,
        locationNameAr: bs.locationAr,
        date: bs.date,
        attachedFileUrl: bs.attachedFileUrl,
        description: bs.description,
      })),
    ];
  }, [ecoPrograms, strandingCases, sightings, beachSurveys]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setFormData((prev: any) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
    if (!drawerOpen) setDrawerOpen(true);
  }, [drawerOpen]);

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
      status: 'ALIVE',
      program: 'MANGROVE',
      count: '1'
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmMsg = isAr ? `هل أنت متأكد من حذف السجل؟` : `Are you sure you want to delete this record?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/staff/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionName: activeTab, action: 'DELETE', id }),
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
      delete dataPayload.id;
      delete dataPayload.createdAt;
      delete dataPayload.updatedAt;

      // Clean up fields based on the active tab so Prisma doesn't crash
      if (activeTab === 'eco_programs') {
        delete dataPayload.status;
        delete dataPayload.species;
        delete dataPayload.count;
        delete dataPayload.notes;
        delete dataPayload.description;
      } else if (activeTab === 'stranding_cases') {
        delete dataPayload.program;
        delete dataPayload.subType;
        delete dataPayload.count;
        delete dataPayload.notes;
        delete dataPayload.observerName;
        delete dataPayload.details;
      } else if (activeTab === 'sightings') {
        delete dataPayload.program;
        delete dataPayload.subType;
        delete dataPayload.status;
        delete dataPayload.attachedFileUrl;
        delete dataPayload.description;
        delete dataPayload.details;
      } else if (activeTab === 'beach_surveys') {
        delete dataPayload.program;
        delete dataPayload.subType;
        delete dataPayload.status;
        delete dataPayload.species;
        delete dataPayload.count;
        delete dataPayload.notes;
        delete dataPayload.observerName;
        delete dataPayload.details;
      }
      
      // Data type casts
      dataPayload.latitude = parseFloat(dataPayload.latitude);
      dataPayload.longitude = parseFloat(dataPayload.longitude);
      dataPayload.date = new Date(dataPayload.date).toISOString();
      if (activeTab === 'sightings') dataPayload.count = parseInt(dataPayload.count, 10);

      const res = await fetch('/api/staff/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: activeTab,
          action: formData.id ? 'UPDATE' : 'ADD',
          id: formData.id,
          data: dataPayload
        }),
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

  const getColumns = (): any[] => {
    if (activeTab === 'eco_programs') {
      return [
        { key: 'program', header: <div className="flex items-center gap-1.5"><Tag size={14}/> {isAr ? 'البرنامج' : 'Program'}</div>, render: (val: any) => <span className="font-bold">{val}</span> },
        { key: 'location', header: <div className="flex items-center gap-1.5"><MapPin size={14}/> {isAr ? 'الموقع' : 'Location'}</div> },
        { key: 'date', header: <div className="flex items-center gap-1.5"><Calendar size={14}/> {isAr ? 'التاريخ' : 'Date'}</div>, render: (val: any) => new Date(val).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') },
        { key: 'observerName', header: <div className="flex items-center gap-1.5"><User size={14}/> {isAr ? 'المراقب' : 'Observer'}</div> },
        { key: 'details', header: <div className="flex items-center gap-1.5"><FileText size={14}/> {isAr ? 'ملاحظات' : 'Details'}</div>, render: (val: any) => <span className="text-th-muted line-clamp-2 break-words text-xs">{val || '-'}</span> }
      ];
    }
    if (activeTab === 'stranding_cases') {
      return [
        { key: 'species', header: <div className="flex items-center gap-1.5"><Tag size={14}/> {isAr ? 'النوع' : 'Species'}</div>, render: (val: any) => <span className="font-bold">{val || '-'}</span> },
        { key: 'status', header: <div className="flex items-center gap-1.5"><Activity size={14}/> {isAr ? 'الحالة' : 'Status'}</div>, render: (val: any) => (
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${val === 'ALIVE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
              {val === 'ALIVE' ? (isAr ? 'حي' : 'ALIVE') : (isAr ? 'نافق' : 'DEAD')}
            </span>
          ) 
        },
        { key: 'location', header: <div className="flex items-center gap-1.5"><MapPin size={14}/> {isAr ? 'الموقع' : 'Location'}</div> },
        { key: 'date', header: <div className="flex items-center gap-1.5"><Calendar size={14}/> {isAr ? 'التاريخ' : 'Date'}</div>, render: (val: any) => new Date(val).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') },
        { key: 'description', header: <div className="flex items-center gap-1.5"><FileText size={14}/> {isAr ? 'الوصف' : 'Description'}</div>, render: (val: any) => <span className="text-th-muted line-clamp-2 break-words text-xs">{val || '-'}</span> }
      ];
    }
    if (activeTab === 'sightings') {
      return [
        { key: 'species', header: <div className="flex items-center gap-1.5"><Tag size={14}/> {isAr ? 'النوع' : 'Species'}</div>, render: (val: any) => <span className="font-bold">{val || '-'}</span> },
        { key: 'count', header: <div className="flex items-center gap-1.5"><Activity size={14}/> {isAr ? 'العدد' : 'Count'}</div>, render: (val: any) => <span className="inline-flex items-center justify-center bg-teal-500/10 text-teal-500 rounded-full w-6 h-6 font-bold text-xs">{val}</span> },
        { key: 'location', header: <div className="flex items-center gap-1.5"><MapPin size={14}/> {isAr ? 'الموقع' : 'Location'}</div> },
        { key: 'observerName', header: <div className="flex items-center gap-1.5"><User size={14}/> {isAr ? 'المراقب' : 'Observer'}</div> },
        { key: 'date', header: <div className="flex items-center gap-1.5"><Calendar size={14}/> {isAr ? 'التاريخ' : 'Date'}</div>, render: (val: any) => new Date(val).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') },
      ];
    }
    return [
      { key: 'location', header: <div className="flex items-center gap-1.5"><MapPin size={14}/> {isAr ? 'الموقع' : 'Location'}</div>, render: (val: any) => <span className="font-bold">{val}</span> },
      { key: 'date', header: <div className="flex items-center gap-1.5"><Calendar size={14}/> {isAr ? 'التاريخ' : 'Date'}</div>, render: (val: any) => new Date(val).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') },
      { key: 'description', header: <div className="flex items-center gap-1.5"><FileText size={14}/> {isAr ? 'الوصف' : 'Description'}</div>, render: (val: any) => <span className="text-th-muted line-clamp-2 break-words text-xs">{val || '-'}</span> }
    ];
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <Loader2 className="animate-spin text-teal-500 mb-4" size={32} />
        <span className="text-th-muted font-medium text-sm">
          {isAr ? 'جاري تحميل نظام الرصد البيئي...' : 'Loading environmental monitoring system...'}
        </span>
      </div>
    );
  }

  const currentData = 
    activeTab === 'eco_programs' ? ecoPrograms :
    activeTab === 'stranding_cases' ? strandingCases :
    activeTab === 'sightings' ? sightings : beachSurveys;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-wrap items-center justify-between bg-th-surface2 p-4 md:p-6 rounded-2xl border border-th-border shadow-sm gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
              <Compass size={24} />
           </div>
           <div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 block mb-1">
               {isAr ? 'الرصد البيئي المتكامل' : 'Integrated Monitoring'}
             </span>
             <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-th-text uppercase m-0 leading-none">
               {isAr ? 'لوحة القيادة البيئية' : 'Environmental Dashboard'}
             </h1>
           </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start shrink-0">
          <Button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 px-6 rounded-xl h-11 transition-all">
            <Plus size={18} className={isAr ? 'ml-2' : 'mr-2'} />
            <span className="font-bold tracking-wide">{isAr ? 'إضافة سجل جديد' : 'Add New Record'}</span>
          </Button>
        </div>
      </div>

      <MonitoringStats 
        ecoProgramsCount={ecoPrograms.length}
        strandingCasesCount={strandingCases.length}
        sightingsCount={sightings.length}
        beachSurveysCount={beachSurveys.length}
        lang={lang}
      />

      <div className="flex items-center p-1.5 bg-th-surface2/80 backdrop-blur-md border border-th-border/50 rounded-2xl w-fit shadow-sm">
        {[
          { id: 'eco_programs', label: isAr ? 'برامج الرصد' : 'Eco Programs' },
          { id: 'stranding_cases', label: isAr ? 'حالات الجنوح' : 'Strandings' },
          { id: 'sightings', label: isAr ? 'المشاهدات' : 'Sightings' },
          { id: 'beach_surveys', label: isAr ? 'مسح الشواطئ' : 'Beach Surveys' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
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
        <div className="lg:col-span-5 h-[400px] lg:h-full relative rounded-2xl overflow-hidden shadow-sm">
          <EcoMap 
            items={allMapItems}
            activeItem={activeItem}
            onItemSelect={setActiveItem}
            onMapClick={handleMapClick}
            lang={lang}
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
              const item = allMapItems.find(i => i.id === row.id && i.dataType === activeTab);
              if (item) setActiveItem(item);
            }}
            lang={lang}
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

          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-th-muted uppercase flex items-center gap-1">
              <MapPin size={12} className="text-teal-500"/> 
              {isAr ? 'خط العرض (Lat) *' : 'Latitude *'}
            </label>
            <Input type="text" value={formData.latitude || ''} onChange={e => setFormData({...formData, latitude: e.target.value})} required placeholder="27.1234" />
          </div>

          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-th-muted uppercase flex items-center gap-1">
              <MapPin size={12} className="text-teal-500"/> 
              {isAr ? 'خط الطول (Lng) *' : 'Longitude *'}
            </label>
            <Input type="text" value={formData.longitude || ''} onChange={e => setFormData({...formData, longitude: e.target.value})} required placeholder="33.1234" />
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'الموقع *' : 'Location Name *'}</label>
            <Input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} required />
          </div>

          {activeTab === 'eco_programs' && (
             <div className="space-y-1 col-span-2">
               <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'اسم المراقب *' : 'Observer Name *'}</label>
               <Input type="text" value={formData.observerName || ''} onChange={e => setFormData({...formData, observerName: e.target.value})} required />
             </div>
          )}

          {activeTab === 'stranding_cases' && (
            <>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'النوع' : 'Species'}</label>
                <SpeciesSelector 
                  value={formData.species || ''} 
                  onChange={(val) => setFormData({...formData, species: val})} 
                  lang={lang} 
                  speciesList={marineSpecies}
                  onAddNew={() => setQuickSpeciesOpen(true)}
                />
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'الحالة' : 'Status'}</label>
                <select value={formData.status || 'ALIVE'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full h-10 bg-th-input border border-th-border rounded-lg px-3 text-th-text text-sm focus:outline-none focus:border-teal-500">
                  <option value="ALIVE">{isAr ? 'حي' : 'Alive'}</option>
                  <option value="DEAD">{isAr ? 'نافق' : 'Dead'}</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'sightings' && (
            <>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'النوع *' : 'Species *'}</label>
                <SpeciesSelector 
                  value={formData.species || ''} 
                  onChange={(val) => setFormData({...formData, species: val})} 
                  lang={lang} 
                  speciesList={marineSpecies}
                  onAddNew={() => setQuickSpeciesOpen(true)}
                />
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'العدد' : 'Count'}</label>
                <Input type="number" min="1" value={formData.count || 1} onChange={e => setFormData({...formData, count: e.target.value})} />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'اسم المراقب *' : 'Observer Name *'}</label>
                <Input type="text" value={formData.observerName || ''} onChange={e => setFormData({...formData, observerName: e.target.value})} required />
              </div>
            </>
          )}

          <div className="space-y-1 col-span-2">
            <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'التفاصيل / ملاحظات' : 'Details / Notes'}</label>
            <textarea 
              value={formData.details || formData.description || formData.notes || ''} 
              onChange={e => {
                if (activeTab === 'eco_programs') setFormData({...formData, details: e.target.value});
                else if (activeTab === 'sightings') setFormData({...formData, notes: e.target.value});
                else setFormData({...formData, description: e.target.value});
              }} 
              className="w-full min-h-[80px] bg-th-input border border-th-border rounded-lg p-3 text-th-text text-sm focus:outline-none focus:border-teal-500 custom-scrollbar"
            />
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-xs font-bold text-th-muted uppercase">{isAr ? 'المرفقات' : 'Attachments'}</label>
            <FileUpload 
              endpoint="documentUploader"
              onUploadComplete={(files) => setFormData({...formData, attachedFileUrl: files[0]?.url})}
              lang={lang}
            />
          </div>
        </div>
      </RecordDrawer>

      <QuickSpeciesDrawer 
        isOpen={quickSpeciesOpen}
        onClose={() => setQuickSpeciesOpen(false)}
        lang={lang}
        onSuccess={(newSpecies) => {
          setMarineSpecies(prev => [...prev, newSpecies]);
          setFormData({ ...formData, species: newSpecies.name });
        }}
      />
    </div>
  );
}
