import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { ProductStatus, Role } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        business: {
          include: {
            verification: true,
          },
        },
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
        priceTiers: { orderBy: { minQuantity: 'asc' } },
        inventory: true,
        reviews: {
          include: {
            user: { select: { name: true, profile: { select: { country: true, companyName: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Fetch product details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { business: { include: { members: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check ownership or admin
    const isOwner = product.business.members.some((m) => m.userId === user.id);
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not own this product' }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        shortDescription: body.shortDescription,
        description: body.description,
        basePrice: body.basePrice,
        moq: body.moq,
        status: body.status,
        leadTimeDays: body.leadTimeDays,
        shippingEstimate: body.shippingEstimate,
        sampleAvailable: body.sampleAvailable,
        samplePrice: body.samplePrice,
        customizationOptions: body.customizationOptions,
        specifications: body.specifications,
      },
      include: {
        images: true,
        priceTiers: true,
        inventory: true,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update product error:', error);
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: { business: { include: { members: true } } },
    });

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const isOwner = product.business.members.some((m) => m.userId === user.id);
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Mark as ARCHIVED instead of hard delete to preserve historical order integrity
    await prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });

    return NextResponse.json({ success: true, message: 'Product archived successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
