'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, ShieldCheck, MapPin, Box } from 'lucide-react';

export default function SupplierRfqsPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rfqs?scope=marketplace')
      .then((res) => res.json())
      .then((data) => {
        if (data.rfqs) setRfqs(data.rfqs);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
          Global RFQ Procurement Opportunities
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct factory sourcing requests broadcast from verified international commercial buyers.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading open RFQs...</div>
      ) : rfqs.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-xs text-slate-400">
          No live buyer RFQs available right now.
        </div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="rounded-xl border bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b pb-3 text-xs">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 mb-1">{rfq.title}</h3>
                  <div className="text-slate-500 flex items-center space-x-3">
                    <span>Category: <strong className="text-slate-700">{rfq.category?.name || 'General'}</strong></span>
                    <span>•</span>
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-0.5 text-slate-400" /> Destination: <strong className="text-slate-800 ml-1">{rfq.destinationCountry}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">Requested Quantity</div>
                  <div className="text-xl font-black text-brand-orange">
                    {rfq.quantity} {rfq.unitOfMeasurement}s
                  </div>
                  {rfq.targetPrice && (
                    <div className="text-[11px] text-slate-500">Target: ${rfq.targetPrice}/unit</div>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {rfq.description}
              </p>

              <div className="border-t pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Posted on {formatDate(rfq.createdAt)} • ({rfq._count?.quotations || 0} Quotes Received)
                </span>

                <Link href={`/supplier/rfqs/${rfq.id}`}>
                  <Button variant="brand" size="sm" className="font-bold text-xs shadow">
                    Submit Quotation
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
