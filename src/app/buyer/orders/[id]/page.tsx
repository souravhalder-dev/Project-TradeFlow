'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Package,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ChevronLeft,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function BuyerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId]);

  const handleSimulatePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'PAID', note: 'Payment settled via Stripe Sandbox Test Mode' }),
      });
      if (res.ok) {
        await loadOrder();
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <Link href="/buyer/orders">
          <Button variant="outline" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const statusSteps = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/buyer/orders" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Orders
        </Link>
        <span className="text-xs font-semibold text-slate-500">
          Order ID: <strong className="text-slate-900">{order.orderNumber}</strong>
        </span>
      </div>

      {/* Order Status Progress Tracker */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-extrabold text-base text-slate-900">Fulfillment Pipeline Timeline</h2>
          <span className="bg-brand-orange/10 text-brand-orange font-bold text-xs px-3 py-1 rounded-full">
            Status: {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center text-xs">
          {statusSteps.map((st, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={st} className="space-y-1.5 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isCompleted ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className={`font-bold ${isCurrent ? 'text-brand-orange' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                  {st}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action for PENDING: Instant Sandbox Payment Simulator */}
        {order.status === 'PENDING' && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-amber-900">
              <strong className="block font-bold">Simulate Payment (Sandbox Test Mode):</strong>
              Order is awaiting payment verification. Click below to simulate instant payment authorization.
            </div>
            <Button
              type="button"
              variant="brand"
              size="sm"
              disabled={isProcessingPayment}
              onClick={handleSimulatePayment}
              className="font-bold shadow shrink-0"
            >
              {isProcessingPayment ? 'Authorizing...' : 'Authorize Sandbox Payment'}
            </Button>
          </div>
        )}
      </div>

      {/* Carrier & Shipment Tracking Info */}
      {order.shipments?.length > 0 && (
        <div className="rounded-xl border bg-blue-50/60 border-blue-200 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
            <Truck className="w-5 h-5 text-blue-700" />
            <span>Active Consignment Tracking</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-blue-950">
            <div>
              <div className="text-blue-600 font-medium text-[11px]">Freight Carrier</div>
              <div className="font-bold">{order.shipments[0].carrier}</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium text-[11px]">Waybill / Tracking Number</div>
              <div className="font-extrabold">{order.shipments[0].trackingNumber}</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium text-[11px]">Consignment Status</div>
              <div className="font-bold text-emerald-700">{order.shipments[0].status}</div>
            </div>
          </div>
          {order.shipments[0].notes && (
            <div className="text-xs text-blue-800 bg-white/60 p-2.5 rounded border border-blue-200">
              Note: {order.shipments[0].notes}
            </div>
          )}
        </div>
      )}

      {/* Order Items Snapshot Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b bg-slate-50/50">
          <h2 className="font-bold text-sm text-slate-900">Preserved Order Item Snapshots</h2>
          <p className="text-xs text-slate-500">Guaranteed pricing and product specifications captured at checkout time.</p>
        </div>

        <div className="divide-y text-xs">
          {order.items?.map((it: any) => (
            <div key={it.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900 text-sm">{it.productName}</div>
                <div className="text-slate-500 text-xs mt-0.5">
                  SKU: {it.productSku || 'Standard'} • Quantity: {it.quantity} {it.unitOfMeasurement}s @ {formatCurrency(it.unitPrice, order.currency)}
                </div>
              </div>
              <div className="text-base font-extrabold text-slate-950">
                {formatCurrency(it.totalPrice, order.currency)}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Subtotal Breakdown */}
        <div className="bg-slate-50 p-5 border-t space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">{formatCurrency(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Commercial Freight</span>
            <span className="font-bold text-slate-900">{formatCurrency(order.shippingCost, order.currency)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-950 pt-2 border-t">
            <span>Total Settlement</span>
            <span className="text-brand-orange text-xl font-black">{formatCurrency(order.totalAmount, order.currency)}</span>
          </div>
        </div>
      </div>

      {/* Destination & Supplier Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center text-sm">
            <MapPin className="w-4 h-4 mr-2 text-brand-orange" /> Delivery Consignee Destination
          </h3>
          <div className="text-slate-700 leading-relaxed">
            <div className="font-bold">{order.address?.contactName}</div>
            {order.address?.companyName && <div>{order.address?.companyName}</div>}
            <div>{order.address?.addressLine1}</div>
            <div>{order.address?.city}, {order.address?.state} {order.address?.postalCode}</div>
            <div>{order.address?.country}</div>
            <div className="mt-1 text-slate-500">Phone: {order.address?.phone}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center text-sm">
            <ShieldCheck className="w-4 h-4 mr-2 text-amber-500" /> Sourcing Manufacturer
          </h3>
          <div className="text-slate-700 leading-relaxed">
            <div className="font-bold text-sm text-slate-950">{order.supplier?.name}</div>
            <div>{order.supplier?.city ? `${order.supplier?.city}, ` : ''}{order.supplier?.country}</div>
            <div className="text-emerald-700 font-semibold mt-1">Verified Gold Manufacturer</div>
            <div className="mt-3">
              <Link href={`/suppliers/${order.supplier?.slug}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  View Supplier Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
