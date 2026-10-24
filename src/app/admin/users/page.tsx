'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Users, Shield, UserX, UserCheck, AlertTriangle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleSuspension = async (userId: string, currentSuspended: boolean) => {
    const reason = currentSuspended ? null : prompt('Please provide a reason for account suspension:') || 'Terms of Service Compliance Review';
    if (!currentSuspended && !reason) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isSuspended: !currentSuspended,
          suspensionReason: reason,
        }),
      });

      if (res.ok) {
        await loadUsers();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center">
          <Users className="w-7 h-7 mr-3 text-indigo-400" />
          <span>User & Persona Governance Directory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review buyer and supplier accounts, assign roles, enforce suspensions, and inspect audit activity.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading user directory...</div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800 text-xs">
          {users.map((u) => (
            <div key={u.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-white text-sm">{u.name || 'Unnamed User'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    u.role === 'ADMIN' ? 'bg-purple-900/60 text-purple-300 border border-purple-700' :
                    u.role === 'SUPPLIER' ? 'bg-blue-900/60 text-blue-300 border border-blue-700' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {u.role}
                  </span>
                  {u.isSuspended && (
                    <span className="bg-rose-900/80 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-700">
                      SUSPENDED
                    </span>
                  )}
                </div>

                <div className="text-slate-400 text-xs mt-1">
                  Email: <strong>{u.email}</strong> • Joined: {formatDate(u.createdAt)}
                  {u.profile?.companyName && ` • Entity: ${u.profile.companyName}`}
                </div>
                {u.suspensionReason && (
                  <div className="text-rose-400 text-[11px] mt-1">
                    Suspension reason: {u.suspensionReason}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSuspension(u.id, u.isSuspended)}
                  className={`font-bold text-xs ${
                    u.isSuspended
                      ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
                      : 'border-rose-700 bg-rose-950/60 text-rose-300 hover:bg-rose-900'
                  }`}
                >
                  {u.isSuspended ? (
                    <><UserCheck className="w-3.5 h-3.5 mr-1" /> Reinstate Account</>
                  ) : (
                    <><UserX className="w-3.5 h-3.5 mr-1" /> Suspend Account</>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
