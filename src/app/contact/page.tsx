import React from 'react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="border-b pb-6 text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-950">Contact TradeFlow Enterprise Operations</h1>
        <p className="text-xs text-slate-500">Our commercial procurement and compliance team is available 24/7 across global time zones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
          <Mail className="w-5 h-5 text-brand-orange" />
          <div className="font-bold text-slate-900 text-sm">Enterprise Support</div>
          <div className="text-slate-500">support@tradeflow.local</div>
          <div className="text-slate-500">compliance@tradeflow.local</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
          <Phone className="w-5 h-5 text-emerald-600" />
          <div className="font-bold text-slate-900 text-sm">Direct Phone Inquiries</div>
          <div className="text-slate-500">+1 (800) 555-TRADE</div>
          <div className="text-slate-500">Mon - Fri: 24h Global Coverage</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <div className="font-bold text-slate-900 text-sm">Headquarters</div>
          <div className="text-slate-500">TradeFlow Technologies Inc.</div>
          <div className="text-slate-500">500 Howard Street, Suite 400, San Francisco, CA</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4 text-xs">
        <h2 className="font-bold text-sm text-slate-950 border-b pb-2">Direct Inquiry Form</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
            <input type="text" placeholder="Marcus Vance" className="w-full border rounded-lg p-2.5 outline-none" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Email</label>
            <input type="email" placeholder="procurement@company.com" className="w-full border rounded-lg p-2.5 outline-none" />
          </div>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Inquiry Topic</label>
          <select className="w-full border rounded-lg p-2.5 outline-none bg-slate-50">
            <option>Supplier Verification & Auditing</option>
            <option>Enterprise Buyer High-Volume Contract</option>
            <option>Cross-Border Customs Clearance</option>
            <option>Platform Bug or API Integration</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Message</label>
          <textarea rows={4} placeholder="Describe your inquiry..." className="w-full border rounded-lg p-2.5 outline-none" />
        </div>
        <Button variant="brand" size="lg" className="font-bold shadow">
          Send Inquiries
        </Button>
      </div>
    </div>
  );
}
