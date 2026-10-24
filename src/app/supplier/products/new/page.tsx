'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Plus, ArrowLeft, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('Piece');
  const [moq, setMoq] = useState<number>(50);
  const [basePrice, setBasePrice] = useState<number>(35.0);
  const [initialStock, setInitialStock] = useState<number>(5000);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [countryOfOrigin, setCountryOfOrigin] = useState('China');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800');

  // Price tiers
  const [priceTiers, setPriceTiers] = useState<Array<{ minQuantity: number; maxQuantity: number | null; unitPrice: number }>>([
    { minQuantity: 50, maxQuantity: 199, unitPrice: 35.0 },
    { minQuantity: 200, maxQuantity: 999, unitPrice: 29.5 },
    { minQuantity: 1000, maxQuantity: null, unitPrice: 24.0 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      });
  }, []);

  const addPriceTier = () => {
    setPriceTiers([...priceTiers, { minQuantity: 100, maxQuantity: 500, unitPrice: 25.0 }]);
  };

  const removePriceTier = (index: number) => {
    setPriceTiers(priceTiers.filter((_, i) => i !== index));
  };

  const updatePriceTier = (index: number, field: string, val: any) => {
    const next = [...priceTiers];
    (next[index] as any)[field] = val;
    setPriceTiers(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError('Please select a category for this product');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId,
          sku: sku || undefined,
          shortDescription: shortDescription || undefined,
          description,
          unitOfMeasurement,
          moq: Number(moq),
          basePrice: Number(basePrice),
          countryOfOrigin,
          leadTimeDays: Number(leadTimeDays),
          images: [{ url: imageUrl, isPrimary: true }],
          priceTiers: priceTiers.map((t) => ({
            minQuantity: Number(t.minQuantity),
            maxQuantity: t.maxQuantity ? Number(t.maxQuantity) : null,
            unitPrice: Number(t.unitPrice),
          })),
          initialStock: Number(initialStock),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create product');
      } else {
        router.push('/supplier/products');
      }
    } catch {
      setError('Network communication failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <Link href="/supplier/products" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center mb-1">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Catalog
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Publish New Wholesale Product
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* Basic Info */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b pb-2">1. Listing Overview</h2>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex GaN 140W Multi-Port Fast Charger"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Category *</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs bg-slate-50 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">SKU / Part Number</label>
                <input
                  type="text"
                  placeholder="e.g. APX-GAN-140"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Short Description</label>
              <input
                type="text"
                placeholder="Key highlights and enterprise OEM selling points"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Detailed Description *</label>
              <textarea
                rows={5}
                required
                placeholder="Comprehensive technical details, manufacturing certifications, packaging specs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Primary Image URL *</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Wholesale Commercial Terms */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b pb-2">2. Commercial Wholesale Parameters</h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">MOQ *</label>
              <input
                type="number"
                min={1}
                required
                value={moq}
                onChange={(e) => setMoq(parseInt(e.target.value) || 1)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Unit of Measurement</label>
              <select
                value={unitOfMeasurement}
                onChange={(e) => setUnitOfMeasurement(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs bg-slate-50 outline-none"
              >
                <option value="Piece">Piece</option>
                <option value="Set">Set</option>
                <option value="Carton">Carton</option>
                <option value="Metric Ton">Metric Ton</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Base Price ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                min={0.01}
                required
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 1)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Available Stock *</label>
              <input
                type="number"
                min={0}
                required
                value={initialStock}
                onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Production Lead Time (Days) *</label>
              <input
                type="number"
                min={1}
                required
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 14)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Country of Origin *</label>
              <input
                type="text"
                required
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quantity Price Tiers */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-bold text-sm text-slate-900">3. Quantity-Based Price Tiers</h2>
            <button
              type="button"
              onClick={addPriceTier}
              className="text-xs text-brand-orange font-bold flex items-center hover:text-orange-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Tier Bracket
            </button>
          </div>

          <div className="space-y-3">
            {priceTiers.map((tier, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">Min Qty</label>
                  <input
                    type="number"
                    value={tier.minQuantity}
                    onChange={(e) => updatePriceTier(idx, 'minQuantity', parseInt(e.target.value) || 1)}
                    className="w-full border rounded p-1.5 text-xs outline-none bg-white font-bold"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">Max Qty (Blank = +)</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={tier.maxQuantity || ''}
                    onChange={(e) => updatePriceTier(idx, 'maxQuantity', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full border rounded p-1.5 text-xs outline-none bg-white"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">Unit Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tier.unitPrice}
                    onChange={(e) => updatePriceTier(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full border rounded p-1.5 text-xs outline-none bg-white font-bold text-brand-orange"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removePriceTier(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors mt-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Link href="/supplier/products">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
          <Button type="submit" variant="brand" size="lg" disabled={isSubmitting} className="font-bold shadow">
            {isSubmitting ? 'Publishing...' : 'Publish Wholesale Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
