import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // Get cart item count and unread notification count
    const [cart, unreadNotifications] = await Promise.all([
      prisma.cart.findUnique({
        where: { userId: user.id },
        include: { items: true },
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    const cartCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
        businesses: user.businessMembers.map((m) => m.business),
        cartCount,
        unreadNotifications,
      },
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
