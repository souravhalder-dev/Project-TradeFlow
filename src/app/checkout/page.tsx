'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  Truck,
  MapPin,
  AlertCircle,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const [cartData, setCartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // New address form state
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  const [paymentMethod, setPaymentMethod] = useState<'SANDBOX_TEST' | 'STRIPE_CARD' | 'BANK_TRANSFER'>(
    'SANDBOX_TEST'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    // Load cart
    fetch('/api/cart')
      .then((res) => res.json())
      .then((data) => {
        setCartData(data);
        setIsLoading(false);
      });

    // Load user addresses from me
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setContactName(data.user.name || '');
          setCompanyName(data.user.profile?.companyName || '');
          setPhone(data.user.profile?.phone || '+1 555-019-2831');
          setAddressLine1('100 Industrial Parkway, Dock #4');
          setCity('San Francisco');
          setState('CA');
          setPostalCode('94107');
        }
      });
  }, [fetchUser]);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!addressLine1 || !city || !postalCode || !country) {
      setError('Please provide a complete shipping address');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Ensure user has a valid address ID in DB or create one
      let addressId = selectedAddressId;
      if (!addressId) {
        // Create address for user
        const addressRes = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactName: contactName || user?.name || 'Authorized Buyer',
            companyName: companyName || user?.profile?.companyName || 'Enterprise Co.',
            phone: phone || '+1 555-000-0000',
            addressLine1,
            city,
            state,
            postalCode,
            country,
          }),
        });

        if (addressRes.ok) {
          const addrData = await addressRes.json();
          addressId = addrData.address.id;
        } else {
          // If address api isn't directly needed, fallback or error
        }
      }

      // 2. Submit Order creation
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: addressId || 'default',
          notes,
          paymentMethod,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        setError(orderData.error || 'Failed to place order');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully!
      const firstOrderId = orderData.orders?.[0]?.id;
      if (firstOrderId) {
        router.push(`/buyer/orders/${firstOrderId}?checkout=success`);
      } else {
        router.push('/buyer/orders');
      }
    } catch {
      setError('Network communication failure during checkout.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center text-slate-500 text-xs">
        Loading checkout details...
      </div>
    );
  }

  const items = cartData?.items || [];
  const subtotal = cartData?.subtotal || 0;
  const shippingCost = 150.0;
  const totalAmount = subtotal + shippingCost;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center space-x-2 text-brand-orange text-xs font-bold uppercase tracking-wider mb-1">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Commercial Checkout</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Wholesale Order Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review shipping destination, fulfillment terms, and complete inventory reservation.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Delivery Address & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address Box */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-950 border-b pb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-brand-orange" /> Sourcing Delivery Destination
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full border rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Receiving Entity</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Address Line *</label>
                <input
                  type="text"
                  required
                  placeholder="Street address, industrial warehouse, unit or suite"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full border rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Region</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border rounded-lg p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full border rounded-lg p-2.5 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-950 border-b pb-2 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-brand-orange" /> Commercial Payment Method
            </h2>

            <div className="space-y-3 text-xs">
              {/* Sandbox Test Mode Option */}
              <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'SANDBOX_TEST'
                  ? 'border-brand-orange bg-orange-50/50 ring-1 ring-brand-orange'
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'SANDBOX_TEST'}
                      onChange={() => setPaymentMethod('SANDBOX_TEST')}
                      className="text-brand-orange focus:ring-brand-orange"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center">
                        <span>TradeFlow Developer Sandbox Mode</span>
                        <span className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Recommended for Testing
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Simulates instant authorized settlement. No real bank accounts or credit cards charged.
                      </p>
                    </div>
                  </div>
                </div>
              </label>

              {/* Stripe Card Option */}
              <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'STRIPE_CARD'
                  ? 'border-brand-orange bg-orange-50/50 ring-1 ring-brand-orange'
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'STRIPE_CARD'}
                      onChange={() => setPaymentMethod('STRIPE_CARD')}
                      className="text-brand-orange focus:ring-brand-orange"
                    />
                    <div>
                      <div className="font-bold text-slate-900">
                        Stripe Commercial Credit Card (Test Sandbox)
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Processed via Stripe Payment Intents test environment with 3D Secure verification.
                      </p>
                    </div>
                  </div>
                </div>
              </label>

              {/* Bank Transfer Option */}
              <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'border-brand-orange bg-orange-50/50 ring-1 ring-brand-orange'
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      className="text-brand-orange focus:ring-brand-orange"
                    />
                    <div>
                      <div className="font-bold text-slate-900">
                        International Wire Transfer / TT
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Pro-forma commercial invoice issued with SWIFT / IBAN remittance instructions.
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {/* Special Instructions */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Fulfillment Notes or Customs Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Notify receiving warehouse 24 hours prior to container delivery..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Summary: Snapshot & Confirmation (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-950 border-b pb-3">
            Consignment Review ({items.length} Lines)
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto divide-y text-xs">
            {items.map((it: any) => (
              <div key={it.id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 line-clamp-1">{it.productName}</div>
                  <div className="text-slate-500 text-[11px]">
                    Qty: {it.quantity} {it.unitOfMeasurement}s @ {formatCurrency(it.calculatedUnitPrice)}
                  </div>
                </div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {formatCurrency(it.subtotal)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Merchandise Subtotal</span>
              <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Freight Forwarding Baseline</span>
              <span className="font-bold text-slate-900">{formatCurrency(shippingCost)}</span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between text-base">
              <span className="font-bold text-slate-900">Total Settlement</span>
              <span className="font-black text-2xl text-brand-orange">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            disabled={isSubmitting || items.length === 0}
            className="w-full py-3.5 font-bold text-sm rounded-xl shadow-lg"
          >
            {isSubmitting ? 'Securing Transaction...' : 'Confirm Wholesale Order & Authorize'}
          </Button>

          <div className="p-3 bg-slate-50 border rounded-lg text-slate-500 text-[11px] space-y-1">
            <div className="font-bold text-slate-700 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              <span>Transactional Inventory Locking</span>
            </div>
            <p>
              Stock is decremented atomically in a database transaction. Order snapshots preserve exact pricing and product specifications permanently.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
