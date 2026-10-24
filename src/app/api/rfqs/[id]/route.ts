import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { RFQStatus, QuotationStatus, Role, NotificationType } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        category: true,
        attachments: true,
        user: { select: { id: true, name: true, profile: { select: { companyName: true, country: true } } } },
        quotations: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                country: true,
                isVerified: true,
                rating: true,
                reviewCount: true,
                logoUrl: true,
              },
            },
            items: true,
          },
          orderBy: { unitPrice: 'asc' },
        },
      },
    });

    if (!rfq) return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });

    // Privacy check: If not the buyer who posted it, and not an admin, filter quotations to only show their own
    if (user && user.id !== rfq.userId && user.role !== Role.ADMIN) {
      const myBusiness = await prisma.businessMember.findFirst({ where: { userId: user.id } });
      if (myBusiness) {
        rfq.quotations = rfq.quotations.filter((q) => q.businessId === myBusiness.businessId);
      } else {
        rfq.quotations = [];
      }
    }

    return NextResponse.json({ rfq });
  } catch (error) {
    console.error('Fetch RFQ details error:', error);
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
    const rfq = await prisma.rFQ.findUnique({ where: { id } });
    if (!rfq) return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });

    if (rfq.userId !== user.id && user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { acceptedQuotationId, status } = body;

    if (acceptedQuotationId) {
      // Mark quotation accepted and others rejected
      await prisma.$transaction([
        prisma.quotation.update({
          where: { id: acceptedQuotationId },
          data: { status: QuotationStatus.ACCEPTED },
        }),
        prisma.quotation.updateMany({
          where: { rfqId: id, id: { not: acceptedQuotationId } },
          data: { status: QuotationStatus.REJECTED },
        }),
        prisma.rFQ.update({
          where: { id },
          data: { status: RFQStatus.ACCEPTED },
        }),
      ]);

      const acceptedQuote = await prisma.quotation.findUnique({
        where: { id: acceptedQuotationId },
        include: { business: { include: { members: true } } },
      });

      if (acceptedQuote) {
        for (const m of acceptedQuote.business.members) {
          await prisma.notification.create({
            data: {
              userId: m.userId,
              type: NotificationType.QUOTATION_ACCEPTED,
              title: 'Quotation Accepted by Buyer!',
              message: `Your quotation for RFQ "${rfq.title}" has been accepted. The buyer is now able to generate an order.`,
              link: `/supplier/rfqs/${rfq.id}`,
            },
          });
        }
      }

      return NextResponse.json({ success: true, message: 'Quotation accepted successfully' });
    }

    if (status) {
      const updated = await prisma.rFQ.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, rfq: updated });
    }

    return NextResponse.json({ error: 'No actionable change provided' }, { status: 400 });
  } catch (error) {
    console.error('Update RFQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
