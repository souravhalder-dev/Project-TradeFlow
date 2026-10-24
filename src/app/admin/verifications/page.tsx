'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, FileText, Check, Clock } from 'lucide-react';

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal review state
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch verifications from internal query or endpoint
      const res = await fetch('/api/admin/verifications');
      if (res.ok) {
        const d = await res.json();
        setVerifications(d.verifications || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (status: 'APPROVED' | 'REJECTED' | 'ADDITIONAL_DOCS_REQUIRED') => {
    if (!selectedVerification) return;
    setIsUpdating(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/verifications/${selectedVerification.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewerNotes: decisionNotes,
        }),
      });

      if (res.ok) {
        setActionMessage(`Verification status updated to ${status}`);
        setTimeout(() => {
          setSelectedVerification(null);
          setActionMessage(null);
          loadData();
        }, 1500);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update verification status');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center">
          <ShieldCheck className="w-7 h-7 mr-3 text-emerald-400" />
          <span>Manufacturer Verification Applications</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review business registration licenses, tax certifications, and on-site factory quality management reports.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading applications...</div>
      ) : verifications.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center text-xs text-slate-400">
          No supplier verification applications requiring immediate review.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800 text-xs">
          {verifications.map((item) => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-white text-sm">{item.business?.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'APPROVED' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' :
                    item.status === 'PENDING' ? 'bg-amber-900/60 text-amber-300 border border-amber-700' :
                    'bg-rose-900/60 text-rose-300 border border-rose-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Country: <strong>{item.business?.country}</strong> • Submitted: {formatDate(item.createdAt)}
                </div>
                {item.reviewerNotes && (
                  <div className="text-slate-300 text-[11px] mt-1 italic">
                    Notes: {item.reviewerNotes}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedVerification(item);
                  setDecisionNotes(item.reviewerNotes || '');
                }}
                className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold text-xs"
              >
                Inspect & Decide
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Review & Decision Modal */}
      <Modal
        isOpen={Boolean(selectedVerification)}
        onClose={() => setSelectedVerification(null)}
        title="Audit Supplier Verification Application"
        description={selectedVerification ? `Auditing ${selectedVerification.business?.name}` : ''}
      >
        {actionMessage ? (
          <div className="text-center py-6 space-y-2 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="font-bold text-sm text-slate-900">{actionMessage}</div>
          </div>
        ) : selectedVerification && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
              <div>Legal Entity: <strong>{selectedVerification.business?.legalName || selectedVerification.business?.name}</strong></div>
              <div>Registration Number: <strong>{selectedVerification.business?.registrationNumber || 'CN-Verified'}</strong></div>
              <div>Country / Origin: <strong>{selectedVerification.business?.country}</strong></div>
              <div>License Document: <a href={selectedVerification.businessLicenseUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Preview PDF</a></div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Auditor Compliance Notes</label>
              <textarea
                rows={3}
                placeholder="Enter audit remarks, verification references, or reason for requesting additional documents..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                type="button"
                variant="brand"
                size="sm"
                disabled={isUpdating}
                onClick={() => handleDecision('APPROVED')}
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Approve (Gold)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUpdating}
                onClick={() => handleDecision('ADDITIONAL_DOCS_REQUIRED')}
                className="font-bold border-amber-300 text-amber-800 bg-amber-50"
              >
                Request Docs
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isUpdating}
                onClick={() => handleDecision('REJECTED')}
                className="font-bold"
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
