'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, 
  Shield, 
  Bell, 
  Globe, 
  Database,
  Save,
  CheckCircle2,
  Lock,
  Smartphone,
  UserCog,
  MapPin,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ─── Settings Data ────────────────────────────────────────────────────────
const TABS = [
  { id: 'general', icon: Globe, label: 'General', labelAr: 'الإعدادات العامة' },
  { id: 'security', icon: Shield, label: 'Security', labelAr: 'الأمن وصلاحيات الوصول' },
  { id: 'defaults', icon: Database, label: 'Data Defaults', labelAr: 'إعدادات الإدخال' },
  { id: 'notifications', icon: Bell, label: 'Notifications', labelAr: 'التنبيهات' },
];

export default function SettingsPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <div className="w-8 h-1 bg-teal-500 rounded-full" />
             <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                 {isArabic ? 'تكوين النظام' : 'System Configuration'}
             </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            {isArabic ? 'إعدادات النظام' : 'System Settings'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {showSaved && (
              <motion.div 
                initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isArabic ? -20 : 20 }}
                className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20"
              >
                <CheckCircle2 size={18} />
                <span className="text-[11px] font-bold tracking-widest uppercase">{isArabic ? 'تم الحفظ بنجاح' : 'Changes Saved'}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Button 
            intent="primary" 
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl py-3.5 px-8 flex items-center gap-2.5 shadow-[0_0_20px_rgba(45,212,191,0.2)] bg-teal-500 text-[#001529] hover:bg-teal-400 uppercase italic"
          >
             {isSaving ? (
               <div className="w-5 h-5 border-2 border-[#001529]/30 border-t-[#001529] rounded-full animate-spin" />
             ) : (
               <Save size={18} strokeWidth={3} />
             )}
             <span className="font-black tracking-tight text-[13px]">{isArabic ? 'حفظ التعديلات' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ── Sidebar Navigation ───────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${
                  isActive 
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                    : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-teal-400' : 'text-slate-500'} />
                <span className="text-[13px] font-bold tracking-widest uppercase">
                  {isArabic ? tab.labelAr : tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Settings Content ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/5 overflow-hidden">
             
             {/* General Settings */}
             {activeTab === 'general' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
                 <div className="border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-xl font-black text-white tracking-tighter">{isArabic ? 'الإعدادات العامة' : 'General Configuration'}</h2>
                    <p className="text-sm text-slate-400 mt-1">{isArabic ? 'تكوين الخيارات الأساسية للنظام' : 'Configure basic system preferences.'}</p>
                 </div>

                 <div className="space-y-6 max-w-2xl">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isArabic ? 'لغة النظام الافتراضية' : 'Default Language'}</label>
                       <select className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 appearance-none">
                         <option value="ar">العربية (Arabic)</option>
                         <option value="en">English (English)</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isArabic ? 'المنطقة الزمنية' : 'Timezone'}</label>
                       <div className="relative">
                         <Clock className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-4' : 'left-4'} text-slate-500`} size={18} />
                         <select className={`w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-white outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 appearance-none`}>
                           <option value="Cairo">Africa/Cairo (UTC+2)</option>
                           <option value="Riyadh">Asia/Riyadh (UTC+3)</option>
                         </select>
                       </div>
                    </div>
                 </div>
               </motion.div>
             )}

             {/* Security Settings */}
             {activeTab === 'security' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
                 <div className="border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-xl font-black text-white tracking-tighter">{isArabic ? 'الأمن وصلاحيات الوصول' : 'Security & Access'}</h2>
                    <p className="text-sm text-slate-400 mt-1">{isArabic ? 'إدارة سياسات الأمان والمصادقة الثنائية' : 'Manage security policies and 2FA.'}</p>
                 </div>

                 <div className="space-y-6 max-w-2xl">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
                             <Smartphone size={24} />
                          </div>
                          <div>
                             <h3 className="font-bold text-white text-sm">{isArabic ? 'المصادقة الثنائية (2FA)' : 'Two-Factor Authentication'}</h3>
                             <p className="text-xs text-slate-400 mt-1">{isArabic ? 'إلزام جميع الموظفين بتفعيل 2FA' : 'Require all staff to use 2FA'}</p>
                          </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                       </label>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isArabic ? 'مهلة الجلسة (دقائق)' : 'Session Timeout (Minutes)'}</label>
                       <div className="relative">
                         <Lock className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-4' : 'left-4'} text-slate-500`} size={18} />
                         <input type="number" defaultValue={30} className={`w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-white outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10`} />
                       </div>
                    </div>
                 </div>
               </motion.div>
             )}

             {/* Defaults Settings */}
             {activeTab === 'defaults' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
                 <div className="border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-xl font-black text-white tracking-tighter">{isArabic ? 'القيم الافتراضية لإدخال البيانات' : 'Data Entry Defaults'}</h2>
                    <p className="text-sm text-slate-400 mt-1">{isArabic ? 'تكوين الخيارات الافتراضية للنماذج لتسريع العمليات' : 'Configure default form values to speed up operations.'}</p>
                 </div>

                 <div className="space-y-6 max-w-2xl">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isArabic ? 'محمية التعيين الافتراضية' : 'Default Reserve Zone'}</label>
                       <div className="relative">
                         <MapPin className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-4' : 'left-4'} text-slate-500`} size={18} />
                         <select className={`w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-white outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 appearance-none`}>
                           <option value="northern">Northern Islands</option>
                           <option value="wadi">Wadi El Gemal</option>
                           <option value="elba">Gebel Elba</option>
                         </select>
                       </div>
                    </div>
                 </div>
               </motion.div>
             )}

             {/* Notifications Settings */}
             {activeTab === 'notifications' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
                 <div className="border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-xl font-black text-white tracking-tighter">{isArabic ? 'إعدادات التنبيهات' : 'Notification Settings'}</h2>
                    <p className="text-sm text-slate-400 mt-1">{isArabic ? 'إدارة قنوات التنبيه وشروط الإرسال' : 'Manage alert channels and thresholds.'}</p>
                 </div>

                 <div className="space-y-4 max-w-2xl">
                    {[
                      { id: 'env', label: 'Environmental Anomalies', labelAr: 'الشذوذ البيئي' },
                      { id: 'patrol', label: 'Patrol Distress / Emergencies', labelAr: 'طوارئ الدوريات' },
                      { id: 'violation', label: 'High Severity Violations', labelAr: 'المخالفات الجسيمة' },
                    ].map(item => (
                       <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                         <span className="font-bold text-white text-sm">{isArabic ? item.labelAr : item.label}</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                         </label>
                       </div>
                    ))}
                 </div>
               </motion.div>
             )}

          </Card>
        </div>

      </div>
    </div>
  );
}
