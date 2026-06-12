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
    const costs = await prisma.eiaCost.findMany({
      where: reserveFilter,
      include: { files: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(costs);
  } catch (error: any) {
    console.error('Error fetching EIA costs:', error);
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
    const { subject, details, date, status, files, createdBy } = body;

    if (!subject || !details || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reserveId = auth.role !== 'ADMIN' ? auth.reserveId : (body.reserveId || '');
    const reserve = auth.role !== 'ADMIN' ? auth.reserve : (body.reserve || '');

    const cost = await prisma.eiaCost.create({
      data: {
        subject,
        details,
        date: new Date(date),
        status: status || 'UNANSWERED',
        createdBy: createdBy || 'مصطفى لايق',
        reserveId,
        reserve,
        files: files && files.length > 0 ? {
          create: files.map((file: any) => ({
            name: file.name,
            url: file.url,
          })),
        } : undefined,
      },
      include: { files: true },
    });

    return NextResponse.json(cost, { status: 201 });
  } catch (error: any) {
    console.error('Error creating EIA cost:', error);
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
    const { id, action, status, subject, details, date, files, user, reason } = body;

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
      await prisma.eiaCost.delete({ where: { id } });
      return NextResponse.json({ success: true, deleted: true });
    } else if (action === 'REJECT_DELETE') {
      updatedData = {
        isDeletePending: false,
        deleteReason: null,
        updatedBy: user || 'مصطفى لايق'
      };
    } else {
      // General edit or status toggle
      if (status) updatedData.status = status;
      if (subject) updatedData.subject = subject;
      if (details) updatedData.details = details;
      if (date) updatedData.date = new Date(date);
      if (user) updatedData.updatedBy = user;
      
      if (files) {
        // Simple swap: delete existing attachments and recreate
        await prisma.eiaCostFile.deleteMany({ where: { costId: id } });
        updatedData.files = {
          create: files.map((file: any) => ({
            name: file.name,
            url: file.url,
          })),
        };
      }
    }

    const cost = await prisma.eiaCost.update({
      where: { id },
      data: updatedData,
      include: { files: true },
    });

    return NextResponse.json(cost);
  } catch (error: any) {
    console.error('Error updating EIA cost:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
