'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Button } from '@/components/ui/button';
import {
  Search,
  ShoppingCart,
  ShieldCheck,
  FileText,
  User,
  ChevronDown,
  Building2,
  Package,
  Layers,
  LogOut,
  Bell,
  CheckCircle,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser, loginWithDemo, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, [fetchUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm.trim()) query.set('q', searchTerm.trim());
    if (selectedCategory) query.set('category', selectedCategory);
    router.push(`/products?${query.toString()}`);
  };

  const handleQuickDemoSwitch = async (role: 'BUYER' | 'SUPPLIER' | 'ADMIN') => {
    setIsDemoMenuOpen(false);
    await loginWithDemo(role);
    if (role === 'ADMIN') router.push('/admin/dashboard');
    else if (role === 'SUPPLIER') router.push('/supplier/dashboard');
    else router.push('/buyer/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> TradeFlow Buyer Protection & Verified Manufacturers
            </span>
            <span className="hidden md:inline-block text-slate-400">
              Direct factory pricing & custom OEM/ODM production
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Demo Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                className="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-0.5 rounded text-xs border border-slate-700 transition-colors"
              >
                <span>Demo Role Switcher</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>

              {isDemoMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-xl border p-2 z-50 text-xs">
                  <div className="font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider text-[10px]">
                    Switch Active Persona
                  </div>
                  <button
                    onClick={() => handleQuickDemoSwitch('BUYER')}
                    className="w-full text-left px-2.5 py-2 hover:bg-slate-100 rounded flex items-center justify-between"
                  >
                    <span>Buyer: Marcus Vance</span>
                    {user?.role === 'BUYER' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleQuickDemoSwitch('SUPPLIER')}
                    className="w-full text-left px-2.5 py-2 hover:bg-slate-100 rounded flex items-center justify-between"
                  >
                    <span>Supplier: Apex Electronics</span>
                    {user?.role === 'SUPPLIER' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleQuickDemoSwitch('ADMIN')}
                    className="w-full text-left px-2.5 py-2 hover:bg-slate-100 rounded flex items-center justify-between"
                  >
                    <span>Admin: Sarah Jenkins</span>
                    {user?.role === 'ADMIN' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            <Link href="/help" className="hover:text-white transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            TF
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              Trade<span className="text-brand-orange">Flow</span>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              B2B Wholesale
            </div>
          </div>
        </Link>

        {/* Large Marketplace Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex items-center">
          <div className="flex w-full rounded-lg border-2 border-brand-orange/80 overflow-hidden focus-within:ring-2 focus-within:ring-brand-orange/30 shadow-sm">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border-r border-slate-200 px-3 text-xs text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer max-w-[140px]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search wholesale products, specifications, verified manufacturers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />

            <button
              type="submit"
              className="bg-brand-orange hover:bg-orange-600 text-white px-5 py-2 font-medium text-sm flex items-center transition-colors"
            >
              <Search className="w-4 h-4 mr-1.5" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Action Controls & User Account */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Post RFQ CTA */}
          <Link href="/rfq/new">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-800 hover:border-brand-orange hover:text-brand-orange font-medium hidden sm:flex items-center"
            >
              <FileText className="w-4 h-4 mr-1.5 text-brand-orange" />
              <span>Submit RFQ</span>
            </Button>
          </Link>

          {/* Cart Pill */}
          <Link
            href="/cart"
            className="relative p-2 text-slate-700 hover:text-brand-orange transition-colors"
            title="Wholesale Cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {(user?.cartCount ?? 0) > 0 && (
              <span className="absolute top-0 right-0 bg-brand-orange text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                {user?.cartCount}
              </span>
            )}
          </Link>

          {/* User Account / Navigation */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b">
                    <div className="text-xs font-bold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                      Role: {user.role}
                    </span>
                  </div>

                  {user.role === 'BUYER' && (
                    <>
                      <Link
                        href="/buyer/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <Layers className="w-4 h-4 mr-2 text-slate-500" /> Buyer Dashboard
                      </Link>
                      <Link
                        href="/buyer/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <Package className="w-4 h-4 mr-2 text-slate-500" /> Order History
                      </Link>
                      <Link
                        href="/buyer/rfqs"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <FileText className="w-4 h-4 mr-2 text-slate-500" /> My RFQs & Quotes
                      </Link>
                    </>
                  )}

                  {user.role === 'SUPPLIER' && (
                    <>
                      <Link
                        href="/supplier/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <Building2 className="w-4 h-4 mr-2 text-slate-500" /> Supplier Portal
                      </Link>
                      <Link
                        href="/supplier/products"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <Package className="w-4 h-4 mr-2 text-slate-500" /> Product Catalog
                      </Link>
                      <Link
                        href="/supplier/rfqs"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <FileText className="w-4 h-4 mr-2 text-slate-500" /> Lead RFQs
                      </Link>
                      <Link
                        href="/supplier/verification"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" /> Business Verification
                      </Link>
                    </>
                  )}

                  {user.role === 'ADMIN' && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600" /> Admin Console
                      </Link>
                      <Link
                        href="/admin/verifications"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <FileText className="w-4 h-4 mr-2 text-slate-500" /> Review Verifications
                      </Link>
                    </>
                  )}

                  <div className="border-t my-1" />
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="brand" size="sm" className="shadow-sm">
                  Join Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Category Sub-Navigation Bar */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-8 py-2 overflow-x-auto text-xs">
        <div className="max-w-7xl mx-auto flex items-center space-x-6 text-slate-700 whitespace-nowrap">
          <Link
            href="/products"
            className="font-bold text-slate-900 hover:text-brand-orange flex items-center space-x-1"
          >
            <Layers className="w-3.5 h-3.5 mr-1" />
            <span>All Products</span>
          </Link>
          <Link href="/categories" className="hover:text-brand-orange transition-colors">
            Categories
          </Link>
          <Link href="/suppliers" className="hover:text-brand-orange transition-colors">
            Verified Manufacturers
          </Link>
          <Link href="/products?sort=price_asc" className="hover:text-brand-orange transition-colors">
            Volume Discounts
          </Link>
          <Link href="/rfq/new" className="hover:text-brand-orange transition-colors text-orange-600 font-medium">
            Custom Manufacturing & RFQ
          </Link>
        </div>
      </div>
    </header>
  );
}
