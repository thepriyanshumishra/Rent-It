import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Filter } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import PriceDisplay from '../../components/ui/PriceDisplay';

const fetchQuotations = async () => {
  return [
    { id: 1, quoteNumber: 'QT-2026-001', customerName: 'Alice Johnson', items: 'Sony A7III + Lens', total: 6500, deposit: 5000, validUntil: '2026-08-15', status: 'sent' },
    { id: 2, quoteNumber: 'QT-2026-002', customerName: 'Bob Smith', items: 'Lighting Kit', total: 2000, deposit: 1000, validUntil: '2026-08-10', status: 'draft' },
  ];
};

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['admin-quotations'],
    queryFn: fetchQuotations
  });

  const columns = [
    {
      header: 'Quote #',
      accessor: 'quoteNumber',
      cell: (row) => <span className="font-medium text-[var(--text)]">{row.quoteNumber}</span>
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row) => <span className="text-sm">{row.customerName}</span>
    },
    {
      header: 'Products',
      accessor: 'items',
      cell: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.items}</span>
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (row) => <PriceDisplay amount={row.total} className="font-medium" />
    },
    {
      header: 'Valid Until',
      accessor: 'validUntil',
      cell: (row) => <span className="text-sm">{new Date(row.validUntil).toLocaleDateString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        let variant = 'default';
        if (row.status === 'sent') variant = 'info';
        if (row.status === 'confirmed' || row.status === 'converted') variant = 'success';
        if (row.status === 'expired') variant = 'danger';
        return <Badge variant={variant} className="capitalize">{row.status}</Badge>;
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/quotations/${row.id}`)}>
          View
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Quotations</h2>
        <Button variant="primary" className="gap-2" onClick={() => navigate('/admin/quotations/new')}>
          <Plus size={16} /> New Quotation
        </Button>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[var(--text-muted)]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="converted">Converted to Order</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <DataTable 
            columns={columns} 
            data={statusFilter === 'all' ? quotations : quotations.filter(q => q.status === statusFilter)} 
            loading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
