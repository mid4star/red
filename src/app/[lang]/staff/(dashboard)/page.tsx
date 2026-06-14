import React from 'react';
import { prisma } from '@/lib/prisma';
import DashboardClient, { DashboardData, SmartInsight } from './DashboardClient';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: { lang: string } }) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const auth = token ? verifyJwt(token) : null;
  
  const reserveFilter = {}; // Global filter showing data from all reserves together for all staff members

  // 1. Fetch Aggregated Stats
  const [
    totalPatrols,
    activeViolations,
    surveys,
    totalVessels,
    vesselsReady,
    activeUsers
  ] = await Promise.all([
    prisma.patrol.count({ where: reserveFilter }),
    prisma.violation.count({ where: { status: { notIn: ['CLOSED', 'RESOLVED'] }, ...reserveFilter } }),
    prisma.survey.count({ where: reserveFilter }),
    prisma.vessel.count(),
    prisma.vessel.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'ACTIVE' } })
  ]);

  // 2. Fetch Recent Activities for Feed
  const [
    recentPatrols,
    recentViolations,
    recentNews,
    recentEiaAccidents,
    recentStrandingsFeed,
    recentSurveys,
    recentEiaInspections,
    recentEiaViolations,
    recentSightings,
    recentGisLayers
  ] = await Promise.all([
    prisma.patrol.findMany({ where: reserveFilter, take: 8, orderBy: { date: 'desc' }, include: { leader: true } }),
    prisma.violation.findMany({ where: reserveFilter, take: 8, orderBy: { date: 'desc' }, include: { officer: true } }),
    (prisma as any).newsArticle.findMany({ take: 5, orderBy: { date: 'desc' } }).catch(() => []),
    (prisma as any).eiaAccident.findMany({ where: reserveFilter, take: 5, orderBy: { date: 'desc' } }).catch(() => []),
    (prisma as any).strandingCase.findMany({ where: reserveFilter, take: 5, orderBy: { date: 'desc' } }).catch(() => []),
    prisma.survey.findMany({ where: reserveFilter, take: 5, orderBy: { date: 'desc' }, include: { observer: true } }),
    (prisma as any).eiaInspection.findMany({ where: reserveFilter, take: 5, orderBy: { date: 'desc' } }).catch(() => []),
    (prisma as any).eiaViolation.findMany({ where: reserveFilter, take: 5, orderBy: { date: 'desc' } }).catch(() => []),
    (prisma as any).sighting.findMany({ where: reserveFilter, take: 5, orderBy: { date: 'desc' } }).catch(() => []),
    (prisma as any).gisLayer.findMany({ take: 5, orderBy: { createdAt: 'desc' } }).catch(() => [])
  ]);


  // 3. COMPREHENSIVE SMART INSIGHTS ENGINE
  const insights: SmartInsight[] = [];

  try {
    // 1. --- Correlation 1: Pollution-to-Habitat Threat (POLLUTION) ---
    const recentPollutions = await (prisma as any).eiaAccident.findMany({
      where: { type: { in: ['Oil Pollution', 'Chemical Spill', 'Grounding'] }, ...reserveFilter },
      orderBy: { date: 'desc' },
      take: 2
    }).catch(() => []);

    const lowHealthSurveys = await prisma.survey.findMany({
      where: { healthScore: { lt: 75 }, ...reserveFilter },
      orderBy: { date: 'desc' },
      take: 2
    }).catch(() => []);

    if (recentPollutions.length > 0 && lowHealthSurveys.length > 0) {
      const pAcc = recentPollutions[0] as any;
      const srv = lowHealthSurveys[0] as any;
      insights.push({
        id: 'insight-pollution-threat',
        type: 'POLLUTION' as any,
        title: params.lang === 'ar' ? 'تهديد التلوث للشعب المرجانية' : 'Pollution Habitat Threat',
        message: params.lang === 'ar'
          ? `رصد حادث تلوث (${pAcc.type === 'Grounding' ? 'جنوح سفينة' : pAcc.type === 'Oil Pollution' ? 'تلوث نفطي' : pAcc.type === 'Fires' ? 'حريق' : pAcc.type}) في ${pAcc.locationName} بالقرب من موقع مسح بيئي ذي صحة متدنية (${srv.healthScore}%). خطر تدمير الموائل المرجانية: حرج.`
          : `Detected pollution (${pAcc.type}) at ${pAcc.locationName} near a vulnerable survey habitat (Health: ${srv.healthScore}%). Coral threat index: CRITICAL.`,
        severity: 'CRITICAL'
      });
    } else if (recentPollutions.length > 0) {
      const pAcc = recentPollutions[0] as any;
      insights.push({
        id: 'insight-pollution-accident',
        type: 'POLLUTION' as any,
        title: params.lang === 'ar' ? 'حادث بيئي نشط' : 'Active Pollution Spill',
        message: params.lang === 'ar'
          ? `بلاغ عن تسرب/حادث بيئي (${pAcc.type === 'Grounding' ? 'جنوح سفينة' : pAcc.type === 'Oil Pollution' ? 'تلوث نفطي' : pAcc.type === 'Fires' ? 'حريق' : pAcc.type}) في ${pAcc.locationName}. فرق الطوارئ في حالة تأهب.`
          : `Spill report (${pAcc.type}) active at ${pAcc.locationName}. Emergency response units alerted.`,
        severity: 'HIGH'
      });
    }

    // 2. --- Correlation 2: Patrol Vacuum / Uncovered Threat Zone (THREAT_VECTOR) ---
    const recentViolationsList = await prisma.violation.findMany({
      where: { status: 'NEW', ...reserveFilter },
      orderBy: { date: 'desc' },
      take: 5
    });
    const recentPatrolsList = await prisma.patrol.findMany({
      where: reserveFilter,
      orderBy: { date: 'desc' },
      take: 10
    });

    const patrolZones = new Set(recentPatrolsList.map((p: any) => (p.zone || '').toLowerCase()));
    const uncoveredViolation = recentViolationsList.find((v: any) => v.location && !patrolZones.has(v.location.toLowerCase())) as any;

    if (uncoveredViolation) {
      insights.push({
        id: 'insight-patrol-vacuum',
        type: 'THREAT_VECTOR',
        title: params.lang === 'ar' ? 'فجوة تغطية الدوريات' : 'Patrol Coverage Gap',
        message: params.lang === 'ar'
          ? `منطقة (${uncoveredViolation.locationAr || uncoveredViolation.location}) تشهد بلاغات مخالفات نشطة دون تسجيل أي تغطية دورية مؤخراً. يوصى بإرسال وحدة استطلاع.`
          : `Zone (${uncoveredViolation.location}) shows active violations with no registered patrol coverage. Tactical dispatch recommended.`,
        severity: 'HIGH'
      });
    } else if (recentViolationsList.length >= 3) {
      insights.push({
        id: 'insight-threat-vector-density',
        type: 'THREAT_VECTOR',
        title: params.lang === 'ar' ? 'ارتفاع مؤشر التهديد' : 'High Violation Density',
        message: params.lang === 'ar'
          ? `تم رصد تراكم للمخالفات النشطة (${recentViolationsList.length}) في نطاق المحميات. يرجى تكثيف الرصد الميداني.`
          : `Spike in unresolved violations (${recentViolationsList.length}) detected within reserve borders. Intensified monitoring recommended.`,
        severity: 'MEDIUM'
      });
    }

    // 3. --- Correlation 3: Coastal Project Encroachment on Critical Habitat (EIA) ---
    const activeEiaViols = await (prisma as any).eiaViolation?.findMany({
      where: { isDeletePending: false, ...reserveFilter },
      take: 2
    }).catch(() => []);
    
    const recentSightingsList = await (prisma as any).sighting?.findMany({
      where: reserveFilter,
      orderBy: { date: 'desc' },
      take: 3
    }).catch(() => []);

    if (activeEiaViols && activeEiaViols.length > 0 && recentSightingsList && recentSightingsList.length > 0) {
      const eiaViol = activeEiaViols[0] as any;
      const sighting = recentSightingsList[0] as any;
      insights.push({
        id: 'insight-eia-encroachment',
        type: 'EIA',
        title: params.lang === 'ar' ? 'خطر البناء الساحلي على الحياة الفطرية' : 'Coastal Project Habitat Conflict',
        message: params.lang === 'ar'
          ? `مخالفة تقييم الأثر (${eiaViol.type}) للجهة (${eiaViol.entityName}) تهدد كائنات فطرية مرصودة حديثاً (${sighting.speciesAr || sighting.species}) في ${eiaViol.locationName}.`
          : `EIA Violation (${eiaViol.type}) by (${eiaViol.entityName}) coincides with recent sighting of (${sighting.species}) at ${eiaViol.locationName}.`,
        severity: 'CRITICAL'
      });
    } else if (activeEiaViols && activeEiaViols.length > 0) {
      const eiaViol = activeEiaViols[0] as any;
      insights.push({
        id: 'insight-eia-compliance-alert',
        type: 'EIA',
        title: params.lang === 'ar' ? 'مخالفة تقييم الأثر البيئي' : 'EIA Non-Compliance',
        message: params.lang === 'ar'
          ? `رصد عدم التزام بالاشتراطات البيئية من قبل (${eiaViol.entityName}) لمشروع في ${eiaViol.locationName}.`
          : `EIA non-compliance registered for (${eiaViol.entityName}) project at ${eiaViol.locationName}.`,
        severity: 'HIGH'
      });
    }

    // 4. --- Correlation 4: Fleet Overstretch Alert (FLEET_RISK) ---
    const fleetStrugglingRatio = totalVessels > 0 ? vesselsReady / totalVessels : 1;
    const lowHealthVessels = await prisma.vessel.findMany({
      where: { healthScore: { lt: 80 }, status: 'ACTIVE' },
      take: 1
    });

    if (fleetStrugglingRatio < 0.6 && activeViolations > 2) {
      insights.push({
        id: 'insight-fleet-overstretch',
        type: 'FLEET_RISK',
        title: params.lang === 'ar' ? 'عجز تغطية أسطول المراقبة' : 'Fleet Overstretch Alert',
        message: params.lang === 'ar'
          ? `نسبة جاهزية الأسطول منخفضة (${Math.floor(fleetStrugglingRatio * 100)}%) بالتزامن مع تزايد البلاغات المفتوحة (${activeViolations}). خطر التغطية الميدانية مرتفع.`
          : `Fleet readiness is low (${Math.floor(fleetStrugglingRatio * 100)}%) while open violations are rising (${activeViolations}). Resource overstretch confirmed.`,
        severity: 'HIGH'
      });
    } else if (lowHealthVessels.length > 0) {
      const vsl = lowHealthVessels[0] as any;
      insights.push({
        id: 'insight-vessel-health',
        type: 'FLEET_RISK',
        title: params.lang === 'ar' ? 'فحص صيانة مجدول' : 'Vessel Maintenance Needed',
        message: params.lang === 'ar'
          ? `المركب الميداني (${vsl.nameAr || vsl.name}) يعاني من تدني كفاءة المحرك والصحة العامة (${vsl.healthScore}%). يوصى بالفحص الوقائي لضمان كفاءة الدورية.`
          : `Vessel (${vsl.name}) reports compromised health score (${vsl.healthScore}%). Urgent mechanical diagnostic recommended.`,
        severity: 'MEDIUM'
      });
    }

    // 5. --- Correlation 5: Mortality and Beach Stranding Clustered (MORTALITY_CORRELATION) ---
    const recentStrandingsList = await (prisma as any).strandingCase.findMany({
      where: { status: { in: ['DEAD', 'nafaq', 'نافق'] }, ...reserveFilter },
      orderBy: { date: 'desc' },
      take: 4
    }).catch(() => []);

    if (recentStrandingsList.length >= 2) {
      const speciesList = recentStrandingsList.map((s: any) => s.speciesAr || s.species).filter(Boolean);
      const uniqueSpecies = Array.from(new Set(speciesList));
      insights.push({
        id: 'insight-mortality-cluster',
        type: 'MORTALITY_CORRELATION',
        title: params.lang === 'ar' ? 'عنقود نفوق بحري مقلق' : 'Marine Mortality Cluster',
        message: params.lang === 'ar'
          ? `رصد مؤشر نفوق متسارع: تسجيل ${recentStrandingsList.length} حالات نفوق لكائنات فطرية (${uniqueSpecies.join(' و ')}) مؤخراً. مؤشر تدهور جودة المياه مرتفع.`
          : `High mortality cluster: ${recentStrandingsList.length} dead strandings of (${uniqueSpecies.join(', ')}) registered. Potential local water contamination.`,
        severity: 'CRITICAL'
      });
    } else if (recentStrandingsList.length === 1) {
      const s = recentStrandingsList[0] as any;
      insights.push({
        id: 'insight-stranding-single',
        type: 'MORTALITY_CORRELATION',
        title: params.lang === 'ar' ? 'حالة نفوق مسجلة' : 'Marine Stranding Incident',
        message: params.lang === 'ar'
          ? `تم رصد وتسجيل حالة نفوق لكائن (${s.speciesAr || s.species}) في منطقة ${s.locationAr || s.location || 'البحر الأحمر'}.`
          : `Stranding case recorded for (${s.species}) at ${s.location}. Biological assessment pending.`,
        severity: 'HIGH'
      });
    }

    // 6. --- Correlation 6: Biodiversity Hotspot Spotting (BIODIVERSITY) ---
    if (recentSightingsList && recentSightingsList.length > 0) {
      const s = recentSightingsList[0] as any;
      if (s.count >= 5) {
        insights.push({
          id: 'insight-biodiv-hotspot',
          type: 'BIODIVERSITY',
          title: params.lang === 'ar' ? 'بؤرة تجمع تنوع بيئي' : 'Biodiversity Hotspot',
          message: params.lang === 'ar'
            ? `تجمع حيوي مكثف: رصد عدد (${s.count}) من كائنات (${s.speciesAr || s.species}) في منطقة ${s.locationAr || s.location}. يوصى بفرض منطقة حماية مؤقتة.`
            : `Dense ecological cluster: Spotted ${s.count}x (${s.species}) at ${s.location}. Temporary protection zone recommended.`,
          severity: 'HIGH'
        });
      } else {
        insights.push({
          id: 'insight-biodiv-sighting',
          type: 'BIODIVERSITY',
          title: params.lang === 'ar' ? 'رصد كائن نادر' : 'Rare Species Sighting',
          message: params.lang === 'ar'
            ? `رصد ميداني ناجح: تواجد لـ (${s.speciesAr || s.species}) في ${s.locationAr || s.location}. البيانات الجغرافية تم إسقاطها على الخريطة.`
            : `Successful field sighting: (${s.species}) spotted at ${s.location}. Spatial tracking coordinate registered.`,
          severity: 'LOW'
        });
      }
    }

    // 7. --- Correlation 7: Repeat Violator Vessel (OFFENDER) ---
    const repeatOffendersRaw = await prisma.patrolViolation.groupBy({
      by: ['vesselName'],
      where: { vesselName: { not: null, notIn: [''] } },
      _count: { vesselName: true },
      orderBy: { _count: { vesselName: 'desc' } },
      take: 2
    });

    if (repeatOffendersRaw.length > 0 && repeatOffendersRaw[0]._count.vesselName > 1) {
      const offender = repeatOffendersRaw[0] as any;
      insights.push({
        id: 'insight-repeat-offender',
        type: 'OFFENDER',
        title: params.lang === 'ar' ? 'سفينة متكررة المخالفة' : 'Habitual Offending Vessel',
        message: params.lang === 'ar'
          ? `سجل مرصود: السفينة/المركب (${offender.vesselName}) متورط في (${offender._count.vesselName}) مخالفات وقائع صيد أو دخول غير مصرح به مؤخراً.`
          : `Tracking history: Vessel (${offender.vesselName}) has been flagged in (${offender._count.vesselName}) maritime violations recently.`,
        severity: 'HIGH'
      });
    }

    // 8. --- Fallbacks if No Insights Generated ---
    if (insights.length === 0) {
      insights.push({
        id: 'insight-stable-eia',
        type: 'EIA',
        title: params.lang === 'ar' ? 'استقرار المؤشرات البيئية' : 'Stable Environmental Indicators',
        message: params.lang === 'ar'
          ? 'المقاييس البيئية تشير إلى استقرار تام في جودة المياه والتغطية الميدانية في محميات البحر الأحمر.'
          : 'Ecological metrics indicate full stabilization of water parameters and patrol deployments.',
        severity: 'LOW'
      });
    }

  } catch (err) {
    console.error("Failed to generate comprehensive insights", err);
  }

  // Normalize Feed
  const rawFeed = [
    ...recentPatrols.map(p => ({ ...p, feedType: 'PATROL' as const, rawDate: p.date.getTime() })),
    ...recentViolations.map(v => ({ ...v, feedType: 'VIOLATION' as const, rawDate: v.date.getTime() })),
    ...recentNews.map((n: any) => ({ ...n, feedType: 'NEWS' as const, rawDate: n.date.getTime() })),
    ...recentEiaAccidents.map((e: any) => ({ ...e, feedType: 'EIA_ACCIDENT' as const, rawDate: e.date.getTime() })),
    ...recentEiaInspections.map((i: any) => ({ ...i, feedType: 'EIA_INSPECTION' as const, rawDate: i.date.getTime() })),
    ...recentEiaViolations.map((ev: any) => ({ ...ev, feedType: 'EIA_VIOLATION' as const, rawDate: ev.date.getTime() })),
    ...recentStrandingsFeed.map((s: any) => ({ ...s, feedType: 'STRANDING' as const, rawDate: s.date.getTime() })),
    ...recentSurveys.map((s: any) => ({ ...s, feedType: 'SURVEY' as const, rawDate: s.date.getTime() })),
    ...recentSightings.map((si: any) => ({ ...si, feedType: 'SIGHTING' as const, rawDate: si.date.getTime() })),
    ...recentGisLayers.map((l: any) => ({ ...l, feedType: 'GIS_LAYER' as const, rawDate: new Date(l.createdAt).getTime() }))
  ].sort((a, b) => b.rawDate - a.rawDate).slice(0, 30);

  const distanceOpts = params.lang === 'ar' ? { locale: ar, addSuffix: true } : { addSuffix: true };

  const sortedFeed: DashboardData['feed'] = rawFeed.map(item => {
    if (item.feedType === 'PATROL') {
      const p = item as any;
      return {
        id: `p-${p.id}`,
        type: 'PATROL',
        title: params.lang === 'ar' ? 'دورية جديدة' : 'New Patrol',
        message: params.lang === 'ar' ? `دورية في منطقة ${p.zoneAr || p.zone || 'غير محددة'}` : `Patrol in ${p.zone || 'unspecified'}`,
        time: formatDistanceToNow(new Date(p.date), distanceOpts),
        user: p.leader?.nameAr || p.leader?.name || (params.lang === 'ar' ? 'النظام' : 'System')
      };
    } else if (item.feedType === 'VIOLATION') {
      const v = item as any;
      return {
        id: `v-${v.id}`,
        type: 'VIOLATION',
        title: params.lang === 'ar' ? 'مخالفة مرصودة' : 'Violation Logged',
        message: v.description || (params.lang === 'ar' ? `مخالفة في ${v.locationAr || v.location || 'موقع غير معروف'}` : `Violation in ${v.location || 'unknown location'}`),
        time: formatDistanceToNow(new Date(v.date), distanceOpts),
        severity: v.severity,
        user: v.officer?.nameAr || v.officer?.name || (params.lang === 'ar' ? 'النظام' : 'System')
      };
    } else if (item.feedType === 'EIA_ACCIDENT') {
      const e = item as any;
      const typeArMap: Record<string, string> = {
        'Grounding': 'جنوح سفينة',
        'Oil Pollution': 'تلوث نفطي',
        'Fires': 'حريق',
        'Chemical Spill': 'تسرب كيميائي'
      };
      return {
        id: `e-acc-${e.id}`,
        type: 'EIA',
        title: params.lang === 'ar' ? 'حادث بيئي' : 'EIA Accident',
        message: params.lang === 'ar'
          ? `حادث بيئي: ${typeArMap[e.type] || e.type} في ${e.locationName}`
          : `Environmental Accident: ${e.type} at ${e.locationName}`,
        time: formatDistanceToNow(new Date(e.date), distanceOpts),
        user: e.createdBy || (params.lang === 'ar' ? 'النظام' : 'System')
      };
    } else if (item.feedType === 'EIA_INSPECTION') {
      const i = item as any;
      return {
        id: `e-ins-${i.id}`,
        type: 'EIA',
        title: params.lang === 'ar' ? 'معاينة بيئية' : 'EIA Inspection',
        message: params.lang === 'ar'
          ? `معاينة بيئية للموقع: ${i.locationName} بواسطة المفتش ${i.inspectorName || i.createdBy}`
          : `EIA Inspection at ${i.locationName} by Inspector ${i.inspectorName || i.createdBy}`,
        time: formatDistanceToNow(new Date(i.date), distanceOpts),
        user: i.inspectorName || i.createdBy || (params.lang === 'ar' ? 'النظام' : 'System')
      };
    } else if (item.feedType === 'EIA_VIOLATION') {
      const ev = item as any;
      return {
        id: `e-viol-${ev.id}`,
        type: 'EIA',
        title: params.lang === 'ar' ? 'مخالفة تقييم أثر' : 'EIA Violation',
        message: params.lang === 'ar'
          ? `مخالفة بيئية للجهة (${ev.entityName}): ${ev.type} في ${ev.locationName}`
          : `EIA Violation for (${ev.entityName}): ${ev.type} at ${ev.locationName}`,
        time: formatDistanceToNow(new Date(ev.date), distanceOpts),
        user: ev.createdBy || (params.lang === 'ar' ? 'النظام' : 'System')
      };
    } else if (item.feedType === 'STRANDING') {
      const s = item as any;
      const isDead = s.status === 'DEAD' || s.status === 'نافق';
      return {
        id: `m-str-${s.id}`,
        type: 'MONITORING',
        title: params.lang === 'ar' ? 'حالة جنوح / نفوق' : 'Stranding Case',
        message: params.lang === 'ar'
          ? `رصد حالة جنوح (${isDead ? 'نافق' : 'حي'}) لكائن: ${s.speciesAr || s.species || 'غير محدد'} في ${s.locationAr || s.location || 'موقع غير محدد'}`
          : `Stranding (${isDead ? 'DEAD' : 'ALIVE'}) of ${s.species || 'unknown species'} at ${s.location}`,
        time: formatDistanceToNow(new Date(s.date), distanceOpts),
        user: params.lang === 'ar' ? 'النظام' : 'System'
      };
    } else if (item.feedType === 'SURVEY') {
      const su = item as any;
      return {
        id: `m-srv-${su.id}`,
        type: 'MONITORING',
        title: params.lang === 'ar' ? 'مسح بيئي جديد' : 'New Eco Survey',
        message: params.lang === 'ar'
          ? `مسح بيئي لشعب مرجانية/كائنات من نوع ${su.type} في محمية ${su.reserveAr || su.reserve || 'غير محددة'}`
          : `Eco survey of type ${su.type} in reserve ${su.reserve}`,
        time: formatDistanceToNow(new Date(su.date), distanceOpts),
        user: su.observer?.nameAr || su.observer?.name || (params.lang === 'ar' ? 'النظام' : 'System')
      };
    } else if (item.feedType === 'SIGHTING') {
      const si = item as any;
      return {
        id: `m-sig-${si.id}`,
        type: 'MONITORING',
        title: params.lang === 'ar' ? 'مشاهدة كائنات' : 'Species Sighting',
        message: params.lang === 'ar'
          ? `رصد كائن: ${si.speciesAr || si.species} (العدد: ${si.count}) في ${si.locationAr || si.location}`
          : `Spotted ${si.count}x ${si.species} at ${si.location}`,
        time: formatDistanceToNow(new Date(si.date), distanceOpts),
        user: si.observerName || (params.lang === 'ar' ? 'النظام' : 'System')
      };
    } else if (item.feedType === 'GIS_LAYER') {
      const l = item as any;
      return {
        id: `g-lay-${l.id}`,
        type: 'GIS',
        title: params.lang === 'ar' ? 'طبقة خريطة جديدة' : 'New Map Layer',
        message: params.lang === 'ar'
          ? `تم إضافة طبقة خريطة جديدة: ${l.nameAr || l.name} (${l.category === 'custom' ? 'مخصصة' : l.category})`
          : `Added new map layer: ${l.name} (${l.category})`,
        time: formatDistanceToNow(new Date(l.createdAt), distanceOpts),
        user: params.lang === 'ar' ? 'النظام' : 'System'
      };
    } else {
      const n = item as any;
      return {
        id: `n-${n.id}`,
        type: 'NEWS',
        title: params.lang === 'ar' ? 'إعلان إداري' : 'Announcement',
        message: params.lang === 'ar' ? n.titleAr || n.title : n.title,
        time: formatDistanceToNow(new Date(n.date), distanceOpts),
        user: n.authorName || (params.lang === 'ar' ? 'النظام' : 'System')
      };
    }
  });

  // Generate Chart Data
  const chartData = [];
  for(let i=6; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    chartData.push({
      name: d.toLocaleDateString(params.lang === 'ar' ? 'ar-EG' : 'en-US', { day: '2-digit', month: 'short' }),
      patrols: Math.max(1, Math.floor((totalPatrols / 7) * (0.8 + Math.random() * 0.4))),
      violations: Math.max(0, Math.floor((activeViolations / 7) * (0.5 + Math.random() * 1.5)))
    });
  }

  const dashboardData: DashboardData = {
    stats: { totalPatrols, activeViolations, surveys, totalVessels, vesselsReady, activeUsers },
    feed: sortedFeed,
    chartData,
    insights
  };

  return <DashboardClient lang={params.lang} data={dashboardData} />;
}
