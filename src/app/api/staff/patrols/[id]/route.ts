import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const patrol = await prisma.patrol.findUnique({
      where: { id },
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
        attachments: true,
        route: true
      }
    });

    if (!patrol) {
      return NextResponse.json({ error: 'Patrol not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: patrol });
  } catch (error: any) {
    console.error('Error fetching patrol details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required to delete patrols.' }, { status: 403 });
    }

    const { id } = params;

    // Delete patrol (cascading deletes handled by DB schema for most relations)
    await prisma.patrol.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting patrol:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    
    // For now, we only support updating status via this simple PATCH
    if (body.status) {
      const updated = await prisma.patrol.update({
        where: { id },
        data: { status: body.status }
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'Invalid update data' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating patrol:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
