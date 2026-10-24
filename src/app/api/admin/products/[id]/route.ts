import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role, ProductStatus } from '@prisma/client';
import { z } from 'zod';

const moderateProductSchema = z.object({
  status: z.enum(['PUBLISHED', 'REJECTED', 'ARCHIVED', 'DRAFT']),
  moderationReason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireRole(Role.ADMIN);
    const { id } = await params;

    const body = await req.json();
    const parsed = moderateProductSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

    const { status, moderationReason } = parsed.data;

    const product = await prisma.product.update({
      where: { id },
      data: { status: status as ProductStatus },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: `PRODUCT_MODERATION_${status}`,
        entityType: 'Product',
        entityId: id,
        metadata: { status, reason: moderationReason },
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Administrative privileges required' }, { status: 403 });
    }
    console.error('Admin product moderation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
