import React from 'react';
import MetricRow from '../../components/admin/MetricRow';
import OperationsTable from '../../components/admin/OperationsTable';
import RevenueChart from '../../components/admin/RevenueChart';
import AttentionItems from '../../components/admin/AttentionItems';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';

// Mock API functions (replace with actual API imports later)
const fetchDashboardMetrics = async () => {
  return [
    { title: 'Active Rentals', value: '42', icon: 'file-text', color: 'var(--accent)' },
    { title: 'Due Today', value: '5', icon: 'clock', color: 'var(--warning)' },
    { title: 'Upcoming Pickups', value: '8', icon: 'truck', color: 'var(--info)' },
    { title: 'Upcoming Returns', value: '3', icon: 'rotate-ccw', color: 'var(--success)' },
    { title: 'Overdue', value: '2', icon: 'alert-triangle', color: 'var(--danger)' },
    { title: 'Revenue This Month', value: '₹1,24,500', icon: 'dollar-sign', color: 'var(--success)' }
  ];
};

const fetchTodayOperations = async () => {
  return [
    { id: 1, time: '10:00 AM', customerName: 'John Doe', productName: 'Sony A7III', type: 'pickup', status: 'pending', rentalId: 101 },
    { id: 2, time: '11:30 AM', customerName: 'Jane Smith', productName: 'Canon 24-70mm', type: 'return', status: 'completed', rentalId: 102 },
    { id: 3, time: '02:00 PM', customerName: 'Mike Johnson', productName: 'DJI Ronin', type: 'overdue', status: 'pending', rentalId: 103 },
  ];
};

const fetchRevenueData = async () => {
  return Array.from({length: 14}).map((_, i) => ({
    date: `Aug ${i+1}`,
    revenue: Math.floor(Math.random() * 5000) + 1000
  }));
};

const fetchAttentionItems = async () => {
  return [
    { type: 'overdue', title: '2 Rentals Overdue', description: 'Order #1042 and #1045 are past their return date.', link: '/admin/rentals?status=overdue' },
    { type: 'pending_returns', title: '3 Pending Returns', description: 'Items awaiting inspection and return processing.', link: '/admin/rentals?status=return_pending' },
    { type: 'low_inventory', title: 'Low Inventory', description: 'SD Cards (64GB) are running out of stock.', link: '/admin/inventory' }
  ];
};

export default function DashboardPage() {
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: fetchDashboardMetrics
  });

  const { data: operations, isLoading: loadingOps, refetch: refetchOps } = useQuery({
    queryKey: ['admin-operations'],
    queryFn: fetchTodayOperations
  });

  const { data: revenueData, isLoading: loadingRev, refetch: refetchRev } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: fetchRevenueData
  });

  const { data: attentionItems, isLoading: loadingAttn, refetch: refetchAttn } = useQuery({
    queryKey: ['admin-attention'],
    queryFn: fetchAttentionItems
  });

  const handleRefresh = () => {
    refetchMetrics();
    refetchOps();
    refetchRev();
    refetchAttn();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">Dashboard</h2>
          <p className="text-[var(--text-muted)]">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      <MetricRow metrics={metrics} loading={loadingMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Today's Operations</h3>
          <div className="h-[calc(100%-2rem)]">
             <OperationsTable operations={operations} loading={loadingOps} />
          </div>
        </div>
        <div className="h-[400px]">
           <RevenueChart data={revenueData} loading={loadingRev} period="month" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[350px]">
          {/* We could put something else here, or expand the chart. For now, empty placeholder or another widget. */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-5 h-full flex items-center justify-center">
             <p className="text-[var(--text-muted)]">More widgets coming soon...</p>
          </div>
        </div>
        <div className="h-[350px]">
          <AttentionItems items={attentionItems} loading={loadingAttn} />
        </div>
      </div>
    </div>
  );
}
