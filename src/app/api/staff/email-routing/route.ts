import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cfEmailService } from '@/lib/cloudflare-email';
import { z } from 'zod';

const FORBIDDEN_ALIASES = ['admin', 'support', 'info', 'root', 'system', 'postmaster'];

const createSchema = z.object({
  alias: z.string()
    .min(3, 'Alias must be at least 3 characters')
    .regex(/^[a-z0-9.-]+$/, 'Only lowercase letters, numbers, dots and hyphens are allowed')
    .refine(val => !FORBIDDEN_ALIASES.includes(val), 'This alias is reserved and cannot be used'),
  destinationEmail: z.string().email('Invalid destination email address'),
  description: z.string().optional()
});

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const routes = await prisma.emailRoute.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: routes });
  } catch (error: any) {
    console.error('Error fetching email routes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { alias, destinationEmail, description } = result.data;

    // Check if alias exists globally in our DB
    const existing = await prisma.emailRoute.findUnique({
      where: { alias }
    });

    if (existing) {
      return NextResponse.json({ error: 'Alias already in use' }, { status: 400 });
    }

    // Call Cloudflare API (or Mock)
    const cfRes = await cfEmailService.createRoute(alias, [destinationEmail]);

    // Save to database
    const newRoute = await prisma.emailRoute.create({
      data: {
        userId: auth.id,
        alias,
        destinationEmail,
        description,
        status: 'ACTIVE',
        cloudflareRuleId: cfRes.result?.id,
        verified: true // Assuming true for now since CF handles destination verification separately
      }
    });

    return NextResponse.json({ success: true, data: newRoute });
  } catch (error: any) {
    console.error('Error creating email route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
