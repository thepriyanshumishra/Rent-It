'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Search,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Send,
} from 'lucide-react';

const HELP_TOPICS = [
  {
    title: 'Deposits & Refunds',
    desc: 'Learn about security deposit escrow, 24h refund timelines, and damage deductions.',
    icon: ShieldCheck,
    articles: 8,
  },
  {
    title: 'Returns & Late Fees',
    desc: 'Return grace periods, late return penalties, and store counter drop-off procedures.',
    icon: RotateCcw,
    articles: 12,
  },
  {
    title: 'Identity & KYC',
    desc: 'Aadhaar verification via DigiLocker, facial matching, and admin approval queues.',
    icon: UserCheck,
    articles: 6,
  },
  {
    title: 'Damage & Repairs',
    desc: 'What is covered under normal wear and tear vs accidental damage liabilities.',
    icon: AlertTriangle,
    articles: 9,
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 py-12 text-white border-b border-slate-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
            Customer Support Center
          </span>
          <h1 className="text-3xl font-black">How can we help you today?</h1>

          {/* Help Search Input */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search help articles (e.g. deposit refund, late fee, Aadhaar KYC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-xs text-slate-900 placeholder-slate-400 outline-none shadow-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HELP_TOPICS.map(({ title, desc, icon: Icon, articles }) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">{desc}</p>
              </div>
              <span className="text-[10px] font-bold text-purple-600 block pt-1">
                {articles} Articles <ChevronRight className="h-3 w-3 inline" />
              </span>
            </div>
          ))}
        </div>

        {/* Contact Support Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Send Message to RentIt Support</h2>
              <p className="text-xs text-slate-500 font-medium">Our customer care team typically responds within 15 minutes.</p>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold">Support Ticket Created</h4>
              <p className="text-xs text-emerald-700 font-medium">
                Your message has been received. Ticket ID: <strong>#TK-88912</strong>. We will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">How can we assist you?</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your question or issue regarding rentals, deposits, or verification..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-600 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="h-4 w-4" />
                Submit Support Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
