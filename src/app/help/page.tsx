import React from 'react';
import { HelpCircle, ChevronRight, ShieldCheck, Truck, CreditCard, FileText } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How does the Request for Quotation (RFQ) process work?',
      a: 'Buyers post detailed requirements including specifications, target price, quantity, and destination. Relevant verified manufacturers review the RFQ and submit competitive quotations with custom price tiers and lead times. The buyer can review and accept the winning quote to generate a confirmed order.',
    },
    {
      q: 'What is Minimum Order Quantity (MOQ) and why is it enforced?',
      a: 'MOQ is the minimum production batch size a factory requires to run its machinery efficiently. TradeFlow strictly enforces MOQ server-side to guarantee industrial wholesale pricing. Buyers can also request single-unit prototypes via the "Sample Available" option.',
    },
    {
      q: 'How are verified suppliers audited?',
      a: 'TradeFlow compliance officers review certified business registration certificates, export authorizations, on-site third-party plant audits (ISO9001/ISO14001), and lab test certifications (CE, FCC, RoHS) before approving Gold Verified status.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support Stripe Sandbox for instant developer test authorization, commercial credit cards with 3D Secure, and bank wire transfers (TT) with pro-forma commercial invoices.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="border-b pb-6 text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-950 flex items-center justify-center">
          <HelpCircle className="w-8 h-8 mr-2 text-brand-orange" />
          <span>Help Center & Knowledge Base</span>
        </h1>
        <p className="text-xs text-slate-500">Everything you need to know about sourcing, manufacturing, and order fulfillment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <Link href="/rfq/new" className="p-4 rounded-xl border bg-white shadow-sm hover:border-brand-orange transition-colors flex items-center space-x-3">
          <FileText className="w-6 h-6 text-brand-orange shrink-0" />
          <div>
            <div className="font-bold text-slate-900">RFQ Sourcing Guide</div>
            <div className="text-slate-400">How to draft effective specs</div>
          </div>
        </Link>
        <Link href="/suppliers" className="p-4 rounded-xl border bg-white shadow-sm hover:border-brand-orange transition-colors flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold text-slate-900">Verification Criteria</div>
            <div className="text-slate-400">On-site factory inspection</div>
          </div>
        </Link>
        <Link href="/about" className="p-4 rounded-xl border bg-white shadow-sm hover:border-brand-orange transition-colors flex items-center space-x-3">
          <Truck className="w-6 h-6 text-blue-600 shrink-0" />
          <div>
            <div className="font-bold text-slate-900">Freight & Logistics</div>
            <div className="text-slate-400">Incoterms and air/sea dispatch</div>
          </div>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-950">Frequently Asked Sourcing Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border bg-white p-5 shadow-sm space-y-2 text-xs">
              <h3 className="font-extrabold text-sm text-slate-900">{faq.q}</h3>
              <p className="text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
