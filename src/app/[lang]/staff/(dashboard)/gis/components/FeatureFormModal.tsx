'use client';

import React, { useState } from 'react';
import { useGISStore } from '../store/gisStore';
import { X, Save, Image as ImageIcon, Upload, Activity, Plus, Trash2 } from 'lucide-react';

export default function FeatureFormModal({ 
  isArabic, 
  featureData, 
  onClose, 
  onSave 
}: { 
  isArabic: boolean, 
  featureData: any, 
  onClose: () => void, 
  onSave: (properties: any, layerId: string) => Promise<void> 
}) {
  const { layers } = useGISStore();
  
  const [properties, setProperties] = useState(() => {
    if (featureData && featureData.properties) {
      return {
        name: featureData.properties.name || '',
        nameAr: featureData.properties.nameAr || '',
        description: featureData.properties.description || '',
        descriptionAr: featureData.properties.descriptionAr || '',
        status: featureData.properties.status || 'active',
        progress: featureData.properties.progress || 0,
        images: featureData.properties.images || [],
        readings: featureData.properties.readings || []
      };
    }
    return {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      status: 'active',
      progress: 0,
      images: [] as string[],
      readings: [] as { date: string, type: string, value: number, unit: string }[]
    };
  });
  
  const [newReading, setNewReading] = useState({ type: '', value: '', unit: '' });
  
  const [selectedLayerId, setSelectedLayerId] = useState(() => {
    if (featureData && featureData.layerId) {
      return featureData.layerId;
    }
    return layers.length > 0 ? layers[0].id : '';
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProperties({ ...properties, images: [...properties.images, reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    await onSave(properties, selectedLayerId);
    setIsSaving(false);
    onClose();
  };

  const handleAddReading = () => {
    if (newReading.type && newReading.value !== '') {
      const reading = {
        date: new Date().toISOString(),
        type: newReading.type,
        value: parseFloat(newReading.value),
        unit: newReading.unit || ''
      };
      setProperties({ ...properties, readings: [...properties.readings, reading] });
      setNewReading({ type: '', value: '', unit: '' });
    }
  };

  const removeReading = (index: number) => {
    const newReadings = [...properties.readings];
    newReadings.splice(index, 1);
    setProperties({ ...properties, readings: newReadings });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-th-surface w-full max-w-xl rounded-2xl border border-th-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between p-4 border-b border-th-border bg-th-surface2 shrink-0">
          <h2 className="font-bold text-lg text-th-text">{isArabic ? 'تفاصيل العنصر الجغرافي' : 'Geospatial Feature Details'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-th-muted hover:bg-th-surface hover:text-th-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الاسم (عربي)' : 'Name (Ar)'}</label>
              <input type="text" value={properties.nameAr} onChange={e => setProperties({...properties, nameAr: e.target.value})} className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الاسم (إنجليزي)' : 'Name (En)'}</label>
              <input type="text" value={properties.name} onChange={e => setProperties({...properties, name: e.target.value})} className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الطبقة المستهدفة' : 'Target Layer'}</label>
            <select value={selectedLayerId} onChange={e => setSelectedLayerId(e.target.value)} className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500">
              {layers.map(l => (
                <option key={l.id} value={l.id}>{isArabic ? l.nameAr : l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الحالة' : 'Status'}</label>
            <select value={properties.status} onChange={e => setProperties({...properties, status: e.target.value})} className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500">
              <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
              <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
              <option value="critical">{isArabic ? 'حرج' : 'Critical'}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-th-muted mb-1 flex justify-between">
              <span>{isArabic ? 'نسبة الإنجاز' : 'Progress'}</span>
              <span>{properties.progress}%</span>
            </label>
            <input type="range" min="0" max="100" value={properties.progress} onChange={e => setProperties({...properties, progress: parseInt(e.target.value)})} className="w-full accent-teal-500" />
          </div>

          <div>
            <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الوصف' : 'Description'}</label>
            <textarea value={isArabic ? properties.descriptionAr : properties.description} onChange={e => setProperties(isArabic ? {...properties, descriptionAr: e.target.value} : {...properties, description: e.target.value})} rows={3} className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500"></textarea>
          </div>

          <div>
            <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'إرفاق صورة للموقع' : 'Attach Site Image'}</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-th-border rounded-xl bg-th-surface hover:bg-th-surface2 hover:border-teal-500/50 transition-all">
                <Upload size={20} className="text-th-muted mb-2" />
                <span className="text-xs text-th-muted font-medium">{isArabic ? 'اختر صورة لرفعها' : 'Click to upload image'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {properties.images.length > 0 && (
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-th-border bg-th-surface2 relative">
                  <img src={properties.images[0]} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">1</div>
                </div>
              )}
            </div>
          </div>

          {/* Environmental Readings Section */}
          <div className="p-3 border border-th-border rounded-xl bg-th-surface2 space-y-3">
            <h3 className="text-xs font-bold text-teal-500 flex items-center gap-1 mb-2">
              <Activity size={14} /> 
              {isArabic ? 'القراءات البيئية الدورية' : 'Environmental Readings'}
            </h3>
            
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] text-th-muted block mb-1">{isArabic ? 'المؤشر' : 'Indicator'}</label>
                <input type="text" placeholder={isArabic ? 'مثال: نسبة التلوث' : 'e.g. Salinity'} value={newReading.type} onChange={e => setNewReading({...newReading, type: e.target.value})} className="w-full bg-th-surface border border-th-border rounded-md px-2 py-1 text-xs text-th-text focus:outline-none focus:border-teal-500" />
              </div>
              <div className="w-20">
                <label className="text-[10px] text-th-muted block mb-1">{isArabic ? 'القيمة' : 'Value'}</label>
                <input type="number" placeholder="45" value={newReading.value} onChange={e => setNewReading({...newReading, value: e.target.value})} className="w-full bg-th-surface border border-th-border rounded-md px-2 py-1 text-xs text-th-text focus:outline-none focus:border-teal-500" />
              </div>
              <div className="w-16">
                <label className="text-[10px] text-th-muted block mb-1">{isArabic ? 'الوحدة' : 'Unit'}</label>
                <input type="text" placeholder="%" value={newReading.unit} onChange={e => setNewReading({...newReading, unit: e.target.value})} className="w-full bg-th-surface border border-th-border rounded-md px-2 py-1 text-xs text-th-text focus:outline-none focus:border-teal-500" />
              </div>
              <button onClick={handleAddReading} className="bg-teal-500 text-white p-1.5 rounded-md hover:bg-teal-600 transition-colors h-[26px] mb-[2px]">
                <Plus size={14} />
              </button>
            </div>

            {properties.readings && properties.readings.length > 0 && (
              <div className="space-y-1 mt-2 max-h-24 overflow-y-auto">
                {properties.readings.map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-th-surface p-1.5 rounded border border-th-border text-[10px]">
                    <span className="font-bold text-th-text">{r.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-500 font-bold">{r.value} {r.unit}</span>
                      <span className="text-th-muted">{new Date(r.date).toLocaleDateString()}</span>
                      <button onClick={() => removeReading(i)} className="text-red-500 hover:text-red-700"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-white text-sm font-bold rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-all mt-4 shrink-0">
            <Save size={18} />
            {isSaving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ العنصر' : 'Save Feature')}
          </button>
        </div>
      </div>
    </div>
  );
}
