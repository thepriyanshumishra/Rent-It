'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { formatMoney } from '../../lib/utils';
import {
  ShoppingBag,
  ShieldCheck,
  Calendar,
  ArrowRight,
  ChevronLeft,
  Package,
  Sparkles,
  Clock,
  CheckCircle2,
  Truck,
} from 'lucide-react';

function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white">
          <div className="h-20 w-20 rounded-xl bg-slate-100 shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 bg-slate-100 rounded w-2/3" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 bg-slate-100 rounded w-24 ml-auto" />
            <div className="h-3 bg-slate-100 rounded w-16 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

const STEP_LABELS = ['Cart', 'Checkout', 'Confirmed'];

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart/');
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const items = cart?.items || [];
  const summary = cart?.summary || { subtotalPaise: 0, depositTotalPaise: 0, totalPaise: 0 };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          {/* Step Progress */}
          <div className="flex items-center gap-0 mt-1">
            {STEP_LABELS.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {idx === 0 ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-sm font-semibold hidden sm:block ${
                      idx === 0 ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className="flex-1 h-px bg-slate-200 mx-3 min-w-[32px]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartSkeleton />
            </div>
            <div className="animate-pulse h-64 bg-white rounded-2xl border border-slate-100" />
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="mt-4 flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Your cart is empty</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
              Browse our equipment catalog — from cameras to power tools — and add gear with your rental dates.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition"
            >
              <Package className="h-4 w-4" />
              Explore Equipment Catalog
            </Link>

            {/* Popular categories suggestion */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {['Cameras & Lenses', 'Power Tools', 'PA Speakers', 'Event Canopies'].map((cat) => (
                <Link
                  key={cat}
                  href="/"
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600 transition"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-900">
                  Rental Cart
                  <span className="ml-2 text-base font-bold text-slate-400">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                </h1>
              </div>

              {/* Promo Banner */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                Free doorstep delivery on orders above ₹5,000 · Security deposits are 100% refundable
              </div>

              {/* Cart Items */}
              <div className="space-y-3">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
                  >
                    {/* Product Image */}
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-20 w-20 rounded-xl object-cover border border-slate-100 shrink-0 self-start sm:self-center"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 self-start sm:self-center">
                        <Package className="h-8 w-8 text-slate-300" />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{item.productName}</h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                          <Calendar className="h-3.5 w-3.5 text-brand-500" />
                          <span>
                            {new Date(item.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            {' – '}
                            {new Date(item.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-lg">
                          <Clock className="h-3.5 w-3.5" />
                          {item.durationDays} {item.durationDays === 1 ? 'Day' : 'Days'}
                        </div>
                        {item.quantity > 1 && (
                          <span className="text-xs text-slate-500">×{item.quantity} units</span>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 shrink-0 gap-2">
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block">
                          {formatMoney(item.totalRentalPaise)}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 sm:justify-end mt-0.5">
                          <ShieldCheck className="h-3 w-3" />
                          +{formatMoney(item.depositAmountPaise)} deposit
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-sm font-black text-slate-900">Order Summary</h2>
                </div>

                {/* Breakdown */}
                <div className="px-6 py-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Rental Subtotal</span>
                    <span className="font-bold text-slate-900">{formatMoney(summary.subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Security Deposit
                    </span>
                    <span className="font-bold text-emerald-700">{formatMoney(summary.depositTotalPaise)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-slate-400" />
                      Delivery
                    </span>
                    <span className="font-bold text-emerald-600 text-xs">FREE</span>
                  </div>
                </div>

                {/* Deposit Note */}
                <div className="mx-6 mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    <strong>100% Refundable:</strong> Your ₹{(summary.depositTotalPaise / 100).toLocaleString('en-IN')} deposit is fully returned after equipment inspection on return.
                  </p>
                </div>

                {/* Total */}
                <div className="px-6 pt-4 pb-2 border-t border-slate-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-700">Total Payable Now</span>
                    <span className="text-xl font-black text-brand-600">{formatMoney(summary.totalPaise)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Includes rental + refundable deposit</p>
                </div>

                <div className="px-6 pb-6 pt-4">
                  <Link
                    href="/checkout"
                    className="w-full py-3.5 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Trust Row */}
                <div className="px-6 pb-5 flex items-center justify-center gap-4">
                  {[
                    { icon: ShieldCheck, label: 'Secure' },
                    { icon: CheckCircle2, label: 'Verified Gear' },
                    { icon: Truck, label: 'Fast Delivery' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Icon className="h-3 w-3 text-slate-300" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
