import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyServerToken } from './firebase-admin';
import { Role, User, UserProfile, Business } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'tradeflow_session';

export interface AuthSessionUser extends User {
  profile: UserProfile | null;
  businessMembers: Array<{
    businessId: string;
    role: string;
    business: Business;
  }>;
}

/**
 * Gets currently authenticated user from Next.js headers / cookies
 */
export async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  let token: string | null = null;

  // 1. Try reading HTTP-Only session cookie
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (sessionCookie?.value) {
      token = sessionCookie.value;
    }
  } catch {
    // Cookie store may not be available in non-standard contexts
  }

  // 2. Try reading Authorization: Bearer <token>
  if (!token) {
    try {
      const headerStore = await headers();
      const authHeader = headerStore.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    } catch {
      // Header store may not be available
    }
  }

  if (!token) return null;

  const decoded = await verifyServerToken(token);
  if (!decoded || !decoded.uid) return null;

  // Find user in PostgreSQL via firebaseUid
  const user = await prisma.user.findUnique({
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

  if (!user || !user.isActive || user.isSuspended) {
    return null;
  }

  return user as AuthSessionUser;
}

/**
 * Guard that enforces authentication; throws or returns null
 */
export async function requireAuth(): Promise<AuthSessionUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Guard that enforces a specific role (or set of roles)
 */
export async function requireRole(allowedRoles: Role | Role[]): Promise<AuthSessionUser> {
  const user = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}
