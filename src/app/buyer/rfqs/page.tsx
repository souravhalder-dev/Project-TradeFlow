'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileText, Plus, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export default function BuyerRfqsPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rfqs?scope=my')
      .then((res) => res.json())
      .then((data) => {
        if (data.rfqs) setRfqs(data.rfqs);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            My RFQs & Quotations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage custom OEM/ODM requests and compare incoming quotations from verified manufacturers.
          </p>
        </div>

        <Link href="/rfq/new">
          <Button variant="brand" size="sm" className="font-bold">
            <Plus className="w-4 h-4 mr-1.5" /> Post New RFQ
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading RFQs...</div>
      ) : rfqs.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No RFQs posted yet</h3>
          <p className="text-xs text-slate-500">Post your custom manufacturing requirements to receive factory quotations.</p>
          <Link href="/rfq/new" className="inline-block pt-2">
            <Button variant="brand" size="sm">Create First RFQ</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="rounded-xl border bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 text-xs">
                <div>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold mr-2 ${
                    rfq.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                    rfq.status === 'QUOTED' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {rfq.status}
                  </span>
                  <span className="text-slate-400">Created on {formatDate(rfq.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="bg-amber-50 text-amber-900 border border-amber-200 font-bold px-2.5 py-0.5 rounded text-xs">
                    {rfq._count?.quotations || 0} Quotations Received
                  </span>
                  <Link href={`/buyer/rfqs/${rfq.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs">
                      Compare Quotes
                    </Button>
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 mb-1">{rfq.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{rfq.description}</p>
              </div>

              <div className="border-t pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center space-x-4">
                  <span>Target Qty: <strong className="text-slate-800">{rfq.quantity} {rfq.unitOfMeasurement}s</strong></span>
                  {rfq.targetPrice && <span>Target Price: <strong className="text-slate-800">${rfq.targetPrice}</strong></span>}
                  <span>Destination: <strong className="text-slate-800">{rfq.destinationCountry}</strong></span>
                </div>

                <div className="text-brand-orange font-bold flex items-center">
                  <span>View Details & Quotation Bids</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
