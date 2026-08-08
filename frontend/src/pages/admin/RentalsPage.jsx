import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Eye, CheckCircle2, RotateCcw, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { rentalsApi } from '../../api';
import Spinner from '../../components/ui/Spinner';

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RentalsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRental, setSelectedRental] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rentals', statusFilter],
    queryFn: () => rentalsApi.list({ status: statusFilter || undefined }),
  });

  const rentals = data?.data?.data || [];

  const filteredRentals = rentals.filter((r) => {
    const q = search.toLowerCase();
    const num = r.rental_number?.toLowerCase() || '';
    const cust = r.customer?.name?.toLowerCase() || r.customer?.user?.email?.toLowerCase() || '';
    return num.includes(q) || cust.includes(q);
  });

  // Action Handlers
  const handleAction = async (actionFn, rentalId, body) => {
    try {
      await actionFn(rentalId, body);
      queryClient.invalidateQueries(['admin-rentals']);
      setSelectedRental(null);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Operation failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">Rental Lifecycle Operations</h1>
          <p className="text-sm text-[var(--text-muted)]">Track pickups, active rentals, returns, and deposit settlements</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # or Customer..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ACTIVE">Active</option>
          <option value="OVERDUE">Overdue</option>
          <option value="RETURNED">Returned</option>
          <option value="UNDER_INSPECTION">Under Inspection</option>
          <option value="PENDING_SETTLEMENT">Pending Settlement</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Rentals Table */}
      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase bg-[var(--bg-subtle)]">
                  <th className="p-4 font-semibold">Order #</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Rental Period</th>
                  <th className="p-4 font-semibold">Total / Deposit</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredRentals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">No rentals found</td>
                  </tr>
                ) : (
                  filteredRentals.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--bg-subtle)]/40 transition-colors">
                      <td className="p-4 font-bold text-[var(--text)]">#{r.rental_number}</td>
                      <td className="p-4">
                        <p className="font-semibold text-[var(--text)]">{r.customer?.name || 'Customer'}</p>
                        <p className="text-xs text-[var(--text-muted)]">{r.customer?.user?.email}</p>
                      </td>
                      <td className="p-4 text-xs text-[var(--text-secondary)]">
                        {formatDate(r.start_date)} → {formatDate(r.end_date)}
                      </td>
                      <td className="p-4 text-xs">
                        <p className="font-bold text-[var(--text)]">{formatPrice(r.total_paise || 0)}</p>
                        <p className="text-[var(--text-muted)]">Dep: {formatPrice(r.deposit_total_paise || 0)}</p>
                      </td>
                      <td className="p-4">
                        <span className={`badge ${
                          r.status === 'ACTIVE' ? 'badge-success' :
                          r.status === 'OVERDUE' ? 'badge-danger' :
                          r.status === 'CONFIRMED' ? 'badge-info' :
                          r.status === 'PENDING_CONFIRMATION' ? 'badge-warning' : 'badge-muted'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedRental(r)}
                          className="btn-outline text-xs py-1.5 px-3 gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details & Operations Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto relative animate-fade-in space-y-5">
            <button
              onClick={() => setSelectedRental(null)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Rental Details</span>
              <h2 className="text-xl font-black text-[var(--text)]">Order #{selectedRental.rental_number}</h2>
              <p className="text-xs text-[var(--text-muted)]">Customer: {selectedRental.customer?.name} ({selectedRental.customer?.user?.email})</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[var(--bg-subtle)] p-3 rounded-xl">
              <div>
                <p className="text-[var(--text-muted)]">Start Date</p>
                <p className="font-semibold text-[var(--text)]">{formatDate(selectedRental.start_date)}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)]">End Date</p>
                <p className="font-semibold text-[var(--text)]">{formatDate(selectedRental.end_date)}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)]">Total Amount</p>
                <p className="font-bold text-[var(--accent)]">{formatPrice(selectedRental.total_paise || 0)}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)]">Deposit Balance</p>
                <p className="font-bold text-[var(--text)]">{formatPrice(selectedRental.deposit_total_paise || 0)}</p>
              </div>
            </div>

            {/* Lifecycle Action Buttons */}
            <div className="border-t border-[var(--border)] pt-4 space-y-2">
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">Operation Actions</p>

              {selectedRental.status === 'PENDING_CONFIRMATION' && (
                <button
                  onClick={() => handleAction(rentalsApi.confirmPayment, selectedRental.id)}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm Payment & Order
                </button>
              )}

              {selectedRental.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleAction(rentalsApi.confirmPickup, selectedRental.id, { deliveredBy: 'Admin Staff' })}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm Customer Pickup
                </button>
              )}

              {(selectedRental.status === 'ACTIVE' || selectedRental.status === 'OVERDUE') && (
                <button
                  onClick={() => handleAction(rentalsApi.processReturn, selectedRental.id, { returnedBy: 'Admin Staff' })}
                  className="btn-outline w-full justify-center py-2.5 text-[var(--info)] border-[var(--info-subtle)]"
                >
                  <RotateCcw className="w-4 h-4" /> Record Product Return
                </button>
              )}

              {(selectedRental.status === 'RETURNED' || selectedRental.status === 'UNDER_INSPECTION') && (
                <button
                  onClick={() => handleAction(rentalsApi.inspect, selectedRental.id, { result: 'OK', inspectedBy: 'Inspector Admin' })}
                  className="btn-primary w-full justify-center py-2.5 bg-[var(--success)] hover:bg-[var(--success)]/90"
                >
                  <ShieldCheck className="w-4 h-4" /> Pass Inspection (Condition OK)
                </button>
              )}

              {selectedRental.status === 'PENDING_SETTLEMENT' && (
                <button
                  onClick={() => handleAction(rentalsApi.settle, selectedRental.id, { notes: 'Full deposit refund' })}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Complete Settlement & Refund Deposit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
