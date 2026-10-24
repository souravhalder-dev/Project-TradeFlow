'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle, FileText, UploadCloud } from 'lucide-react';

export default function SupplierVerificationPage() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<string>('APPROVED');
  const [licenseUrl, setLicenseUrl] = useState('https://tradeflow-docs.storage/licenses/apex_license.pdf');
  const [reviewerNotes, setReviewerNotes] = useState(
    'Verified onsite audit report and official chamber of commerce registration. Approved for Tier-1 Gold Supplier status.'
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="border-b pb-4">
        <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Manufacturer Authentication & Auditing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
          Supplier Business Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verified manufacturers earn the Gold Supplier badge, priority search placement, and direct RFQ bidding privileges.
        </p>
      </div>

      {/* Verification Status Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-bold text-sm text-slate-900">Current Verification Status</h2>
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs px-3 py-1 rounded-full flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>APPROVED — Gold Verified Supplier</span>
          </span>
        </div>

        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            Your business registration documents and on-site factory audit report have been verified by TradeFlow Compliance Officers.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border text-slate-700">
            <strong className="block text-slate-900 mb-0.5">Auditor Notes:</strong>
            {reviewerNotes}
          </div>
        </div>
      </div>

      {/* Uploaded Documents List (Secured) */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4 text-xs">
        <h2 className="font-bold text-sm text-slate-900 border-b pb-2">
          Submitted Verification Documents
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-brand-orange" />
              <div>
                <div className="font-bold text-slate-800">Official Business License & Tax Certificate</div>
                <div className="text-[11px] text-slate-400">Verified Chamber of Commerce Registration</div>
              </div>
            </div>
            <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-800">ISO9001:2015 & ISO14001 Quality Management Audits</div>
                <div className="text-[11px] text-slate-400">Third-Party On-Site Facility Inspection</div>
              </div>
            </div>
            <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
