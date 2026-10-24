import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { calculateTieredPrice } from '@/lib/payments/pricing';
import { generateOrderNumber } from '@/lib/utils';
import { Role, OrderStatus, PaymentStatus, PaymentMethod, NotificationType } from '@prisma/client';
import { z } from 'zod';

const checkoutSchema = z.object({
  addressId: z.string().min(1),
  notes: z.string().optional(),
  paymentMethod: z.enum(['SANDBOX_TEST', 'STRIPE_CARD', 'BANK_TRANSFER']).default('SANDBOX_TEST'),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('view'); // 'supplier' or 'buyer'

    if (roleParam === 'supplier' || user.role === Role.SUPPLIER) {
      // Find supplier business
      const businessMember = await prisma.businessMember.findFirst({
        where: { userId: user.id },
      });

      if (!businessMember) {
        return NextResponse.json({ orders: [] });
      }

      const orders = await prisma.order.findMany({
        where: { supplierId: businessMember.businessId },
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, email: true, profile: { select: { companyName: true, country: true } } } },
          items: true,
          shipments: true,
          payments: true,
          address: true,
        },
      });

      return NextResponse.json({ orders });
    }

    // Default: Buyer's orders
    const orders = await prisma.order.findMany({
      where: { buyerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: { select: { id: true, name: true, slug: true, country: true, logoUrl: true, isVerified: true } },
        items: true,
        shipments: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        address: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid checkout parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { addressId, notes, paymentMethod } = parsed.data;

    // Verify address exists
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });
    if (!address) {
      return NextResponse.json({ error: 'Delivery address not found' }, { status: 404 });
    }

    // Read cart items from database
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                business: true,
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
      return NextResponse.json({ error: 'Your wholesale cart is empty' }, { status: 400 });
    }

    // Group cart items by supplier business
    const itemsBySupplier = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const supId = item.product.businessId;
      if (!itemsBySupplier.has(supId)) {
        itemsBySupplier.set(supId, []);
      }
      itemsBySupplier.get(supId)!.push(item);
    }

    const createdOrders: any[] = [];

    // Atomic transaction per supplier order
    await prisma.$transaction(async (tx) => {
      for (const [supplierId, supplierItems] of itemsBySupplier.entries()) {
        let orderSubtotal = 0;
        const validatedOrderItems: any[] = [];

        for (const item of supplierItems) {
          const product = item.product;

          // Check stock
          const availableStock = product.inventory?.available ?? 0;
          if (availableStock < item.quantity) {
            throw new Error(
              `Insufficient stock for product "${product.name}". Requested: ${item.quantity}, Available: ${availableStock}`
            );
          }

          // Calculate tiered price server-side
          const tiers = product.priceTiers.map((t) => ({
            minQuantity: t.minQuantity,
            maxQuantity: t.maxQuantity,
            unitPrice: Number(t.unitPrice),
          }));

          const pricing = calculateTieredPrice(item.quantity, Number(product.basePrice), product.moq, tiers);
          if (!pricing.isValid) {
            throw new Error(pricing.error || `MOQ of ${product.moq} not met for "${product.name}"`);
          }

          const itemTotal = pricing.subtotal;
          orderSubtotal += itemTotal;

          // Deduct stock and increment reserved
          await tx.inventory.update({
            where: { productId: product.id },
            data: {
              available: { decrement: item.quantity },
              reserved: { increment: item.quantity },
            },
          });

          validatedOrderItems.push({
            productId: product.id,
            productName: product.name,
            productSku: product.sku || null,
            productImage: product.images[0]?.url || null,
            unitPrice: pricing.unitPrice,
            quantity: item.quantity,
            totalPrice: itemTotal,
            unitOfMeasurement: product.unitOfMeasurement,
            variantSnapshot: item.variantId ? { variantId: item.variantId } : {},
          });
        }

        const shippingCost = 150.0; // Standard freight baseline
        const totalAmount = Number((orderSubtotal + shippingCost).toFixed(2));
        const orderNumber = generateOrderNumber();

        // Create Order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            buyerId: user.id,
            supplierId,
            addressId,
            status: OrderStatus.PENDING,
            currency: 'USD',
            subtotal: orderSubtotal,
            shippingCost,
            taxCost: 0.0,
            totalAmount,
            notes,
            items: {
              create: validatedOrderItems,
            },
            statusHistory: {
              create: {
                status: OrderStatus.PENDING,
                note: 'Order submitted by buyer',
                changedBy: user.name || user.email,
              },
            },
            payments: {
              create: {
                amount: totalAmount,
                currency: 'USD',
                method: paymentMethod as PaymentMethod,
                status: PaymentStatus.PENDING,
                transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              },
            },
          },
          include: {
            items: true,
            supplier: true,
          },
        });

        createdOrders.push(newOrder);

        // Notify supplier
        const supplierMembers = await tx.businessMember.findMany({
          where: { businessId: supplierId },
        });

        for (const member of supplierMembers) {
          await tx.notification.create({
            data: {
              userId: member.userId,
              type: NotificationType.ORDER_PLACED,
              title: `New Wholesale Order Placed (${orderNumber})`,
              message: `Buyer placed an order of ${totalAmount} USD with ${validatedOrderItems.length} item(s).`,
              link: `/supplier/orders/${newOrder.id}`,
            },
          });
        }
      }

      // Empty buyer cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Wholesale order(s) placed successfully',
      orders: createdOrders,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 400 });
  }
}
