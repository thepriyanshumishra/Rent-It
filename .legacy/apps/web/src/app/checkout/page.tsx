'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { formatMoney } from '../../lib/utils';
import {
  ShieldCheck,
  Truck,
  Store,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Lock,
  CreditCard,
  FileText,
  Package,
  Info,
} from 'lucide-react';

const STEP_LABELS = ['Cart', 'Checkout', 'Confirmed'];

function SummaryItem({ label, value, highlight }: { label: React.ReactNode; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={highlight ? 'font-bold text-slate-900' : 'text-slate-500'}>{label}</span>
      <span className={highlight ? 'font-black text-brand-600 text-lg' : 'font-bold text-slate-900'}>{value}</span>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [fulfillmentType, setFulfillmentType] = useState<'STORE_PICKUP' | 'DELIVERY'>('STORE_PICKUP');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartSummary, setCartSummary] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>('NOT_VERIFIED');

  useEffect(() => {
    fetchCartSummary();
    const status = localStorage.getItem('rentit_kyc_status') || 'NOT_VERIFIED';
    setKycStatus(status);
  }, []);

  const fetchCartSummary = async () => {
    try {
      const res = await api.get('/cart/');
      if (res.data.success) {
        setCartSummary(res.data.data?.summary || null);
      }
    } catch {
      // ignore
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post('/rentals/checkout/', { fulfillmentType, notes });
      if (res.data.success) {
        const rental = res.data.data;
        await api.post(`/rentals/${rental.id}/confirm-payment/`);
        window.dispatchEvent(new Event('storage'));
        router.push('/my-rentals');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-5">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          {/* Step Progress */}
          <div className="flex items-center gap-0 mt-1">
            {STEP_LABELS.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400'
                        : idx === 1
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {idx === 0 ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-sm font-semibold hidden sm:block ${
                      idx === 0 ? 'text-emerald-600' : idx === 1 ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 min-w-[32px] ${idx === 0 ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left — Form Steps */}
          <div className="lg:col-span-2 space-y-5">
            <h1 className="text-xl font-black text-slate-900">Complete Your Order</h1>

            {/* Step 1 — Fulfillment */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <h2 className="text-sm font-bold text-slate-900">Fulfillment Preference</h2>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4">
                {/* Store Pickup */}
                <button
                  type="button"
                  onClick={() => setFulfillmentType('STORE_PICKUP')}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    fulfillmentType === 'STORE_PICKUP'
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-3 ${
                    fulfillmentType === 'STORE_PICKUP' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Store className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Store Pickup</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Walk in & collect at our service counter. Available same day.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-emerald-600">✓ Free · Immediate</div>
                </button>

                {/* Delivery */}
                <button
                  type="button"
                  onClick={() => setFulfillmentType('DELIVERY')}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    fulfillmentType === 'DELIVERY'
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-3 ${
                    fulfillmentType === 'DELIVERY' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Truck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Site Delivery</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Delivered to your event address. Pre-inspected and packed.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-brand-600">✓ Free above ₹5,000</div>
                </button>
              </div>
            </div>

            {/* Step 2 — Payment */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <h2 className="text-sm font-bold text-slate-900">Payment Method</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Simulated Card UI */}
                <div className="relative p-5 rounded-xl bg-gradient-to-br from-slate-900 to-brand-900 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <CreditCard className="h-6 w-6 text-brand-300" />
                      <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Simulated</span>
                    </div>
                    <div className="text-lg font-mono tracking-widest text-white/90">
                      •••• •••• •••• 4242
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-white/60">CARDHOLDER</span>
                      <span className="text-xs text-white/60">EXPIRES</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">RentIt Customer</span>
                      <span className="text-sm font-bold text-white">12/28</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Demo Payment — Instant Confirmation</h4>
                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                      This is a hackathon demo. Payment is simulated instantly. Rental fee + refundable deposit will be authorized in the system.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 — Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <h2 className="text-sm font-bold text-slate-900">Special Instructions</h2>
                <span className="text-xs text-slate-400 ml-auto font-medium">Optional</span>
              </div>
              <div className="p-6">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={400}
                  placeholder="e.g. Please call 30 mins before delivery · Gate code: 4891 · Handle with care"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 outline-none transition resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 text-right">{notes.length}/400</p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-700 flex items-start gap-2">
                <span>⚠</span>
                {error}
              </div>
            )}
          </div>

          {/* Right — Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-brand-600" />
                  Order Summary
                </h2>
              </div>

              <div className="px-6 py-5 space-y-3.5">
                <SummaryItem
                  label="Rental Subtotal"
                  value={formatMoney(cartSummary?.subtotalPaise || 0)}
                />
                <SummaryItem
                  label={
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Security Deposit
                    </span>
                  }
                  value={formatMoney(cartSummary?.depositTotalPaise || 0)}
                />
                <SummaryItem
                  label={
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-slate-400" />
                      {fulfillmentType === 'STORE_PICKUP' ? 'Store Pickup' : 'Delivery'}
                    </span>
                  }
                  value="Free"
                />
              </div>

              <div className="px-6 pt-4 pb-5 border-t border-slate-200 space-y-4">
                <SummaryItem
                  label="Total Payable Now"
                  value={formatMoney(cartSummary?.totalPaise || 0)}
                  highlight
                />
                <p className="text-[11px] text-slate-400 -mt-2">
                  Includes rental + fully refundable deposit
                </p>

                {kycStatus !== 'APPROVED' ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-900">Identity Verification Required</p>
                        <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                          Complete your 1-minute Aadhaar KYC before order confirmation.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/kyc?redirect=/checkout"
                      className="w-full py-3 rounded-xl bg-amber-600 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition flex items-center justify-center gap-1.5"
                    >
                      Complete KYC Verification <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm & Pay Now
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}

                {/* Security strip */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>256-bit SSL · PCI Compliant · Instant Confirmation</span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy Note */}
            <div className="mt-4 flex items-start gap-2.5 px-4 py-3.5 rounded-xl bg-slate-100 border border-slate-200">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Deposits are held and released within 24h of approved return inspection. Late returns may incur additional daily charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
