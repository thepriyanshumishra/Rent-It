import React from 'react';
import RevenueChart from '../../components/admin/RevenueChart';
import DepositTable from '../../components/admin/DepositTable';

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Finance Overview</h2>
        <select className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md px-3 py-2 text-sm">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '₹1,45,000', color: 'text-[var(--success)]' },
          { label: 'Deposits Held', value: '₹50,000', color: 'text-[var(--warning)]' },
          { label: 'Refunds Issued', value: '₹12,500', color: 'text-[var(--text)]' },
          { label: 'Late Fees Collected', value: '₹2,500', color: 'text-[var(--danger)]' },
        ].map((metric, idx) => (
          <div key={idx} className="bg-[var(--bg-elevated)] p-5 rounded-xl border border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)] mb-2 font-medium">{metric.label}</p>
            <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="h-[400px]">
        <RevenueChart 
          data={[
            {date: 'Week 1', revenue: 20000}, {date: 'Week 2', revenue: 35000},
            {date: 'Week 3', revenue: 25000}, {date: 'Week 4', revenue: 45000}
          ]} 
          period="month" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col h-[400px] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold">Recent Payments</h3>
          </div>
          <div className="p-4 flex-1 flex items-center justify-center text-[var(--text-muted)]">
            Payments table integration coming soon.
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col h-[400px] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold">Held Deposits</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <DepositTable deposits={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
