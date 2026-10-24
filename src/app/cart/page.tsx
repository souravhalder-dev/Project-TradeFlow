'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Trash2,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Package,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const [cartData, setCartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartData(data);
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    loadCart();
  }, [fetchUser]);

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    setIsUpdating(true);
    try {
      await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
      await loadCart();
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsUpdating(true);
    try {
      await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      await loadCart();
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center text-slate-500 text-xs">
        Loading wholesale cart...
      </div>
    );
  }

  const items = cartData?.items || [];
  const subtotal = cartData?.subtotal || 0;
  const allMoqMet = cartData?.allMoqMet ?? true;
  const allInStock = cartData?.allInStock ?? true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 flex items-center">
            <ShoppingCart className="w-7 h-7 mr-3 text-brand-orange" />
            <span>Wholesale Sourcing Cart</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tier-based price recalculation and MOQ verification applied on every line item.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-600">
          Total Items: <strong className="text-slate-900">{cartData?.totalItems || 0}</strong>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center space-y-4 shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Your wholesale cart is empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Discover verified manufacturers and explore tiered pricing in our wholesale product catalog.
          </p>
          <Link href="/products" className="inline-block pt-2">
            <Button variant="brand" size="sm" className="font-bold">
              Browse Wholesale Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Line Items (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="rounded-xl border bg-white p-5 shadow-sm flex flex-col sm:flex-row gap-5 items-start justify-between"
              >
                {/* Image */}
                <div className="relative h-24 w-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border">
                  {item.productImage && (
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="font-bold text-sm text-slate-900 hover:text-brand-orange transition-colors line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      {item.supplier && (
                        <div className="text-xs text-slate-500 flex items-center mt-1">
                          {item.supplier.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 mr-1" />
                          )}
                          <span>Supplier: {item.supplier.name} ({item.supplier.country})</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* MOQ & Tier Calculation Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center ${
                      item.isMoqMet ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {item.isMoqMet ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                      MOQ: {item.moq} {item.unitOfMeasurement}s
                    </span>

                    {item.volumeDiscountPercent > 0 && (
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded">
                        Tier Discount: -{item.volumeDiscountPercent}% applied
                      </span>
                    )}
                  </div>

                  {item.moqError && (
                    <div className="text-xs text-rose-600 font-medium">{item.moqError}</div>
                  )}

                  {/* Quantity Stepper & Price Calculation */}
                  <div className="pt-2 flex items-center justify-between border-t text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 font-medium">Quantity:</span>
                      <div className="flex items-center border rounded-md overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(item.moq, item.quantity - 10))}
                          disabled={isUpdating}
                          className="px-2.5 py-1 hover:bg-slate-200 font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 font-bold text-slate-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 10)}
                          disabled={isUpdating}
                          className="px-2.5 py-1 hover:bg-slate-200 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-slate-400">@ {formatCurrency(item.calculatedUnitPrice)} / pc</span>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-950">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary Box (4 cols) */}
          <div className="lg:col-span-4 rounded-xl border bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-950 border-b pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Wholesale Merchandise Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Standard Commercial Freight</span>
                <span className="font-bold text-slate-900">$150.00</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Import Tariff & Surcharge Estimate</span>
                <span className="text-slate-400">Calculated at dispatch</span>
              </div>

              <div className="border-t pt-3 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-950">Estimated Total</span>
                <span className="font-black text-xl text-brand-orange">
                  {formatCurrency(subtotal + 150)}
                </span>
              </div>
            </div>

            {!allMoqMet && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                <span>One or more items in your cart do not meet the minimum order quantity (MOQ).</span>
              </div>
            )}

            <Link href="/checkout" className="block pt-2">
              <Button
                variant="brand"
                size="lg"
                disabled={!allMoqMet || isUpdating}
                className="w-full font-bold shadow-md rounded-xl"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full inventory reservation and payment escrow protection enabled.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
