'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  Send,
  Calendar,
  Phone,
  Mail,
  User,
  PackageCheck,
  Receipt,
} from 'lucide-react';

export default function BusinessPage() {
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 py-12 text-white border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
            Enterprise & Event Rentals
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">RentIt for Business & Events</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Custom bulk equipment rentals for film productions, corporate events, construction projects, and large-scale activations.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Enterprise Benefits */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Why Production Houses & Event Teams Choose RentIt</h2>

            <div className="space-y-4">
              {[
                {
                  title: 'GST Invoicing & Corporate Billing',
                  desc: 'Receive full GST compliant tax invoices for all rental orders with streamlined monthly corporate credit billing.',
                  icon: Receipt,
                },
                {
                  title: 'Dedicated Account Manager',
                  desc: 'Direct hotline access to a senior equipment specialist for urgent gear additions or technical troubleshooting.',
                  icon: Building2,
                },
                {
                  title: 'Free On-Site Delivery & Setup',
                  desc: 'Complimentary logistics and technician assistance for event canopy setups, PA loudspeaker tuning, and camera rigs.',
                  icon: Truck,
                },
                {
                  title: 'Custom Deposit Credit Limits',
                  desc: 'Pre-approved corporate security deposit waiver limits for verified businesses and recurring production teams.',
                  icon: ShieldCheck,
                },
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Icon className="h-4 w-4 text-purple-600 shrink-0" />
                    {title}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium pl-6">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submit Corporate Rental Inquiry</h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill in your event or production details for a custom quotation within 2 hours.</p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold">Inquiry Submitted Successfully</h4>
                  <p className="text-xs text-emerald-700 font-medium">
                    Thank you! Your corporate account manager will contact you at <strong>{phone || email}</strong> shortly with a formal quotation.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Company / Studio Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Red Chillies Entertainment"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Contact Person Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Priyanshu Sharma"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Work Email</label>
                      <input
                        type="email"
                        required
                        placeholder="events@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Equipment Needed & Event Dates</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="e.g. Need 3x Canon R6 cameras, 4x JBL PA speakers, and 2x 10x10 event tents from May 28 to June 2 in Bangalore."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-600 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                    Request Custom Corporate Quotation
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
