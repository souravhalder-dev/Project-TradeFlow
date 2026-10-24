import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().min(1),
  attachmentUrl: z.string().optional().nullable(),
  attachmentName: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Verify user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, role: true, profile: { select: { companyName: true, avatarUrl: true } } } },
          },
        },
      },
    });

    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const isParticipant = conversation.participants.some((p) => p.userId === user.id);
    if (!isParticipant && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, role: true, profile: { select: { companyName: true, avatarUrl: true } } },
        },
      },
    });

    // Mark participant's lastReadAt
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: id, userId: user.id },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({ conversation, messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: conversationId } = await params;

    // Check participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const isParticipant = conversation.participants.some((p) => p.userId === user.id);
    if (!isParticipant && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });

    const { content, attachmentUrl, attachmentName } = parsed.data;

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: user.id,
          content,
          attachmentUrl,
          attachmentName,
        },
        include: {
          sender: { select: { id: true, name: true, role: true, profile: { select: { companyName: true, avatarUrl: true } } } },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
