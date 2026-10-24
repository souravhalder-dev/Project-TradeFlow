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
  ArrowRight,
} from 'lucide-react';

export default function BuyerRfqDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;

  const [rfq, setRfq] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadRfq = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/rfqs/${rfqId}`);
      if (res.ok) {
        const data = await res.json();
        setRfq(data.rfq);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (rfqId) loadRfq();
  }, [rfqId]);

  const handleAcceptQuote = async (quotationId: string) => {
    if (!confirm('Are you sure you want to accept this quotation from the manufacturer?')) return;
    setIsAccepting(true);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/rfqs/${rfqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptedQuotationId: quotationId }),
      });

      if (res.ok) {
        setActionSuccess('Quotation accepted! You can now proceed to finalize an order with this supplier.');
        await loadRfq();
      }
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading RFQ specifications...</div>;
  }

  if (!rfq) {
    return <div className="text-center py-16 text-slate-500 text-xs">RFQ not found.</div>;
  }

  const quotes = rfq.quotations || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/buyer/rfqs" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to My RFQs
        </Link>
        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
          rfq.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
          rfq.status === 'QUOTED' ? 'bg-blue-100 text-blue-800' :
          'bg-amber-100 text-amber-800'
        }`}>
          RFQ Status: {rfq.status}
        </span>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* RFQ Details Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950">{rfq.title}</h1>
            <div className="text-xs text-slate-400 mt-1">
              Category: <strong className="text-slate-700">{rfq.category?.name || 'General Wholesale'}</strong> • Posted on {formatDate(rfq.createdAt)}
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="text-slate-400">Target Order Quantity</div>
            <div className="text-lg font-black text-slate-900">
              {rfq.quantity} {rfq.unitOfMeasurement}s
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed border-t pt-3">
          {rfq.description}
        </p>

        {/* Specifications list */}
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

      {/* Quotations Comparison Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Submitted Manufacturer Quotations ({quotes.length})
            </h2>
            <p className="text-xs text-slate-500">Compare price tiers, lead times, and terms before accepting.</p>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-xs text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p>Your RFQ has been broadcast to verified suppliers. Bids will appear here as manufacturers respond.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote: any) => {
              const isAccepted = quote.status === 'ACCEPTED';

              return (
                <div
                  key={quote.id}
                  className={`rounded-xl border p-6 transition-all shadow-sm ${
                    isAccepted ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-300/20' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        {quote.business?.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="font-extrabold text-slate-950 text-base">{quote.business?.name}</span>
                        <span className="text-xs text-slate-400">({quote.business?.country})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Quotation validity: Until {formatDate(quote.validUntil)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Quoted Unit Price</div>
                      <div className="text-2xl font-black text-brand-orange">
                        {formatCurrency(quote.unitPrice, quote.currency)}
                      </div>
                      <div className="text-[11px] text-slate-500">MOQ: {quote.minOrderQuantity} units</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Production Lead Time:</span>
                      <strong className="text-slate-900">{quote.leadTimeDays} business days</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Shipping Cost Estimate:</span>
                      <strong className="text-slate-900">
                        {quote.shippingEstimateCost ? formatCurrency(quote.shippingEstimateCost, quote.currency) : 'Included / TBD'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Payment Terms:</span>
                      <strong className="text-slate-900">{quote.paymentTerms || '30% advance, 70% before delivery'}</strong>
                    </div>
                  </div>

                  {quote.notes && (
                    <div className="p-3 bg-slate-50 rounded-lg border text-xs text-slate-700 mb-4 leading-relaxed">
                      <strong>Supplier Proposal Notes:</strong> {quote.notes}
                    </div>
                  )}

                  {/* Accept or Accepted Badge */}
                  <div className="border-t pt-3 flex items-center justify-between">
                    <div>
                      {isAccepted ? (
                        <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Quotation Accepted
                        </span>
                      ) : quote.status === 'REJECTED' ? (
                        <span className="text-xs text-slate-400">Quotation Declined</span>
                      ) : (
                        <span className="text-xs text-slate-500">Status: {quote.status}</span>
                      )}
                    </div>

                    {!isAccepted && rfq.status !== 'ACCEPTED' && (
                      <Button
                        type="button"
                        variant="brand"
                        size="sm"
                        disabled={isAccepting}
                        onClick={() => handleAcceptQuote(quote.id)}
                        className="font-bold text-xs shadow"
                      >
                        Accept Quotation
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
