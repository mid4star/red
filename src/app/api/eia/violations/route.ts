import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const locationName = searchParams.get('locationName');
    const dateStr = searchParams.get('date');

    const whereClause: any = {};

    if (type) {
      whereClause.type = { contains: type };
    }
    if (locationName) {
      whereClause.locationName = { contains: locationName };
    }
    if (dateStr) {
      // Parse date to filter records on that day
      const filterDate = new Date(dateStr);
      if (!isNaN(filterDate.getTime())) {
        const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
        whereClause.date = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    const violations = await prisma.eiaViolation.findMany({
      where: whereClause,
      include: { files: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(violations);
  } catch (error: any) {
    console.error('Error fetching EIA violations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, date, locationName, latitude, longitude, entityType, entityName, createdBy, files } = body;

    if (!type || !date || !locationName || latitude === undefined || longitude === undefined || !entityType || !entityName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const violation = await prisma.eiaViolation.create({
      data: {
        type,
        date: new Date(date),
        locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        entityType,
        entityName,
        createdBy: createdBy || 'مصطفى لايق',
        files: files && files.length > 0 ? {
          create: files.map((file: any) => ({
            name: file.name,
            url: file.url,
          })),
        } : undefined,
      },
      include: { files: true },
    });

    return NextResponse.json(violation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating EIA violation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, type, date, locationName, latitude, longitude, entityType, entityName, files, user, reason } = body;

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
      await prisma.eiaViolation.delete({ where: { id } });
      return NextResponse.json({ success: true, deleted: true });
    } else if (action === 'REJECT_DELETE') {
      updatedData = {
        isDeletePending: false,
        deleteReason: null,
        updatedBy: user || 'مصطفى لايق'
      };
    } else {
      if (type) updatedData.type = type;
      if (date) updatedData.date = new Date(date);
      if (locationName) updatedData.locationName = locationName;
      if (latitude !== undefined) updatedData.latitude = parseFloat(latitude);
      if (longitude !== undefined) updatedData.longitude = parseFloat(longitude);
      if (entityType) updatedData.entityType = entityType;
      if (entityName) updatedData.entityName = entityName;
      if (user) updatedData.updatedBy = user;

      if (files) {
        // Simple swap: delete existing attachments and recreate
        await prisma.eiaViolationFile.deleteMany({ where: { violationId: id } });
        updatedData.files = {
          create: files.map((file: any) => ({
            name: file.name,
            url: file.url,
          })),
        };
      }
    }

    const violation = await prisma.eiaViolation.update({
      where: { id },
      data: updatedData,
      include: { files: true },
    });

    return NextResponse.json(violation);
  } catch (error: any) {
    console.error('Error updating EIA violation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
