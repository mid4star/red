import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const patrols = await prisma.patrol.findMany({
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        leader: true,
        vessel: true,
        crew: {
          include: {
            user: true
          }
        },
        patrolObservations: true,
        patrolViolations: true,
        route: true
      }
    });

    return NextResponse.json({ success: true, data: patrols });
  } catch (error: any) {
    console.error('Error fetching patrols:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // The data contains nested objects for crew, observations, violations
    const { 
      code, zone, zoneAr, type, weather, notes, status, leaderId, customLeaderName,
      areaCovered, duration, vesselId, routeCoordinates,
      crew, // Array of User IDs
      observations, // Array of observation objects
      violations, // Array of violation objects
      route, // GeoJSON or route object
      attachments // Array of attachment objects { name, url, type }
    } = data;

    // Start a transaction or do consecutive creates (since we need to create Monitoring/Violation records first)
    
    // 1. Create independent Sighting records if any
    const processedObservations = await Promise.all((observations || []).map(async (obs: any) => {
      // Create Sighting Record so it shows up in Monitoring -> Sightings
      const newSighting = await prisma.sighting.create({
        data: {
          location: obs.locationName || zone || 'Unknown',
          locationAr: zoneAr || 'Unknown',
          latitude: parseFloat(obs.latitude || '0'),
          longitude: parseFloat(obs.longitude || '0'),
          species: obs.speciesName || 'Unknown',
          speciesAr: obs.speciesName || 'Unknown',
          count: parseInt(obs.count || '1', 10),
          notes: obs.behaviorNotes || '',
          observerName: customLeaderName || 'Patrol Member',
          date: new Date(obs.observationTime || new Date()),
        }
      });
      return {
        ...obs,
        // We do not link it directly since monitoringRecordId expects an Observation model, 
        // but we successfully created the Sighting for the dashboard.
        monitoringRecordId: null 
      };
    }));

    // 2. Create independent Violation records if any
    const processedViolations = await Promise.all((violations || []).map(async (vio: any) => {
      // Create Violation Record
      const newVio = await prisma.violation.create({
        data: {
          code: `VIO-${Math.floor(Math.random() * 10000)}`,
          date: new Date(vio.dateTime || new Date()),
          officerId: leaderId || auth.id,
          locationLat: parseFloat(vio.latitude),
          locationLng: parseFloat(vio.longitude),
          types: vio.violationType,
          typeAr: vio.violationType, // Mapping could be better
          severity: vio.severity || 'LOW',
          violatorName: vio.violatorName,
          vesselName: vio.vesselName,
          actionTaken: vio.immediateAction,
          status: 'NEW',
          location: vio.location,
          description: vio.violationDetails
        }
      });
      return {
        ...vio,
        violationRecordId: newVio.id
      };
    }));

    // 3. Create the Patrol Record
    const patrolData: any = {
      code,
      zone,
      zoneAr,
      type,
      weather,
      notes,
      status: status || 'DRAFT',
      leaderId,
      customLeaderName,
      areaCovered: areaCovered ? parseFloat(areaCovered) : null,
      duration: duration ? parseFloat(duration) : null,
      vesselId,
      routeCoordinates: routeCoordinates ? JSON.stringify(routeCoordinates) : null
    };

    if (crew && crew.length > 0) {
      patrolData.crew = {
        create: crew.map((userId: string) => ({ userId }))
      };
    }

    if (processedObservations.length > 0) {
      patrolData.patrolObservations = {
        create: processedObservations.map((obs: any) => ({
          speciesName: obs.speciesName,
          count: parseInt(obs.count, 10),
          observationTime: new Date(obs.observationTime),
          locationName: obs.locationName,
          latitude: parseFloat(obs.latitude),
          longitude: parseFloat(obs.longitude),
          behaviorNotes: obs.behaviorNotes,
          photos: obs.photos ? JSON.stringify(obs.photos) : null,
          monitoringRecordId: obs.monitoringRecordId
        }))
      };
    }

    if (processedViolations.length > 0) {
      patrolData.patrolViolations = {
        create: processedViolations.map((vio: any) => ({
          violatorName: vio.violatorName,
          vesselName: vio.vesselName,
          violationType: vio.violationType,
          violationDetails: vio.violationDetails,
          dateTime: new Date(vio.dateTime),
          location: vio.location,
          latitude: parseFloat(vio.latitude),
          longitude: parseFloat(vio.longitude),
          evidencePhotos: vio.evidencePhotos ? JSON.stringify(vio.evidencePhotos) : null,
          evidenceFiles: vio.evidenceFiles ? JSON.stringify(vio.evidenceFiles) : null,
          immediateAction: vio.immediateAction,
          followupAction: vio.followupAction,
          status: vio.status,
          severity: vio.severity,
          violationRecordId: vio.violationRecordId
        }))
      };
    }

    if (route) {
      patrolData.route = {
        create: {
          geojson: JSON.stringify(route.geojson),
          startLat: route.startLat,
          startLng: route.startLng,
          endLat: route.endLat,
          endLng: route.endLng
        }
      };
    }

    if (attachments && attachments.length > 0) {
      patrolData.attachments = {
        create: attachments.map((att: any) => ({
          name: att.name,
          url: att.url,
          type: att.type.includes('image') ? 'IMAGE' : 'DOCUMENT'
        }))
      };
    }

    const patrol = await prisma.patrol.create({
      data: patrolData,
      include: {
        crew: true,
        patrolObservations: true,
        patrolViolations: true,
        route: true
      }
    });

    return NextResponse.json({ success: true, data: patrol });

  } catch (error: any) {
    console.error('Error creating patrol:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
