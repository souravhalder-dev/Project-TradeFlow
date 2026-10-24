import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { Role, RFQStatus, NotificationType } from '@prisma/client';
import { z } from 'zod';

const createRfqSchema = z.object({
  title: z.string().min(5),
  categoryId: z.string().optional().nullable(),
  description: z.string().min(20),
  quantity: z.number().int().positive(),
  unitOfMeasurement: z.string().default('Piece'),
  targetPrice: z.number().positive().optional().nullable(),
  currency: z.string().default('USD'),
  destinationCountry: z.string().min(2),
  requiredDeliveryDate: z.string().optional().nullable(),
  specifications: z.record(z.string()).optional(),
  attachments: z.array(
    z.object({
      fileName: z.string(),
      fileUrl: z.string().url(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
    })
  ).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope'); // 'my' or 'marketplace'

    // If buyer or requesting their own RFQs
    if (scope === 'my' || (user && user.role === Role.BUYER)) {
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const rfqs = await prisma.rFQ.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          _count: { select: { quotations: true } },
          quotations: {
            include: {
              business: { select: { id: true, name: true, country: true, isVerified: true, logoUrl: true } },
            },
          },
        },
      });

      return NextResponse.json({ rfqs });
    }

    // Suppliers / Marketplace view of open RFQs
    const rfqs = await prisma.rFQ.findMany({
      where: {
        status: { in: [RFQStatus.OPEN, RFQStatus.QUOTED] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        category: { select: { name: true, slug: true } },
        user: {
          select: {
            name: true,
            profile: { select: { companyName: true, country: true } },
          },
        },
        _count: { select: { quotations: true } },
      },
    });

    return NextResponse.json({ rfqs });
  } catch (error) {
    console.error('Fetch RFQs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = createRfqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    const rfq = await prisma.rFQ.create({
      data: {
        userId: user.id,
        title: data.title,
        categoryId: data.categoryId,
        description: data.description,
        quantity: data.quantity,
        unitOfMeasurement: data.unitOfMeasurement,
        targetPrice: data.targetPrice,
        currency: data.currency,
        destinationCountry: data.destinationCountry,
        requiredDeliveryDate: data.requiredDeliveryDate ? new Date(data.requiredDeliveryDate) : null,
        specifications: data.specifications || {},
        status: RFQStatus.OPEN,
        attachments: data.attachments
          ? {
              create: data.attachments.map((att) => ({
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
              })),
            }
          : undefined,
      },
      include: {
        attachments: true,
        category: true,
      },
    });

    // Notify registered suppliers in this category
    const suppliers = await prisma.business.findMany({
      take: 5,
      select: { members: { select: { userId: true } } },
    });

    for (const sup of suppliers) {
      for (const member of sup.members) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: NotificationType.RFQ_RECEIVED,
            title: 'New Matching RFQ Opportunity',
            message: `A new wholesale request "${rfq.title}" (${rfq.quantity} ${rfq.unitOfMeasurement}) was posted.`,
            link: `/supplier/rfqs/${rfq.id}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, rfq }, { status: 201 });
  } catch (error) {
    console.error('Create RFQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
