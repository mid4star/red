'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, X, Pencil, Trash2, Save,
  ChevronUp, ChevronDown, Eye, Image as ImageIcon,
  MapPin, Compass, Fish, Globe, ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VisitorGuideSection, MarineSpecies, MapLocation } from '@/lib/firebase/schema';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useUploadThing } from '@/utils/uploadthing';

const emptyGuide = (): Partial<VisitorGuideSection> => ({
  title: '', titleAr: '', content: '', contentAr: '', order: 0, links: []
});

const emptySpecies = (): Partial<MarineSpecies> => ({
  name: '', nameAr: '', type: '', typeAr: '', status: '', statusAr: '', imageUrl: '', description: '', descriptionAr: ''
});

const emptyTerrain = (): Partial<MapLocation> => ({
  name: '', nameAr: '', latitude: 0, longitude: 0, type: '', typeAr: '', status: 'ACTIVE', statusAr: '', description: '', descriptionAr: '', imageUrl: ''
});

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function GuideCMSPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const [activeTab, setActiveTab] = useState<'guide' | 'species' | 'terrain'>('guide');

  // Subscribed data lists
  const [sections, setSections] = useState<VisitorGuideSection[]>([]);
  const [species, setSpecies] = useState<MarineSpecies[]>([]);
  const [locations, setLocations] = useState<MapLocation[]>([]);

  // Editor Modal Visibility
  const [showGuideEditor, setShowGuideEditor] = useState(false);
  const [showSpeciesEditor, setShowSpeciesEditor] = useState(false);
  const [showTerrainEditor, setShowTerrainEditor] = useState(false);

  // Editing Item ID
  const [editingId, setEditingId] = useState<string | null>(null);

  // Forms
  const [guideForm, setGuideForm] = useState<Partial<VisitorGuideSection>>(emptyGuide());
  const [speciesForm, setSpeciesForm] = useState<Partial<MarineSpecies>>(emptySpecies());
  const [terrainForm, setTerrainForm] = useState<Partial<MapLocation>>(emptyTerrain());

  // Lang Tab for translation inside editors
  const [langTab, setLangTab] = useState<'ar' | 'en'>('ar');

  // Loaders
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Previews Toggle
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [expandedSpeciesId, setExpandedSpeciesId] = useState<string | null>(null);
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null);

  // Nested links inputs
  const [newLinkN, setNewLinkN] = useState('');
  const [newLinkNAr, setNewLinkNAr] = useState('');

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=visitor_guide');
      const json = await res.json();
      if (json.success) {
        setSections(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSpecies = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=marine_species');
      const json = await res.json();
      if (json.success) {
        setSpecies(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/staff/query?collection=map_locations');
      const json = await res.json();
      if (json.success) {
        setLocations(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Database subscriptions replaced with API queries
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSections(), fetchSpecies(), fetchLocations()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const { startUpload } = useUploadThing("imageUploader");

  // Generic image uploader
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'species' | 'terrain') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await startUpload([file]);
      if (res && res[0]) {
        const url = res[0].url;
        if (target === 'species') {
          setSpeciesForm(prev => ({ ...prev, imageUrl: url }));
        } else if (target === 'terrain') {
          setTerrainForm(prev => ({ ...prev, imageUrl: url }));
        }
      }
    } catch (e) {
      console.error('Error uploading image:', e);
    }
    setUploading(false);
  };

  // ─── FIELD BRIEFING GUIDE (visitor_guide) ───────────────────
  const openNewGuide = () => {
    const nextOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 1;
    setGuideForm({ ...emptyGuide(), order: nextOrder });
    setEditingId(null);
    setShowGuideEditor(true);
  };

  const openEditGuide = (section: VisitorGuideSection) => {
    setGuideForm({ ...section });
    setEditingId(section.id!);
    setShowGuideEditor(true);
  };

  const handleSaveGuide = async () => {
    setSaving(true);
    try {
      const payload = { ...guideForm };
      if (editingId) {
        const { id, ...rest } = payload as any;
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'visitor_guide',
            action: 'UPDATE',
            id: editingId,
            data: rest
          })
        });
        if (!response.ok) throw new Error('Failed to update guide');
      } else {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'visitor_guide',
            action: 'ADD',
            data: payload
          })
        });
        if (!response.ok) throw new Error('Failed to add guide');
      }
      await fetchSections();
      setShowGuideEditor(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDeleteGuide = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isAr ? 'تأكيد الحذف' : 'Confirm Delete',
      message: isAr ? 'هل أنت متأكد من رغبتك في حذف هذا القسم؟' : 'Are you sure you want to delete this guide section?',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/staff/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionName: 'visitor_guide',
              action: 'DELETE',
              id
            })
          });
          if (!response.ok) throw new Error('Failed to delete guide');
          await fetchSections();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const moveSection = async (section: VisitorGuideSection, direction: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === section.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sections.length) return;
    const other = sections[swapIdx];
    try {
      await fetch('/api/staff/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: 'visitor_guide',
          action: 'UPDATE',
          id: section.id!,
          data: { order: other.order }
        })
      });
      await fetch('/api/staff/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: 'visitor_guide',
          action: 'UPDATE',
          id: other.id!,
          data: { order: section.order }
        })
      });
      await fetchSections();
    } catch (e) {
      console.error(e);
    }
  };

  // ─── MARINE SPECIES (marine_species) ──────────────────────
  const openNewSpecies = () => {
    setSpeciesForm(emptySpecies());
    setEditingId(null);
    setShowSpeciesEditor(true);
  };

  const openEditSpecies = (sp: MarineSpecies) => {
    setSpeciesForm({ ...sp });
    setEditingId(sp.id!);
    setShowSpeciesEditor(true);
  };

  const handleSaveSpecies = async () => {
    setSaving(true);
    try {
      const payload = { ...speciesForm };
      if (editingId) {
        const { id, ...rest } = payload as any;
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'marine_species',
            action: 'UPDATE',
            id: editingId,
            data: rest
          })
        });
        if (!response.ok) throw new Error('Failed to update marine species');
      } else {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'marine_species',
            action: 'ADD',
            data: payload
          })
        });
        if (!response.ok) throw new Error('Failed to add marine species');
      }
      await fetchSpecies();
      setShowSpeciesEditor(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDeleteSpecies = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isAr ? 'تأكيد الحذف' : 'Confirm Delete',
      message: isAr ? 'هل أنت متأكد من رغبتك في حذف هذا الكائن البحري؟' : 'Are you sure you want to delete this marine species?',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/staff/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionName: 'marine_species',
              action: 'DELETE',
              id
            })
          });
          if (!response.ok) throw new Error('Failed to delete marine species');
          await fetchSpecies();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  // ─── EXPLORE TERRAIN (map_locations) ──────────────────────
  const openNewTerrain = () => {
    setTerrainForm(emptyTerrain());
    setEditingId(null);
    setShowTerrainEditor(true);
  };

  const openEditTerrain = (loc: MapLocation) => {
    setTerrainForm({ ...loc });
    setEditingId(loc.id!);
    setShowTerrainEditor(true);
  };

  const handleSaveTerrain = async () => {
    setSaving(true);
    try {
      const payload = {
        ...terrainForm,
        latitude: Number(terrainForm.latitude),
        longitude: Number(terrainForm.longitude)
      };
      if (editingId) {
        const { id, ...rest } = payload as any;
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'map_locations',
            action: 'UPDATE',
            id: editingId,
            data: rest
          })
        });
        if (!response.ok) throw new Error('Failed to update map location');
      } else {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'map_locations',
            action: 'ADD',
            data: payload
          })
        });
        if (!response.ok) throw new Error('Failed to add map location');
      }
      await fetchLocations();
      setShowTerrainEditor(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDeleteTerrain = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isAr ? 'تأكيد الحذف' : 'Confirm Delete',
      message: isAr ? 'هل أنت متأكد من رغبتك في حذف هذا الموقع؟' : 'Are you sure you want to delete this map location?',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/staff/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionName: 'map_locations',
              action: 'DELETE',
              id
            })
          });
          if (!response.ok) throw new Error('Failed to delete map location');
          await fetchLocations();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const stripHtml = (html: string) => {
    const tmp = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (tmp) { tmp.innerHTML = html; return tmp.textContent || tmp.innerText || ''; }
    return html.replace(/<[^>]*>/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isFormOpen = showGuideEditor || showSpeciesEditor || showTerrainEditor;

  return (
    <div className={isFormOpen ? "max-w-[1200px] mx-auto space-y-6 pb-12" : "max-w-[1200px] mx-auto space-y-8"} dir={isAr ? 'rtl' : 'ltr'}>
      {showGuideEditor ? (
        /* ── INLINE GUIDE EDITOR VIEW ── */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 pb-4 border-b border-th-border">
            <button 
              onClick={() => setShowGuideEditor(false)}
              type="button"
              className="p-2.5 rounded-2xl bg-th-surface border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface2 transition-all flex items-center justify-center shrink-0"
            >
              <ArrowRight size={20} className={isAr ? '' : 'rotate-180'} />
            </button>
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                {isAr ? 'دليل الإرشادات' : 'Field Briefing'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-th-text tracking-tight flex items-center gap-2">
                <BookOpen className="text-teal-500" size={20} />
                {editingId ? (isAr ? 'تعديل القسم' : 'Edit Section') : (isAr ? 'قسم جديد' : 'New Section')}
              </h2>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto pt-4 space-y-6">
            <div className="flex gap-2 bg-th-surface p-1 rounded-xl w-fit">
              <button onClick={() => setLangTab('ar')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'ar' ? 'bg-teal-500/20 text-teal-400' : 'text-th-muted hover:text-th-text'}`}>العربية</button>
              <button onClick={() => setLangTab('en')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'en' ? 'bg-teal-500/20 text-teal-400' : 'text-th-muted hover:text-th-text'}`}>English</button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                {langTab === 'ar' ? 'عنوان القسم (عربي)' : 'Section Title (English)'}
              </label>
              <Input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                value={langTab === 'ar' ? (guideForm.titleAr || '') : (guideForm.title || '')}
                onChange={(e) => setGuideForm(p => ({ ...p, [langTab === 'ar' ? 'titleAr' : 'title']: e.target.value }))}
                placeholder={langTab === 'ar' ? 'مثال: قواعد السلامة البحرية' : 'e.g. Marine Safety Rules'} />
            </div>

            <div className="w-32">
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'الترتيب' : 'Order'}</label>
              <Input type="number" value={guideForm.order || 0} onChange={(e) => setGuideForm(p => ({ ...p, order: Number(e.target.value) }))} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                {langTab === 'ar' ? 'المحتوى (عربي)' : 'Content (English)'}
              </label>
              <RichTextEditor
                value={langTab === 'ar' ? (guideForm.contentAr || '') : (guideForm.content || '')}
                onChange={(val) => setGuideForm(p => ({ ...p, [langTab === 'ar' ? 'contentAr' : 'content']: val }))}
                placeholder={langTab === 'ar' ? 'اكتب محتوى القسم...' : 'Write section content...'}
                dir={langTab === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Nested Links Manager */}
            <div className="space-y-4 border-t border-th-border pt-6">
              <div>
                <h3 className="text-xs font-bold text-th-muted uppercase tracking-wider">
                  {isAr ? 'الروابط الفرعية' : 'Sub Links'}
                </h3>
                <p className="text-[11px] text-th-muted mt-1">
                  {isAr ? 'أضف روابط إضافية تابعة لهذا القسم.' : 'Add reference links to this section.'}
                </p>
              </div>

              <div className="space-y-2">
                {(guideForm.links || []).map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-th-surface border border-th-border text-sm">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[10px] text-th-muted uppercase block">English</span>
                        <span className="text-th-text font-medium">{link.n}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-th-muted uppercase block">العربية</span>
                        <span className="text-th-text font-medium">{link.nAr}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGuideForm(prev => ({
                          ...prev,
                          links: (prev.links || []).filter((_, i) => i !== idx)
                        }));
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {(guideForm.links || []).length === 0 && (
                  <p className="text-xs text-slate-600 italic">
                    {isAr ? 'لا توجد روابط مضافة بعد.' : 'No links added yet.'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end p-4 rounded-xl bg-white/[0.02] border border-th-border">
                <div>
                  <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">
                    {isAr ? 'اسم الرابط بالإنجليزية' : 'Link Name (English)'}
                  </label>
                  <Input
                    type="text"
                    value={newLinkN}
                    onChange={(e) => setNewLinkN(e.target.value)}
                    placeholder="e.g. Permit Info"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-1.5 block">
                      {isAr ? 'اسم الرابط بالعربية' : 'Link Name (Arabic)'}
                    </label>
                    <Input
                      type="text"
                      value={newLinkNAr}
                      onChange={(e) => setNewLinkNAr(e.target.value)}
                      placeholder="مثال: معلومات التصريح"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newLinkN.trim() && newLinkNAr.trim()) {
                        setGuideForm(prev => ({
                          ...prev,
                          links: [...(prev.links || []), { n: newLinkN.trim(), nAr: newLinkNAr.trim() }]
                        }));
                        setNewLinkN('');
                        setNewLinkNAr('');
                      }
                    }}
                    className="h-10 px-4 rounded-xl bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 text-xs font-bold shrink-0 self-end transition-all flex items-center gap-1.5 border border-teal-500/20"
                  >
                    <Plus size={14} />
                    {isAr ? 'إضافة' : 'Add'}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-th-border">
              {editingId && (
                <button onClick={() => { setShowGuideEditor(false); handleDeleteGuide(editingId); }} className="px-4 py-2.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-[12px] font-bold flex items-center gap-2">
                  <Trash2 size={14} /> {isAr ? 'حذف' : 'Delete'}
                </button>
              )}
              <div className={`flex gap-3 ${!editingId ? 'ml-auto' : ''}`}>
                <Button intent="outline" onClick={() => setShowGuideEditor(false)} className="border-th-border bg-th-surface text-th-muted hover:bg-th-surface2">{isAr ? 'إلغاء' : 'Cancel'}</Button>
                <Button intent="primary" onClick={handleSaveGuide} className="bg-teal-500 text-[#001529] hover:bg-teal-400 font-black flex items-center gap-2 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                  <Save size={16} /> {saving ? (isAr ? 'حفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : showSpeciesEditor ? (
        /* ── INLINE SPECIES EDITOR VIEW ── */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 pb-4 border-b border-th-border">
            <button 
              onClick={() => setShowSpeciesEditor(false)}
              type="button"
              className="p-2.5 rounded-2xl bg-th-surface border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface2 transition-all flex items-center justify-center shrink-0"
            >
              <ArrowRight size={20} className={isAr ? '' : 'rotate-180'} />
            </button>
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                {isAr ? 'الكائنات البحرية' : 'Marine Species'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-th-text tracking-tight flex items-center gap-2">
                <Fish className="text-teal-500" size={20} />
                {editingId ? (isAr ? 'تعديل الكائن' : 'Edit Marine Species') : (isAr ? 'كائن جديد' : 'New Marine Species')}
              </h2>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto pt-4 space-y-6">
            <div className="flex gap-2 bg-th-surface p-1 rounded-xl w-fit">
              <button onClick={() => setLangTab('ar')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'ar' ? 'bg-teal-500/20 text-teal-400' : 'text-th-muted hover:text-th-text'}`}>العربية</button>
              <button onClick={() => setLangTab('en')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'en' ? 'bg-teal-500/20 text-teal-400' : 'text-th-muted hover:text-th-text'}`}>English</button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                {langTab === 'ar' ? 'اسم الكائن (عربي)' : 'Species Name (English)'}
              </label>
              <Input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                value={langTab === 'ar' ? (speciesForm.nameAr || '') : (speciesForm.name || '')}
                onChange={(e) => setSpeciesForm(p => ({ ...p, [langTab === 'ar' ? 'nameAr' : 'name']: e.target.value }))}
                placeholder={langTab === 'ar' ? 'مثال: الأطوم' : 'e.g. Dugong'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {langTab === 'ar' ? 'النوع / التصنيف (عربي)' : 'Type / Category (English)'}
                </label>
                <Input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  value={langTab === 'ar' ? (speciesForm.typeAr || '') : (speciesForm.type || '')}
                  onChange={(e) => setSpeciesForm(p => ({ ...p, [langTab === 'ar' ? 'typeAr' : 'type']: e.target.value }))}
                  placeholder={langTab === 'ar' ? 'مثال: ثدييات نادرة' : 'e.g. Rare Mammal'} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {langTab === 'ar' ? 'حالة الحفظ (عربي)' : 'Conservation Status (English)'}
                </label>
                <Input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  value={langTab === 'ar' ? (speciesForm.statusAr || '') : (speciesForm.status || '')}
                  onChange={(e) => setSpeciesForm(p => ({ ...p, [langTab === 'ar' ? 'statusAr' : 'status']: e.target.value }))}
                  placeholder={langTab === 'ar' ? 'مثال: محمي بشدة' : 'e.g. Critically Protected'} />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'صورة الكائن' : 'Cover Image'}</label>
              <div className="flex items-center gap-4">
                {speciesForm.imageUrl && <img src={speciesForm.imageUrl} alt="" className="w-20 h-14 object-cover rounded-xl border border-th-border" />}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-th-surface border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface2 cursor-pointer transition-all text-[12px] font-bold">
                  <ImageIcon size={16} />
                  {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع صورة' : 'Upload')}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'species')} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                {langTab === 'ar' ? 'الوصف (عربي)' : 'Description (English)'}
              </label>
              <RichTextEditor
                value={langTab === 'ar' ? (speciesForm.descriptionAr || '') : (speciesForm.description || '')}
                onChange={(val) => setSpeciesForm(p => ({ ...p, [langTab === 'ar' ? 'descriptionAr' : 'description']: val }))}
                placeholder={langTab === 'ar' ? 'اكتب وصفاً مفصلاً...' : 'Write detailed description...'}
                dir={langTab === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-th-border">
              {editingId && (
                <button onClick={() => { setShowSpeciesEditor(false); handleDeleteSpecies(editingId); }} className="px-4 py-2.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-[12px] font-bold flex items-center gap-2">
                  <Trash2 size={14} /> {isAr ? 'حذف' : 'Delete'}
                </button>
              )}
              <div className={`flex gap-3 ${!editingId ? 'ml-auto' : ''}`}>
                <Button intent="outline" onClick={() => setShowSpeciesEditor(false)} className="border-th-border bg-th-surface text-th-muted hover:bg-th-surface2">{isAr ? 'إلغاء' : 'Cancel'}</Button>
                <Button intent="primary" onClick={handleSaveSpecies} className="bg-teal-500 text-[#001529] hover:bg-teal-400 font-black flex items-center gap-2 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                  <Save size={16} /> {saving ? (isAr ? 'حفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : showTerrainEditor ? (
        /* ── INLINE TERRAIN EDITOR VIEW ── */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 pb-4 border-b border-th-border">
            <button 
              onClick={() => setShowTerrainEditor(false)}
              type="button"
              className="p-2.5 rounded-2xl bg-th-surface border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface2 transition-all flex items-center justify-center shrink-0"
            >
              <ArrowRight size={20} className={isAr ? '' : 'rotate-180'} />
            </button>
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                {isAr ? 'استكشاف التضاريس' : 'Explore Terrain'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-th-text tracking-tight flex items-center gap-2">
                <Compass className="text-teal-500" size={20} />
                {editingId ? (isAr ? 'تعديل الموقع' : 'Edit Location') : (isAr ? 'موقع جديد' : 'New Location')}
              </h2>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto pt-4 space-y-6">
            <div className="flex gap-2 bg-th-surface p-1 rounded-xl w-fit">
              <button onClick={() => setLangTab('ar')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'ar' ? 'bg-teal-500/20 text-teal-400' : 'text-th-muted hover:text-th-text'}`}>العربية</button>
              <button onClick={() => setLangTab('en')} className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all ${langTab === 'en' ? 'bg-teal-500/20 text-teal-400' : 'text-th-muted hover:text-th-text'}`}>English</button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                {langTab === 'ar' ? 'اسم الموقع (عربي)' : 'Location Name (English)'}
              </label>
              <Input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                value={langTab === 'ar' ? (terrainForm.nameAr || '') : (terrainForm.name || '')}
                onChange={(e) => setTerrainForm(p => ({ ...p, [langTab === 'ar' ? 'nameAr' : 'name']: e.target.value }))}
                placeholder={langTab === 'ar' ? 'مثال: شعب القرش' : 'e.g. Shark Reef'} />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {isAr ? 'خط العرض (Latitude)' : 'Latitude'}
                </label>
                <Input type="number" step="any"
                  value={terrainForm.latitude || ''}
                  onChange={(e) => setTerrainForm(p => ({ ...p, latitude: Number(e.target.value) }))}
                  placeholder="e.g. 28.5721" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {isAr ? 'خط الطول (Longitude)' : 'Longitude'}
                </label>
                <Input type="number" step="any"
                  value={terrainForm.longitude || ''}
                  onChange={(e) => setTerrainForm(p => ({ ...p, longitude: Number(e.target.value) }))}
                  placeholder="e.g. 34.5368" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {langTab === 'ar' ? 'النوع / التصنيف (عربي)' : 'Type (English)'}
                </label>
                <Input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  value={langTab === 'ar' ? (terrainForm.typeAr || '') : (terrainForm.type || '')}
                  onChange={(e) => setTerrainForm(p => ({ ...p, [langTab === 'ar' ? 'typeAr' : 'type']: e.target.value }))}
                  placeholder={langTab === 'ar' ? 'مثال: منطقة محمية' : 'e.g. PROTECTED_ZONE'} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                  {langTab === 'ar' ? 'الحالة (عربي)' : 'Status (English)'}
                </label>
                <Input type="text" dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  value={langTab === 'ar' ? (terrainForm.statusAr || '') : (terrainForm.status || '')}
                  onChange={(e) => setTerrainForm(p => ({ ...p, [langTab === 'ar' ? 'statusAr' : 'status']: e.target.value }))}
                  placeholder={langTab === 'ar' ? 'مثال: نشط' : 'e.g. ACTIVE'} />
              </div>
            </div>

            {/* Location Image Upload */}
            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">{isAr ? 'صورة الموقع' : 'Location Image'}</label>
              <div className="flex items-center gap-4">
                {terrainForm.imageUrl && <img src={terrainForm.imageUrl} alt="" className="w-20 h-14 object-cover rounded-xl border border-th-border" />}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-th-surface border border-th-border text-th-muted hover:text-th-text hover:bg-th-surface2 cursor-pointer transition-all text-[12px] font-bold">
                  <ImageIcon size={16} />
                  {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع صورة' : 'Upload')}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'terrain')} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-th-muted uppercase tracking-widest mb-2 block">
                {langTab === 'ar' ? 'الوصف (عربي)' : 'Description (English)'}
              </label>
              <RichTextEditor
                value={langTab === 'ar' ? (terrainForm.descriptionAr || '') : (terrainForm.description || '')}
                onChange={(val) => setTerrainForm(p => ({ ...p, [langTab === 'ar' ? 'descriptionAr' : 'description']: val }))}
                placeholder={langTab === 'ar' ? 'اكتب وصفاً للموقع...' : 'Write location description...'}
                dir={langTab === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-th-border">
              {editingId && (
                <button onClick={() => { setShowTerrainEditor(false); handleDeleteTerrain(editingId); }} className="px-4 py-2.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-[12px] font-bold flex items-center gap-2">
                  <Trash2 size={14} /> {isAr ? 'حذف' : 'Delete'}
                </button>
              )}
              <div className={`flex gap-3 ${!editingId ? 'ml-auto' : ''}`}>
                <Button intent="outline" onClick={() => setShowTerrainEditor(false)} className="border-th-border bg-th-surface text-th-muted hover:bg-th-surface2">{isAr ? 'إلغاء' : 'Cancel'}</Button>
                <Button intent="primary" onClick={handleSaveTerrain} className="bg-teal-500 text-[#001529] hover:bg-teal-400 font-black flex items-center gap-2 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                  <Save size={16} /> {saving ? (isAr ? 'حفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── MAIN DIRECTORY VIEW ── */
        <>
          {/* ── Tabs Navigation ───────────────────────────────── */}
          <div className="flex border-b border-th-border gap-6">
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-4 text-sm font-black tracking-wider uppercase transition-all relative flex items-center gap-2 ${
                activeTab === 'guide' ? 'text-teal-400 font-bold' : 'text-th-muted hover:text-slate-200'
              }`}
            >
              <BookOpen size={16} />
              {isAr ? 'دليل الإرشادات' : 'Field Briefing'}
              {activeTab === 'guide' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('species')}
              className={`pb-4 text-sm font-black tracking-wider uppercase transition-all relative flex items-center gap-2 ${
                activeTab === 'species' ? 'text-teal-400 font-bold' : 'text-th-muted hover:text-slate-200'
              }`}
            >
              <Fish size={16} />
              {isAr ? 'الكائنات البحرية' : 'Marine Species'}
              {activeTab === 'species' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('terrain')}
              className={`pb-4 text-sm font-black tracking-wider uppercase transition-all relative flex items-center gap-2 ${
                activeTab === 'terrain' ? 'text-teal-400 font-bold' : 'text-th-muted hover:text-slate-200'
              }`}
            >
              <Compass size={16} />
              {isAr ? 'استكشاف التضاريس' : 'Explore Terrain'}
              {activeTab === 'terrain' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
              )}
            </button>
          </div>

          {/* ── Header ────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-teal-500 rounded-full" />
                <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                  {isAr ? 'إدارة المحتوى' : 'Content Manager'}
                </span>
              </div>
              <h1 className="text-4xl font-black text-th-text tracking-tighter uppercase italic">
                {activeTab === 'guide'
                  ? (isAr ? 'دليل الإرشادات' : 'Field Briefing')
                  : activeTab === 'species'
                  ? (isAr ? 'الكائنات البحرية' : 'Marine Species')
                  : (isAr ? 'استكشاف التضاريس' : 'Explore Terrain')
                }
              </h1>
              <p className="text-sm text-th-muted">
                {activeTab === 'guide'
                  ? (isAr ? 'إدارة أقسام دليل الزوار وترتيبها وتحريرها والروابط المرفقة.' : 'Manage, reorder, and edit visitor guide sections and links.')
                  : activeTab === 'species'
                  ? (isAr ? 'إدارة تصنيفات الكائنات البحرية وحالة الحفظ الخاصة بها.' : 'Manage species profiles, statuses, categories, and images.')
                  : (isAr ? 'إدارة المواقع الجغرافية، الإحداثيات، وتفاصيل الأماكن.' : 'Manage map locations, coordinates, statuses, and profiles.')
                }
              </p>
            </div>
            <Button intent="primary" onClick={
              activeTab === 'guide' ? openNewGuide : activeTab === 'species' ? openNewSpecies : openNewTerrain
            }
              className="rounded-2xl py-3.5 px-6 flex items-center gap-2.5 shadow-[0_0_20px_rgba(20,184,166,0.2)] bg-teal-500 text-[#001529] hover:bg-teal-400 uppercase italic font-black">
              <Plus size={18} strokeWidth={3} />
              {activeTab === 'guide'
                ? (isAr ? 'إضافة قسم' : 'Add Section')
                : activeTab === 'species'
                ? (isAr ? 'إضافة كائن' : 'Add Species')
                : (isAr ? 'إضافة موقع' : 'Add Location')
              }
            </Button>
          </div>

          {/* ── CONTENT SECTION ───────────────────────────────── */}
          <div className="space-y-6">
            
            {/* Tab 1: Field Briefing Guide */}
            {activeTab === 'guide' && (
              <div className="space-y-3">
                {sections.length === 0 && (
                  <div className="py-20 text-center text-th-muted text-sm italic">
                    {isAr ? 'لا توجد أقسام. أضف قسماً جديداً.' : 'No sections yet. Add a section to get started.'}
                  </div>
                )}
                <AnimatePresence>
                  {sections.map((section, i) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.04 }}
                      layout
                    >
                      <Card className="bg-th-surface2 backdrop-blur-xl border-th-border hover:border-th-border transition-all overflow-hidden">
                        <div className="flex items-center gap-4 p-5">
                          {/* Order Controls */}
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <button onClick={() => moveSection(section, 'up')} disabled={i === 0}
                              className="p-1 rounded-md text-th-muted hover:text-teal-400 hover:bg-th-surface transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                              <ChevronUp size={14} />
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 font-black text-lg">
                              {section.order}
                            </div>
                            <button onClick={() => moveSection(section, 'down')} disabled={i === sections.length - 1}
                              className="p-1 rounded-md text-th-muted hover:text-teal-400 hover:bg-th-surface transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                              <ChevronDown size={14} />
                            </button>
                          </div>

                          {/* Main Title & Details */}
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id!)}>
                            <h3 className="font-bold text-th-text tracking-tight text-sm">
                              {isAr ? (section.titleAr || section.title) : (section.title || section.titleAr)}
                            </h3>
                            <p className="text-[11px] text-th-muted mt-1 truncate max-w-lg">
                              {stripHtml(isAr ? (section.contentAr || section.content) : (section.content || section.contentAr)).slice(0, 120)}...
                            </p>
                            
                            {/* Nested links quick preview */}
                            {section.links && section.links.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {section.links.map((link, lIdx) => (
                                  <Badge key={lIdx} color="teal" size="sm">
                                    {isAr ? link.nAr : link.n}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id!)}
                              className="p-2 rounded-lg bg-th-surface text-th-muted hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                              <Eye size={15} />
                            </button>
                            <button onClick={() => openEditGuide(section)}
                              className="p-2 rounded-lg bg-th-surface text-th-muted hover:text-teal-400 hover:bg-th-surface2 transition-all">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDeleteGuide(section.id!)}
                              className="p-2 rounded-lg bg-th-surface text-th-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Preview */}
                        <AnimatePresence>
                          {expandedSectionId === section.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-th-border overflow-hidden"
                            >
                              <div className="p-5 prose prose-sm prose-invert max-w-none text-th-muted text-[13px] leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: isAr ? (section.contentAr || section.content) : (section.content || section.contentAr) }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Tab 2: Marine Species */}
            {activeTab === 'species' && (
              <div>
                {species.length === 0 && (
                  <div className="py-20 text-center text-th-muted text-sm italic">
                    {isAr ? 'لا توجد كائنات بحرية مضافة بعد.' : 'No marine species yet. Add a species to get started.'}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {species.map((sp, i) => (
                      <motion.div
                        key={sp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="group overflow-hidden border border-th-border bg-th-surface2 backdrop-blur-xl hover:border-teal-500/20 hover:shadow-[0_0_30px_rgba(20,184,166,0.08)] transition-all duration-500 flex flex-col h-full justify-between">
                          {/* Image Header */}
                          <div className="relative h-44 bg-th-surface2 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
                            {sp.imageUrl ? (
                              <img src={sp.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Fish size={50} className="text-teal-500/10" />
                              </div>
                            )}
                            <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-20`}>
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                {isAr ? (sp.statusAr || sp.status) : (sp.status || sp.statusAr)}
                              </span>
                            </div>
                            <div className={`absolute bottom-4 ${isAr ? 'right-4' : 'left-4'} z-20`}>
                              <span className="text-[9px] font-black text-teal-400 tracking-wider uppercase bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/10 block w-fit mb-1">
                                {isAr ? (sp.typeAr || sp.type) : (sp.type || sp.typeAr)}
                              </span>
                              <h3 className="text-th-text font-bold text-lg tracking-tight">
                                {isAr ? sp.nameAr : sp.name}
                              </h3>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div className="text-xs text-th-muted leading-relaxed mb-4">
                              <p className="line-clamp-3">
                                {stripHtml(isAr ? (sp.descriptionAr || sp.description || '') : (sp.description || sp.descriptionAr || ''))}
                              </p>
                            </div>
                            <div className="flex gap-2 border-t border-th-border pt-4">
                              <Button intent="outline" onClick={() => openEditSpecies(sp)}
                                className="flex-1 border-th-border bg-th-surface text-th-text hover:bg-th-surface2 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl py-2.5">
                                <Pencil size={13} /> {isAr ? 'تعديل' : 'Edit'}
                              </Button>
                              <Button intent="ghost" onClick={() => handleDeleteSpecies(sp.id!)}
                                className="px-3 border border-transparent text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl py-2.5">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Tab 3: Explore Terrain */}
            {activeTab === 'terrain' && (
              <div>
                {locations.length === 0 && (
                  <div className="py-20 text-center text-th-muted text-sm italic">
                    {isAr ? 'لا توجد مواقع جغرافية مضافة بعد.' : 'No terrain locations yet. Add a location to get started.'}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {locations.map((loc, i) => (
                      <motion.div
                        key={loc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="group overflow-hidden border border-th-border bg-th-surface2 backdrop-blur-xl hover:border-teal-500/20 hover:shadow-[0_0_30px_rgba(20,184,166,0.08)] transition-all duration-500 flex flex-col h-full justify-between">
                          {/* Image Header */}
                          <div className="relative h-44 bg-th-surface2 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
                            {loc.imageUrl ? (
                              <img src={loc.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <MapPin size={50} className="text-teal-500/10" />
                              </div>
                            )}
                            <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-20`}>
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                {isAr ? (loc.statusAr || loc.status) : (loc.status || loc.statusAr)}
                              </span>
                            </div>
                            <div className={`absolute bottom-4 ${isAr ? 'right-4' : 'left-4'} z-20`}>
                              <span className="text-[9px] font-black text-teal-400 tracking-wider uppercase bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/10 block w-fit mb-1">
                                {isAr ? (loc.typeAr || loc.type) : (loc.type || loc.typeAr)}
                              </span>
                              <h3 className="text-th-text font-bold text-lg tracking-tight">
                                {isAr ? loc.nameAr : loc.name}
                              </h3>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex gap-2 items-center text-[10px] text-th-muted font-bold tracking-wide uppercase">
                                <Globe size={11} className="text-th-muted" />
                                <span>Lat: {loc.latitude}</span>
                                <span>•</span>
                                <span>Lng: {loc.longitude}</span>
                              </div>
                              <p className="text-xs text-th-muted leading-relaxed line-clamp-3">
                                {stripHtml(isAr ? (loc.descriptionAr || loc.description || '') : (loc.description || loc.descriptionAr || ''))}
                              </p>
                            </div>
                            <div className="flex gap-2 border-t border-th-border pt-4">
                              <Button intent="outline" onClick={() => openEditTerrain(loc)}
                                className="flex-1 border-th-border bg-th-surface text-th-text hover:bg-th-surface2 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl py-2.5">
                                <Pencil size={13} /> {isAr ? 'تعديل' : 'Edit'}
                              </Button>
                              <Button intent="ghost" onClick={() => handleDeleteTerrain(loc.id!)}
                                className="px-3 border border-transparent text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl py-2.5">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Global Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-[#0d1b2a] border border-th-border rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-th-text">{confirmModal.title}</h3>
                <p className="text-sm text-th-muted">{confirmModal.message}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button intent="outline" onClick={() => setConfirmModal(p => ({ ...p, isOpen: false }))}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button intent="accent" onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(p => ({ ...p, isOpen: false }));
                }}>
                  {isAr ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
