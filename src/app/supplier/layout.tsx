import React from 'react';
import { SupplierSidebar } from '@/components/layout/SupplierSidebar';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-8rem)]">
      <SupplierSidebar />
      <div className="flex-1 p-6 sm:p-10 max-w-7xl overflow-x-hidden">{children}</div>
    </div>
  );
}
