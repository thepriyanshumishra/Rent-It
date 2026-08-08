'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import { formatMoney, formatDate } from '../../lib/utils';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Package,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'All Rentals', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
];

function RentalCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-5 bg-slate-100 rounded w-36" />
        </div>
        <div className="h-7 bg-slate-100 rounded-full w-24" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-full" />
      </div>
      <div className="h-12 bg-slate-100 rounded-xl" />
    </div>
  );
}

function RentalTimeline({ status }: { status: string }) {
  const stages = [
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'UNDER_INSPECTION', label: 'Inspection' },
    { key: 'PENDING_SETTLEMENT', label: 'Settlement' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const currentIdx = stages.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-0 mt-3">
      {stages.map((stage, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center">
              <div
                className={`h-2 w-2 rounded-full shrink-0 ${
                  isCurrent
                    ? 'bg-brand-600 ring-2 ring-brand-200'
                    : isCompleted
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />
              <span className={`text-[9px] mt-1 font-semibold whitespace-nowrap hidden sm:block ${
                isCurrent ? 'text-brand-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {stage.label}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${idx < currentIdx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function MyRentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [expandedRental, setExpandedRental] = useState<string | null>(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rentals/');
      if (res.data.success) {
        setRentals(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = activeFilter
    ? rentals.filter((r) => r.status === activeFilter)
    : rentals;

  const activeRentals = rentals.filter((r) => r.status === 'ACTIVE').length;
  const depositsHeld = rentals
    .filter((r) => !['COMPLETED'].includes(r.status))
    .reduce((sum, r) => sum + (r.depositTotalPaise || 0), 0);
  const completedRentals = rentals.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 block mb-1">
                Customer Portal
              </span>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Package className="h-6 w-6 text-brand-600" />
                My Rental Orders
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Track active rentals, return deadlines, and deposit settlements.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 transition shrink-0"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Equipment
            </Link>
          </div>

          {/* Stats Bar */}
          {!loading && rentals.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xl font-black text-brand-600">{activeRentals}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Active Rentals</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xl font-black text-amber-600">{formatMoney(depositsHeld)}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Deposits Held</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xl font-black text-emerald-600">{completedRentals}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Completed</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        {!loading && rentals.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  activeFilter === f.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {f.label}
                {f.value && (
                  <span className="ml-1.5 opacity-70">
                    ({rentals.filter((r) => r.status === f.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <RentalCardSkeleton key={i} />)}
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {activeFilter ? 'No rentals in this status' : 'No rental history yet'}
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
              {activeFilter
                ? `You don't have any ${activeFilter.toLowerCase()} rentals at the moment.`
                : 'Browse our equipment catalog and place your first rental order.'}
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition"
            >
              Browse Equipment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRentals.map((rental) => {
              const isExpanded = expandedRental === rental.id;
              return (
                <div
                  key={rental.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                          Rental Order
                        </span>
                        <StatusBadge status={rental.status} />
                      </div>
                      <h2 className="text-base font-black text-slate-900 font-mono">{rental.rentalNumber}</h2>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900">{formatMoney(rental.totalPaise)}</div>
                        <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 justify-end">
                          <ShieldCheck className="h-3 w-3" />
                          ₹{(rental.depositTotalPaise / 100).toLocaleString('en-IN')} deposit held
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedRental(isExpanded ? null : rental.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="px-5 sm:px-6 pb-4">
                    <RentalTimeline status={rental.status} />
                  </div>

                  {/* Quick date info */}
                  <div className="px-5 sm:px-6 pb-4">
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-brand-500" />
                        {formatDate(rental.startDate)} – {formatDate(rental.endDate)}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {rental.fulfillmentType === 'STORE_PICKUP' ? 'Store Pickup' : 'Delivery'}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/50">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                        Equipment in this Order
                      </h3>
                      <div className="space-y-2">
                        {rental.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <Package className="h-4 w-4 text-slate-400" />
                              </div>
                              <span className="text-sm font-semibold text-slate-900">{item.product?.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                              <span>×{item.quantity}</span>
                              <span className="font-bold text-slate-900">{formatMoney(item.totalRentalPaise)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
