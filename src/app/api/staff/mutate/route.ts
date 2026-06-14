import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncToFirebase, deleteFromFirebase } from '@/lib/db-sync';
import { verifyAuth, hashPassword } from '@/lib/auth-utils';

// Map collectionName to Prisma delegate
const getModelDelegate = (collectionName: string) => {
  switch (collectionName) {
    case 'users': return prisma.user;
    case 'fleet': return prisma.vessel;
    case 'patrols': return prisma.patrol;
    case 'violations': return prisma.violation;
    case 'observations': return (prisma as any).observation; // using any for custom added models
    case 'news': return (prisma as any).newsArticle;
    case 'reserves': return (prisma as any).reserveProfile;
    case 'opendata': return (prisma as any).openDataDocument;
    case 'visitor_guide': return (prisma as any).visitorGuideSection;
    case 'homepage': return (prisma as any).homepageSettings;
    case 'marine_species': return (prisma as any).marineSpecies;
    case 'map_locations': return (prisma as any).mapLocation;
    case 'eco_programs': return (prisma as any).ecoProgramReport;
    case 'stranding_cases': return (prisma as any).strandingCase;
    case 'sightings': return (prisma as any).sighting;
    case 'beach_surveys': return (prisma as any).beachSurvey;
    case 'system_config': return (prisma as any).systemConfig;
    default: return null;
  }
};

// Helper to convert Firestore Timestamps or ISO strings to Date objects
function convertTimestampsToDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  // If it's a Firestore Timestamp representation on the client (like { seconds: 1234, nanoseconds: 5678 })
  if (typeof obj === 'object' && obj.seconds !== undefined && obj.nanoseconds !== undefined) {
    return new Date(obj.seconds * 1000);
  }
  
  // If it's a string that looks like a date
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
    return new Date(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestampsToDates(item));
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertTimestampsToDates(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
}

// Convert client-side model data to SQLite/Prisma-compatible data
function mapClientToSql(collectionName: string, clientData: any, action?: string): any {
  if (!clientData) return {};
  
  // First, convert dates
  const data = convertTimestampsToDates(clientData);
  const mapped = { ...data };
  
  // Remove fields that should not go to SQLite
  delete mapped.id;
  delete mapped.createdAt;
  delete mapped.updatedAt;

  // Convert coordinate/count string inputs to numeric types
  if (['eco_programs', 'stranding_cases', 'sightings', 'beach_surveys', 'system_config'].includes(collectionName)) {
    if (mapped.latitude !== undefined && mapped.latitude !== null) {
      mapped.latitude = parseFloat(mapped.latitude);
    }
    if (mapped.longitude !== undefined && mapped.longitude !== null) {
      mapped.longitude = parseFloat(mapped.longitude);
    }
  }

  // Handle specific fields transformations
  if (collectionName === 'users') {
    if (Array.isArray(mapped.certifications)) {
      mapped.certifications = mapped.certifications.join(', ');
    }
    if (Array.isArray(mapped.badges)) {
      mapped.badges = JSON.stringify(mapped.badges);
    }
    if (mapped.allowedSections) {
      mapped.allowedSections = JSON.stringify(mapped.allowedSections);
    }
    
    if (mapped.passwordHash) {
      // Hash password using PBKDF2 if it's not already in hash format (i.e. if it doesn't contain a colon)
      if (!mapped.passwordHash.includes(':')) {
        mapped.passwordHash = hashPassword(mapped.passwordHash);
      }
    } else if (action === 'ADD') {
      mapped.passwordHash = hashPassword('default_hashed_password');
    }
  } else if (collectionName === 'patrols') {
    if (mapped.routeCoordinates) {
      mapped.routeCoordinates = JSON.stringify(mapped.routeCoordinates);
    }
    if (mapped.officerId) {
      if (action === 'ADD') {
        mapped.members = {
          connect: [{ id: mapped.officerId }]
        };
      } else {
        mapped.members = {
          set: [{ id: mapped.officerId }]
        };
      }
      delete mapped.officerId;
    }
  } else if (collectionName === 'observations') {
    if (mapped.indicators) {
      mapped.indicators = JSON.stringify(mapped.indicators);
    }
  } else if (collectionName === 'homepage') {
    if (mapped.announcements) {
      mapped.announcements = JSON.stringify(mapped.announcements);
    }
    if (mapped.stats) {
      mapped.statsJson = JSON.stringify(mapped.stats);
      delete mapped.stats;
    }
    if (mapped.missionChecklist) {
      mapped.missionChecklistJson = JSON.stringify(mapped.missionChecklist);
      delete mapped.missionChecklist;
    }
    if (mapped.highlights) {
      mapped.highlightsJson = JSON.stringify(mapped.highlights);
      delete mapped.highlights;
    }
  } else if (collectionName === 'visitor_guide') {
    if (mapped.links) {
      mapped.links = JSON.stringify(mapped.links);
    }
  } else if (collectionName === 'sightings') {
    if (mapped.count !== undefined && mapped.count !== null) {
      mapped.count = parseInt(mapped.count, 10);
    }
  }
  
  return mapped;
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { collectionName, action, id, data } = body;

    if (!collectionName || !action) {
      return NextResponse.json({ error: 'collectionName and action are required' }, { status: 400 });
    }

    // Role-based authorization check: Only ADMIN or users with manage-users permission can modify users
    if (collectionName === 'users' || collectionName === 'system_config') {
      const dbUser = await prisma.user.findUnique({ where: { id: auth.id } });
      const allowedSections = dbUser?.allowedSections ? JSON.parse(dbUser.allowedSections) : [];
      const hasManageUsers = auth.role === 'ADMIN' || allowedSections.includes('manage-users');
      
      if (collectionName === 'users') {
        if (!hasManageUsers) {
          return NextResponse.json({ error: 'Forbidden: Admin or Manage Users permission required' }, { status: 403 });
        }
        
        // Check if requester is Mostafa Layaq
        const requesterName = dbUser?.name || '';
        const requesterNameAr = dbUser?.nameAr || '';
        const requesterEmail = dbUser?.customDomainEmail || '';
        const isMostafaLayaq = 
          requesterName.toLowerCase().includes('layaq') || 
          requesterName.toLowerCase().includes('layek') || 
          requesterNameAr.includes('لايق') ||
          requesterEmail.toLowerCase().startsWith('m.layaq') ||
          requesterEmail.toLowerCase().startsWith('mostafa.layaq');

        // Rule 1: Cannot modify an existing ADMIN user unless requester is Mostafa Layaq
        if (action === 'UPDATE' || action === 'DELETE') {
          const targetUser = await prisma.user.findUnique({ where: { id } });
          if (targetUser && targetUser.role === 'ADMIN' && !isMostafaLayaq) {
            return NextResponse.json({ error: 'Forbidden: Only Mostafa Layaq can modify Admin users' }, { status: 403 });
          }
        }

        // Rule 2: Cannot set role to ADMIN in ADD or UPDATE unless requester is Mostafa Layaq
        if ((action === 'ADD' || action === 'UPDATE') && data && data.role === 'ADMIN' && !isMostafaLayaq) {
          return NextResponse.json({ error: 'Forbidden: Only Mostafa Layaq can assign the Admin role' }, { status: 403 });
        }
      }
      
      if (collectionName === 'system_config' && auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const dbDelegate = getModelDelegate(collectionName);
    if (!dbDelegate) {
      return NextResponse.json({ error: `Invalid collectionName: ${collectionName}` }, { status: 400 });
    }

    if (collectionName === 'system_config' && action === 'UPDATE') {
       const sqlInput = mapClientToSql(collectionName, data, action);
       const result = await (prisma as any).systemConfig.upsert({
          where: { id: 'global' },
          update: sqlInput,
          create: { id: 'global', ...sqlInput }
       });
       syncToFirebase(collectionName, 'global', result).catch(err => {
          console.error('Firebase sync error:', err);
       });
       return NextResponse.json({ success: true, id: 'global', data: result });
    }

    console.log(`Processing database write operation. Collection: ${collectionName}, Action: ${action}`);

    if (action === 'ADD') {
      const sqlInput = mapClientToSql(collectionName, data, action);
      
      // Inject reserve data for multi-tenancy (except for collections that don't use it)
      const globalCollections = ['reserves', 'homepage', 'system_config', 'marine_species', 'map_locations', 'users', 'visitor_guide', 'news', 'opendata'];
      if (!globalCollections.includes(collectionName)) {
        if (auth.role !== 'ADMIN' && auth.reserveId) {
          sqlInput.reserveId = auth.reserveId;
          sqlInput.reserve = auth.reserve || '';
        } else if (auth.role === 'ADMIN' && !sqlInput.reserveId) {
          // If admin didn't specify, default to their own or empty
          sqlInput.reserveId = auth.reserveId || '';
          sqlInput.reserve = auth.reserve || '';
        }
      }

      if (id) {
        sqlInput.id = id;
      }
      const result = await dbDelegate.create({ data: sqlInput });
      syncToFirebase(collectionName, result.id, result).catch(err => {
        console.error('Firebase sync error:', err);
      });
      return NextResponse.json({ success: true, id: result.id, data: result });
      
    } else if (action === 'UPDATE') {
      if (!id) {
        return NextResponse.json({ error: 'id is required for UPDATE action' }, { status: 400 });
      }
      const sqlInput = mapClientToSql(collectionName, data, action);
      const result = await dbDelegate.update({
        where: { id },
        data: sqlInput
      });
      syncToFirebase(collectionName, id, result).catch(err => {
        console.error('Firebase sync error:', err);
      });
      return NextResponse.json({ success: true, id, data: result });
      
    } else if (action === 'DELETE') {
      if (!id) {
        return NextResponse.json({ error: 'id is required for DELETE action' }, { status: 400 });
      }
      await dbDelegate.delete({ where: { id } });
      deleteFromFirebase(collectionName, id).catch(err => {
        console.error('Firebase delete error:', err);
      });
      return NextResponse.json({ success: true, id });
      
    } else {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in staff mutation API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
