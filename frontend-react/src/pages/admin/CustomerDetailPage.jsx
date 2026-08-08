import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, Calendar } from 'lucide-react';
import RentalTable from '../../components/admin/RentalTable';
import DepositTable from '../../components/admin/DepositTable';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('rentals');

  // Mock data
  const customer = {
    id,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 9876543210',
    joined: '2025-01-15T00:00:00Z',
    role: 'Customer',
  };

  const tabs = [
    { id: 'rentals', label: 'Rental History' },
    { id: 'deposits', label: 'Deposits' },
    { id: 'payments', label: 'Payments' },
    { id: 'profile', label: 'Profile Settings' }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-4">
        <Link to="/admin/customers" className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-[var(--text)]">{customer.name}</h2>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] text-2xl font-bold flex items-center justify-center shrink-0">
          {customer.name.charAt(0)}
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-bold text-[var(--text)]">{customer.name}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5"><Mail size={14} /> {customer.email}</span>
            <span className="flex items-center gap-1.5"><Phone size={14} /> {customer.phone}</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {new Date(customer.joined).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="px-3 py-1 bg-[var(--bg-subtle)] text-[var(--text-secondary)] rounded-full text-xs font-medium uppercase tracking-wider">
          {customer.role}
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col flex-1 overflow-hidden">
        <div className="px-6 pt-4 border-b border-[var(--border)] flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium relative transition-colors ${activeTab === tab.id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-0">
          {activeTab === 'rentals' && (
            <RentalTable rentals={[]} loading={false} showCustomer={false} />
          )}
          {activeTab === 'deposits' && (
            <DepositTable deposits={[]} loading={false} />
          )}
          {activeTab === 'payments' && (
            <div className="p-6 text-center text-[var(--text-muted)]">Payment history coming soon...</div>
          )}
          {activeTab === 'profile' && (
            <div className="p-6 text-center text-[var(--text-muted)]">Profile editing coming soon...</div>
          )}
        </div>
      </div>
    </div>
  );
}
