'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Truck,
  CheckCircle2,
  ChevronLeft,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function SupplierOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dispatch form state
  const [carrier, setCarrier] = useState('DHL Express Worldwide');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [note, setNote] = useState('Export customs clearance completed. Package in transit.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SHIPPED',
          carrier,
          trackingNumber: trackingNumber || `AWB-${Date.now().toString().slice(-8)}`,
          trackingUrl,
          note,
        }),
      });

      if (res.ok) {
        setSuccessMessage('Consignment marked as dispatched and tracking information transmitted to buyer!');
        await loadOrder();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-16 text-slate-400 text-xs">Loading order...</div>;
  if (!order) return <div className="text-center py-16 text-slate-500 text-xs">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/supplier/orders" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Incoming Orders
        </Link>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
          Status: {order.status}
        </span>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Order Summary & Consignee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
          <h2 className="font-bold text-sm text-slate-900 border-b pb-2">Wholesale Order {order.orderNumber}</h2>
          <div>Placed on: <strong>{formatDate(order.createdAt)}</strong></div>
          <div>Buyer: <strong>{order.buyer?.name}</strong> ({order.buyer?.email})</div>
          <div>Total Settlement: <strong className="text-brand-orange font-black text-sm">{formatCurrency(order.totalAmount, order.currency)}</strong></div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
          <h2 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-brand-orange" /> Delivery Consignee Destination
          </h2>
          <div><strong>{order.address?.contactName}</strong> ({order.address?.companyName || 'N/A'})</div>
          <div>{order.address?.addressLine1}</div>
          <div>{order.address?.city}, {order.address?.state} {order.address?.postalCode}</div>
          <div>{order.address?.country} • Phone: {order.address?.phone}</div>
        </div>
      </div>

      {/* Line items snapshot */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden text-xs">
        <div className="p-4 bg-slate-50 border-b font-bold text-slate-800">
          Order Consignment Items
        </div>
        <div className="divide-y">
          {order.items?.map((it: any) => (
            <div key={it.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">{it.productName}</div>
                <div className="text-slate-500">
                  Quantity: {it.quantity} {it.unitOfMeasurement}s @ {formatCurrency(it.unitPrice, order.currency)}
                </div>
              </div>
              <div className="font-black text-slate-950 text-sm">{formatCurrency(it.totalPrice, order.currency)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fulfillment Dispatch Form */}
      {order.status !== 'SHIPPED' && order.status !== 'DELIVERED' ? (
        <form onSubmit={handleDispatch} className="rounded-xl border bg-white p-6 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-base text-slate-950 border-b pb-2 flex items-center">
            <Truck className="w-4 h-4 mr-2 text-brand-orange" /> Dispatch Freight Consignment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Carrier / Logistics Provider *</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs bg-slate-50 outline-none"
              >
                <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                <option value="FedEx International Priority">FedEx International Priority</option>
                <option value="UPS Worldwide Expedited">UPS Worldwide Expedited</option>
                <option value="Maersk Ocean Cargo">Maersk Ocean Cargo (FCL / LCL)</option>
                <option value="Cosco Air Freight">Cosco Air Freight</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Tracking Number / Air Waybill *</label>
              <input
                type="text"
                required
                placeholder="e.g. DHL-8492019482"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Dispatch Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-xs outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="brand" size="lg" disabled={isSubmitting} className="font-bold shadow">
              {isSubmitting ? 'Confirming Dispatch...' : 'Confirm Freight Dispatch & Notify Buyer'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-2">
          <div className="font-bold text-sm flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Consignment Dispatched
          </div>
          {order.shipments?.[0] && (
            <div>
              Carrier: <strong>{order.shipments[0].carrier}</strong> • Tracking Number: <strong>{order.shipments[0].trackingNumber}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
