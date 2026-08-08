'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  PackageCheck,
  FileCheck2,
} from 'lucide-react';

const RENTAL_STEPS = [
  {
    step: '01',
    title: 'Browse & Reserve Rental Dates',
    desc: 'Select from our verified catalog of cameras, power tools, and AV equipment. Choose your exact start and end dates with real-time stock availability.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Identity KYC & Security Deposit',
    desc: 'Complete a quick 1-minute Aadhaar verification. Your security deposit is held in encrypted escrow and is 100% refundable after return.',
    icon: ShieldCheck,
  },
  {
    step: '03',
    title: 'Store Pickup or Site Delivery',
    desc: 'Collect pre-inspected equipment directly from our service counter or opt for doorstep delivery directly to your shoot or event location.',
    icon: Truck,
  },
  {
    step: '04',
    title: 'Return, Inspection & Instant Settlement',
    desc: 'Return the equipment at the end of your rental period. Our engineers conduct a 60-minute turnaround inspection, and your deposit is refunded instantly.',
    icon: RotateCcw,
  },
];

const FAQS = [
  {
    q: 'How does the Security Deposit refund work?',
    a: 'Security deposits are released back to your original payment account within 24 hours of equipment return and digital inspection. No hidden deductions or delays.',
  },
  {
    q: 'What is the 1-Hour Turnaround & Padding Period?',
    a: 'When an item is returned by a customer, our technical team takes 60 minutes for sanitization, multi-point inspection, and battery load testing before making it re-available for the next booking.',
  },
  {
    q: 'What documents are required for KYC?',
    a: 'We accept Aadhaar Card verification via DigiLocker OTP or manual Aadhaar photo upload along with a live camera selfie.',
  },
  {
    q: 'What happens if a product is damaged accidentally?',
    a: 'Minor wear and tear is fully covered. For major accidental damages, repair costs are estimated by authorized service centers and deducted from the held deposit according to our rental agreement.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 py-12 text-white border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
            Rental Process & Policy
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">How RentIt Works</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Transparent 4-step equipment rental process with real-time stock availability, 1-minute Aadhaar KYC, and 100% refundable deposits.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* 4 Step Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {RENTAL_STEPS.map(({ step, title, desc, icon: Icon }) => (
            <div
              key={step}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-2xl font-black text-slate-300 font-mono">{step}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{desc}</p>
            </div>
          ))}
        </div>

        {/* Turnaround & Cleaning Policy Highlight */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">1-Hour Turnaround & Inspection Policy</h2>
              <p className="text-xs text-slate-500 font-medium">Ensuring every rented item arrives in 100% operational condition.</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            To guarantee equipment reliability, our system automatically adds a <strong>60-minute padding period</strong> after every returned item. During this buffer window, our certified engineers perform battery diagnostics, sensor cleaning, sanitization, and accessory inventory checks before releasing the asset for the next customer booking.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Got Questions?</span>
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-purple-600 shrink-0" />
                  {q}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white text-center space-y-4">
          <h3 className="text-xl font-bold">Ready to rent professional gear?</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Explore 500+ verified cameras, power tools, and audio systems with instant booking.
          </p>
          <div className="pt-2">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition shadow-md"
            >
              Browse Equipment Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
