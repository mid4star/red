import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cfEmailService } from '@/lib/cloudflare-email';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body; // action can be 'ENABLE' or 'DISABLE'

    const route = await prisma.emailRoute.findUnique({
      where: { id: params.id }
    });

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    if (route.userId !== auth.id && auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const enabled = action === 'ENABLE';
    
    if (route.cloudflareRuleId) {
      await cfEmailService.updateRouteStatus(route.cloudflareRuleId, route.alias, [route.destinationEmail], enabled);
    }

    const updated = await prisma.emailRoute.update({
      where: { id: params.id },
      data: { status: enabled ? 'ACTIVE' : 'DISABLED' }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating email route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const route = await prisma.emailRoute.findUnique({
      where: { id: params.id }
    });

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    if (route.userId !== auth.id && auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (route.cloudflareRuleId) {
      await cfEmailService.deleteRoute(route.cloudflareRuleId);
    }

    await prisma.emailRoute.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting email route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
