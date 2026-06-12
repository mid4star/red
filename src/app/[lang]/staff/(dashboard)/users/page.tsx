'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, UserRole } from '@/lib/firebase/schema';
import { 
  Users, ShieldAlert, Plus, Search, CheckCircle2, Loader2, Lock, Check, X, Shield, UserPlus, Trash2, Edit3,
  Waves, Microscope, ClipboardList, AlertTriangle, Anchor, Megaphone, Settings, ShieldCheck, ArrowRight,
  Camera, Mail, Tag, UserCheck, User as UserIcon, Map
} from 'lucide-react';
import Image from 'next/image';

const RESERVES_LIST = [
  { id: 'northern-islands', name: 'Northern Islands', nameAr: 'محمية الجزر الشمالية' },
  { id: 'wadi-el-gemal', name: 'Wadi El Gemal', nameAr: 'محمية وادي الجمال' },
  { id: 'gebel-elba', name: 'Gebel Elba', nameAr: 'محمية جبل علبة' },
  { id: 'coral-reef', name: 'Coral Reef Protectorate', nameAr: 'محمية الحيد المرجاني' },
];

const SECTIONS_METADATA = [
  { id: 'patrols', name: 'Marine Patrols', nameAr: 'الدوريات البحرية', icon: Waves, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/10' },
  { id: 'monitoring', name: 'Environmental Monitoring', nameAr: 'الرصد البيئي', icon: Microscope, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
  { id: 'eia', name: 'Environmental Assessment', nameAr: 'تقييم الأثر البيئي', icon: ClipboardList, color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-500/10' },
  { id: 'gis', name: 'GIS & Maps', nameAr: 'نظم المعلومات الجغرافية', icon: Map, color: 'text-fuchsia-500 dark:text-fuchsia-400', bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/10' },
  { id: 'violations', name: 'Violations Log', nameAr: 'سجل المخالفات', icon: AlertTriangle, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-500/10' },
  { id: 'fleet', name: 'Fleet & Equipment', nameAr: 'الأسطول والمعدات', icon: Anchor, color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-500/10' },
  { id: 'media', name: 'Media Center', nameAr: 'المركز الإعلامي', icon: Megaphone, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10' },
  { id: 'settings', name: 'System Settings', nameAr: 'إعدادات النظام', icon: Settings, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-200 dark:bg-slate-500/10' },
  { id: 'email-routing', name: 'Email Routing', nameAr: 'توجيه البريد', icon: Mail, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/10' },
];

export default function UserManagementPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  
  // Real-time users from Firestore
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Active role from session
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');

  // Load active role from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('active_user_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role) {
          setActiveRole(parsed.role as UserRole);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form fields
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [email, setEmail] = useState('');
  const [customDomainEmail, setCustomDomainEmail] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [badgesText, setBadgesText] = useState('');
  
  const [userRole, setUserRole] = useState<UserRole>('RANGER');
  const [reserveId, setReserveId] = useState(RESERVES_LIST[0].id);
  const [userStatus, setUserStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');
  const [certificationsText, setCertificationsText] = useState('');
  const [allowedSections, setAllowedSections] = useState<string[]>(['patrols', 'monitoring']);
  const [password, setPassword] = useState('');
  const [isEmailManuallyEdited, setIsEmailManuallyEdited] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/query?collection=users');
      if (res.ok) {
        const json = await res.json();
        setUsersList(json.data || []);
      } else {
        console.error('Failed to fetch users from API');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-generate custom domain email when Employee ID changes (for new users)
  useEffect(() => {
    if (!editingUser && employeeId && !isEmailManuallyEdited) {
      setCustomDomainEmail(employeeId.toLowerCase().replace(/\s+/g, '') + '@rsmp-eg.com');
    }
  }, [employeeId, editingUser, isEmailManuallyEdited]);

  // Form Resets
  const resetFormFields = () => {
    setEmployeeId('');
    setName('');
    setNameAr('');
    setEmail('');
    setCustomDomainEmail('');
    setProfilePictureUrl('');
    setBadgesText('');
    setUserRole('RANGER');
    setReserveId(RESERVES_LIST[0].id);
    setUserStatus('ACTIVE');
    setCertificationsText('');
    setAllowedSections(['patrols', 'monitoring']);
    setPassword('');
    setIsEmailManuallyEdited(false);
    setEditingUser(null);
  };

  // Open Edit Mode
  const startEditing = (user: User) => {
    setEditingUser(user);
    setEmployeeId(user.employeeId);
    setName(user.name);
    setNameAr(user.nameAr);
    setEmail(user.email || '');
    setCustomDomainEmail(user.customDomainEmail || '');
    setProfilePictureUrl(user.profilePictureUrl || '');
    setBadgesText(user.badges ? (Array.isArray(user.badges) ? user.badges : typeof user.badges === 'string' && user.badges.startsWith('[') ? JSON.parse(user.badges) : []).join(', ') : '');
    setUserRole(user.role);
    setReserveId(user.reserveId);
    setUserStatus(user.status);
    setCertificationsText(user.certifications ? user.certifications.join(', ') : '');
    setAllowedSections(user.allowedSections || []);
    setPassword('');
    setIsEmailManuallyEdited(true);
    setShowAddForm(true);
    
    // Scroll to top mobile
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Toggle Section Permissions
  const handleSectionToggle = (sectionId: string) => {
    setAllowedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Profile Picture Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setProfilePictureUrl(data.url);
      } else {
        alert(isArabic ? 'فشل رفع الصورة' : 'Image upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(isArabic ? 'حدث خطأ أثناء رفع الصورة' : 'Error occurred during image upload');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Add or Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !name || !nameAr) return;

    setSubmitting(true);
    try {
      const selectedReserve = RESERVES_LIST.find(r => r.id === reserveId);
      const certificationsArray = certificationsText 
        ? certificationsText.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const badgesArray = badgesText 
        ? badgesText.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      if (!editingUser && !password) {
        alert(isArabic ? 'كلمة المرور مطلوبة للمستخدمين الجدد.' : 'Password is required for new users.');
        setSubmitting(false);
        return;
      }

      const userData: any = {
        employeeId: employeeId.trim(),
        name,
        nameAr,
        email: email.trim(),
        customDomainEmail: customDomainEmail.toLowerCase().trim(),
        profilePictureUrl,
        badges: badgesArray,
        role: userRole,
        reserveId,
        reserve: selectedReserve?.name || '',
        reserveAr: selectedReserve?.nameAr || '',
        status: userStatus,
        certifications: certificationsArray,
        allowedSections,
        updatedAt: new Date().toISOString()
      };

      if (password) {
        userData.passwordHash = password;
      }

      if (editingUser?.id) {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'users',
            action: 'UPDATE',
            id: editingUser.id,
            data: userData
          })
        });
        if (!response.ok) throw new Error('Failed to update user');
      } else {
        userData.createdAt = new Date().toISOString();
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'users',
            action: 'ADD',
            id: employeeId,
            data: userData
          })
        });
        if (!response.ok) throw new Error('Failed to add user');
      }

      // Automatically create or attempt to create Email Routing Alias
      if (email && customDomainEmail && customDomainEmail.toLowerCase().includes('@rsmp-eg.com')) {
        const aliasStr = customDomainEmail.split('@')[0].toLowerCase().trim();
        try {
          const cfRes = await fetch('/api/staff/email-routing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              alias: aliasStr,
              destinationEmail: email,
              description: `صندوق بريد تلقائي للموظف ${employeeId} - ${nameAr}`
            })
          });
          const cfData = await cfRes.json();
          if (!cfRes.ok) {
             console.error('Email routing alias auto-creation API error:', cfData);
             alert(isArabic ? `تم حفظ المستخدم بنجاح، لكن فشل إنشاء البريد الوهمي: ${cfData.error}` : `User saved, but failed to create email alias: ${cfData.error}`);
          } else {
             alert(isArabic ? `تم حفظ المستخدم وإنشاء صندوق البريد (${aliasStr}@rsmp-eg.com) بنجاح!` : `User saved and email alias (${aliasStr}@rsmp-eg.com) created successfully!`);
          }
        } catch (cfErr: any) {
          console.error('Email routing alias auto-creation network failed:', cfErr);
          alert(isArabic ? `حدث خطأ في الشبكة أثناء محاولة إنشاء البريد الوهمي.` : `Network error while creating email alias.`);
        }
      } else if (!email && customDomainEmail && customDomainEmail.toLowerCase().includes('@rsmp-eg.com')) {
         alert(isArabic ? 'تم حفظ المستخدم، لكن لم يتم إنشاء البريد الوهمي لعدم إدخال البريد الشخصي (المستقبل).' : 'User saved, but email alias skipped because personal email was not provided.');
      } else {
         alert(isArabic ? 'تم حفظ المستخدم بنجاح!' : 'User saved successfully!');
      }

      resetFormFields();
      setShowAddForm(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Error saving user:', err);
      alert(isArabic ? `حدث خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: User) => {
    if (!user.id) return;
    const confirmMsg = isArabic 
      ? `هل أنت متأكد من حذف حساب الموظف ${user.nameAr} نهائياً؟`
      : `Are you sure you want to delete user ${user.name}?`;
    
    if (confirm(confirmMsg)) {
      setSubmitting(true);
      try {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionName: 'users', action: 'DELETE', id: user.id })
        });
        if (!response.ok) throw new Error('Failed to delete user');
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Filter users based on query
  const filteredUsers = usersList.filter(u => {
    const term = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.nameAr.toLowerCase().includes(term) ||
      u.employeeId.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto relative" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {activeRole !== 'ADMIN' ? (
        /* ── ACCESS DENIED SCREEN ── */
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-24 h-24 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-2xl relative z-10 animate-pulse">
              <Lock size={44} />
            </div>
          </div>
          <div className="space-y-2 max-w-lg">
            <Badge color="danger" className="text-[10px] font-black uppercase tracking-widest px-3 py-1">
              {isArabic ? 'دخول غير مصرح به' : 'Access Denied'}
            </Badge>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isArabic ? 'هذا القسم مخصص لمدير النظام فقط' : 'Restricted to System Administrator Only'}
            </h2>
          </div>
        </div>
      ) : (
        /* ── ADMIN USER MANAGEMENT CONTROL PANEL (SPLIT LAYOUT) ── */
        <div className="animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <span className="w-8 h-1 bg-teal-500 rounded-full" />
                 <span className="text-[10px] font-black tracking-[0.2em] text-teal-600 dark:text-teal-400 uppercase italic">
                     {isArabic ? 'إدارة الهوية والوصول' : 'Identity & Access Management'}
                 </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                {isArabic ? 'سجل المستخدمين والصلاحيات' : 'User Directory & Permissions'}
              </h1>
            </div>
            
            <Button 
              onClick={() => { resetFormFields(); setShowAddForm(!showAddForm); }}
              intent="primary" 
              className="w-full md:w-auto rounded-2xl py-3 px-6 flex items-center justify-center gap-2 shadow-xl shadow-teal-500/10 bg-teal-600 hover:bg-teal-500 text-white font-bold"
            >
              {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
              {showAddForm ? (isArabic ? 'إغلاق النموذج' : 'Close Form') : (isArabic ? 'إضافة مستخدم جديد' : 'Add New User')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN (or Top on Mobile): The Form */}
            {showAddForm && (
              <div className="lg:col-span-4 sticky top-6">
                <Card className="p-5 md:p-6 border border-teal-500/30 bg-white dark:bg-[#0a1628]/80 backdrop-blur-xl rounded-3xl shadow-xl">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/5 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {editingUser ? (isArabic ? 'تعديل بيانات المستخدم' : 'Edit User Profile') : (isArabic ? 'تسجيل مستخدم جديد' : 'Register New User')}
                      </h2>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {isArabic ? 'إعدادات الهوية والوصول' : 'Identity Setup'}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center gap-3 pb-2">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-teal-500">
                          {profilePictureUrl ? (
                            <Image src={profilePictureUrl} alt="Profile" fill className="object-cover" />
                          ) : (
                            <UserIcon size={32} className="text-slate-400" />
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <Camera size={20} className="text-white" />
                          </div>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} id="profile-upload" />
                        <label htmlFor="profile-upload" className="absolute inset-0 cursor-pointer"></label>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isArabic ? 'الصورة الشخصية' : 'Profile Picture'}</span>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'الرقم الوظيفي' : 'Employee ID'}</label>
                        <Input value={employeeId} onChange={e => setEmployeeId(e.target.value)} disabled={!!editingUser} placeholder="EMP-101" className="bg-slate-50 dark:bg-[#050b14]/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'الاسم بالإنجليزية' : 'Name (EN)'}</label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="bg-slate-50 dark:bg-[#050b14]/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'الاسم بالعربية' : 'Name (AR)'}</label>
                        <Input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="جون دو" className="bg-slate-50 dark:bg-[#050b14]/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl" required />
                      </div>
                    </div>

                    {/* Emails */}
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Mail size={12}/> {isArabic ? 'البريد الشخصي' : 'Personal Email'}</label>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@gmail.com" className="bg-slate-50 dark:bg-[#050b14]/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5"><ShieldAlert size={12}/> {isArabic ? 'بريد المنصة الرسمي' : 'Official Domain Email'}</label>
                        <Input value={customDomainEmail} onChange={e => { setCustomDomainEmail(e.target.value); setIsEmailManuallyEdited(true); }} placeholder="user@rsmp-eg.com" className="bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-500/20 text-teal-900 dark:text-teal-100 rounded-xl font-mono text-xs" />
                      </div>
                    </div>

                    {/* Role & Deployment */}
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'الدور الوظيفي' : 'Role'}</label>
                          <select value={userRole} onChange={e => setUserRole(e.target.value as UserRole)} className="w-full h-10 bg-slate-50 dark:bg-[#050b14]/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 text-xs font-bold focus:outline-none focus:border-teal-500">
                            <option value="RANGER">Ranger</option>
                            <option value="RESEARCHER">Researcher</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'حالة الحساب' : 'Status'}</label>
                          <select value={userStatus} onChange={e => setUserStatus(e.target.value as any)} className="w-full h-10 bg-slate-50 dark:bg-[#050b14]/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 text-xs font-bold focus:outline-none focus:border-teal-500">
                            <option value="ACTIVE">{isArabic ? 'نشط' : 'Active'}</option>
                            <option value="ON_LEAVE">{isArabic ? 'إجازة' : 'On Leave'}</option>
                            <option value="INACTIVE">{isArabic ? 'موقوف' : 'Inactive'}</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'المحمية المعين بها' : 'Assigned Reserve'}</label>
                        <select value={reserveId} onChange={e => setReserveId(e.target.value)} className="w-full h-10 bg-slate-50 dark:bg-[#050b14]/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 text-xs font-bold focus:outline-none focus:border-teal-500">
                          {RESERVES_LIST.map(r => <option key={r.id} value={r.id}>{isArabic ? r.nameAr : r.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Badges & Certifications */}
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Tag size={12}/> {isArabic ? 'شارات مميزة (مفصولة بفاصلة)' : 'Badges (comma separated)'}</label>
                        <Input value={badgesText} onChange={e => setBadgesText(e.target.value)} placeholder="e.g. VIP, Expert Diver, First Responder" className="bg-slate-50 dark:bg-[#050b14]/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'الشهادات المعتمدة' : 'Certifications'}</label>
                        <Input value={certificationsText} onChange={e => setCertificationsText(e.target.value)} placeholder="e.g. PADI, GIS Cert" className="bg-slate-50 dark:bg-[#050b14]/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl" />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-white/5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                        {isArabic ? 'كلمة المرور' : 'Password'}
                        <span className="text-slate-400 lowercase">{editingUser ? '(اختياري)' : '(مطلوب)'}</span>
                      </label>
                      <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-slate-50 dark:bg-[#050b14]/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl" required={!editingUser} />
                    </div>

                    {/* Modules Access */}
                    <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-white/5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{isArabic ? 'صلاحيات الوصول (Modules)' : 'Access Permissions'}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SECTIONS_METADATA.map(sec => {
                          const Icon = sec.icon;
                          const isChecked = allowedSections.includes(sec.id);
                          return (
                            <div key={sec.id} onClick={() => handleSectionToggle(sec.id)} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-teal-50 dark:bg-teal-500/10 border-teal-500/30' : 'bg-slate-50 dark:bg-[#050b14]/20 border-slate-200 dark:border-white/5 opacity-60 hover:opacity-100'}`}>
                              <Icon size={14} className={isChecked ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                              <span className={`text-[10px] font-bold truncate ${isChecked ? 'text-teal-900 dark:text-teal-100' : 'text-slate-500'}`}>{isArabic ? sec.nameAr : sec.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 font-black uppercase tracking-widest mt-4">
                      {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : (editingUser ? (isArabic ? 'تحديث البيانات' : 'Update User') : (isArabic ? 'حفظ المستخدم' : 'Save User'))}
                    </Button>
                  </form>
                  <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(20, 184, 166, 0.3); border-radius: 4px; }
                  `}</style>
                </Card>
              </div>
            )}

            {/* RIGHT COLUMN: Users List */}
            <div className={`${showAddForm ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-5 transition-all duration-500`}>
              
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl sm:rounded-3xl shadow-sm">
                <div className="relative flex items-center w-full sm:max-w-md">
                  <Search size={16} className={`absolute ${isArabic ? 'right-4' : 'left-4'} text-slate-400 pointer-events-none`} />
                  <input 
                    type="text"
                    placeholder={isArabic ? 'بحث بالاسم، الإيميل، الرقم...' : 'Search by name, email, ID...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-[#050b14]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
                  />
                </div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  {isArabic ? `الإجمالي: ${filteredUsers.length}` : `Total: ${filteredUsers.length}`}
                </div>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="py-24 text-center">
                  <Loader2 className="animate-spin text-teal-400 mx-auto mb-4" size={32} />
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{isArabic ? 'جاري جلب البيانات...' : 'Loading users...'}</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-100 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-300 dark:border-white/5">
                  {isArabic ? 'لا توجد نتائج' : 'No results found'}
                </div>
              ) : (
                <div className={`grid grid-cols-1 ${showAddForm ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4 sm:gap-5`}>
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="p-5 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-teal-400 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col justify-between">
                      {/* Glow effect */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl -z-10 group-hover:bg-teal-500/10 transition-colors" />
                      
                      <div>
                        {/* Header: Pic & Info */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative shrink-0">
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                              {user.profilePictureUrl ? (
                                <Image src={user.profilePictureUrl} alt={user.name} fill className="object-cover" />
                              ) : (
                                user.role === 'ADMIN' ? <ShieldCheck size={24} className="text-teal-500" /> : <UserIcon size={24} className="text-slate-400" />
                              )}
                            </div>
                            {user.lastActive && (Date.now() - new Date(user.lastActive).getTime() < 2 * 60 * 1000) && (
                              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0a1628] rounded-full z-10 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" title={isArabic ? 'متصل الآن' : 'Online Now'} />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black text-slate-900 dark:text-white text-base truncate">{isArabic ? user.nameAr : user.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">{user.employeeId}</span>
                              <Badge color={user.role === 'ADMIN' ? 'success' : 'primary'} className="text-[9px] px-1.5 py-0.5 font-bold uppercase">{user.role}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Badges inline */}
                        {user.badges && (Array.isArray(user.badges) ? user.badges : (typeof user.badges === 'string' && user.badges.startsWith('[')) ? JSON.parse(user.badges) : []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {(Array.isArray(user.badges) ? user.badges : (typeof user.badges === 'string' && user.badges.startsWith('[')) ? JSON.parse(user.badges) : []).map((badge: string, idx: number) => (
                              <span key={idx} className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                <UserCheck size={10} /> {badge}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Contact & Location Info */}
                        <div className="space-y-2 mb-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-3">
                          <div className="flex items-center gap-2 text-[11px]">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-slate-900 dark:text-slate-300 font-mono font-medium truncate">{user.customDomainEmail || `${user.employeeId.toLowerCase()}@rsmp-eg.com`}</span>
                              {user.email && <span className="text-slate-500 truncate">{user.email}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] pt-1.5 border-t border-slate-200 dark:border-white/5">
                            <Anchor size={12} className="text-slate-400 shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300 font-bold truncate">{isArabic ? user.reserveAr : user.reserve}</span>
                          </div>
                        </div>

                        {/* Modules access preview */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {user.allowedSections?.map(sec => {
                            const meta = SECTIONS_METADATA.find(s => s.id === sec);
                            if (!meta) return null;
                            const Icon = meta.icon;
                            return (
                              <div key={sec} className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400" title={isArabic ? meta.nameAr : meta.name}>
                                <Icon size={12} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                        <button onClick={() => startEditing(user)} className="flex-1 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-slate-100 dark:bg-white/5 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-xl transition-colors flex justify-center items-center gap-1.5">
                          <Edit3 size={14} /> {isArabic ? 'تعديل' : 'Edit'}
                        </button>
                        <button onClick={() => handleDeleteUser(user)} className="w-10 h-10 flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-colors shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
