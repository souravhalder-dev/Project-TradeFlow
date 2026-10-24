import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { z } from 'zod';

const createAddressSchema = z.object({
  contactName: z.string().min(2),
  companyName: z.string().optional().nullable(),
  phone: z.string().min(5),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(2),
  state: z.string().optional().nullable(),
  postalCode: z.string().min(2),
  country: z.string().min(2),
  isDefault: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = createAddressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ success: true, address }, { status: 201 });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
