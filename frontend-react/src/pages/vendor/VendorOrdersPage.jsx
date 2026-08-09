import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, QrCode, Search, Clock, Phone, FileText, CheckCircle2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import QuotationSlipModal from '../../components/shared/QuotationSlipModal';
import { useStore } from '../../context/StoreContext';
import * as rentalsApi from '../../api/rentals';
import { api } from '../../api';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function VendorOrdersPage() {
  const queryClient = useQueryClient();
  const { selectedStore } = useStore();

  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);

  // Fetch orders
  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['store-orders', selectedStore?.id],
    queryFn: async () => {
      const res = await api.get('/rentals/orders/');
      const d = res.data;
      const all = Array.isArray(d) ? d : (d?.results || []);
      if (selectedStore?.id) {
        return all.filter(r => !r.store || r.store === selectedStore.id || r.store_code === selectedStore.code);
      }
      return all;
    },
  });

  // Fast code verification mutation
  const verifyCodeMutation = useMutation({
    mutationFn: async (code) => {
      const matched = rentals.find(
        r => r.pickup_code && r.pickup_code.trim().toUpperCase() === code.trim().toUpperCase()
      );
      if (!matched) {
        throw new Error(`No reserved order found matching pickup verification code "${code}".`);
      }
      return rentalsApi.confirmPickup(matched.id);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      toast.success(`✅ Pickup Confirmed for Order ${res.data?.order_number || ''}! Equipment handed over to customer.`);
      setPickupCodeInput('');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to verify pickup code.');
    },
  });

  // Order Quick Action Mutation
  const actionMutation = useMutation({
    mutationFn: async ({ orderId, action, payload }) => {
      if (action === 'pickup') return rentalsApi.confirmPickup(orderId);
      if (action === 'return') return rentalsApi.processReturn(orderId, payload || { condition_on_return: 'GOOD' });
      return api.post(`/rentals/orders/${orderId}/${action}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      toast.success('Order status updated!');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.detail || 'Action failed.');
    }
  });

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!pickupCodeInput.trim()) {
      toast.error('Please enter customer pickup code (e.g. 8472 or RNT-8472).');
      return;
    }
    verifyCodeMutation.mutate(pickupCodeInput);
  };

  const filteredOrders = rentals.filter(r => {
    const num = (r.order_number || String(r.id) || '').toLowerCase();
    const name = (r.customer_name || '').toLowerCase();
    const code = (r.pickup_code || '').toLowerCase();
    const matchSearch = !searchTerm || num.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Pickup Verification Code Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 p-6 rounded-3xl bg-[var(--accent-subtle)] border-2 border-[var(--accent)]/30 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center">
              <QrCode className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--text)]">
                Instant Pickup Code Verification
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Enter the customer's pickup code (e.g. 8472 or RNT-8472) to confirm identity and release equipment.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifySubmit} className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. PKP-8472 or 8472"
              value={pickupCodeInput}
              onChange={(e) => setPickupCodeInput(e.target.value)}
              className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-2xl px-4 py-3 text-base font-mono font-bold text-[var(--text)] placeholder:font-sans placeholder:text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] uppercase"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={verifyCodeMutation.isPending}
              className="rounded-2xl px-6 font-extrabold text-sm shadow-md shadow-[var(--accent)]/20"
            >
              {verifyCodeMutation.isPending ? 'Verifying...' : 'Verify & Handover'}
            </Button>
          </form>
        </div>

        {/* Store Hub Mini Info */}
        <div className="md:col-span-4 p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3">
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">
            Active Hub Information
          </span>
          <div>
            <h3 className="font-extrabold text-sm text-[var(--text)]">{selectedStore?.name}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{selectedStore?.address}</p>
          </div>
          <div className="pt-2 border-t border-[var(--border)] space-y-1 text-xs text-[var(--text-muted)]">
            <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> {selectedStore?.opening_time} – {selectedStore?.closing_time}</p>
            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {selectedStore?.phone}</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xs">
        
        {/* Controls */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'RESERVED', label: 'Awaiting Pickup' },
              { id: 'PICKED_UP', label: 'Active Rentals' },
              { id: 'RETURNED', label: 'Returned' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search customer, order # (RNT) or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)]">Loading store orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center text-xs text-[var(--text-muted)]">No orders matching filter.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-extrabold uppercase text-[10px] tracking-wider border-b border-[var(--border)]">
                <tr>
                  <th className="p-3.5">Order Number & Code</th>
                  <th className="p-3.5">Customer Details</th>
                  <th className="p-3.5">Equipment Package</th>
                  <th className="p-3.5">Rental Dates</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Counter Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredOrders.map(order => {
                  const firstItem = order.items?.[0];
                  const itemTitle = firstItem?.product_name_display || firstItem?.product_name || `${order.items?.length || 1} item(s)`;
                  const isReserved = order.status === 'RESERVED' || order.status === 'QUOTATION_SENT';
                  const isActive = order.status === 'PICKED_UP' || order.status === 'ACTIVE' || order.status === 'LATE_RETURN';

                  return (
                    <tr key={order.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-extrabold text-[var(--accent)] font-mono block">{order.order_number || `RNT-${order.id}`}</span>
                        {order.pickup_code && (
                          <span className="font-mono text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 inline-block mt-0.5">
                            Verification Code: {order.pickup_code}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[var(--text)] block">{order.customer_name || order.user?.first_name || 'Customer'}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{order.customer_phone || order.customer_email || order.user?.email}</span>
                      </td>
                      <td className="p-3.5 font-medium text-[var(--text)] max-w-[180px] truncate">
                        {itemTitle}
                      </td>
                      <td className="p-3.5 text-[var(--text-muted)] whitespace-nowrap">
                        {fmtDate(order.rental_start_date)} → {fmtDate(order.rental_end_date)}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          order.status === 'RESERVED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          order.status === 'PICKED_UP' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                          order.status === 'RETURNED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {isReserved && (
                          <button
                            onClick={() => actionMutation.mutate({ orderId: order.id, action: 'pickup' })}
                            className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white font-black text-[11px] hover:bg-[var(--accent-hover)] transition-all cursor-pointer shadow-xs"
                          >
                            ✓ Match Code & Handover
                          </button>
                        )}
                        {isActive && (
                          <button
                            onClick={() => actionMutation.mutate({ orderId: order.id, action: 'return' })}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[11px] hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                          >
                            🔄 Inspect & Return
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderForSlip(order)}
                          className="px-2.5 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-[var(--text)] font-bold text-[11px] hover:border-[var(--accent)] transition-all cursor-pointer"
                        >
                          📄 Quotation Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slip Modal */}
      {selectedOrderForSlip && (
        <QuotationSlipModal
          isOpen={!!selectedOrderForSlip}
          onClose={() => setSelectedOrderForSlip(null)}
          order={selectedOrderForSlip}
        />
      )}
    </div>
  );
}
