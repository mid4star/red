import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncToFirebase } from '@/lib/db-sync';
import { verifyAuth } from '@/lib/auth-utils';

export async function PUT(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profilePictureUrl } = await request.json();

    if (!profilePictureUrl) {
      return NextResponse.json({ error: 'profilePictureUrl is required' }, { status: 400 });
    }

    // Update SQLite
    const updatedUser = await prisma.user.update({
      where: { id: auth.id },
      data: { profilePictureUrl }
    });

    // Sync to Firebase
    syncToFirebase('users', auth.id, updatedUser).catch(err => {
      console.error('Firebase sync error in picture upload route:', err);
    });

    return NextResponse.json({ success: true, profilePictureUrl: updatedUser.profilePictureUrl });
  } catch (error: any) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
