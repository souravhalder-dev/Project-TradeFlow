'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FileText,
  Truck,
  ShieldCheck,
  Building2,
  BarChart3,
} from 'lucide-react';

const supplierLinks = [
  { href: '/supplier/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/supplier/products', label: 'Product Catalog', icon: Package },
  { href: '/supplier/products/new', label: 'Add New Product', icon: PlusCircle },
  { href: '/supplier/orders', label: 'Incoming Orders', icon: Truck },
  { href: '/supplier/rfqs', label: 'RFQ Opportunities', icon: FileText },
  { href: '/supplier/verification', label: 'Business Verification', icon: ShieldCheck },
  { href: '/supplier/profile', label: 'Company Profile', icon: Building2 },
  { href: '/supplier/analytics', label: 'Sales Analytics', icon: BarChart3 },
];

export function SupplierSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white min-h-[calc(100vh-8rem)] p-4 hidden md:block shrink-0">
      <div className="mb-6 px-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Manufacturer Portal
        </div>
      </div>

      <nav className="space-y-1">
        {supplierLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
