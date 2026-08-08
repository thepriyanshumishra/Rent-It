import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw, Package, Clock, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../api';
import Spinner from '../../components/ui/Spinner';

export default function ReturnsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-return-requests'],
    queryFn: async () => {
      try {
        const res = await adminApi.returnRequests();
        return res.data?.data;
      } catch {
        return [];
      }
    },
  });

  const returnRequests = data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">Return Requests</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">Customer-initiated return collection queue</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : returnRequests.length === 0 ? (
        <div className="card p-12 text-center">
          <RotateCcw className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--text)] mb-1">No Pending Return Requests</h3>
          <p className="text-sm text-[var(--text-muted)]">When customers click "Request Return" in their portal, they will appear here.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase bg-[var(--bg-subtle)]">
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Requested At</th>
                <th className="p-4 font-semibold">Notes</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {returnRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[var(--bg-subtle)]/40">
                  <td className="p-4 font-bold text-[var(--text)]">{req.customerName}</td>
                  <td className="p-4 font-medium text-[var(--text-secondary)]">{req.productName}</td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">{new Date(req.requestedAt).toLocaleDateString()}</td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">{req.notes || '—'}</td>
                  <td className="p-4">
                    <span className="badge badge-warning">PENDING</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="btn-primary text-xs py-1.5 px-3">Mark Collected</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
