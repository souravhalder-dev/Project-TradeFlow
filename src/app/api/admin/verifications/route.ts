import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    await requireRole(Role.ADMIN);

    const verifications = await prisma.supplierVerification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        business: true,
      },
    });

    return NextResponse.json({ verifications });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Administrative privileges required' }, { status: 403 });
    }
    console.error('Fetch verifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
