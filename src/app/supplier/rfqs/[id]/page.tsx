'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Truck,
  Building2,
  AlertCircle,
  Plus,
  Send,
} from 'lucide-react';

export default function SupplierRfqDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;

  const [rfq, setRfq] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quote form state
  const [unitPrice, setUnitPrice] = useState<number>(30.0);
  const [currency, setCurrency] = useState('USD');
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(100);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [shippingEstimateCost, setShippingEstimateCost] = useState<number>(450.0);
  const [paymentTerms, setPaymentTerms] = useState('30% deposit upon order, 70% before delivery');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRfq = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/rfqs/${rfqId}`);
      if (res.ok) {
        const data = await res.json();
        setRfq(data.rfq);
        if (data.rfq) {
          setMinOrderQuantity(data.rfq.quantity || 100);
          if (data.rfq.targetPrice) setUnitPrice(Number(data.rfq.targetPrice));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (rfqId) loadRfq();
  }, [rfqId]);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rfqs/${rfqId}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitPrice: Number(unitPrice),
          currency,
          minOrderQuantity: Number(minOrderQuantity),
          leadTimeDays: Number(leadTimeDays),
          shippingEstimateCost: shippingEstimateCost ? Number(shippingEstimateCost) : null,
          paymentTerms,
          validUntil: new Date(validUntil).toISOString(),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit quotation');
      } else {
        setSuccessMessage('Your formal quotation was delivered to the buyer! They have been notified.');
        await loadRfq();
      }
    } catch {
      setError('Network communication failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading RFQ specifications...</div>;
  }

  if (!rfq) {
    return <div className="text-center py-16 text-slate-500 text-xs">RFQ not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/supplier/rfqs" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to RFQ Leads
        </Link>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
          Status: {rfq.status}
        </span>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Buyer Requirements Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950">{rfq.title}</h1>
            <div className="text-xs text-slate-500 mt-1">
              Destination: <strong className="text-slate-800">{rfq.destinationCountry}</strong> • Posted on {formatDate(rfq.createdAt)}
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="text-slate-400">Buyer Target Quantity</div>
            <div className="text-xl font-black text-brand-orange">
              {rfq.quantity} {rfq.unitOfMeasurement}s
            </div>
            {rfq.targetPrice && (
              <div className="text-[11px] text-slate-500">Target: ${rfq.targetPrice}/unit</div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed border-t pt-3">
          {rfq.description}
        </p>

        {rfq.specifications && Object.keys(rfq.specifications).length > 0 && (
          <div className="border-t pt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Parameters</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {Object.entries(rfq.specifications).map(([k, v]: any, i) => (
                <div key={i} className="bg-slate-50 p-2.5 rounded border">
                  <div className="text-[11px] text-slate-400 font-medium">{k}</div>
                  <div className="font-bold text-slate-800">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Quotation Form */}
      <form onSubmit={handleSubmitQuote} className="rounded-xl border bg-white p-6 shadow-sm space-y-5 text-xs">
        <h2 className="font-bold text-base text-slate-950 border-b pb-2 flex items-center">
          <Send className="w-4 h-4 mr-2 text-brand-orange" /> Manufacturer Commercial Proposal
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Quoted Unit Price ($ USD) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg p-2.5 text-xs outline-none font-bold text-brand-orange"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Min Order Quantity (MOQ) *</label>
            <input
              type="number"
              required
              value={minOrderQuantity}
              onChange={(e) => setMinOrderQuantity(parseInt(e.target.value) || 1)}
              className="w-full border rounded-lg p-2.5 text-xs outline-none font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Production Lead Time (Days) *</label>
            <input
              type="number"
              required
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
              className="w-full border rounded-lg p-2.5 text-xs outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Estimated Freight Cost ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={shippingEstimateCost}
              onChange={(e) => setShippingEstimateCost(parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg p-2.5 text-xs outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Quotation Valid Until *</label>
            <input
              type="date"
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-xs outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">Commercial Payment Terms</label>
          <input
            type="text"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full border rounded-lg p-2.5 text-xs outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">Factory Proposal Notes & Sourcing Capabilities</label>
          <textarea
            rows={4}
            placeholder="Describe your quality standards, ISO certificates, sample turnaround time, custom tooling support..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-2.5 text-xs outline-none"
          />
        </div>

        <div className="border-t pt-4 flex justify-end">
          <Button type="submit" variant="brand" size="lg" disabled={isSubmitting} className="font-bold shadow">
            {isSubmitting ? 'Submitting Quotation...' : 'Transmit Quotation to Buyer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
