import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { products: { where: { status: ProductStatus.PUBLISHED } } },
            },
          },
        },
        _count: {
          select: { products: { where: { status: ProductStatus.PUBLISHED } } },
        },
      },
    });

    const rootCategories = categories.filter((c) => !c.parentId);

    return NextResponse.json({ categories: rootCategories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
