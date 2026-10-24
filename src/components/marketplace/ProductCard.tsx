import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, Star, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string | null;
    basePrice: number | string;
    currency: string;
    moq: number;
    unitOfMeasurement: string;
    leadTimeDays: number;
    countryOfOrigin: string;
    sampleAvailable: boolean;
    images?: Array<{ url: string; altText?: string | null }>;
    priceTiers?: Array<{ minQuantity: number; maxQuantity: number | null; unitPrice: number | string }>;
    business?: {
      id: string;
      name: string;
      slug: string;
      country: string;
      isVerified: boolean;
      rating?: number | string;
      reviewCount?: number;
      logoUrl?: string | null;
    } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
  const tiers = product.priceTiers || [];

  // Determine price range
  let priceDisplay = formatCurrency(product.basePrice, product.currency);
  if (tiers.length > 0) {
    const minTierPrice = Math.min(...tiers.map((t) => Number(t.unitPrice)));
    const maxTierPrice = Math.max(...tiers.map((t) => Number(t.unitPrice)));
    if (minTierPrice < maxTierPrice) {
      priceDisplay = `${formatCurrency(minTierPrice, product.currency)} - ${formatCurrency(maxTierPrice, product.currency)}`;
    } else {
      priceDisplay = formatCurrency(minTierPrice, product.currency);
    }
  }

  return (
    <div className="group rounded-xl border bg-white shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="bg-slate-900/90 text-white font-bold text-[11px] px-2.5 py-0.5 rounded shadow">
            MOQ: {product.moq} {product.unitOfMeasurement}s
          </span>
          {product.sampleAvailable && (
            <span className="bg-emerald-600/90 text-white font-medium text-[10px] px-2 py-0.5 rounded shadow">
              Sample Available
            </span>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Unit */}
          <div className="mb-1.5">
            <div className="text-lg font-extrabold text-slate-950 tracking-tight">
              {priceDisplay}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              per {product.unitOfMeasurement} (Wholesale Tiered)
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-brand-orange transition-colors mb-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Supplier Info Footer */}
        <div className="border-t pt-3 mt-2 text-xs">
          {product.business && (
            <div className="flex items-center justify-between text-slate-600 mb-1.5">
              <Link
                href={`/suppliers/${product.business.slug}`}
                className="font-medium truncate hover:text-slate-900 flex items-center max-w-[170px]"
              >
                {product.business.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 mr-1 shrink-0" />
                )}
                <span className="truncate">{product.business.name}</span>
              </Link>

              <div className="flex items-center text-amber-600 font-semibold text-[11px] shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                <span>{Number(product.business.rating || 5.0).toFixed(1)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-0.5" /> {product.countryOfOrigin}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-0.5" /> {product.leadTimeDays}d lead time
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
