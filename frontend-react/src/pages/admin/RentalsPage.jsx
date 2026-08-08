import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import RentalTable from '../../components/admin/RentalTable';
import { Search, Filter, Download } from 'lucide-react';
import Button from '../../components/ui/Button';

// Mock API
const fetchRentals = async () => {
  return [
    { id: 1, orderNumber: 'ORD-1001', customerName: 'John Doe', customerEmail: 'john@example.com', items: [{productName: 'Sony A7III'}], startDate: '2026-08-01', endDate: '2026-08-05', status: 'completed', totalAmount: 4500 },
    { id: 2, orderNumber: 'ORD-1002', customerName: 'Jane Smith', customerEmail: 'jane@example.com', items: [{productName: 'Canon Lens'}], startDate: '2026-08-07', endDate: '2026-08-10', status: 'active', totalAmount: 1200 },
  ];
};

export default function RentalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['admin-rentals'],
    queryFn: fetchRentals
  });

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rental.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Rentals</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Download size={16} /> Export
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['All', 'Active', 'Overdue', 'Pending'].map((status) => (
          <div key={status} className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between cursor-pointer hover:border-[var(--accent)] transition-colors">
            <span className="text-[var(--text-secondary)] font-medium">{status}</span>
            <span className="text-xl font-bold text-[var(--text)]">
              {status === 'All' ? rentals.length : Math.floor(Math.random() * 10)}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
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
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <RentalTable rentals={filteredRentals} loading={isLoading} onStatusUpdate={() => {}} />
        </div>
      </div>
    </div>
  );
}
