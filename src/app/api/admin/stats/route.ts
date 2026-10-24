import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role, VerificationStatus, ProductStatus } from '@prisma/client';

export async function GET() {
  try {
    await requireRole(Role.ADMIN);

    const [
      totalUsers,
      totalSuppliers,
      pendingVerifications,
      totalProducts,
      openRfqs,
      orders,
      auditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.supplierVerification.count({ where: { status: VerificationStatus.PENDING } }),
      prisma.product.count({ where: { status: ProductStatus.PUBLISHED } }),
      prisma.rFQ.count(),
      prisma.order.findMany({ select: { totalAmount: true, status: true } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    const totalGmv = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const paidOrdersCount = orders.filter((o) => o.status !== 'CANCELLED').length;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSuppliers,
        pendingVerifications,
        totalProducts,
        openRfqs,
        totalGmv: Number(totalGmv.toFixed(2)),
        totalOrders: orders.length,
        paidOrdersCount,
      },
      auditLogs,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Administrative privileges required' }, { status: 403 });
    }
    console.error('Fetch admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
