import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { calculateTieredPrice } from '@/lib/payments/pricing';
import { z } from 'zod';

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  variantId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                business: { select: { id: true, name: true, slug: true, country: true, isVerified: true } },
                images: { where: { isPrimary: true }, take: 1 },
                priceTiers: { orderBy: { minQuantity: 'asc' } },
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ items: [], subtotal: 0, totalItems: 0 });
    }

    // Server-side recalculation of tiered prices for each item
    let subtotal = 0;
    let totalItems = 0;

    const evaluatedItems = cart.items.map((item) => {
      const p = item.product;
      const tiers = p.priceTiers.map((t) => ({
        minQuantity: t.minQuantity,
        maxQuantity: t.maxQuantity,
        unitPrice: Number(t.unitPrice),
      }));

      const pricing = calculateTieredPrice(item.quantity, Number(p.basePrice), p.moq, tiers);
      const itemSubtotal = pricing.subtotal;
      subtotal += itemSubtotal;
      totalItems += item.quantity;

      const isStockSufficient = (p.inventory?.available ?? 0) >= item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        productName: p.name,
        productSlug: p.slug,
        productImage: p.images[0]?.url || null,
        supplier: p.business,
        quantity: item.quantity,
        moq: p.moq,
        unitOfMeasurement: p.unitOfMeasurement,
        calculatedUnitPrice: pricing.unitPrice,
        subtotal: itemSubtotal,
        appliedTier: pricing.appliedTier,
        volumeDiscountPercent: pricing.volumeDiscountPercent,
        isMoqMet: pricing.isValid,
        moqError: pricing.error,
        isStockSufficient,
        availableStock: p.inventory?.available ?? 0,
        variantId: item.variantId,
      };
    });

    return NextResponse.json({
      items: evaluatedItems,
      subtotal: Number(subtotal.toFixed(2)),
      totalItems,
      allMoqMet: evaluatedItems.every((it) => it.isMoqMet),
      allInStock: evaluatedItems.every((it) => it.isStockSufficient),
    });
  } catch (error) {
    console.error('Fetch cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { productId, quantity, variantId } = parsed.data;

    // Verify product exists and is published
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product || product.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Product is no longer available' }, { status: 404 });
    }

    // Ensure user has a cart
    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }

    // Upsert cart item
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId || null },
    });

    const targetQuantity = existingItem ? existingItem.quantity + quantity : Math.max(quantity, product.moq);

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: targetQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity: targetQuantity,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Item added to cart', quantity: targetQuantity });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
