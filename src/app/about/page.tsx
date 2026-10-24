import React from 'react';
import { ShieldCheck, Globe2, Award, Truck, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="border-b pb-6 text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 text-brand-orange text-xs font-bold uppercase tracking-wider">
          <Globe2 className="w-4 h-4" />
          <span>About TradeFlow</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
          Democratizing Global Wholesale Manufacturing
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          TradeFlow is an enterprise-grade B2B marketplace bridging the gap between vetted international factories and business buyers worldwide.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-slate-700 space-y-6 text-xs sm:text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900">Our Mission</h2>
        <p>
          Traditional cross-border procurement suffers from opaque pricing, middleman markups, communication bottlenecks, and unverified quality claims. TradeFlow redefines wholesale sourcing by offering direct manufacturer connectivity, real-time quantity tier calculations, transparent minimum order quantities (MOQ), and an end-to-end Request for Quotation (RFQ) workflow.
        </p>

        <h2 className="text-lg font-bold text-slate-900">The TradeFlow Advantage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
          <div className="p-4 rounded-xl border bg-white shadow-sm space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Third-Party Plant Audits</h3>
            <p className="text-xs text-slate-600">
              Suppliers must submit chamber of commerce documentation, ISO9001/ISO14001 audits, and export licenses before receiving the Gold Verified badge.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-white shadow-sm space-y-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">Live Tiered Pricing Engine</h3>
            <p className="text-xs text-slate-600">
              No hidden quotes. Clear volume brackets allow buyers to budget accurately with instant automated quantity calculations.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-white shadow-sm space-y-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Global Logistics Tracking</h3>
            <p className="text-xs text-slate-600">
              Integrated air, ocean, and express carrier consignment tracking keeps purchasing directors informed through every customs checkpoint.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-white shadow-sm space-y-2">
            <CheckCircle2 className="w-6 h-6 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">Transactional Order Snapshots</h3>
            <p className="text-xs text-slate-600">
              Permanent historical snapshots ensure contract compliance and dispute immunity even if live catalog specifications update later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
