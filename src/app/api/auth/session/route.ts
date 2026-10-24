import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerToken } from '@/lib/auth/firebase-admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { Role } from '@prisma/client';
import { z } from 'zod';

const sessionSchema = z.object({
  idToken: z.string().min(1),
  role: z.enum(['BUYER', 'SUPPLIER', 'ADMIN']).optional(),
  name: z.string().optional(),
  companyName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { idToken, role: requestedRole, name, companyName } = parsed.data;

    // Verify token on server
    const decoded = await verifyServerToken(idToken);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: 'Invalid or expired authentication token' }, { status: 401 });
    }

    const email = decoded.email || `${decoded.uid}@tradeflow.internal`;

    // Upsert User in PostgreSQL
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: {
        profile: true,
        businessMembers: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!user) {
      const userRole = (decoded.role as Role) || requestedRole || Role.BUYER;
      user = await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email,
          name: name || decoded.name || email.split('@')[0],
          role: userRole,
          profile: {
            create: {
              companyName: companyName || (userRole === Role.SUPPLIER ? 'New Supplier Business' : 'Commercial Buyer'),
              emailVerified: true,
            },
          },
        },
        include: {
          profile: true,
          businessMembers: {
            include: {
              business: true,
            },
          },
        },
      });
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'This account has been suspended by an administrator. Please contact support.' },
        { status: 403 }
      );
    }

    // Set HTTP-Only Session Cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
        businesses: user.businessMembers.map((m) => m.business),
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: idToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Session establishment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
