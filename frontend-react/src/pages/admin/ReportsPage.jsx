import React from 'react';
import Button from '../../components/ui/Button';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">Reports</h2>
          <p className="text-[var(--text-muted)]">Analytics and business intelligence</p>
        </div>
        <div className="flex gap-4">
          <input type="date" className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)]" />
          <span className="self-center">to</span>
          <input type="date" className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)]" />
          <Button variant="outline" className="gap-2"><Download size={16}/> Export All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Rental Performance', desc: 'Total rentals, avg duration, completion rates.' },
          { title: 'Revenue Analysis', desc: 'Revenue breakdown by category and time.' },
          { title: 'Top Products', desc: 'Most rented and highest earning products.' },
          { title: 'Overdue Summary', desc: 'Late returns and late fee collection stats.' },
          { title: 'Deposit Summary', desc: 'Held, released, and forfeited deposit totals.' },
          { title: 'Product Utilization', desc: 'Inventory usage percentages over time.' },
        ].map((report, idx) => (
          <div key={idx} className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer group flex flex-col">
            <h3 className="font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--accent)] transition-colors">{report.title}</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">{report.desc}</p>
            <Button variant="outline" size="sm" className="w-full justify-center">View Report</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
