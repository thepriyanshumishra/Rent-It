import React from 'react';
import { useQuery } from '@tanstack/react-query';
import RevenueChart from '../../components/admin/RevenueChart';
import DepositTable from '../../components/admin/DepositTable';
import EmptyState from '../../components/ui/EmptyState';
import { DollarSign, ShieldAlert, CreditCard } from 'lucide-react';
import api from '../../api/axios';

export default function FinancePage() {
  const { data: rentalsRaw = [], isLoading } = useQuery({
    queryKey: ['admin-finance-rentals'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/rentals/');
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
      } catch (e) {
        return [];
      }
    }
  });

  const rentals = Array.isArray(rentalsRaw) ? rentalsRaw : [];

  const totalRevenue = rentals
    .filter(r => r.payment_status === 'PAID' || r.status === 'COMPLETED')
    .reduce((sum, r) => sum + Number(r.total_amount || r.total || 0), 0);

  const depositsHeld = rentals
    .filter(r => r.status === 'ACTIVE' || r.status === 'CONFIRMED')
    .reduce((sum, r) => sum + Number(r.security_deposit || 0), 0);

  const refundsIssued = rentals
    .filter(r => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + Number(r.security_deposit || 0), 0);

  const lateFeesCollected = rentals
    .reduce((sum, r) => sum + Number(r.late_fee || 0), 0);

  const revenueData = [
    { date: 'Today', revenue: totalRevenue }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Finance Overview</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Escrow deposits, revenue payouts, and settlement ledger.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-[var(--success)]' },
          { label: 'Deposits Held', value: `₹${depositsHeld.toLocaleString()}`, color: 'text-[var(--warning)]' },
          { label: 'Refunds Issued', value: `₹${refundsIssued.toLocaleString()}`, color: 'text-[var(--text)]' },
          { label: 'Late Fees Collected', value: `₹${lateFeesCollected.toLocaleString()}`, color: 'text-[var(--danger)]' },
        ].map((metric, idx) => (
          <div key={idx} className="bg-[var(--bg-elevated)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1 font-extrabold">{metric.label}</p>
            <p className={`text-2xl font-black ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="h-[380px]">
        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-3">Revenue Ledger</h3>
        <div className="h-[calc(100%-2rem)]">
          <RevenueChart 
            data={revenueData} 
            loading={isLoading}
            period="month" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl flex flex-col h-[350px] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-extrabold text-sm text-[var(--text)]">Recent Payments</h3>
          </div>
          <div className="p-4 flex-1 flex items-center justify-center">
            <EmptyState 
              icon={CreditCard}
              title="No Payment Transactions" 
              description="Completed rental payment receipts will be recorded here automatically." 
            />
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl flex flex-col h-[350px] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-extrabold text-sm text-[var(--text)]">Held Escrow Deposits</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <DepositTable deposits={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
