'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ship, Save, ArrowLeft, Plus, Trash2, Map as MapIcon, Users, FileText, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import PatrolMap from '@/components/patrols/PatrolMap';
import { motion } from 'framer-motion';

export default function NewPatrolPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);

  // Form State
  const [patrolData, setPatrolData] = useState({
    code: '',
    zone: '',
    zoneAr: '',
    type: 'Marine Patrol',
    weather: '',
    notes: '',
    status: 'ACTIVE',
    leaderId: '',
    customLeaderName: '',
    vesselId: '',
    areaCovered: '',
    duration: '',
  });

  const [crew, setCrew] = useState<string[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  
  const [observations, setObservations] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users and vessels
    const fetchData = async () => {
      try {
        const [usersRes, vesselsRes] = await Promise.all([
          fetch('/api/staff/query?collection=users'),
          fetch('/api/staff/query?collection=fleet')
        ]);
        const usersJson = await usersRes.json();
        const vesselsJson = await vesselsRes.json();
        
        if (usersJson.success) setUsers(usersJson.data);
        if (vesselsJson.success) setVessels(vesselsJson.data);
      } catch (err) {
        console.error('Failed to load form data', err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setPatrolData(prev => ({ ...prev, [field]: value }));
  };

  const addObservation = () => {
    setObservations([...observations, {
      speciesName: '', count: 1, observationTime: new Date().toISOString().slice(0,16),
      locationName: '', latitude: 27.2579, longitude: 33.8116, behaviorNotes: ''
    }]);
  };

  const updateObservation = (index: number, field: string, value: any) => {
    const updated = [...observations];
    updated[index][field] = value;
    setObservations(updated);
  };

  const addViolation = () => {
    setViolations([...violations, {
      violationType: '', dateTime: new Date().toISOString().slice(0,16),
      violatorName: '', vesselName: '', location: '', latitude: 27.2579, longitude: 33.8116,
      violationDetails: '', immediateAction: '', status: 'NEW', severity: 'LOW'
    }]);
  };

  const updateViolation = (index: number, field: string, value: any) => {
    const updated = [...violations];
    updated[index][field] = value;
    setViolations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...patrolData,
        customLeaderName: patrolData.customLeaderName === 'custom' ? (patrolData as any).customLeaderName_manual : patrolData.customLeaderName,
        crew,
        routeCoordinates,
        route: routeCoordinates.length > 0 ? {
          geojson: JSON.stringify({ type: "LineString", coordinates: routeCoordinates.map(c => [c[1], c[0]]) }), // GeoJSON format is [lng, lat]
          startLat: routeCoordinates[0][0],
          startLng: routeCoordinates[0][1],
          endLat: routeCoordinates[routeCoordinates.length - 1][0],
          endLng: routeCoordinates[routeCoordinates.length - 1][1],
        } : null,
        observations,
        violations
      };

      const res = await fetch('/api/staff/patrols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        router.push(`/${params.lang}/staff/patrols`);
      } else {
        alert(json.error || 'Failed to create patrol');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the patrol.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-16" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={20} className={isArabic ? 'rotate-180' : ''} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">{isArabic ? 'تسجيل دورية جديدة' : 'Log New Patrol'}</h1>
          <p className="text-slate-400 text-xs">{isArabic ? 'أدخل تفاصيل العملية والملاحظات' : 'Enter operation details and observations'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Patrol Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <FileText className="text-teal-400" size={20} />
            <h2 className="text-lg font-bold text-white">{isArabic ? 'معلومات العملية' : 'Operation Information'}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'رمز الدورية *' : 'Patrol Code *'}</label>
              <Input required value={patrolData.code} onChange={(e) => handleInputChange('code', e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. PAT-001" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'نوع الدورية' : 'Patrol Type'}</label>
              <select value={patrolData.type} onChange={(e) => handleInputChange('type', e.target.value)} className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl px-3 mt-1">
                <option value="Marine Patrol">Marine Patrol</option>
                <option value="Coastal Patrol">Coastal Patrol</option>
                <option value="Monitoring Patrol">Monitoring Patrol</option>
                <option value="Inspection Patrol">Inspection Patrol</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'المنطقة (EN) *' : 'Zone (EN) *'}</label>
              <Input required value={patrolData.zone} onChange={(e) => handleInputChange('zone', e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'المنطقة (AR) *' : 'Zone (AR) *'}</label>
              <Input required value={patrolData.zoneAr} onChange={(e) => handleInputChange('zoneAr', e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'المركب' : 'Vessel'}</label>
                <select value={patrolData.vesselId} onChange={(e) => handleInputChange('vesselId', e.target.value)} className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl px-3 mt-1">
                  <option value="">{isArabic ? 'بدون مركب / مشاة' : 'No Vessel / Foot'}</option>
                  {vessels.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'حالة الطقس' : 'Weather Notes'}</label>
                <Input value={patrolData.weather} onChange={(e) => handleInputChange('weather', e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" placeholder="Clear, 12kt wind" />
              </div>
            </div>
          </div>
        </Card>
        </motion.div>

        {/* Section 2: Crew */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <Users className="text-sky-400" size={20} />
            <h2 className="text-lg font-bold text-white">{isArabic ? 'فريق العمل' : 'Crew Information'}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'قائد الدورية' : 'Patrol Leader'}</label>
              <select value={patrolData.leaderId} onChange={(e) => handleInputChange('leaderId', e.target.value)} className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl px-3 mt-1 focus:border-sky-500 transition-all outline-none">
                <option value="" className="bg-[#0c1628]">{isArabic ? 'اختر القائد' : 'Select Leader'}</option>
                {users.map(u => <option key={u.id} value={u.id} className="bg-[#0c1628]">{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'ريس المركب' : 'Vessel Captain'}</label>
              <select value={patrolData.customLeaderName} onChange={(e) => handleInputChange('customLeaderName', e.target.value)} className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl px-3 mt-1 focus:border-sky-500 transition-all outline-none">
                <option value="" className="bg-[#0c1628]">{isArabic ? 'اختر الريس' : 'Select Captain'}</option>
                <option value="سيد عوده" className="bg-[#0c1628]">سيد عوده</option>
                <option value="سعد عبدالوهاب" className="bg-[#0c1628]">سعد عبدالوهاب</option>
                <option value="حلمي محمد" className="bg-[#0c1628]">حلمي محمد</option>
                <option value="محمود صفوت" className="bg-[#0c1628]">محمود صفوت</option>
                <option value="custom" className="bg-[#0c1628]">{isArabic ? 'اسم آخر...' : 'Other...'}</option>
              </select>
            </div>
            {patrolData.customLeaderName === 'custom' && (
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'اسم الريس (مخصص)' : 'Custom Captain Name'}</label>
                <Input onChange={(e) => handleInputChange('customLeaderName_manual', e.target.value)} className="bg-white/5 border-white/10 text-white mt-1 w-1/2" />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'أعضاء الفريق' : 'Crew Members'}</label>
              <select multiple value={crew} onChange={(e) => setCrew(Array.from(e.target.selectedOptions, option => option.value))} className="w-full min-h-[120px] bg-white/5 border border-white/10 text-white rounded-xl px-3 mt-1 p-2">
                {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.role}</option>)}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Hold Ctrl (or Cmd) to select multiple members.</p>
            </div>
          </div>
        </Card>
        </motion.div>

        {/* Section 3: Route Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <MapIcon className="text-emerald-400" size={20} />
            <h2 className="text-lg font-bold text-white">{isArabic ? 'مسار الدورية' : 'Patrol Route'}</h2>
          </div>
          <div className="h-[400px] w-full rounded-xl overflow-hidden border border-white/10">
            <PatrolMap editable={true} onRouteUpdate={setRouteCoordinates} routeCoordinates={routeCoordinates} />
          </div>
        </Card>
        </motion.div>

        {/* Section 4: Observations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <Eye className="text-amber-400" size={20} />
              <h2 className="text-lg font-bold text-white">{isArabic ? 'المشاهدات' : 'Observations'}</h2>
            </div>
            <Button type="button" onClick={addObservation} className="bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs py-1 px-3">
              <Plus size={14} className="mr-1" /> Add Observation
            </Button>
          </div>
          
          <div className="space-y-4">
            {observations.map((obs, idx) => (
              <div key={idx} className="p-4 border border-white/10 rounded-xl bg-white/5 relative">
                <button type="button" onClick={() => setObservations(observations.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-rose-400 hover:text-rose-300">
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mr-8">
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'اسم الكائن' : 'Species Name'}</label>
                    <Input value={obs.speciesName} onChange={e => updateObservation(idx, 'speciesName', e.target.value)} className="bg-[#0c1628] border-white/10 mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'العدد' : 'Count'}</label>
                    <Input type="number" value={obs.count} onChange={e => updateObservation(idx, 'count', e.target.value)} className="bg-[#0c1628] border-white/10 mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'الوقت' : 'Time'}</label>
                    <Input type="datetime-local" value={obs.observationTime} onChange={e => updateObservation(idx, 'observationTime', e.target.value)} className="bg-[#0c1628] border-white/10 mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'اسم المكان' : 'Location Name'}</label>
                    <Input value={obs.locationName} onChange={e => updateObservation(idx, 'locationName', e.target.value)} className="bg-[#0c1628] border-white/10 mt-1" placeholder="e.g. Giftun Island" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'خط العرض (Latitude)' : 'Latitude'}</label>
                    <Input type="number" step="any" value={obs.latitude} onChange={e => updateObservation(idx, 'latitude', parseFloat(e.target.value))} className="bg-[#0c1628] border-white/10 mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'خط الطول (Longitude)' : 'Longitude'}</label>
                    <Input type="number" step="any" value={obs.longitude} onChange={e => updateObservation(idx, 'longitude', parseFloat(e.target.value))} className="bg-[#0c1628] border-white/10 mt-1" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs text-slate-400">{isArabic ? 'ملاحظات' : 'Behavior Notes'}</label>
                    <Input value={obs.behaviorNotes} onChange={e => updateObservation(idx, 'behaviorNotes', e.target.value)} className="bg-[#0c1628] border-white/10 mt-1" />
                  </div>
                </div>
              </div>
            ))}
            {observations.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No observations recorded yet.</p>}
          </div>
        </Card>
        </motion.div>

        {/* Section 5: Violations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
        <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-rose-400" size={20} />
              <h2 className="text-lg font-bold text-white">{isArabic ? 'المخالفات' : 'Violations'}</h2>
            </div>
            <Button type="button" onClick={addViolation} className="bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs py-1 px-3">
              <Plus size={14} className="mr-1" /> Add Violation
            </Button>
          </div>
          
          <div className="space-y-4">
            {violations.map((vio, idx) => (
              <div key={idx} className="p-4 border border-rose-500/20 rounded-xl bg-rose-500/5 relative">
                <button type="button" onClick={() => setViolations(violations.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-rose-400 hover:text-rose-300">
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'نوع المخالفة' : 'Violation Type'}</label>
                    <Input value={vio.violationType} onChange={e => updateViolation(idx, 'violationType', e.target.value)} className="bg-[#0c1628] border-rose-500/20 mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'اسم المخالف / المركب' : 'Violator Name / Vessel'}</label>
                    <Input value={vio.violatorName} onChange={e => updateViolation(idx, 'violatorName', e.target.value)} className="bg-[#0c1628] border-rose-500/20 mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'المكان' : 'Location Name'}</label>
                    <Input value={vio.location} onChange={e => updateViolation(idx, 'location', e.target.value)} className="bg-[#0c1628] border-rose-500/20 mt-1" placeholder="e.g. Dolphin House" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-400">{isArabic ? 'خط العرض (Lat)' : 'Latitude'}</label>
                      <Input type="number" step="any" value={vio.latitude} onChange={e => updateViolation(idx, 'latitude', parseFloat(e.target.value))} className="bg-[#0c1628] border-rose-500/20 mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">{isArabic ? 'خط الطول (Lng)' : 'Longitude'}</label>
                      <Input type="number" step="any" value={vio.longitude} onChange={e => updateViolation(idx, 'longitude', parseFloat(e.target.value))} className="bg-[#0c1628] border-rose-500/20 mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'الإجراء المتخذ' : 'Action Taken'}</label>
                    <Input value={vio.immediateAction} onChange={e => updateViolation(idx, 'immediateAction', e.target.value)} className="bg-[#0c1628] border-rose-500/20 mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">{isArabic ? 'درجة الخطورة' : 'Severity'}</label>
                    <select value={vio.severity} onChange={e => updateViolation(idx, 'severity', e.target.value)} className="w-full h-11 bg-[#0c1628] border border-rose-500/20 text-white rounded-xl px-3 mt-1">
                      <option value="LOW">{isArabic ? 'منخفضة' : 'Low'}</option>
                      <option value="MEDIUM">{isArabic ? 'متوسطة' : 'Medium'}</option>
                      <option value="HIGH">{isArabic ? 'عالية' : 'High'}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {violations.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No violations recorded.</p>}
          </div>
        </Card>
        </motion.div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" onClick={() => router.back()} className="bg-transparent hover:bg-white/5 text-slate-300 font-bold px-6">
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={loading} className="bg-teal-500 hover:bg-teal-400 text-[#001529] font-black rounded-xl px-8 flex items-center gap-2">
            <Save size={18} />
            {loading ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ الدورية' : 'Save Patrol')}
          </Button>
        </div>

      </form>
    </div>
  );
}
