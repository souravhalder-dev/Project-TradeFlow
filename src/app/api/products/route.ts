import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { ProductStatus, Prisma, Role } from '@prisma/client';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(3),
  categoryId: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  description: z.string().min(10),
  sku: z.string().optional(),
  unitOfMeasurement: z.string().default('Piece'),
  moq: z.number().int().min(1),
  basePrice: z.number().positive(),
  countryOfOrigin: z.string().min(2),
  leadTimeDays: z.number().int().min(1).default(14),
  shippingEstimate: z.string().optional(),
  sampleAvailable: z.boolean().default(true),
  samplePrice: z.number().positive().optional().nullable(),
  customizationOptions: z.string().optional(),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.object({ url: z.string().url(), isPrimary: z.boolean().optional() })).min(1),
  priceTiers: z.array(
    z.object({
      minQuantity: z.number().int().min(1),
      maxQuantity: z.number().int().positive().nullable(),
      unitPrice: z.number().positive(),
    })
  ).optional(),
  initialStock: z.number().int().min(0).default(1000),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const categorySlug = searchParams.get('category');
    const country = searchParams.get('country');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const maxMoq = searchParams.get('maxMoq') ? parseInt(searchParams.get('maxMoq')!, 10) : undefined;
    const verifiedOnly = searchParams.get('verified') === 'true';
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.PUBLISHED,
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { business: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (country) {
      where.countryOfOrigin = { equals: country, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined && !isNaN(minPrice)) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined && !isNaN(maxPrice)) where.basePrice.lte = maxPrice;
    }

    if (maxMoq !== undefined && !isNaN(maxMoq)) {
      where.moq = { lte: maxMoq };
    }

    if (verifiedOnly) {
      where.business = { isVerified: true };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
    else if (sort === 'price_desc') orderBy = { basePrice: 'desc' };
    else if (sort === 'moq_asc') orderBy = { moq: 'asc' };

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              country: true,
              isVerified: true,
              rating: true,
              reviewCount: true,
              logoUrl: true,
            },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { order: 'asc' },
          },
          priceTiers: {
            orderBy: { minQuantity: 'asc' },
          },
          inventory: {
            select: { available: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Products query error:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== Role.SUPPLIER && user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Only authorized suppliers can publish products' }, { status: 403 });
    }

    // Get supplier business
    const businessMember = await prisma.businessMember.findFirst({
      where: { userId: user.id },
      include: { business: true },
    });

    if (!businessMember && user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'You must set up a verified business profile before listing products' },
        { status: 400 }
      );
    }

    const businessId = businessMember?.businessId || (await prisma.business.findFirst())?.id;
    if (!businessId) {
      return NextResponse.json({ error: 'Supplier business not found' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;
    const baseSlug = slugify(data.name);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const newProduct = await prisma.product.create({
      data: {
        businessId,
        categoryId: data.categoryId,
        name: data.name,
        slug: uniqueSlug,
        shortDescription: data.shortDescription,
        description: data.description,
        sku: data.sku,
        unitOfMeasurement: data.unitOfMeasurement,
        moq: data.moq,
        basePrice: data.basePrice,
        countryOfOrigin: data.countryOfOrigin,
        leadTimeDays: data.leadTimeDays,
        shippingEstimate: data.shippingEstimate,
        sampleAvailable: data.sampleAvailable,
        samplePrice: data.samplePrice,
        customizationOptions: data.customizationOptions,
        specifications: data.specifications || {},
        status: ProductStatus.PUBLISHED,
        images: {
          create: data.images.map((img, idx) => ({
            url: img.url,
            order: idx,
            isPrimary: img.isPrimary ?? idx === 0,
          })),
        },
        priceTiers: data.priceTiers
          ? {
              create: data.priceTiers.map((tier) => ({
                minQuantity: tier.minQuantity,
                maxQuantity: tier.maxQuantity,
                unitPrice: tier.unitPrice,
              })),
            }
          : undefined,
        inventory: {
          create: {
            available: data.initialStock,
          },
        },
      },
      include: {
        images: true,
        priceTiers: true,
        inventory: true,
      },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
