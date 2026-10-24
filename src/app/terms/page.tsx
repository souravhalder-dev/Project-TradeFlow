import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-6 text-xs text-slate-700 leading-relaxed">
      <div className="border-b pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Terms of Service & Commercial Conditions</h1>
        <p className="text-slate-400 mt-1">Effective October 2026 • TradeFlow B2B Wholesale Marketplace</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">1. Commercial Buyer & Supplier Relationship</h2>
        <p>
          TradeFlow provides the technological platform connecting commercial buyers and verified manufacturers. Prices and order totals are calculated and validated strictly server-side using quantity-based tier structures and minimum order quantities.
        </p>

        <h2 className="text-sm font-bold text-slate-900">2. Transactional Order Snapshots</h2>
        <p>
          When an order is created, an immutable snapshot of all product specifications, SKUs, and unit prices is stored in the database. Subsequent edits to products by suppliers do not alter historical contracts.
        </p>

        <h2 className="text-sm font-bold text-slate-900">3. Request for Quotations (RFQ) & Quotation Validity</h2>
        <p>
          Quotations submitted by suppliers remain legally binding for the stated validity duration. Accepted quotations allow the buyer to convert the specifications directly into an enforceable wholesale purchase order.
        </p>

        <h2 className="text-sm font-bold text-slate-900">4. Payment & Development Sandboxes</h2>
        <p>
          Development instances operate under explicit sandbox payment states. No real cross-border escrow or settlement claims are executed outside production integrations.
        </p>
      </div>
    </div>
  );
}
