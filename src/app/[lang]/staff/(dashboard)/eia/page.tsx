'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { 
  FileText, 
  Upload, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  User, 
  MapPin, 
  FolderOpen,
  Waves,
  Eye,
  Loader2,
  DollarSign,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  Edit2,
  Trash2,
  Download,
  Check,
  X,
  ShieldAlert,
  Clock,
  Compass
} from 'lucide-react';
import { MapItem } from '@/components/eia/MapComponent';
import EIAReportModal from './EIAReportModal';

// Dynamically import Leaflet Map Component to bypass Next.js SSR issues
const MapComponent = dynamic(() => import('@/components/eia/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0d1e36] flex items-center justify-center rounded-2xl border border-white/10">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-teal-400" size={32} />
        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading GIS Interface...</span>
      </div>
    </div>
  )
});

interface CostFile {
  id?: string;
  name: string;
  url: string;
}

interface Cost {
  id: string;
  subject: string;
  details: string;
  date: string;
  status: 'UNANSWERED' | 'ANSWERED';
  files: CostFile[];
}

interface Inspection {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  date: string;
  inspectorName: string;
  studyFileUrl?: string | null;
  reportFileUrl?: string | null;
}

interface ViolationFile {
  id?: string;
  name: string;
  url: string;
}

interface Violation {
  id: string;
  type: string;
  date: string;
  locationName: string;
  latitude: number;
  longitude: number;
  entityType: 'PROJECT' | 'PERSON';
  entityName: string;
  files?: ViolationFile[];
}

interface Accident {
  id: string;
  type: string;
  locationName: string;
  latitude: number;
  longitude: number;
  date: string;
  description: string;
  reportFileUrl?: string | null;
}

export default function EIAPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  
  // Mobile responsiveness states
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobilePanel, setMobilePanel] = useState<'map' | 'data'>('data');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'costs' | 'inspections' | 'violations' | 'accidents'>('costs');
  
  // Data States
  const [costs, setCosts] = useState<Cost[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeMapItem, setActiveMapItem] = useState<MapItem | null>(null);

  // Form toggles
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Advanced Filters
  // 1. Costs filters
  const [searchCostSubject, setSearchCostSubject] = useState<string>('');
  const [searchCostDate, setSearchCostDate] = useState<string>('');
  const [searchCostStatus, setSearchCostStatus] = useState<string>('ALL');

  // 2. Inspections filters
  const [inspectorFilter, setInspectorFilter] = useState<string>('');
  const [searchInspectionLoc, setSearchInspectionLoc] = useState<string>('');
  const [searchInspectionDate, setSearchInspectionDate] = useState<string>('');
  const [searchInspectionDocStatus, setSearchInspectionDocStatus] = useState<string>('ALL');

  // 3. Violations filters
  const [searchViolationType, setSearchViolationType] = useState<string>('');
  const [searchViolationLocation, setSearchViolationLocation] = useState<string>('');
  const [searchViolationDate, setSearchViolationDate] = useState<string>('');
  const [searchViolationEntity, setSearchViolationEntity] = useState<string>('');
  const [searchViolationEntityType, setSearchViolationEntityType] = useState<string>('ALL');

  // 4. Accidents filters
  const [searchAccidentType, setSearchAccidentType] = useState<string>('');
  const [searchAccidentLocation, setSearchAccidentLocation] = useState<string>('');
  const [searchAccidentDate, setSearchAccidentDate] = useState<string>('');
  const [searchAccidentDesc, setSearchAccidentDesc] = useState<string>('');

  // Form values
  // 1. Costs form
  const [costSubject, setCostSubject] = useState('');
  const [costDetails, setCostDetails] = useState('');
  const [costDate, setCostDate] = useState('');
  const [costFiles, setCostFiles] = useState<{ name: string; url: string }[]>([]);

  // 2. Inspections form
  const [inspLocName, setInspLocName] = useState('');
  const [inspLat, setInspLat] = useState('');
  const [inspLng, setInspLng] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [inspInspector, setInspInspector] = useState('');
  const [inspStudyFile, setInspStudyFile] = useState<string | null>(null);
  const [inspReportFile, setInspReportFile] = useState<string | null>(null);

  // 3. Violations form
  const [violType, setViolType] = useState('ردم وتغير في حرم الشاطئ');
  const [violDate, setViolDate] = useState('');
  const [violLocName, setViolLocName] = useState('');
  const [violLat, setViolLat] = useState('');
  const [violLng, setViolLng] = useState('');
  const [violEntityType, setViolEntityType] = useState<'PROJECT' | 'PERSON'>('PROJECT');
  const [violEntityName, setViolEntityName] = useState('');
  const [violFiles, setViolFiles] = useState<{ name: string; url: string }[]>([]);

  // 4. Accidents form
  const [accType, setAccType] = useState('حوادث شحط أو ربط على الشعاب');
  const [accLocName, setAccLocName] = useState('');
  const [accLat, setAccLat] = useState('');
  const [accLng, setAccLng] = useState('');
  const [accDate, setAccDate] = useState('');
  const [accDesc, setAccDesc] = useState('');
  const [accReportFile, setAccReportFile] = useState<string | null>(null);

  // Details View States
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [selectedDetailType, setSelectedDetailType] = useState<'costs' | 'inspections' | 'violations' | 'accidents' | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'RESEARCHER' | 'SUPERVISOR'>('RESEARCHER');
  
  // Edit Detail Form States
  const [isEditingDetail, setIsEditingDetail] = useState<boolean>(false);
  const [editSubject, setEditSubject] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocationName, setEditLocationName] = useState('');
  const [editLatitude, setEditLatitude] = useState('');
  const [editLongitude, setEditLongitude] = useState('');
  const [editInspectorName, setEditInspectorName] = useState('');
  const [editType, setEditType] = useState('');
  const [editEntityType, setEditEntityType] = useState<'PROJECT' | 'PERSON'>('PROJECT');
  const [editEntityName, setEditEntityName] = useState('');
  const [editStudyFileUrl, setEditStudyFileUrl] = useState<string | null>(null);
  const [editReportFileUrl, setEditReportFileUrl] = useState<string | null>(null);
  const [editFiles, setEditFiles] = useState<{ name: string; url: string }[]>([]);
  const [editCostStatus, setEditCostStatus] = useState<'UNANSWERED' | 'ANSWERED'>('UNANSWERED');

  // Deletion Request States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteReasonText, setDeleteReasonText] = useState('');

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCosts, resInsps, resViols, resAccs] = await Promise.all([
        fetch('/api/eia/costs').then(res => res.json()),
        fetch('/api/eia/inspections').then(res => res.json()),
        fetch('/api/eia/violations').then(res => res.json()),
        fetch('/api/eia/accidents').then(res => res.json())
      ]);

      setCosts(Array.isArray(resCosts) ? resCosts : []);
      setInspections(Array.isArray(resInsps) ? resInsps : []);
      setViolations(Array.isArray(resViols) ? resViols : []);
      setAccidents(Array.isArray(resAccs) ? resAccs : []);
    } catch (error) {
      console.error('Error fetching EIA data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string, name: string) => void) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    
    setSubmitting(true);
    try {
      const file = filesList[0];
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        callback(data.url, file.name);
      } else {
        alert(isArabic ? 'فشل رفع الملف' : 'File upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(isArabic ? 'حدث خطأ أثناء الرفع' : 'Error occurred during upload');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle cost status
  const toggleCostStatus = async (id: string, currentStatus: 'UNANSWERED' | 'ANSWERED') => {
    const newStatus = currentStatus === 'UNANSWERED' ? 'ANSWERED' : 'UNANSWERED';
    try {
      const res = await fetch('/api/eia/costs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setCosts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Form submits
  const handleCostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costSubject || !costDetails || !costDate) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/eia/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: costSubject,
          details: costDetails,
          date: costDate,
          status: 'UNANSWERED',
          files: costFiles
        })
      });
      if (res.ok) {
        const newCost = await res.json();
        setCosts(prev => [newCost, ...prev]);
        // Reset form
        setCostSubject('');
        setCostDetails('');
        setCostDate('');
        setCostFiles([]);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspLocName || !inspLat || !inspLng || !inspDate || !inspInspector) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/eia/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: inspLocName,
          latitude: parseFloat(inspLat),
          longitude: parseFloat(inspLng),
          date: inspDate,
          inspectorName: inspInspector,
          studyFileUrl: inspStudyFile,
          reportFileUrl: inspReportFile
        })
      });
      if (res.ok) {
        const newInsp = await res.json();
        setInspections(prev => [newInsp, ...prev]);
        setInspLocName('');
        setInspLat('');
        setInspLng('');
        setInspDate('');
        setInspInspector('');
        setInspStudyFile(null);
        setInspReportFile(null);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViolationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!violType || !violDate || !violLocName || !violLat || !violLng || !violEntityName) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/eia/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: violType,
          date: violDate,
          locationName: violLocName,
          latitude: parseFloat(violLat),
          longitude: parseFloat(violLng),
          entityType: violEntityType,
          entityName: violEntityName,
          files: violFiles
        })
      });
      if (res.ok) {
        const newViol = await res.json();
        setViolations(prev => [newViol, ...prev]);
        setViolDate('');
        setViolLocName('');
        setViolLat('');
        setViolLng('');
        setViolEntityName('');
        setViolFiles([]);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accType || !accLocName || !accLat || !accLng || !accDate || !accDesc) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/eia/accidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: accType,
          locationName: accLocName,
          latitude: parseFloat(accLat),
          longitude: parseFloat(accLng),
          date: accDate,
          description: accDesc,
          reportFileUrl: accReportFile
        })
      });
      if (res.ok) {
        const newAcc = await res.json();
        setAccidents(prev => [newAcc, ...prev]);
        setAccLocName('');
        setAccLat('');
        setAccLng('');
        setAccDate('');
        setAccDesc('');
        setAccReportFile(null);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // EIA Details View Workflows
  const startEditing = () => {
    if (!selectedDetailItem) return;
    setIsEditingDetail(true);
    setEditDate(new Date(selectedDetailItem.date).toISOString().split('T')[0]);
    
    if (selectedDetailType === 'costs') {
      setEditSubject(selectedDetailItem.subject);
      setEditDetails(selectedDetailItem.details);
      setEditFiles(selectedDetailItem.files || []);
      setEditCostStatus(selectedDetailItem.status);
    } else if (selectedDetailType === 'inspections') {
      setEditLocationName(selectedDetailItem.locationName);
      setEditLatitude(selectedDetailItem.latitude.toString());
      setEditLongitude(selectedDetailItem.longitude.toString());
      setEditInspectorName(selectedDetailItem.inspectorName);
      setEditStudyFileUrl(selectedDetailItem.studyFileUrl);
      setEditReportFileUrl(selectedDetailItem.reportFileUrl);
    } else if (selectedDetailType === 'violations') {
      setEditType(selectedDetailItem.type);
      setEditLocationName(selectedDetailItem.locationName);
      setEditLatitude(selectedDetailItem.latitude.toString());
      setEditLongitude(selectedDetailItem.longitude.toString());
      setEditEntityType(selectedDetailItem.entityType);
      setEditEntityName(selectedDetailItem.entityName);
      setEditFiles(selectedDetailItem.files || []);
    } else if (selectedDetailType === 'accidents') {
      setEditType(selectedDetailItem.type);
      setEditLocationName(selectedDetailItem.locationName);
      setEditLatitude(selectedDetailItem.latitude.toString());
      setEditLongitude(selectedDetailItem.longitude.toString());
      setEditDetails(selectedDetailItem.description);
      setEditReportFileUrl(selectedDetailItem.reportFileUrl);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetailItem || !selectedDetailType) return;
    setSubmitting(true);
    try {
      let body: any = {
        id: selectedDetailItem.id,
        action: 'EDIT',
        user: isArabic ? 'مصطفى لايق' : 'M. Layaq',
        date: editDate,
      };

      if (selectedDetailType === 'costs') {
        body.subject = editSubject;
        body.details = editDetails;
        body.files = editFiles;
        body.status = editCostStatus;
      } else if (selectedDetailType === 'inspections') {
        body.locationName = editLocationName;
        body.latitude = parseFloat(editLatitude);
        body.longitude = parseFloat(editLongitude);
        body.inspectorName = editInspectorName;
        body.studyFileUrl = editStudyFileUrl;
        body.reportFileUrl = editReportFileUrl;
      } else if (selectedDetailType === 'violations') {
        body.type = editType;
        body.locationName = editLocationName;
        body.latitude = parseFloat(editLatitude);
        body.longitude = parseFloat(editLongitude);
        body.entityType = editEntityType;
        body.entityName = editEntityName;
        body.files = editFiles;
      } else if (selectedDetailType === 'accidents') {
        body.type = editType;
        body.locationName = editLocationName;
        body.latitude = parseFloat(editLatitude);
        body.longitude = parseFloat(editLongitude);
        body.description = editDetails;
        body.reportFileUrl = editReportFileUrl;
      }

      const res = await fetch(`/api/eia/${selectedDetailType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const updatedItem = await res.json();
        setSelectedDetailItem(updatedItem);
        setIsEditingDetail(false);
        
        // Update state arrays
        if (selectedDetailType === 'costs') {
          setCosts(prev => prev.map(c => c.id === updatedItem.id ? updatedItem : c));
        } else if (selectedDetailType === 'inspections') {
          setInspections(prev => prev.map(c => c.id === updatedItem.id ? updatedItem : c));
        } else if (selectedDetailType === 'violations') {
          setViolations(prev => prev.map(c => c.id === updatedItem.id ? updatedItem : c));
        } else if (selectedDetailType === 'accidents') {
          setAccidents(prev => prev.map(c => c.id === updatedItem.id ? updatedItem : c));
        }
      }
    } catch (err) {
      console.error('Error saving edits:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAction = async () => {
    if (!selectedDetailItem || !selectedDetailType) return;
    setSubmitting(true);
    try {
      const isSupervisor = currentUserRole === 'SUPERVISOR';
      let body: any = {
        id: selectedDetailItem.id,
        user: isArabic ? 'مصطفى لايق' : 'M. Layaq',
      };

      if (isSupervisor) {
        body.action = 'APPROVE_DELETE';
      } else {
        body.action = 'REQUEST_DELETE';
        body.reason = deleteReasonText || (isArabic ? 'طلب حذف السجل للمراجعة والتدقيق' : 'Record deletion requested for audit review');
      }

      const res = await fetch(`/api/eia/${selectedDetailType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        if (isSupervisor && data.deleted) {
          // Remove from state lists
          if (selectedDetailType === 'costs') {
            setCosts(prev => prev.filter(c => c.id !== selectedDetailItem.id));
          } else if (selectedDetailType === 'inspections') {
            setInspections(prev => prev.filter(c => c.id !== selectedDetailItem.id));
          } else if (selectedDetailType === 'violations') {
            setViolations(prev => prev.filter(c => c.id !== selectedDetailItem.id));
          } else if (selectedDetailType === 'accidents') {
            setAccidents(prev => prev.filter(c => c.id !== selectedDetailItem.id));
          }
          setSelectedDetailItem(null);
          setSelectedDetailType(null);
        } else {
          // Request submitted, show updated item with pending flag
          setSelectedDetailItem(data);
          if (selectedDetailType === 'costs') {
            setCosts(prev => prev.map(c => c.id === data.id ? data : c));
          } else if (selectedDetailType === 'inspections') {
            setInspections(prev => prev.map(c => c.id === data.id ? data : c));
          } else if (selectedDetailType === 'violations') {
            setViolations(prev => prev.map(c => c.id === data.id ? data : c));
          } else if (selectedDetailType === 'accidents') {
            setAccidents(prev => prev.map(c => c.id === data.id ? data : c));
          }
        }
        setShowDeleteConfirm(false);
        setDeleteReasonText('');
      }
    } catch (err) {
      console.error('Error handling delete action:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectDeleteRequest = async () => {
    if (!selectedDetailItem || !selectedDetailType) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/eia/${selectedDetailType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDetailItem.id,
          action: 'REJECT_DELETE',
          user: isArabic ? 'مصطفى لايق' : 'M. Layaq'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedDetailItem(data);
        if (selectedDetailType === 'costs') {
          setCosts(prev => prev.map(c => c.id === data.id ? data : c));
        } else if (selectedDetailType === 'inspections') {
          setInspections(prev => prev.map(c => c.id === data.id ? data : c));
        } else if (selectedDetailType === 'violations') {
          setViolations(prev => prev.map(c => c.id === data.id ? data : c));
        } else if (selectedDetailType === 'accidents') {
          setAccidents(prev => prev.map(c => c.id === data.id ? data : c));
        }
      }
    } catch (err) {
      console.error('Error rejecting delete request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Convert DB items to map markers format (dynamically respects active filters)
  const getMapItems = (): MapItem[] => {
    const items: MapItem[] = [];

    // Inspections -> Map Items (filtered)
    filteredInspections.forEach(item => {
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

    // Violations -> Map Items (filtered)
    filteredViolations.forEach(item => {
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

    // Accidents -> Map Items (filtered)
    filteredAccidents.forEach(item => {
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
  };

  // Advanced search filtering
  // 1. Costs filtering
  const filteredCosts = costs.filter(cost => {
    const matchSubject = !searchCostSubject || 
      cost.subject.toLowerCase().includes(searchCostSubject.toLowerCase()) || 
      cost.details.toLowerCase().includes(searchCostSubject.toLowerCase());
    
    let matchDate = true;
    if (searchCostDate) {
      const searchD = new Date(searchCostDate).toDateString();
      const costD = new Date(cost.date).toDateString();
      matchDate = searchD === costD;
    }

    const matchStatus = !searchCostStatus || searchCostStatus === 'ALL' || cost.status === searchCostStatus;

    return matchSubject && matchDate && matchStatus;
  });

  // 2. Inspections filtering
  const filteredInspections = inspections.filter(ins => {
    const matchInspector = !inspectorFilter || ins.inspectorName.toLowerCase().includes(inspectorFilter.toLowerCase());
    const matchLoc = !searchInspectionLoc || ins.locationName.toLowerCase().includes(searchInspectionLoc.toLowerCase());
    
    let matchDate = true;
    if (searchInspectionDate) {
      const searchD = new Date(searchInspectionDate).toDateString();
      const insD = new Date(ins.date).toDateString();
      matchDate = searchD === insD;
    }

    let matchDoc = true;
    if (searchInspectionDocStatus && searchInspectionDocStatus !== 'ALL') {
      if (searchInspectionDocStatus === 'STUDY') {
        matchDoc = !!ins.studyFileUrl;
      } else if (searchInspectionDocStatus === 'REPORT') {
        matchDoc = !!ins.reportFileUrl;
      } else if (searchInspectionDocStatus === 'BOTH') {
        matchDoc = !!ins.studyFileUrl && !!ins.reportFileUrl;
      } else if (searchInspectionDocStatus === 'NONE') {
        matchDoc = !ins.studyFileUrl && !ins.reportFileUrl;
      }
    }

    return matchInspector && matchLoc && matchDate && matchDoc;
  });

  // 3. Violations filtering
  const filteredViolations = violations.filter(v => {
    const matchType = !searchViolationType || v.type === searchViolationType;
    const matchLoc = !searchViolationLocation || v.locationName.toLowerCase().includes(searchViolationLocation.toLowerCase());
    
    let matchDate = true;
    if (searchViolationDate) {
      const searchD = new Date(searchViolationDate).toDateString();
      const violD = new Date(v.date).toDateString();
      matchDate = searchD === violD;
    }

    const matchEntityName = !searchViolationEntity || v.entityName.toLowerCase().includes(searchViolationEntity.toLowerCase());
    const matchEntityType = !searchViolationEntityType || searchViolationEntityType === 'ALL' || v.entityType === searchViolationEntityType;

    return matchType && matchLoc && matchDate && matchEntityName && matchEntityType;
  });

  // 4. Accidents filtering
  const filteredAccidents = accidents.filter(acc => {
    const matchType = !searchAccidentType || acc.type === searchAccidentType;
    const matchLoc = !searchAccidentLocation || acc.locationName.toLowerCase().includes(searchAccidentLocation.toLowerCase());
    
    let matchDate = true;
    if (searchAccidentDate) {
      const searchD = new Date(searchAccidentDate).toDateString();
      const accD = new Date(acc.date).toDateString();
      matchDate = searchD === accD;
    }

    const matchDesc = !searchAccidentDesc || acc.description.toLowerCase().includes(searchAccidentDesc.toLowerCase());

    return matchType && matchLoc && matchDate && matchDesc;
  });

  const mapItems = getMapItems();

  const handleSelectRecord = (item: MapItem | any) => {
    // Find the item in our list of map markers
    const targetMapItem = mapItems.find(m => m.id === item.id && m.dataType === (item.dataType || activeTab.slice(0, -1)));
    if (targetMapItem) {
      setActiveMapItem(targetMapItem);
    } else {
      // Direct formatting
      const dataTypeMap = activeTab === 'inspections' ? 'inspection' : activeTab === 'violations' ? 'violation' : 'accident';
      setActiveMapItem({
        id: item.id,
        dataType: dataTypeMap as any,
        latitude: item.latitude,
        longitude: item.longitude,
        locationName: item.locationName,
        type: item.type || item.locationName,
        date: item.date,
        details: item.description || item.inspectorName || item.entityName,
        ...item
      });
    }
    if (isMobile) {
      setMobilePanel('map');
    }
  };

  const handleOpenDetail = (item: any, type: 'costs' | 'inspections' | 'violations' | 'accidents') => {
    setSelectedDetailItem(item);
    setSelectedDetailType(type);
    setIsReportModalOpen(true);
    
    // Also update map highlight for location-aware items
    if (item.latitude && item.longitude) {
      const dataTypeMap = type === 'inspections' ? 'inspection' : type === 'violations' ? 'violation' : 'accident';
      const targetMapItem = mapItems.find(m => m.id === item.id && m.dataType === dataTypeMap);
      if (targetMapItem) {
        setActiveMapItem(targetMapItem);
      } else {
        setActiveMapItem({
          id: item.id,
          dataType: dataTypeMap as any,
          latitude: item.latitude,
          longitude: item.longitude,
          locationName: item.locationName,
          type: item.type || item.locationName,
          date: item.date,
          details: item.description || item.inspectorName || item.entityName,
          ...item
        });
      }
    }
  };

  const renderDetailedView = () => {
    if (!selectedDetailItem) return null;
    return (
      <Card className="p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Back & Role Switcher Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <button 
            type="button"
            onClick={() => { setSelectedDetailItem(null); setSelectedDetailType(null); }}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors"
          >
            {isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {isArabic ? 'العودة إلى القائمة' : 'Back to List'}
          </button>
          
          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl p-1 text-[11px] self-stretch sm:self-auto justify-between">
            <span className="text-slate-500 dark:text-slate-400 px-2 font-medium">{isArabic ? 'صلاحية التجربة:' : 'Test Role:'}</span>
            <div className="flex gap-1">
              <button 
                type="button"
                onClick={() => setCurrentUserRole('RESEARCHER')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${currentUserRole === 'RESEARCHER' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {isArabic ? 'باحث بيئي' : 'Researcher'}
              </button>
              <button 
                type="button"
                onClick={() => setCurrentUserRole('SUPERVISOR')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${currentUserRole === 'SUPERVISOR' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {isArabic ? 'مشرف القسم' : 'Supervisor'}
              </button>
            </div>
          </div>
        </div>

        {/* Blinking Deletion Banner */}
        {selectedDetailItem.isDeletePending && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl space-y-2 animate-pulse-slow">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldAlert size={18} className="text-rose-400" />
              <span>{isArabic ? 'طلب حذف معلق للمراجعة والاعتماد' : 'Pending Deletion Approval'}</span>
            </div>
            <p className="text-xs text-slate-300">
              <strong className="text-rose-450 text-rose-400">{isArabic ? 'سبب الطلب: ' : 'Reason: '}</strong>
              {selectedDetailItem.deleteReason}
            </p>
          </div>
        )}

        {isEditingDetail ? (
          /* EDIT FORM */
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2 pb-2 border-b border-white/5">
              <Edit2 size={16} className="text-teal-400" />
              {isArabic ? 'تعديل بيانات السجل' : 'Edit Record Data'}
            </h3>

            {selectedDetailType === 'costs' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="edit-cost-subject" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'الموضوع' : 'Subject'}</label>
                    <Input 
                      id="edit-cost-subject"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="edit-cost-date" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</label>
                    <Input 
                      id="edit-cost-date"
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-cost-details" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التفاصيل' : 'Details'}</label>
                  <textarea 
                    id="edit-cost-details"
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-teal-500 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-cost-status" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'الحالة' : 'Status'}</label>
                  <select
                    id="edit-cost-status"
                    value={editCostStatus}
                    onChange={(e) => setEditCostStatus(e.target.value as any)}
                    className="w-full h-11 bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm"
                  >
                    <option value="UNANSWERED">{isArabic ? 'لم يتم الرد' : 'Unanswered'}</option>
                    <option value="ANSWERED">{isArabic ? 'تم الرد' : 'Answered'}</option>
                  </select>
                </div>

                {/* Multi File Edit */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'تعديل الملفات المرفقة' : 'Modify Attached Files'}</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    <label className="h-10 px-4 rounded-xl border border-dashed border-teal-500/40 text-teal-400 hover:bg-teal-500/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                      <Upload size={14} />
                      {isArabic ? 'إضافة ملف جديد' : 'Add New File'}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, (url, name) => {
                          setEditFiles(prev => [...prev, { name, url }]);
                        })} 
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {editFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                        <FileText size={12} className="text-teal-400" />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setEditFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400 font-black"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedDetailType === 'inspections' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="edit-insp-locname" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'اسم الموقع' : 'Location Name'}</label>
                    <Input 
                      id="edit-insp-locname"
                      value={editLocationName}
                      onChange={(e) => setEditLocationName(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="edit-insp-date" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</label>
                    <Input 
                      id="edit-insp-date"
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="edit-insp-lat" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'خط العرض (Latitude)' : 'Latitude'}</label>
                    <Input 
                      id="edit-insp-lat"
                      type="number"
                      step="any"
                      value={editLatitude}
                      onChange={(e) => setEditLatitude(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="edit-insp-lng" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'خط الطول (Longitude)' : 'Longitude'}</label>
                    <Input 
                      id="edit-insp-lng"
                      type="number"
                      step="any"
                      value={editLongitude}
                      onChange={(e) => setEditLongitude(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label htmlFor="edit-insp-inspector" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'القائم بالمعاينة' : 'Inspector Name'}</label>
                    <Input 
                      id="edit-insp-inspector"
                      value={editInspectorName}
                      onChange={(e) => setEditInspectorName(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Files Edit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'دراسة الأثر البيئي (EIA Study)' : 'EIA Study Document'}</label>
                    <div className="flex items-center gap-2">
                      <label className="h-10 px-4 rounded-xl border border-dashed border-white/20 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        <Upload size={14} />
                        {isArabic ? 'رفع دراسة جديدة' : 'Upload New Study'}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, (url) => setEditStudyFileUrl(url))} 
                        />
                      </label>
                      {editStudyFileUrl && <CheckCircle2 className="text-emerald-400" size={18} />}
                      {editStudyFileUrl && (
                        <button 
                          type="button"
                          onClick={() => setEditStudyFileUrl(null)}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          {isArabic ? 'حذف' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'تقرير الرد النهائي (Final Response)' : 'Final Response Report'}</label>
                    <div className="flex items-center gap-2">
                      <label className="h-10 px-4 rounded-xl border border-dashed border-white/20 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        <Upload size={14} />
                        {isArabic ? 'رفع تقرير جديد' : 'Upload New Report'}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, (url) => setEditReportFileUrl(url))} 
                        />
                      </label>
                      {editReportFileUrl && <CheckCircle2 className="text-emerald-400" size={18} />}
                      {editReportFileUrl && (
                        <button 
                          type="button"
                          onClick={() => setEditReportFileUrl(null)}
                          className="text-xs text-rose-455 hover:underline"
                        >
                          {isArabic ? 'حذف' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedDetailType === 'violations' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'تصنيف المخالفة' : 'Violation Category'}</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full h-11 bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm"
                      required
                    >
                      <option value="ردم وتغير في حرم الشاطئ">{isArabic ? 'ردم وتغير في حرم الشاطئ' : 'Backfilling & Beach Encroachment'}</option>
                      <option value="سقالات ومباني">{isArabic ? 'سقالات ومباني' : 'Scaffolding & Buildings'}</option>
                      <option value="إنشاءات">{isArabic ? 'إنشاءات' : 'Construction'}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</label>
                    <Input 
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'اسم الموقع' : 'Location Name'}</label>
                    <Input 
                      value={editLocationName}
                      onChange={(e) => setEditLocationName(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'الجهة التابعة لها المخالفة' : 'Responsible Entity Type'}</label>
                    <select
                      value={editEntityType}
                      onChange={(e) => setEditEntityType(e.target.value as any)}
                      className="w-full h-11 bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm"
                      required
                    >
                      <option value="PROJECT">{isArabic ? 'مشروع' : 'Project'}</option>
                      <option value="PERSON">{isArabic ? 'شخص' : 'Person'}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'خط العرض (Latitude)' : 'Latitude'}</label>
                    <Input 
                      type="number"
                      step="any"
                      value={editLatitude}
                      onChange={(e) => setEditLatitude(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'خط الطول (Longitude)' : 'Longitude'}</label>
                    <Input 
                      type="number"
                      step="any"
                      value={editLongitude}
                      onChange={(e) => setEditLongitude(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'اسم الجهة / الشخص المخالف' : 'Responsible Entity Name'}</label>
                    <Input 
                      value={editEntityName}
                      onChange={(e) => setEditEntityName(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>

                  {/* Multi File Edit for Violations */}
                  <div className="space-y-2 pt-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'تعديل الملفات المرفقة' : 'Modify Attached Files'}</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      <label className="h-10 px-4 rounded-xl border border-dashed border-teal-500/40 text-teal-400 hover:bg-teal-500/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        <Upload size={14} />
                        {isArabic ? 'إضافة ملف جديد' : 'Add New File'}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, (url, name) => {
                            setEditFiles(prev => [...prev, { name, url }]);
                          })} 
                        />
                      </label>
                      {submitting && <Loader2 className="animate-spin text-teal-400" size={18} />}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {editFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                          <FileText size={12} className="text-teal-400" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button 
                            type="button" 
                            onClick={() => setEditFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 font-black"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedDetailType === 'accidents' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'تصنيف الحادثة' : 'Accident Type'}</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full h-11 bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm"
                      required
                    >
                      <option value="حوادث شحط أو ربط على الشعاب">{isArabic ? 'حوادث شحط أو ربط على الشعاب' : 'Grounding / Anchoring on Reef'}</option>
                      <option value="تلوث بترولي">{isArabic ? 'تلوث بترولي' : 'Oil Pollution Spill'}</option>
                      <option value="حرائق">{isArabic ? 'حرائق' : 'Fires'}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</label>
                    <Input 
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'اسم الموقع' : 'Location Name'}</label>
                    <Input 
                      value={editLocationName}
                      onChange={(e) => setEditLocationName(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'خط العرض (Latitude)' : 'Latitude'}</label>
                    <Input 
                      type="number"
                      step="any"
                      value={editLatitude}
                      onChange={(e) => setEditLatitude(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'خط الطول (Longitude)' : 'Longitude'}</label>
                    <Input 
                      type="number"
                      step="any"
                      value={editLongitude}
                      onChange={(e) => setEditLongitude(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'التقرير الفني (Technical Report)' : 'Technical Report PDF'}</label>
                    <div className="flex items-center gap-2">
                      <label className="h-10 px-4 rounded-xl border border-dashed border-white/20 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        <Upload size={14} />
                        {isArabic ? 'رفع تقرير فني جديد' : 'Upload New Report'}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, (url) => setEditReportFileUrl(url))} 
                        />
                      </label>
                      {editReportFileUrl && <CheckCircle2 className="text-emerald-400" size={18} />}
                      {editReportFileUrl && (
                        <button 
                          type="button"
                          onClick={() => setEditReportFileUrl(null)}
                          className="text-xs text-rose-455 hover:underline"
                        >
                          {isArabic ? 'حذف' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'وصف الحادث' : 'Description'}</label>
                  <textarea 
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-teal-500 text-sm"
                    required
                  />
                </div>
              </>
            )}

            {/* Edit Form Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button 
                type="button" 
                onClick={() => setIsEditingDetail(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold py-2.5 px-6"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : (isArabic ? 'حفظ التغييرات' : 'Save Changes')}
              </Button>
            </div>
          </form>
        ) : (
          /* READ-ONLY DETAIL VIEW */
          <div className="space-y-6">
            
            {/* Category & Title Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge 
                  color={
                    selectedDetailType === 'costs' ? 'success' :
                    selectedDetailType === 'inspections' ? 'teal' :
                    selectedDetailType === 'violations' ? 'danger' : 'warning'
                  }
                  className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1"
                >
                  {selectedDetailType === 'costs' ? (isArabic ? 'تكليف إداري' : 'Administrative Assignment') :
                   selectedDetailType === 'inspections' ? (isArabic ? 'معاينة ميدانية' : 'Field Inspection') :
                   selectedDetailType === 'violations' ? (isArabic ? 'مخالفة بيئية' : 'Environmental Violation') :
                   (isArabic ? 'حادثة بيئية' : 'Environmental Accident')}
                </Badge>
                
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-bold">
                  <Calendar size={13} />
                  {new Date(selectedDetailItem.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                {selectedDetailType === 'costs' ? selectedDetailItem.subject :
                 selectedDetailType === 'inspections' ? selectedDetailItem.locationName :
                 selectedDetailType === 'violations' ? selectedDetailItem.entityName :
                 selectedDetailItem.locationName}
              </h2>

              {selectedDetailType === 'violations' && (
                <p className="text-slate-400 text-xs font-bold">
                  {isArabic ? 'نوع المخالفة: ' : 'Violation: '}
                  <span className="text-rose-400 font-extrabold">{selectedDetailItem.type}</span>
                </p>
              )}
              {selectedDetailType === 'accidents' && (
                <p className="text-slate-400 text-xs font-bold">
                  {isArabic ? 'نوع الحادثة: ' : 'Accident: '}
                  <span className="text-amber-400 font-extrabold">{selectedDetailItem.type}</span>
                </p>
              )}
            </div>

            {/* Main Details Description Block */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                {isArabic ? 'التفاصيل والوصف' : 'Description & Details'}
              </h4>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {selectedDetailType === 'costs' ? selectedDetailItem.details :
                 selectedDetailType === 'accidents' ? selectedDetailItem.description :
                 selectedDetailType === 'inspections' ? (
                   <div className="space-y-2">
                     <p><strong>{isArabic ? 'القائم بالمعاينة:' : 'Inspector:'}</strong> {selectedDetailItem.inspectorName}</p>
                     <p><strong>{isArabic ? 'الموقع:' : 'Location:'}</strong> {selectedDetailItem.locationName}</p>
                   </div>
                 ) : (
                   <div className="space-y-2">
                     <p><strong>{isArabic ? 'الجهة/الشخص المخالف:' : 'Responsible Entity:'}</strong> {selectedDetailItem.entityName}</p>
                     <p><strong>{isArabic ? 'نوع الجهة:' : 'Entity Type:'}</strong> {selectedDetailItem.entityType === 'PROJECT' ? (isArabic ? 'مشروع سياحي' : 'Tourism Project') : (isArabic ? 'فرد' : 'Individual')}</p>
                     <p><strong>{isArabic ? 'موقع المخالفة:' : 'Location:'}</strong> {selectedDetailItem.locationName}</p>
                   </div>
                 )}
              </div>
            </div>

            {/* GIS Coordinates for mapped items */}
            {selectedDetailItem.latitude && selectedDetailItem.longitude && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  {isArabic ? 'الموقع الجغرافي (GIS)' : 'Geographic Location'}
                </h4>
                <div className="flex items-center justify-between p-3 bg-[#0d1e36]/40 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="text-teal-400" size={16} />
                    <span className="text-slate-300 font-bold">{isArabic ? 'الإحداثيات:' : 'Coordinates:'}</span>
                    <span className="text-teal-400 font-mono">{selectedDetailItem.latitude.toFixed(5)}, {selectedDetailItem.longitude.toFixed(5)}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleSelectRecord(selectedDetailItem)}
                    className="px-3 py-1 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 transition-all text-xs font-bold flex items-center gap-1"
                  >
                    <Eye size={12} />
                    {isArabic ? 'تحديد على الخريطة' : 'Locate on Map'}
                  </button>
                </div>
              </div>
            )}

            {selectedDetailType === 'costs' && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  {isArabic ? 'حالة التكليف' : 'Assignment Status'}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCostStatus(selectedDetailItem.id, selectedDetailItem.status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider transition-colors ${
                      selectedDetailItem.status === 'ANSWERED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {selectedDetailItem.status === 'ANSWERED' ? (isArabic ? '✓ تم الرد والاعتماد' : 'Answered & Approved') : (isArabic ? '✗ لم يتم الرد بعد' : 'Pending Response')}
                  </button>
                </div>
              </div>
            )}

            {/* Attachments Section */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                {isArabic ? 'الملفات والمستندات المرفقة' : 'Attached Documents'}
              </h4>
              
              {/* Costs attachments */}
              {selectedDetailType === 'costs' && (
                <div className="space-y-2">
                  {!selectedDetailItem.files || selectedDetailItem.files.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">{isArabic ? 'لا توجد مستندات مرفقة.' : 'No attached documents.'}</p>
                  ) : (
                    selectedDetailItem.files.map((file: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                          <FileText size={16} className="text-teal-400" />
                          <span className="truncate max-w-[200px] sm:max-w-[300px]">{file.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 transition-all text-xs font-bold flex items-center gap-1.5"
                          >
                            <Eye size={13} />
                            <span>{isArabic ? 'عرض' : 'View'}</span>
                          </a>
                          <a 
                            href={file.url} 
                            download={file.name}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-all text-xs font-bold flex items-center gap-1.5"
                          >
                            <Download size={13} />
                            <span>{isArabic ? 'تحميل' : 'Download'}</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Inspections study and report attachments */}
              {selectedDetailType === 'inspections' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold block">{isArabic ? 'دراسة الأثر البيئي (EIA Study)' : 'EIA Study Document'}</span>
                    {selectedDetailItem.studyFileUrl ? (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-teal-400 font-bold flex items-center gap-1">
                          <FileText size={14} />
                          PDF Document
                        </span>
                        <div className="flex gap-1.5">
                          <a 
                            href={selectedDetailItem.studyFileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400"
                          >
                            <Eye size={12} />
                          </a>
                          <a 
                            href={selectedDetailItem.studyFileUrl} 
                            download="EIA_Study_Report.pdf"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Download size={12} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">{isArabic ? 'غير متوفر' : 'Not Uploaded'}</p>
                    )}
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold block">{isArabic ? 'تقرير الرد النهائي (Final Response)' : 'Final Response Report'}</span>
                    {selectedDetailItem.reportFileUrl ? (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <FileText size={14} />
                          PDF Document
                        </span>
                        <div className="flex gap-1.5">
                          <a 
                            href={selectedDetailItem.reportFileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          >
                            <Eye size={12} />
                          </a>
                          <a 
                            href={selectedDetailItem.reportFileUrl} 
                            download="Final_Response_Report.pdf"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Download size={12} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">{isArabic ? 'غير متوفر' : 'Not Uploaded'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Accidents technical report */}
              {selectedDetailType === 'accidents' && (
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold block">{isArabic ? 'التقرير الفني للحادث (Technical Report)' : 'Accident Technical Report'}</span>
                  {selectedDetailItem.reportFileUrl ? (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                        <FileText size={14} />
                        Technical_Report.pdf
                      </span>
                      <div className="flex gap-1.5">
                        <a 
                          href={selectedDetailItem.reportFileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                        >
                          <Eye size={12} />
                        </a>
                        <a 
                          href={selectedDetailItem.reportFileUrl} 
                          download="Accident_Technical_Report.pdf"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Download size={12} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">{isArabic ? 'لا يوجد تقرير مرفق حالياً.' : 'No report attached currently.'}</p>
                  )}
                </div>
              )}

              {/* Violations attachments */}
              {selectedDetailType === 'violations' && (
                <div className="space-y-2">
                  {!selectedDetailItem.files || selectedDetailItem.files.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">{isArabic ? 'لا توجد مستندات مرفقة.' : 'No attached documents.'}</p>
                  ) : (
                    selectedDetailItem.files.map((file: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                          <FileText size={16} className="text-teal-400" />
                          <span className="truncate max-w-[200px] sm:max-w-[300px]">{file.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 transition-all text-xs font-bold flex items-center gap-1.5"
                          >
                            <Eye size={13} />
                            <span>{isArabic ? 'عرض' : 'View'}</span>
                          </a>
                          <a 
                            href={file.url} 
                            download={file.name}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-all text-xs font-bold flex items-center gap-1.5"
                          >
                            <Download size={13} />
                            <span>{isArabic ? 'تحميل' : 'Download'}</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Audit Logs Info Panel */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                {isArabic ? 'معلومات التدقيق والتحرير' : 'System Audit Log'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/40 border border-white/5 rounded-2xl text-xs text-slate-400">
                <div className="space-y-1">
                  <span className="text-slate-500 block">{isArabic ? 'سجل الإنشاء:' : 'Creation Log:'}</span>
                  <div className="flex items-center gap-1 text-slate-300 font-bold">
                    <User size={13} className="text-slate-500" />
                    <span>{selectedDetailItem.createdBy || (isArabic ? 'مصطفى لايق' : 'M. Layaq')}</span>
                  </div>
                  <span className="text-slate-500 block">
                    {new Date(selectedDetailItem.createdAt).toLocaleString(isArabic ? 'ar-EG' : 'en-US')}
                  </span>
                </div>

                {selectedDetailItem.updatedBy && (
                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                    <span className="text-slate-500 block">{isArabic ? 'آخر تعديل بواسطة:' : 'Last Modified By:'}</span>
                    <div className="flex items-center gap-1 text-slate-300 font-bold">
                      <User size={13} className="text-slate-500" />
                      <span>{selectedDetailItem.updatedBy}</span>
                    </div>
                    <span className="text-slate-500 block">
                      {new Date(selectedDetailItem.updatedAt).toLocaleString(isArabic ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Delete Workflows Panel */}
            <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-white/10">
              
              {!selectedDetailItem.isDeletePending ? (
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    onClick={startEditing} 
                    intent="primary" 
                    className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold py-2 px-4 flex items-center gap-1.5 text-xs shadow-md shadow-teal-500/10"
                  >
                    <Edit2 size={13} />
                    {isArabic ? 'تعديل السجل' : 'Edit Record'}
                  </Button>
                  
                  <Button 
                    type="button"
                    onClick={() => {
                      if (currentUserRole === 'SUPERVISOR') {
                        if (confirm(isArabic ? 'هل أنت متأكد من حذف هذا السجل نهائياً؟' : 'Are you sure you want to permanently delete this record?')) {
                          handleDeleteAction();
                        }
                      } else {
                        setShowDeleteConfirm(true);
                      }
                    }} 
                    intent="secondary" 
                    className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold py-2 px-4 flex items-center gap-1.5 text-xs shadow-md shadow-rose-500/10 border-none"
                  >
                    <Trash2 size={13} />
                    {isArabic ? 'حذف السجل' : 'Delete Record'}
                  </Button>
                </div>
              ) : (
                /* If deletion is pending */
                currentUserRole === 'SUPERVISOR' ? (
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-between items-stretch sm:items-center bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                    <span className="text-xs text-rose-450 font-bold flex items-center gap-1.5">
                      <ShieldAlert size={16} className="animate-pulse text-rose-450 text-rose-400" />
                      {isArabic ? 'طلب حذف معلق للموافقة' : 'Pending Deletion Approval'}
                    </span>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <Button 
                        type="button"
                        onClick={handleDeleteAction} 
                        intent="secondary" 
                        className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold py-2 px-4 flex items-center gap-1.5 text-xs shadow-md shadow-rose-500/10 border-none"
                      >
                        <Check size={14} />
                        {isArabic ? 'موافقة واعتماد الحذف' : 'Approve Deletion'}
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleRejectDeleteRequest} 
                        intent="secondary" 
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold py-2 px-4 flex items-center gap-1.5 text-xs border border-white/5"
                      >
                        <X size={14} />
                        {isArabic ? 'رفض وإلغاء طلب الحذف' : 'Reject Request'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl w-full">
                    <Clock size={18} className="text-amber-400 mt-0.5 animate-spin-slow" />
                    <div className="text-xs space-y-0.5">
                      <span className="text-amber-400 font-bold block">{isArabic ? 'طلب الحذف قيد مراجعة المشرف' : 'Deletion Request Under Review'}</span>
                      <span className="text-slate-400 block leading-relaxed">
                        {isArabic 
                          ? 'تم إرسال طلب الحذف بنجاح لحساب المشرف الفني بالقسم لمراجعته واتخاذ القرار المناسب بالاعتماد أو الرفض.' 
                          : 'The deletion request has been submitted to the department supervisor for review and final action.'}
                      </span>
                    </div>
                  </div>
                )
              )}
              
            </div>

            {/* Deletion Reason Confirmation area for Researcher */}
            {showDeleteConfirm && (
              <div className="p-4 bg-slate-950/80 border border-rose-500/20 rounded-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2 text-rose-450">
                  <AlertTriangle size={15} className="text-rose-400" />
                  <span className="text-xs font-bold text-rose-400">{isArabic ? 'تقديم طلب حذف للمشرف' : 'Submit Deletion Request'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isArabic 
                    ? 'بصفتك باحثاً بيئياً، لا يمكنك حذف السجلات مباشرة. سيتم تقديم طلب حذف للمشرف للموافقة عليه. يرجى كتابة سبب الحذف للمشرف:' 
                    : 'As a researcher, you cannot delete records directly. A request will be submitted to the supervisor for review. Please specify a reason for deletion:'}
                </p>
                <textarea 
                  value={deleteReasonText}
                  onChange={(e) => setDeleteReasonText(e.target.value)}
                  placeholder={isArabic ? 'اكتب سبب طلب الحذف بالتفصيل...' : 'Specify why this record should be deleted...'}
                  rows={3}
                  className="w-full bg-[#0b1329] border border-white/10 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500 font-medium"
                  required
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button 
                    type="button"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteReasonText(''); }}
                    className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleDeleteAction}
                    disabled={!deleteReasonText.trim()}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors disabled:opacity-50"
                  >
                    {isArabic ? 'إرسال الطلب للمشرف' : 'Submit Request'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-teal-500 rounded-full" />
            <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
              {isArabic ? 'تقييم الأثر البيئي' : 'Environmental Impact Assessment'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {isArabic ? 'قسم تقييم الأثر البيئي' : 'EIA Administration Department'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {isArabic ? 'تتبع التكاليف، المعاينات الميدانية، المخالفات البيئية وحوادث الشعاب جغرافياً ومستندياً.' : 'GIS-based environmental reporting and administrative tracking portal.'}
          </p>
        </div>

        <Button 
          intent="primary" 
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-2xl py-3 px-6 flex items-center gap-2 text-[12px] font-bold shadow-xl shadow-teal-500/10 bg-teal-600 hover:bg-teal-500 text-white"
        >
          {showAddForm ? (
            <>
              <XCircle size={16} />
              {isArabic ? 'إلغاء' : 'Cancel'}
            </>
          ) : (
            <>
              <Plus size={16} />
              {activeTab === 'costs' ? (isArabic ? 'تكليف جديد' : 'New Assignment') :
               activeTab === 'inspections' ? (isArabic ? 'معاينة جديدة' : 'New Inspection') :
               activeTab === 'violations' ? (isArabic ? 'رصد مخالفة' : 'Log Violation') :
               (isArabic ? 'تسجيل حادثة' : 'Log Accident')}
            </>
          )}
        </Button>
      </div>

      {/* Mobile View Toggle: Map vs Data */}
      {isMobile && (
        <div className="flex p-1 bg-slate-100 dark:bg-[#0a1628]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl mb-4 gap-1.5 shadow-xl">
          <button
            onClick={() => setMobilePanel('data')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mobilePanel === 'data'
                ? 'bg-teal-500 text-[#001529] shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen size={14} />
            {isArabic ? 'البيانات والاستمارات' : 'Data & Forms'}
          </button>
          <button
            onClick={() => setMobilePanel('map')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mobilePanel === 'map'
                ? 'bg-teal-500 text-[#001529] shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={14} />
            {isArabic ? 'الخريطة والتفاعلات' : 'Map & GIS'}
          </button>
        </div>
      )}

      {/* ── Main Layout: Map (7/12) LEFT + Data (5/12) RIGHT ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">

        {/* Left Column: GIS Map (7 of 12 cols) — hidden on mobile when not 'map' */}
        <div className={`lg:col-span-7 ${isMobile && mobilePanel !== 'map' ? 'hidden' : ''} ${isMobile ? 'h-[calc(100vh-16rem)]' : 'h-[600px] lg:h-[calc(100vh-14rem)] sticky top-6'} relative`}>
          <MapComponent 
            items={mapItems} 
            activeItem={activeMapItem} 
            onItemSelect={(item) => {
              setActiveMapItem(item);
              const tabName = item.dataType === 'inspection' ? 'inspections' : item.dataType === 'violation' ? 'violations' : 'accidents';
              setActiveTab(tabName);
              if (item.dataType === 'inspection') {
                const found = inspections.find(i => i.id === item.id);
                if (found) { setSelectedDetailItem(found); setSelectedDetailType('inspections'); setIsEditingDetail(false); }
              } else if (item.dataType === 'violation') {
                const found = violations.find(v => v.id === item.id);
                if (found) { setSelectedDetailItem(found); setSelectedDetailType('violations'); setIsEditingDetail(false); }
              } else if (item.dataType === 'accident') {
                const found = accidents.find(a => a.id === item.id);
                if (found) { setSelectedDetailItem(found); setSelectedDetailType('accidents'); setIsEditingDetail(false); }
              }
            }} 
            lang={params.lang}
          />
        </div>

        {/* Right Column: Forms & Content Lists (5 of 12 cols) */}
        <div className={`lg:col-span-5 space-y-4 md:space-y-5 ${isMobile && mobilePanel !== 'data' ? 'hidden' : ''}`}>
          {selectedDetailItem ? (
            renderDetailedView()
          ) : (
            <>
              {/* Section Navigation Tabs */}
              <div className="grid grid-cols-4 bg-slate-100 dark:bg-[#0d1e36] p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner gap-1">
                <button 
                  onClick={() => { setActiveTab('costs'); setShowAddForm(false); }}
                  className={`py-2 md:py-3 px-1 md:px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${activeTab === 'costs' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
                >
                  <DollarSign size={14} className="shrink-0" />
                  <span className="truncate">{isArabic ? 'التكاليف' : 'Costs'}</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('inspections'); setShowAddForm(false); }}
                  className={`py-2 md:py-3 px-1 md:px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${activeTab === 'inspections' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
                >
                  <ClipboardList size={14} className="shrink-0" />
                  <span className="truncate">{isArabic ? 'المعاينات' : 'Inspections'}</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('violations'); setShowAddForm(false); }}
                  className={`py-2 md:py-3 px-1 md:px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${activeTab === 'violations' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
                >
                  <AlertTriangle size={14} className="shrink-0" />
                  <span className="truncate">{isArabic ? 'المخالفات' : 'Violations'}</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('accidents'); setShowAddForm(false); }}
                  className={`py-2 md:py-3 px-1 md:px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${activeTab === 'accidents' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
                >
                  <Waves size={14} className="shrink-0" />
                  <span className="truncate">{isArabic ? 'الحوادث' : 'Accidents'}</span>
                </button>
              </div>

          {/* Form Panel: Shows up when clicking 'New ...' button */}
          {showAddForm && (
            <Card className="p-6 border border-teal-500/30 bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                {isArabic ? 'إدخال سجل جديد' : 'New Record Entry'}
              </h3>
              
              {activeTab === 'costs' && (
                <form onSubmit={handleCostSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'الموضوع' : 'Subject'}</label>
                      <Input 
                        value={costSubject}
                        onChange={(e) => setCostSubject(e.target.value)}
                        placeholder={isArabic ? 'مثال: تقييم مشروع مارينا الجونة' : 'e.g. Marina El Gouna EIA assessment'}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</label>
                      <Input 
                        type="date"
                        value={costDate}
                        onChange={(e) => setCostDate(e.target.value)}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التفاصيل' : 'Details'}</label>
                    <textarea 
                      value={costDetails}
                      onChange={(e) => setCostDetails(e.target.value)}
                      placeholder={isArabic ? 'اكتب تفاصيل التكليف هنا...' : 'Describe assignment details...'}
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-teal-500 text-sm"
                      required
                    />
                  </div>

                  {/* Multi File Upload */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'الملفات المرفقة (PDF, صور)' : 'Attached Files (PDF, Images)'}</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      <label className="h-10 px-4 rounded-xl border border-dashed border-teal-500/40 text-teal-400 hover:bg-teal-500/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        <Upload size={14} />
                        {isArabic ? 'اختر ملف للرفع' : 'Choose File to Upload'}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, (url, name) => {
                            setCostFiles(prev => [...prev, { name, url }]);
                          })} 
                        />
                      </label>
                      {submitting && <Loader2 className="animate-spin text-teal-400" size={18} />}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {costFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                          <FileText size={12} className="text-teal-400" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button 
                            type="button" 
                            onClick={() => setCostFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 font-black"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold py-2.5 px-6">
                      {submitting ? <Loader2 className="animate-spin" size={16} /> : (isArabic ? 'حفظ التكليف' : 'Save Assignment')}
                    </Button>
                  </div>
                </form>
              )}              {activeTab === 'inspections' && (
                <form onSubmit={handleInspectionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="add-insp-locname" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'اسم الموقع' : 'Location Name'}</label>
                      <Input 
                        id="add-insp-locname"
                        value={inspLocName}
                        onChange={(e) => setInspLocName(e.target.value)}
                        placeholder={isArabic ? 'مثال: أبو دباب، شعاب الفانوس' : 'e.g. Abu Dabab, Fanous Reef'}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="add-insp-date" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</label>
                      <Input 
                        id="add-insp-date"
                        type="date"
                        value={inspDate}
                        onChange={(e) => setInspDate(e.target.value)}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="add-insp-lat" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'إحداثي خط العرض (Latitude)' : 'Latitude'}</label>
                      <Input 
                        id="add-insp-lat"
                        type="number"
                        step="any"
                        value={inspLat}
                        onChange={(e) => setInspLat(e.target.value)}
                        placeholder="e.g. 27.2891"
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="add-insp-lng" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'إحداثي خط الطول (Longitude)' : 'Longitude'}</label>
                      <Input 
                        id="add-insp-lng"
                        type="number"
                        step="any"
                        value={inspLng}
                        onChange={(e) => setInspLng(e.target.value)}
                        placeholder="e.g. 33.9182"
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label htmlFor="add-insp-inspector" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'القائم بالمعاينة (الباحث)' : 'Inspector Name'}</label>
                      <Input 
                        id="add-insp-inspector"
                        value={inspInspector}
                        onChange={(e) => setInspInspector(e.target.value)}
                        placeholder={isArabic ? 'مثال: د. أحمد علي' : 'e.g. Dr. Ahmed Ali'}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Specific Two Files Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'دراسة الأثر البيئي (EIA Study)' : 'EIA Study Document'}</label>
                      <div className="flex items-center gap-2">
                        <label className="h-10 px-4 rounded-xl border border-dashed border-white/20 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                          <Upload size={14} />
                          {isArabic ? 'رفع دراسة الأثر' : 'Upload Study File'}
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, (url) => setInspStudyFile(url))} 
                          />
                        </label>
                        {inspStudyFile && <CheckCircle2 className="text-emerald-400" size={18} />}
                      </div>
                      {inspStudyFile && (
                        <p className="text-[10px] text-teal-400 font-bold truncate max-w-full">
                          {isArabic ? '✓ تم الرفع بنجاح' : '✓ Uploaded successfully'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'تقرير الرد النهائي (Final Response)' : 'Final Response Report'}</label>
                      <div className="flex items-center gap-2">
                        <label className="h-10 px-4 rounded-xl border border-dashed border-white/20 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                          <Upload size={14} />
                          {isArabic ? 'رفع تقرير الرد' : 'Upload Report File'}
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, (url) => setInspReportFile(url))} 
                          />
                        </label>
                        {inspReportFile && <CheckCircle2 className="text-emerald-400" size={18} />}
                      </div>
                      {inspReportFile && (
                        <p className="text-[10px] text-teal-400 font-bold truncate max-w-full">
                          {isArabic ? '✓ تم الرفع بنجاح' : '✓ Uploaded successfully'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold py-2.5 px-6">
                      {submitting ? <Loader2 className="animate-spin" size={16} /> : (isArabic ? 'حفظ المعاينة' : 'Save Inspection')}
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === 'violations' && (
                <form onSubmit={handleViolationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="add-viol-type" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'تصنيف المخالفة' : 'Violation Category'}</label>
                      <select
                        id="add-viol-type"
                        value={violType}
                        onChange={(e) => setViolType(e.target.value)}
                        className="w-full h-11 bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm"
                        required
                      >
                        <option value="ردم وتغير في حرم الشاطئ">{isArabic ? 'ردم وتغير في حرم الشاطئ' : 'Backfilling & Beach Encroachment'}</option>
                        <option value="سقالات ومباني">{isArabic ? 'سقالات ومباني' : 'Scaffolding & Buildings'}</option>
                        <option value="إنشاءات">{isArabic ? 'إنشاءات' : 'Construction'}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="add-viol-date" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</label>
                      <Input 
                        id="add-viol-date"
                        type="date"
                        value={violDate}
                        onChange={(e) => setViolDate(e.target.value)}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="add-viol-locname" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'اسم الموقع' : 'Location Name'}</label>
                      <Input 
                        id="add-viol-locname"
                        value={violLocName}
                        onChange={(e) => setViolLocName(e.target.value)}
                        placeholder={isArabic ? 'مثال: ساحل الجونة' : 'e.g. El Gouna Beach'}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="add-viol-entitytype" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'الجهة التابعة لها المخالفة' : 'Responsible Entity Type'}</label>
                      <select
                        id="add-viol-entitytype"
                        value={violEntityType}
                        onChange={(e) => setViolEntityType(e.target.value as any)}
                        className="w-full h-11 bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm"
                        required
                      >
                        <option value="PROJECT">{isArabic ? 'مشروع' : 'Project'}</option>
                        <option value="PERSON">{isArabic ? 'شخص' : 'Person'}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="add-viol-lat" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'إحداثي خط العرض (Latitude)' : 'Latitude'}</label>
                      <Input 
                        id="add-viol-lat"
                        type="number"
                        step="any"
                        value={violLat}
                        onChange={(e) => setViolLat(e.target.value)}
                        placeholder="e.g. 27.2579"
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="add-viol-lng" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'إحداثي خط الطول (Longitude)' : 'Longitude'}</label>
                      <Input 
                        id="add-viol-lng"
                        type="number"
                        step="any"
                        value={violLng}
                        onChange={(e) => setViolLng(e.target.value)}
                        placeholder="e.g. 33.8116"
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label htmlFor="add-viol-entityname" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'اسم الجهة / الشخص المخالف' : 'Responsible Entity Name'}</label>
                      <Input 
                        id="add-viol-entityname"
                        value={violEntityName}
                        onChange={(e) => setViolEntityName(e.target.value)}
                        placeholder={isArabic ? 'مثال: شركة التطوير السياحي الكبرى' : 'e.g. Grand Tourism Development Co.'}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>

                    {/* Multi File Upload for Violations */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'الملفات المرفقة (مستندات)' : 'Attached Files (Documents)'}</label>
                      <div className="flex flex-wrap gap-2 items-center">
                        <label className="h-10 px-4 rounded-xl border border-dashed border-teal-500/40 text-teal-400 hover:bg-teal-500/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                          <Upload size={14} />
                          {isArabic ? 'اختر ملف للرفع' : 'Choose File to Upload'}
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, (url, name) => {
                              setViolFiles(prev => [...prev, { name, url }]);
                            })} 
                          />
                        </label>
                        {submitting && <Loader2 className="animate-spin text-teal-400" size={18} />}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {violFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                            <FileText size={12} className="text-teal-400" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setViolFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-rose-400 font-black"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <Button type="submit" disabled={submitting} className="bg-[#f43f5e] hover:bg-rose-400 text-white rounded-xl font-bold py-2.5 px-6">
                      {submitting ? <Loader2 className="animate-spin" size={16} /> : (isArabic ? 'تسجيل المخالفة' : 'Save Violation')}
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === 'accidents' && (
                <form onSubmit={handleAccidentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'تصنيف الحادثة' : 'Accident Type'}</label>
                      <select
                        value={accType}
                        onChange={(e) => setAccType(e.target.value)}
                        className="w-full h-11 bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm"
                        required
                      >
                        <option value="حوادث شحط أو ربط على الشعاب">{isArabic ? 'حوادث شحط أو ربط على الشعاب' : 'Grounding / Anchoring on Reef'}</option>
                        <option value="تلوث بترولي">{isArabic ? 'تلوث بترولي' : 'Oil Pollution Spill'}</option>
                        <option value="حرائق">{isArabic ? 'حرائق' : 'Fires'}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</label>
                      <Input 
                        type="date"
                        value={accDate}
                        onChange={(e) => setAccDate(e.target.value)}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'اسم الموقع' : 'Location Name'}</label>
                      <Input 
                        value={accLocName}
                        onChange={(e) => setAccLocName(e.target.value)}
                        placeholder={isArabic ? 'مثال: شعاب ريجنسي' : 'e.g. Regency Reef'}
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'إحداثي خط العرض (Latitude)' : 'Latitude'}</label>
                      <Input 
                        type="number"
                        step="any"
                        value={accLat}
                        onChange={(e) => setAccLat(e.target.value)}
                        placeholder="e.g. 27.9152"
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'إحداثي خط الطول (Longitude)' : 'Longitude'}</label>
                      <Input 
                        type="number"
                        step="any"
                        value={accLng}
                        onChange={(e) => setAccLng(e.target.value)}
                        placeholder="e.g. 34.3541"
                        className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{isArabic ? 'التقرير الفني (Technical Report)' : 'Technical Report PDF'}</label>
                      <div className="flex items-center gap-2">
                        <label className="h-10 px-4 rounded-xl border border-dashed border-white/20 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase">
                          <Upload size={14} />
                          {isArabic ? 'رفع التقرير الفني' : 'Upload Report File'}
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, (url) => setAccReportFile(url))} 
                          />
                        </label>
                        {accReportFile && <CheckCircle2 className="text-emerald-400" size={18} />}
                      </div>
                      {accReportFile && (
                        <p className="text-[10px] text-teal-400 font-bold truncate max-w-full">
                          {isArabic ? '✓ تم الرفع بنجاح' : '✓ Uploaded successfully'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isArabic ? 'وصف الحادث' : 'Description'}</label>
                    <textarea 
                      value={accDesc}
                      onChange={(e) => setAccDesc(e.target.value)}
                      placeholder={isArabic ? 'اكتب وصف الحادث والتقرير الأولي للأضرار...' : 'Write accident details and coral damage reports...'}
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-teal-500 text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold py-2.5 px-6">
                      {submitting ? <Loader2 className="animate-spin" size={16} /> : (isArabic ? 'حفظ الحادثة' : 'Save Accident')}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}

          {/* Data List Panel */}
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="animate-spin text-teal-400 mx-auto" size={40} />
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{isArabic ? 'جاري تحميل البيانات من الخادم...' : 'Fetching live data...'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Tab 1: Costs */}
              {activeTab === 'costs' && (
                <div className="space-y-4">
                  {/* Costs Advanced Search Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl">
                    <div className="relative flex items-center">
                      <Search size={14} className={`absolute ${isArabic ? 'right-3' : 'left-3'} text-slate-500 pointer-events-none`} />
                      <input 
                        type="text"
                        placeholder={isArabic ? 'بحث في التكاليف والتفاصيل...' : 'Search subjects & details...'}
                        value={searchCostSubject}
                        onChange={(e) => setSearchCostSubject(e.target.value)}
                        className={`w-full bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs focus:outline-none focus:border-teal-500`}
                      />
                    </div>

                    <input 
                      type="date"
                      value={searchCostDate}
                      onChange={(e) => setSearchCostDate(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    />

                    <select
                      value={searchCostStatus}
                      onChange={(e) => setSearchCostStatus(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    >
                      <option value="ALL">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
                      <option value="ANSWERED">{isArabic ? 'تم الرد' : 'Answered'}</option>
                      <option value="UNANSWERED">{isArabic ? 'لم يتم الرد' : 'Unanswered'}</option>
                    </select>
                  </div>

                  {filteredCosts.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 dark:text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-100 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-300 dark:border-white/5">
                      {isArabic ? 'لا توجد تكاليف مطابقة للبحث' : 'No matching cost assignments'}
                    </div>
                  ) : (
                    filteredCosts.map((cost) => (
                      <Card 
                        key={cost.id} 
                        className="p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-xl hover:border-teal-300 dark:hover:border-white/10 transition-all relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md"
                        onClick={() => handleOpenDetail(cost, 'costs')}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{cost.subject}</h4>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleCostStatus(cost.id, cost.status); }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-colors ${
                              cost.status === 'ANSWERED' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {cost.status === 'ANSWERED' ? (isArabic ? 'تم الرد' : 'Answered') : (isArabic ? 'لم يتم الرد' : 'Unanswered')}
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">{cost.details}</p>
                        
                        <div className="flex flex-wrap justify-between items-center pt-4 border-t border-slate-200 dark:border-white/5 gap-3">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                            <Calendar size={13} />
                            {new Date(cost.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                          </span>

                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {cost.files && cost.files.map((file, i) => (
                              <a 
                                key={i}
                                href={file.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors text-[10.5px] font-bold flex items-center gap-1"
                              >
                                <FileText size={10} className="text-teal-400" />
                                {file.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Inspections */}
              {activeTab === 'inspections' && (
                <div className="space-y-4">
                  {/* Inspections Advanced Search Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl">
                    <div className="relative flex items-center">
                      <Search size={14} className={`absolute ${isArabic ? 'right-3' : 'left-3'} text-slate-500 pointer-events-none`} />
                      <input 
                        type="text"
                        placeholder={isArabic ? 'الباحث المعاين...' : 'Inspector name...'}
                        value={inspectorFilter}
                        onChange={(e) => setInspectorFilter(e.target.value)}
                        className={`w-full bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs focus:outline-none focus:border-teal-500`}
                      />
                    </div>

                    <input 
                      type="text"
                      placeholder={isArabic ? 'الموقع...' : 'Location name...'}
                      value={searchInspectionLoc}
                      onChange={(e) => setSearchInspectionLoc(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    />

                    <input 
                      type="date"
                      value={searchInspectionDate}
                      onChange={(e) => setSearchInspectionDate(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    />

                    <select
                      value={searchInspectionDocStatus}
                      onChange={(e) => setSearchInspectionDocStatus(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    >
                      <option value="ALL">{isArabic ? 'حالة المستندات...' : 'All Documents'}</option>
                      <option value="STUDY">{isArabic ? 'يحتوي دراسة أثر بيئي' : 'Has EIA Study'}</option>
                      <option value="REPORT">{isArabic ? 'يحتوي رد نهائي' : 'Has Final Response'}</option>
                      <option value="BOTH">{isArabic ? 'يحتوي على الدراستين' : 'Has Both Files'}</option>
                      <option value="NONE">{isArabic ? 'بدون مستندات مرفوعة' : 'No Files Uploaded'}</option>
                    </select>
                  </div>

                  {filteredInspections.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 dark:text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-100 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-300 dark:border-white/5">
                      {isArabic ? 'لا توجد معاينات مطابقة للبحث' : 'No matching inspections found'}
                    </div>
                  ) : (
                    filteredInspections.map((ins) => (
                      <Card 
                        key={ins.id + (activeMapItem?.id === ins.id ? '-active' : '')}
                        interactive 
                        onClick={() => handleOpenDetail(ins, 'inspections')}
                        className={`p-4 border bg-white dark:bg-slate-900/40 backdrop-blur-xl transition-all relative border-l-4 border-l-emerald-500 shadow-sm ${
                          activeMapItem?.id === ins.id ? 'highlight-active-card' : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{ins.locationName}</h4>
                            <span className="text-[10px] text-teal-400 font-bold tracking-tight uppercase flex items-center gap-1 mt-1">
                              📍 {ins.latitude.toFixed(4)}, {ins.longitude.toFixed(4)}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-2 py-1 rounded-lg">
                            <Calendar size={11} />
                            {new Date(ins.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>

                        <div className="flex flex-wrap justify-between items-center pt-3 border-t border-slate-200 dark:border-white/5 mt-3 gap-2">
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                            <User size={13} className="text-slate-500" />
                            <strong>{isArabic ? 'الباحث:' : 'Inspector:'}</strong> {ins.inspectorName}
                          </span>

                          <div className="flex gap-2">
                            {ins.studyFileUrl && (
                              <a 
                                href={ins.studyFileUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 transition-colors text-[10.5px] font-black flex items-center gap-1 border border-teal-500/20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FolderOpen size={10} />
                                {isArabic ? 'دراسة الأثر' : 'EIA Study'}
                              </a>
                            )}
                            {ins.reportFileUrl && (
                              <a 
                                href={ins.reportFileUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors text-[10.5px] font-black flex items-center gap-1 border border-emerald-500/20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileText size={10} />
                                {isArabic ? 'الرد النهائي' : 'Final Response'}
                              </a>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Violations */}
              {activeTab === 'violations' && (
                <div className="space-y-4">
                  {/* Violations Advanced Search Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl">
                    <select
                      value={searchViolationType}
                      onChange={(e) => setSearchViolationType(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    >
                      <option value="">{isArabic ? 'تصنيف المخالفة...' : 'All Violation Types'}</option>
                      <option value="ردم وتغير في حرم الشاطئ">{isArabic ? 'ردم وتغير في حرم الشاطئ' : 'Backfilling & Beach Encroachment'}</option>
                      <option value="سقالات ومباني">{isArabic ? 'سقالات ومباني' : 'Scaffolding & Buildings'}</option>
                      <option value="إنشاءات">{isArabic ? 'إنشاءات' : 'Construction'}</option>
                    </select>

                    <input 
                      type="text"
                      placeholder={isArabic ? 'الموقع...' : 'Location name...'}
                      value={searchViolationLocation}
                      onChange={(e) => setSearchViolationLocation(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    />

                    <input 
                      type="date"
                      value={searchViolationDate}
                      onChange={(e) => setSearchViolationDate(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    />

                    <input 
                      type="text"
                      placeholder={isArabic ? 'الجهة المخالفة...' : 'Violator entity...'}
                      value={searchViolationEntity}
                      onChange={(e) => setSearchViolationEntity(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    />

                    <select
                      value={searchViolationEntityType}
                      onChange={(e) => setSearchViolationEntityType(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    >
                      <option value="ALL">{isArabic ? 'نوع الجهة...' : 'Entity Type'}</option>
                      <option value="PROJECT">{isArabic ? 'مشروع سياحي' : 'Tourism Project'}</option>
                      <option value="PERSON">{isArabic ? 'شخص فرد' : 'Individual Person'}</option>
                    </select>
                  </div>

                  {filteredViolations.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 dark:text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-100 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-300 dark:border-white/5">
                      {isArabic ? 'لا توجد مخالفات مطابقة للبحث' : 'No violations match criteria'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredViolations.map((viol) => (
                        <Card 
                          key={viol.id + (activeMapItem?.id === viol.id ? '-active' : '')}
                          interactive
                          onClick={() => handleOpenDetail(viol, 'violations')}
                          className={`p-4 border bg-[#0d1e36]/60 backdrop-blur-xl transition-all relative border-l-4 border-l-rose-500 flex flex-col justify-between ${
                            activeMapItem?.id === viol.id ? 'highlight-active-card' : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <Badge size="sm" color="danger" className="text-[9px] font-black px-2 uppercase tracking-wide">
                                {viol.type}
                              </Badge>
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                <Calendar size={11} />
                                {new Date(viol.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                              </span>
                            </div>

                            <h4 className="font-bold text-white text-base leading-snug mb-1">{viol.entityName}</h4>
                            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                              📍 {viol.locationName}
                            </p>

                            {/* Attached files inline */}
                            {viol.files && viol.files.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4" onClick={(e) => e.stopPropagation()}>
                                {viol.files.map((file, i) => (
                                  <a 
                                    key={i}
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors text-[9.5px] font-bold flex items-center gap-1"
                                  >
                                    <FileText size={9} className="text-teal-400" />
                                    <span className="truncate max-w-[100px]">{file.name}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[11px] text-slate-500 mt-2">
                            <span>
                              <strong>{isArabic ? 'النوع:' : 'Type:'}</strong> {viol.entityType === 'PROJECT' ? (isArabic ? 'مشروع سياحي' : 'Tourism Project') : (isArabic ? 'فرد' : 'Individual')}
                            </span>
                            <span 
                              onClick={(e) => { e.stopPropagation(); handleSelectRecord(viol); }}
                              className="text-teal-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Eye size={12} />
                              {isArabic ? 'عرض الخريطة' : 'Locate'}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Accidents */}
              {activeTab === 'accidents' && (
                <div className="space-y-4">
                  {/* Accidents Advanced Search Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl">
                    <select
                      value={searchAccidentType}
                      onChange={(e) => setSearchAccidentType(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    >
                      <option value="">{isArabic ? 'تصنيف الحادث...' : 'All Accident Types'}</option>
                      <option value="حوادث شحط أو ربط على الشعاب">{isArabic ? 'شحط أو ربط على الشعاب' : 'Grounding / Anchoring on Reef'}</option>
                      <option value="تلوث بترولي">{isArabic ? 'تلوث بترولي' : 'Oil Pollution Spill'}</option>
                      <option value="حرائق">{isArabic ? 'حرائق' : 'Fires'}</option>
                    </select>

                    <input 
                      type="text"
                      placeholder={isArabic ? 'الموقع...' : 'Location name...'}
                      value={searchAccidentLocation}
                      onChange={(e) => setSearchAccidentLocation(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    />

                    <input 
                      type="date"
                      value={searchAccidentDate}
                      onChange={(e) => setSearchAccidentDate(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    />

                    <input 
                      type="text"
                      placeholder={isArabic ? 'بحث في وصف الحادث...' : 'Search description...'}
                      value={searchAccidentDesc}
                      onChange={(e) => setSearchAccidentDesc(e.target.value)}
                      className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"
                    />
                  </div>

                  {filteredAccidents.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 dark:text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-100 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-300 dark:border-white/5">
                      {isArabic ? 'لا توجد حوادث بيئية مطابقة للبحث' : 'No matching environmental accidents'}
                    </div>
                  ) : (
                    filteredAccidents.map((acc) => (
                      <Card 
                        key={acc.id + (activeMapItem?.id === acc.id ? '-active' : '')}
                        interactive
                        onClick={() => handleOpenDetail(acc, 'accidents')}
                        className={`p-4 border bg-white dark:bg-slate-900/40 backdrop-blur-xl transition-all relative border-l-4 border-l-amber-500 shadow-sm ${
                          activeMapItem?.id === acc.id ? 'highlight-active-card' : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge color="warning" className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                              {acc.type}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(acc.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-base leading-snug mb-1">📍 {acc.locationName}</h4>
                        <p className="text-xs text-slate-300 font-medium line-clamp-3 leading-relaxed mt-1.5 mb-3">{acc.description}</p>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-white/5 mt-3 gap-2">
                          <span className="text-[10px] text-teal-400 font-bold">
                            🌐 {acc.latitude.toFixed(4)}, {acc.longitude.toFixed(4)}
                          </span>

                          {acc.reportFileUrl && (
                            <a 
                              href={acc.reportFileUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors text-[10.5px] font-black flex items-center gap-1 border border-amber-500/20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText size={10} />
                              {isArabic ? 'التقرير الفني' : 'Technical Report'}
                            </a>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

            </div>
          )}
        </>)}
        </div>

        <EIAReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          item={selectedDetailItem}
          type={selectedDetailType}
          lang={params.lang}
        />
      </div>

      <style jsx>{`
        @keyframes cardGlow {
          0% {
            border-color: rgba(20, 184, 166, 0.2);
            box-shadow: 0 0 0 0 rgba(20, 184, 166, 0);
            transform: scale(1);
          }
          35% {
            border-color: rgba(20, 184, 166, 0.9);
            box-shadow: 0 0 22px 5px rgba(20, 184, 166, 0.4);
            transform: scale(1.025);
          }
          100% {
            border-color: rgba(20, 184, 166, 0.4);
            box-shadow: 0 0 8px 0 rgba(20, 184, 166, 0.1);
            transform: scale(1);
          }
        }
        .highlight-active-card {
          animation: cardGlow 1.5s ease-out;
          border-color: rgba(20, 184, 166, 0.5) !important;
          background: rgba(20, 184, 166, 0.05) !important;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-pulse-slow {
          animation: pulseSlow 2s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spinSlow 10s linear infinite;
        }
      `}</style>
    </div>
  );
}
