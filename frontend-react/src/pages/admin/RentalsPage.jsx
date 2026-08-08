import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import RentalTable from '../../components/admin/RentalTable';
import { api } from '../../api';
import { toast } from '../../components/ui/Toast';

const fetchRentals = async () => {
  const res = await api.get('/rentals/orders/');
  const data = res.data;
  // Handle both paginated and plain list responses
  return Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
};

export default function RentalsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['admin-rentals'],
    queryFn: fetchRentals,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, action, data }) => {
      return await api.post(`/rentals/orders/${orderId}/${action}/`, data || {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rentals'] });
      toast({ title: 'Updated', description: 'Rental status updated.', type: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to update status.',
        type: 'error',
      });
    },
  });

  const handleStatusUpdate = (orderId, action, data) => {
    updateStatusMutation.mutate({ orderId, action, data });
  };

  const filteredRentals = rentals.filter((rental) => {
    const num = rental.order_number || rental.orderNumber || String(rental.id);
    const name =
      rental.user?.full_name ||
      rental.user?.first_name ||
      rental.customerName ||
      '';
    const matchesSearch =
      num.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      rental.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Derive real counts
  const counts = {
    All: rentals.length,
    Active: rentals.filter((r) => r.status === 'ACTIVE').length,
    Overdue: rentals.filter((r) => r.status === 'OVERDUE').length,
    Pending: rentals.filter(
      (r) => r.status === 'PENDING_DELIVERY' || r.status === 'PENDING_CONFIRMATION'
    ).length,
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Rentals</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Download size={16} /> Export
        </Button>
      </div>

      {/* Status summary tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(counts).map(([label, count]) => {
          const filterVal = label === 'All' ? 'all' : label.toLowerCase();
          const isActive = statusFilter === filterVal;
          return (
            <button
              key={label}
              onClick={() => setStatusFilter(filterVal)}
              className={`p-4 rounded-xl border text-left transition-colors ${
                isActive
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              <span className="text-[var(--text-secondary)] font-medium text-sm block mb-1">
                {label}
              </span>
              <span className="text-2xl font-bold text-[var(--text)]">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[var(--text-muted)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All Statuses</option>
              <option value="pending_confirmation">Pending Confirmation</option>
              <option value="pending_delivery">Pending Delivery</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <RentalTable
            rentals={filteredRentals}
            loading={isLoading}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      </div>
    </div>
  );
}
