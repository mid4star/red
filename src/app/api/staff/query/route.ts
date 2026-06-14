import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET: Read data from SQLite/Turso
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');

    if (!collectionName) {
      return NextResponse.json({ error: 'collection parameter is required' }, { status: 400 });
    }

    // Public collections that do not require staff authentication
    const publicCollections = [
      'system_config',
      'reserves',
      'opendata',
      'news',
      'marine_species',
      'map_locations',
      'visitor_guide',
      'homepage'
    ];

    const auth = await verifyAuth(request);
    
    if (!publicCollections.includes(collectionName)) {
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const reserveFilter = auth && auth.role !== 'ADMIN' ? { reserveId: auth.reserveId } : {};

    let data: any[] = [];

    switch (collectionName) {
      case 'users':
        data = await prisma.user.findMany({ orderBy: { name: 'asc' } });
        // Convert string fields back to arrays for frontend compatibility
        data = data.map((u: any) => ({
          ...u,
          certifications: u.certifications ? u.certifications.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          allowedSections: u.allowedSections ? safeJsonParse(u.allowedSections, []) : [],
        }));
        break;
      case 'fleet':
        data = await prisma.vessel.findMany({ orderBy: { name: 'asc' } });
        break;
      case 'patrols':
        data = await prisma.patrol.findMany({ 
          where: reserveFilter,
          orderBy: { date: 'desc' },
          include: {
            vessel: true,
            members: true,
          }
        });
        data = data.map((p: any) => ({
          ...p,
          routeCoordinates: p.routeCoordinates ? safeJsonParse(p.routeCoordinates, []) : [],
          vessel: p.vessel ? p.vessel.name : 'No Vessel',
          vesselAr: p.vessel ? (p.vessel.nameAr || p.vessel.name) : 'بدون مركبة',
          officer: p.members && p.members.length > 0 ? p.members[0].name : 'No Officer',
          officerAr: p.members && p.members.length > 0 ? (p.members[0].nameAr || p.members[0].name) : 'بدون ضابط',
        }));
        break;
      case 'violations':
        data = await prisma.violation.findMany({ 
          where: reserveFilter,
          orderBy: { date: 'desc' },
          include: {
            officer: true,
            patrol: true
          }
        });
        data = data.map((v: any) => ({
          ...v,
          officerName: v.officer ? v.officer.name : 'Unknown',
          officerNameAr: v.officer ? (v.officer.nameAr || v.officer.name) : 'غير معروف',
        }));
        break;
      case 'observations':
        data = await (prisma as any).observation.findMany({ where: reserveFilter, orderBy: { date: 'desc' } });
        data = data.map((o: any) => ({
          ...o,
          indicators: o.indicators ? safeJsonParse(o.indicators, []) : [],
        }));
        break;
      case 'news':
        data = await (prisma as any).newsArticle.findMany({ orderBy: { date: 'desc' } });
        break;
      case 'reserves':
        data = await (prisma as any).reserveProfile.findMany({ orderBy: { name: 'asc' } });
        break;
      case 'opendata':
        data = await (prisma as any).openDataDocument.findMany({ orderBy: { uploadDate: 'desc' } });
        break;
      case 'visitor_guide':
        data = await (prisma as any).visitorGuideSection.findMany({ orderBy: { order: 'asc' } });
        data = data.map((s: any) => ({
          ...s,
          links: s.links ? safeJsonParse(s.links, []) : [],
        }));
        break;
      case 'homepage':
        data = await (prisma as any).homepageSettings.findMany();
        data = data.map((h: any) => ({
          ...h,
          announcements: h.announcements ? safeJsonParse(h.announcements, []) : [],
          stats: h.statsJson ? safeJsonParse(h.statsJson, []) : [],
          missionChecklist: h.missionChecklistJson ? safeJsonParse(h.missionChecklistJson, []) : [],
          highlights: h.highlightsJson ? safeJsonParse(h.highlightsJson, []) : [],
        }));
        break;
      case 'marine_species':
        data = await (prisma as any).marineSpecies.findMany({ orderBy: { name: 'asc' } });
        break;
      case 'map_locations':
        data = await (prisma as any).mapLocation.findMany({ orderBy: { name: 'asc' } });
        break;
      case 'eco_programs':
        data = await (prisma as any).ecoProgramReport.findMany({ where: reserveFilter, orderBy: { date: 'desc' } });
        break;
      case 'stranding_cases':
        data = await (prisma as any).strandingCase.findMany({ where: reserveFilter, orderBy: { date: 'desc' } });
        break;
      case 'sightings':
        data = await (prisma as any).sighting.findMany({ where: reserveFilter, orderBy: { date: 'desc' } });
        break;
      case 'beach_surveys':
        data = await (prisma as any).beachSurvey.findMany({ where: reserveFilter, orderBy: { date: 'desc' } });
        break;
      case 'system_config':
        data = await (prisma as any).systemConfig.findMany();
        break;
      default:
        return NextResponse.json({ error: `Unknown collection: ${collectionName}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in staff/query GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function safeJsonParse(str: string | null | undefined, defaultValue: any = null) {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}
