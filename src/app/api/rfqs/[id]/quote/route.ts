import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { Role, QuotationStatus, RFQStatus, NotificationType } from '@prisma/client';
import { z } from 'zod';

const submitQuoteSchema = z.object({
  unitPrice: z.number().positive(),
  currency: z.string().default('USD'),
  minOrderQuantity: z.number().int().min(1),
  leadTimeDays: z.number().int().min(1).default(14),
  shippingEstimateCost: z.number().min(0).optional().nullable(),
  paymentTerms: z.string().optional(),
  validUntil: z.string(), // ISO date
  notes: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(2),
      minQuantity: z.number().int().min(1),
      unitPrice: z.number().positive(),
    })
  ).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== Role.SUPPLIER && user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Only authorized suppliers can submit quotations' }, { status: 403 });
    }

    const { id: rfqId } = await params;
    const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });
    if (!rfq) return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });

    const businessMember = await prisma.businessMember.findFirst({
      where: { userId: user.id },
      include: { business: true },
    });

    const businessId = businessMember?.businessId || (await prisma.business.findFirst())?.id;
    if (!businessId) {
      return NextResponse.json({ error: 'Supplier business profile required' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = submitQuoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    const quotation = await prisma.quotation.create({
      data: {
        rfqId,
        businessId,
        unitPrice: data.unitPrice,
        currency: data.currency,
        minOrderQuantity: data.minOrderQuantity,
        leadTimeDays: data.leadTimeDays,
        shippingEstimateCost: data.shippingEstimateCost,
        paymentTerms: data.paymentTerms,
        validUntil: new Date(data.validUntil),
        notes: data.notes,
        status: QuotationStatus.SUBMITTED,
        items: data.items
          ? {
              create: data.items.map((it) => ({
                description: it.description,
                minQuantity: it.minQuantity,
                unitPrice: it.unitPrice,
              })),
            }
          : undefined,
      },
      include: {
        business: true,
        items: true,
      },
    });

    // Update RFQ status to QUOTED if still OPEN
    if (rfq.status === RFQStatus.OPEN) {
      await prisma.rFQ.update({
        where: { id: rfqId },
        data: { status: RFQStatus.QUOTED },
      });
    }

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: rfq.userId,
        type: NotificationType.QUOTATION_RECEIVED,
        title: 'New Quotation Received',
        message: `Supplier ${businessMember?.business.name || 'Verified Supplier'} submitted a quotation of $${data.unitPrice}/unit for "${rfq.title}".`,
        link: `/buyer/rfqs/${rfq.id}`,
      },
    });

    return NextResponse.json({ success: true, quotation }, { status: 201 });
  } catch (error) {
    console.error('Submit quotation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
