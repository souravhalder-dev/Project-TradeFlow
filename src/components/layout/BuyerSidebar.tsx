'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  Heart,
  MapPin,
  Building,
} from 'lucide-react';

const buyerLinks = [
  { href: '/buyer/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/buyer/orders', label: 'My Orders', icon: Package },
  { href: '/buyer/rfqs', label: 'RFQ & Quotations', icon: FileText },
  { href: '/buyer/messages', label: 'Supplier Messages', icon: MessageSquare },
  { href: '/buyer/wishlist', label: 'Saved Products', icon: Heart },
  { href: '/buyer/profile', label: 'Company Profile', icon: Building },
];

export function BuyerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white min-h-[calc(100vh-8rem)] p-4 hidden md:block shrink-0">
      <div className="mb-6 px-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Buyer Operations
        </div>
      </div>

      <nav className="space-y-1">
        {buyerLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-50 text-brand-orange font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-brand-orange' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
