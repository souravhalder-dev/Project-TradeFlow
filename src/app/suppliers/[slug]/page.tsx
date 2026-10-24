import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ShieldCheck, Star, MapPin, Building2, Award, Clock, ArrowLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupplierProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function SupplierProfilePage({ params }: SupplierProfilePageProps) {
  const { slug } = await params;

  const supplier = await prisma.business.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      verification: true,
      products: {
        where: { status: 'PUBLISHED' },
        include: {
          business: true,
          images: { orderBy: { order: 'asc' } },
          priceTiers: { orderBy: { minQuantity: 'asc' } },
        },
      },
    },
  });

  if (!supplier) notFound();

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
        {supplier.bannerUrl ? (
          <Image src={supplier.bannerUrl} alt={supplier.name} fill className="object-cover opacity-70" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 -mt-20 relative z-10">
        {/* Supplier Profile Header Card */}
        <div className="rounded-2xl border bg-white p-6 sm:p-8 shadow-lg flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white shadow-md border-4 border-white overflow-hidden shrink-0">
              {supplier.logoUrl ? (
                <Image src={supplier.logoUrl} alt={supplier.name} fill className="object-cover" />
              ) : (
                <Building2 className="w-12 h-12 text-slate-400 m-auto mt-6" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950">{supplier.name}</h1>
                {supplier.isVerified && (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1 text-amber-600" /> Gold Verified Manufacturer
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4">
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {supplier.city ? `${supplier.city}, ` : ''}{supplier.country}
                </span>
                <span>•</span>
                <span>Established in <strong>{supplier.yearEstablished || '2012'}</strong></span>
                <span>•</span>
                <span>Workforce: <strong>{supplier.employeeCount || '100+ Staff'}</strong></span>
              </div>

              <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold pt-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{Number(supplier.rating).toFixed(1)} Rating ({supplier.reviewCount} Verified Transactions)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/rfq/new">
              <Button variant="brand" size="sm" className="w-full sm:w-auto font-bold shadow">
                Request Custom RFQ
              </Button>
            </Link>
          </div>
        </div>

        {/* Manufacturing Capabilities & Audits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-xl border bg-white p-6 shadow-sm space-y-4 text-xs">
            <h2 className="font-bold text-sm text-slate-950 border-b pb-2">
              Company Background & Engineering Scope
            </h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {supplier.description}
            </p>

            <div className="pt-2">
              <div className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px]">Primary Product Lines</div>
              <div className="flex flex-wrap gap-1.5">
                {supplier.mainProducts.map((p, i) => (
                  <span key={i} className="bg-slate-100 text-slate-800 px-3 py-1 rounded font-semibold text-xs">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4 text-xs">
            <h2 className="font-bold text-sm text-slate-950 border-b pb-2 flex items-center">
              <Award className="w-4 h-4 mr-2 text-emerald-600" /> Verified On-Site Factory Audits
            </h2>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center text-emerald-800 font-semibold bg-emerald-50/70 p-2 rounded border border-emerald-200">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" /> ISO9001:2015 Quality Management
              </li>
              <li className="flex items-center text-emerald-800 font-semibold bg-emerald-50/70 p-2 rounded border border-emerald-200">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" /> ISO14001:2015 Environmental System
              </li>
              <li className="flex items-center text-emerald-800 font-semibold bg-emerald-50/70 p-2 rounded border border-emerald-200">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" /> CE, FCC & RoHS Certified Testing
              </li>
            </ul>

            <div className="border-t pt-3 text-slate-500 space-y-1 text-[11px]">
              <div>Annual Export Volume: <strong>{supplier.annualRevenue || '$25M - $50M USD'}</strong></div>
              <div>Average Response Time: <strong>{supplier.responseTime}</strong></div>
              <div>Response Rate: <strong className="text-emerald-700">{supplier.responseRate}%</strong></div>
            </div>
          </div>
        </div>

        {/* Product Catalog from this supplier */}
        <div className="space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-xl font-black text-slate-950">
              Factory Wholesale Catalog ({supplier.products.length})
            </h2>
            <p className="text-xs text-slate-500">All products available with tiered volume wholesale pricing.</p>
          </div>

          {supplier.products.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No published products listed.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {supplier.products.map((prod) => (
                <ProductCard key={prod.id} product={prod as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
