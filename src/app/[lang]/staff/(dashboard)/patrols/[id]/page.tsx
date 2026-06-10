'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Printer, Ship, Users, FileText, Map as MapIcon, Clock, CheckCircle, AlertTriangle, Eye, Navigation, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import PatrolMap from '@/components/patrols/PatrolMap';

export default function PatrolDetailsPage({ params }: { params: { lang: string, id: string } }) {
  const isArabic = params.lang === 'ar';
  const router = useRouter();
  
  const [patrol, setPatrol] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatrolDetails();
  }, [params.id]);

  const fetchPatrolDetails = async () => {
    try {
      const res = await fetch(`/api/staff/patrols/${params.id}`);
      const json = await res.json();
      if (json.success) {
        setPatrol(json.data);
      } else {
        alert('Patrol not found');
        router.back();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من تغيير حالة الدورية؟' : 'Are you sure you want to change the patrol status?')) return;
    
    try {
      const res = await fetch(`/api/staff/patrols/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        setPatrol({ ...patrol, status: newStatus });
        alert(isArabic ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully');
      } else {
        alert(json.error || 'Error updating status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleDelete = async () => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذه الدورية بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to permanently delete this patrol? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/staff/patrols/${params.id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        alert(isArabic ? 'تم حذف الدورية بنجاح' : 'Patrol deleted successfully');
        router.push(`/${params.lang}/staff/patrols`);
      } else {
        alert(json.error || 'Error deleting patrol');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!patrol) return null;

  const routeCoords = patrol.route?.geojson ? JSON.parse(patrol.route.geojson).coordinates.map((c: any) => [c[1], c[0]]) : [];
  
  const markers = [
    ...(patrol.patrolObservations || []).map((o: any) => ({ lat: o.latitude, lng: o.longitude, title: o.speciesName, type: 'observation' })),
    ...(patrol.patrolViolations || []).map((v: any) => ({ lat: v.latitude, lng: v.longitude, title: v.violationType, type: 'violation' }))
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-16 print:bg-white print:text-black" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} className={isArabic ? 'rotate-180' : ''} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-th-text dark:text-white print:text-black">{isArabic ? 'تقرير الدورية' : 'Patrol Report'}</h1>
            <p className="text-th-muted dark:text-slate-400 text-xs">{patrol.code || patrol.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-th-border dark:border-white/10 rounded-xl px-3 h-10">
            <span className="text-xs text-th-muted dark:text-slate-400 font-bold">{isArabic ? 'الحالة:' : 'Status:'}</span>
            <select 
              value={patrol.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-transparent text-th-text dark:text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="ACTIVE" className="bg-white dark:bg-[#0c1628]">{isArabic ? 'نشط' : 'Active'}</option>
              <option value="COMPLETED" className="bg-white dark:bg-[#0c1628]">{isArabic ? 'مكتمل' : 'Completed'}</option>
              <option value="DRAFT" className="bg-white dark:bg-[#0c1628]">{isArabic ? 'مسودة' : 'Draft'}</option>
            </select>
          </div>

          <Button onClick={handlePrint} className="bg-black/5 dark:bg-white/5 hover:bg-teal-500 hover:text-white dark:hover:text-[#001529] text-th-text dark:text-white px-4 h-10 font-bold rounded-xl transition-all flex items-center gap-2">
            <Printer size={16} />
            <span className="hidden md:inline">{isArabic ? 'طباعة' : 'Print'}</span>
          </Button>

          <Button onClick={handleDelete} className="bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-rose-500/20 px-4 h-10 font-bold rounded-xl transition-all flex items-center gap-2">
            <Trash2 size={16} />
            <span className="hidden md:inline">{isArabic ? 'حذف' : 'Delete'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Summary */}
        <div className="space-y-6 md:col-span-1">
          
          <Card className="p-6 bg-slate-900/60 border-white/5 print:bg-white print:border-slate-200">
            <h3 className="text-sm font-bold text-teal-400 uppercase mb-4 flex items-center gap-2"><FileText size={16}/> {isArabic ? 'ملخص' : 'Summary'}</h3>
            <div className="space-y-4 text-sm">
              <div><p className="text-slate-500 text-xs">Status</p><p className="font-bold text-white print:text-black">{patrol.status}</p></div>
              <div><p className="text-slate-500 text-xs">Date</p><p className="font-bold text-white print:text-black">{new Date(patrol.date).toLocaleDateString()}</p></div>
              <div><p className="text-slate-500 text-xs">Zone</p><p className="font-bold text-white print:text-black">{isArabic ? patrol.zoneAr : patrol.zone}</p></div>
              <div><p className="text-slate-500 text-xs">Patrol Type</p><p className="font-bold text-white print:text-black">{patrol.type}</p></div>
              <div><p className="text-slate-500 text-xs">Weather</p><p className="font-bold text-white print:text-black">{patrol.weather || 'N/A'}</p></div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/60 border-white/5 print:bg-white print:border-slate-200">
            <h3 className="text-sm font-bold text-sky-400 uppercase mb-4 flex items-center gap-2"><Users size={16}/> {isArabic ? 'الفريق' : 'Crew'}</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-slate-500 text-xs">{isArabic ? 'قائد الدورية' : 'Patrol Leader'}</p>
                  <p className="font-bold text-white print:text-black">{patrol.leader ? (isArabic ? patrol.leader.nameAr || patrol.leader.name : patrol.leader.name) : (isArabic ? 'بدون قائد' : 'No Leader')}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{isArabic ? 'ريس المركب' : 'Vessel Captain'}</p>
                  <p className="font-bold text-teal-400 print:text-black">{patrol.customLeaderName || (isArabic ? 'بدون ريس' : 'No Captain')}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Crew Members</p>
                <ul className="list-disc list-inside text-slate-300 print:text-black mt-1">
                  {patrol.crew?.map((c: any) => (
                    <li key={c.id}>{c.user.name}</li>
                  ))}
                  {(!patrol.crew || patrol.crew.length === 0) && <li>No crew members.</li>}
                </ul>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column: Map & Lists */}
        <div className="space-y-6 md:col-span-2">
          
          <Card className="p-6 bg-slate-900/60 border-white/5 print:bg-white print:border-slate-200">
            <h3 className="text-sm font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2"><MapIcon size={16}/> {isArabic ? 'الخريطة التكتيكية' : 'Tactical Map'}</h3>
            <div className="h-[400px] w-full rounded-xl overflow-hidden border border-white/10 print:border-slate-300 relative z-0">
              <PatrolMap editable={false} routeCoordinates={routeCoords} markers={markers} />
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-slate-900/60 border-white/5 print:bg-white print:border-slate-200">
              <h3 className="text-sm font-bold text-amber-400 uppercase mb-4 flex items-center gap-2"><Eye size={16}/> {isArabic ? 'المشاهدات' : 'Observations'}</h3>
              <div className="space-y-3">
                {patrol.patrolObservations?.map((obs: any) => (
                  <div key={obs.id} className="p-3 bg-white/5 print:bg-slate-50 rounded-lg border border-white/10 print:border-slate-200">
                    <p className="font-bold text-white print:text-black">{obs.speciesName} <span className="text-amber-400">x{obs.count}</span></p>
                    <p className="text-xs text-slate-400">{obs.behaviorNotes || 'No notes'}</p>
                  </div>
                ))}
                {(!patrol.patrolObservations || patrol.patrolObservations.length === 0) && <p className="text-xs text-slate-500">No observations</p>}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/60 border-white/5 print:bg-white print:border-slate-200">
              <h3 className="text-sm font-bold text-rose-400 uppercase mb-4 flex items-center gap-2"><AlertTriangle size={16}/> {isArabic ? 'المخالفات' : 'Violations'}</h3>
              <div className="space-y-3">
                {patrol.patrolViolations?.map((vio: any) => (
                  <div key={vio.id} className="p-3 bg-white/5 print:bg-slate-50 rounded-lg border border-rose-500/20 print:border-slate-200">
                    <p className="font-bold text-white print:text-black">{vio.violationType}</p>
                    <p className="text-xs text-rose-400">Severity: {vio.severity}</p>
                    <p className="text-xs text-slate-400 mt-1">{vio.immediateAction || 'No action recorded'}</p>
                  </div>
                ))}
                {(!patrol.patrolViolations || patrol.patrolViolations.length === 0) && <p className="text-xs text-slate-500">No violations</p>}
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
