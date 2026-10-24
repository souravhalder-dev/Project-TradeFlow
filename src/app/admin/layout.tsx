import React from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-[calc(100vh-8rem)]">
      <AdminSidebar />
      <div className="flex-1 p-6 sm:p-10 max-w-7xl overflow-x-hidden text-slate-100">{children}</div>
    </div>
  );
}
