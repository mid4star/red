'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, UserRole } from '@/lib/firebase/schema';
import { 
  Users, 
  ShieldAlert, 
  Plus, 
  Search, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  Check, 
  X, 
  Shield, 
  UserPlus, 
  Trash2, 
  Edit3,
  Waves,
  Microscope,
  ClipboardList,
  AlertTriangle,
  Anchor,
  Megaphone,
  Settings,
  ShieldCheck
} from 'lucide-react';

const RESERVES_LIST = [
  { id: 'northern-islands', name: 'Northern Islands', nameAr: 'محمية الجزر الشمالية' },
  { id: 'wadi-el-gemal', name: 'Wadi El Gemal', nameAr: 'محمية وادي الجمال' },
  { id: 'gebel-elba', name: 'Gebel Elba', nameAr: 'محمية جبل علبة' },
  { id: 'coral-reef', name: 'Coral Reef Protectorate', nameAr: 'محمية الحيد المرجاني' },
];

const SECTIONS_METADATA = [
  { id: 'patrols', name: 'Marine Patrols', nameAr: 'الدوريات البحرية', icon: Waves, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'monitoring', name: 'Environmental Monitoring', nameAr: 'الرصد البيئي', icon: Microscope, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'eia', name: 'Environmental Assessment', nameAr: 'تقييم الأثر البيئي', icon: ClipboardList, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { id: 'violations', name: 'Violations Log', nameAr: 'سجل المخالفات', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'fleet', name: 'Fleet & Equipment', nameAr: 'الأسطول والمعدات', icon: Anchor, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'media', name: 'Media Center', nameAr: 'المركز الإعلامي', icon: Megaphone, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'settings', name: 'System Settings', nameAr: 'إعدادات النظام', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-500/10' },
];

export default function UserManagementPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  
  // Real-time users from Firestore
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Simulated active role (for demonstration and access testing)
  const [simulatedRole, setSimulatedRole] = useState<UserRole>('ADMIN');

  // Load simulated role from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('active_user_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role) {
          setSimulatedRole(parsed.role as UserRole);
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
  const [userRole, setUserRole] = useState<UserRole>('RANGER');
  const [reserveId, setReserveId] = useState(RESERVES_LIST[0].id);
  const [userStatus, setUserStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');
  const [certificationsText, setCertificationsText] = useState('');
  const [allowedSections, setAllowedSections] = useState<string[]>(['patrols', 'monitoring']);

  // Fetch users from API (reads from Turso/SQLite)
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

  // Form Resets
  const resetFormFields = () => {
    setEmployeeId('');
    setName('');
    setNameAr('');
    setUserRole('RANGER');
    setReserveId(RESERVES_LIST[0].id);
    setUserStatus('ACTIVE');
    setCertificationsText('');
    setAllowedSections(['patrols', 'monitoring']);
    setEditingUser(null);
  };

  // Open Edit Mode
  const startEditing = (user: User) => {
    setEditingUser(user);
    setEmployeeId(user.employeeId);
    setName(user.name);
    setNameAr(user.nameAr);
    setUserRole(user.role);
    setReserveId(user.reserveId);
    setUserStatus(user.status);
    setCertificationsText(user.certifications ? user.certifications.join(', ') : '');
    setAllowedSections(user.allowedSections || []);
    setShowAddForm(true);
  };

  // Toggle Section Permissions Checkboxes
  const handleSectionToggle = (sectionId: string) => {
    setAllowedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
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

      const userData: any = {
        employeeId,
        name,
        nameAr,
        role: userRole,
        reserveId,
        reserve: selectedReserve?.name || '',
        reserveAr: selectedReserve?.nameAr || '',
        status: userStatus,
        certifications: certificationsArray,
        allowedSections,
        updatedAt: new Date().toISOString()
      };

      if (editingUser?.id) {
        // Edit User
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
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to update user');
        }
      } else {
        // Add User
        userData.createdAt = new Date().toISOString();
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'users',
            action: 'ADD',
            id: employeeId, // Use employee ID as the document ID for consistency
            data: userData
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to add user');
        }
      }

      resetFormFields();
      setShowAddForm(false);
      // Refresh users list from database
      fetchUsers();
    } catch (err: any) {
      console.error('Error saving user:', err);
      const errMsg = err.message || String(err);
      const isUniqueError = errMsg.includes('UNIQUE constraint') || errMsg.includes('employeeId');
      alert(isArabic 
        ? isUniqueError 
          ? `الرقم الوظيفي "${employeeId}" مستخدم بالفعل. يرجى استخدام رقم وظيفي مختلف.`
          : `حدث خطأ أثناء حفظ البيانات: ${errMsg}` 
        : isUniqueError
          ? `Employee ID "${employeeId}" already exists. Please use a different ID.`
          : `Error saving user data: ${errMsg}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: User) => {
    if (!user.id) return;
    const confirmMsg = isArabic 
      ? `هل أنت متأكد من حذف حساب الموظف ${user.nameAr} نهائياً من المنصة؟`
      : `Are you sure you want to permanently delete user ${user.name}?`;
    
    if (confirm(confirmMsg)) {
      setSubmitting(true);
      try {
        const response = await fetch('/api/staff/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionName: 'users',
            action: 'DELETE',
            id: user.id
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to delete user');
        }
        // Refresh users list from database
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
      u.employeeId.includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto relative" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* ── Role Simulator Header Toolbar ── */}
      <div className="flex justify-between items-center bg-slate-950/80 border border-white/5 rounded-2xl p-3 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-teal-400" />
          <span className="text-xs font-bold text-slate-300">
            {isArabic ? 'محاكاة اختبار الصلاحية:' : 'Role Simulation Test:'}
          </span>
        </div>
        <div className="flex gap-2">
          {(['ADMIN', 'RANGER', 'RESEARCHER', 'MANAGER'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => {
                setSimulatedRole(role);
                // Reset form on simulation switch to prevent leaks
                setShowAddForm(false);

                // Construct and save simulated session
                let allowed: string[] = [];
                let nameEn = 'M. Layaq';
                let nameAr = 'مصطفى لايق';
                if (role === 'ADMIN') {
                  allowed = ['patrols', 'monitoring', 'eia', 'violations', 'fleet', 'media', 'settings'];
                } else if (role === 'MANAGER') {
                  allowed = ['patrols', 'monitoring', 'violations'];
                  nameEn = 'Manager Mike';
                  nameAr = 'المشرف مايك';
                } else if (role === 'RANGER') {
                  allowed = ['patrols', 'monitoring'];
                  nameEn = 'Ranger John';
                  nameAr = 'الحارس جون';
                } else if (role === 'RESEARCHER') {
                  allowed = ['monitoring', 'eia'];
                  nameEn = 'Researcher Jane';
                  nameAr = 'الباحثة جين';
                }
                
                const sessionObj = {
                  employeeId: role.toLowerCase(),
                  role: role,
                  name: nameEn,
                  nameAr: nameAr,
                  allowedSections: allowed
                };
                localStorage.setItem('active_user_session', JSON.stringify(sessionObj));
                window.dispatchEvent(new Event('user-session-changed'));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                simulatedRole === role
                  ? 'bg-teal-500 text-[#0a1628] shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {role === 'ADMIN' ? (isArabic ? 'مدير النظام (Admin)' : 'Admin') :
               role === 'MANAGER' ? (isArabic ? 'مشرف قسم (Manager)' : 'Manager') :
               role === 'RANGER' ? (isArabic ? 'حارس محمية (Ranger)' : 'Ranger') :
               (isArabic ? 'باحث بيئي (Researcher)' : 'Researcher')}
            </button>
          ))}
        </div>
      </div>

      {simulatedRole !== 'ADMIN' ? (
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
            <h2 className="text-3xl font-black text-white tracking-tight">
              {isArabic ? 'عذراً، هذا القسم مخصص لمدير النظام فقط' : 'Restricted to System Administrator Only'}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              {isArabic 
                ? 'لوحة التحكم بإدارة المستخدمين وتوزيع الصلاحيات هي صلاحية حصرية لمدير النظام الرئيسي. يمكنك تغيير دور المحاكاة بالأعلى لتجربة لوحة التحكم.'
                : 'The User Directory & Access Control dashboard is restricted to the System Admin. Use the role simulator above to preview the console.'}
            </p>
          </div>
        </div>
      ) : (
        /* ── ADMIN USER MANAGEMENT CONTROL PANEL ── */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-1 bg-teal-500 rounded-full" />
                 <span className="text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase italic">
                     {isArabic ? 'التحكم بالوصول والأعضاء' : 'Access Control & Members'}
                 </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                {isArabic ? 'إدارة مستخدمي المنصة' : 'User Management'}
              </h1>
            </div>
            
            <Button 
              onClick={() => { resetFormFields(); setShowAddForm(true); }}
              intent="primary" 
              className="rounded-2xl py-3.5 px-6 flex items-center gap-2.5 shadow-[0_0_20px_rgba(45,212,191,0.2)] bg-teal-500 text-[#001529] hover:bg-teal-400 uppercase italic font-black"
            >
              <UserPlus size={16} />
              {isArabic ? 'إضافة مستخدم جديد' : 'Add User'}
            </Button>
          </div>

          {/* Form Modal (Add / Edit) */}
          {showAddForm && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[999] flex items-center justify-center p-4 overflow-y-auto">
              <Card className="w-full max-w-[700px] p-8 border border-white/10 bg-[#0c1628]/95 rounded-3xl shadow-2xl relative">
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-black text-white tracking-tight mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
                  <UserPlus className="text-teal-400" size={24} />
                  {editingUser 
                    ? (isArabic ? 'تعديل صلاحيات وبيانات المستخدم' : 'Edit User Permissions')
                    : (isArabic ? 'إضافة مستخدم جديد وصلاحياته' : 'Add New User & Permissions')
                  }
                </h2>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  
                  {/* Basic details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'الرقم الوظيفي (Employee ID)' : 'Employee ID'}</label>
                      <Input 
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. EMP-902"
                        className="bg-[#050b14] border-white/10 text-white rounded-xl"
                        required
                        disabled={!!editingUser}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'الاسم بالإنجليزية' : 'Name (EN)'}</label>
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="bg-[#050b14] border-white/10 text-white rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'الاسم بالعربية' : 'Name (AR)'}</label>
                      <Input 
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        placeholder="e.g. جون دو"
                        className="bg-[#050b14] border-white/10 text-white rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'دور المستخدم' : 'User Role'}</label>
                      <select 
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as UserRole)}
                        className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
                      >
                        <option value="RANGER">{isArabic ? 'حارس محمية (Ranger)' : 'Ranger'}</option>
                        <option value="RESEARCHER">{isArabic ? 'باحث بيئي (Researcher)' : 'Researcher'}</option>
                        <option value="MANAGER">{isArabic ? 'مشرف قسم (Manager)' : 'Manager'}</option>
                        <option value="ADMIN">{isArabic ? 'مدير نظام (Admin)' : 'Admin'}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'المحمية المعين بها' : 'Assigned Reserve'}</label>
                      <select 
                        value={reserveId}
                        onChange={(e) => setReserveId(e.target.value)}
                        className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
                      >
                        {RESERVES_LIST.map(r => (
                          <option key={r.id} value={r.id}>
                            {isArabic ? r.nameAr : r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'الحالة الوظيفية' : 'Status'}</label>
                      <select 
                        value={userStatus}
                        onChange={(e) => setUserStatus(e.target.value as any)}
                        className="w-full h-11 bg-[#050b14] border border-white/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
                      >
                        <option value="ACTIVE">{isArabic ? 'نشط' : 'Active'}</option>
                        <option value="ON_LEAVE">{isArabic ? 'إجازة' : 'On Leave'}</option>
                        <option value="INACTIVE">{isArabic ? 'غير نشط' : 'Inactive'}</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'الشهادات والتدريب (مفصولة بفاصلة)' : 'Certifications & Training (comma separated)'}</label>
                      <Input 
                        value={certificationsText}
                        onChange={(e) => setCertificationsText(e.target.value)}
                        placeholder="e.g. Diving License, First Aid, GIS Professional"
                        className="bg-[#050b14] border-white/10 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Permissions Checklist Section */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Shield className="text-teal-400" size={16} />
                        {isArabic ? 'إدارة صلاحيات الوصول للأقسام' : 'Manage Section Permissions'}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {isArabic 
                          ? 'حدد الأقسام المسموح لهذا المستخدم بتصفحها أو إدخال البيانات إليها.' 
                          : 'Select which modules this user has access to view or modify.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {SECTIONS_METADATA.map((section) => {
                        const Icon = section.icon;
                        const isChecked = allowedSections.includes(section.id);
                        return (
                          <div 
                            key={section.id}
                            onClick={() => handleSectionToggle(section.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative group ${
                              isChecked
                                ? 'bg-teal-500/10 border-teal-500/40 text-white shadow-md'
                                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${section.bg} ${section.color}`}>
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">
                                {isArabic ? section.nameAr : section.name}
                              </p>
                            </div>
                            <div className={`absolute top-2 ${isArabic ? 'left-2' : 'right-2'} w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isChecked ? 'bg-teal-500 border-teal-400 text-[#0c1628]' : 'border-white/20'
                            }`}>
                              {isChecked && <Check size={10} strokeWidth={4} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                      disabled={submitting}
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-teal-600 hover:bg-teal-500 text-[#0c1628] font-black rounded-xl py-2.5 px-6"
                    >
                      {submitting 
                        ? <Loader2 className="animate-spin" size={16} /> 
                        : (editingUser ? (isArabic ? 'تحديث الصلاحيات' : 'Update User') : (isArabic ? 'تأكيد الحساب' : 'Create User'))
                      }
                    </Button>
                  </div>

                </form>
              </Card>
            </div>
          )}

          {/* Users Table / Grid Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl">
            
            {/* Search Input */}
            <div className="relative flex items-center w-full sm:max-w-md">
              <Search size={14} className={`absolute ${isArabic ? 'right-4' : 'left-4'} text-slate-500 pointer-events-none`} />
              <input 
                type="text"
                placeholder={isArabic ? 'بحث بالاسم، الرقم الوظيفي، أو الدور...' : 'Search by name, employee ID, role...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-[#050b14]/60 border border-white/10 text-slate-200 rounded-2xl ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-xs focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all`}
              />
            </div>

            <div className="text-xs text-slate-500 font-bold">
              {isArabic 
                ? `إجمالي المستخدمين: ${filteredUsers.length}` 
                : `Total Users: ${filteredUsers.length}`
              }
            </div>
          </div>

          {/* User Cards Grid */}
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="animate-spin text-teal-400 mx-auto" size={40} />
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                {isArabic ? 'جاري جلب بيانات الأعضاء...' : 'Fetching user database...'}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-900/10 rounded-3xl border border-dashed border-white/5">
              {isArabic ? 'لا يوجد مستخدمون متوافقون مع شروط البحث' : 'No matching users found'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card 
                  key={user.id} 
                  className="p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-teal-500/30 hover:shadow-[0_0_30px_rgba(45,212,191,0.05)] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* User profile header card */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 shrink-0">
                          {user.role === 'ADMIN' ? '👑' : '👤'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-base leading-tight truncate">
                            {isArabic ? user.nameAr : user.name}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {user.employeeId}
                          </span>
                        </div>
                      </div>

                      <Badge 
                        color={user.status === 'ACTIVE' ? 'success' : user.status === 'ON_LEAVE' ? 'warning' : 'danger'} 
                        className="text-[9px] font-black px-2 py-0.5"
                      >
                        {isArabic 
                          ? (user.status === 'ACTIVE' ? 'نشط' : user.status === 'ON_LEAVE' ? 'إجازة' : 'غير نشط')
                          : user.status
                        }
                      </Badge>
                    </div>

                    {/* Role & Location */}
                    <div className="space-y-1.5 py-3 border-t border-b border-white/5 my-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{isArabic ? 'الدور الوظيفي:' : 'Platform Role:'}</span>
                        <span className="font-black text-teal-400 uppercase tracking-wide">
                          {user.role}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{isArabic ? 'الموقع المعين:' : 'Reserve Station:'}</span>
                        <span className="font-bold text-slate-300">
                          {isArabic ? user.reserveAr : user.reserve}
                        </span>
                      </div>
                      {user.certifications && user.certifications.length > 0 && (
                        <div className="flex flex-col gap-1 pt-1">
                          <span className="text-slate-500 block">{isArabic ? 'الشهادات المعتمدة:' : 'Certifications:'}</span>
                          <div className="flex flex-wrap gap-1">
                            {user.certifications.map((cert, index) => (
                              <span key={index} className="text-[9.5px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 font-medium">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Allowed Sections List */}
                    <div className="space-y-2 py-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                        {isArabic ? 'الأقسام المسموح بالوصول إليها:' : 'Authorized Modules:'}
                      </span>
                      
                      {!user.allowedSections || user.allowedSections.length === 0 ? (
                        <span className="text-xs text-rose-400/80 italic font-bold">
                          {isArabic ? '✗ لا توجد صلاحيات وصول نشطة' : '✗ No active permissions'}
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {user.allowedSections.map((secId) => {
                            const meta = SECTIONS_METADATA.find(s => s.id === secId);
                            if (!meta) return null;
                            const Icon = meta.icon;
                            return (
                              <div 
                                key={secId} 
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border border-white/5 text-[10px] font-extrabold ${meta.color} bg-white/5`}
                              >
                                <Icon size={10} />
                                <span>{isArabic ? meta.nameAr : meta.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                    <button 
                      onClick={() => startEditing(user)}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-teal-500/10 text-slate-300 hover:text-teal-400 border border-white/5 hover:border-teal-500/20 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      {isArabic ? 'تعديل البيانات' : 'Edit'}
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="py-2 px-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 border border-rose-500/10 hover:border-rose-500/30 transition-all text-xs font-bold flex items-center justify-center"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                </Card>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
