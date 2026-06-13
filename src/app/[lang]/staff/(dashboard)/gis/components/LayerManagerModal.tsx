'use client';

import React, { useState } from 'react';
import { useGISStore } from '../store/gisStore';
import { Layers, Plus, Trash2, X, AlertCircle } from 'lucide-react';

export default function LayerManagerModal({ isArabic, onClose }: { isArabic: boolean, onClose: () => void }) {
  const { layers, addLayer, removeLayer } = useGISStore();
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [newLayer, setNewLayer] = useState({
    name: '',
    nameAr: '',
    category: 'custom',
    color: '#3b82f6'
  });

  const handleAddLayer = async () => {
    if (!newLayer.name || !newLayer.nameAr) {
      setErrorMsg(isArabic ? 'يرجى إدخال اسم الطبقة' : 'Please enter layer name');
      return;
    }
    setErrorMsg('');
    const res = await addLayer(newLayer);
    if (res.success) {
      setIsAdding(false);
      setNewLayer({ name: '', nameAr: '', category: 'custom', color: '#3b82f6' });
    } else {
      setErrorMsg(res.error || 'Error adding layer');
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMsg('');
    const res = await removeLayer(id);
    if (!res.success) {
      setErrorMsg(res.error || 'Error deleting layer');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-th-surface w-full max-w-xl rounded-2xl border border-th-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" dir={isArabic ? 'rtl' : 'ltr'}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-th-border bg-th-surface2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
              <Layers size={20} />
            </div>
            <h2 className="font-bold text-lg text-th-text">{isArabic ? 'إدارة طبقات GIS' : 'GIS Layer Manager'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-th-muted hover:bg-th-surface hover:text-th-text transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-2 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Add New Layer Form */}
          {isAdding ? (
            <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 space-y-4">
              <h3 className="font-bold text-teal-500 text-sm mb-2">{isArabic ? 'إنشاء طبقة جديدة' : 'Create New Layer'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الاسم (عربي)' : 'Name (Ar)'}</label>
                  <input type="text" value={newLayer.nameAr} onChange={e => setNewLayer({...newLayer, nameAr: e.target.value})} className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'الاسم (إنجليزي)' : 'Name (En)'}</label>
                  <input type="text" value={newLayer.name} onChange={e => setNewLayer({...newLayer, name: e.target.value})} className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'التصنيف' : 'Category'}</label>
                  <select value={newLayer.category} onChange={e => setNewLayer({...newLayer, category: e.target.value})} className="w-full bg-th-surface border border-th-border rounded-lg px-3 py-2 text-sm text-th-text focus:outline-none focus:border-teal-500">
                    <option value="custom">{isArabic ? 'مخصص / رسم حر' : 'Custom / Drawing'}</option>
                    <option value="project">{isArabic ? 'مشروعات' : 'Projects'}</option>
                    <option value="reserve">{isArabic ? 'محميات' : 'Reserves'}</option>
                    <option value="asset">{isArabic ? 'أصول' : 'Assets'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-th-muted mb-1 block">{isArabic ? 'اللون المميز' : 'Color'}</label>
                  <input type="color" value={newLayer.color} onChange={e => setNewLayer({...newLayer, color: e.target.value})} className="w-full h-[38px] cursor-pointer bg-th-surface border border-th-border rounded-lg p-1" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={handleAddLayer} className="px-4 py-2 bg-teal-500 text-white text-sm font-bold rounded-lg hover:bg-teal-600">
                  {isArabic ? 'حفظ الطبقة' : 'Save Layer'}
                </button>
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 border border-th-border text-th-text text-sm font-bold rounded-lg hover:bg-th-surface2">
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-full py-3 border border-dashed border-th-border rounded-xl flex items-center justify-center gap-2 text-th-muted hover:text-teal-500 hover:bg-teal-500/5 hover:border-teal-500/30 transition-all font-medium text-sm">
              <Plus size={18} />
              {isArabic ? 'إضافة طبقة جديدة' : 'Add New Layer'}
            </button>
          )}

          {/* Existing Layers List */}
          <div className="space-y-2 mt-4">
            {layers.map(layer => (
              <div key={layer.id} className="flex items-center justify-between p-3 rounded-xl border border-th-border bg-th-surface hover:border-th-border-hover transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="w-4 h-4 rounded-full" style={{ backgroundColor: layer.color || '#ccc' }} />
                   <div>
                     <p className="font-bold text-sm text-th-text">{isArabic ? layer.nameAr : layer.name}</p>
                     <p className="text-xs text-th-muted capitalize">{layer.category}</p>
                   </div>
                 </div>
                 {!layer.isLocked ? (
                   <button 
                     onClick={() => handleDelete(layer.id)}
                     className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                     title={isArabic ? 'حذف الطبقة' : 'Delete Layer'}
                   >
                     <Trash2 size={16} />
                   </button>
                 ) : (
                   <span className="text-[10px] text-th-muted select-none font-bold bg-th-surface2 px-2 py-1 rounded-md border border-th-border/50">
                     {isArabic ? 'نظام مغلق' : 'System'}
                   </span>
                 )}
              </div>
            ))}
            {layers.length === 0 && !isAdding && (
              <p className="text-center text-sm text-th-muted py-8">{isArabic ? 'لا توجد طبقات مضافة' : 'No layers found'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
