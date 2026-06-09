import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      include: {
        patrolsParticipated: {
          orderBy: { date: 'desc' },
          take: 20
        },
        violationsReported: {
          orderBy: { date: 'desc' },
          take: 20
        },
        surveysConducted: {
          orderBy: { date: 'desc' },
          take: 20
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Exclude passwordHash before sending
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({ success: true, data: safeUser });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
