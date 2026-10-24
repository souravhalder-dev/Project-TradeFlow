import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-6 text-xs text-slate-700 leading-relaxed">
      <div className="border-b pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Privacy & Data Governance Policy</h1>
        <p className="text-slate-400 mt-1">Last updated: October 2026 • TradeFlow Compliance Standard</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">1. Information We Collect</h2>
        <p>
          TradeFlow collects corporate identity, business registration documents, VAT/tax numbers, and commercial transaction records necessary to verify supplier legitimacy and prevent industrial procurement fraud.
        </p>

        <h2 className="text-sm font-bold text-slate-900">2. Security of Supplier Verification Documents</h2>
        <p>
          Private business licenses, factory inspection audits, and financial certificates submitted during the supplier verification process are stored in access-restricted object storage and accessible only by authorized compliance review officers. They are never exposed on public supplier profiles.
        </p>

        <h2 className="text-sm font-bold text-slate-900">3. Authentication & Security</h2>
        <p>
          Authentication tokens are verified cryptographically via Firebase Authentication on protected server operations. Session cookies are secured with HTTP-Only, Secure, and SameSite attributes.
        </p>
      </div>
    </div>
  );
}
