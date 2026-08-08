import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Wallet, Percent, PlusCircle, Clock, Search, ExternalLink, Trash2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { toast } from '../../components/ui/Toast';
import api from '../../api/axios';

export default function LenderDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['lender-listing-requests'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/listing-requests/');
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
      } catch (e) {
        return [];
      }
    }
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete listing request "${name}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/listing-requests/${id}/`);
      toast.success(`Listing request "${name}" deleted successfully.`);
      queryClient.invalidateQueries(['lender-listing-requests']);
    } catch (err) {
      toast.error('Failed to delete listing request.');
    } finally {
      setDeletingId(null);
    }
  };

  const walletBalance = user?.lender_profile?.wallet_balance || 0;
  const totalEarnings = user?.lender_profile?.total_earnings || 0;

  const filteredRequests = requests.filter(req => 
    req.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="card p-6 border border-[var(--border)] bg-gradient-to-r from-[var(--accent-subtle)] to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl shadow-xs">
        <div>
          <span className="badge badge-info mb-2 font-bold uppercase tracking-wider text-[10px]">Verified Lender Partner</span>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Lender Earnings & Fleet Overview</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
            You earn 60% of every completed rental. RentIt HQ handles quality testing, escrow, and doorstep logistics.
          </p>
        </div>
        <Link to="/lender/listings/new" className="shrink-0">
          <button className="btn-primary py-2.5 px-5 font-bold text-xs flex items-center gap-2 rounded-xl shadow-sm">
            <PlusCircle className="w-4 h-4" /> List New Equipment
          </button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border border-[var(--border)] rounded-2xl bg-[var(--bg-elevated)] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Available Wallet Balance</span>
            <Wallet className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-black text-[var(--text)]">₹{Number(walletBalance).toLocaleString()}</div>
          <span className="text-[11px] text-[var(--success)] font-extrabold flex items-center gap-1 mt-1">
            Ready for instant bank withdrawal
          </span>
        </div>

        <div className="card p-5 border border-[var(--border)] rounded-2xl bg-[var(--bg-elevated)] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Total Lifetime Earnings</span>
            <Percent className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-[var(--text)]">₹{Number(totalEarnings).toLocaleString()}</div>
          <span className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">
            60% Net Payout Split Share
          </span>
        </div>

        <div className="card p-5 border border-[var(--border)] rounded-2xl bg-[var(--bg-elevated)] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Total Equipment Submitted</span>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-[var(--text)]">{requests?.length || 0} Items</div>
          <span className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">
            Pending HQ check & Live on site
          </span>
        </div>
      </div>

      {/* Equipment Listings Table Section */}
      <div className="card border border-[var(--border)] p-6 space-y-4 rounded-2xl bg-[var(--bg-elevated)] shadow-xs">
        
        {/* Search & Header Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="font-black text-lg text-[var(--text)] tracking-tight">My Equipment Listings & Status</h3>
            <p className="text-xs text-[var(--text-muted)] font-medium">Track physical inspection at HQ, view live listings, and manage submissions.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={15} />
            <input 
              type="text" 
              placeholder="Search listings by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-xs font-medium py-2 rounded-xl w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-sm text-[var(--text-muted)] font-medium">Loading listings...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <PlusCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <h4 className="font-extrabold text-base text-[var(--text)]">
              {searchTerm ? 'No matching listings found' : 'No Equipment Listed Yet'}
            </h4>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-medium">
              {searchTerm ? 'Try searching for another keyword.' : 'Start earning 60% passive income today by submitting your first camera, MacBook, or e-bike for HQ review.'}
            </p>
            {!searchTerm && (
              <Link to="/lender/listings/new">
                <button className="btn-primary py-2 px-4 text-xs font-extrabold mt-2 rounded-xl shadow-sm">Submit First Item</button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="pb-3 font-black">Equipment Name</th>
                  <th className="pb-3 font-black">Rate / Day</th>
                  <th className="pb-3 font-black">Deposit</th>
                  <th className="pb-3 font-black">Bill Uploaded</th>
                  <th className="pb-3 font-black">HQ Status</th>
                  <th className="pb-3 font-black">Date Submitted</th>
                  <th className="pb-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredRequests.map((req) => {
                  const isApproved = req.status === 'APPROVED' || req.status === 'PARTIALLY_APPROVED';
                  const slug = req.product_slug || req.slug || req.id;

                  return (
                    <tr key={req.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="py-4 font-black text-[var(--text)]">{req.product_name}</td>
                      <td className="py-4 font-bold text-[var(--text-secondary)]">₹{Number(req.daily_price).toLocaleString()}</td>
                      <td className="py-4 font-medium text-[var(--text-muted)]">₹{Number(req.security_deposit).toLocaleString()}</td>
                      <td className="py-4">
                        {req.purchase_bill_url ? (
                          <span className="badge badge-success text-[10px] font-extrabold">Bill Attached</span>
                        ) : (
                          <span className="badge badge-warning text-[10px] font-extrabold">Verification Pending</span>
                        )}
                      </td>
                      <td className="py-4">
                        {req.status === 'APPROVED' && <span className="badge badge-success text-[10px] font-extrabold">APPROVED & LIVE</span>}
                        {req.status === 'PARTIALLY_APPROVED' && <span className="badge badge-info text-[10px] font-extrabold">PARTIALLY APPROVED</span>}
                        {req.status === 'PENDING_VERIFICATION' && <span className="badge badge-warning text-[10px] font-extrabold">PENDING HQ CHECK</span>}
                        {req.status === 'INSPECTION_SCHEDULED' && <span className="badge badge-info text-[10px] font-extrabold">HQ TESTING</span>}
                        {req.status === 'REJECTED' && <span className="badge badge-danger text-[10px] font-extrabold">REJECTED</span>}
                      </td>
                      <td className="py-4 text-xs text-[var(--text-muted)] font-medium">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isApproved && (
                            <Link 
                              to={`/product/${slug}`}
                              target="_blank"
                              className="px-2.5 py-1.5 text-xs font-black text-[var(--accent)] bg-[var(--accent-subtle)] hover:bg-[var(--accent)] hover:text-white rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                              title="View Live Listing on Storefront"
                            >
                              <ExternalLink size={13} /> View Listing
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(req.id, req.product_name)}
                            disabled={deletingId === req.id}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-xl transition-all cursor-pointer"
                            title="Delete Listing Request"
                          >
                            <Trash2 size={16} />
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

    </div>
  );
}
