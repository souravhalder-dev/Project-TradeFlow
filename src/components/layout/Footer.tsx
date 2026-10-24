import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Headphones, Award, Globe, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/80 py-10 px-4 sm:px-8 bg-slate-900/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-brand-orange/10 text-brand-orange rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">TradeFlow Buyer Protection</div>
              <p className="text-slate-400 leading-relaxed">
                Guaranteed order tracking, verified manufacturing specifications, and dispute mediation.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">On-Site Verified Suppliers</div>
              <p className="text-slate-400 leading-relaxed">
                ISO certifications, business licenses, and factory production audits inspected by third-party auditors.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">Global Logistics & Freight</div>
              <p className="text-slate-400 leading-relaxed">
                End-to-end ocean, air, and express freight forwarding with customs clearance support.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">Secure Commercial Payments</div>
              <p className="text-slate-400 leading-relaxed">
                Stripe integrated sandbox checkout, encrypted escrow-ready architecture, and bank wire terms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Footer */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center text-white font-black text-sm">
              TF
            </div>
            <div className="text-lg font-black text-white tracking-tight">
              Trade<span className="text-brand-orange">Flow</span>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed max-w-sm mb-4">
            The next-generation B2B wholesale marketplace connecting industrial manufacturers, high-volume distributors, and commercial enterprise buyers across 140+ countries.
          </p>
          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Serving verified enterprises in North America, Europe & Asia-Pacific</span>
          </div>
        </div>

        <div>
          <div className="font-bold text-white uppercase tracking-wider text-xs mb-3">Sourcing Solutions</div>
          <ul className="space-y-2">
            <li><Link href="/products" className="hover:text-white transition-colors">Product Catalog</Link></li>
            <li><Link href="/rfq/new" className="hover:text-white transition-colors">Submit Request for Quotation</Link></li>
            <li><Link href="/suppliers" className="hover:text-white transition-colors">Verified Manufacturer Directory</Link></li>
            <li><Link href="/categories" className="hover:text-white transition-colors">Industry Categories</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-white uppercase tracking-wider text-xs mb-3">Supplier Solutions</div>
          <ul className="space-y-2">
            <li><Link href="/register" className="hover:text-white transition-colors">Become a Verified Supplier</Link></li>
            <li><Link href="/supplier/verification" className="hover:text-white transition-colors">Verification Requirements</Link></li>
            <li><Link href="/supplier/rfqs" className="hover:text-white transition-colors">Browse Live RFQs</Link></li>
            <li><Link href="/supplier/dashboard" className="hover:text-white transition-colors">Supplier Portal</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-white uppercase tracking-wider text-xs mb-3">Trust & Legal</div>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-white transition-colors">About TradeFlow</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            <li><Link href="/help" className="hover:text-white transition-colors">Help Center & FAQ</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 px-4 sm:px-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} TradeFlow Technologies Inc. All rights reserved.</div>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>Original SaaS Architecture</span>
            <span>PostgreSQL & Prisma</span>
            <span>Firebase Authentication</span>
            <span>Stripe Sandbox Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
