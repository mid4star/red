'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Activity, 
  Navigation, 
  ShieldCheck, 
  AlertCircle, 
  Calendar,
  Waves,
  Plus,
  ArrowRight,
  Download,
  CheckCircle2,
  Trash2,
  Loader2,
  Edit3,
  Compass,
  FileText,
  Heart,
  Skull,
  Layers,
  MapPin,
  ExternalLink,
  Upload,
  Map,
  Database
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FileUpload } from '@/components/ui/FileUpload';
import ReportModal from './ReportModal';

// Import type from EcoMap
import type { EcoMapItem } from '@/components/monitoring/EcoMap';

// Dynamically import the Leaflet map to avoid server-side rendering issues
const EcoMap = dynamic(() => import('@/components/monitoring/EcoMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-th-surface border border-th-border rounded-2xl min-h-[250px] md:min-h-[500px]">
      <Loader2 className="animate-spin text-teal-400 mb-2" size={32} />
      <span className="text-teal-400 text-xs font-semibold tracking-widest uppercase">
        Loading GIS interactive map...
      </span>
    </div>
  )
});

interface MonitoringClientProps {
  lang: string;
}

export default function MonitoringClient({ lang }: MonitoringClientProps) {
  const isAr = lang === 'ar';
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Toast notification state for coordinate capture feedback (F5)
  const [coordsToast, setCoordsToast] = useState<{ lat: string; lng: string } | null>(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Database Collections State
  const [ecoPrograms, setEcoPrograms] = useState<any[]>([]);
  const [strandingCases, setStrandingCases] = useState<any[]>([]);
  const [sightings, setSightings] = useState<any[]>([]);
  const [beachSurveys, setBeachSurveys] = useState<any[]>([]);

  // UX Navigation States
  const [activeTab, setActiveTab] = useState<'eco_programs' | 'stranding_cases' | 'sightings' | 'beach_surveys'>('eco_programs');
  const [subMode, setSubMode] = useState<'form' | 'list'>('form');
  const [mobilePanel, setMobilePanel] = useState<'map' | 'data'>('data');
  const [activeItem, setActiveItem] = useState<EcoMapItem | null>(null);

  // Forms State definitions
  const [epForm, setEpForm] = useState({
    id: '',
    program: 'MANGROVE',
    subType: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    locationAr: '',
    latitude: '',
    longitude: '',
    observerName: '',
    details: '',
    attachedFileUrl: '',
  });

  const [scForm, setScForm] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    locationAr: '',
    latitude: '',
    longitude: '',
    status: 'ALIVE',
    species: '',
    speciesAr: '',
    attachedFileUrl: '',
    description: '',
  });

  const [sForm, setSForm] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    locationAr: '',
    latitude: '',
    longitude: '',
    species: '',
    speciesAr: '',
    count: '1',
    notes: '',
    observerName: '',
  });

  const [bsForm, setBsForm] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    locationAr: '',
    latitude: '',
    longitude: '',
    attachedFileUrl: '',
    description: '',
  });

  // Screen size detection for responsive adjustments
  const updateIsMobile = useCallback(() => {
    if (typeof window === 'undefined') return;
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchAllData();
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, [updateIsMobile]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [epRes, scRes, sRes, bsRes] = await Promise.all([
        fetch('/api/staff/query?collection=eco_programs', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/staff/query?collection=stranding_cases', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/staff/query?collection=sightings', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/staff/query?collection=beach_surveys', { cache: 'no-store' }).then(r => r.json()),
      ]);

      if (epRes.success) setEcoPrograms(epRes.data);
      if (scRes.success) setStrandingCases(scRes.data);
      if (sRes.success) setSightings(sRes.data);
      if (bsRes.success) setBeachSurveys(bsRes.data);
    } catch (error) {
      console.error('Error fetching environmental monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert SQLite database entries to Leaflet Map pins
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

  // Click handler to select map marker
  const handleItemSelect = (item: EcoMapItem) => {
    setActiveItem(item);
    setActiveTab(item.dataType);
    setSubMode('list');
  };

  // Map Click coordinate capture
  const handleMapClick = useCallback((latitude: number, longitude: number) => {
    const latStr = latitude.toFixed(6);
    const lngStr = longitude.toFixed(6);

    // Switch to Form mode automatically on map click coordinate capture
    setSubMode('form');

    if (activeTab === 'eco_programs') {
      setEpForm(prev => ({ ...prev, latitude: latStr, longitude: lngStr }));
    } else if (activeTab === 'stranding_cases') {
      setScForm(prev => ({ ...prev, latitude: latStr, longitude: lngStr }));
    } else if (activeTab === 'sightings') {
      setSForm(prev => ({ ...prev, latitude: latStr, longitude: lngStr }));
    } else if (activeTab === 'beach_surveys') {
      setBsForm(prev => ({ ...prev, latitude: latStr, longitude: lngStr }));
    }

    // Show toast notification (F5: map coordinate feedback)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setCoordsToast({ lat: latStr, lng: lngStr });
    toastTimerRef.current = setTimeout(() => setCoordsToast(null), 3500);
  }, [activeTab]);



  // Mutator Actions: ADD/UPDATE/DELETE
  const handleMutateSubmit = async (e: React.FormEvent, collectionName: string) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let data: any = {};
      let id = '';

      if (collectionName === 'eco_programs') {
        id = epForm.id;
        data = {
          program: epForm.program,
          subType: epForm.subType || null,
          date: new Date(epForm.date).toISOString(),
          location: epForm.location,
          locationAr: epForm.locationAr || null,
          latitude: parseFloat(epForm.latitude),
          longitude: parseFloat(epForm.longitude),
          observerName: epForm.observerName,
          details: epForm.details || null,
          attachedFileUrl: epForm.attachedFileUrl || null,
        };
      } else if (collectionName === 'stranding_cases') {
        id = scForm.id;
        data = {
          date: new Date(scForm.date).toISOString(),
          location: scForm.location,
          locationAr: scForm.locationAr || null,
          latitude: parseFloat(scForm.latitude),
          longitude: parseFloat(scForm.longitude),
          status: scForm.status,
          species: scForm.species,
          speciesAr: scForm.speciesAr || null,
          attachedFileUrl: scForm.attachedFileUrl || null,
          description: scForm.description || null,
        };
      } else if (collectionName === 'sightings') {
        id = sForm.id;
        data = {
          date: new Date(sForm.date).toISOString(),
          location: sForm.location,
          locationAr: sForm.locationAr || null,
          latitude: parseFloat(sForm.latitude),
          longitude: parseFloat(sForm.longitude),
          species: sForm.species,
          speciesAr: sForm.speciesAr || null,
          count: parseInt(sForm.count) || 1,
          notes: sForm.notes || null,
          observerName: sForm.observerName,
        };
      } else if (collectionName === 'beach_surveys') {
        id = bsForm.id;
        data = {
          date: new Date(bsForm.date).toISOString(),
          location: bsForm.location,
          locationAr: bsForm.locationAr || null,
          latitude: parseFloat(bsForm.latitude),
          longitude: parseFloat(bsForm.longitude),
          attachedFileUrl: bsForm.attachedFileUrl || null,
          description: bsForm.description || null,
        };
      }

      const isUpdate = !!id;
      const res = await fetch('/api/staff/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName,
          action: isUpdate ? 'UPDATE' : 'ADD',
          id: isUpdate ? id : undefined,
          data,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save record.');
      }

      // Reset Active form
      resetForm(collectionName);
      await fetchAllData();
      setSubMode('list');
      alert(isAr ? 'تم حفظ التقرير بنجاح' : 'Record saved successfully.');
    } catch (error: any) {
      console.error(error);
      alert(isAr ? `خطأ أثناء الحفظ: ${error.message}` : `Error saving record: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (collectionName: string, id: string, identifier: string) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف السجل "${identifier}" نهائياً؟`
      : `Are you sure you want to permanently delete record "${identifier}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/staff/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName,
          action: 'DELETE',
          id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete record.');
      }

      if (activeItem?.id === id) {
        setActiveItem(null);
      }

      await fetchAllData();
      alert(isAr ? 'تم حذف السجل بنجاح' : 'Record deleted successfully.');
    } catch (error: any) {
      console.error(error);
      alert(isAr ? `خطأ أثناء الحذف: ${error.message}` : `Error deleting record: ${error.message}`);
    }
  };

  const handleEditRecord = (item: any, type: string) => {
    if (type === 'eco_programs') {
      setEpForm({
        id: item.id,
        program: item.program,
        subType: item.subType || '',
        date: new Date(item.date).toISOString().split('T')[0],
        location: item.location,
        locationAr: item.locationAr || '',
        latitude: String(item.latitude),
        longitude: String(item.longitude),
        observerName: item.observerName,
        details: item.details || '',
        attachedFileUrl: item.attachedFileUrl || '',
      });
    } else if (type === 'stranding_cases') {
      setScForm({
        id: item.id,
        date: new Date(item.date).toISOString().split('T')[0],
        location: item.location,
        locationAr: item.locationAr || '',
        latitude: String(item.latitude),
        longitude: String(item.longitude),
        status: item.status,
        species: item.species,
        speciesAr: item.speciesAr || '',
        attachedFileUrl: item.attachedFileUrl || '',
        description: item.description || '',
      });
    } else if (type === 'sightings') {
      setSForm({
        id: item.id,
        date: new Date(item.date).toISOString().split('T')[0],
        location: item.location,
        locationAr: item.locationAr || '',
        latitude: String(item.latitude),
        longitude: String(item.longitude),
        species: item.species,
        speciesAr: item.speciesAr || '',
        count: String(item.count),
        notes: item.notes || '',
        observerName: item.observerName,
      });
    } else if (type === 'beach_surveys') {
      setBsForm({
        id: item.id,
        date: new Date(item.date).toISOString().split('T')[0],
        location: item.location,
        locationAr: item.locationAr || '',
        latitude: String(item.latitude),
        longitude: String(item.longitude),
        attachedFileUrl: item.attachedFileUrl || '',
        description: item.description || '',
      });
    }

    setActiveTab(type as any);
    setSubMode('form');
  };

  const resetForm = (type: string) => {
    if (type === 'eco_programs') {
      setEpForm({
        id: '',
        program: 'MANGROVE',
        subType: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        locationAr: '',
        latitude: '',
        longitude: '',
        observerName: '',
        details: '',
        attachedFileUrl: '',
      });
    } else if (type === 'stranding_cases') {
      setScForm({
        id: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        locationAr: '',
        latitude: '',
        longitude: '',
        status: 'ALIVE',
        species: '',
        speciesAr: '',
        attachedFileUrl: '',
        description: '',
      });
    } else if (type === 'sightings') {
      setSForm({
        id: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        locationAr: '',
        latitude: '',
        longitude: '',
        species: '',
        speciesAr: '',
        count: '1',
        notes: '',
        observerName: '',
      });
    } else if (type === 'beach_surveys') {
      setBsForm({
        id: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        locationAr: '',
        latitude: '',
        longitude: '',
        attachedFileUrl: '',
        description: '',
      });
    }
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US');
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-slate-400 font-medium text-sm">
          {isAr ? 'جاري تحميل البيانات البيئية...' : 'Loading environmental databases...'}
        </span>
      </div>
    );
  }

  // Active records counts
  const currentRecordsList = 
    activeTab === 'eco_programs' ? ecoPrograms :
    activeTab === 'stranding_cases' ? strandingCases :
    activeTab === 'sightings' ? sightings : beachSurveys;

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-700" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Coordinate Capture Toast (F5) */}
      <AnimatePresence>
        {coordsToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-teal-500/90 backdrop-blur-xl shadow-[0_0_30px_rgba(20,184,166,0.4)] border border-teal-400/30"
            dir="ltr"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MapPin size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-teal-900/80 uppercase tracking-widest">
                {isAr ? 'تم التقاط الإحداثيات' : 'Coordinates Captured'}
              </p>
              <p className="text-xs font-bold text-white font-mono">
                {coordsToast.lat}, {coordsToast.lng}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 pb-1 md:pb-2">
        <div className="space-y-1 md:space-y-1.5">
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                <Compass size={16} />
             </div>
             <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-teal-500">
               {isAr ? 'البيئة والاستدامة' : 'Ecology & Sustainability'}
             </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
            {isAr ? 'رصد البيئة البحرية والبرية' : 'Environmental Monitoring'}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium tracking-wide hidden md:block">
            {isAr ? 'إدارة برامج الرصد البيئي، حالات الجنوح، مشاهدات الكائنات النادرة، ومسح الشواطئ' : 'Manage ecological programs, stranding incidents, wildlife sightings, and beach surveys'}
          </p>
        </div>
      </div>

      {/* Statistics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-5">
        <Card className="p-3 md:p-5 border-none bg-th-surface2 backdrop-blur-xl group hover:bg-th-surface transition-all duration-500">
          <div className="flex items-center gap-2.5 md:gap-4">
            <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-teal-500/10 text-teal-400">
              <Activity size={isMobile ? 18 : 24} />
            </div>
            <div className="flex-1">
              <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-500 mb-0.5 md:mb-1">{isAr ? 'برامج الرصد' : 'Programs'}</p>
              <span className="text-lg md:text-2xl font-black text-white font-mono">{ecoPrograms.length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-5 border-none bg-th-surface2 backdrop-blur-xl group hover:bg-th-surface transition-all duration-500">
          <div className="flex items-center gap-2.5 md:gap-4">
            <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-rose-500/10 text-rose-400">
              <AlertCircle size={isMobile ? 18 : 24} />
            </div>
            <div className="flex-1">
              <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-500 mb-0.5 md:mb-1">{isAr ? 'حالات الجنوح' : 'Strandings'}</p>
              <span className="text-lg md:text-2xl font-black text-white font-mono">{strandingCases.length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-5 border-none bg-th-surface2 backdrop-blur-xl group hover:bg-th-surface transition-all duration-500">
          <div className="flex items-center gap-2.5 md:gap-4">
            <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Navigation size={isMobile ? 18 : 24} />
            </div>
            <div className="flex-1">
              <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-500 mb-0.5 md:mb-1">{isAr ? 'مشاهدات' : 'Sightings'}</p>
              <span className="text-lg md:text-2xl font-black text-white font-mono">{sightings.length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-5 border-none bg-th-surface2 backdrop-blur-xl group hover:bg-th-surface transition-all duration-500">
          <div className="flex items-center gap-2.5 md:gap-4">
            <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-amber-500/10 text-amber-400">
              <Waves size={isMobile ? 18 : 24} />
            </div>
            <div className="flex-1">
              <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-500 mb-0.5 md:mb-1">{isAr ? 'مسوحات' : 'Surveys'}</p>
              <span className="text-lg md:text-2xl font-black text-white font-mono">{beachSurveys.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile View Toggle: Map vs Data */}
      {isMobile && (
        <div className="flex gap-1 p-1 bg-th-surface2 backdrop-blur-xl border border-th-border rounded-xl">
          <button
            onClick={() => setMobilePanel('map')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
              mobilePanel === 'map'
                ? 'bg-teal-500 text-[#001529] shadow-lg'
                : 'text-th-muted hover:text-th-text hover:bg-th-surface2'
            }`}
          >
            <Map size={14} />
            {isAr ? 'الخريطة' : 'Map View'}
          </button>
          <button
            onClick={() => setMobilePanel('data')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
              mobilePanel === 'data'
                ? 'bg-teal-500 text-[#001529] shadow-lg'
                : 'text-th-muted hover:text-th-text hover:bg-th-surface2'
            }`}
          >
            <Database size={14} />
            {isAr ? 'البيانات' : 'Data Entry'}
          </button>
        </div>
      )}

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
        
        {/* Left Column: GIS Map (7 Cols) — hidden on mobile when mobilePanel !== 'map' */}
        <div className={`lg:col-span-7 space-y-3 md:space-y-4 ${isMobile && mobilePanel !== 'map' ? 'hidden' : ''}`}>
          <div className="h-[260px] md:h-[400px] lg:h-[550px] relative rounded-2xl overflow-hidden border border-th-border shadow-2xl">
            <EcoMap 
              items={allMapItems}
              activeItem={activeItem}
              onItemSelect={handleItemSelect}
              onMapClick={handleMapClick}
              lang={lang}
            />
          </div>

          <Card className="p-3 md:p-4 bg-th-surface border border-th-border rounded-2xl flex items-start gap-2.5 md:gap-3">
            <MapPin className="text-teal-400 shrink-0 mt-0.5" size={14} />
            <div>
              <h4 className="text-[10px] md:text-xs font-bold text-teal-400 uppercase tracking-widest mb-0.5 md:mb-1">
                {isAr ? 'التقاط الإحداثيات' : 'GIS Auto-Capture'}
              </h4>
              <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed font-medium">
                {isAr 
                  ? 'انقر على أي نقطة في الخريطة لاستخراج الإحداثيات وتعبئتها تلقائياً في الاستمارة.' 
                  : 'Tap on the map to capture coordinates. They auto-populate in the form fields.'}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Tabbed Forms and Views (5 Cols) */}
        <div className={`lg:col-span-5 space-y-4 md:space-y-6 ${isMobile && mobilePanel !== 'data' ? 'hidden' : ''}`}>
          
          {/* Main Tabs Navigation */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-th-surface2 backdrop-blur-xl border border-th-border rounded-xl md:rounded-2xl">
            {[
              { id: 'eco_programs', label: isAr ? 'برامج' : 'Programs', icon: Activity },
              { id: 'stranding_cases', label: isAr ? 'جنوح' : 'Stranding', icon: AlertCircle },
              { id: 'sightings', label: isAr ? 'رصد' : 'Sighting', icon: Compass },
              { id: 'beach_surveys', label: isAr ? 'مسح' : 'Beach', icon: Waves },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setActiveItem(null);
                  }}
                  className={`flex flex-col items-center justify-center py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all duration-300 gap-1 md:gap-1.5 ${
                    activeTab === tab.id 
                      ? 'bg-teal-500 text-[#001529] shadow-lg' 
                      : 'text-th-muted hover:text-th-text hover:bg-th-surface2'
                  }`}
                >
                  <Icon size={isMobile ? 13 : 14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form / List Mode Sub-Tabs */}
          <div className="flex items-center justify-between border-b border-th-border pb-2 md:pb-3">
            <h3 className="text-xs md:text-sm font-black text-white uppercase italic tracking-wider flex items-center gap-1.5 md:gap-2">
              <Layers size={isMobile ? 13 : 16} className="text-teal-400" />
              {activeTab === 'eco_programs' && (isAr ? 'البرامج البيئية' : 'Eco Programs')}
              {activeTab === 'stranding_cases' && (isAr ? 'حالات الجنوح' : 'Strandings')}
              {activeTab === 'sightings' && (isAr ? 'مشاهدات الكائنات' : 'Sightings')}
              {activeTab === 'beach_surveys' && (isAr ? 'مسح الشواطئ' : 'Beach Surveys')}
            </h3>

            <div className="flex gap-1 md:gap-2 p-0.5 bg-th-surface rounded-lg md:rounded-xl border border-th-border">
              <button
                onClick={() => setSubMode('form')}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
                  subMode === 'form' 
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isAr ? 'استمارة' : 'Form'}
              </button>
              <button
                onClick={() => setSubMode('list')}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
                  subMode === 'list' 
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isAr ? `السجلات (${currentRecordsList.length})` : `DB (${currentRecordsList.length})`}
              </button>
            </div>
          </div>

          {/* Animated Form container */}
          <AnimatePresence mode="wait">
            {subMode === 'form' ? (
              <motion.div
                key={`${activeTab}-form`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4 md:p-6 border-none bg-th-surface2 backdrop-blur-xl space-y-4 md:space-y-6">
                  
                  {/* Eco Programs Registration Form */}
                  {activeTab === 'eco_programs' && (
                    <form onSubmit={(e) => handleMutateSubmit(e, 'eco_programs')} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'البرنامج *' : 'Program Category *'}
                          </label>
                          <select
                            value={epForm.program}
                            onChange={(e) => setEpForm(prev => ({ ...prev, program: e.target.value }))}
                            className="w-full h-11 bg-th-input border border-th-border text-th-text rounded-xl px-3 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
                          >
                            <option value="MANGROVE">{isAr ? 'المانجروف' : 'Mangroves'}</option>
                            <option value="MARINE_CREATURES">{isAr ? 'الكائنات البحرية' : 'Marine Creatures'}</option>
                            <option value="CORAL_REEFS">{isAr ? 'الشعاب المرجانية' : 'Coral Reefs'}</option>
                            <option value="BIRDS">{isAr ? 'الطيور البحرية/المهاجرة' : 'Birds'}</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'النوع الفرعي' : 'Subtype / Species'}
                          </label>
                          <select
                            value={epForm.subType}
                            onChange={(e) => setEpForm(prev => ({ ...prev, subType: e.target.value }))}
                            className="w-full h-11 bg-th-input border border-th-border text-th-text rounded-xl px-3 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
                          >
                            <option value="">{isAr ? 'بدون (عام)' : 'None (General)'}</option>
                            <option value="DOLPHIN">{isAr ? 'الدلافين' : 'Dolphins'}</option>
                            <option value="TURTLE">{isAr ? 'السلاحف' : 'Turtles'}</option>
                            <option value="DUGONG">{isAr ? 'عروس البحر' : 'Dugongs'}</option>
                            <option value="SHARK">{isAr ? 'القروش' : 'Sharks'}</option>
                            <option value="FISH">{isAr ? 'الأسماك' : 'Fish'}</option>
                            <option value="MARINE_BIRD">{isAr ? 'طيور بحرية' : 'Marine Birds'}</option>
                            <option value="MIGRATORY_BIRD">{isAr ? 'طيور مهاجرة' : 'Migratory Birds'}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'التاريخ *' : 'Survey Date *'}
                          </label>
                          <Input 
                            type="date"
                            value={epForm.date}
                            onChange={(e) => setEpForm(prev => ({ ...prev, date: e.target.value }))}
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'المراقب الميداني *' : 'Observer Name *'}
                          </label>
                          <Input 
                            value={epForm.observerName}
                            onChange={(e) => setEpForm(prev => ({ ...prev, observerName: e.target.value }))}
                            placeholder="e.g. Sarah Hassan"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الموقع (EN) *' : 'Location (EN) *'}
                          </label>
                          <Input 
                            value={epForm.location}
                            onChange={(e) => setEpForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g. Samadai Reef"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الموقع (AR)' : 'Location (AR)'}
                          </label>
                          <Input 
                            value={epForm.locationAr}
                            onChange={(e) => setEpForm(prev => ({ ...prev, locationAr: e.target.value }))}
                            placeholder="مثال: شعب صمداي"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'خط العرض *' : 'Latitude *'}
                          </label>
                          <Input 
                            type="number"
                            step="0.000001"
                            value={epForm.latitude}
                            onChange={(e) => setEpForm(prev => ({ ...prev, latitude: e.target.value }))}
                            placeholder="e.g. 25.0123"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'خط الطول *' : 'Longitude *'}
                          </label>
                          <Input 
                            type="number"
                            step="0.000001"
                            value={epForm.longitude}
                            onChange={(e) => setEpForm(prev => ({ ...prev, longitude: e.target.value }))}
                            placeholder="e.g. 34.9789"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'ملف التقرير المرفق' : 'Report File / Attachment'}
                        </label>
                        <FileUpload 
                          endpoint="mediaUploader"
                          lang={lang}
                          onUploadBegin={() => setIsSubmitting(true)}
                          onUploadComplete={(files) => {
                            setEpForm(prev => ({ ...prev, attachedFileUrl: files[0]?.url || '' }));
                            setIsSubmitting(false);
                          }}
                          onUploadError={(err) => {
                            console.error(err);
                            setIsSubmitting(false);
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'تفاصيل الملاحظات' : 'Observation Details'}
                        </label>
                        <textarea
                          value={epForm.details}
                          onChange={(e) => setEpForm(prev => ({ ...prev, details: e.target.value }))}
                          placeholder={isAr ? 'أدخل تفاصيل حالة المعاينة...' : 'Enter survey observation details...'}
                          className="w-full h-24 bg-th-input border border-th-border text-th-text rounded-xl p-3 focus:outline-none focus:border-teal-500 text-xs"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="flex-1 bg-teal-600 hover:bg-teal-500 text-[#0c1628] font-black rounded-xl h-11"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin inline" size={16} /> : (epForm.id ? (isAr ? 'تحديث السجل' : 'Update Record') : (isAr ? 'حفظ السجل' : 'Save Record'))}
                        </Button>
                        {epForm.id && (
                          <Button 
                            type="button" 
                            intent="ghost"
                            onClick={() => resetForm('eco_programs')}
                            className="bg-white/5 border border-white/10 text-white rounded-xl h-11 px-4"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Stranding Cases Form */}
                  {activeTab === 'stranding_cases' && (
                    <form onSubmit={(e) => handleMutateSubmit(e, 'stranding_cases')} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الفصيلة بالإنجليزية *' : 'Species Name (EN) *'}
                          </label>
                          <Input 
                            value={scForm.species}
                            onChange={(e) => setScForm(prev => ({ ...prev, species: e.target.value }))}
                            placeholder="e.g. Green Sea Turtle"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الفصيلة بالعربية' : 'Species Name (AR)'}
                          </label>
                          <Input 
                            value={scForm.speciesAr}
                            onChange={(e) => setScForm(prev => ({ ...prev, speciesAr: e.target.value }))}
                            placeholder="مثال: سلحفاة بحرية خضراء"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الحالة *' : 'Status *'}
                          </label>
                          <select
                            value={scForm.status}
                            onChange={(e) => setScForm(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full h-11 bg-th-input border border-th-border text-th-text rounded-xl px-3 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
                          >
                            <option value="ALIVE">{isAr ? 'حي' : 'ALIVE'}</option>
                            <option value="DEAD">{isAr ? 'نافق (ميت)' : 'DEAD'}</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'التاريخ *' : 'Reporting Date *'}
                          </label>
                          <Input 
                            type="date"
                            value={scForm.date}
                            onChange={(e) => setScForm(prev => ({ ...prev, date: e.target.value }))}
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الموقع (EN) *' : 'Location (EN) *'}
                          </label>
                          <Input 
                            value={scForm.location}
                            onChange={(e) => setScForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g. Abu Dabbab Beach"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الموقع (AR)' : 'Location (AR)'}
                          </label>
                          <Input 
                            value={scForm.locationAr}
                            onChange={(e) => setScForm(prev => ({ ...prev, locationAr: e.target.value }))}
                            placeholder="مثال: شاطئ أبو دباب"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'خط العرض *' : 'Latitude *'}
                          </label>
                          <Input 
                            type="number"
                            step="0.000001"
                            value={scForm.latitude}
                            onChange={(e) => setScForm(prev => ({ ...prev, latitude: e.target.value }))}
                            placeholder="e.g. 25.3375"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'خط الطول *' : 'Longitude *'}
                          </label>
                          <Input 
                            type="number"
                            step="0.000001"
                            value={scForm.longitude}
                            onChange={(e) => setScForm(prev => ({ ...prev, longitude: e.target.value }))}
                            placeholder="e.g. 34.7369"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'صورة أو وثيقة مرفقة' : 'Attached Media / Case File'}
                        </label>
                        <FileUpload 
                          endpoint="mediaUploader"
                          lang={lang}
                          onUploadBegin={() => setIsSubmitting(true)}
                          onUploadComplete={(files) => {
                            setScForm(prev => ({ ...prev, attachedFileUrl: files[0]?.url || '' }));
                            setIsSubmitting(false);
                          }}
                          onUploadError={(err) => {
                            console.error(err);
                            setIsSubmitting(false);
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'وصف الحالة' : 'Case Description'}
                        </label>
                        <textarea
                          value={scForm.description}
                          onChange={(e) => setScForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder={isAr ? 'أدخل تفاصيل الحالة وعملية الإنقاذ أو أسباب النفوق...' : 'Describe case, rescue operations or cause of death...'}
                          className="w-full h-24 bg-th-input border border-th-border text-th-text rounded-xl p-3 focus:outline-none focus:border-teal-500 text-xs"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="flex-1 bg-teal-600 hover:bg-teal-500 text-[#0c1628] font-black rounded-xl h-11"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin inline" size={16} /> : (scForm.id ? (isAr ? 'تحديث الحالة' : 'Update Case') : (isAr ? 'حفظ الحالة' : 'Save Case'))}
                        </Button>
                        {scForm.id && (
                          <Button 
                            type="button" 
                            intent="ghost"
                            onClick={() => resetForm('stranding_cases')}
                            className="bg-white/5 border border-white/10 text-white rounded-xl h-11 px-4"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Species Sightings Form */}
                  {activeTab === 'sightings' && (
                    <form onSubmit={(e) => handleMutateSubmit(e, 'sightings')} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الكائن بالإنجليزية *' : 'Species (EN) *'}
                          </label>
                          <Input 
                            value={sForm.species}
                            onChange={(e) => setSForm(prev => ({ ...prev, species: e.target.value }))}
                            placeholder="e.g. Whale Shark"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الكائن بالعربية' : 'Species (AR)'}
                          </label>
                          <Input 
                            value={sForm.speciesAr}
                            onChange={(e) => setSForm(prev => ({ ...prev, speciesAr: e.target.value }))}
                            placeholder="مثال: القرش الحوت"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'العدد المرصود *' : 'Number Observed *'}
                          </label>
                          <Input 
                            type="number"
                            min="1"
                            value={sForm.count}
                            onChange={(e) => setSForm(prev => ({ ...prev, count: e.target.value }))}
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'تاريخ الرصد *' : 'Sighting Date *'}
                          </label>
                          <Input 
                            type="date"
                            value={sForm.date}
                            onChange={(e) => setSForm(prev => ({ ...prev, date: e.target.value }))}
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الموقع (EN) *' : 'Location (EN) *'}
                          </label>
                          <Input 
                            value={sForm.location}
                            onChange={(e) => setSForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g. Marsa Alam Bay"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الموقع (AR)' : 'Location (AR)'}
                          </label>
                          <Input 
                            value={sForm.locationAr}
                            onChange={(e) => setSForm(prev => ({ ...prev, locationAr: e.target.value }))}
                            placeholder="مثال: خليج مرسى علم"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'خط العرض *' : 'Latitude *'}
                          </label>
                          <Input 
                            type="number"
                            step="0.000001"
                            value={sForm.latitude}
                            onChange={(e) => setSForm(prev => ({ ...prev, latitude: e.target.value }))}
                            placeholder="e.g. 25.0645"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'خط الطول *' : 'Longitude *'}
                          </label>
                          <Input 
                            type="number"
                            step="0.000001"
                            value={sForm.longitude}
                            onChange={(e) => setSForm(prev => ({ ...prev, longitude: e.target.value }))}
                            placeholder="e.g. 34.8921"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'اسم الراصد الميداني *' : 'Observer/Researcher Name *'}
                        </label>
                        <Input 
                          value={sForm.observerName}
                          onChange={(e) => setSForm(prev => ({ ...prev, observerName: e.target.value }))}
                          placeholder="e.g. Ahmed Ali"
                          className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'ملاحظات إضافية' : 'Field Notes'}
                        </label>
                        <textarea
                          value={sForm.notes}
                          onChange={(e) => setSForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder={isAr ? 'سلوك الكائن، الحجم المقدر، الحالة الصحية العامة...' : 'Sighting behavior, estimated size, general health condition...'}
                          className="w-full h-24 bg-th-input border border-th-border text-th-text rounded-xl p-3 focus:outline-none focus:border-teal-500 text-xs"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="flex-1 bg-teal-600 hover:bg-teal-500 text-[#0c1628] font-black rounded-xl h-11"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin inline" size={16} /> : (sForm.id ? (isAr ? 'تحديث الرصد' : 'Update Sighting') : (isAr ? 'حفظ الرصد' : 'Save Sighting'))}
                        </Button>
                        {sForm.id && (
                          <Button 
                            type="button" 
                            intent="ghost"
                            onClick={() => resetForm('sightings')}
                            className="bg-white/5 border border-white/10 text-white rounded-xl h-11 px-4"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Beach Surveys Form */}
                  {activeTab === 'beach_surveys' && (
                    <form onSubmit={(e) => handleMutateSubmit(e, 'beach_surveys')} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الموقع (EN) *' : 'Location (EN) *'}
                          </label>
                          <Input 
                            value={bsForm.location}
                            onChange={(e) => setBsForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g. Wadi El Gemal Beach"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'الموقع (AR)' : 'Location (AR)'}
                          </label>
                          <Input 
                            value={bsForm.locationAr}
                            onChange={(e) => setBsForm(prev => ({ ...prev, locationAr: e.target.value }))}
                            placeholder="مثال: شاطئ وادي الجمال"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'خط العرض *' : 'Latitude *'}
                          </label>
                          <Input 
                            type="number"
                            step="0.000001"
                            value={bsForm.latitude}
                            onChange={(e) => setBsForm(prev => ({ ...prev, latitude: e.target.value }))}
                            placeholder="e.g. 25.0123"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'خط الطول *' : 'Longitude *'}
                          </label>
                          <Input 
                            type="number"
                            step="0.000001"
                            value={bsForm.longitude}
                            onChange={(e) => setBsForm(prev => ({ ...prev, longitude: e.target.value }))}
                            placeholder="e.g. 34.8567"
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1 col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {isAr ? 'تاريخ المسح *' : 'Survey Date *'}
                          </label>
                          <Input 
                            type="date"
                            value={bsForm.date}
                            onChange={(e) => setBsForm(prev => ({ ...prev, date: e.target.value }))}
                            className="bg-[#050b14]/75 border-white/10 text-white rounded-xl text-xs h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'وثيقة مسح النفايات/التقرير المرفق' : 'Attached Report / Survey Document'}
                        </label>
                        <FileUpload 
                          endpoint="mediaUploader"
                          lang={lang}
                          onUploadBegin={() => setIsSubmitting(true)}
                          onUploadComplete={(files) => {
                            setBsForm(prev => ({ ...prev, attachedFileUrl: files[0]?.url || '' }));
                            setIsSubmitting(false);
                          }}
                          onUploadError={(err) => {
                            console.error(err);
                            setIsSubmitting(false);
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {isAr ? 'وصف المسح والنتائج' : 'Survey Findings & Description'}
                        </label>
                        <textarea
                          value={bsForm.description}
                          onChange={(e) => setBsForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder={isAr ? 'أدخل كمية النفايات البلاستيكية أو حالة الطيور البحرية المهاجرة في هذا القطاع...' : 'Detail microplastics levels, human impact, bird nesting activities...'}
                          className="w-full h-24 bg-th-input border border-th-border text-th-text rounded-xl p-3 focus:outline-none focus:border-teal-500 text-xs"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="flex-1 bg-teal-600 hover:bg-teal-500 text-[#0c1628] font-black rounded-xl h-11"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin inline" size={16} /> : (bsForm.id ? (isAr ? 'تحديث المسح' : 'Update Survey') : (isAr ? 'حفظ المسح' : 'Save Survey'))}
                        </Button>
                        {bsForm.id && (
                          <Button 
                            type="button" 
                            intent="ghost"
                            onClick={() => resetForm('beach_surveys')}
                            className="bg-white/5 border border-white/10 text-white rounded-xl h-11 px-4"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </form>
                  )}

                </Card>
              </motion.div>
            ) : (
              
              /* DATABASE RECORDS LIST VIEW */
              <motion.div
                key={`${activeTab}-list`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 max-h-[600px] overflow-y-auto pr-1 select-none"
              >
                {currentRecordsList.map((item) => (
                  <Card 
                    key={item.id}
                    onClick={() => {
                      // Find the exact item from allMapItems to get latitude/longitude perfectly parsed
                      const mapItem = allMapItems.find(m => m.id === item.id) || item;
                      setActiveItem(mapItem as EcoMapItem);
                      setIsReportModalOpen(true);
                    }}
                    className={`p-5 border-none bg-th-surface2 backdrop-blur-xl group hover:bg-th-surface transition-all duration-300 relative border-l-4 cursor-pointer ${
                      activeItem?.id === item.id ? 'ring-1 ring-teal-500 bg-slate-900/80' : ''
                    } ${
                      activeTab === 'eco_programs' ? 'border-l-teal-500' :
                      activeTab === 'stranding_cases' ? (item.status === 'ALIVE' ? 'border-l-emerald-500' : 'border-l-rose-500') :
                      activeTab === 'sightings' ? 'border-l-indigo-500' : 'border-l-amber-500'
                    }`}
                  >
                    
                    {/* Header values */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded tracking-tighter">
                            {item.id}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-black text-white mt-1 group-hover:text-teal-400 transition-colors uppercase italic tracking-tight">
                          {activeTab === 'eco_programs' && (isAr ? `برنامج: ${item.program}` : `Program: ${item.program}`)}
                          {activeTab === 'stranding_cases' && (isAr ? `جنوح: ${item.speciesAr || item.species}` : `Stranding: ${item.species}`)}
                          {activeTab === 'sightings' && (isAr ? `مشاهدة: ${item.speciesAr || item.species}` : `Sighting: ${item.species}`)}
                          {activeTab === 'beach_surveys' && (isAr ? `مسح شاطئي` : `Beach Survey`)}
                        </h4>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button 
                          onClick={() => handleEditRecord(item, activeTab)}
                          className="p-2 rounded-lg bg-white/5 border border-transparent hover:border-white/10 text-th-muted hover:text-th-text transition-all"
                          title={isAr ? 'تعديل السجل' : 'Edit Record'}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(
                            activeTab, 
                            item.id, 
                            activeTab === 'eco_programs' ? item.program :
                            activeTab === 'stranding_cases' ? item.species :
                            activeTab === 'sightings' ? item.species : item.location
                          )}
                          className="p-2 rounded-lg bg-white/5 border border-transparent hover:border-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"
                          title={isAr ? 'حذف السجل' : 'Delete Record'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Content */}
                    <div className="space-y-1.5 text-xs text-slate-400 border-t border-white/5 pt-2 font-medium">
                      
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">📍 {isAr ? 'الموقع:' : 'Location:'}</span>
                        <span className="text-slate-200">
                          {isAr ? (item.locationAr || item.location) : item.location}
                        </span>
                      </div>

                      {activeTab === 'eco_programs' && (
                        <>
                          {item.subType && (
                            <div>
                              <span className="text-slate-500">{isAr ? 'النوع الفرعي:' : 'Subtype:'}</span>{' '}
                              <span className="text-slate-300">{item.subType}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-500">{isAr ? 'بواسطة:' : 'By:'}</span>{' '}
                            <span className="text-slate-300">{item.observerName}</span>
                          </div>
                          {item.details && (
                            <p className="text-[11px] text-slate-500 italic leading-snug pt-1">
                              "{item.details}"
                            </p>
                          )}
                        </>
                      )}

                      {activeTab === 'stranding_cases' && (
                        <>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-slate-500">{isAr ? 'حالة الكائن:' : 'Animal Status:'}</span>
                            <Badge className={item.status === 'ALIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}>
                              {item.status === 'ALIVE' 
                                ? (isAr ? 'حي' : 'ALIVE') 
                                : (isAr ? 'نافق (ميت)' : 'DEAD')}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 italic leading-snug pt-1">
                              "{item.description}"
                            </p>
                          )}
                        </>
                      )}

                      {activeTab === 'sightings' && (
                        <>
                          <div>
                            <span className="text-slate-500">{isAr ? 'العدد المرصود:' : 'Count:'}</span>{' '}
                            <span className="text-indigo-400 font-bold font-mono">{item.count}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">{isAr ? 'بواسطة:' : 'By:'}</span>{' '}
                            <span className="text-slate-300">{item.observerName}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-slate-500 italic leading-snug pt-1">
                              "{item.notes}"
                            </p>
                          )}
                        </>
                      )}

                      {activeTab === 'beach_surveys' && (
                        <>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 italic leading-snug pt-1">
                              "{item.description}"
                            </p>
                          )}
                        </>
                      )}

                      {/* Coordinates and Attachment Files footer */}
                      <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                        <div>
                          Lat: {Number(item.latitude).toFixed(4)}, Lng: {Number(item.longitude).toFixed(4)}
                        </div>

                        {item.attachedFileUrl && (
                          <a 
                            href={item.attachedFileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-bold font-sans uppercase tracking-tight"
                          >
                            <span>{isAr ? 'المستند المرفق' : 'Media / PDF'}</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>

                    </div>
                  </Card>
                ))}

                {currentRecordsList.length === 0 && (
                  <div className="text-center py-12 text-slate-600 bg-slate-900/10 border border-dashed border-white/5 rounded-2xl font-bold text-xs uppercase tracking-widest">
                    {isAr ? 'لا توجد سجلات رصد مسجلة بعد' : 'No records found in database.'}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        item={activeItem} 
        lang={lang} 
      />
    </div>
  );
}
