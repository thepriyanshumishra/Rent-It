import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Wallet, Percent, PlusCircle, Clock, ArrowUpRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';

export default function RenterDashboardPage() {
  const { user } = useAuth();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['renter-listing-requests'],
    queryFn: async () => {
      const { data } = await api.get('/listing-requests/');
      return data.results || data || [];
    }
  });

  const walletBalance = user?.renter_profile?.wallet_balance || 0;
  const totalEarnings = user?.renter_profile?.total_earnings || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="card p-6 border border-[var(--border)] bg-gradient-to-r from-[var(--accent-subtle)] to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl">
        <div>
          <span className="badge badge-info mb-2 font-bold uppercase tracking-wider text-[10px]">Verified Renter Partner</span>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Renter Earnings & Fleet Overview</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
            You earn 60% of every completed rental. RentIt HQ handles quality testing, escrow, and doorstep logistics.
          </p>
        </div>
        <Link to="/renter/listings/new">
          <button className="btn-primary py-2.5 px-5 font-bold text-sm flex items-center gap-2 rounded-xl">
            <PlusCircle className="w-4 h-4" /> List New Equipment
          </button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Available Wallet Balance</span>
            <Wallet className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-black text-[var(--text)]">₹{Number(walletBalance).toLocaleString()}</div>
          <span className="text-[11px] text-[var(--success)] font-extrabold flex items-center gap-1 mt-1">
            Ready for instant bank withdrawal
          </span>
        </div>

        <div className="card p-5 border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Lifetime Earnings</span>
            <Percent className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-[var(--text)]">₹{Number(totalEarnings).toLocaleString()}</div>
          <span className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">
            60% Net Payout Split Share
          </span>
        </div>

        <div className="card p-5 border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Equipment Submitted</span>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-[var(--text)]">{requests?.length || 0} Items</div>
          <span className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">
            Pending HQ check & Live on site
          </span>
        </div>
      </div>

      {/* Recent Listing Requests Table */}
      <div className="card border border-[var(--border)] p-6 space-y-4 rounded-2xl">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="font-extrabold text-base text-[var(--text)]">My Equipment Listings & Status</h3>
            <p className="text-xs text-[var(--text-muted)]">Track physical inspection at HQ and approval progress.</p>
          </div>
          <Link to="/renter/listings" className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-sm text-[var(--text-muted)]">Loading listings...</div>
        ) : requests?.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <PlusCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <h4 className="font-bold text-base text-[var(--text)]">No Equipment Listed Yet</h4>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Start earning 60% passive income today by submitting your first camera, MacBook, or e-bike for HQ review.
            </p>
            <Link to="/renter/listings/new">
              <button className="btn-primary py-2 px-4 text-xs font-bold mt-2 rounded-xl">Submit First Item</button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="pb-3 font-extrabold">Equipment Name</th>
                  <th className="pb-3 font-extrabold">Rate / Day</th>
                  <th className="pb-3 font-extrabold">Deposit</th>
                  <th className="pb-3 font-extrabold">Bill Uploaded</th>
                  <th className="pb-3 font-extrabold">HQ Status</th>
                  <th className="pb-3 font-extrabold">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {requests?.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                    <td className="py-3.5 font-extrabold text-[var(--text)]">{req.product_name}</td>
                    <td className="py-3.5 font-bold text-[var(--text-secondary)]">₹{Number(req.daily_price).toLocaleString()}</td>
                    <td className="py-3.5 font-medium text-[var(--text-muted)]">₹{Number(req.security_deposit).toLocaleString()}</td>
                    <td className="py-3.5">
                      {req.purchase_bill_url ? (
                        <span className="badge badge-success">Bill Attached</span>
                      ) : (
                        <span className="badge badge-warning">Verification Pending</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      {req.status === 'APPROVED' && <span className="badge badge-success">Approved & Live</span>}
                      {req.status === 'PARTIALLY_APPROVED' && <span className="badge badge-info">Partially Approved</span>}
                      {req.status === 'PENDING_VERIFICATION' && <span className="badge badge-warning">Pending HQ Check</span>}
                      {req.status === 'INSPECTION_SCHEDULED' && <span className="badge badge-info">HQ Testing</span>}
                      {req.status === 'REJECTED' && <span className="badge badge-danger">Rejected</span>}
                    </td>
                    <td className="py-3.5 text-xs text-[var(--text-muted)]">
                      {new Date(req.created_at).toLocaleDateString()}
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
