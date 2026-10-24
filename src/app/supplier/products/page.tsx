'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Package, PlusCircle, Trash2, Edit, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product listing?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadProducts();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Wholesale Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain wholesale price tiers, available factory inventories, and lead times.
          </p>
        </div>

        <Link href="/supplier/products/new">
          <Button variant="brand" size="sm" className="font-bold">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Add New Wholesale Product
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading wholesale products...</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No products published yet</h3>
          <p className="text-xs text-slate-500">Create your first wholesale listing with quantity pricing tiers.</p>
          <Link href="/supplier/products/new" className="inline-block pt-2">
            <Button variant="brand" size="sm">Create Product</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden divide-y text-xs">
          {products.map((p) => {
            const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';
            return (
              <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="relative h-16 w-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border">
                    <Image src={img} alt={p.name} fill className="object-cover" />
                  </div>
                  <div>
                    <Link href={`/products/${p.slug}`} className="font-bold text-slate-900 text-sm hover:text-brand-orange line-clamp-1">
                      {p.name}
                    </Link>
                    <div className="text-slate-500 text-xs mt-0.5">
                      Base: <strong className="text-slate-800">{formatCurrency(p.basePrice, p.currency)}</strong> • MOQ: <strong>{p.moq} {p.unitOfMeasurement}s</strong> • Stock: <strong>{p.inventory?.available ?? 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleArchive(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Archive listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
