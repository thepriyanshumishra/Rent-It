import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp, Package, AlertTriangle, DollarSign, Users, BarChart2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { adminApi } from '../../api';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: dashStats } = useQuery({
    queryKey: ['reports-dashboard'],
    queryFn: async () => {
      try {
        const res = await adminApi.dashboard();
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const { data: revenueData } = useQuery({
    queryKey: ['reports-revenue'],
    queryFn: async () => {
      try {
        const res = await adminApi.revenueReport();
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const reportCards = [
    {
      title: 'Rental Performance',
      desc: 'Total rentals, avg duration, completion rates.',
      icon: TrendingUp,
      stat: dashStats ? `${dashStats.total_rentals} total` : null,
    },
    {
      title: 'Revenue Analysis',
      desc: 'Revenue breakdown by category and time.',
      icon: DollarSign,
      stat: dashStats
        ? `₹${Number(dashStats.revenue_this_month || 0).toLocaleString('en-IN')} this month`
        : null,
    },
    {
      title: 'Active Rentals',
      desc: 'Currently rented products and utilization.',
      icon: Package,
      stat: dashStats ? `${dashStats.active_rentals} active` : null,
    },
    {
      title: 'Overdue Summary',
      desc: 'Late returns and late fee collection stats.',
      icon: AlertTriangle,
      stat: dashStats ? `${dashStats.overdue_rentals} overdue` : null,
    },
    {
      title: 'New Users',
      desc: 'Customer and renter registrations this month.',
      icon: Users,
      stat: dashStats ? `${dashStats.new_users} new users` : null,
    },
    {
      title: 'Product Utilization',
      desc: 'Inventory usage percentages over time.',
      icon: BarChart2,
      stat: null,
    },
  ];

  // Simple bar chart for revenue
  const maxRevenue = revenueData?.data?.length
    ? Math.max(...revenueData.data, 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-5">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)]">Reports</h2>
          <p className="text-sm text-[var(--text-muted)] font-medium">Analytics and business intelligence</p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          />
          <span className="text-[var(--text-muted)] text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          />
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      {/* Revenue trend chart */}
      {revenueData?.labels?.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6">
          <h3 className="font-bold text-[var(--text)] mb-4">Revenue Trend (Last 6 Months)</h3>
          <div className="flex items-end gap-3 h-32">
            {revenueData.labels.map((label, idx) => {
              const val = revenueData.data[idx] || 0;
              const height = Math.max((val / maxRevenue) * 100, 4);
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">
                    ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  </span>
                  <div
                    className="w-full rounded-t bg-[var(--accent)] opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${height}%` }}
                    title={`${label}: ₹${val}`}
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report, idx) => {
          const Icon = report.icon;
          return (
            <div
              key={idx}
              className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-colors group flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {report.title}
                </h3>
                <Icon size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">{report.desc}</p>
              {report.stat && (
                <p className="text-sm font-semibold text-[var(--accent)] mb-3">{report.stat}</p>
              )}
              <Button variant="outline" size="sm" className="w-full justify-center">
                View Report
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
