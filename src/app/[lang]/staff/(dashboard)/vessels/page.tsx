'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Ship, Anchor, Navigation, Shield, Compass, Waves,
  MapPin, Settings, ExternalLink, RefreshCw, AlertTriangle,
  Search, ShieldAlert, Sliders, Play, Info, Eye, CheckCircle2,
  Video, Camera, ArrowLeftRight, Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Quick zoom/center locations in the Red Sea
const LOCATIONS = [
  { id: 'full', name: 'Red Sea (Full)', nameAr: 'البحر الأحمر (كامل)', lat: 26.4, lng: 35.7, zoom: 6, desc: 'Overview of Red Sea shipping routes', descAr: 'نظرة عامة على الممرات الملاحية بالبحر الأحمر' },
  { id: 'suez', name: 'Suez Canal Entrance', nameAr: 'مدخل قناة السويس', lat: 29.93, lng: 32.57, zoom: 11, desc: 'Suez southern port and canal anchorage', descAr: 'ميناء السويس الجنوبي ومنطقة المخطاف للقناة' },
  { id: 'ras_mohammed', name: 'Ras Mohammed Protected Area', nameAr: 'محمية رأس محمد', lat: 27.73, lng: 34.25, zoom: 11, desc: 'Vessel paths around southern Sinai coral reefs', descAr: 'مسارات السفن حول الشعاب المرجانية بجنوب سيناء' },
  { id: 'hurghada', name: 'Hurghada Coast & Islands', nameAr: 'ساحل وجزر الغردقة', lat: 27.23, lng: 33.93, zoom: 10, desc: 'Maritime corridors near Hurghada protectorates', descAr: 'الممرات البحرية بالقرب من محميات الغردقة' },
  { id: 'marsa_alam', name: 'Marsa Alam (Abu Dabbab)', nameAr: 'مرسى علم (أبو دباب)', lat: 25.34, lng: 34.74, zoom: 11, desc: 'Monitoring vessel speeds in seagrass habitats', descAr: 'مراقبة سرعات السفن في مناطق الحشائش البحرية' },
  { id: 'jeddah', name: 'Jeddah Port Authority', nameAr: 'ميناء جدة الإسلامي', lat: 21.48, lng: 39.15, zoom: 10, desc: 'Major cargo hub on the eastern coast', descAr: 'مركز الشحن الرئيسي على الساحل الشرقي' },
  { id: 'bab_el_mandeb', name: 'Bab-el-Mandeb Strait', nameAr: 'مضيق باب المندب', lat: 12.58, lng: 43.34, zoom: 9, desc: 'Southern choke-point and main shipping transit', descAr: 'البوابة الجنوبية والمضيق الملاحي الرئيسي' }
];

// Coastline webcams (Windy integration)
const WEBCAMS = [
  {
    id: 'gamsha',
    windyId: '1666358459',
    name: 'El Gamsha Bay Webcam',
    nameAr: 'كاميرا خليج جمشة',
    lat: 27.439,
    lng: 33.656,
    region: 'hurghada',
    status: 'ONLINE',
    statusAr: 'متصل مباشر',
    desc: 'Monitoring Gamsha northern bay and shoreline',
    descAr: 'مراقبة شواطئ وخليج جمشة الشمالي'
  },
  {
    id: 'tiger_kite',
    windyId: '1171048192',
    name: 'Tiger Kite & Surf School - Hurghada',
    nameAr: 'مدرسة تايجر للكايت سيرف بالغردقة',
    lat: 27.109,
    lng: 33.831,
    region: 'hurghada',
    status: 'ONLINE',
    statusAr: 'متصل مباشر',
    desc: 'Live surveillance of Hurghada southern windsurfing coast',
    descAr: 'رصد مباشر لساحل ركوب الأمواج الجنوبي بالغردقة'
  },
  {
    id: 'hadaba_nass',
    windyId: '1665854708',
    name: 'Al Hadaba Harry Nass Hurghada Center',
    nameAr: 'مركز هاري ناس بالهضبة - الغردقة',
    lat: 27.133,
    lng: 33.830,
    region: 'hurghada',
    status: 'ONLINE',
    statusAr: 'متصل مباشر',
    desc: 'Surveillance of Al Hadaba coastline and watersports area',
    descAr: 'مراقبة الشواطئ ومنطقة الألعاب المائية بالهضبة'
  },
  {
    id: 'dahab_lagoon',
    windyId: '1702557519',
    name: 'Dahab Na Lagunu',
    nameAr: 'منطقة اللاغونا في دهب',
    lat: 28.477,
    lng: 34.485,
    region: 'sinai',
    status: 'ONLINE',
    statusAr: 'متصل مباشر',
    desc: 'Live view of Dahab Lagoon windsurfing bay and beach',
    descAr: 'رصد حي لمنطقة اللاغونا المائية والشاطئ في دهب'
  }
];

// Active reserve patrol fleet coordinate anchors
const PATROL_FLEET = [
  { id: 'amwaj_1', name: 'Amwaj 1', nameAr: 'أمواج 1', code: 'V-101', type: 'PATROL', lat: 27.7128, lng: 34.2131, status: 'On Patrol', statusAr: 'في دورية نشطة', health: 95 },
  { id: 'interceptor', name: 'Interceptor Alpha', nameAr: 'المعترض ألفا', code: 'V-102', type: 'PATROL', lat: 27.2300, lng: 33.9000, status: 'Standby', statusAr: 'استعداد للاستجابة', health: 92 },
  { id: 'explorer', name: 'Reef Explorer', nameAr: 'مستكشف الشعاب', code: 'R-304', type: 'RESEARCH', lat: 25.3375, lng: 34.7369, status: 'Researching', statusAr: 'أبحاث بيئية', health: 88 }
];

export default function VesselMonitoringPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';

  // Dashboard Section Tabs: 'traffic' | 'cameras'
  const [activeTab, setActiveTab] = useState<'traffic' | 'cameras'>('traffic');

  // Traffic Map coordinates state
  const [centerX, setCenterX] = useState(35.7);
  const [centerY, setCenterY] = useState(26.4);
  const [zoom, setZoom] = useState(8);
  const [showNames, setShowNames] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('full');

  // Sidebar tab inside traffic map section: 'locations' | 'patrols' | 'settings'
  const [mapSidebarTab, setMapSidebarTab] = useState<'locations' | 'patrols' | 'settings'>('locations');

  // Camera filter state
  const [cameraRegion, setCameraRegion] = useState<string>('all');

  // Global iframe refresh key
  const [iframeKey, setIframeKey] = useState(0);

  // Trigger manual reload of all map and camera iframes
  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  // Center on a predefined geographic location
  const handleFocusLocation = (loc: typeof LOCATIONS[0]) => {
    setCenterX(loc.lng);
    setCenterY(loc.lat);
    setZoom(loc.zoom);
    setSelectedLocation(loc.id);
  };

  // Center on a patrol fleet vessel's coordinates
  const handleFocusVessel = (vessel: typeof PATROL_FLEET[0]) => {
    setCenterX(vessel.lng);
    setCenterY(vessel.lat);
    setZoom(12);
    setSelectedLocation('');
  };

  // Select camera from cards, switch to Map tab and center on its location
  const handleShowWebcamOnMap = (cam: typeof WEBCAMS[0]) => {
    setCenterX(cam.lng);
    setCenterY(cam.lat);
    setZoom(12);
    setSelectedLocation('');
    setActiveTab('traffic');
  };

  // Construct official embed URL for MarineTraffic
  const constructEmbedUrl = () => {
    const baseUrl = 'https://www.marinetraffic.com/en/ais/embed';
    const params = [
      `zoom:${zoom}`,
      `centery:${centerY}`,
      `centerx:${centerX}`,
      `shownames:${showNames}`,
      'mmsi:0',
      'shipid:0',
      'fleet:',
      'fleet_id:',
      'vessel:0',
      'container:true',
      `showmenu:${showMenu}`,
      'remember:false'
    ].join('/');
    return `${baseUrl}/${params}`;
  };

  // Construct Windy Webcam Embed URL
  const constructWebcamUrl = (windyId: string) => {
    return `https://webcams.windy.com/webcams/public/embed/player/${windyId}/day?autoplay=1`;
  };

  // Construct direct link to Windy camera
  const getDirectWebcamUrl = (windyId: string) => {
    return `https://www.windy.com/webcams/${windyId}`;
  };

  // Construct direct link to full MarineTraffic platform
  const getDirectUrl = () => {
    return `https://www.marinetraffic.com/en/ais/home/centerx:${centerX}/centery:${centerY}/zoom:${zoom}`;
  };

  // Filter Webcams by region
  const filteredWebcams = WEBCAMS.filter(cam => {
    if (cameraRegion === 'all') return true;
    return cam.region === cameraRegion;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── HEADER SECTION ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between bg-th-surface2 p-4 md:p-6 rounded-2xl border border-th-border shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0 relative">
            <Ship size={24} className="animate-pulse" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-th-surface2" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 block mb-1">
              {isAr ? 'مركز الرصد والمراقبة المتكامل للبحر الأحمر' : 'Integrated Red Sea Surveillance Center'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-th-text uppercase m-0 leading-none">
              {isAr ? 'مراقبة الملاحة والشواطئ' : 'Vessels & Coast Surveillance'}
            </h1>
          </div>
        </div>

        {/* Sync & Refresh Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={handleRefresh}
            className="bg-th-surface border border-th-border text-th-text hover:bg-th-surface2 hover:text-sky-500 shadow-sm px-4 rounded-xl h-11 flex items-center gap-2 transition-all"
          >
            <RefreshCw size={16} />
            <span className="font-bold hidden sm:inline">{isAr ? 'تحديث الإشارة' : 'Sync Signal'}</span>
          </Button>

          <a
            href={activeTab === 'traffic' ? getDirectUrl() : 'https://www.windy.com/webcams'}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline"
          >
            <Button className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 px-4 rounded-xl h-11 flex items-center gap-2 transition-all border-none">
              <ExternalLink size={16} />
              <span className="font-bold tracking-wide">{isAr ? 'فتح النافذة الكاملة' : 'Full Platform'}</span>
            </Button>
          </a>
        </div>
      </div>

      {/* ── TOP SECTION TAB NAVIGATION ───────────────────────────────────────── */}
      <div className="flex border-b border-th-border bg-th-surface2/60 p-1.5 rounded-2xl border gap-2">
        <button
          onClick={() => setActiveTab('traffic')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-black rounded-xl transition-all uppercase tracking-wide cursor-pointer ${activeTab === 'traffic'
            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10'
            : 'text-th-muted hover:text-th-text hover:bg-th-surface/50'
            }`}
        >
          <Ship size={18} />
          <span>{isAr ? 'حركة الملاحة وتتبع السفن (AIS)' : 'Marine Traffic & AIS'}</span>
        </button>

        <button
          onClick={() => setActiveTab('cameras')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-black rounded-xl transition-all uppercase tracking-wide cursor-pointer ${activeTab === 'cameras'
            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10'
            : 'text-th-muted hover:text-th-text hover:bg-th-surface/50'
            }`}
        >
          <Video size={18} />
          <span>{isAr ? 'شبكة كاميرات مراقبة الشواطئ' : 'Coastal Surveillance Webcams'}</span>
        </button>
      </div>

      {/* ── SECTION CONTENTS ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ── SECTION 1: MARINE TRAFFIC (AIS MAP + HUD SIDEBAR) ────────────────── */}
        {activeTab === 'traffic' && (
          <motion.div
            key="traffic"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            {/* Sidebar Controls (3 cols) */}
            <Card className="lg:col-span-3 bg-th-surface border border-th-border rounded-3xl p-5 flex flex-col gap-4 h-[700px]">

              {/* Sidebar Tabs */}
              <div className="flex bg-th-surface2 rounded-xl p-1 border border-th-border shrink-0 text-[10px]">
                <button
                  onClick={() => setMapSidebarTab('locations')}
                  className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${mapSidebarTab === 'locations' ? 'bg-sky-500 text-white shadow' : 'text-th-muted hover:text-th-text'}`}
                >
                  {isAr ? 'الممرات الاستراتيجية' : 'Key Zones'}
                </button>
                <button
                  onClick={() => setMapSidebarTab('patrols')}
                  className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${mapSidebarTab === 'patrols' ? 'bg-sky-500 text-white shadow' : 'text-th-muted hover:text-th-text'}`}
                >
                  {isAr ? 'الأسطول الميداني' : 'Patrol Fleet'}
                </button>
                <button
                  onClick={() => setMapSidebarTab('settings')}
                  className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${mapSidebarTab === 'settings' ? 'bg-sky-500 text-white shadow' : 'text-th-muted hover:text-th-text'}`}
                >
                  {isAr ? 'التفضيلات' : 'Map Options'}
                </button>
              </div>

              {/* Sidebar Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                <AnimatePresence mode="wait">

                  {/* Locations List */}
                  {mapSidebarTab === 'locations' && (
                    <motion.div
                      key="locations-tab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-2.5"
                    >
                      {LOCATIONS.map((loc) => {
                        const active = selectedLocation === loc.id;
                        return (
                          <div
                            key={loc.id}
                            onClick={() => handleFocusLocation(loc)}
                            className={`group p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${active
                              ? 'bg-sky-500/10 border-sky-500/40 text-sky-500'
                              : 'bg-th-surface2 border-th-border/40 text-th-text hover:bg-th-surface2/80 hover:border-sky-500/20'
                              }`}
                          >
                            <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className={active ? 'text-sky-500' : 'text-th-muted group-hover:text-sky-500'} />
                                <span className="font-bold text-xs">{isAr ? loc.nameAr : loc.name}</span>
                              </div>
                              <Badge className="text-[8px] font-mono px-1.5 py-0" color={active ? 'success' : 'primary'}>
                                Z: {loc.zoom}
                              </Badge>
                            </div>
                            <p className={`text-[10px] leading-relaxed m-0 text-th-muted group-hover:text-th-text transition-colors ${isAr ? 'text-right' : 'text-left'}`}>
                              {isAr ? loc.descAr : loc.desc}
                            </p>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Fleet List */}
                  {mapSidebarTab === 'patrols' && (
                    <motion.div
                      key="fleet-tab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-2.5"
                    >
                      {PATROL_FLEET.map((vessel) => (
                        <div
                          key={vessel.id}
                          onClick={() => handleFocusVessel(vessel)}
                          className="group p-3 bg-th-surface2 border border-th-border/40 hover:border-sky-500/30 hover:bg-th-surface2/80 rounded-xl transition-all cursor-pointer flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                                <Anchor size={14} />
                              </div>
                              <div>
                                <h4 className="font-black text-xs text-th-text group-hover:text-sky-500 transition-colors m-0 leading-tight">
                                  {isAr ? vessel.nameAr : vessel.name}
                                </h4>
                                <span className="text-[9px] font-mono text-th-muted block mt-0.5">
                                  {vessel.code} • {vessel.type}
                                </span>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {isAr ? vessel.statusAr : vessel.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] border-t border-th-border/30 pt-2 text-th-muted font-medium">
                            <span>Lat: {vessel.lat} • Lng: {vessel.lng}</span>
                            <span>{isAr ? 'كفاءة:' : 'Health:'} <strong className="text-sky-500">{vessel.health}%</strong></span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Settings Preferences */}
                  {mapSidebarTab === 'settings' && (
                    <motion.div
                      key="settings-tab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      {/* Zoom setting slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-th-text">
                          <span>{isAr ? 'مستوى التقريب (Zoom)' : 'Zoom Level'}</span>
                          <span className="font-mono text-sky-500">{zoom}</span>
                        </div>
                        <input
                          type="range"
                          min="4"
                          max="16"
                          value={zoom}
                          onChange={(e) => setZoom(parseInt(e.target.value))}
                          className="w-full accent-sky-500 bg-th-surface2 border border-th-border rounded-lg h-2 cursor-pointer"
                        />
                      </div>

                      {/* Toggle vessel names */}
                      <label className="flex items-center justify-between p-3 bg-th-surface2 border border-th-border/50 rounded-xl cursor-pointer hover:bg-th-surface2/80 transition-all">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-th-text">{isAr ? 'إظهار أسماء السفن' : 'Show Vessel Names'}</span>
                          <span className="text-[9px] text-th-muted">{isAr ? 'يعرض الأسماء مباشرة' : 'Show names directly on map'}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={showNames}
                          onChange={(e) => setShowNames(e.target.checked)}
                          className="accent-sky-500 w-4 h-4 rounded border-th-border cursor-pointer"
                        />
                      </label>

                      {/* Toggle MarineTraffic menu */}
                      <label className="flex items-center justify-between p-3 bg-th-surface2 border border-th-border/50 rounded-xl cursor-pointer hover:bg-th-surface2/80 transition-all">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-th-text">{isAr ? 'قائمة الملاحة التفاعلية' : 'Show Menu'}</span>
                          <span className="text-[9px] text-th-muted">{isAr ? 'قائمة تحكم الخريطة الجانبية' : 'Expose the map side drawer'}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={showMenu}
                          onChange={(e) => setShowMenu(e.target.checked)}
                          className="accent-sky-500 w-4 h-4 rounded border-th-border cursor-pointer"
                        />
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Security Alert Notice */}
              <div className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex gap-2 items-center text-sky-600 dark:text-sky-400 text-[9px] font-bold shrink-0">
                <Shield size={14} className="shrink-0" />
                <span>
                  {isAr
                    ? 'رصد نشط: يتم تحديث بيانات السفن والملاحة تلقائياً عبر الأقمار الصناعية.'
                    : 'Active Tracking: Shipping signals are synced live via satellite feeds.'}
                </span>
              </div>
            </Card>

            {/* Map Frame Card (9 cols) */}
            <Card className="lg:col-span-9 bg-th-surface border border-th-border rounded-3xl p-2 h-[700px] overflow-hidden flex flex-col relative group">
              {/* HUD Coordinate Layer */}
              <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md text-white font-mono text-[9px] px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 select-none pointer-events-none group-hover:opacity-100 transition-opacity">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                <span>AIS RADAR ACTIVE</span>
                <span className="text-white/30">|</span>
                <span>LAT: {centerY.toFixed(4)}</span>
                <span>LNG: {centerX.toFixed(4)}</span>
                <span>ZOOM: {zoom}</span>
              </div>

              <div className="flex-1 w-full h-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center relative">
                <iframe
                  key={`map-${iframeKey}`}
                  name="marinetraffic"
                  id="marinetraffic"
                  src={constructEmbedUrl()}
                  className="absolute inset-0 w-full h-full rounded-2xl border-none z-0"
                  allowFullScreen
                >
                  Browser not compatible.
                </iframe>

                {/* Fallback Loader */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 pointer-events-none -z-10 text-white">
                  <RefreshCw className="animate-spin text-sky-500 mb-2" size={28} />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Loading satellite AIS signal...</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── SECTION 2: SURVEILLANCE CAMERAS GRID ─────────────────────────────── */}
        {activeTab === 'cameras' && (
          <motion.div
            key="cameras"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Regional Filters Menu */}
            <div className="flex flex-wrap items-center bg-th-surface border border-th-border p-3 rounded-2xl shadow-sm gap-2">
              <span className="text-xs font-black text-th-text uppercase tracking-widest px-2">
                {isAr ? 'تصفية المناطق:' : 'Filter Region:'}
              </span>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', name: 'All Cams', nameAr: 'كل الكاميرات' },
                  { id: 'north', name: 'Suez & North', nameAr: 'السويس والشمال' },
                  { id: 'hurghada', name: 'Gouna & Hurghada', nameAr: 'الجونة والغردقة' },
                  { id: 'south', name: 'Soma Bay & Marsa Alam', nameAr: 'سوما باي ومرسى علم' },
                  { id: 'sinai', name: 'Sinai Protected Zones', nameAr: 'محميات سيناء ودهب' }
                ].map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => setCameraRegion(reg.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${cameraRegion === reg.id
                      ? 'bg-sky-500 text-white shadow'
                      : 'bg-th-surface2 text-th-muted hover:text-th-text hover:bg-th-surface2/80 border border-th-border/30'
                      }`}
                  >
                    {isAr ? reg.nameAr : reg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Webcam Streams Grid */}
            {filteredWebcams.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-th-border rounded-3xl bg-th-surface2/50 text-th-muted">
                <Camera size={44} className="mx-auto mb-3 text-th-muted/40" />
                <p className="font-bold text-sm uppercase tracking-wider">
                  {isAr ? 'لا توجد كاميرات نشطة في هذه المنطقة حالياً' : 'No active streams found in this region'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWebcams.map((cam) => (
                  <Card key={cam.id} className="bg-th-surface border border-th-border rounded-3xl overflow-hidden hover:shadow-xl hover:border-sky-500/30 transition-all flex flex-col justify-between group h-[380px]">

                    {/* Webcam Header */}
                    <div className="p-3.5 bg-th-surface2 border-b border-th-border/40 flex items-center justify-between">
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-th-text truncate m-0">
                          {isAr ? cam.nameAr : cam.name}
                        </h4>
                        <span className="text-[9px] text-th-muted block mt-0.5 font-mono">
                          Lat: {cam.lat} • Lng: {cam.lng}
                        </span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${cam.status === 'ONLINE'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                        }`}>
                        {isAr ? cam.statusAr : cam.status}
                      </span>
                    </div>

                    {/* Stream Video Player Frame */}
                    <div className="flex-1 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center min-h-[180px]">
                      <iframe
                        key={`cam-${iframeKey}-${cam.id}`}
                        src={constructWebcamUrl(cam.windyId)}
                        className="absolute inset-0 w-full h-full border-none z-0"
                        allowFullScreen
                      >
                        Browser not compatible.
                      </iframe>
                      {/* Dark fallback loader */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 pointer-events-none -z-10 text-white">
                        <RefreshCw className="animate-spin text-sky-500 mb-1" size={18} />
                        <span className="text-[9px] font-mono text-slate-500">FEED SYNCING...</span>
                      </div>
                    </div>

                    {/* Camera Footer Controls */}
                    <div className="p-3 bg-th-surface2/60 border-t border-th-border/40 flex flex-col gap-2.5">
                      <p className="text-[10px] m-0 text-th-muted line-clamp-2 h-7 leading-relaxed">
                        {isAr ? cam.descAr : cam.desc}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {/* Map Focus Trigger Link */}
                        <button
                          onClick={() => handleShowWebcamOnMap(cam)}
                          className="py-2 px-3 text-[10px] font-black bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border-none shadow-md shadow-sky-500/10"
                        >
                          <MapPin size={12} />
                          <span>{isAr ? 'عرض بالخريطة' : 'Show on Map'}</span>
                        </button>

                        {/* Direct Windy link */}
                        <a
                          href={getDirectWebcamUrl(cam.windyId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline grid"
                        >
                          <button className="py-2 px-3 text-[10px] font-black bg-th-surface border border-th-border text-th-text hover:bg-th-surface2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer w-full">
                            <ExternalLink size={12} />
                            <span>Windy Live</span>
                          </button>
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
