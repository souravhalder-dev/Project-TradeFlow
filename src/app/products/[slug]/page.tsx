import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      status: 'PUBLISHED',
    },
    include: {
      business: {
        include: {
          verification: true,
          members: { select: { userId: true } },
        },
      },
      category: {
        include: { parent: true },
      },
      images: { orderBy: { order: 'asc' } },
      variants: true,
      priceTiers: { orderBy: { minQuantity: 'asc' } },
      inventory: true,
      reviews: {
        include: {
          user: { select: { name: true, profile: { select: { country: true, companyName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Serializing decimals to numbers for client components
  const serializedProduct = {
    ...product,
    basePrice: Number(product.basePrice),
    samplePrice: product.samplePrice ? Number(product.samplePrice) : null,
    priceTiers: product.priceTiers.map((t) => ({
      ...t,
      unitPrice: Number(t.unitPrice),
    })),
    variants: product.variants.map((v) => ({
      ...v,
      additionalPrice: Number(v.additionalPrice),
    })),
    business: {
      ...product.business,
      rating: Number(product.business.rating),
    },
  };

  return <ProductDetailClient product={serializedProduct as any} />;
}
