'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { calculateTieredPrice } from '@/lib/payments/pricing';
import { Check, Info } from 'lucide-react';

interface TierPriceTableProps {
  basePrice: number;
  moq: number;
  unitOfMeasurement: string;
  currency: string;
  tiers: Array<{
    minQuantity: number;
    maxQuantity: number | null;
    unitPrice: number;
  }>;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  samplePrice?: number | null;
  sampleAvailable?: boolean;
}

export function TierPriceTable({
  basePrice,
  moq,
  unitOfMeasurement,
  currency,
  tiers,
  quantity,
  onQuantityChange,
  samplePrice,
  sampleAvailable,
}: TierPriceTableProps) {
  const calculation = calculateTieredPrice(quantity, basePrice, moq, tiers);

  return (
    <div className="rounded-xl border bg-slate-50/80 p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
        <span>Wholesale Tiered Pricing</span>
        <span className="text-slate-700 font-semibold lowercase">
          MOQ: <strong className="text-slate-900 font-bold">{moq}</strong> {unitOfMeasurement}s
        </span>
      </div>

      {/* Tier Brackets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {tiers.map((tier, idx) => {
          const isActive =
            calculation.appliedTier &&
            calculation.appliedTier.minQuantity === tier.minQuantity;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onQuantityChange(tier.minQuantity)}
              className={`text-left p-3 rounded-lg border transition-all ${
                isActive
                  ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-xs text-slate-500 font-medium">
                {tier.maxQuantity ? `${tier.minQuantity} - ${tier.maxQuantity}` : `${tier.minQuantity}+`} {unitOfMeasurement}s
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {formatCurrency(tier.unitPrice, currency)}
              </div>
              {isActive && (
                <div className="flex items-center text-[11px] text-amber-700 font-bold mt-1">
                  <Check className="w-3 h-3 mr-0.5" /> Selected Tier
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quantity Selector & Live Calculation Preview */}
      <div className="border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <label htmlFor="quantity-input" className="font-semibold text-slate-700 text-xs">
            Order Quantity:
          </label>
          <div className="flex items-center border rounded-lg bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(moq, quantity - 10))}
              className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 font-bold"
            >
              -
            </button>
            <input
              id="quantity-input"
              type="number"
              min={moq}
              value={quantity}
              onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center font-bold text-slate-900 outline-none py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 10)}
              className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 font-bold"
            >
              +
            </button>
          </div>
          <span className="text-xs text-slate-500">{unitOfMeasurement}s</span>
        </div>

        {/* Calculated Total */}
        <div className="text-right">
          <div className="text-xs text-slate-500">
            Unit: <strong className="text-slate-800">{formatCurrency(calculation.unitPrice, currency)}</strong>
          </div>
          <div className="text-lg font-black text-slate-950">
            Total: <span className="text-brand-orange">{formatCurrency(calculation.subtotal, currency)}</span>
          </div>
        </div>
      </div>

      {!calculation.isValid && calculation.error && (
        <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs flex items-center">
          <Info className="w-4 h-4 mr-1.5 shrink-0" />
          <span>{calculation.error}</span>
        </div>
      )}
    </div>
  );
}
