'use client';

import { StaffSidebar } from '@/components/layout/StaffSidebar';
import { AccessDenied } from '@/components/layout/AccessDenied';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type ScreenMode = 'mobile' | 'tablet' | 'desktop';

export default function StaffLayout({ children, params }: { children: React.ReactNode, params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  const pathname = usePathname();
  const router = useRouter();

  const [session, setSession] = useState<{ role: string; allowedSections: string[]; name?: string; nameAr?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenMode, setScreenMode] = useState<ScreenMode>('desktop');

  // Screen size detection — synced with StaffSidebar breakpoints
  const updateScreenMode = useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w < 768) {
      setScreenMode('mobile');
    } else if (w < 1024) {
      setScreenMode('tablet');
    } else {
      setScreenMode('desktop');
    }
  }, []);

  useEffect(() => {
    updateScreenMode();
    window.addEventListener('resize', updateScreenMode);
    return () => window.removeEventListener('resize', updateScreenMode);
  }, [updateScreenMode]);

  useEffect(() => {
    const checkSession = () => {
      const raw = localStorage.getItem('active_user_session');
      if (raw) {
        try {
          setSession(JSON.parse(raw));
          setLoading(false);
        } catch (e) {
          console.error(e);
          router.push(`/${params.lang}/staff/login`);
        }
      } else {
        router.push(`/${params.lang}/staff/login`);
      }
    };

    checkSession();
    window.addEventListener('storage', checkSession);
    window.addEventListener('user-session-changed', checkSession);
    return () => {
      window.removeEventListener('storage', checkSession);
      window.removeEventListener('user-session-changed', checkSession);
    };
  }, []);

  // Presence Heartbeat
  useEffect(() => {
    if (!session) return;
    
    // Ping immediately on mount if session exists
    fetch('/api/staff/presence', { method: 'POST' }).catch(console.error);

    const interval = setInterval(() => {
      fetch('/api/staff/presence', { method: 'POST' }).catch(console.error);
    }, 60 * 1000); // every 1 minute

    return () => clearInterval(interval);
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-th-bg flex items-center justify-center">
        <div className="animate-spin text-teal-400 w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Parse path to see which section is being accessed
  const getSectionInfo = (path: string) => {
    const segments = path.split('/staff/');
    if (segments.length < 2) return { isDashboard: true, key: '', nameEn: '', nameAr: '' };
    
    const subPath = segments[1];
    if (!subPath) return { isDashboard: true, key: '', nameEn: '', nameAr: '' };
    
    const primarySegment = subPath.split('/')[0]; // e.g. 'patrols', 'monitoring', etc.
    
    const sectionsMap: Record<string, { nameEn: string; nameAr: string }> = {
      patrols: { nameEn: 'Marine Patrols', nameAr: 'الدوريات البحرية' },
      monitoring: { nameEn: 'Environmental Monitoring', nameAr: 'الرصد البيئي' },
      eia: { nameEn: 'Environmental Assessment', nameAr: 'تقييم الأثر البيئي' },
      violations: { nameEn: 'Violations Log', nameAr: 'سجل المخالفات' },
      fleet: { nameEn: 'Fleet & Equipment', nameAr: 'الأسطول والمعدات' },
      gis: { nameEn: 'GIS & Maps', nameAr: 'نظم المعلومات الجغرافية' },
      media: { nameEn: 'Media Center', nameAr: 'المركز الإعلامي' },
      users: { nameEn: 'User Management', nameAr: 'إدارة المستخدمين' },
      settings: { nameEn: 'System Settings', nameAr: 'إعدادات النظام' },
      profile: { nameEn: 'User Profile', nameAr: 'الملف الشخصي' },
      'email-routing': { nameEn: 'Email Routing', nameAr: 'توجيه البريد' },
    };

    const meta = sectionsMap[primarySegment] || { nameEn: primarySegment, nameAr: primarySegment };
    return {
      isDashboard: false,
      key: primarySegment,
      nameEn: meta.nameEn,
      nameAr: meta.nameAr
    };
  };

  const { isDashboard, key, nameEn, nameAr } = getSectionInfo(pathname);

  let hasAccess = true;
  if (!isDashboard && key !== 'settings' && key !== 'profile') {
    if (key === 'users') {
      hasAccess = session?.role === 'ADMIN';
    } else {
      hasAccess = session?.role === 'ADMIN' || (session?.allowedSections?.includes(key) ?? false);
    }
  }

  // Dynamic main content margins based on screen mode
  const getMainClasses = () => {
    if (screenMode === 'mobile') {
      // No sidebar margin on mobile; add bottom padding for bottom nav bar
      return 'p-4 pb-24';
    }
    if (screenMode === 'tablet') {
      // Tablet has 72px icon rail
      return `${isArabic ? 'mr-[72px]' : 'ml-[72px]'} p-5`;
    }
    // Desktop has full 288px (w-72) sidebar
    return `${isArabic ? 'mr-72' : 'ml-72'} p-8`;
  };

  return (
    <div className={`no-print-layout flex h-screen overflow-hidden bg-th-bg text-th-text ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
      <StaffSidebar lang={params.lang} />
      <main className={`flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar transition-all duration-300 bg-th-bg ${getMainClasses()}`}>
        {hasAccess ? (
          children
        ) : (
          <AccessDenied lang={params.lang} sectionNameEn={nameEn} sectionNameAr={nameAr} />
        )}
      </main>
    </div>
  );
}
