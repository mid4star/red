'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { ShieldAlert, Ship, Activity, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReportData {
  startDate: string;
  endDate: string;
  reserve: string;
  summary: {
    totalPatrols: number;
    totalViolations: number;
    totalSurveys: number;
    totalObservationsCount: number;
  };
  insights: Array<{
    type: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    message: string;
  }>;
  charts: {
    violationsBySeverity: {
      LOW: number;
      MEDIUM: number;
      HIGH: number;
      CRIMINAL: number;
    };
    timeline: Array<{
      date: string;
      patrols: number;
      violations: number;
    }>;
  };
  rawData: {
    patrols: any[];
    violations: any[];
  };
}

interface Props {
  data: ReportData;
  lang: string;
}

export default function PrintableA4Report({ data, lang }: Props) {
  const isArabic = lang === 'ar';
  const currentDate = new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const pieData = [
    { name: isArabic ? 'منخفضة' : 'Low', value: data.charts.violationsBySeverity.LOW, color: '#3b82f6' },
    { name: isArabic ? 'متوسطة' : 'Medium', value: data.charts.violationsBySeverity.MEDIUM, color: '#eab308' },
    { name: isArabic ? 'عالية' : 'High', value: data.charts.violationsBySeverity.HIGH, color: '#f97316' },
    { name: isArabic ? 'جنائية' : 'Criminal', value: data.charts.violationsBySeverity.CRIMINAL, color: '#ef4444' },
  ].filter(item => item.value > 0);

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className="bg-white text-slate-900 mx-auto"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        // Standard A4 print styling handled via external print CSS usually,
        // but inline styles here ensure layout looks like a document.
      }}
    >
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-center border-b-2 border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <div className="w-16 h-16 bg-slate-100 rounded-full border border-slate-300 flex items-center justify-center p-2">
            <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain opacity-80" onError={(e) => { e.currentTarget.style.display='none' }} />
            {/* Fallback icon if no logo */}
            <ShieldAlert className="text-slate-400 absolute -z-10" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isArabic ? 'تقرير الأداء الاستخباراتي البيئي' : 'Environmental Intelligence Report'}
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
              {isArabic ? 'قطاع المحميات الطبيعية - البحر الأحمر' : 'Red Sea Reserves Sector'}
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 font-medium space-y-1">
          <p><strong className="text-slate-700">{isArabic ? 'تاريخ التقرير:' : 'Date:'}</strong> {currentDate}</p>
          <p><strong className="text-slate-700">{isArabic ? 'الفترة الزمنية:' : 'Period:'}</strong> {data.startDate} - {data.endDate}</p>
          <p><strong className="text-slate-700">{isArabic ? 'النطاق الجغرافي:' : 'Scope:'}</strong> {data.reserve === 'ALL' ? (isArabic ? 'جميع المحميات' : 'All Reserves') : data.reserve}</p>
        </div>
      </header>

      {/* ── AI INSIGHTS (EXECUTIVE SUMMARY) ───────────────────────────────── */}
      <section className="mb-10 page-break-inside-avoid">
        <h2 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-indigo-600" />
          {isArabic ? 'الملخص التنفيذي والاستنتاجات الذكية' : 'Executive Summary & Smart Insights'}
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {data.insights.map((insight, idx) => {
            const isAlert = insight.type === 'CRITICAL' || insight.type === 'HIGH';
            const bgColor = isAlert ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200';
            const iconColor = isAlert ? 'text-rose-600' : 'text-indigo-600';
            const Icon = isAlert ? AlertTriangle : CheckCircle;

            return (
              <div key={idx} className={`p-4 rounded-xl border ${bgColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={iconColor} />
                  <h3 className="font-bold text-sm text-slate-800">{insight.title}</h3>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {insight.message}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── KEY METRICS ──────────────────────────────────────────────────── */}
      <section className="mb-10 page-break-inside-avoid">
        <h2 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-teal-600" />
          {isArabic ? 'المؤشرات الرئيسية' : 'Key Metrics'}
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-3xl font-black text-indigo-600">{data.summary.totalPatrols}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{isArabic ? 'إجمالي الدوريات' : 'Total Patrols'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-3xl font-black text-rose-600">{data.summary.totalViolations}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{isArabic ? 'المخالفات المرصودة' : 'Violations'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-3xl font-black text-emerald-600">{data.summary.totalSurveys}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{isArabic ? 'المسوحات البيئية' : 'Eco Surveys'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-3xl font-black text-sky-600">{data.summary.totalObservationsCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{isArabic ? 'الكائنات المرصودة' : 'Species Observed'}</p>
          </div>
        </div>
      </section>

      {/* ── CHARTS ───────────────────────────────────────────────────────── */}
      <section className="mb-10 page-break-inside-avoid grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 text-center">
            {isArabic ? 'مقارنة الدوريات بالمخالفات' : 'Patrols vs Violations'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{fontSize: '12px'}} />
                <Legend wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="patrols" name={isArabic ? 'الدوريات' : 'Patrols'} fill="#4f46e5" radius={[2, 2, 0, 0]} />
                <Bar dataKey="violations" name={isArabic ? 'المخالفات' : 'Violations'} fill="#e11d48" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 text-center">
            {isArabic ? 'تصنيف المخالفات حسب الخطورة' : 'Violations by Severity'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── DETAILED TABLES ──────────────────────────────────────────────── */}
      {data.rawData.violations.length > 0 && (
        <section className="mb-10 page-break-inside-avoid">
          <h2 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-600" />
            {isArabic ? 'أبرز المخالفات المرصودة' : 'Notable Violations'}
          </h2>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className={`p-3 font-bold border border-slate-200 ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? 'التاريخ' : 'Date'}</th>
                <th className={`p-3 font-bold border border-slate-200 ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? 'النوع' : 'Type'}</th>
                <th className={`p-3 font-bold border border-slate-200 ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? 'الموقع' : 'Location'}</th>
                <th className={`p-3 font-bold border border-slate-200 ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? 'الخطورة' : 'Severity'}</th>
              </tr>
            </thead>
            <tbody>
              {data.rawData.violations.map((v, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="p-3 text-slate-600">{new Date(v.date).toLocaleDateString()}</td>
                  <td className="p-3 text-slate-800 font-medium">{v.type}</td>
                  <td className="p-3 text-slate-600">{v.location || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      v.severity === 'CRIMINAL' || v.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                      v.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {v.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* FOOTER */}
      <footer className="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
        {isArabic ? 'تم إنشاء هذا التقرير آلياً بواسطة المساعد الذكي لنظام محميات البحر الأحمر' : 'Report generated automatically by the Red Sea Reserves AI Engine'}
      </footer>
    </div>
  );
}
