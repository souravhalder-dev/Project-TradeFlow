import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Globe2,
  FileText,
  ArrowRight,
  Cpu,
  Cog,
  Shirt,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  PackageCheck,
  Layers,
} from 'lucide-react';

export const revalidate = 60; // ISR cache 60s

export default async function HomePage() {
  const [featuredProducts, verifiedSuppliers, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        business: true,
        images: { orderBy: { order: 'asc' } },
        priceTiers: { orderBy: { minQuantity: 'asc' } },
      },
    }),
    prisma.business.findMany({
      where: { isVerified: true },
      take: 3,
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      take: 6,
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-16 px-4 sm:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-brand-orange/15 border border-brand-orange/30 px-3 py-1 rounded-full text-brand-orange text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Global B2B Sourcing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Connect Directly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500">Verified Manufacturers</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Wholesale pricing tiers, strict MOQ validation, custom OEM/ODM specifications, and multi-supplier Request for Quotations (RFQ).
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/products">
                <Button variant="brand" size="lg" className="rounded-xl shadow-lg shadow-orange-600/20 text-base">
                  <span>Explore Wholesale Products</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/rfq/new">
                <Button variant="outline" size="lg" className="rounded-xl border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800 text-base">
                  <FileText className="w-4 h-4 mr-2 text-brand-orange" />
                  <span>Submit Custom RFQ</span>
                </Button>
              </Link>
            </div>

            {/* Micro Trust Proofs */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs">
              <div>
                <div className="text-xl font-extrabold text-white">100%</div>
                <div className="text-slate-400">On-Site Audited Plants</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-white">50k+</div>
                <div className="text-slate-400">Verified SKU Specs</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-white">&lt; 24h</div>
                <div className="text-slate-400">Average RFQ Response</div>
              </div>
            </div>
          </div>

          {/* Hero RFQ Fast Launcher Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100">
            <div className="flex items-center space-x-2 text-brand-orange font-bold text-xs uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4" />
              <span>One-Click RFQ Sourcing</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950 mb-2">
              Post Your Requirements
            </h2>
            <p className="text-slate-500 text-xs mb-6">
              Receive direct competitive quotations from verified factories within hours.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">What are you looking to manufacture?</label>
                <input
                  type="text"
                  placeholder="e.g. 500 units custom Bluetooth ANC headphones"
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-orange/40"
                  readOnly
                  value="GaN USB-C Chargers, CNC Spindles, or Organic Cotton Tees..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Quantity</label>
                  <input
                    type="text"
                    value="500 Pieces"
                    className="w-full border rounded-lg p-2.5 outline-none bg-slate-50 text-slate-700"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Country</label>
                  <input
                    type="text"
                    value="United States / Europe"
                    className="w-full border rounded-lg p-2.5 outline-none bg-slate-50 text-slate-700"
                    readOnly
                  />
                </div>
              </div>

              <Link href="/rfq/new" className="block pt-2">
                <Button variant="brand" className="w-full py-3 rounded-lg text-sm font-bold shadow">
                  Request Quotations Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Wholesale Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
              Explore Industry Categories
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Sourcing directly from specialized industrial hubs
            </p>
          </div>
          <Link href="/categories" className="text-xs sm:text-sm font-bold text-brand-orange hover:text-orange-700 flex items-center">
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => {
            const icons = [Cpu, Cog, Shirt, HeartPulse, Layers, Globe2];
            const Icon = icons[idx % icons.length];
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group p-4 rounded-xl border bg-white hover:border-brand-orange/60 hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2"
              >
                <div className="p-3 rounded-full bg-slate-100 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                  <Icon className="w-6 h-6 text-slate-700 group-hover:text-brand-orange" />
                </div>
                <div className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-brand-orange transition-colors">
                  {cat.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {cat._count.products} Products
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Wholesale Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-1.5 text-brand-orange text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Direct Factory Supply</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
              Featured Wholesale Catalog
            </h2>
          </div>
          <Link href="/products" className="text-xs sm:text-sm font-bold text-brand-orange hover:text-orange-700 flex items-center">
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* Verified Gold Manufacturers */}
      <section className="bg-slate-100/80 py-12 px-4 sm:px-8 border-y">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>On-Site Factory Audited</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
                Verified Enterprise Manufacturers
              </h2>
            </div>
            <Link href="/suppliers" className="text-xs sm:text-sm font-bold text-slate-800 hover:text-brand-orange flex items-center">
              <span>View Supplier Directory</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {verifiedSuppliers.map((supplier) => (
              <div key={supplier.id} className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-600" /> Gold Verified Supplier
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">
                        {supplier.name}
                      </h3>
                      <div className="text-xs text-slate-500">{supplier.city}, {supplier.country}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {supplier.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {supplier.mainProducts.map((p, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[11px] text-slate-400">Response Rate</div>
                    <div className="font-bold text-emerald-600">{supplier.responseRate}%</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Established</div>
                    <div className="font-bold text-slate-800">{supplier.yearEstablished || '2012'}</div>
                  </div>
                  <Link href={`/suppliers/${supplier.slug}`}>
                    <Button variant="outline" size="sm" className="font-semibold text-xs">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buyer Protection & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>TradeFlow Sourcing Assurance</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              Protect Your Cross-Border Wholesale Transactions
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Every order on TradeFlow benefits from strict specification validation, factory inspection documentation, clear payment milestones, and dedicated logistics tracking.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>On-time dispatch guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Product quality specifications</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-3 w-full sm:w-auto">
            <Link href="/register">
              <Button variant="brand" size="lg" className="w-full sm:w-auto font-bold shadow-lg">
                Register as Verified Buyer
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-slate-700 bg-slate-800/80 hover:bg-slate-700">
                Learn About Protections
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
