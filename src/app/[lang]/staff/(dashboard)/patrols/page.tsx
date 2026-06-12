'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Plus, Ship, Clock, AlertTriangle, Eye, Calendar, MapPin, CheckCircle, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import EnvironmentalConditions from '@/components/patrols/EnvironmentalConditions';

export default function PatrolsDashboard({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  
  const [patrols, setPatrols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchPatrols();
  }, []);

  const fetchPatrols = async () => {
    try {
      const res = await fetch('/api/staff/patrols?limit=100');
      const json = await res.json();
      if (json.success) {
        setPatrols(json.data);
      }
    } catch (error) {
      console.error('Error fetching patrols:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatrols = patrols.filter(p => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (p.code?.toLowerCase().includes(q) || p.zone?.toLowerCase().includes(q) || p.type?.toLowerCase().includes(q));
    }
    return true;
  });

  const totalPatrols = patrols.length;
  const totalHours = patrols.reduce((acc, p) => acc + (p.duration || 0), 0);
  const totalObservations = patrols.reduce((acc, p) => acc + (p.patrolObservations?.length || 0), 0);
  const totalViolations = patrols.reduce((acc, p) => acc + (p.patrolViolations?.length || 0), 0);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'COMPLETED': return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
      case 'EMERGENCY': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8 overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Majestic Hero Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-th-surface2/60 border border-th-border backdrop-blur-2xl p-5 md:p-10 mb-8 shadow-2xl"
      >
        {/* Abstract animated backgrounds */}
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-sky-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8 relative z-10">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-3 md:mb-4"
            >
              <div className="p-2 md:p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                <Shield size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.3em] text-teal-400 uppercase drop-shadow-md">
                {isArabic ? 'إدارة العمليات البحرية' : 'Marine Operations'}
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-th-text dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tighter mb-3 md:mb-4 leading-tight"
            >
              {isArabic ? 'المركز الرئيسي للدوريات' : 'Patrol Command Center'}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs md:text-base text-th-muted leading-relaxed font-medium"
            >
              {isArabic 
                ? 'إدارة الأسطول، توجيه الدوريات البحرية والساحلية، تسجيل المخالفات، ومتابعة الرصد البيئي الحي عبر كافة محميات البحر الأحمر.' 
                : 'Manage the fleet, direct marine and coastal patrols, record violations, and monitor live ecological observations across the Red Sea reserves.'}
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="shrink-0 flex flex-col gap-3 mt-4 md:mt-0 w-full md:w-auto"
          >
            <Link href={`/${params.lang}/staff/patrols/new`} className="w-full">
              <Button className="w-full md:w-auto h-12 md:h-14 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-[#001529] font-black rounded-xl md:rounded-2xl px-6 md:px-8 flex items-center justify-center gap-2 md:gap-3 shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:shadow-[0_0_40px_rgba(45,212,191,0.5)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="bg-white/20 p-1 md:p-1.5 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                  <Plus size={18} strokeWidth={3} className="text-[#001529]" />
                </div>
                <span className="text-xs md:text-sm uppercase tracking-widest">{isArabic ? 'تسجيل دورية جديدة' : 'Log New Patrol'}</span>
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Analytics Mini-Dashboard within Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-10 pt-6 md:pt-8 border-t border-th-border relative z-10"
        >
          {[
            { label: isArabic ? 'إجمالي الدوريات' : 'Total Patrols', val: totalPatrols, icon: Ship, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
            { label: isArabic ? 'ساعات الإبحار' : 'Patrol Hours', val: `${totalHours}h`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: isArabic ? 'المشاهدات' : 'Observations', val: totalObservations, icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { label: isArabic ? 'المخالفات' : 'Violations', val: totalViolations, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
          ].map((stat, idx) => (
            <div key={idx} className={`flex items-center gap-2.5 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-th-surface/30 border ${stat.border} hover:bg-th-surface/60 transition-colors min-w-0`}>
              <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${stat.bg} ${stat.color} shadow-inner shrink-0`}>
                <stat.icon size={18} strokeWidth={2} className="md:w-[22px] md:h-[22px]" />
              </div>
              <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                <span className="text-[9px] md:text-[10px] text-th-muted font-bold uppercase tracking-wider truncate block">{stat.label}</span>
                <span className="text-base sm:text-lg md:text-2xl font-black text-th-text tracking-tight truncate block">{stat.val}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Environmental Conditions Panel */}
      <EnvironmentalConditions isArabic={isArabic} />

      {/* Filters and List */}
      <Card className="p-4 md:p-6 rounded-2xl w-full overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-500" size={18} />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "بحث برمز الدورية أو المنطقة..." : "Search by code or zone..."}
              className="pl-10 h-11"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-th-muted" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-11 bg-th-input border border-th-border text-th-text rounded-xl px-4 focus:outline-none focus:border-teal-500 text-sm cursor-pointer"
            >
              <option value="ALL" className="bg-th-surface text-th-text">{isArabic ? 'الكل' : 'All Status'}</option>
              <option value="ACTIVE" className="bg-th-surface text-th-text">{isArabic ? 'نشط' : 'Active'}</option>
              <option value="COMPLETED" className="bg-th-surface text-th-text">{isArabic ? 'مكتمل' : 'Completed'}</option>
              <option value="DRAFT" className="bg-th-surface text-th-text">{isArabic ? 'مسودة' : 'Draft'}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col gap-4">
              {filteredPatrols.map((p) => (
                <div key={p.id} className="bg-th-surface2 border border-th-border rounded-2xl p-4 flex flex-col gap-4 transition-colors relative overflow-hidden hover:bg-th-surface2/80">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold text-th-text">{p.code || p.id.slice(0,8)}</span>
                      <span className="text-[10px] text-th-dim">{p.type}</span>
                    </div>
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider border ${getStatusColor(p.status)}`}>
                      {isArabic && p.status === 'ACTIVE' ? 'نشط' : 
                       isArabic && p.status === 'COMPLETED' ? 'مكتمل' : 
                       isArabic && p.status === 'DRAFT' ? 'مسودة' : p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col gap-1.5 bg-th-input/40 p-2.5 rounded-xl">
                      <span className="text-[10px] text-th-dim uppercase">{isArabic ? 'المنطقة' : 'Zone'}</span>
                      <div className="flex items-center gap-1.5 text-th-muted">
                        <MapPin size={14} className="text-sky-400 shrink-0" />
                        <span className="font-medium truncate">{isArabic ? p.zoneAr : p.zone}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 bg-th-input/40 p-2.5 rounded-xl">
                      <span className="text-[10px] text-th-dim uppercase">{isArabic ? 'التاريخ' : 'Date'}</span>
                      <div className="flex items-center gap-1.5 text-th-muted">
                        <Calendar size={14} className="text-teal-400 shrink-0" />
                        <span className="font-medium">{new Date(p.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-th-input/40 p-2.5 rounded-xl">
                    <span className="text-[10px] text-th-dim uppercase">{isArabic ? 'القيادة' : 'Leadership'}</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-th-text font-bold text-sm truncate">{p.leader ? (isArabic ? p.leader.nameAr || p.leader.name : p.leader.name) : (isArabic ? 'بدون قائد' : 'No Leader')}</span>
                      {p.customLeaderName && (
                        <span className="inline-flex items-center whitespace-nowrap text-[9px] text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-md border border-teal-400/20 font-bold shrink-0">
                          {isArabic ? 'ريس:' : 'Capt:'} {p.customLeaderName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-th-border mt-1">
                    <div className="flex gap-2">
                      <span className="flex items-center justify-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1.5 rounded-lg font-bold text-xs min-w-[3rem]">
                        <Eye size={12} /> {p.patrolObservations?.length || 0}
                      </span>
                      <span className="flex items-center justify-center gap-1.5 text-rose-400 bg-rose-400/10 px-2.5 py-1.5 rounded-lg font-bold text-xs min-w-[3rem]">
                        <AlertTriangle size={12} /> {p.patrolViolations?.length || 0}
                      </span>
                    </div>
                    <Link href={`/${params.lang}/staff/patrols/${p.id}`}>
                      <Button className="bg-teal-500/20 hover:bg-teal-500 text-teal-400 hover:text-[#001529] rounded-xl px-5 py-1.5 text-xs font-bold transition-all shadow-sm">
                        {isArabic ? 'التفاصيل' : 'Details'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {filteredPatrols.length === 0 && (
                <div className="py-10 text-center text-th-muted bg-th-input/40 rounded-2xl border border-th-border">
                  <Ship size={32} className="mx-auto mb-3 opacity-20" />
                  {isArabic ? 'لم يتم العثور على دوريات.' : 'No patrols found.'}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block w-full overflow-x-auto pb-4">
              <table className="w-full min-w-[800px] text-start border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-th-border text-xs uppercase tracking-widest text-th-muted">
                    <th className="py-4 px-4 font-semibold">{isArabic ? 'الرمز' : 'Patrol Code'}</th>
                    <th className="py-4 px-4 font-semibold">{isArabic ? 'التاريخ' : 'Date'}</th>
                    <th className="py-4 px-4 font-semibold">{isArabic ? 'المنطقة' : 'Zone'}</th>
                    <th className="py-4 px-4 font-semibold">{isArabic ? 'القائد والريس' : 'Leader & Captain'}</th>
                    <th className="py-4 px-4 font-semibold">{isArabic ? 'الأنشطة' : 'Activities'}</th>
                    <th className="py-4 px-4 font-semibold">{isArabic ? 'الحالة' : 'Status'}</th>
                    <th className="py-4 px-4 text-end font-semibold">{isArabic ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-th-border">
                  {filteredPatrols.map((p) => (
                    <tr key={p.id} className="group hover:bg-th-surface2 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-bold text-th-text">{p.code || p.id.slice(0,8)}</span>
                        <p className="text-[10px] text-th-dim truncate max-w-[120px]">{p.type}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-th-muted text-sm">
                          <Calendar size={14} className="text-teal-400 shrink-0" />
                          {new Date(p.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-th-muted text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-sky-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{isArabic ? p.zoneAr : p.zone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-th-muted text-sm">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="text-th-text font-bold">{p.leader ? (isArabic ? p.leader.nameAr || p.leader.name : p.leader.name) : (isArabic ? 'بدون قائد' : 'No Leader')}</span>
                          {p.customLeaderName && (
                            <span className="inline-flex items-center whitespace-nowrap text-[10px] text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-md border border-teal-400/20 font-medium">
                              {isArabic ? 'ريس:' : 'Capt:'} {p.customLeaderName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 text-xs">
                          <span className="flex items-center justify-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md font-bold min-w-[3rem]">
                            <Eye size={12} /> {p.patrolObservations?.length || 0}
                          </span>
                          <span className="flex items-center justify-center gap-1.5 text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-md font-bold min-w-[3rem]">
                            <AlertTriangle size={12} /> {p.patrolViolations?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider border ${getStatusColor(p.status)}`}>
                          {isArabic && p.status === 'ACTIVE' ? 'نشط' : 
                           isArabic && p.status === 'COMPLETED' ? 'مكتمل' : 
                           isArabic && p.status === 'DRAFT' ? 'مسودة' : p.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-end">
                        <Link href={`/${params.lang}/staff/patrols/${p.id}`}>
                          <Button className="bg-th-input hover:bg-teal-500 hover:text-[#001529] text-th-text border border-th-border rounded-xl px-5 py-1.5 text-xs font-bold transition-all shadow-sm">
                            {isArabic ? 'عرض' : 'View'}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredPatrols.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-th-muted">
                        {isArabic ? 'لم يتم العثور على دوريات.' : 'No patrols found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
