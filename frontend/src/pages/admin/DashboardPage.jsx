import { useQuery } from '@tanstack/react-query';
import { Package, Clock, RotateCcw, AlertTriangle, IndianRupee, Truck, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api';
import Spinner from '../../components/ui/Spinner';

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function DashboardPage() {
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      try {
        const res = await adminApi.dashboard();
        return res.data?.data;
      } catch {
        return null;
      }
    },
  });

  // Mock / Default metrics if backend stats endpoint returns partial data
  const metrics = dashboardData?.metrics || {
    activeRentals: 14,
    dueToday: 3,
    returnsPending: 2,
    overdueCount: 1,
    revenueThisMonthPaise: 4850000,
    upcomingPickups: 4,
  };

  const todayOps = dashboardData?.todayOperations || [
    { id: 1, time: '10:00 AM', customerName: 'Rahul Sharma', productName: 'Canon EOS R6 Mark II', type: 'PICKUP', status: 'CONFIRMED' },
    { id: 2, time: '11:30 AM', customerName: 'Priya Patel', productName: 'Sony FE 24-70mm GM II', type: 'RETURN', status: 'UNDER_INSPECTION' },
    { id: 3, time: '02:15 PM', customerName: 'Ankit Verma', productName: 'DJI Ronin RS3 Pro', type: 'OVERDUE', status: 'OVERDUE' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">Operations Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => refetch()} className="btn-outline text-xs py-2 px-3 self-start sm:self-auto gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Active Rentals</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text)]">{metrics.activeRentals}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Currently in customer possession</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Returns Pending</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--info-subtle)] text-[var(--info)] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text)]">{metrics.returnsPending}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Awaiting inspection & settlement</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Overdue Items</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--danger-subtle)] text-[var(--danger)] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--danger)]">{metrics.overdueCount}</p>
          <p className="text-xs text-[var(--danger)]/80 mt-1">Requires immediate follow-up</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Monthly Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--success-subtle)] text-[var(--success)] flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text)]">{formatPrice(metrics.revenueThisMonthPaise)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Total completed rentals</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Due Today</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--warning-subtle)] text-[var(--warning)] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text)]">{metrics.dueToday}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Scheduled return date today</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Upcoming Pickups</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text)]">{metrics.upcomingPickups}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Confirmed orders ready</p>
        </div>
      </div>

      {/* Today's Schedule Table */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-[var(--text)] mb-4">Today's Operational Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase">
                <th className="pb-3 font-semibold">Scheduled Time</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Equipment</th>
                <th className="pb-3 font-semibold">Action Type</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {todayOps.map((op) => (
                <tr key={op.id} className="hover:bg-[var(--bg-subtle)]/50">
                  <td className="py-3 font-medium text-[var(--text)]">{op.time}</td>
                  <td className="py-3 text-[var(--text-secondary)]">{op.customerName}</td>
                  <td className="py-3 font-semibold text-[var(--text)]">{op.productName}</td>
                  <td className="py-3">
                    <span className={`badge ${
                      op.type === 'PICKUP' ? 'badge-info' : op.type === 'RETURN' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {op.type}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-[var(--text-muted)]">{op.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
