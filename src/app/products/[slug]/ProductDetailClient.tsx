'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { TierPriceTable } from '@/components/marketplace/TierPriceTable';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/utils';
import {
  ShieldCheck,
  Star,
  Clock,
  Truck,
  Box,
  Layers,
  MessageSquare,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  Share2,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: any;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, incrementCart } = useAuthStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants?.[0]?.id || null
  );
  const [quantity, setQuantity] = useState<number>(product.moq || 1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);
  const [cartErrorMessage, setCartErrorMessage] = useState<string | null>(null);

  // Inquiry / Message modal state
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState(
    `Wholesale inquiry for ${product.name}`
  );
  const [inquiryMessage, setInquiryMessage] = useState(
    `Hello, we are interested in placing an order for ${quantity} ${product.unitOfMeasurement}s. Can you please provide shipping estimates and sample availability?`
  );
  const [isInquirySending, setIsInquirySending] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  const images = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' }];
  const currentImage = images[selectedImageIndex]?.url || images[0].url;

  const handleAddToCart = async () => {
    setCartErrorMessage(null);
    setCartSuccessMessage(null);

    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }

    if (quantity < product.moq) {
      setCartErrorMessage(`Quantity must meet the minimum order quantity (MOQ: ${product.moq}).`);
      return;
    }

    setIsAddingToCart(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          variantId: selectedVariantId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCartErrorMessage(data.error || 'Failed to add item to cart');
      } else {
        incrementCart(quantity);
        setCartSuccessMessage(`Added ${quantity} ${product.unitOfMeasurement}s to your wholesale cart!`);
      }
    } catch {
      setCartErrorMessage('Network error while updating cart.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }

    const supplierUserId = product.business?.members?.[0]?.userId;
    if (!supplierUserId) {
      alert('Unable to identify supplier contact account.');
      return;
    }

    setIsInquirySending(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: supplierUserId,
          productId: product.id,
          subject: inquirySubject,
          initialMessage: inquiryMessage,
        }),
      });

      if (res.ok) {
        setInquirySent(true);
        setTimeout(() => {
          setIsInquiryModalOpen(false);
          setInquirySent(false);
        }, 2000);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to send inquiry.');
      }
    } catch {
      alert('Network error while sending inquiry.');
    } finally {
      setIsInquirySending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Category Breadcrumbs */}
      <nav className="flex items-center space-x-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/products" className="hover:text-slate-900">Products</Link>
        {product.category?.parent && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href={`/products?category=${product.category.parent.slug}`} className="hover:text-slate-900">
              {product.category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-slate-900 font-medium text-slate-700">
          {product.category?.name}
        </Link>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-2xl border bg-slate-50 overflow-hidden shadow-sm">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            {product.sampleAvailable && (
              <div className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow">
                Sample Ready
              </div>
            )}
          </div>

          {/* Thumbnail Selector */}
          {images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-20 w-20 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-brand-orange ring-2 ring-brand-orange/20 shadow' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt={img.altText || product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Middle & Right: Product Wholesale Configurator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <span>SKU: {product.sku || 'N/A'}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">In Stock ({product.inventory?.available ?? 1000} available)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 leading-tight">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Interactive Tier Pricing Table */}
          <TierPriceTable
            basePrice={product.basePrice}
            moq={product.moq}
            unitOfMeasurement={product.unitOfMeasurement}
            currency={product.currency}
            tiers={product.priceTiers || []}
            quantity={quantity}
            onQuantityChange={setQuantity}
            samplePrice={product.samplePrice}
            sampleAvailable={product.sampleAvailable}
          />

          {/* Variants Selector (if any) */}
          {product.variants?.length > 0 && (
            <div className="rounded-xl border p-4 bg-white">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Configurations / Options
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => {
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-brand-orange bg-orange-50 text-brand-orange font-bold ring-1 ring-brand-orange'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {v.name}
                      {v.additionalPrice > 0 && ` (+${formatCurrency(v.additionalPrice, product.currency)})`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fulfillment Specifications Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-slate-400 font-medium flex items-center mb-1">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> Lead Time
              </div>
              <div className="font-bold text-slate-900">{product.leadTimeDays} Business Days</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-slate-400 font-medium flex items-center mb-1">
                <Truck className="w-3.5 h-3.5 mr-1 text-slate-500" /> Freight Support
              </div>
              <div className="font-bold text-slate-900 truncate">Express, Air, Sea Freight</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-slate-400 font-medium flex items-center mb-1">
                <Box className="w-3.5 h-3.5 mr-1 text-slate-500" /> Origin Country
              </div>
              <div className="font-bold text-slate-900">{product.countryOfOrigin}</div>
            </div>
          </div>

          {/* Cart Feedback Alerts */}
          {cartSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" /> {cartSuccessMessage}
              </span>
              <Link href="/cart" className="font-bold underline ml-2">
                View Cart
              </Link>
            </div>
          )}

          {cartErrorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-rose-600 shrink-0" /> {cartErrorMessage}
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="brand"
              size="lg"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 font-bold shadow-md rounded-xl py-3"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span>{isAddingToCart ? 'Reserving Wholesale Stock...' : 'Add to Wholesale Cart'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsInquiryModalOpen(true)}
              className="flex-1 border-slate-300 font-bold hover:bg-slate-50 rounded-xl py-3 text-slate-800"
            >
              <MessageSquare className="w-4 h-4 mr-2 text-brand-orange" />
              <span>Contact Manufacturer</span>
            </Button>
          </div>

          {/* Supplier Card */}
          {product.business && (
            <div className="rounded-xl border bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Manufacturer Profile
                  </div>
                  <Link
                    href={`/suppliers/${product.business.slug}`}
                    className="text-base font-extrabold text-slate-900 hover:text-brand-orange transition-colors flex items-center mt-0.5"
                  >
                    {product.business.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-amber-500 mr-1.5" />
                    )}
                    <span>{product.business.name}</span>
                  </Link>
                  <div className="text-xs text-slate-500">
                    {product.business.city ? `${product.business.city}, ` : ''}{product.business.country}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center text-amber-600 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                    <span>{Number(product.business.rating).toFixed(1)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">({product.business.reviewCount} Reviews)</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t pt-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Response Rate</div>
                  <div className="font-bold text-slate-800">{product.business.responseRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Avg Response Time</div>
                  <div className="font-bold text-slate-800">{product.business.responseTime}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Business Type</div>
                  <div className="font-bold text-slate-800">{product.business.businessType}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Specifications, Description, Reviews */}
      <div className="border-t pt-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-950">Technical Specifications & Customization</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Specifications Table */}
          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-100/80 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-700 border-b">
              Factory Specifications
            </div>
            <div className="divide-y text-xs">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                Object.entries(product.specifications).map(([key, val]: any, i: number) => (
                  <div key={i} className="grid grid-cols-3 p-3">
                    <div className="font-semibold text-slate-500">{key}</div>
                    <div className="col-span-2 font-medium text-slate-900">{String(val)}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-slate-400">Standard specifications apply.</div>
              )}
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center">
                <Box className="w-4 h-4 mr-2 text-brand-orange" /> OEM / ODM Customization Support
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.customizationOptions ||
                  'Custom logo embossing, customized retail packaging, bespoke firmware, and ODM tooling available upon request.'}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" /> Sourcing & Logistics Guarantee
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Pre-shipment quality inspection and documentation</li>
                <li>Customs clearance documentation (Commercial Invoice, Packing List, CoO)</li>
                <li>Secure payment milestone terms with verified fulfillment tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Product Description */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-950">Detailed Product Description</h3>
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
            {product.description}
          </div>
        </div>

        {/* Verified Reviews Section */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-950">
              Verified Buyer Transaction Reviews ({product.reviews?.length || 0})
            </h3>
            <div className="flex items-center text-amber-500 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400 mr-1" />
              <span>{Number(product.business?.rating || 5.0).toFixed(1)} / 5.0</span>
            </div>
          </div>

          {product.reviews?.length === 0 ? (
            <p className="text-xs text-slate-400">No reviews yet for this listing. Be the first verified buyer to leave feedback after order fulfillment.</p>
          ) : (
            <div className="space-y-4 divide-y">
              {product.reviews.map((rev: any) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center">
                      <span>{rev.user?.name || 'Verified Enterprise Buyer'}</span>
                      {rev.isVerified && (
                        <span className="ml-2 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                          Verified Transaction
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  {rev.title && <div className="font-semibold text-slate-800">{rev.title}</div>}
                  <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Direct Contact Modal */}
      <Modal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        title="Direct Manufacturer Inquiry"
        description={`Send a direct authenticated inquiry to ${product.business?.name}`}
      >
        {inquirySent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-base text-slate-900">Inquiry Sent Successfully!</h4>
            <p className="text-xs text-slate-500">The supplier will receive your message in their portal and respond via TradeFlow messaging.</p>
          </div>
        ) : (
          <form onSubmit={handleSendInquiry} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
                required
                className="w-full border rounded-lg p-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inquiry Details</label>
              <textarea
                rows={4}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                required
                className="w-full border rounded-lg p-2 text-xs outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              disabled={isInquirySending}
              className="w-full py-2.5 font-bold"
            >
              {isInquirySending ? 'Sending Inquiry...' : 'Transmit Inquiry to Factory'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
