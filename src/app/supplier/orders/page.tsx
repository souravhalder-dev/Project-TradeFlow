'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Truck, Package, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders?view=supplier')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
          Incoming Wholesale Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review buyer orders, update fulfillment statuses, and submit carrier consignment tracking.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-xs text-slate-400">
          No incoming buyer orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                    order.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status}
                  </span>
                  <Link href={`/supplier/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs">
                      Fulfill Order
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2 text-xs">
                {order.items?.map((item: any) => (
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

              {/* Destination & Total */}
              <div className="border-t pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  Consignee: <strong className="text-slate-800">{order.buyer?.name}</strong> • Destination: {order.address?.city}, {order.address?.country}
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
