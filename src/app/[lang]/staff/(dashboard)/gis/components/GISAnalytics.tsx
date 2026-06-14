'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useGISStore } from '../store/gisStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Layers, BarChart3, Activity, AlertTriangle, ShieldCheck, MapPin, 
  GitCommit, Hexagon, Calendar, CheckCircle, HelpCircle, Eye, RefreshCw
} from 'lucide-react';

export default function GISAnalytics({ isArabic }: { isArabic: boolean }) {
  const { layers, features, fetchData, isLoading } = useGISStore();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'compliance' | 'wildlife'>('overview');
  const [timeFilter, setTimeFilter] = useState<'all' | '30d' | '6m' | '1y'>('all');
  
  // ── 1. Apply Time Filtration ──
  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      if (timeFilter === 'all') return true;
      const fTime = new Date(f.updatedAt || f.createdAt || Date.now()).getTime();
      const now = Date.now();
      
      if (timeFilter === '30d') return (now - fTime) <= 30 * 24 * 60 * 60 * 1000;
      if (timeFilter === '6m') return (now - fTime) <= 180 * 24 * 60 * 60 * 1000;
      if (timeFilter === '1y') return (now - fTime) <= 365 * 24 * 60 * 60 * 1000;
      return true;
    });
  }, [features, timeFilter]);

  // ── 2. Data Calculation & Parsing ──
  
  // A. Features Distribution by Layer
  const featuresPerLayerData = useMemo(() => {
    return layers.map(layer => {
      const count = filteredFeatures.filter(f => f.layerId === layer.id).length;
      return {
        name: isArabic ? layer.nameAr : layer.name,
        count,
        color: layer.color || '#3b82f6'
      };
    }).filter(item => item.count > 0 || !item.name.includes('Custom'));
  }, [layers, filteredFeatures, isArabic]);

  // B. Geometry Type breakdown
  const geometryTypeData = useMemo(() => {
    const points = filteredFeatures.filter(f => f.type === 'Point').length;
    const polygons = filteredFeatures.filter(f => f.type === 'Polygon').length;
    const polylines = filteredFeatures.filter(f => f.type === 'LineString').length;

    return [
      { name: isArabic ? 'نقاط (أصول/بلاغات)' : 'Points', value: points, color: '#14b8a6', icon: MapPin },
      { name: isArabic ? 'مضلعات (مناطق/محميات)' : 'Polygons', value: polygons, color: '#10b981', icon: Hexagon },
      { name: isArabic ? 'خطوط مسار' : 'Polylines', value: polylines, color: '#3b82f6', icon: GitCommit },
    ].filter(d => d.value > 0);
  }, [filteredFeatures, isArabic]);

  // C. EIA Project Status Distribution
  const eiaStatusData = useMemo(() => {
    const projectLayers = layers.filter(l => l.category === 'project').map(l => l.id);
    const projectFeatures = filteredFeatures.filter(f => projectLayers.includes(f.layerId));
    
    const active = projectFeatures.filter(f => f.properties.status === 'active').length;
    const completed = projectFeatures.filter(f => f.properties.status === 'completed').length;
    const pending = projectFeatures.filter(f => f.properties.status === 'pending').length;
    const critical = projectFeatures.filter(f => f.properties.status === 'critical').length;

    return [
      { name: isArabic ? 'نشط' : 'Active', value: active, color: '#10b981' },
      { name: isArabic ? 'مكتمل' : 'Completed', value: completed, color: '#3b82f6' },
      { name: isArabic ? 'قيد الانتظار' : 'Pending', value: pending, color: '#f59e0b' },
      { name: isArabic ? 'حرج' : 'Critical', value: critical, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [layers, filteredFeatures, isArabic]);

  // D. Monthly Compliance Incidents Trend (Last 6 Months)
  const monthlyTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short' }),
        inspections: 0,
        violations: 0,
        accidents: 0
      });
    }

    filteredFeatures.forEach(f => {
      const fDate = new Date(f.updatedAt || f.createdAt || Date.now());
      const key = `${fDate.getFullYear()}-${String(fDate.getMonth() + 1).padStart(2, '0')}`;
      const mObj = months.find(m => m.monthKey === key);
      if (mObj) {
        if (f.layerId === 'layer-eia-inspections') mObj.inspections += 1;
        if (f.layerId === 'layer-eia-violations' || f.layerId === 'layer-violations') mObj.violations += 1;
        if (f.layerId === 'layer-eia-accidents') mObj.accidents += 1;
      }
    });

    return months;
  }, [filteredFeatures, isArabic]);

  // E. Wildlife Sightings Count by Species
  const wildlifeSightingsData = useMemo(() => {
    const sightings = filteredFeatures.filter(f => f.layerId === 'layer-sightings');
    const speciesCounts: { [key: string]: { name: string, nameAr: string, value: number } } = {};

    sightings.forEach(f => {
      // Regex parsing for count and species
      const matchEn = f.properties.name?.match(/Wildlife Sighting:\s*(.*?)\s*\(Count:\s*(\d+)\)/);
      const matchAr = f.properties.nameAr?.match(/رصد كائنات:\s*(.*?)\s*\(العدد:\s*(\d+)\)/);
      
      const speciesEn = matchEn ? matchEn[1] : 'Unknown';
      const speciesAr = matchAr ? matchAr[1] : 'غير معروف';
      const count = matchEn ? parseInt(matchEn[2]) : 1;

      if (!speciesCounts[speciesEn]) {
        speciesCounts[speciesEn] = { name: speciesEn, nameAr: speciesAr, value: 0 };
      }
      speciesCounts[speciesEn].value += count;
    });

    return Object.values(speciesCounts).map(item => ({
      name: isArabic ? item.nameAr : item.name,
      count: item.value
    })).sort((a, b) => b.count - a.count);
  }, [filteredFeatures, isArabic]);

  // F. Stranding Survival Status (DEAD vs ALIVE)
  const strandingSurvivalData = useMemo(() => {
    const strandings = filteredFeatures.filter(f => f.layerId === 'layer-strandings');
    
    // We check properties.name for status or properties.status
    const dead = strandings.filter(f => f.properties.name?.includes('(DEAD)') || f.properties.status === 'critical').length;
    const alive = strandings.filter(f => f.properties.name?.includes('(ALIVE)') || f.properties.status === 'pending').length;

    return [
      { name: isArabic ? 'نافق (Dead)' : 'Dead', value: dead, color: '#ef4444' },
      { name: isArabic ? 'تم إنقاذه / حي' : 'Alive / Rescued', value: alive, color: '#10b981' }
    ].filter(d => d.value > 0);
  }, [filteredFeatures, isArabic]);

  // G. Compliance Averages
  const eiaStats = useMemo(() => {
    const projectLayers = layers.filter(l => l.category === 'project').map(l => l.id);
    const projects = filteredFeatures.filter(f => projectLayers.includes(f.layerId));
    
    const totalProgress = projects.reduce((acc, curr) => acc + (curr.properties.progress || 0), 0);
    const avgProgress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;
    
    const criticalViolations = filteredFeatures.filter(f => 
      (f.layerId === 'layer-eia-violations' || f.layerId === 'layer-violations') && f.properties.status === 'critical'
    ).length;

    const totalInspections = filteredFeatures.filter(f => f.layerId === 'layer-eia-inspections').length;
    
    return {
      avgProgress,
      criticalViolations,
      totalInspections,
      totalProjects: projects.length
    };
  }, [layers, filteredFeatures]);

  // H. Wildlife & Monitoring Counts
  const ecoStats = useMemo(() => {
    const totalSightings = wildlifeSightingsData.reduce((acc, curr) => acc + curr.count, 0);
    const totalStrandings = filteredFeatures.filter(f => f.layerId === 'layer-strandings').length;
    const totalSurveys = filteredFeatures.filter(f => f.layerId === 'layer-beach-surveys').length;
    
    return {
      totalSightings,
      totalStrandings,
      totalSurveys
    };
  }, [filteredFeatures, wildlifeSightingsData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ── 1. Top Filter Controls & Refresh ── */}
      <div className="flex flex-wrap items-center justify-between bg-th-surface p-4 rounded-2xl border border-th-border shadow-sm gap-4">
        {/* Sub-Tab Navigation */}
        <div className="flex p-1 bg-th-surface2 border border-th-border rounded-xl">
          <button 
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all ${activeSubTab === 'overview' ? 'bg-teal-500 text-white shadow-md' : 'text-th-muted hover:text-th-text'}`}
          >
            <BarChart3 size={14} />
            {isArabic ? 'نظرة عامة' : 'Overview'}
          </button>
          <button 
            onClick={() => setActiveSubTab('compliance')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all ${activeSubTab === 'compliance' ? 'bg-teal-500 text-white shadow-md' : 'text-th-muted hover:text-th-text'}`}
          >
            <ShieldCheck size={14} />
            {isArabic ? 'الالتزام و EIA' : 'EIA & Compliance'}
          </button>
          <button 
            onClick={() => setActiveSubTab('wildlife')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all ${activeSubTab === 'wildlife' ? 'bg-teal-500 text-white shadow-md' : 'text-th-muted hover:text-th-text'}`}
          >
            <Activity size={14} />
            {isArabic ? 'الرصد والحياة الفطرية' : 'Eco & Wildlife'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="flex-1 sm:flex-none bg-th-surface2 border border-th-border rounded-xl px-3 py-2 text-xs font-bold text-th-text focus:outline-none focus:border-teal-500"
          >
            <option value="all">{isArabic ? 'كل الأوقات' : 'All Time'}</option>
            <option value="30d">{isArabic ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
            <option value="6m">{isArabic ? 'آخر 6 أشهر' : 'Last 6 Months'}</option>
            <option value="1y">{isArabic ? 'آخر سنة' : 'Last 1 Year'}</option>
          </select>

          <button 
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 bg-teal-500/10 text-teal-650 dark:text-teal-400 border border-teal-500/20 rounded-xl hover:bg-teal-500 hover:text-white transition-all disabled:opacity-50"
            title={isArabic ? 'تحديث البيانات' : 'Refresh Data'}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── 2. Tab: Overview Panel ── */}
      {activeSubTab === 'overview' && (
        <>
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 hover:border-teal-500/30 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'إجمالي الطبقات' : 'Total Layers'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{layers.length}</span>
              </div>
            </Card>
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 hover:border-teal-500/30 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'العناصر الجغرافية' : 'Total Features'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{filteredFeatures.length}</span>
              </div>
            </Card>
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 hover:border-teal-500/30 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <BarChart3 size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'متوسط إنجاز المشاريع' : 'Avg Project Progress'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{eiaStats.avgProgress}%</span>
              </div>
            </Card>
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 hover:border-teal-500/30 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'المخالفات الحرجة' : 'Critical Violations'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{eiaStats.criticalViolations}</span>
              </div>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Features Per Layer */}
            <Card className="p-6 bg-th-surface border-th-border shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-md font-black text-th-text m-0">{isArabic ? 'كثافة البيانات حسب الطبقة' : 'Data Density by Map Layer'}</h3>
                <p className="text-xs text-th-muted mt-1">{isArabic ? 'إحصائيات إجمالية لعدد المعالم الممثلة في كل طبقة' : 'Count of spatial features mapped under each layer'}</p>
              </div>
              <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featuresPerLayerData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} fontStyle="bold" />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {featuresPerLayerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Geometry Types distribution */}
            <Card className="p-6 bg-th-surface border-th-border shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-md font-black text-th-text m-0">{isArabic ? 'توزيع الأشكال الهندسية' : 'Geometric Shape Ratios'}</h3>
                <p className="text-xs text-th-muted mt-1">{isArabic ? 'نسب تصنيف المعالم بين نقاط، مضلعات ومسارات' : 'Ratio of points vs polygons vs line strings mapped'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                <div className="h-[220px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={geometryTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {geometryTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {geometryTypeData.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-th-surface2 border border-th-border">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="p-1 rounded bg-th-surface shrink-0" style={{ color: item.color }}>
                            <Icon size={14} />
                          </div>
                          <span className="font-bold text-th-text">{item.name}</span>
                        </div>
                        <span className="font-bold text-xs" style={{ color: item.color }}>{item.value}</span>
                      </div>
                    );
                  })}
                  {geometryTypeData.length === 0 && (
                    <p className="text-xs text-th-muted italic text-center py-4">{isArabic ? 'لا توجد بيانات متاحة' : 'No data available'}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ── 3. Tab: EIA & Compliance Panel ── */}
      {activeSubTab === 'compliance' && (
        <>
          {/* Compliance Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <CheckCircle size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'إجمالي المشروعات' : 'EIA Mapped Projects'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{eiaStats.totalProjects}</span>
              </div>
            </Card>
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                <Eye size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'المعاينات الميدانية' : 'Field Inspections'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{eiaStats.totalInspections}</span>
              </div>
            </Card>
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'متوسط الإنجاز' : 'Avg Progress Rate'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{eiaStats.avgProgress}%</span>
              </div>
            </Card>
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'بلاغات وحوادث حرجة' : 'Critical Violations'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{eiaStats.criticalViolations}</span>
              </div>
            </Card>
          </div>

          {/* Compliance & Violations Time Trend */}
          <Card className="p-6 bg-th-surface border-th-border shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-md font-black text-th-text m-0">{isArabic ? 'الخط الزمني للحوادث والمعاينات البيئية (آخر 6 أشهر)' : 'Incidents & Inspections Timeline Trend (6 Months)'}</h3>
              <p className="text-xs text-th-muted mt-1">{isArabic ? 'مقارنة شهرية بين المعاينات المنفذة والمخالفات والحوادث المسجلة مكانيًا' : 'Monthly comparison between inspections, violations, and spill accidents'}</p>
            </div>
            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAccidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.15} />
                  <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} fontStyle="bold" />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }} />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" name={isArabic ? 'معاينات ميدانية' : 'Inspections'} dataKey="inspections" stroke="#10b981" fillOpacity={1} fill="url(#colorInspections)" strokeWidth={2} />
                  <Area type="monotone" name={isArabic ? 'مخالفات بيئية' : 'Violations'} dataKey="violations" stroke="#f59e0b" fillOpacity={1} fill="url(#colorViolations)" strokeWidth={2} />
                  <Area type="monotone" name={isArabic ? 'حوادث وبلاغات انسكاب' : 'Accidents'} dataKey="accidents" stroke="#ef4444" fillOpacity={1} fill="url(#colorAccidents)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Project Status Ratio */}
          <Card className="p-6 bg-th-surface border-th-border shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-md font-black text-th-text m-0">{isArabic ? 'حالة المشروعات الجغرافية النشطة' : 'Active Spatial Projects Status'}</h3>
              <p className="text-xs text-th-muted mt-1">{isArabic ? 'توزيع المشاريع البيئية المرصودة وفق الحالة التشغيلية أو التنفيذية' : 'Status breakdown of ecological projects on the map'}</p>
            </div>
            <div className="h-[250px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eiaStatusData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} fontStyle="bold" />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {eiaStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      {/* ── 4. Tab: Eco & Wildlife Panel ── */}
      {activeSubTab === 'wildlife' && (
        <>
          {/* Wildlife Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                <Eye size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'رصد الكائنات الفطرية' : 'Total Wildlife Sighted'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{ecoStats.totalSightings}</span>
              </div>
            </Card>
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'حالات النفوق والإنقاذ' : 'Stranding Cases'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{ecoStats.totalStrandings}</span>
              </div>
            </Card>
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'مسوح الشواطئ' : 'Beach Surveys Mapped'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{ecoStats.totalSurveys}</span>
              </div>
            </Card>
            <Card className="p-4 bg-th-surface border-th-border flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-th-muted font-bold block truncate uppercase">{isArabic ? 'إجمالي أصول الرصد' : 'Active Eco Features'}</span>
                <span className="text-xl font-black text-th-text block mt-0.5">{filteredFeatures.filter(f => f.layerId.startsWith('layer-eco-') || f.layerId === 'layer-strandings' || f.layerId === 'layer-sightings' || f.layerId === 'layer-beach-surveys').length}</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wildlife Sightings by Species */}
            <Card className="p-6 bg-th-surface border-th-border shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-md font-black text-th-text m-0">{isArabic ? 'المشاهدات الفطرية حسب الفصيلة' : 'Wildlife Sighting Count by Species'}</h3>
                <p className="text-xs text-th-muted mt-1">{isArabic ? 'أعداد السلاحف، الأطوم، الدلافين والكائنات البحرية الأخرى المرصودة' : 'Count of sighted animals grouped by species name'}</p>
              </div>
              <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wildlifeSightingsData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} fontStyle="bold" />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Stranding Survival/Death Ratio */}
            <Card className="p-6 bg-th-surface border-th-border shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-md font-black text-th-text m-0">{isArabic ? 'تحليل حالات النفوق والإنقاذ' : 'Stranding Case Survival Analysis'}</h3>
                <p className="text-xs text-th-muted mt-1">{isArabic ? 'نسبة الكائنات النافقة مقارنة بالكائنات الحية التي تم إنقاذها' : 'Ratio of dead vs successfully rescued animals'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                <div className="h-[220px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={strandingSurvivalData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {strandingSurvivalData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {strandingSurvivalData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-th-surface2 border border-th-border">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-th-text">{item.name}</span>
                      </div>
                      <span className="font-bold text-xs" style={{ color: item.color }}>{item.value} {isArabic ? 'حالة' : 'cases'}</span>
                    </div>
                  ))}
                  {strandingSurvivalData.length === 0 && (
                    <p className="text-xs text-th-muted italic text-center py-4">{isArabic ? 'لا توجد بلاغات نفوق مسجلة' : 'No stranding reports available'}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

    </div>
  );
}
