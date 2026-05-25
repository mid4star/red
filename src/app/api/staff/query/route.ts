import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Read data from SQLite/Turso
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');

    if (!collectionName) {
      return NextResponse.json({ error: 'collection parameter is required' }, { status: 400 });
    }

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
        data = await prisma.patrol.findMany({ orderBy: { date: 'desc' } });
        data = data.map((p: any) => ({
          ...p,
          routeCoordinates: p.routeCoordinates ? safeJsonParse(p.routeCoordinates, []) : [],
        }));
        break;
      case 'violations':
        data = await prisma.violation.findMany({ orderBy: { date: 'desc' } });
        break;
      case 'observations':
        data = await (prisma as any).observation.findMany({ orderBy: { date: 'desc' } });
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
        }));
        break;
      case 'marine_species':
        data = await (prisma as any).marineSpecies.findMany({ orderBy: { name: 'asc' } });
        break;
      case 'map_locations':
        data = await (prisma as any).mapLocation.findMany({ orderBy: { name: 'asc' } });
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
