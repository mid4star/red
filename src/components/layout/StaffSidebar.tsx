'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ClipboardList
} from 'lucide-react';

import { useState, useEffect } from 'react';

interface NavItem {
  name: string;
  nameAr: string;
  href: string;
  icon: any;
}

export function StaffSidebar({ lang }: { lang: string }) {
  const isArabic = lang === 'ar';
  const pathname = usePathname();

  const [session, setSession] = useState<{ role: string; allowedSections: string[]; name?: string; nameAr?: string } | null>(null);

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

  const navItems: NavItem[] = [
    { name: 'Dashboard', nameAr: 'لوحة التحكم', href: `/${lang}/staff`, icon: LayoutDashboard },
    { name: 'Marine Patrols', nameAr: 'الدوريات البحرية', href: `/${lang}/staff/patrols`, icon: Waves },
    { name: 'Environmental Monitoring', nameAr: 'الرصد البيئي', icon: Microscope, href: `/${lang}/staff/monitoring` },
    { name: 'Environmental Assessment', nameAr: 'تقييم الأثر البيئي', href: `/${lang}/staff/eia`, icon: ClipboardList },
    { name: 'Violations', nameAr: 'سجل المخالفات', href: `/${lang}/staff/violations`, icon: AlertTriangle },
    { name: 'Fleet & Equipment', nameAr: 'الأسطول والمعدات', href: `/${lang}/staff/fleet`, icon: Anchor },
    { name: 'User Management', nameAr: 'إدارة المستخدمين', href: `/${lang}/staff/users`, icon: Users },
    { name: 'Media Center', nameAr: 'المركز الإعلامي', href: `/${lang}/staff/media`, icon: Megaphone },
    { name: 'System Settings', nameAr: 'إعدادات النظام', href: `/${lang}/staff/settings`, icon: Settings },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.href === `/${lang}/staff`) return true;
    if (item.href.endsWith('/users')) {
      return session?.role === 'ADMIN';
    }
    if (item.href.endsWith('/settings')) return true;

    const sectionKey = item.href.split('/').pop() || '';
    if (session?.role === 'ADMIN') return true;
    return session?.allowedSections?.includes(sectionKey);
  });

  return (
    <aside
      className={`w-72 bg-[#0a1628] text-[#e2e8f0] min-h-screen fixed top-0 bottom-0 shadow-[4px_0_24px_rgba(0,0,0,0.3)] flex flex-col z-[100] transition-all duration-500 ease-in-out border-none ${isArabic ? 'right-0' : 'left-0'}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* ── Header / Branding ────────────────────────────────────────────────── */}
      <div className="p-8 pb-6 border-b border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)] shrink-0">
            <span className="text-white font-black text-lg">R</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-md font-bold tracking-tight text-white leading-tight">
              {isArabic ? 'بوابة المساهمين' : 'Staff Portal'}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.1em] text-teal-400/80 font-bold">
              {isArabic ? 'محميات البحر الأحمر' : 'Red Sea Authority'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation List ──────────────────────────────────────────────────── */}
      <nav className="flex-1 py-8 px-5 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${lang}/staff` && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group no-underline"
            >
              <div
                className={`
                  flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-teal-500/10 text-white shadow-[inset_0_0_10px_rgba(45,212,191,0.05)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div
                    layoutId="activeSide"
                    className={`absolute w-1.5 h-6 bg-teal-400 rounded-full ${isArabic ? '-right-1' : '-left-1'}`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={`p-1 rounded-lg transition-transform duration-300 ${isActive ? 'scale-110 text-teal-400' : 'group-hover:scale-110 group-hover:text-white'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <span className={`text-[13px] font-medium transition-all ${isActive ? 'font-bold tracking-wide' : 'opacity-80'}`}>
                  {isArabic ? item.nameAr : item.name}
                </span>

                {isActive && (
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
      <div className="mt-auto p-5 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 group transition-all hover:bg-white/[0.08] cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-[#1e293b] border-2 border-white/10 overflow-hidden shrink-0">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-white truncate">
              {session ? (isArabic ? session.nameAr || 'مصطفى لايق' : session.name || 'M. Layaq') : (isArabic ? 'مصطفى لايق' : ' M. Layaq')}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter">
              {session ? (isArabic ? (session.role === 'ADMIN' ? 'مسئول الموقع' : session.role) : session.role) : (isArabic ? 'مسئول الموقع ' : 'Site Manager')}
            </p>
          </div>
          <button className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>

        <div className="mt-4 flex justify-between items-center px-2">
          <span className="text-[9px] font-bold text-slate-600 tracking-widest uppercase">system v1.1</span>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[9px] text-teal-400 font-bold uppercase tracking-tighter">{isArabic ? 'متصل' : 'ONLINE'}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </aside>
  );
}
