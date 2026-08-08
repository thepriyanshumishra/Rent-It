import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CustomerTable from '../../components/admin/CustomerTable';
import { Search } from 'lucide-react';

const fetchCustomers = async () => {
  return [
    { id: 1, name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543210', total_rentals: 5, active_rentals: 1, created_at: '2025-01-15T00:00:00Z' },
    { id: 2, name: 'John Doe', email: 'john@example.com', phone: '+91 9876543211', total_rentals: 12, active_rentals: 0, created_at: '2024-11-20T00:00:00Z' },
  ];
};

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: fetchCustomers
  });

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Customers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-sm mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-[var(--text)]">{customers.length}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-sm mb-1">Active Renters</p>
          <p className="text-2xl font-bold text-[var(--success)]">{customers.filter(c => c.active_rentals > 0).length}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-sm mb-1">Overdue Customers</p>
          <p className="text-2xl font-bold text-[var(--danger)]">0</p>
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <CustomerTable customers={filtered} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
