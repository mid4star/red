import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const reserveFilter = auth.role !== 'ADMIN' ? { reserveId: auth.reserveId } : {};
    const inspections = await prisma.eiaInspection.findMany({
      where: reserveFilter,
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(inspections);
  } catch (error: any) {
    console.error('Error fetching EIA inspections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
     const auth = await verifyAuth(req);
     if (!auth) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     const body = await req.json();
     const { locationName, latitude, longitude, date, inspectorName, studyFileUrl, reportFileUrl, createdBy } = body;

     if (!locationName || latitude === undefined || longitude === undefined || !date || !inspectorName) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
     }

     const reserveId = auth.role !== 'ADMIN' ? auth.reserveId : (body.reserveId || '');
     const reserve = auth.role !== 'ADMIN' ? auth.reserve : (body.reserve || '');

     const inspection = await prisma.eiaInspection.create({
       data: {
         locationName,
         latitude: parseFloat(latitude),
         longitude: parseFloat(longitude),
         date: new Date(date),
         inspectorName,
         studyFileUrl: studyFileUrl || null,
         reportFileUrl: reportFileUrl || null,
         createdBy: createdBy || 'مصطفى لايق',
         reserveId,
         reserve,
       },
     });

     return NextResponse.json(inspection, { status: 201 });
  } catch (error: any) {
    console.error('Error creating EIA inspection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { id, action, locationName, latitude, longitude, date, inspectorName, studyFileUrl, reportFileUrl, user, reason } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required ID' }, { status: 400 });
    }

    let updatedData: any = {};

    if (action === 'REQUEST_DELETE') {
      updatedData = {
        isDeletePending: true,
        deleteReason: reason || 'طلب حذف السجل لدواعي المراجعة',
        updatedBy: user || 'مصطفى لايق'
      };
    } else if (action === 'APPROVE_DELETE') {
      if (auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
      await prisma.eiaInspection.delete({ where: { id } });
      return NextResponse.json({ success: true, deleted: true });
    } else if (action === 'REJECT_DELETE') {
      updatedData = {
        isDeletePending: false,
        deleteReason: null,
        updatedBy: user || 'مصطفى لايق'
      };
    } else {
      if (locationName) updatedData.locationName = locationName;
      if (latitude !== undefined) updatedData.latitude = parseFloat(latitude);
      if (longitude !== undefined) updatedData.longitude = parseFloat(longitude);
      if (date) updatedData.date = new Date(date);
      if (inspectorName) updatedData.inspectorName = inspectorName;
      if (studyFileUrl !== undefined) updatedData.studyFileUrl = studyFileUrl;
      if (reportFileUrl !== undefined) updatedData.reportFileUrl = reportFileUrl;
      if (user) updatedData.updatedBy = user;
    }

    const inspection = await prisma.eiaInspection.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(inspection);
  } catch (error: any) {
    console.error('Error updating EIA inspection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
