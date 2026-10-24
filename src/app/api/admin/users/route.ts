import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    await requireRole(Role.ADMIN);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        profile: true,
        businessMembers: { include: { business: true } },
        _count: { select: { orders: true, rfqs: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Administrative privileges required' }, { status: 403 });
    }
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
