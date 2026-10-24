import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role, VerificationStatus } from '@prisma/client';
import { z } from 'zod';

const updateVerificationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'ADDITIONAL_DOCS_REQUIRED', 'PENDING']),
  reviewerNotes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireRole(Role.ADMIN);
    const { id } = await params;

    const body = await req.json();
    const parsed = updateVerificationSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });

    const { status, reviewerNotes } = parsed.data;

    const verification = await prisma.supplierVerification.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!verification) return NextResponse.json({ error: 'Verification application not found' }, { status: 404 });

    const updated = await prisma.$transaction([
      prisma.supplierVerification.update({
        where: { id },
        data: {
          status: status as VerificationStatus,
          reviewerNotes,
          reviewedAt: new Date(),
          reviewedBy: adminUser.name || adminUser.email,
        },
      }),
      prisma.business.update({
        where: { id: verification.businessId },
        data: {
          isVerified: status === 'APPROVED',
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: `SUPPLIER_VERIFICATION_${status}`,
          entityType: 'SupplierVerification',
          entityId: id,
          metadata: { businessName: verification.business.name, notes: reviewerNotes },
        },
      }),
    ]);

    return NextResponse.json({ success: true, verification: updated[0] });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Administrative privileges required' }, { status: 403 });
    }
    console.error('Update verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
