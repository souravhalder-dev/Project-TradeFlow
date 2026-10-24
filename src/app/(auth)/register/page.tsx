'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Mail, Lock, User, Building, MapPin, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { fetchUser } = useAuthStore();

  const [role, setRole] = useState<'BUYER' | 'SUPPLIER'>('BUYER');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United States');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: `demo_token_${role.toLowerCase()}_${Date.now()}`,
          role,
          name,
          companyName,
        }),
      });

      if (res.ok) {
        await fetchUser();
        if (role === 'SUPPLIER') router.push('/supplier/dashboard');
        else router.push('/buyer/dashboard');
      } else {
        const d = await res.json();
        setError(d.error || 'Registration failed');
      }
    } catch {
      setError('Network communication failure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border shadow-xl">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md">
            TF
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Join TradeFlow Global Marketplace
          </h1>
          <p className="text-xs text-slate-500">
            Create an enterprise business profile to source or supply wholesale.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setRole('BUYER')}
            className={`p-3 rounded-xl border text-center transition-all ${
              role === 'BUYER'
                ? 'border-brand-orange bg-orange-50 font-bold text-brand-orange ring-2 ring-brand-orange/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="font-bold text-sm">I am a Buyer</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Procuring wholesale products</div>
          </button>

          <button
            type="button"
            onClick={() => setRole('SUPPLIER')}
            className={`p-3 rounded-xl border text-center transition-all ${
              role === 'SUPPLIER'
                ? 'border-blue-600 bg-blue-50 font-bold text-blue-700 ring-2 ring-blue-600/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="font-bold text-sm">I am a Supplier</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Factory / Manufacturer</div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Marcus Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Corporate Entity *</label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Global Merchandising Partners Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Country of Registration *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. United States, Germany, Japan"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="procurement@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            disabled={isLoading}
            className="w-full font-bold shadow-md rounded-xl py-3"
          >
            {isLoading ? 'Creating Account...' : `Register as Verified ${role === 'SUPPLIER' ? 'Supplier' : 'Buyer'}`}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Already have an enterprise account?{' '}
          <Link href="/login" className="font-bold text-brand-orange hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
