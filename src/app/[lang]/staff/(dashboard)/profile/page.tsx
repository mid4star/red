'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  ShieldCheck, User as UserIcon, Mail, MapPin, Calendar, CheckCircle2, 
  AlertTriangle, Waves, Microscope, Activity, LayoutDashboard, Anchor, 
  Megaphone, Clock, Award, Key, Target, Camera, Loader2, Map,
  Settings, Ship, ClipboardList, UserPlus, Radio, MessageSquare, Send, X, Inbox, ChevronLeft,
  Check, CheckCheck
} from 'lucide-react';
import { uploadFiles } from '@/utils/uploadthing';
import Image from 'next/image';

const SECTIONS_METADATA: Record<string, { icon: any, label: string, labelAr: string }> = {
  dashboard: { icon: LayoutDashboard, label: 'Dashboard', labelAr: 'لوحة التحكم' },
  patrols: { icon: Waves, label: 'Marine Patrols', labelAr: 'الدوريات البحرية' },
  eia: { icon: ClipboardList, label: 'Environmental Assessment', labelAr: 'تقييم الأثر البيئي' },
  monitoring: { icon: Microscope, label: 'Environmental Monitoring', labelAr: 'الرصد البيئي' },
  violations: { icon: AlertTriangle, label: 'Violations Log', labelAr: 'سجل المخالفات' },
  fleet: { icon: Anchor, label: 'Fleet & Equipment', labelAr: 'الأسطول والمعدات' },
  vessels: { icon: Ship, label: 'Vessel Monitoring', labelAr: 'مراقبة السفن' },
  gis: { icon: Map, label: 'GIS & Maps', labelAr: 'نظم المعلومات الجغرافية' },
  media: { icon: Megaphone, label: 'Media Center', labelAr: 'المركز الإعلامي' },
  radar: { icon: Radio, label: 'News Radar', labelAr: 'الرادار الإخباري' },
  settings: { icon: Settings, label: 'System Settings', labelAr: 'إعدادات النظام' },
  'email-routing': { icon: Mail, label: 'Email Routing', labelAr: 'توجيه البريد' },
  'manage-users': { icon: UserPlus, label: 'Manage Users (CRUD)', labelAr: 'تعديل وإضافة الموظفين' }
};

const PREDEFINED_BADGES = [
  { en: 'Veterinary Doctor', ar: 'دكتور بيطري', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/5' },
  { en: 'GIS Specialist', ar: 'مختص GIS', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 dark:bg-cyan-500/5' },
  { en: 'Reserve Manager', ar: 'مدير محمية', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/5' },
  { en: 'Media Spokesperson', ar: 'متحدث إعلامي', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/5' },
  { en: 'Legal Advisor', ar: 'مستشار قانوني', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20 dark:bg-violet-500/5' },
  { en: 'Administrator', ar: 'إداري', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/5' },
  { en: 'Systems Developer', ar: 'مطور نظم', color: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20 dark:bg-fuchsia-500/5' },
  { en: 'Marine Biology Researcher', ar: 'باحث أحياء بحرية', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5' },
  { en: 'Botany Researcher', ar: 'باحث نبات', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20 dark:bg-teal-500/5' },
  { en: 'Professional Diver', ar: 'غواص محترف', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/5' },
  { en: 'Patrol Leader', ar: 'قائد دورية', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20 dark:bg-orange-500/5' },
  { en: 'Ranger', ar: 'حارس بيئي', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5' },
  { en: 'First Responder', ar: 'مسعف أولي', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/5' },
];

const getBadgeStyle = (badgeName: string) => {
  const nameClean = badgeName.trim().toLowerCase();
  const match = PREDEFINED_BADGES.find(item => 
    item.en.toLowerCase() === nameClean || 
    item.ar.toLowerCase() === nameClean
  );
  if (match) return match.color;
  
  // Default keyword-based styles
  if (nameClean.includes('باحث') || nameClean.includes('researcher') || nameClean.includes('بيئي') || nameClean.includes('environment')) {
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5';
  }
  if (nameClean.includes('طبيب') || nameClean.includes('دكتور') || nameClean.includes('doctor') || nameClean.includes('vet') || nameClean.includes('مسعف')) {
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/5';
  }
  if (nameClean.includes('مدير') || nameClean.includes('manager') || nameClean.includes('مستشار') || nameClean.includes('advisor') || nameClean.includes('قانون')) {
    return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/5';
  }
  if (nameClean.includes('مختص') || nameClean.includes('specialist') || nameClean.includes('gis') || nameClean.includes('مطور') || nameClean.includes('developer') || nameClean.includes('نظم')) {
    return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 dark:bg-cyan-500/5';
  }
  if (nameClean.includes('إعلام') || nameClean.includes('media') || nameClean.includes('متحدث') || nameClean.includes('spokesperson')) {
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/5';
  }
  if (nameClean.includes('غواص') || nameClean.includes('diver') || nameClean.includes('بحر') || nameClean.includes('marine')) {
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/5';
  }
  if (nameClean.includes('إداري') || nameClean.includes('admin') || nameClean.includes('مكتب')) {
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/5';
  }
  
  // Hash function for random but deterministic color for other custom badges
  const colors = [
    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/5',
    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5',
    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 dark:bg-cyan-500/5',
    'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/5',
    'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/5',
    'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20 dark:bg-fuchsia-500/5',
    'bg-sky-500/10 text-sky-500 border-sky-500/20 dark:bg-sky-500/5',
    'bg-teal-500/10 text-teal-500 border-teal-500/20 dark:bg-teal-500/5',
  ];
  let hash = 0;
  for (let i = 0; i < badgeName.length; i++) {
    hash = badgeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ProfilePage({ params: { lang } }: { params: { lang: string } }) {
  const isArabic = lang === 'ar';
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'patrols' | 'violations' | 'surveys'>('patrols');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Messaging & Inbox State
  const [showInbox, setShowInbox] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [thread, setThread] = useState<any[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showNewChatList, setShowNewChatList] = useState(false);

  // Poll unread message count
  useEffect(() => {
    const fetchUnread = () => {
      fetch('/api/staff/messages?countOnly=true')
        .then(r => r.json())
        .then(d => { if (d.success) setUnreadCount(d.unreadCount || 0); })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const res = await fetch('/api/staff/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchThread = async (partnerId: string) => {
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/staff/messages?partnerId=${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        setThread(data.messages || []);
        
        // Mark as read
        await fetch('/api/staff/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partnerId })
        });
        
        // Refresh unread count and conversations list
        fetchConversations();
        fetch('/api/staff/messages?countOnly=true')
          .then(r => r.json())
          .then(d => { if (d.success) setUnreadCount(d.unreadCount || 0); })
          .catch(() => {});
        
        // Dispatch event to update sidebar count
        window.dispatchEvent(new Event('user-session-changed'));
      }
    } catch (err) {
      console.error('Error fetching thread:', err);
    } finally {
      setThreadLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activePartnerId || sendingReply) return;
    setSendingReply(true);
    try {
      const res = await fetch('/api/staff/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activePartnerId, content: replyText.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setThread(prev => [...prev, data.message]);
        setReplyText('');
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const fetchAllUsers = async () => {
    if (!profile?.id) return;
    try {
      const res = await fetch('/api/staff/query?collection=users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers((data.data || []).filter((u: any) => u.id !== profile.id));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const playChime = (time: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
      };
      const now = ctx.currentTime;
      playChime(now, 523.25, 0.3);
      playChime(now + 0.12, 783.99, 0.4);
    } catch (e) {
      console.error('Web Audio play failed:', e);
    }
  };

  // Poll conversations & active thread when inbox is open
  useEffect(() => {
    if (!showInbox) return;
    
    const pollInterval = setInterval(() => {
      // Refresh conversations list in background
      fetch('/api/staff/messages')
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setConversations(d.conversations || []);
          }
        })
        .catch(() => {});

      // Refresh active thread if a conversation is open
      if (activePartnerId) {
        fetch(`/api/staff/messages?partnerId=${activePartnerId}`)
          .then(r => r.json())
          .then(d => {
            if (d.success) {
              const newMessages = d.messages || [];
              
              // Check if we received new messages
              if (newMessages.length > thread.length) {
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg && lastMsg.senderId !== profile?.id) {
                  playNotificationSound();
                }
                setThread(newMessages);
                
                // Mark them as read on the backend
                fetch('/api/staff/messages', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ partnerId: activePartnerId })
                }).catch(() => {});
              } else {
                setThread(newMessages);
              }
            }
          })
          .catch(() => {});
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [showInbox, activePartnerId, thread.length, profile?.id]);

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
      const uploadRes = await uploadFiles("imageUploader", { files: [file] });
      
      if (!uploadRes || uploadRes.length === 0) {
        throw new Error('Upload failed');
      }
      const uploadedUrl = uploadRes[0].url;

      const updateRes = await fetch('/api/staff/profile/picture', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePictureUrl: uploadedUrl })
      });
      const updateData = await updateRes.json();

      if (!updateRes.ok) throw new Error(updateData.error || 'Update failed');

      setProfile({ ...profile, profilePictureUrl: uploadedUrl });

      const sessionRaw = localStorage.getItem('active_user_session');
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        session.profilePictureUrl = uploadedUrl;
        localStorage.setItem('active_user_session', JSON.stringify(session));
        window.dispatchEvent(new Event('user-session-changed'));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError(isArabic ? 'يرجى تعبئة جميع الحقول' : 'Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(isArabic ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(isArabic ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/staff/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setPasswordSuccess(isArabic ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
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
          <div className="flex justify-between items-end -mt-12 sm:-mt-16 md:-mt-20 mb-4 md:mb-6">
            <div className="relative shrink-0 z-10 group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-[4px] md:border-[6px] border-white dark:border-[#0f1c2e] bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xl flex items-center justify-center relative">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 md:w-16 md:h-16 text-slate-400" />
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
            
            <div className="z-10 pb-2">
              <button
                onClick={() => {
                  setShowInbox(true);
                  fetchConversations();
                  fetchAllUsers();
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 cursor-pointer"
              >
                <MessageSquare size={18} />
                {isArabic ? 'صندوق البريد' : 'Mailbox'}
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Name & Title */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 z-10">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isArabic ? profile.nameAr || profile.name : profile.name}
                </h1>
                {profile.role === 'ADMIN' && (
                  <div className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-amber-200 dark:border-amber-500/20 shadow-sm mt-1">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">{isArabic ? 'مسؤول المنصة' : 'System Admin'}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-6 gap-y-3 text-sm font-medium">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 w-fit">
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
                {badgesArray.map((badge: string, i: number) => {
                  const badgeColor = getBadgeStyle(badge);
                  return (
                    <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider shadow-sm ${badgeColor}`}>
                      <Award size={14} className="opacity-70" />
                      {badge}
                    </div>
                  );
                })}
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

          {/* Password Update Card */}
          <Card className="p-6 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl rounded-3xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Key className="text-teal-500" size={20} />
              {isArabic ? 'تغيير كلمة المرور' : 'Update Password'}
            </h3>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={14} /> {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={14} /> {passwordSuccess}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <input 
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder={isArabic ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder={isArabic ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder={isArabic ? 'أعد كتابة كلمة المرور الجديدة' : 'Re-enter new password'}
                />
              </div>

              <button 
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {isArabic ? 'تحديث كلمة المرور' : 'Update Password'}
              </button>
            </form>
          </Card>
        </div>

        {/* Right Column (Stats & Activity) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
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
            <div className="flex items-center border-b border-slate-200 dark:border-white/10 px-2 pt-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
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
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Waves size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{patrol.code || 'Uncoded Patrol'}</h5>
                            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                              <MapPin size={12} className="shrink-0" /> <span className="line-clamp-1">{patrol.zone || (isArabic ? 'منطقة غير محددة' : 'Unknown Zone')}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-end shrink-0 pl-2 rtl:pl-0 rtl:pr-2">
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
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <AlertTriangle size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{violation.type || 'General Violation'}</h5>
                            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                              <MapPin size={12} className="shrink-0" /> <span className="line-clamp-1">{violation.location || (isArabic ? 'موقع غير محدد' : 'Unknown Location')}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-end shrink-0 pl-2 rtl:pl-0 rtl:pr-2">
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
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Microscope size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{survey.target || 'General Survey'}</h5>
                            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                              <MapPin size={12} className="shrink-0" /> <span className="line-clamp-1">{survey.area || (isArabic ? 'منطقة غير محددة' : 'Unknown Area')}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-end shrink-0 pl-2 rtl:pl-0 rtl:pr-2">
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

      {showInbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c1b2a] border border-slate-200 dark:border-white/5 rounded-3xl w-full max-w-5xl h-[80vh] md:h-[650px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a1628]/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {isArabic ? 'صندوق البريد والمحادثات' : 'Mailbox & Conversations'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {isArabic ? 'تواصل مع أعضاء الفريق والزملاء بالمنصة' : 'Chat with team members and colleagues'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowInbox(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Panel: Conversations / New Chat */}
              <div className={`w-full md:w-80 border-r border-slate-200 dark:border-white/5 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-[#060e18]/40 ${activePartnerId ? 'hidden md:flex' : 'flex'}`}>
                
                {/* Search / Toggle Actions */}
                <div className="p-4 border-b border-slate-200 dark:border-white/5 space-y-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {showNewChatList 
                        ? (isArabic ? 'بدء محادثة جديدة' : 'Start New Chat')
                        : (isArabic ? 'المحادثات الأخيرة' : 'Recent Chats')
                      }
                    </span>
                    <button
                      onClick={() => setShowNewChatList(!showNewChatList)}
                      className="text-xs font-black text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      {showNewChatList 
                        ? (isArabic ? 'رجوع للمحادثات' : 'Back to Chats')
                        : (isArabic ? 'محادثة جديدة' : 'New Chat')
                      }
                    </button>
                  </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {showNewChatList ? (
                    // New Chat List (All Users)
                    allUsers.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs font-bold uppercase italic">
                        {isArabic ? 'لا يوجد مستخدمون آخرون' : 'No other users found'}
                      </div>
                    ) : (
                      allUsers.map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setActivePartnerId(u.id);
                            setShowNewChatList(false);
                            fetchThread(u.id);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex items-center justify-center shrink-0">
                            {u.profilePictureUrl ? (
                              <img src={u.profilePictureUrl} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                              {isArabic ? u.nameAr || u.name : u.name}
                            </h4>
                            <span className="text-[10px] font-semibold text-slate-500 block truncate uppercase tracking-wider mt-0.5">
                              {u.role}
                            </span>
                          </div>
                        </button>
                      ))
                    )
                  ) : (
                    // Recent Conversations List
                    conversationsLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="animate-spin text-indigo-500" size={24} />
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center py-16 text-slate-500 text-xs font-bold uppercase italic">
                        {isArabic ? 'لا توجد محادثات سابقة' : 'No recent conversations'}
                      </div>
                    ) : (
                      conversations.map((conv: any) => {
                        const isSelected = activePartnerId === conv.partnerId;
                        return (
                          <button
                            key={conv.partnerId}
                            onClick={() => {
                              setActivePartnerId(conv.partnerId);
                              fetchThread(conv.partnerId);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left cursor-pointer group ${
                              isSelected 
                                ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20' 
                                : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                                {conv.partner?.profilePictureUrl ? (
                                  <img src={conv.partner.profilePictureUrl} alt={conv.partner.name} className="w-full h-full object-cover" />
                                ) : (
                                  <UserIcon size={18} className="text-slate-400" />
                                )}
                              </div>
                              {conv.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-md">
                                  {conv.unreadCount}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className={`font-bold text-sm truncate transition-colors ${
                                  isSelected 
                                    ? 'text-indigo-500 dark:text-indigo-400' 
                                    : 'text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                                }`}>
                                  {isArabic ? conv.partner?.nameAr || conv.partner?.name : conv.partner?.name}
                                </h4>
                                <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                                  {new Date(conv.lastMessageAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {conv.lastMessageByMe && (isArabic ? 'أنت: ' : 'You: ')}
                                {conv.lastMessage}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )
                  )}
                </div>
              </div>

              {/* Right Panel: Chat Thread */}
              <div className={`flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0c1b2a] ${!activePartnerId ? 'hidden md:flex' : 'flex'}`}>
                {activePartnerId ? (
                  <>
                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-[#060e18]/20 shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActivePartnerId(null)}
                          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        {/* Partner details */}
                        {(() => {
                          const partner = conversations.find(c => c.partnerId === activePartnerId)?.partner || allUsers.find(u => u.id === activePartnerId);
                          return (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                                {partner?.profilePictureUrl ? (
                                  <img src={partner.profilePictureUrl} alt={partner.name} className="w-full h-full object-cover" />
                                ) : (
                                  <UserIcon size={18} className="text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm text-left">
                                  {isArabic ? partner?.nameAr || partner?.name : partner?.name}
                                </h3>
                                <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest block text-left">
                                  {partner?.role}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar flex flex-col">
                      {threadLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                          <Loader2 className="animate-spin text-indigo-500" size={28} />
                        </div>
                      ) : thread.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs italic font-bold uppercase">
                          {isArabic ? 'اكتب رسالة للبدء بالدردشة' : 'Write a message to start chatting'}
                        </div>
                      ) : (
                        thread.map((msg: any) => {
                          const isMe = msg.senderId === profile.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                            >
                              <div className={`p-3.5 rounded-2xl text-sm ${
                                isMe 
                                  ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-br-none shadow-md shadow-indigo-500/10' 
                                  : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/50 dark:border-white/5'
                              }`}>
                                <p className="whitespace-pre-wrap leading-relaxed break-words text-left">{msg.content}</p>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 px-1">
                                <span className="text-[9px] text-slate-400 font-semibold">
                                  {new Date(msg.createdAt).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && (
                                  msg.isRead ? (
                                    <CheckCheck size={12} className="text-sky-400 shrink-0" />
                                  ) : (
                                    <Check size={12} className="text-slate-400/50 shrink-0" />
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Reply Form */}
                    <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#060e18]/20 shrink-0">
                      <div className="flex items-end gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={isArabic ? 'اكتب رسالة...' : 'Type a message...'}
                          className="flex-1 max-h-24 min-h-[40px] h-10 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm py-2 px-2 resize-none custom-scrollbar"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                        />
                        <button
                          onClick={handleSendReply}
                          disabled={!replyText.trim() || sendingReply}
                          className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-indigo-500/15 shrink-0"
                        >
                          {sendingReply ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Send size={16} className={isArabic ? 'rotate-180' : ''} />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 text-center">
                    <MessageSquare size={64} className="mb-4 opacity-20" />
                    <h3 className="font-black text-sm uppercase tracking-widest mb-1">
                      {isArabic ? 'لم يتم اختيار محادثة' : 'No conversation selected'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 max-w-xs">
                      {isArabic ? 'اختر مستخدماً من القائمة الجانبية لبدء المحادثة أو الدردشة' : 'Select a user from the sidebar list to view the conversation or start chatting'}
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
