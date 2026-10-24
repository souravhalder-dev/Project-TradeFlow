'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { loginWithDemo, fetchUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async (role: 'BUYER' | 'SUPPLIER' | 'ADMIN') => {
    setError(null);
    setIsLoading(true);
    const success = await loginWithDemo(role);
    if (success) {
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'SUPPLIER') router.push('/supplier/dashboard');
      else router.push(redirectUrl === '/' ? '/buyer/dashboard' : redirectUrl);
    } else {
      setError('Unable to authenticate with demo persona.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const role = email.includes('admin') ? 'ADMIN' : email.includes('supplier') ? 'SUPPLIER' : 'BUYER';
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: `demo_token_${role.toLowerCase()}_${Date.now()}`,
          name: email.split('@')[0],
        }),
      });

      if (res.ok) {
        await fetchUser();
        router.push(redirectUrl);
      } else {
        const d = await res.json();
        setError(d.error || 'Authentication failed');
      }
    } catch {
      setError('Network communication failure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border shadow-xl">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md">
          TF
        </div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Sign In to TradeFlow
        </h1>
        <p className="text-xs text-slate-500">
          Access your B2B sourcing portal, wholesale quotations, and orders.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Instant Demo Switcher Box */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2.5">
        <div className="flex items-center space-x-1.5 text-amber-900 font-extrabold text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Instant Portfolio Demo Logins</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Test any authenticated persona with pre-seeded wholesale data and transactions in 1 click:
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => handleDemoLogin('BUYER')}
            className="bg-white border-amber-300 text-amber-950 font-bold text-xs hover:bg-amber-100"
          >
            Buyer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => handleDemoLogin('SUPPLIER')}
            className="bg-white border-amber-300 text-amber-950 font-bold text-xs hover:bg-amber-100"
          >
            Supplier
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => handleDemoLogin('ADMIN')}
            className="bg-white border-amber-300 text-amber-950 font-bold text-xs hover:bg-amber-100"
          >
            Admin
          </Button>
        </div>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-slate-400">or sign in with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Corporate Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="email"
              required
              placeholder="procurement@enterprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Password</label>
            <Link href="/help" className="text-[11px] text-brand-orange font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-brand-orange/30"
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
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2">
        New to TradeFlow?{' '}
        <Link href="/register" className="font-bold text-brand-orange hover:underline">
          Register Business Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading sign-in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
