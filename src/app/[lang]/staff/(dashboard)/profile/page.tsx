'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  ShieldCheck, User as UserIcon, Mail, MapPin, Calendar, CheckCircle2, 
  AlertTriangle, Waves, Microscope, Activity, LayoutDashboard, Anchor, 
  Megaphone, Clock, Award, Key, Target, Camera, Loader2
} from 'lucide-react';
import Image from 'next/image';

const SECTIONS_METADATA: Record<string, { icon: any, label: string, labelAr: string }> = {
  dashboard: { icon: LayoutDashboard, label: 'Dashboard', labelAr: 'لوحة التحكم' },
  patrols: { icon: Waves, label: 'Patrols', labelAr: 'الدوريات البحرية' },
  eia: { icon: Target, label: 'EIA', labelAr: 'تقييم الأثر البيئي' },
  monitoring: { icon: Microscope, label: 'Monitoring', labelAr: 'الرصد البيئي' },
  violations: { icon: AlertTriangle, label: 'Violations', labelAr: 'المخالفات' },
  fleet: { icon: Anchor, label: 'Fleet', labelAr: 'الأسطول' },
  media: { icon: Megaphone, label: 'Media', labelAr: 'الإعلام' }
};

export default function ProfilePage({ params: { lang } }: { params: { lang: string } }) {
  const isArabic = lang === 'ar';
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'patrols' | 'violations' | 'surveys'>('patrols');

  useEffect(() => {
    fetch('/api/staff/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfile(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      const updateRes = await fetch('/api/staff/profile/picture', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePictureUrl: uploadData.url })
      });
      const updateData = await updateRes.json();

      if (!updateRes.ok) throw new Error(updateData.error || 'Update failed');

      setProfile({ ...profile, profilePictureUrl: uploadData.url });

      const sessionRaw = localStorage.getItem('active_user_session');
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        session.profilePictureUrl = uploadData.url;
        localStorage.setItem('active_user_session', JSON.stringify(session));
        window.dispatchEvent(new Event('user-session-changed'));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-500">
        <UserIcon size={64} className="mb-4 opacity-50" />
        <h2 className="text-xl font-bold">{isArabic ? 'لم يتم العثور على الملف الشخصي' : 'Profile not found'}</h2>
      </div>
    );
  }

  const isOnline = profile.lastActive && (Date.now() - new Date(profile.lastActive).getTime() < 2 * 60 * 1000);
  const badgesArray = profile.badges ? (Array.isArray(profile.badges) ? profile.badges : typeof profile.badges === 'string' && profile.badges.startsWith('[') ? JSON.parse(profile.badges) : []) : [];
  const allowedSections = profile.allowedSections ? (Array.isArray(profile.allowedSections) ? profile.allowedSections : typeof profile.allowedSections === 'string' && profile.allowedSections.startsWith('[') ? JSON.parse(profile.allowedSections) : []) : [];
  const certificationsArray = profile.certifications ? profile.certifications.split(',').map((s:string) => s.trim()).filter(Boolean) : [];

  return (
    <div className={`p-4 md:p-8 space-y-8 max-w-7xl mx-auto ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* ── Cover & Header ────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#0a1628]/80 shadow-2xl border border-slate-200 dark:border-white/5 backdrop-blur-xl pb-8">
        {/* Abstract Gradient Cover (Fixed for all users) */}
        <div className="h-40 md:h-56 w-full bg-gradient-to-r from-teal-900 via-[#0a1628] to-teal-900 relative overflow-hidden">
           {/* Subtle pattern */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
           {/* Glows */}
           <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />
           <div className="absolute -top-24 left-1/4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
        </div>

        {/* Profile Info Wrapper */}
        <div className="px-6 md:px-10 relative">
          
          {/* Avatar (Overlapping cover) */}
          <div className="flex justify-between items-end -mt-16 md:-mt-20 mb-4 md:mb-6">
            <div className="relative shrink-0 z-10 group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white dark:border-[#0f1c2e] bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xl flex items-center justify-center relative">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={64} className="text-slate-400" />
                )}
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  {uploading ? (
                    <Loader2 size={28} className="animate-spin mb-1" />
                  ) : (
                    <>
                      <Camera size={28} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{isArabic ? 'تحديث الصورة' : 'Update'}</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              {isOnline && (
                <div 
                  className={`absolute bottom-3 ${isArabic ? 'left-3' : 'right-3'} w-6 h-6 bg-emerald-500 border-4 border-white dark:border-[#0f1c2e] rounded-full z-20 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse`} 
                  title={isArabic ? 'متصل الآن' : 'Online Now'}
                />
              )}
            </div>
            
            {/* Action buttons could go here on the right/left */}
          </div>

          {/* Name & Title */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 z-10">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isArabic ? profile.nameAr || profile.name : profile.name}
                </h1>
                {profile.role === 'ADMIN' && (
                  <div className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-amber-200 dark:border-amber-500/20 shadow-sm mt-1">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">{isArabic ? 'مسؤول المنصة' : 'System Admin'}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                  <Key size={14} className="text-teal-500" /> 
                  <span className="opacity-70 text-xs mr-1 uppercase">ID:</span> {profile.employeeId}
                </span>
                
                {profile.customDomainEmail && (
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-teal-500 transition-colors cursor-pointer">
                    <Mail size={16} className="text-teal-500/70" /> {profile.customDomainEmail}
                  </span>
                )}
                {profile.email && !profile.customDomainEmail && (
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-teal-500 transition-colors cursor-pointer">
                    <Mail size={16} className="text-slate-400" /> {profile.email}
                  </span>
                )}
              </div>
            </div>

            {/* Badges on the side */}
            {badgesArray.length > 0 && (
              <div className="flex flex-wrap md:justify-end gap-2 shrink-0 md:max-w-[300px]">
                {badgesArray.map((badge: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-teal-50 dark:from-teal-900/30 to-emerald-50 dark:to-emerald-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
                    <Award size={14} className="opacity-70" />
                    {badge}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Identity & Details) */}
        <div className="space-y-8">
          
          <Card className="p-6 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl rounded-3xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <UserIcon className="text-teal-500" size={20} />
              {isArabic ? 'البيانات الوظيفية' : 'Professional Identity'}
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">{isArabic ? 'الرتبة الوظيفية' : 'System Role'}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile.role}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">{isArabic ? 'محمية التعيين' : 'Assigned Reserve'}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile.reserveAr || profile.reserve || (isArabic ? 'غير محدد' : 'Unassigned')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">{isArabic ? 'تاريخ الانضمام' : 'Joined Date'}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {new Date(profile.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">{isArabic ? 'حالة الحساب' : 'Account Status'}</p>
                  <p className={`font-black mt-0.5 ${profile.status === 'ACTIVE' ? 'text-emerald-500' : profile.status === 'ON_LEAVE' ? 'text-amber-500' : 'text-red-500'}`}>
                    {profile.status}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Certifications */}
          {certificationsArray.length > 0 && (
            <Card className="p-6 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl rounded-3xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Award className="text-teal-500" size={20} />
                {isArabic ? 'الشهادات والمؤهلات' : 'Certifications'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {certificationsArray.map((cert: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-teal-500" />
                    {cert}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Permissions */}
          {profile.role !== 'ADMIN' && allowedSections.length > 0 && (
            <Card className="p-6 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl rounded-3xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Key className="text-teal-500" size={20} />
                {isArabic ? 'الصلاحيات الممنوحة' : 'Granted Permissions'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {allowedSections.map((sec: string) => {
                  const meta = SECTIONS_METADATA[sec] || { icon: CheckCircle2, label: sec, labelAr: sec };
                  const Icon = meta.icon;
                  return (
                    <div key={sec} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                      <Icon size={16} className="text-teal-500 shrink-0" />
                      <span className="text-xs font-bold line-clamp-1">{isArabic ? meta.labelAr : meta.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (Stats & Activity) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* KPI Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <Card className="p-5 md:p-6 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-3xl -z-10 group-hover:bg-blue-500/20 transition-all" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Waves size={24} />
                </div>
              </div>
              <h4 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{profile.patrolsParticipated?.length || 0}</h4>
              <p className="text-xs md:text-sm font-bold text-slate-500 mt-1 uppercase">{isArabic ? 'دوريات مكتملة' : 'Completed Patrols'}</p>
            </Card>

            <Card className="p-5 md:p-6 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full filter blur-3xl -z-10 group-hover:bg-rose-500/20 transition-all" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <h4 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{profile.violationsReported?.length || 0}</h4>
              <p className="text-xs md:text-sm font-bold text-slate-500 mt-1 uppercase">{isArabic ? 'مخالفات مسجلة' : 'Reported Violations'}</p>
            </Card>

            <Card className="p-5 md:p-6 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full filter blur-3xl -z-10 group-hover:bg-purple-500/20 transition-all" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Microscope size={24} />
                </div>
              </div>
              <h4 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{profile.surveysConducted?.length || 0}</h4>
              <p className="text-xs md:text-sm font-bold text-slate-500 mt-1 uppercase">{isArabic ? 'استبيانات رصد' : 'Conducted Surveys'}</p>
            </Card>
          </div>

          {/* Activity Logs */}
          <Card className="bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl rounded-3xl overflow-hidden flex flex-col min-h-[500px]">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-slate-200 dark:border-white/10 px-2 pt-2">
              {[
                { id: 'patrols', label: 'Patrols History', labelAr: 'سجل الدوريات', icon: Waves },
                { id: 'violations', label: 'Reported Violations', labelAr: 'المخالفات المسجلة', icon: AlertTriangle },
                { id: 'surveys', label: 'Survey Logs', labelAr: 'تقارير الرصد', icon: Microscope },
              ].map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold transition-all ${
                      isActive 
                        ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-500/5' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    {isArabic ? tab.labelAr : tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              
              {/* Patrols Tab */}
              {activeTab === 'patrols' && (
                <div className="space-y-4">
                  {profile.patrolsParticipated?.length > 0 ? (
                    profile.patrolsParticipated.map((patrol: any) => (
                      <div key={patrol.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-teal-500/30 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Waves size={20} />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm">{patrol.code || 'Uncoded Patrol'}</h5>
                            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                              <MapPin size={12} /> {patrol.zone || (isArabic ? 'منطقة غير محددة' : 'Unknown Zone')}
                            </p>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${patrol.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {patrol.status}
                          </span>
                          <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1 justify-end">
                            <Clock size={12} /> {new Date(patrol.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 font-medium flex flex-col items-center">
                       <Waves size={48} className="mb-4 opacity-20" />
                       {isArabic ? 'لا توجد دوريات مسجلة' : 'No patrols logged yet'}
                    </div>
                  )}
                </div>
              )}

              {/* Violations Tab */}
              {activeTab === 'violations' && (
                <div className="space-y-4">
                  {profile.violationsReported?.length > 0 ? (
                    profile.violationsReported.map((violation: any) => (
                      <div key={violation.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-rose-500/30 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <AlertTriangle size={20} />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{violation.type || 'General Violation'}</h5>
                            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                              <MapPin size={12} /> {violation.location || (isArabic ? 'موقع غير محدد' : 'Unknown Location')}
                            </p>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${violation.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {violation.status}
                          </span>
                          <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1 justify-end">
                            <Clock size={12} /> {new Date(violation.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 font-medium flex flex-col items-center">
                       <AlertTriangle size={48} className="mb-4 opacity-20" />
                       {isArabic ? 'لم يتم تسجيل أي مخالفات' : 'No violations reported'}
                    </div>
                  )}
                </div>
              )}

              {/* Surveys Tab */}
              {activeTab === 'surveys' && (
                <div className="space-y-4">
                  {profile.surveysConducted?.length > 0 ? (
                    profile.surveysConducted.map((survey: any) => (
                      <div key={survey.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-purple-500/30 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Microscope size={20} />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{survey.target || 'General Survey'}</h5>
                            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                              <MapPin size={12} /> {survey.area || (isArabic ? 'منطقة غير محددة' : 'Unknown Area')}
                            </p>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${survey.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                            {survey.status}
                          </span>
                          <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1 justify-end">
                            <Clock size={12} /> {new Date(survey.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 font-medium flex flex-col items-center">
                       <Microscope size={48} className="mb-4 opacity-20" />
                       {isArabic ? 'لا توجد عمليات رصد مسجلة' : 'No surveys conducted yet'}
                    </div>
                  )}
                </div>
              )}

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
