'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2, UploadCloud, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PostRfqPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(500);
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('Piece');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [destinationCountry, setDestinationCountry] = useState('United States');
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState('');
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([
    { key: 'Logo Requirement', value: 'Laser Engraved / Silk Screen' },
    { key: 'Packaging', value: 'Custom Retail Box with Foam Tray' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      })
      .catch(() => {});
  }, []);

  const addSpecField = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecField = (idx: number) => {
    setSpecifications(specifications.filter((_, i) => i !== idx));
  };

  const updateSpecField = (idx: number, field: 'key' | 'value', val: string) => {
    const next = [...specifications];
    next[idx][field] = val;
    setSpecifications(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      router.push('/login?redirect=/rfq/new');
      return;
    }

    const specsRecord: Record<string, string> = {};
    for (const s of specifications) {
      if (s.key.trim() && s.value.trim()) {
        specsRecord[s.key.trim()] = s.value.trim();
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          categoryId: categoryId || null,
          description,
          quantity: Number(quantity),
          unitOfMeasurement,
          targetPrice: targetPrice ? parseFloat(targetPrice) : null,
          currency,
          destinationCountry,
          requiredDeliveryDate: requiredDeliveryDate || null,
          specifications: specsRecord,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit RFQ');
      } else {
        router.push(`/buyer/rfqs/${data.rfq.id}`);
      }
    } catch {
      setError('Network communication failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b pb-6">
        <div className="inline-flex items-center space-x-1.5 text-brand-orange text-xs font-bold uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Global Sourcing Portal</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Submit Request for Quotation (RFQ)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tell verified global manufacturers what you need. Receive accurate pricing, MOQ terms, and sample timelines directly to your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* 1. Core Requirements */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">
            1. Product & Sourcing Specifications
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                RFQ Title / Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 500 Pcs Custom Active Noise Cancelling Bluetooth Headphones"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-brand-orange/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Target Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs outline-none bg-slate-50"
                >
                  <option value="">Select Relevant Industry Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Destination Country <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. United States, Germany, United Kingdom"
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Order Quantity <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border rounded-lg p-2.5 text-xs outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Unit of Measurement</label>
                <select
                  value={unitOfMeasurement}
                  onChange={(e) => setUnitOfMeasurement(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs outline-none bg-slate-50"
                >
                  <option value="Piece">Piece / Unit</option>
                  <option value="Carton">Carton</option>
                  <option value="Set">Set</option>
                  <option value="Metric Ton">Metric Ton</option>
                  <option value="Kilogram">Kilogram</option>
                  <option value="Meter">Meter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Target Unit Price (Optional)</label>
                <div className="flex rounded-lg border overflow-hidden">
                  <span className="bg-slate-100 px-3 py-2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 28.50"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full p-2 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Detailed Requirement & Scope <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Provide comprehensive details: material specifications, dimensions, certifications (CE, FCC, RoHS, ISO), custom branding requirements, sample prototype needs, packaging preferences..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-brand-orange/30"
              />
            </div>
          </div>
        </div>

        {/* 2. Custom Specifications Attributes */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-base font-bold text-slate-900">
              2. Technical Key-Value Parameters
            </h2>
            <button
              type="button"
              onClick={addSpecField}
              className="text-xs text-brand-orange font-bold flex items-center hover:text-orange-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Parameter
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {specifications.map((spec, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Parameter name (e.g. Material)"
                  value={spec.key}
                  onChange={(e) => updateSpecField(idx, 'key', e.target.value)}
                  className="flex-1 border rounded-lg p-2 text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Requirement (e.g. Beryllium Acoustic Drivers)"
                  value={spec.value}
                  onChange={(e) => updateSpecField(idx, 'value', e.target.value)}
                  className="flex-1 border rounded-lg p-2 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSpecField(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Note & Submit Button */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>
              Your RFQ is broadcast exclusively to audited, verified manufacturers meeting strict quality assurance standards.
            </span>
          </div>
          <Button
            type="submit"
            variant="brand"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto font-bold shadow-lg"
          >
            {isSubmitting ? 'Transmitting RFQ...' : 'Submit RFQ to Verified Suppliers'}
          </Button>
        </div>
      </form>
    </div>
  );
}
