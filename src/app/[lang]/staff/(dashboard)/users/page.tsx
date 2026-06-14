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
  Camera, Mail, Tag, UserCheck, User as UserIcon, Map, Ship, Copy, ExternalLink, Briefcase, Award, Info, Calendar, BadgeCheck,
  Radio
} from 'lucide-react';
import { uploadFiles } from '@/utils/uploadthing';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';

const parseArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        return JSON.parse(value);
      } catch (e) {}
    }
    return value.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  return [];
};

const parseDate = (val: any): Date => {
  if (!val) return new Date();
  if (typeof val === 'object' && typeof val.toDate === 'function') {
    return val.toDate();
  }
  if (typeof val === 'object' && typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000);
  }
  const parsed = new Date(val);
  if (isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
};

export const PREDEFINED_BADGES = [
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

export const getBadgeStyle = (badgeName: string) => {
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

// Fallback while loading
const FALLBACK_RESERVES = [
  { id: 'northern-islands', name: 'Northern Islands', nameAr: 'محمية الجزر الشمالية' }
];

const SECTIONS_METADATA = [
  { id: 'patrols', name: 'Marine Patrols', nameAr: 'الدوريات البحرية', icon: Waves, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/10' },
  { id: 'monitoring', name: 'Environmental Monitoring', nameAr: 'الرصد البيئي', icon: Microscope, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
  { id: 'eia', name: 'Environmental Assessment', nameAr: 'تقييم الأثر البيئي', icon: ClipboardList, color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-500/10' },
  { id: 'gis', name: 'GIS & Maps', nameAr: 'نظم المعلومات الجغرافية', icon: Map, color: 'text-fuchsia-500 dark:text-fuchsia-400', bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/10' },
  { id: 'violations', name: 'Violations Log', nameAr: 'سجل المخالفات', icon: AlertTriangle, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-500/10' },
  { id: 'fleet', name: 'Fleet & Equipment', nameAr: 'الأسطول والمعدات', icon: Anchor, color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-500/10' },
  { id: 'vessels', name: 'Vessel Monitoring', nameAr: 'مراقبة السفن', icon: Ship, color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-500/10' },
  { id: 'media', name: 'Media Center', nameAr: 'المركز الإعلامي', icon: Megaphone, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10' },
  { id: 'radar', name: 'News Radar', nameAr: 'الرادار الإخباري', icon: Radio, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-500/10' },
  { id: 'settings', name: 'System Settings', nameAr: 'إعدادات النظام', icon: Settings, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-200 dark:bg-slate-500/10' },
  { id: 'email-routing', name: 'Email Routing', nameAr: 'توجيه البريد', icon: Mail, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/10' },
  { id: 'manage-users', name: 'Manage Users (CRUD)', nameAr: 'تعديل وإضافة الموظفين', icon: UserPlus, color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-500/10' },
];

export default function UserManagementPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  
  // Real-time users from Firestore
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Active role and permissions from session
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');
  const [activeAllowedSections, setActiveAllowedSections] = useState<string[]>([]);
  const [activeReserveName, setActiveReserveName] = useState<string>('');
  const [activeReserveNameAr, setActiveReserveNameAr] = useState<string>('');

  const [activeName, setActiveName] = useState<string>('');
  const [activeNameAr, setActiveNameAr] = useState<string>('');
  const [activeEmail, setActiveEmail] = useState<string>('');

  const [warningModal, setWarningModal] = useState<{ title: string; message: string } | null>(null);

  const canManageUsers = activeRole === 'ADMIN' || activeAllowedSections.includes('manage-users');

  const isMostafaLayaq = 
    activeName.toLowerCase().includes('layaq') || 
    activeName.toLowerCase().includes('layek') || 
    activeNameAr.includes('لايق') || 
    activeEmail.toLowerCase().startsWith('m.layaq') ||
    activeEmail.toLowerCase().startsWith('mostafa.layaq');

  // Load active session details from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('active_user_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role) {
          setActiveRole(parsed.role as UserRole);
        }
        if (parsed.allowedSections) {
          setActiveAllowedSections(parsed.allowedSections || []);
        }
        if (parsed.reserve) {
          setActiveReserveName(parsed.reserve);
        }
        if (parsed.reserveAr) {
          setActiveReserveNameAr(parsed.reserveAr);
        }
        if (parsed.name) {
          setActiveName(parsed.name);
        }
        if (parsed.nameAr) {
          setActiveNameAr(parsed.nameAr);
        }
        if (parsed.email) {
          setActiveEmail(parsed.email);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

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
  const [badgeInput, setBadgeInput] = useState('');
  
  const [userRole, setUserRole] = useState<UserRole>('RANGER');
  const [reservesList, setReservesList] = useState<{id: string, name: string, nameAr: string}[]>(FALLBACK_RESERVES);
  const [reserveId, setReserveId] = useState(FALLBACK_RESERVES[0].id);
  const [userStatus, setUserStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');
  const [certificationsText, setCertificationsText] = useState('');
  const [allowedSections, setAllowedSections] = useState<string[]>(['patrols', 'monitoring']);
  const [password, setPassword] = useState('');
  const [isEmailManuallyEdited, setIsEmailManuallyEdited] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const selectedBadges = badgesText
    ? badgesText.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const addBadge = (badgeName: string) => {
    const lowerName = badgeName.toLowerCase();
    const exists = selectedBadges.some(b => {
      const bLower = b.toLowerCase();
      if (bLower === lowerName) return true;
      const match = PREDEFINED_BADGES.find(p => p.en.toLowerCase() === lowerName || p.ar === badgeName);
      if (match && (bLower === match.en.toLowerCase() || b === match.ar)) return true;
      return false;
    });
    if (!exists) {
      const newList = [...selectedBadges, badgeName];
      setBadgesText(newList.join(', '));
    }
  };

  const removeBadge = (badgeName: string) => {
    const lowerName = badgeName.toLowerCase();
    const newList = selectedBadges.filter(b => {
      const bLower = b.toLowerCase();
      if (bLower === lowerName) return false;
      const match = PREDEFINED_BADGES.find(p => p.en.toLowerCase() === lowerName || p.ar === badgeName);
      if (match && (bLower === match.en.toLowerCase() || b === match.ar)) return false;
      return true;
    });
    setBadgesText(newList.join(', '));
  };

  const handleBadgeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = badgeInput.trim().replace(/,/g, '');
      if (val) {
        addBadge(val);
        setBadgeInput('');
      }
    }
  };

  const renderStatsGrid = () => {
    const totalCount = usersList.length;
    const rangerCount = usersList.filter(u => u.role === 'RANGER').length;
    const researcherCount = usersList.filter(u => u.role === 'RESEARCHER').length;
    const onlineCount = usersList.filter(u => u.lastActive && (Date.now() - parseDate(u.lastActive).getTime() < 5 * 60 * 1000)).length;

    const stats = [
      {
        id: 'total',
        title: isArabic ? 'إجمالي الكادر' : 'Total Directory',
        value: totalCount,
        icon: Users,
        color: 'from-teal-500 to-emerald-500',
        textColor: 'text-teal-600 dark:text-teal-400',
        bgColor: 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/20',
        subtitle: isArabic ? 'الموظفون في جميع المحميات' : 'Verified staff across all reserves',
        glowColor: 'group-hover:shadow-teal-500/10'
      },
      {
        id: 'rangers',
        title: isArabic ? 'حراس البيئة (Rangers)' : 'Rangers Deployed',
        value: rangerCount,
        icon: Waves,
        color: 'from-indigo-500 to-sky-500',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20',
        subtitle: isArabic ? 'حماية ورقابة ميدانية مستمرة' : 'Active protectorate monitoring',
        glowColor: 'group-hover:shadow-indigo-500/10'
      },
      {
        id: 'researchers',
        title: isArabic ? 'الباحثون البيئيون' : 'Researchers',
        value: researcherCount,
        icon: Microscope,
        color: 'from-emerald-500 to-teal-500',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20',
        subtitle: isArabic ? 'الدراسات والمسوحات العلمية' : 'Scientific surveys & analysis',
        glowColor: 'group-hover:shadow-emerald-500/10'
      },
      {
        id: 'online',
        title: isArabic ? 'نشط بالمنصة حالياً' : 'Online Now',
        value: onlineCount,
        icon: UserCheck,
        color: 'from-rose-500 to-amber-500',
        textColor: 'text-emerald-500 dark:text-emerald-400',
        bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20',
        subtitle: isArabic ? 'جلسات نشطة في الوقت الفعلي' : 'Real-time active sessions',
        glowColor: 'group-hover:shadow-emerald-500/10',
        isLive: true
      }
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.id}
              className={`relative overflow-hidden group transition-all duration-300 bg-white dark:bg-[#0a1628]/40 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl ${stat.glowColor}`}
            >
              {/* Top Accent Gradient Line */}
              <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${stat.color} opacity-80`} />
              
              {/* Background Ambient Glow */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-transparent to-slate-200/20 dark:to-white/[0.02] rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
              
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    {stat.title}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stat.value}
                    </span>
                    {stat.isLive && (
                      <span className="relative flex h-2 w-2 mb-1.5 self-end">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block pt-1 border-t border-slate-100 dark:border-white/5">
                    {stat.subtitle}
                  </span>
                </div>

                <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 self-start md:self-center`}>
                  <Icon className={`${stat.textColor} ${stat.isLive ? 'animate-pulse' : ''}`} size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

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
    fetch('/api/staff/query?collection=reserves')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          const loadedReserves = data.data.map((r: any) => ({
            id: r.id,
            name: r.name,
            nameAr: r.nameAr
          }));
          setReservesList(loadedReserves);
          // Only update reserveId if we are not editing
          setReserveId(prev => loadedReserves.some((r: any) => r.id === prev) ? prev : loadedReserves[0].id);
        }
      })
      .catch(err => console.error("Failed to fetch reserves", err));
  }, []);

  // Auto-generate custom domain email when Employee ID changes (for new users)
  useEffect(() => {
    if (!editingUser && employeeId && !isEmailManuallyEdited) {
      setCustomDomainEmail(employeeId.toLowerCase().replace(/\s+/g, '') + '@rsmp-eg.com');
    }
  }, [employeeId, editingUser, isEmailManuallyEdited]);

  const resetFormFields = () => {
    setEmployeeId('');
    setName('');
    setNameAr('');
    setEmail('');
    setCustomDomainEmail('');
    setProfilePictureUrl('');
    setBadgesText('');
    setBadgeInput('');
    setUserRole('RANGER');
    setReserveId(reservesList[0]?.id || FALLBACK_RESERVES[0].id);
    setUserStatus('ACTIVE');
    setCertificationsText('');
    setAllowedSections(['patrols', 'monitoring']);
    setPassword('');
    setIsEmailManuallyEdited(false);
    setEditingUser(null);
  };

  // Open Edit Mode
  const startEditing = (user: User) => {
    if (user.role === 'ADMIN' && !isMostafaLayaq) {
      setWarningModal({
        title: isArabic ? 'تعديل غير مسموح به' : 'Access Restricted',
        message: isArabic 
          ? 'عذراً، لا يمكن التعديل على حسابات الإدارة والمسؤولين (Admin). هذا الحساب غير مسموح بالتعديل عليه إلا من قبل مصطفى لايق فقط.'
          : 'Sorry, editing admin accounts is restricted. This account can only be edited by Mostafa Layaq.'
      });
      return;
    }
    setEditingUser(user);
    setEmployeeId(user.employeeId);
    setName(user.name);
    setNameAr(user.nameAr);
    setEmail(user.email || '');
    setCustomDomainEmail(user.customDomainEmail || '');
    setProfilePictureUrl(user.profilePictureUrl || '');
    setBadgesText(parseArray(user.badges).join(', '));
    setUserRole(user.role);
    setReserveId(user.reserveId);
    setUserStatus(user.status);
    setCertificationsText(parseArray(user.certifications).join(', '));
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
      const uploadRes = await uploadFiles("imageUploader", { files: [file] });

      if (uploadRes && uploadRes.length > 0) {
        setProfilePictureUrl(uploadRes[0].url);
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

    if (userRole === 'ADMIN' && !isMostafaLayaq) {
      setWarningModal({
        title: isArabic ? 'تعيين دور غير مصرح به' : 'Role Restricted',
        message: isArabic 
          ? 'عذراً، لا يمكنك تعيين دور مسؤول (Admin). إضافة وتعيين المسؤولين متاح فقط من قبل مصطفى لايق.'
          : 'Sorry, you cannot assign the Admin role. Adding and assigning Admins is only allowed by Mostafa Layaq.'
      });
      return;
    }

    setSubmitting(true);
    try {
      const selectedReserve = reservesList.find(r => r.id === reserveId) || reservesList[0];
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
    if (user.role === 'ADMIN' && !isMostafaLayaq) {
      setWarningModal({
        title: isArabic ? 'حذف غير مسموح به' : 'Access Restricted',
        message: isArabic 
          ? 'عذراً، لا يمكن حذف حسابات الإدارة والمسؤولين (Admin). هذا الحساب غير مسموح بحذفه إلا من قبل مصطفى لايق فقط.'
          : 'Sorry, deleting admin accounts is restricted. This account can only be deleted by Mostafa Layaq.'
      });
      return;
    }
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

  // Filter users based on query and role
  const filteredUsers = usersList.filter(u => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = (
      u.name.toLowerCase().includes(term) ||
      u.nameAr.toLowerCase().includes(term) ||
      u.employeeId.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 relative animate-in fade-in duration-300" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {!canManageUsers ? (
        /* ── VIEW-ONLY STAFF DIRECTORY PANEL (NON-ADMINS) ── */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between bg-white dark:bg-[#0c1b2a]/60 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm gap-4 transition-colors duration-300">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200/20 dark:border-teal-500/20 shadow-md shrink-0">
                  <Users size={24} />
               </div>
               <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 block mb-1">
                     {isArabic ? 'دليل فريق العمل الميداني والبحثي' : 'Protectorate Staff Directory'}
                 </span>
                 <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase m-0 leading-none">
                   {isArabic ? 'دليل موظفي المحميات' : 'Team Directory'}
                 </h1>
               </div>
            </div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">
              {isArabic ? `المحمية الحالية: ${activeReserveNameAr || 'محمية البحر الأحمر'}` : `Current Reserve: ${activeReserveName || 'Red Sea Reserves'}`}
            </div>
          </div>

          {/* Stats Grid */}
          {renderStatsGrid()}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-[#0c1b2a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:max-w-2xl">
              <div className="relative flex items-center w-full sm:max-w-md">
                <Search size={16} className={`absolute ${isArabic ? 'right-4' : 'left-4'} text-slate-400 pointer-events-none`} />
                <input 
                  type="text"
                  placeholder={isArabic ? 'بحث بالاسم، البريد، الرقم الوظيفي...' : 'Search by name, email, employee ID...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-[#050b14]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 dark:bg-[#050b14]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="ALL">{isArabic ? 'جميع الأدوار' : 'All Roles'}</option>
                <option value="RANGER">Ranger</option>
                <option value="RESEARCHER">Researcher</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">
              {isArabic ? `النتائج: ${filteredUsers.length} من ${usersList.length}` : `Showing ${filteredUsers.length} of ${usersList.length}`}
            </div>
          </div>

          {/* Directory Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="animate-spin text-teal-400 mx-auto mb-4" size={32} />
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{isArabic ? 'جاري جلب بيانات الدليل الموحد...' : 'Syncing Team Directory...'}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-100 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-300 dark:border-white/5">
              {isArabic ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching staff members found'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUsers.map((user) => (
                <Card 
                  key={user.id} 
                  onClick={() => setSelectedUserForDetail(user)}
                  className="p-5 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-teal-500 hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl -z-10 group-hover:bg-teal-500/10 transition-colors" />
                  
                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative shrink-0">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex items-center justify-center shadow-sm">
                          {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover animate-in fade-in duration-300" />
                          ) : (
                            user.role === 'ADMIN' ? <ShieldCheck size={24} className="text-teal-500" /> : <UserIcon size={24} className="text-slate-400" />
                          )}
                        </div>
                        {user.lastActive && (Date.now() - parseDate(user.lastActive).getTime() < 5 * 60 * 1000) && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0a1628] rounded-full z-10 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-slate-900 dark:text-white text-base truncate group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">{isArabic ? user.nameAr : user.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">{user.employeeId}</span>
                          <Badge color={user.role === 'ADMIN' ? 'success' : 'primary'} className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider">{user.role}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Badges inline */}
                    {parseArray(user.badges).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {parseArray(user.badges).map((badge: string, idx: number) => {
                          const badgeColor = getBadgeStyle(badge);
                          return (
                            <span key={idx} className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              <UserCheck size={10} /> {badge}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Contact & Location Info */}
                    <div className="space-y-2 mb-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span className="text-slate-900 dark:text-slate-300 font-mono font-medium truncate">{user.customDomainEmail || `${user.employeeId.toLowerCase()}@rsmp-eg.com`}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const emailStr = user.customDomainEmail || `${user.employeeId.toLowerCase()}@rsmp-eg.com`;
                            navigator.clipboard.writeText(emailStr);
                            setCopiedEmail(emailStr);
                            setTimeout(() => setCopiedEmail(null), 2000);
                          }}
                          className="text-slate-400 hover:text-teal-500 transition-colors p-1.5 rounded bg-slate-200/50 dark:bg-white/5 shrink-0 z-10"
                          title={isArabic ? 'نسخ البريد' : 'Copy Email'}
                        >
                          {copiedEmail === (user.customDomainEmail || `${user.employeeId.toLowerCase()}@rsmp-eg.com`) ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] pt-1.5 border-t border-slate-200 dark:border-white/5">
                        <Anchor size={12} className="text-slate-400 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 font-bold truncate">{isArabic ? user.reserveAr : user.reserve}</span>
                      </div>
                    </div>

                    {/* Access Permissions Preview */}
                    <div className="flex flex-wrap gap-1 mb-1">
                      {user.allowedSections?.map(sec => {
                        const meta = SECTIONS_METADATA.find(s => s.id === sec);
                        if (!meta) return null;
                        const Icon = meta.icon;
                        return (
                          <div key={sec} className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5" title={isArabic ? meta.nameAr : meta.name}>
                            <Icon size={12} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card bottom action indicator */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-teal-500 transition-colors flex items-center justify-center gap-1.5">
                    <span>{isArabic ? 'استعراض البيانات التفصيلية' : 'View Detailed Profile'}</span>
                    <ArrowRight size={12} className={`transition-transform group-hover:translate-x-1 ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── ADMIN USER MANAGEMENT CONTROL PANEL (SPLIT LAYOUT) ── */
        <div className="animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between bg-white dark:bg-[#0c1b2a]/60 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm gap-4 transition-colors duration-300">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                  <Users size={24} />
               </div>
               <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 block mb-1">
                     {isArabic ? 'إدارة الهوية والوصول للمشرف' : 'Identity & Access Management (Admin)'}
                 </span>
                 <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase m-0 leading-none">
                   {isArabic ? 'سجل وإدارة المستخدمين' : 'User Control Panel'}
                 </h1>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-start shrink-0">
              <Button 
                onClick={() => { resetFormFields(); setShowAddForm(!showAddForm); }}
                className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 px-4 sm:px-6 rounded-xl h-11 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {showAddForm ? <X size={18} /> : <UserPlus size={18} />}
                <span className="font-bold tracking-wide">
                  {showAddForm ? (isArabic ? 'إغلاق النموذج' : 'Close Form') : (isArabic ? 'إضافة مستخدم' : 'Add User')}
                </span>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6">
            {renderStatsGrid()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
            
            {/* LEFT COLUMN: The Form */}
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
                            {isMostafaLayaq && <option value="ADMIN">Admin</option>}
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
                          {reservesList.map(r => <option key={r.id} value={r.id}>{isArabic ? r.nameAr : r.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Badges & Certifications */}
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Tag size={12}/> {isArabic ? 'التخصصات والمهارات (شارات)' : 'Specialties & Skills (Badges)'}</label>
                        
                        {/* Interactive Tag Container */}
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-[#050b14]/40 border border-slate-200 dark:border-white/10 rounded-xl min-h-[44px] items-center focus-within:border-teal-500/50 transition-colors">
                          {selectedBadges.map((badge, idx) => {
                            const badgeColor = getBadgeStyle(badge);
                            return (
                              <span key={idx} className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${badgeColor}`}>
                                <span>{badge}</span>
                                <button type="button" onClick={() => removeBadge(badge)} className="hover:text-rose-500 font-bold transition-colors ml-1 rtl:mr-1 rtl:ml-0">
                                  <X size={10} />
                                </button>
                              </span>
                            );
                          })}
                          <input 
                            type="text"
                            value={badgeInput}
                            onChange={e => setBadgeInput(e.target.value)}
                            onKeyDown={handleBadgeInputKeyDown}
                            placeholder={selectedBadges.length === 0 ? (isArabic ? 'اكتب تخصصاً واضغط Enter أو فاصلة' : 'Type a specialty and press Enter') : ''}
                            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white min-w-[120px]"
                          />
                        </div>

                        {/* Quick Selection Specialties */}
                        <div className="space-y-1.5 pt-1.5">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{isArabic ? 'تحديد سريع للتخصصات الشائعة:' : 'Quick select common specialties:'}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {PREDEFINED_BADGES.map((item, idx) => {
                              const label = isArabic ? item.ar : item.en;
                              const isSelected = selectedBadges.includes(label) || selectedBadges.includes(item.en) || selectedBadges.includes(item.ar);
                              return (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => isSelected ? removeBadge(label) : addBadge(label)}
                                  className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all ${
                                    isSelected 
                                      ? `${item.color} scale-95 shadow-sm border-current` 
                                      : 'bg-white dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-700 dark:hover:text-slate-300'
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
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
                </Card>
              </div>
            )}

            {/* RIGHT COLUMN: Users List */}
            <div className={`${showAddForm ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-5 transition-all duration-500`}>
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl sm:rounded-3xl shadow-sm transition-colors duration-300">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:max-w-xl">
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
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-[#050b14]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="ALL">{isArabic ? 'جميع الأدوار' : 'All Roles'}</option>
                    <option value="RANGER">Ranger</option>
                    <option value="RESEARCHER">Researcher</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
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
                    <Card 
                      key={user.id} 
                      onClick={() => setSelectedUserForDetail(user)}
                      className="p-5 bg-white dark:bg-[#0a1628]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-teal-400 hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col justify-between cursor-pointer"
                    >
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
                            {user.lastActive && (Date.now() - parseDate(user.lastActive).getTime() < 5 * 60 * 1000) && (
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
                        {parseArray(user.badges).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {parseArray(user.badges).map((badge: string, idx: number) => {
                              const badgeColor = getBadgeStyle(badge);
                              return (
                                <span key={idx} className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${badgeColor}`}>
                                  <UserCheck size={10} /> {badge}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Contact & Location Info */}
                        <div className="space-y-2 mb-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-3">
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail size={12} className="text-slate-400 shrink-0" />
                              <span className="text-slate-900 dark:text-slate-300 font-mono font-medium truncate">{user.customDomainEmail || `${user.employeeId.toLowerCase()}@rsmp-eg.com`}</span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const emailStr = user.customDomainEmail || `${user.employeeId.toLowerCase()}@rsmp-eg.com`;
                                navigator.clipboard.writeText(emailStr);
                                setCopiedEmail(emailStr);
                                setTimeout(() => setCopiedEmail(null), 2000);
                              }}
                              className="text-slate-400 hover:text-teal-500 transition-colors p-1 rounded bg-slate-200/50 dark:bg-white/5 shrink-0 z-10"
                              title={isArabic ? 'نسخ البريد' : 'Copy Email'}
                            >
                              {copiedEmail === (user.customDomainEmail || `${user.employeeId.toLowerCase()}@rsmp-eg.com`) ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                            </button>
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
                      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
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

      {/* Detail Modal */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedUserForDetail(null)}>
          <div 
            className="w-full max-w-2xl bg-white dark:bg-[#0b1628]/95 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-500" />
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedUserForDetail(null)} 
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer border border-transparent dark:border-white/5"
            >
              <X size={18} />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-slate-200 dark:border-white/5">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/25 flex items-center justify-center shadow-lg">
                  {selectedUserForDetail.profilePictureUrl ? (
                    <img src={selectedUserForDetail.profilePictureUrl} alt={selectedUserForDetail.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedUserForDetail.role === 'ADMIN' ? <ShieldCheck size={44} className="text-teal-500" /> : <UserIcon size={44} className="text-slate-400" />
                  )}
                </div>
                {selectedUserForDetail.lastActive && (Date.now() - parseDate(selectedUserForDetail.lastActive).getTime() < 5 * 60 * 1000) && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-[#0b1628] rounded-full z-10 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                )}
              </div>

              <div className="text-center md:text-start flex-1 min-w-0">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isArabic ? selectedUserForDetail.nameAr : selectedUserForDetail.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-white/5">{selectedUserForDetail.employeeId}</span>
                  <Badge color={selectedUserForDetail.role === 'ADMIN' ? 'success' : 'primary'} className="text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider">{selectedUserForDetail.role}</Badge>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    selectedUserForDetail.status === 'ACTIVE' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : selectedUserForDetail.status === 'ON_LEAVE' 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {isArabic 
                      ? (selectedUserForDetail.status === 'ACTIVE' ? 'نشط' : selectedUserForDetail.status === 'ON_LEAVE' ? 'إجازة' : 'موقوف') 
                      : selectedUserForDetail.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              
              {/* Deployment & Reserve */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={14} />
                  <span>{isArabic ? 'معلومات التعيين والانتشار' : 'Deployment Details'}</span>
                </h3>
                <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'المحمية المعين بها' : 'Assigned Protectorate'}</label>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mt-1">
                      <Anchor size={14} className="text-teal-500" />
                      <span>{isArabic ? selectedUserForDetail.reserveAr : selectedUserForDetail.reserve}</span>
                    </div>
                  </div>
                  {selectedUserForDetail.lastActive && (
                    <div className="pt-2.5 border-t border-slate-200 dark:border-white/5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'آخر ظهور نشط بالمنصة' : 'Last Active Session'}</label>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                        <Calendar size={14} />
                        <span>{parseDate(selectedUserForDetail.lastActive).toLocaleString(isArabic ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} />
                  <span>{isArabic ? 'بيانات الاتصال والهوية' : 'Contact Directory'}</span>
                </h3>
                <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">{isArabic ? 'البريد الرسمي للمحميات' : 'Official Portal Email'}</label>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200 truncate">{selectedUserForDetail.customDomainEmail || `${selectedUserForDetail.employeeId.toLowerCase()}@rsmp-eg.com`}</span>
                      <button 
                        onClick={() => {
                          const emailStr = selectedUserForDetail.customDomainEmail || `${selectedUserForDetail.employeeId.toLowerCase()}@rsmp-eg.com`;
                          navigator.clipboard.writeText(emailStr);
                          setCopiedEmail(emailStr);
                          setTimeout(() => setCopiedEmail(null), 2000);
                        }}
                        className="text-slate-400 hover:text-teal-500 transition-colors p-1.5 rounded-lg bg-slate-200/50 dark:bg-white/5 shrink-0"
                        title={isArabic ? 'نسخ البريد' : 'Copy Email'}
                      >
                        {copiedEmail === (selectedUserForDetail.customDomainEmail || `${selectedUserForDetail.employeeId.toLowerCase()}@rsmp-eg.com`) ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  {selectedUserForDetail.email && (
                    <div className="pt-2.5 border-t border-slate-200 dark:border-white/5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isArabic ? 'البريد الشخصي' : 'Personal Email'}</label>
                      <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 truncate mt-1">{selectedUserForDetail.email}</div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Badges & Certifications (if available) */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-white/5">
              
              {/* Badges */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={14} />
                  <span>{isArabic ? 'التخصص والمهارات المهنية' : 'Specialty & Skills'}</span>
                </h3>
                {parseArray(selectedUserForDetail.badges).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {parseArray(selectedUserForDetail.badges).map((badge: string, idx: number) => {
                      const badgeColor = getBadgeStyle(badge);
                      return (
                        <span key={idx} className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full border ${badgeColor}`}>
                          <UserCheck size={11} />
                          <span>{badge}</span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">{isArabic ? 'لا توجد تخصصات مسجلة' : 'No specialties recorded'}</p>
                )}
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Award size={14} />
                  <span>{isArabic ? 'الشهادات والاعتمادات' : 'Certifications'}</span>
                </h3>
                {parseArray(selectedUserForDetail.certifications).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {parseArray(selectedUserForDetail.certifications).map((cert: string, idx: number) => (
                      <span key={idx} className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                        <BadgeCheck size={11} />
                        <span>{cert.trim()}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">{isArabic ? 'لا توجد شهادات مسجلة' : 'No certifications recorded'}</p>
                )}
              </div>

            </div>

            {/* Allowed Modules Sections */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5 space-y-3">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info size={14} />
                <span>{isArabic ? 'صلاحيات الأقسام المفتوحة بالمنصة' : 'Authorized Application Sections'}</span>
              </h3>
              {selectedUserForDetail.allowedSections && selectedUserForDetail.allowedSections.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {selectedUserForDetail.allowedSections.map((secId: string) => {
                    const meta = SECTIONS_METADATA.find(s => s.id === secId);
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                      <div key={secId} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                        <Icon size={12} className={meta.color} />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{isArabic ? meta.nameAr : meta.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">{isArabic ? 'لا توجد صلاحيات أقسام معينة' : 'No sections authorized'}</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Professional Warning Dialog */}
      {warningModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[400] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-[#0b1628]/95 border border-rose-500/20 rounded-[2rem] p-6 md:p-8 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-5 border border-rose-500/20 shadow-md">
              <ShieldAlert size={32} className="animate-pulse" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{warningModal.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{warningModal.message}</p>
            
            <Button onClick={() => setWarningModal(null)} className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-3 font-bold transition-all">
              {isArabic ? 'حسناً، فهمت' : 'Dismiss'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
