'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Users,
  Package,
  FileText,
  DollarSign,
  AlertTriangle,
  History,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const stats = data?.stats;
  const auditLogs = data?.auditLogs || [];

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Marketplace Governance & Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            TradeFlow Administration Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Full compliance oversight, supplier certification reviews, listing moderation, and audit surveillance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/admin/verifications">
            <Button variant="brand" size="sm" className="font-bold">
              Review Verifications ({stats?.pendingVerifications || 0})
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800">
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalUsers || 3}</div>
          <div className="text-[11px] text-slate-500 mt-1">Buyers, Suppliers & Admins</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Manufacturers</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalSuppliers || 3}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Audited manufacturing plants</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Published Listings</span>
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalProducts || 4}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 6 industry categories</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform GMV Volume</span>
            <DollarSign className="w-5 h-5 text-brand-orange" />
          </div>
          <div className="text-3xl font-black text-brand-orange">
            {formatCurrency(stats?.totalGmv || 6750)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{stats?.totalOrders || 1} wholesale order(s)</div>
        </div>
      </div>

      {/* Compliance Surveillance Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div>
            <h2 className="font-bold text-sm text-white flex items-center">
              <History className="w-4 h-4 mr-2 text-indigo-400" /> Privileged Operation Audit Logs
            </h2>
            <p className="text-xs text-slate-400">Chronological immutable audit log of administrative actions</p>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Audit logging engine active. Privileged events will be recorded here.
          </div>
        ) : (
          <div className="divide-y divide-slate-800 text-xs">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                <div>
                  <div className="font-extrabold text-indigo-300 text-xs">{log.action}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Target: <strong className="text-slate-200">{log.entityType}</strong> {log.entityId && `(${log.entityId.slice(0, 8)}...)`}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <div>By: <strong className="text-slate-300">{log.user?.name || log.user?.email || 'System'}</strong></div>
                  <div>{formatDateTime(log.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
