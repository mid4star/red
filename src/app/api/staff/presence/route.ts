import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncToFirebase } from '@/lib/db-sync';
import { verifyAuth } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update SQLite
    const result = await prisma.user.update({
      where: { id: auth.id },
      data: { lastActive: new Date() }
    });

    // Sync to Firebase
    syncToFirebase('users', auth.id, result).catch(err => {
      console.error('Firebase sync error in presence route:', err);
    });

    return NextResponse.json({ success: true, lastActive: result.lastActive });
  } catch (error: any) {
    console.error('Error updating presence:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
