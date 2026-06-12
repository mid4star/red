'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Waves,
  AlertTriangle,
  Anchor,
  Users,
  Settings,
  Microscope,
  Megaphone,
  LogOut,
  ChevronRight,
  ClipboardList,
  MoreHorizontal,
  X,
  Grid3X3,
  ChevronDown,
  Sun,
  Moon,
  Map,
  Mail,
  Radio
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

import { useState, useEffect, useCallback } from 'react';

interface NavItem {
  name: string;
  nameAr: string;
  href: string;
  icon: any;
  sectionKey: string;
}

type ScreenMode = 'mobile' | 'tablet' | 'desktop';

export function StaffSidebar({ lang }: { lang: string }) {
  const { theme, toggleTheme } = useTheme();
  const isArabic = lang === 'ar';
  const pathname = usePathname();
  const router = useRouter();

  const [session, setSession] = useState<{ role: string; allowedSections: string[]; name?: string; nameAr?: string } | null>(null);
  const [config, setConfig] = useState<any>({
    siteName: 'Red Sea Reserves',
    siteNameAr: 'محميات البحر الأحمر',
    siteLogoUrl: '',
  });

  const handleLogout = async () => {
    localStorage.removeItem('active_user_session');
    window.dispatchEvent(new Event('user-session-changed'));
    await fetch('/api/auth/logout', { method: 'POST' }).catch(err => console.error(err));
    router.push(`/${lang}/staff/login`);
  };
  const [screenMode, setScreenMode] = useState<ScreenMode>('desktop');
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [tabletExpanded, setTabletExpanded] = useState(false);

  // Screen size detection
  const updateScreenMode = useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w < 768) {
      setScreenMode('mobile');
      setTabletExpanded(false);
    } else if (w < 1024) {
      setScreenMode('tablet');
      setMoreDrawerOpen(false);
    } else {
      setScreenMode('desktop');
      setMoreDrawerOpen(false);
      setTabletExpanded(false);
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
        } catch (e) {
          console.error(e);
        }
      } else {
        setSession(null);
      }
    };

    checkSession();
    // Listen for custom events or storage changes to sync role/allowedSections in real-time
    window.addEventListener('storage', checkSession);
    window.addEventListener('user-session-changed', checkSession);
    return () => {
      window.removeEventListener('storage', checkSession);
      window.removeEventListener('user-session-changed', checkSession);
    };
  }, []);

  useEffect(() => {
     fetch('/api/staff/query?collection=system_config')
        .then(r => r.json())
        .then(json => {
           if (json.success && json.data && json.data.length > 0) {
              const globalConfig = json.data.find((item: any) => item.id === 'global') || json.data[0];
              if (globalConfig) {
                 setConfig(globalConfig);
              }
           }
        })
        .catch(err => console.error(err));
  }, []);

  // Close more drawer when pathname changes
  useEffect(() => {
    setMoreDrawerOpen(false);
  }, [pathname]);

  // Handle body scroll lock for mobile more drawer
  useEffect(() => {
    if (moreDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [moreDrawerOpen]);

  const allNavItems: NavItem[] = [
    { name: 'Dashboard', nameAr: 'لوحة التحكم', href: `/${lang}/staff`, icon: LayoutDashboard, sectionKey: '' },
    { name: 'Marine Patrols', nameAr: 'الدوريات البحرية', href: `/${lang}/staff/patrols`, icon: Waves, sectionKey: 'patrols' },
    { name: 'Environmental Monitoring', nameAr: 'الرصد البيئي', icon: Microscope, href: `/${lang}/staff/monitoring`, sectionKey: 'monitoring' },
    { name: 'Environmental Assessment', nameAr: 'تقييم الأثر البيئي', href: `/${lang}/staff/eia`, icon: ClipboardList, sectionKey: 'eia' },
    { name: 'Violations', nameAr: 'سجل المخالفات', href: `/${lang}/staff/violations`, icon: AlertTriangle, sectionKey: 'violations' },
    { name: 'Fleet & Equipment', nameAr: 'الأسطول والمعدات', href: `/${lang}/staff/fleet`, icon: Anchor, sectionKey: 'fleet' },
    { name: 'GIS & Maps', nameAr: 'نظم المعلومات الجغرافية', href: `/${lang}/staff/gis`, icon: Map, sectionKey: 'gis' },
    { name: 'User Management', nameAr: 'إدارة المستخدمين', href: `/${lang}/staff/users`, icon: Users, sectionKey: 'users' },
    { name: 'Email Routing', nameAr: 'توجيه البريد', href: `/${lang}/staff/email-routing`, icon: Mail, sectionKey: 'email-routing' },
    { name: 'Media Center', nameAr: 'المركز الإعلامي', href: `/${lang}/staff/media`, icon: Megaphone, sectionKey: 'media' },
    { name: 'News Radar', nameAr: 'الرادار الإخباري', href: `/${lang}/staff/radar`, icon: Radio, sectionKey: 'media' },
    { name: 'System Settings', nameAr: 'إعدادات النظام', href: `/${lang}/staff/settings`, icon: Settings, sectionKey: 'settings' },
  ];

  const filteredNavItems = allNavItems.filter((item) => {
    if (item.href === `/${lang}/staff`) return true;
    if (item.sectionKey === 'users') {
      return session?.role === 'ADMIN';
    }
    if (item.sectionKey === 'settings') return true;

    if (session?.role === 'ADMIN') return true;
    return session?.allowedSections?.includes(item.sectionKey);
  });

  const isActive = (href: string) =>
    pathname === href || (href !== `/${lang}/staff` && pathname.startsWith(href));

  // ───────────── MOBILE: Bottom Navigation Bar ─────────────
  // Primary tabs shown in mobile bottom bar (max 5: Dashboard, Patrols, Monitoring, EIA, More)
  const primaryMobileTabs = filteredNavItems.slice(0, 4);
  const secondaryMobileItems = filteredNavItems.slice(4);

  if (screenMode === 'mobile') {
    return (
      <>
        {/* Mobile Bottom Navigation Bar */}
        <nav
          className="no-print fixed bottom-0 left-0 right-0 z-[200] safe-area-bottom"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className="bg-th-surface/90 backdrop-blur-2xl border-t border-th-border dark:bg-[#0a1628]/90 dark:border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.5)] transition-colors duration-300">
            <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1.5">
              {primaryMobileTabs.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[56px] rounded-xl transition-all duration-300 no-underline relative"
                  >
                    {active && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        className="absolute inset-0 bg-teal-500/10 rounded-xl"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <div className={`relative z-10 p-1 rounded-lg transition-all duration-300 ${active ? 'text-teal-400 scale-110' : 'text-slate-500'}`}>
                      <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                    </div>
                    <span className={`relative z-10 text-[9px] font-bold uppercase tracking-wide transition-colors duration-300 ${active ? 'text-teal-400' : 'text-slate-500'}`}>
                      {isArabic ? item.nameAr.split(' ')[0] : item.name.split(' ')[0]}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="mobileActiveDot"
                        className="absolute -top-0.5 w-5 h-0.5 bg-teal-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* More Button */}
              <button
                onClick={() => setMoreDrawerOpen(true)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[56px] rounded-xl transition-all duration-300 ${
                  moreDrawerOpen || secondaryMobileItems.some(i => isActive(i.href))
                    ? 'text-teal-400'
                    : 'text-slate-500'
                }`}
              >
                <div className="p-1 rounded-lg">
                  <Grid3X3 size={20} strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide">
                  {isArabic ? 'المزيد' : 'More'}
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* "More" Drawer Overlay */}
        <AnimatePresence>
          {moreDrawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250]"
                onClick={() => setMoreDrawerOpen(false)}
              />

              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-[260] max-h-[70vh] overflow-y-auto"
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                <div className="bg-th-surface/95 backdrop-blur-2xl rounded-t-3xl border-t border-x border-th-border dark:bg-[#0d1b2a]/95 dark:border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.6)] transition-colors duration-300">
                  {/* Drag Handle */}
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pb-4 border-b border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      {isArabic ? 'جميع الأقسام' : 'All Sections'}
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleTheme}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        title={isArabic ? 'تغيير المظهر' : 'Toggle Theme'}
                        aria-label="Toggle Theme"
                        aria-pressed={theme === 'dark'}
                      >
                        {theme === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-blue-400" />}
                      </button>
                      <button
                        onClick={() => setMoreDrawerOpen(false)}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Grid of Secondary Items */}
                  <div className="grid grid-cols-2 gap-4 p-5">
                    {secondaryMobileItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreDrawerOpen(false)}
                          className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all duration-300 no-underline ${
                            active
                              ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                              : 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${active ? 'bg-teal-500/15' : 'bg-white/5'}`}>
                            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                          </div>
                          <span className="text-[12px] font-bold text-center leading-tight">
                            {isArabic ? item.nameAr : item.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* User Info Footer */}
                  <div className="px-5 pb-5 pt-2 border-t border-white/5 mt-1">
                    <Link href={`/${lang}/staff/profile`} onClick={() => setMoreDrawerOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer no-underline">
                      <div className="w-9 h-9 rounded-full bg-[#1e293b] border-2 border-white/10 overflow-hidden shrink-0">
                        <img
                          src={session?.profilePictureUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                          {session ? (isArabic ? session.nameAr || 'مصطفى لايق' : session.name || 'M. Layaq') : (isArabic ? 'مصطفى لايق' : 'M. Layaq')}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide line-clamp-2 leading-tight mt-0.5">
                          {session ? (isArabic ? (session.role === 'ADMIN' ? 'مسئول الموقع' : session.role) : session.role) : (isArabic ? 'مسئول الموقع' : 'Site Manager')}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleLogout(); }} 
                        className="text-slate-500 hover:text-red-400 transition-colors p-2 cursor-pointer z-10"
                        title={isArabic ? 'تسجيل الخروج' : 'Log Out'}
                      >
                        <LogOut size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ───────────── TABLET: Compact Icon-Only Rail ─────────────
  if (screenMode === 'tablet') {
    return (
      <>
        {/* Backdrop overlay removed for UX improvement */}
        <AnimatePresence>
        </AnimatePresence>

        <aside
          className={`fixed inset-y-0 ${isArabic ? 'right-0' : 'left-0'} bg-th-sidebar text-th-text dark:bg-[#0a1628] dark:text-white flex flex-col z-[100] transition-all duration-300 ${tabletExpanded ? 'w-64' : 'w-[72px]'} shadow-[4px_0_24px_rgba(0,0,0,0.3)] transition-colors duration-300`}
          onMouseEnter={() => setTabletExpanded(true)}
          onMouseLeave={() => setTabletExpanded(false)}
        >
        {/* Tablet Header */}
        <div className="p-3 border-b border-white/5 flex items-center justify-center shrink-0">
          <button
            onClick={() => setTabletExpanded(prev => !prev)}
            className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)] shrink-0 transition-transform hover:scale-105 overflow-hidden"
          >
            {config.siteLogoUrl ? (
               <img src={config.siteLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                 <span className="text-white font-black text-lg">R</span>
               </div>
            )}
          </button>
          {tabletExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center"
            >
              <h1 className="text-[11px] font-bold tracking-tight text-white leading-tight">
                {isArabic ? 'بوابة الموظفين' : 'Staff Portal'}
              </h1>
              <p className="text-[8px] uppercase tracking-[0.1em] text-teal-400/80 font-bold mt-1 line-clamp-1 px-1">
                {isArabic ? config.siteNameAr : config.siteName}
              </p>
            </motion.div>
          )}
        </div>

        {/* Tablet Nav */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar min-h-0">
          {filteredNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative group no-underline block"
                title={isArabic ? item.nameAr : item.name}
              >
                <div
                  className={`
                    flex items-center gap-3 rounded-xl transition-all duration-300 relative
                    ${tabletExpanded ? 'px-3.5 py-3' : 'justify-center py-3 px-2'}
                    ${active
                      ? 'bg-teal-500/10 text-white shadow-[inset_0_0_10px_rgba(45,212,191,0.05)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {active && (
                    <motion.div
                      layoutId="tabletActiveSide"
                      className={`absolute w-1 h-5 bg-teal-400 rounded-full ${isArabic ? '-right-0.5' : '-left-0.5'}`}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  <div className={`p-1 rounded-lg transition-transform duration-300 ${active ? 'scale-110 text-teal-400' : 'group-hover:scale-110'}`}>
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  </div>

                  {tabletExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-[12px] font-medium whitespace-nowrap ${active ? 'font-bold tracking-wide' : 'opacity-80'}`}
                    >
                      {isArabic ? item.nameAr : item.name}
                    </motion.span>
                  )}
                </div>

                {/* Tooltip for collapsed state */}
                {!tabletExpanded && (
                  <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[110] ${
                    isArabic ? 'right-full mr-2' : 'left-full ml-2'
                  }`}>
                    <div className="bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap">
                      {isArabic ? item.nameAr : item.name}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Tablet Footer */}
        <div className="mt-auto p-2 border-t border-white/5 bg-white/[0.02] shrink-0">
          <Link href={`/${lang}/staff/profile`} className={`flex items-center gap-2 p-2 rounded-2xl bg-white/5 border border-white/5 group transition-all hover:bg-white/[0.08] cursor-pointer no-underline ${tabletExpanded ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-white/10 overflow-hidden shrink-0">
              <img
                src={session?.profilePictureUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {tabletExpanded && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                    {session ? (isArabic ? session.nameAr || 'مصطفى لايق' : session.name || 'M. Layaq') : (isArabic ? 'مصطفى لايق' : 'M. Layaq')}
                  </h4>
                  <p className="text-[9px] text-slate-500 font-medium line-clamp-2 leading-tight uppercase tracking-tighter mt-0.5">
                    {session ? (isArabic ? (session.role === 'ADMIN' ? 'مسئول الموقع' : session.role) : session.role) : (isArabic ? 'مسئول الموقع' : 'Site Manager')}
                  </p>
                </motion.div>
                <button 
                  onClick={(e) => { e.preventDefault(); handleLogout(); }} 
                  className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer shrink-0 z-10"
                  title={isArabic ? 'تسجيل الخروج' : 'Log Out'}
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </Link>
          <div className={`mt-3 pt-2 border-t border-white/5 flex items-center justify-between px-1 ${tabletExpanded ? '' : 'justify-center'}`}>
            <button
              onClick={toggleTheme}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              title={isArabic ? 'تغيير المظهر' : 'Toggle Theme'}
              aria-label="Toggle Theme"
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-yellow-400" />
              ) : (
                <Moon size={16} className="text-blue-400" />
              )}
            </button>
            {tabletExpanded && (
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[8px] text-teal-400 font-bold uppercase tracking-tighter">{isArabic ? 'متصل' : 'ONLINE'}</span>
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.4) rgba(0, 0, 0, 0.2);
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.4);
            border-radius: 10px;
            border: 2px solid rgba(0, 0, 0, 0.2);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(45, 212, 191, 0.8);
          }
        `}</style>
        </aside>
      </>
    );
  }

  // ───────────── DESKTOP: Full Sidebar (Original) ─────────────
  return (
    <aside
      className={`no-print w-64 bg-th-sidebar text-th-text dark:bg-[#0a1628] dark:text-[#e2e8f0] min-h-screen fixed top-0 bottom-0 shadow-[4px_0_24px_rgba(0,0,0,0.3)] flex flex-col z-[100] transition-all duration-500 ease-in-out border-none ${isArabic ? 'right-0' : 'left-0'} transition-colors duration-300`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* ── Header / Branding ────────────────────────────────────────────────── */}
      <div className="p-6 pb-4 border-b border-white/5 flex flex-col gap-4 shrink-0">
        <div className="flex items-center gap-3.5">
          {config.siteLogoUrl ? (
             <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)] bg-white/5 shrink-0">
                <img src={config.siteLogoUrl} alt="Logo" className="w-full h-full object-cover" />
             </div>
          ) : (
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)] shrink-0">
               <span className="text-white font-black text-lg">R</span>
             </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-md font-bold tracking-tight text-white leading-tight">
              {isArabic ? 'بوابة الموظفين' : 'Staff Portal'}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.1em] text-teal-400/80 font-bold mt-1 line-clamp-1">
              {isArabic ? config.siteNameAr : config.siteName}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation List ──────────────────────────────────────────────────── */}
      <nav className="flex-1 py-4 px-4 space-y-0.5 overflow-y-auto custom-scrollbar min-h-0 pb-6">
        {filteredNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group no-underline"
            >
              <div
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-300
                  ${active
                    ? 'bg-teal-500/10 text-white shadow-[inset_0_0_10px_rgba(45,212,191,0.05)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {/* Active Indicator Line */}
                {active && (
                  <motion.div
                    layoutId="activeSide"
                    className={`absolute w-1 h-5 bg-teal-400 rounded-full ${isArabic ? '-right-0.5' : '-left-0.5'}`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={`p-1 rounded-lg transition-transform duration-300 ${active ? 'scale-110 text-teal-400' : 'group-hover:scale-110 group-hover:text-white'}`}>
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                </div>

                <span className={`text-[12px] font-medium transition-all ${active ? 'font-bold tracking-wide' : 'opacity-80'}`}>
                  {isArabic ? item.nameAr : item.name}
                </span>

                {active && (
                  <div className={`${isArabic ? 'mr-auto' : 'ml-auto'}`}>
                    <ChevronRight size={14} className={`opacity-40 ${isArabic ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── User Session / Bottom Footer ────────────────────────────────────── */}
      <div className="mt-auto p-4 border-t border-white/5 bg-white/[0.02] shrink-0 z-20">
        <Link href={`/${lang}/staff/profile`} className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 group transition-all hover:bg-white/[0.08] cursor-pointer no-underline">
          <div className="w-10 h-10 rounded-full bg-[#1e293b] border-2 border-white/10 overflow-hidden shrink-0">
            <img
              src={session?.profilePictureUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-white line-clamp-2 leading-tight group-hover:text-teal-400 transition-colors">
              {session ? (isArabic ? session.nameAr || 'مصطفى لايق' : session.name || 'M. Layaq') : (isArabic ? 'مصطفى لايق' : ' M. Layaq')}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-tight uppercase tracking-tighter mt-0.5">
              {session ? (isArabic ? (session.role === 'ADMIN' ? 'مسئول الموقع' : session.role) : session.role) : (isArabic ? 'مسئول الموقع ' : 'Site Manager')}
            </p>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); handleLogout(); }} 
            className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer z-10 p-2"
            title={isArabic ? 'تسجيل الخروج' : 'Log Out'}
          >
            <LogOut size={16} />
          </button>
        </Link>

        <div className="mt-4 flex justify-between items-center px-2 border-t border-white/5 pt-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isArabic ? 'تغيير المظهر' : 'Toggle Theme'}
            aria-label="Toggle Theme"
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} className="text-yellow-400" />
                <span>{isArabic ? 'الوضع المضيء' : 'Light Mode'}</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-blue-400" />
                <span>{isArabic ? 'الوضع الداكن' : 'Dark Mode'}</span>
              </>
            )}
          </button>
          
          <div className="flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[9px] text-teal-400 font-bold uppercase tracking-tighter">{isArabic ? 'متصل' : 'ONLINE'}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.4) rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 10px;
          border: 2px solid rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 212, 191, 0.8);
        }
      `}</style>
    </aside>
  );
}
