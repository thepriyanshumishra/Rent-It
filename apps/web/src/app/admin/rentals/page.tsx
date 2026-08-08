'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import { formatMoney, formatDate } from '../../../lib/utils';
import { StatusBadge } from '../../../components/StatusBadge';
import { PickupModal } from '../../../components/PickupModal';
import { ReturnModal } from '../../../components/ReturnModal';
import { InspectionModal } from '../../../components/InspectionModal';
import { SettlementModal } from '../../../components/SettlementModal';
import { AdminAuthGate } from '../../../components/AdminAuthGate';
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Users,
  Search,
  CheckCircle2,
  RotateCcw,
  SearchCheck,
  Receipt,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Package,
  RefreshCw,
  AlertTriangle,
  Filter,
} from 'lucide-react';

// ─── Admin Sidebar (shared) ───────────────────────────────────────────────────

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Rental Orders', href: '/admin/rentals', icon: ClipboardList },
  { label: 'Inventory', href: '/admin', icon: Boxes },
  { label: 'Customers', href: '/admin', icon: Users },
];

function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] sticky top-16">
      <div className="p-4 border-b border-slate-100">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Panel</span>
        <p className="text-xs font-semibold text-slate-700 mt-0.5">Operations Management</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Hackathon Build</p>
          <p className="text-[11px] text-amber-600 mt-0.5">v1.0.0 · Odoo Integration</p>
        </div>
      </div>
    </aside>
  );
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: '', label: 'All Orders' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'UNDER_INSPECTION', label: 'Inspection' },
  { value: 'PENDING_SETTLEMENT', label: 'Settlement' },
  { value: 'COMPLETED', label: 'Completed' },
];

// ─── Row Skeleton ─────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="py-4 px-5">
          <div className="h-3.5 bg-slate-100 rounded w-full max-w-[100px]" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Operational Modals
  const [pickupRental, setPickupRental] = useState<any>(null);
  const [returnRental, setReturnRental] = useState<any>(null);
  const [inspectionRental, setInspectionRental] = useState<any>(null);
  const [settlementRental, setSettlementRental] = useState<any>(null);

  useEffect(() => {
    fetchRentals();
  }, [statusFilter]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/rentals/', { params });
      if (res.data.success) {
        setRentals(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = searchQuery
    ? rentals.filter(
        (r) =>
          r.rentalNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rentals;

  const overdueCount = rentals.filter((r) => r.status === 'OVERDUE').length;

  return (
    <AdminAuthGate>
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 block mb-1">
              Operations Management
            </span>
            <h1 className="text-2xl font-black text-slate-900">Rental Orders & Operations</h1>
            <p className="text-sm text-slate-500 mt-1">
              Process pickups, returns, inspections, and deposit settlements.
            </p>
          </div>
          <button
            onClick={fetchRentals}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Overdue Alert */}
        {overdueCount > 0 && (
          <div className="mb-5 flex items-center gap-4 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm font-semibold text-red-900">
              <strong>{overdueCount}</strong> overdue rental{overdueCount > 1 ? 's' : ''} require immediate action. Late fees may apply.
            </p>
            <button
              onClick={() => setStatusFilter('OVERDUE')}
              className="ml-auto text-xs font-bold text-red-700 underline underline-offset-2 hover:text-red-800 shrink-0"
            >
              Show Overdue
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
          <div className="flex flex-col sm:flex-row gap-3 p-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search order number or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 outline-none transition"
              />
            </div>

            {/* Filter icon */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 shrink-0">
              <Filter className="h-3.5 w-3.5" />
              Status Filter
            </div>
          </div>

          {/* Status Pill Filter Row */}
          <div className="flex items-center gap-2 overflow-x-auto px-4 pb-4">
            {STATUS_FILTERS.map((f) => {
              const count = f.value ? rentals.filter((r) => r.status === f.value).length : rentals.length;
              return (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    statusFilter === f.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    statusFilter === f.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Order #', 'Customer', 'Status', 'Rental Period', 'Amount', 'Action'].map((h) => (
                    <th key={h} className="py-3.5 px-5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                ) : filteredRentals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <ClipboardList className="h-10 w-10 opacity-40" />
                        <p className="text-sm font-semibold">
                          {searchQuery ? 'No orders match your search' : 'No orders in this status'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRentals.map((r) => {
                    const isExpanded = expandedRow === r.id;
                    return (
                      <React.Fragment key={r.id}>
                        <tr
                          className={`hover:bg-slate-50/80 transition cursor-pointer ${
                            r.status === 'OVERDUE' ? 'bg-red-50/30' : ''
                          }`}
                          onClick={() => setExpandedRow(isExpanded ? null : r.id)}
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <button className="text-slate-300 hover:text-slate-500 transition">
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                              <span className="font-mono text-sm font-bold text-brand-700">{r.rentalNumber}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-sm font-semibold text-slate-900">{r.customer?.name || '—'}</span>
                          </td>
                          <td className="py-4 px-5">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(r.startDate)} – {formatDate(r.endDate)}
                          </td>
                          <td className="py-4 px-5">
                            <div>
                              <span className="text-sm font-bold text-slate-900">{formatMoney(r.totalPaise)}</span>
                              <span className="text-[10px] text-emerald-600 block font-medium">
                                +{formatMoney(r.depositTotalPaise)} dep.
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                            {/* State machine action buttons */}
                            {r.status === 'CONFIRMED' && (
                              <button
                                onClick={() => setPickupRental(r)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Pickup
                              </button>
                            )}
                            {(r.status === 'ACTIVE' || r.status === 'OVERDUE') && (
                              <button
                                onClick={() => setReturnRental(r)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold shadow-sm hover:bg-amber-700 transition"
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Record Return
                              </button>
                            )}
                            {r.status === 'UNDER_INSPECTION' && (
                              <button
                                onClick={() => setInspectionRental(r)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold shadow-sm hover:bg-purple-700 transition"
                              >
                                <SearchCheck className="h-3.5 w-3.5" /> Inspect
                              </button>
                            )}
                            {r.status === 'PENDING_SETTLEMENT' && (
                              <button
                                onClick={() => setSettlementRental(r)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition"
                              >
                                <Receipt className="h-3.5 w-3.5" /> Settle Deposit
                              </button>
                            )}
                            {r.status === 'COMPLETED' && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Complete
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Expanded Row — Rental Items */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-slate-50/50 px-5 py-4 border-b border-slate-100">
                              <div className="ml-8">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                                  Equipment in Order
                                </p>
                                <div className="space-y-2">
                                  {r.items?.length > 0 ? (
                                    r.items.map((item: any) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-200 max-w-xl"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                            <Package className="h-4 w-4 text-slate-400" />
                                          </div>
                                          <span className="text-sm font-semibold text-slate-900">{item.product?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                          <span>×{item.quantity} unit{item.quantity > 1 ? 's' : ''}</span>
                                          <span className="font-bold text-slate-900">{formatMoney(item.totalRentalPaise)}</span>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-slate-400">No item details available.</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && filteredRentals.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Showing <strong className="text-slate-600">{filteredRentals.length}</strong> of{' '}
                <strong className="text-slate-600">{rentals.length}</strong> orders
              </p>
              <p className="text-xs text-slate-400">Click a row to expand items</p>
            </div>
          )}
        </div>
      </main>

      {/* Operational Modals */}
      {pickupRental && (
        <PickupModal rental={pickupRental} onClose={() => setPickupRental(null)} onSuccess={fetchRentals} />
      )}
      {returnRental && (
        <ReturnModal rental={returnRental} onClose={() => setReturnRental(null)} onSuccess={fetchRentals} />
      )}
      {inspectionRental && (
        <InspectionModal rental={inspectionRental} onClose={() => setInspectionRental(null)} onSuccess={fetchRentals} />
      )}
      {settlementRental && (
        <SettlementModal rental={settlementRental} onClose={() => setSettlementRental(null)} onSuccess={fetchRentals} />
      )}
    </div>
    </AdminAuthGate>
  );
}
