import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { NotificationType } from '@prisma/client';
import { z } from 'zod';

const createConversationSchema = z.object({
  recipientUserId: z.string().min(1),
  productId: z.string().optional().nullable(),
  rfqId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  subject: z.string().min(3),
  initialMessage: z.string().min(1),
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, slug: true, images: { take: 1 } } },
        rfq: { select: { id: true, title: true, quantity: true } },
        order: { select: { id: true, orderNumber: true, status: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, role: true, profile: { select: { companyName: true, avatarUrl: true } } } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { recipientUserId, productId, rfqId, orderId, subject, initialMessage } = parsed.data;

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({ where: { id: recipientUserId } });
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Create Conversation with participants and initial message
    const conversation = await prisma.conversation.create({
      data: {
        subject,
        productId,
        rfqId,
        orderId,
        lastMessageAt: new Date(),
        participants: {
          create: [
            { userId: user.id },
            { userId: recipientUserId },
          ],
        },
        messages: {
          create: {
            senderId: user.id,
            content: initialMessage,
          },
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
        messages: true,
      },
    });

    // Notify recipient
    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: NotificationType.MESSAGE_RECEIVED,
        title: `New Inquiry from ${user.name || user.email}`,
        message: initialMessage.slice(0, 100),
        link: user.role === 'SUPPLIER' ? `/buyer/messages` : `/supplier/dashboard`,
      },
    });

    return NextResponse.json({ success: true, conversation }, { status: 201 });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
