import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = Boolean(stripeSecretKey && !stripeSecretKey.includes('placeholder') && !stripeSecretKey.includes('demo'));

export const stripe = isStripeConfigured
  ? new Stripe(stripeSecretKey!, {
      apiVersion: '2024-11-20.acacia' as any,
    })
  : null;

export interface CreatePaymentIntentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string | null;
  paymentId: string;
  isSandbox: boolean;
  status: 'requires_payment_method' | 'succeeded' | 'pending';
}

/**
 * Creates a payment intent via Stripe or provides an explicit sandbox test mode.
 */
export async function createPaymentSession(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResult> {
  if (stripe) {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Stripe expects cents
        currency: params.currency.toLowerCase(),
        receipt_email: params.customerEmail,
        metadata: {
          orderId: params.orderId,
          orderNumber: params.orderNumber,
          ...params.metadata,
        },
      });

      return {
        clientSecret: intent.client_secret,
        paymentId: intent.id,
        isSandbox: false,
        status: intent.status as any,
      };
    } catch (error) {
      console.error('Stripe Payment Intent Error:', error);
      throw error;
    }
  }

  // Explicit Sandbox Test Mode for development
  const sandboxPaymentId = `txn_sandbox_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  return {
    clientSecret: `mock_secret_${sandboxPaymentId}`,
    paymentId: sandboxPaymentId,
    isSandbox: true,
    status: 'requires_payment_method',
  };
}
