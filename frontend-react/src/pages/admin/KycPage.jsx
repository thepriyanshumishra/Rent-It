import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { api } from '../../api';
import Spinner from '../../components/ui/Spinner';
import { toast } from '../../components/ui/Toast';

// KYC is based on accounts/customers — filter for any that have pending KYC doc submissions.
// We use GET /api/auth/customers/ and filter client-side for kyc_status PENDING.
const fetchKycQueue = async () => {
  const res = await api.get('/auth/customers/');
  const data = res.data;
  const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
  // Filter for customers with a pending KYC status.
  // If kyc_status field is not yet on the User model, this returns [] and the empty state is shown.
  return list.filter(
    (u) => u.kyc_status && (
      u.kyc_status === 'PENDING' ||
      u.kyc_status === 'SUBMITTED' ||
      u.kyc_status === 'UNDER_REVIEW'
    )
  );
};

export default function KycPage() {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState(null);

  const { data: kycQueue = [], isLoading } = useQuery({
    queryKey: ['admin-kyc-queue'],
    queryFn: fetchKycQueue,
  });

  const approveMutation = useMutation({
    mutationFn: async (userId) => {
      return await api.post(`/auth/customers/${userId}/approve-kyc/`);
    },
    onMutate: (userId) => setProcessingId(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
      toast({ title: 'Approved', description: 'KYC approved successfully.', type: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to approve KYC.',
        type: 'error',
      });
    },
    onSettled: () => setProcessingId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId) => {
      return await api.post(`/auth/customers/${userId}/reject-kyc/`);
    },
    onMutate: (userId) => setProcessingId(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
      toast({ title: 'Rejected', description: 'KYC rejected.', type: 'warning' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to reject KYC.',
        type: 'error',
      });
    },
    onSettled: () => setProcessingId(null),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">KYC Review Queue</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            Verify government ID and selfie match submissions
          </p>
        </div>
        {kycQueue.length > 0 && (
          <span className="text-sm font-semibold text-[var(--warning)] bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-full px-3 py-1">
            {kycQueue.length} pending
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <Spinner size="lg" />
        </div>
      ) : kycQueue.length === 0 ? (
        <div className="card p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-[var(--success)] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--text)] mb-1">Queue is Empty</h3>
          <p className="text-sm text-[var(--text-muted)]">
            All submitted KYC identity documents have been reviewed.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase bg-[var(--bg-subtle)]">
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Document Type</th>
                <th className="p-4 font-semibold">Submitted Date</th>
                <th className="p-4 font-semibold">KYC Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {kycQueue.map((item) => {
                const isProcessing = processingId === item.id;
                return (
                  <tr key={item.id} className="hover:bg-[var(--bg-subtle)]/40">
                    <td className="p-4">
                      <p className="font-bold text-[var(--text)]">
                        {item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{item.email}</p>
                    </td>
                    <td className="p-4 font-medium text-[var(--text-secondary)]">
                      {item.kyc_document_type || item.document_type || 'Government ID'}
                    </td>
                    <td className="p-4 text-xs text-[var(--text-muted)]">
                      {item.kyc_submitted_at || item.date_joined
                        ? new Date(item.kyc_submitted_at || item.date_joined).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="p-4">
                      <span className="badge badge-warning text-xs uppercase">
                        {item.kyc_status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={isProcessing}
                          onClick={() => approveMutation.mutate(item.id)}
                          className="btn-primary text-xs py-1.5 px-3 bg-[var(--success)] hover:bg-[var(--success)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? '…' : 'Approve'}
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => rejectMutation.mutate(item.id)}
                          className="btn-outline text-xs py-1.5 px-3 text-[var(--danger)] border-[var(--danger-subtle)] hover:bg-[var(--danger-subtle)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? '…' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
