import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { OrderStatus, PaymentStatus, Role, ShipmentStatus, NotificationType } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        buyer: { select: { id: true, name: true, email: true, profile: true } },
        supplier: { select: { id: true, name: true, slug: true, country: true, logoUrl: true, isVerified: true, members: true } },
        items: true,
        address: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        payments: true,
        shipments: true,
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Authorization: User must be buyer, supplier member, or admin
    const isBuyer = order.buyerId === user.id;
    const isSupplier = order.supplier.members.some((m) => m.userId === user.id);
    const isAdmin = user.role === Role.ADMIN;

    if (!isBuyer && !isSupplier && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        supplier: { include: { members: true } },
        items: true,
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const isBuyer = order.buyerId === user.id;
    const isSupplier = order.supplier.members.some((m) => m.userId === user.id);
    const isAdmin = user.role === Role.ADMIN;

    if (!isBuyer && !isSupplier && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { status, note, carrier, trackingNumber, trackingUrl, paymentStatus } = body;

    // Handle payment simulation/update
    if (paymentStatus === 'PAID') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { status: OrderStatus.PAID },
        }),
        prisma.payment.updateMany({
          where: { orderId: id },
          data: { status: PaymentStatus.PAID },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: id,
            status: OrderStatus.PAID,
            note: note || 'Payment verified via sandbox checkout',
            changedBy: user.name || user.email,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: 'Payment confirmed for order' });
    }

    // Supplier fulfillment shipment update
    if (status === 'SHIPPED' && isSupplier) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { status: OrderStatus.SHIPPED },
        }),
        prisma.shipment.create({
          data: {
            orderId: id,
            carrier: carrier || 'DHL Express Worldwide',
            trackingNumber: trackingNumber || `TRACK-${Date.now().toString().slice(-8)}`,
            trackingUrl: trackingUrl || null,
            status: ShipmentStatus.IN_TRANSIT,
            notes: note || 'Dispatched from supplier export warehouse',
          },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: id,
            status: OrderStatus.SHIPPED,
            note: `Shipped via ${carrier || 'Express'} (Tracking: ${trackingNumber || 'Pending'})`,
            changedBy: user.name || user.email,
          },
        }),
      ]);

      // Notify buyer
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: NotificationType.ORDER_SHIPPED,
          title: `Order ${order.orderNumber} Dispatched`,
          message: `Your consignment has been handed over to ${carrier || 'the freight carrier'}.`,
          link: `/buyer/orders/${order.id}`,
        },
      });

      return NextResponse.json({ success: true, message: 'Fulfillment dispatched' });
    }

    // Status progression
    if (status) {
      const updated = await prisma.order.update({
        where: { id },
        data: { status: status as OrderStatus },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: status as OrderStatus,
          note: note || `Status updated to ${status}`,
          changedBy: user.name || user.email,
        },
      });

      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ error: 'No actionable change' }, { status: 400 });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
