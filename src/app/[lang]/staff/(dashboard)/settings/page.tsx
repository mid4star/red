'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Globe,
   Shield,
   Phone,
   Mail,
   MapPin,
   Save,
   CheckCircle2,
   Loader2,
   ExternalLink,
   Navigation,
   Palette,
   Type
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const TABS = [
   { id: 'identity', icon: Palette, label: 'Site Identity', labelAr: 'هوية الموقع' },
   { id: 'general', icon: Globe, label: 'General & Contacts', labelAr: 'العامة والتواصل' },
   { id: 'social', icon: Navigation, label: 'Social Channels', labelAr: 'قنوات التواصل' },
   { id: 'rescue', icon: Shield, label: 'Distress & Rescue', labelAr: 'الطوارئ والإنقاذ' }
];

export default function SettingsPage({ params }: { params: { lang: string } }) {
   const isArabic = params.lang === 'ar';
   const [activeTab, setActiveTab] = useState('general');
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [showSaved, setShowSaved] = useState(false);

   const [settings, setSettings] = useState({
      siteName: 'Red Sea Reserves',
      siteNameAr: 'محميات البحر الأحمر',
      siteSlogan: 'Strategic Protectorate',
      siteSloganAr: 'مركز الحماية والأبحاث',
      siteTabTitle: 'Red Sea Marine Reserves Authority',
      siteTabTitleAr: 'هيئة محميات البحر الأحمر',
      siteStatus: 'Global Ops: ONLINE',
      siteStatusAr: 'حالة العمليات: نشط',
      siteLogoUrl: '',
      phone: '+20 65 354 8400',
      email: 'info@redsea.gov.sa',
      address: 'El Corniche St., Hurghada, Red Sea Governorate, Arab Republic of Egypt',
      addressAr: 'طريق الكورنيش، الغردقة، محافظة البحر الأحمر، جمهورية مصر العربية',
      latitude: 27.2579,
      longitude: 33.8116,
      facebookUrl: '#',
      twitterUrl: '#',
      youtubeUrl: '#',
      instagramUrl: '#',
      chamberHurghada: '+20 65 344 9150',
      chamberMarsa: '+20 12 224 3333',
      chamberSharm: '+20 69 366 0922'
   });

   // Fetch settings on mount
   useEffect(() => {
      const fetchSettings = async () => {
         try {
            const res = await fetch('/api/staff/query?collection=system_config');
            const json = await res.json();
            if (json.success && json.data && json.data.length > 0) {
               // Load global settings
               const globalConfig = json.data.find((item: any) => item.id === 'global') || json.data[0];
               if (globalConfig) {
                  setSettings({
                     siteName: globalConfig.siteName || 'Red Sea Reserves',
                     siteNameAr: globalConfig.siteNameAr || 'محميات البحر الأحمر',
                     siteSlogan: globalConfig.siteSlogan || 'Strategic Protectorate',
                     siteSloganAr: globalConfig.siteSloganAr || 'مركز الحماية والأبحاث',
                     siteTabTitle: globalConfig.siteTabTitle || 'Red Sea Marine Reserves Authority',
                     siteTabTitleAr: globalConfig.siteTabTitleAr || 'هيئة محميات البحر الأحمر',
                     siteStatus: globalConfig.siteStatus || 'Global Ops: ONLINE',
                     siteStatusAr: globalConfig.siteStatusAr || 'حالة العمليات: نشط',
                     siteLogoUrl: globalConfig.siteLogoUrl || '',
                     phone: globalConfig.phone || '',
                     email: globalConfig.email || '',
                     address: globalConfig.address || '',
                     addressAr: globalConfig.addressAr || '',
                     latitude: parseFloat(globalConfig.latitude) || 27.2579,
                     longitude: parseFloat(globalConfig.longitude) || 33.8116,
                     facebookUrl: globalConfig.facebookUrl || '#',
                     twitterUrl: globalConfig.twitterUrl || '#',
                     youtubeUrl: globalConfig.youtubeUrl || '#',
                     instagramUrl: globalConfig.instagramUrl || '#',
                     chamberHurghada: globalConfig.chamberHurghada || '',
                     chamberMarsa: globalConfig.chamberMarsa || '',
                     chamberSharm: globalConfig.chamberSharm || ''
                  });
               }
            }
         } catch (e) {
            console.error('Failed to load settings from DB:', e);
         } finally {
            setIsLoading(false);
         }
      };
      fetchSettings();
   }, []);

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
         const res = await fetch('/api/staff/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               collectionName: 'system_config',
               action: 'UPDATE',
               id: 'global',
               data: settings
            })
         });
         const json = await res.json();
         if (json.success) {
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 3000);
         } else {
            alert(isArabic ? 'فشل حفظ الإعدادات: ' + json.error : 'Failed to save settings: ' + json.error);
         }
      } catch (err: any) {
         console.error('Failed to save settings:', err);
         alert(err.message);
      } finally {
         setIsSaving(false);
      }
   };

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
            <Loader2 className="animate-spin text-teal-400" size={32} />
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest font-mono">
               {isArabic ? 'جاري تحميل تهيئة النظام...' : 'LOADING SYSTEM CONFIGURATION...'}
            </span>
         </div>
      );
   }

   return (
      <form onSubmit={handleSave} className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700" dir={isArabic ? 'rtl' : 'ltr'}>
         
         {/* ── Page Header ── */}
         <div className="flex flex-wrap items-center justify-between bg-th-surface2 p-4 md:p-6 rounded-2xl border border-th-border shadow-sm gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                  <Globe size={24} />
               </div>
               <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 block mb-1">
                     {isArabic ? 'التحكم في بيانات المنصة' : 'Authority Constants Dashboard'}
                 </span>
                 <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-th-text uppercase m-0 leading-none">
                     {isArabic ? 'إعدادات النظام' : 'System Settings'}
                 </h1>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-start shrink-0">
               <AnimatePresence>
                  {showSaved && (
                     <motion.div
                        initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isArabic ? -20 : 20 }}
                        className="flex items-center justify-center w-full sm:w-auto gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20"
                     >
                        <CheckCircle2 size={18} />
                        <span className="text-[11px] font-bold tracking-widest uppercase">{isArabic ? 'تم الحفظ بنجاح' : 'Changes Saved'}</span>
                     </motion.div>
                  )}
               </AnimatePresence>
               <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 px-4 sm:px-6 rounded-xl h-11 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
               >
                  {isSaving ? (
                     <Loader2 size={18} className="animate-spin" />
                  ) : (
                     <Save size={18} />
                  )}
                  <span className="font-bold tracking-wide">{isArabic ? 'حفظ التعديلات' : 'Save Changes'}</span>
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* ── Sidebar Navigation ───────────────────────────────────────────────── */}
            <div className="lg:col-span-1 flex flex-col gap-2">
               {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border text-start ${
                           isActive
                              ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-md'
                              : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                     >
                        <Icon size={20} className={isActive ? 'text-teal-400' : 'text-slate-500'} />
                        <span className="text-[13px] font-bold tracking-widest uppercase italic">
                           {isArabic ? tab.labelAr : tab.label}
                        </span>
                     </button>
                  );
               })}
            </div>

            {/* ── Settings Content ─────────────────────────────────────────────────── */}
            <div className="lg:col-span-3">
               <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/5 overflow-hidden">
                  
                  {/* Site Identity Settings */}
                  {activeTab === 'identity' && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
                        <div className="border-b border-white/5 pb-4">
                           <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">{isArabic ? 'هوية الموقع والمظهر' : 'Site Identity & Appearance'}</h2>
                           <p className="text-sm text-slate-400 mt-1">{isArabic ? 'تعديل اسم الموقع، الشعار، والنصوص التي تظهر للزوار.' : 'Configure the site name, logo, and public-facing text.'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2 md:col-span-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                 <Palette size={14} className="text-teal-400" />
                                 {isArabic ? 'رابط صورة الشعار (Logo URL)' : 'Logo Image URL'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.siteLogoUrl}
                                 onChange={(e) => setSettings({ ...settings, siteLogoUrl: e.target.value })}
                                 placeholder={isArabic ? 'اترك الحقل فارغاً لاستخدام الشعار الافتراضي (R)' : 'Leave empty for default (R) logo'}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'اسم الموقع (بالعربية)' : 'Site Name (Arabic)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.siteNameAr}
                                 onChange={(e) => setSettings({ ...settings, siteNameAr: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'اسم الموقع (بالإنجليزية)' : 'Site Name (English)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.siteName}
                                 onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'الشعار النصي (Slogan) (بالعربية)' : 'Site Slogan (Arabic)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.siteSloganAr}
                                 onChange={(e) => setSettings({ ...settings, siteSloganAr: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'الشعار النصي (Slogan) (بالإنجليزية)' : 'Site Slogan (English)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.siteSlogan}
                                 onChange={(e) => setSettings({ ...settings, siteSlogan: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'عنوان التبويب (Tab Title) (بالعربية)' : 'Tab Title (Arabic)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.siteTabTitleAr}
                                 onChange={(e) => setSettings({ ...settings, siteTabTitleAr: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'عنوان التبويب (Tab Title) (بالإنجليزية)' : 'Tab Title (English)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.siteTabTitle}
                                 onChange={(e) => setSettings({ ...settings, siteTabTitle: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>
                           
                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                 <Shield size={14} className="text-teal-400" />
                                 {isArabic ? 'حالة الموقع في التذييل (بالعربية)' : 'Site Status Footer (Arabic)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.siteStatusAr}
                                 onChange={(e) => setSettings({ ...settings, siteStatusAr: e.target.value })}
                                 placeholder={isArabic ? 'مثال: حالة العمليات: نشط' : ''}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                 <Shield size={14} className="text-teal-400" />
                                 {isArabic ? 'حالة الموقع في التذييل (بالإنجليزية)' : 'Site Status Footer (English)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.siteStatus}
                                 onChange={(e) => setSettings({ ...settings, siteStatus: e.target.value })}
                                 placeholder={isArabic ? '' : 'e.g. Global Ops: ONLINE'}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                        </div>
                     </motion.div>
                  )}
                  
                  {/* General & Contacts Settings */}
                  {activeTab === 'general' && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
                        <div className="border-b border-white/5 pb-4">
                           <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">{isArabic ? 'الإعدادات العامة والاتصال' : 'General & Contact Info'}</h2>
                           <p className="text-sm text-slate-400 mt-1">{isArabic ? 'تعديل بيانات التواصل الرئيسية للقرية والإحداثيات الجغرافية للمقر الرئيسي.' : 'Configure default contact details and HQ geographic coordinates.'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                 <Phone size={14} className="text-teal-400" />
                                 {isArabic ? 'رقم الهاتف الرئيسي للاتصال' : 'Headquarters Phone'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.phone}
                                 onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                                 required
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                 <Mail size={14} className="text-teal-400" />
                                 {isArabic ? 'البريد الإلكتروني للجهة' : 'Support Email'}
                              </label>
                              <input
                                 type="email"
                                 value={settings.email}
                                 onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                                 required
                              />
                           </div>

                           <div className="space-y-2 md:col-span-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                 <MapPin size={14} className="text-teal-400" />
                                 {isArabic ? 'عنوان المقر الرئيسي (باللغة العربية)' : 'HQ Address (Arabic)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.addressAr}
                                 onChange={(e) => setSettings({ ...settings, addressAr: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                                 required
                              />
                           </div>

                           <div className="space-y-2 md:col-span-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                 <MapPin size={14} className="text-teal-400" />
                                 {isArabic ? 'عنوان المقر الرئيسي (باللغة الإنجليزية)' : 'HQ Address (English)'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.address}
                                 onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                                 required
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'خط عرض المقر الرئيسي (Latitude)' : 'HQ Latitude Coordinate'}
                              </label>
                              <input
                                 type="number"
                                 step="any"
                                 value={settings.latitude}
                                 onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) || 0 })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                                 required
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'خط طول المقر الرئيسي (Longitude)' : 'HQ Longitude Coordinate'}
                              </label>
                              <input
                                 type="number"
                                 step="any"
                                 value={settings.longitude}
                                 onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) || 0 })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                                 required
                              />
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {/* Social Channels Settings */}
                  {activeTab === 'social' && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
                        <div className="border-b border-white/5 pb-4">
                           <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">{isArabic ? 'قنوات التواصل الاجتماعي' : 'Social Channels Links'}</h2>
                           <p className="text-sm text-slate-400 mt-1">{isArabic ? 'تحديث روابط الحسابات الرسمية للهيئة في تذييل المنصة.' : 'Update social media handles rendered in footer sections.'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Facebook URL</label>
                              <input
                                 type="text"
                                 value={settings.facebookUrl}
                                 onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Twitter / X URL</label>
                              <input
                                 type="text"
                                 value={settings.twitterUrl}
                                 onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">YouTube Channel URL</label>
                              <input
                                 type="text"
                                 value={settings.youtubeUrl}
                                 onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Instagram Profile URL</label>
                              <input
                                 type="text"
                                 value={settings.instagramUrl}
                                 onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                              />
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {/* Distress & Rescue Chambers Settings */}
                  {activeTab === 'rescue' && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
                        <div className="border-b border-white/5 pb-4">
                           <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">{isArabic ? 'هواتف مراكز الاستنشاق والإنقاذ' : 'Distress & Rescue Chambers'}</h2>
                           <p className="text-sm text-slate-400 mt-1">{isArabic ? 'تعديل خطوط هواتف غرف الضغط العالي المستخدمة في سيناريوهات الطوارئ.' : 'Edit recompression deco chambers direct telephone lines.'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'هاتف غرفة ضغط الغردقة' : 'Hurghada Chamber Phone'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.chamberHurghada}
                                 onChange={(e) => setSettings({ ...settings, chamberHurghada: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                                 required
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'هاتف غرفة ضغط مرسى علم' : 'Marsa Alam Chamber Phone'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.chamberMarsa}
                                 onChange={(e) => setSettings({ ...settings, chamberMarsa: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                                 required
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                 {isArabic ? 'هاتف غرفة ضغط شرم الشيخ' : 'Sharm El Sheikh Chamber Phone'}
                              </label>
                              <input
                                 type="text"
                                 value={settings.chamberSharm}
                                 onChange={(e) => setSettings({ ...settings, chamberSharm: e.target.value })}
                                 className="w-full bg-[#050b14]/50 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-teal-500/50"
                                 required
                              />
                           </div>
                        </div>
                     </motion.div>
                  )}

               </Card>
            </div>

         </div>
      </form>
   );
}
