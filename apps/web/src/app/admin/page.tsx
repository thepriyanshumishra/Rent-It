'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '../../lib/api';
import { formatMoney, formatDate } from '../../lib/utils';
import { StatusBadge } from '../../components/StatusBadge';
import { AdminAuthGate } from '../../components/AdminAuthGate';
import {
  LayoutDashboard,
  PackageCheck,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ClipboardList,
  Boxes,
  ChevronRight,
  Clock,
  RefreshCw,
} from 'lucide-react';

// ─── Admin Sidebar ───────────────────────────────────────────────────────────

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Rental Orders', href: '/admin/rentals', icon: ClipboardList },
  { label: 'KYC Approvals', href: '/admin/kyc', icon: Users },
  { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
];

function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] sticky top-16">
      <div className="p-4 border-b border-slate-100">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Admin Panel
        </span>
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

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendValue,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {trend && trendValue && (
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : trend === 'down'
                ? 'bg-red-50 text-red-600'
                : 'bg-slate-50 text-slate-500'
            }`}
          >
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-black text-slate-900 leading-tight">{value}</div>
        <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/');
      if (res.data.success) {
        setData(res.data.data);
        setLastRefreshed(new Date());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = data?.metrics || {};
  const recentRentals = data?.recentRentals || [];

  return (
    <AdminAuthGate>
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 block mb-1">
              Back-Office Management
            </span>
            <h1 className="text-2xl font-black text-slate-900">Operational Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last updated: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/admin/rentals"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 transition"
            >
              Manage Orders <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100" />
            ))}
          </div>
        ) : (
          <>
            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <KpiCard
                label="Active Rentals"
                value={String(metrics.activeRentals || 0)}
                icon={PackageCheck}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                trend="up"
                trendValue="+2 today"
              />
              <KpiCard
                label="Overdue Returns"
                value={String(metrics.overdueRentals || 0)}
                icon={AlertTriangle}
                iconBg="bg-red-50"
                iconColor="text-red-600"
                trend={metrics.overdueRentals > 0 ? 'down' : 'neutral'}
                trendValue={metrics.overdueRentals > 0 ? 'Needs action' : 'All clear'}
              />
              <KpiCard
                label="Total Revenue"
                value={formatMoney(metrics.revenueTotalPaise || 0)}
                icon={IndianRupee}
                iconBg="bg-purple-50"
                iconColor="text-brand-600"
                trend="up"
                trendValue="This cycle"
              />
              <KpiCard
                label="Security Deposits Held"
                value={formatMoney(metrics.depositsHeldPaise || 0)}
                icon={ShieldCheck}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                trend="neutral"
                trendValue="Pending refund"
              />
            </div>

            {/* Operational Alerts Row */}
            {(metrics.overdueRentals > 0 || metrics.pendingPickups > 0) && (
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {metrics.overdueRentals > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-red-50 border border-red-200">
                    <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-red-900">
                        {metrics.overdueRentals} Overdue Return{metrics.overdueRentals > 1 ? 's' : ''}
                      </h3>
                      <p className="text-xs text-red-600 mt-0.5">Late fees may apply. Process returns immediately.</p>
                    </div>
                    <Link
                      href="/admin/rentals"
                      className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1"
                    >
                      Review <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
                {metrics.pendingPickups > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-amber-900">
                        {metrics.pendingPickups} Pending Pickup{metrics.pendingPickups > 1 ? 's' : ''}
                      </h3>
                      <p className="text-xs text-amber-600 mt-0.5">Confirmed orders awaiting gear dispatch.</p>
                    </div>
                    <Link
                      href="/admin/rentals"
                      className="shrink-0 text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      Dispatch <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900">Recent Rental Orders</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Latest orders across all statuses</p>
                </div>
                <Link
                  href="/admin/rentals"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
                >
                  View All Orders <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Order #', 'Customer', 'Status', 'Rental Period', 'Amount', ''].map((h) => (
                        <th
                          key={h}
                          className="py-3 px-5 text-[10px] font-black uppercase tracking-wider text-slate-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentRentals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm text-slate-400">
                          No recent orders found.
                        </td>
                      </tr>
                    ) : (
                      recentRentals.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition group">
                          <td className="py-4 px-5">
                            <span className="font-mono text-sm font-bold text-brand-700">{r.rentalNumber}</span>
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
                            <span className="text-sm font-bold text-slate-900">{formatMoney(r.totalPaise)}</span>
                          </td>
                          <td className="py-4 px-5">
                            <Link
                              href="/admin/rentals"
                              className="text-[11px] font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5"
                            >
                              Actions <ChevronRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Record Pickup', desc: 'Confirm confirmed orders', icon: PackageCheck, href: '/admin/rentals', color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Process Return', desc: 'Active & overdue rentals', icon: RotateCcw, href: '/admin/rentals', color: 'text-amber-600 bg-amber-50' },
                { label: 'Settle Deposits', desc: 'Pending settlement orders', icon: ShieldCheck, href: '/admin/rentals', color: 'text-brand-600 bg-brand-50' },
              ].map(({ label, desc, icon: Icon, href, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
    </AdminAuthGate>
  );
}
