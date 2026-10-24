import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { z } from 'zod';

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = updateItemSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== user.id) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: parsed.data.quantity },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== user.id) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
