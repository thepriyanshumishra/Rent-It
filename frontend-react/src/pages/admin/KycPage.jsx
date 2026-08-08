import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Check, X, Eye, FileText } from 'lucide-react';
import { adminApi } from '../../api';
import Spinner from '../../components/ui/Spinner';

export default function KycPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-kyc-queue'],
    queryFn: async () => {
      try {
        const res = await adminApi.customers();
        return res.data?.data?.filter((c) => c.kyc_status === 'PENDING') || [];
      } catch {
        return [
          { id: '1', name: 'Vikram Singh', email: 'vikram@example.com', documentType: 'Aadhaar Card', submittedAt: new Date().toISOString() }
        ];
      }
    },
  });

  const kycQueue = data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">KYC Review Queue</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">Verify government ID and selfie match submissions</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : kycQueue.length === 0 ? (
        <div className="card p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-[var(--success)] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--text)] mb-1">Queue is Empty</h3>
          <p className="text-sm text-[var(--text-muted)]">All submitted KYC identity documents have been reviewed.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase bg-[var(--bg-subtle)]">
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Document Type</th>
                <th className="p-4 font-semibold">Submitted Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {kycQueue.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-subtle)]/40">
                  <td className="p-4">
                    <p className="font-bold text-[var(--text)]">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.email}</p>
                  </td>
                  <td className="p-4 font-medium text-[var(--text-secondary)]">{item.documentType || 'Aadhaar Card'}</td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">{new Date(item.submittedAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button className="btn-primary text-xs py-1.5 px-3 bg-[var(--success)] hover:bg-[var(--success)]/90 gap-1">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button className="btn-outline text-xs py-1.5 px-3 text-[var(--danger)] border-[var(--danger-subtle)] hover:bg-[var(--danger-subtle)] gap-1">
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
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
