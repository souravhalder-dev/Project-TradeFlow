'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Package,
  FileText,
  CreditCard,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function BuyerDashboardPage() {
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    Promise.all([
      fetch('/api/orders?view=buyer').then((r) => r.json()),
      fetch('/api/rfqs?scope=my').then((r) => r.json()),
    ])
      .then(([orderData, rfqData]) => {
        if (orderData.orders) setOrders(orderData.orders);
        if (rfqData.rfqs) setRfqs(rfqData.rfqs);
      })
      .finally(() => setIsLoading(false));
  }, [fetchUser]);

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const openRfqsCount = rfqs.filter((r) => r.status === 'OPEN' || r.status === 'QUOTED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Commercial Buyer Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <strong className="text-slate-800">{user?.name || 'Authorized Buyer'}</strong> ({user?.profile?.companyName || 'Global Merchandising Partners Inc.'})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/rfq/new">
            <Button variant="brand" size="sm" className="font-bold">
              + Post New RFQ
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="sm">
              Source Products
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Orders</span>
            <Package className="w-5 h-5 text-brand-orange" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeOrdersCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">In fulfillment pipeline</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Open RFQs</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{openRfqsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Collecting manufacturer bids</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Sourced GMV</span>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(totalSpent)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across verified suppliers</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Buyer Status</span>
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-base font-extrabold text-emerald-700 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Verified Enterprise
          </div>
          <div className="text-[11px] text-slate-400 mt-1">TradeFlow Escrow Protected</div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Recent Sourcing Orders</h2>
            <p className="text-xs text-slate-500">Track shipments, dispatch timelines, and payments</p>
          </div>
          <Link href="/buyer/orders" className="text-xs font-bold text-brand-orange hover:text-orange-700 flex items-center">
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No orders placed yet.</div>
        ) : (
          <div className="divide-y text-xs">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Supplier: <strong className="text-slate-700">{order.supplier?.name}</strong> • Placed on {formatDate(order.createdAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </div>
                    <div className="text-[11px] text-slate-400">{order.items?.length || 1} line item(s)</div>
                  </div>
                  <Link href={`/buyer/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active RFQ Opportunities Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Your Active RFQs & Quotations</h2>
            <p className="text-xs text-slate-500">Compare incoming bids from verified manufacturers</p>
          </div>
          <Link href="/buyer/rfqs" className="text-xs font-bold text-brand-orange hover:text-orange-700 flex items-center">
            <span>View All RFQs</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {rfqs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active RFQs. Submit your custom manufacturing specifications anytime.
          </div>
        ) : (
          <div className="divide-y text-xs">
            {rfqs.slice(0, 5).map((rfq) => (
              <div key={rfq.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 text-sm line-clamp-1">{rfq.title}</div>
                  <div className="text-slate-500 mt-1 flex items-center space-x-3 text-xs">
                    <span>Target Quantity: <strong>{rfq.quantity} {rfq.unitOfMeasurement}s</strong></span>
                    <span>•</span>
                    <span>Destination: <strong>{rfq.destinationCountry}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-0.5 rounded text-[11px]">
                      {rfq._count?.quotations || 0} Quotations Received
                    </span>
                  </div>
                  <Link href={`/buyer/rfqs/${rfq.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs">
                      Review Quotes
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
