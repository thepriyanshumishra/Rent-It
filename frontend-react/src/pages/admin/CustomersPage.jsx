import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CustomerTable from '../../components/admin/CustomerTable';
import EmptyState from '../../components/ui/EmptyState';
import { Search, Users } from 'lucide-react';
import api from '../../api/axios';

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: usersRaw = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/auth/customers/');
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
      } catch (e) {
        return [];
      }
    }
  });

  const { data: allOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-rentals-all'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/rentals/orders/');
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
      } catch (e) {
        return [];
      }
    }
  });

  // Merge placed orders from local storage
  let localOrders = [];
  try {
    const stored = localStorage.getItem('rentos_placed_orders');
    if (stored) localOrders = JSON.parse(stored);
  } catch (e) {}

  const mergedOrders = [...allOrders, ...localOrders];

  const customers = (Array.isArray(usersRaw) ? usersRaw : []).map(u => {
    const uOrders = mergedOrders.filter(o => String(o.user?.id || o.user) === String(u.id) || o.user?.email === u.email);
    const totCount = Math.max(u.total_rentals || 0, uOrders.length);
    const actCount = Math.max(u.active_rentals || 0, uOrders.filter(o => o.status === 'active' || o.status === 'ACTIVE' || o.status === 'CONFIRMED').length);
    return {
      ...u,
      total_rentals: totCount,
      active_rentals: actCount
    };
  });

  const filtered = customers.filter(c => 
    (c.name || c.full_name || c.username || '')?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeRentersCount = customers.filter(c => c.role === 'RENTER' || c.active_rentals > 0).length;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Customer Directory</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Registered customer accounts, verified renters, and identity profiles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border)] text-center shadow-xs">
          <p className="text-[var(--text-muted)] text-xs font-extrabold uppercase tracking-wider mb-1">Total Users</p>
          <p className="text-2xl font-black text-[var(--text)]">{customers.length}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border)] text-center shadow-xs">
          <p className="text-[var(--text-muted)] text-xs font-extrabold uppercase tracking-wider mb-1">Verified Renters / Active</p>
          <p className="text-2xl font-black text-[var(--success)]">{activeRentersCount}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border)] text-center shadow-xs">
          <p className="text-[var(--text-muted)] text-xs font-extrabold uppercase tracking-wider mb-1">Overdue Accounts</p>
          <p className="text-2xl font-black text-[var(--danger)]">0</p>
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-xs font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filtered.length === 0 && !loadingUsers ? (
            <EmptyState title="No Customers Found" description="No customer accounts match your search criteria." />
          ) : (
            <CustomerTable customers={filtered} loading={loadingUsers || loadingOrders} />
          )}
        </div>
      </div>
    </div>
  );
}
