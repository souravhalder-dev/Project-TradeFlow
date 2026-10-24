'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Package,
  Truck,
  AlertTriangle,
  History,
  Settings,
} from 'lucide-react';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
  { href: '/admin/verifications', label: 'Supplier Audits', icon: ShieldCheck },
  { href: '/admin/users', label: 'User Directory', icon: Users },
  { href: '/admin/products', label: 'Product Moderation', icon: Package },
  { href: '/admin/orders', label: 'Order Surveillance', icon: Truck },
  { href: '/admin/reports', label: 'Abuse Reports', icon: AlertTriangle },
  { href: '/admin/audit-logs', label: 'System Audit Logs', icon: History },
  { href: '/admin/settings', label: 'Platform Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-slate-900 text-slate-300 min-h-[calc(100vh-8rem)] p-4 hidden md:block shrink-0">
      <div className="mb-6 px-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Platform Governance
        </div>
      </div>

      <nav className="space-y-1">
        {adminLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
