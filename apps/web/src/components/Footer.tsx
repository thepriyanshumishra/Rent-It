import React from 'react';
import Link from 'next/link';
import { Camera, Wrench, Tent, Volume2, Package, ShieldCheck, Zap, Mail } from 'lucide-react';

const FOOTER_LINKS = {
  catalog: [
    { label: 'Electronics & AV', href: '/' },
    { label: 'Tools & Machinery', href: '/' },
    { label: 'Event & Party', href: '/' },
    { label: 'Stage & Audio', href: '/' },
    { label: 'All Categories', href: '/' },
  ],
  customer: [
    { label: 'Browse Equipment', href: '/' },
    { label: 'Shopping Cart', href: '/cart' },
    { label: 'My Rental Orders', href: '/my-rentals' },
    { label: 'Track Delivery', href: '/my-rentals' },
    { label: 'Sign In', href: '/login' },
  ],
  operators: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Rental Operations', href: '/admin/rentals' },
    { label: 'Pickup Management', href: '/admin/rentals' },
    { label: 'Deposit Settlement', href: '/admin/rentals' },
    { label: 'Inventory Tracking', href: '/admin' },
  ],
  company: [
    { label: 'About RentIt', href: '/' },
    { label: 'How It Works', href: '/' },
    { label: 'For Businesses', href: '/' },
    { label: 'Pricing', href: '/' },
    { label: 'Contact Us', href: '/' },
  ],
};

export const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-400">
      {/* Top CTA Strip */}
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
              <h3 className="text-white font-bold text-lg">Stay updated on new gear</h3>
              <p className="text-slate-400 text-sm mt-1">
                Get notified when new equipment categories and seasonal deals launch.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600/20 w-56"
                />
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-brand-600 text-sm font-bold text-white hover:bg-brand-700 transition shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-black text-xl shadow-lg shadow-brand-600/30">
                R
              </div>
              <span className="text-lg font-black text-white">
                Rent<span className="text-brand-400">It</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Enterprise rental management platform built for high reliability, financial clarity, and transparent inventory operations.
            </p>

            {/* Trust Badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>100% Refundable Security Deposits</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Real-Time Availability Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Package className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                <span>500+ Verified Equipment Items</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">
              Browse Catalog
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.catalog.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">
              Customer Portal
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.customer.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">
              Operations
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.operators.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Category Visual Row */}
        <div className="mt-14 pt-10 border-t border-slate-800/60">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-5">
            Popular Categories
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Camera, label: 'Cameras & Lenses' },
              { icon: Volume2, label: 'Stage & PA Audio' },
              { icon: Wrench, label: 'Power Tools' },
              { icon: Tent, label: 'Event Canopies' },
              { icon: Package, label: 'Generators' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-800 bg-slate-900/60 text-slate-500 text-xs font-medium hover:border-slate-600 hover:text-slate-300 cursor-pointer transition"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} RentIt Platform. Built for Odoo Hackathon.
            </p>
            <div className="flex items-center gap-6">
              <span className="font-mono">Paise Financial Integrity</span>
              <span className="font-mono">Local-First Architecture</span>
              <span className="font-mono">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
