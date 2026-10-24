import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ShieldCheck, Star, MapPin, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function SuppliersPage() {
  const suppliers = await prisma.business.findMany({
    orderBy: { rating: 'desc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="border-b pb-4">
        <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>On-Site Factory Audited</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Verified Manufacturer Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect directly with certified factories, OEM/ODM engineering teams, and high-volume industrial exporters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border">
                    {sup.logoUrl ? (
                      <Image src={sup.logoUrl} alt={sup.name} fill className="object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400 m-auto mt-3" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 line-clamp-1">
                      {sup.name}
                    </h2>
                    <div className="text-xs text-slate-500 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                      <span>{sup.city ? `${sup.city}, ` : ''}{sup.country}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-amber-600 font-bold text-xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  <span>{Number(sup.rating).toFixed(1)}</span>
                </div>
              </div>

              {sup.isVerified && (
                <div className="mb-3">
                  <span className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-600" /> Gold Verified Supplier
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {sup.description}
              </p>

              <div className="space-y-1.5 mb-4 text-xs">
                <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Main Manufacturing Capabilities</div>
                <div className="flex flex-wrap gap-1">
                  {sup.mainProducts.map((p, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="block text-[10px] text-slate-400">Response Rate</span>
                <strong className="text-emerald-600">{sup.responseRate}%</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Active Listings</span>
                <strong className="text-slate-800">{sup._count.products} Products</strong>
              </div>
              <Link href={`/suppliers/${sup.slug}`}>
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  <span>Factory Profile</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
