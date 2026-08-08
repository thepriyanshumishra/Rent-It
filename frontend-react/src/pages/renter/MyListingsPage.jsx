import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Trash2, ExternalLink, ShieldAlert, PlusCircle } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';

export default function MyListingsPage() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['renter-listing-requests'],
    queryFn: async () => {
      const { data } = await api.get('/listing-requests/');
      return data.results || data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/listing-requests/${id}/`);
    },
    onSuccess: () => {
      toast.success('Listing unlisted successfully.');
      queryClient.invalidateQueries(['renter-listing-requests']);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.detail || 'Failed to unlist item.';
      toast.error(errorMsg);
    }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="card p-6 border border-[var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)]">My Listed Equipment</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
            Track verification status, live storefront listings, and manage your asset fleet.
          </p>
        </div>
        <Link to="/renter/listings/new">
          <button className="btn-primary py-2.5 px-4 font-bold text-xs flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Add Equipment
          </button>
        </Link>
      </div>

      {/* Listings Table */}
      <div className="card border border-[var(--border)] p-6">
        {isLoading ? (
          <div className="text-center py-8 text-sm text-[var(--text-muted)]">Loading listings...</div>
        ) : requests?.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Package className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <h4 className="font-bold text-base text-[var(--text)]">No Listed Equipment Found</h4>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Submit your first item for HQ quality check and earn 60% of all rental income.
            </p>
            <Link to="/renter/listings/new">
              <button className="btn-primary py-2 px-4 text-xs font-bold mt-2">Submit New Equipment</button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="pb-3 font-extrabold">Equipment</th>
                  <th className="pb-3 font-extrabold">Category</th>
                  <th className="pb-3 font-extrabold">Rate / Day</th>
                  <th className="pb-3 font-extrabold">60% Payout / Day</th>
                  <th className="pb-3 font-extrabold">Status</th>
                  <th className="pb-3 font-extrabold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {requests?.map((req) => (
                  <tr key={req.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                    <td className="py-4 font-extrabold text-[var(--text)]">
                      <div className="flex items-center gap-3">
                        {req.image_url ? (
                          <img src={req.image_url} alt={req.product_name} className="w-10 h-10 rounded-lg object-cover border border-[var(--border)] shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div>{req.product_name}</div>
                          {req.rejection_reason && (
                            <span className="text-[11px] text-[var(--danger)] block font-semibold">
                              Reason: {req.rejection_reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-medium text-[var(--text-secondary)]">{req.category_name || 'General'}</td>
                    <td className="py-4 font-bold text-[var(--text)]">₹{Number(req.daily_price).toLocaleString()}</td>
                    <td className="py-4 font-extrabold text-[var(--accent)]">₹{(Number(req.daily_price) * 0.6).toFixed(0)}</td>
                    <td className="py-4">
                      {req.status === 'APPROVED' && <span className="badge badge-success">Approved & Live</span>}
                      {req.status === 'PENDING_VERIFICATION' && <span className="badge badge-warning">Pending HQ Check</span>}
                      {req.status === 'INSPECTION_SCHEDULED' && <span className="badge badge-info">HQ Testing</span>}
                      {req.status === 'REJECTED' && <span className="badge badge-danger">Rejected</span>}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.approved_product && (
                          <Link 
                            to={`/products/${req.approved_product.id}`}
                            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to unlist this item?')) {
                              deleteMutation.mutate(req.id);
                            }
                          }}
                          disabled={deleteMutation.isLoading}
                          className="p-2 rounded-lg border border-[var(--border)] hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                          title="Unlist Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
