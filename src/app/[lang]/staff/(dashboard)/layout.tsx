'use client';

import { StaffSidebar } from '@/components/layout/StaffSidebar';
import { AccessDenied } from '@/components/layout/AccessDenied';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function StaffLayout({ children, params }: { children: React.ReactNode, params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  const pathname = usePathname();

  const [session, setSession] = useState<{ role: string; allowedSections: string[]; name?: string; nameAr?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const raw = localStorage.getItem('active_user_session');
      if (raw) {
        try {
          setSession(JSON.parse(raw));
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultSession = {
          employeeId: 'admin',
          role: 'ADMIN',
          name: 'M. Layaq',
          nameAr: 'مصطفى لايق',
          allowedSections: ['patrols', 'monitoring', 'eia', 'violations', 'fleet', 'media', 'settings']
        };
        localStorage.setItem('active_user_session', JSON.stringify(defaultSession));
        setSession(defaultSession);
      }
      setLoading(false);
    };

    checkSession();
    window.addEventListener('storage', checkSession);
    window.addEventListener('user-session-changed', checkSession);
    return () => {
      window.removeEventListener('storage', checkSession);
      window.removeEventListener('user-session-changed', checkSession);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
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
      media: { nameEn: 'Media Center', nameAr: 'المركز الإعلامي' },
      users: { nameEn: 'User Management', nameAr: 'إدارة المستخدمين' },
      settings: { nameEn: 'System Settings', nameAr: 'إعدادات النظام' },
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
  if (!isDashboard && key !== 'settings') {
    if (key === 'users') {
      hasAccess = session?.role === 'ADMIN';
    } else {
      hasAccess = session?.role === 'ADMIN' || (session?.allowedSections?.includes(key) ?? false);
    }
  }

  return (
    <div className={`flex min-h-screen bg-[#0a1628] text-white ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
      <StaffSidebar lang={params.lang} />
      <main className={`flex-1 transition-all ${isArabic ? 'mr-72' : 'ml-72'} p-8 bg-[#0a1628]`}>
        {hasAccess ? (
          children
        ) : (
          <AccessDenied lang={params.lang} sectionNameEn={nameEn} sectionNameAr={nameAr} />
        )}
      </main>
    </div>
  );
}
