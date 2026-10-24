'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Package, Truck, ShieldCheck, Search, Filter } from 'lucide-react';

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/orders?view=buyer')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOrders =
    filterStatus === 'ALL'
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Wholesale Orders History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical snapshot preservation and logistics tracking for all commercial orders.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          {['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white border text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No orders found in this view</h3>
          <p className="text-xs text-slate-500">Orders placed via the wholesale catalog will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 text-xs">
                <div>
                  <span className="font-extrabold text-slate-950 text-sm mr-2">{order.orderNumber}</span>
                  <span className="text-slate-400">Placed on {formatDate(order.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                    order.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status}
                  </span>
                  <Link href={`/buyer/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs">
                      View Order Details
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2 text-xs">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{item.productName}</span>
                      <span className="text-slate-500 ml-2">
                        x{item.quantity} {item.unitOfMeasurement}s @ {formatCurrency(item.unitPrice, order.currency)}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900">
                      {formatCurrency(item.totalPrice, order.currency)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer info */}
              <div className="border-t pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  Supplier: <strong className="text-slate-800">{order.supplier?.name}</strong>
                  {order.shipments?.[0] && (
                    <span className="ml-3 text-blue-700 font-semibold">
                      Tracking: {order.shipments[0].carrier} - {order.shipments[0].trackingNumber}
                    </span>
                  )}
                </div>

                <div className="text-sm font-black text-slate-950">
                  Total Settlement: <span className="text-brand-orange">{formatCurrency(order.totalAmount, order.currency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
