'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Package,
  PlusCircle,
  Truck,
  FileText,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

export default function SupplierDashboardPage() {
  const { user, fetchUser } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    Promise.all([
      fetch('/api/orders?view=supplier').then((r) => r.json()),
      fetch('/api/rfqs?scope=marketplace').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([ordersData, rfqsData, productsData]) => {
        if (ordersData.orders) setOrders(ordersData.orders);
        if (rfqsData.rfqs) setRfqs(rfqsData.rfqs);
        if (productsData.products) setProducts(productsData.products);
      })
      .finally(() => setIsLoading(false));
  }, [fetchUser]);

  const supplierBusiness = user?.businesses?.[0];
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const pendingOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'PROCESSING');

  return (
    <div className="space-y-8">
      {/* Supplier Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Manufacturer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            {supplierBusiness?.name || 'Apex Global Electronics Ltd.'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage product listings, respond to RFQ procurement leads, and fulfill wholesale orders.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/supplier/products/new">
            <Button variant="brand" size="sm" className="font-bold">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Publish New Product
            </Button>
          </Link>
          <Link href="/supplier/verification">
            <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Verification Status
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Sales</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(totalRevenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Lifetime fulfilled orders</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Orders to Dispatch</span>
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingOrders.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for freight booking</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live RFQ Leads</span>
            <FileText className="w-5 h-5 text-brand-orange" />
          </div>
          <div className="text-2xl font-black text-slate-900">{rfqs.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Available for formal quote</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit Status</span>
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-base font-extrabold text-emerald-700 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Gold Verified
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tier-1 On-Site Inspection</div>
        </div>
      </div>

      {/* Orders Dispatch Queue */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Incoming Wholesale Orders Queue</h2>
            <p className="text-xs text-slate-500">Provide freight tracking numbers and update fulfillment</p>
          </div>
          <Link href="/supplier/orders" className="text-xs font-bold text-brand-orange hover:text-orange-700 flex items-center">
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No incoming orders yet.</div>
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
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Buyer: <strong className="text-slate-700">{order.buyer?.name}</strong> • Destination: {order.address?.city}, {order.address?.country}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">{formatCurrency(order.totalAmount, order.currency)}</div>
                    <div className="text-[11px] text-slate-400">{order.items?.length || 1} line item(s)</div>
                  </div>
                  <Link href={`/supplier/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs">
                      Fulfill Order
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fresh RFQ Opportunities */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Procurement RFQs Ready for Quotes</h2>
            <p className="text-xs text-slate-500">Submit competitive quotes to close high-volume enterprise contracts</p>
          </div>
          <Link href="/supplier/rfqs" className="text-xs font-bold text-brand-orange hover:text-orange-700 flex items-center">
            <span>Explore All Leads</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {rfqs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No open RFQs at this moment.</div>
        ) : (
          <div className="divide-y text-xs">
            {rfqs.slice(0, 5).map((rfq) => (
              <div key={rfq.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 text-sm line-clamp-1">{rfq.title}</div>
                  <div className="text-slate-500 mt-1 flex items-center space-x-3 text-xs">
                    <span>Target Qty: <strong>{rfq.quantity} {rfq.unitOfMeasurement}s</strong></span>
                    <span>•</span>
                    <span>Destination: <strong>{rfq.destinationCountry}</strong></span>
                  </div>
                </div>

                <Link href={`/supplier/rfqs/${rfq.id}`}>
                  <Button variant="brand" size="sm" className="font-bold text-xs">
                    Submit Quotation
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
