import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role } from '@prisma/client';
import { z } from 'zod';

const updateUserSchema = z.object({
  isSuspended: z.boolean().optional(),
  suspensionReason: z.string().optional().nullable(),
  role: z.enum(['BUYER', 'SUPPLIER', 'ADMIN']).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireRole(Role.ADMIN);
    const { id } = await params;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'ADMIN_UPDATE_USER',
        entityType: 'User',
        entityId: id,
        metadata: parsed.data,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Administrative privileges required' }, { status: 403 });
    }
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
