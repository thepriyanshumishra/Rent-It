import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Filter } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import PriceDisplay from '../../components/ui/PriceDisplay';
import { api } from '../../api';

const fetchQuotations = async () => {
  const res = await api.get('/quotations/quotations/');
  const data = res.data;
  return Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
};

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['admin-quotations'],
    queryFn: fetchQuotations,
  });

  const filtered =
    statusFilter === 'all'
      ? quotations
      : quotations.filter((q) => q.status === statusFilter);

  const columns = [
    {
      header: 'Quote #',
      accessor: 'quote_number',
      cell: (row) => (
        <span className="font-medium text-[var(--text)]">
          {row.quote_number || `QT-${String(row.id).padStart(4, '0')}`}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {row.customer_name || row.customer?.full_name || row.customer?.email || '—'}
        </span>
      ),
    },
    {
      header: 'Items',
      accessor: 'items',
      cell: (row) => {
        const count = row.items?.length ?? 0;
        return (
          <span className="text-sm text-[var(--text-secondary)]">
            {count > 0 ? `${count} item${count > 1 ? 's' : ''}` : '—'}
          </span>
        );
      },
    },
    {
      header: 'Total',
      accessor: 'total_amount',
      cell: (row) => (
        <PriceDisplay amount={row.total_amount || 0} className="font-medium" />
      ),
    },
    {
      header: 'Valid Until',
      accessor: 'valid_until',
      cell: (row) =>
        row.valid_until ? (
          <span className="text-sm text-[var(--text-secondary)]">
            {new Date(row.valid_until).toLocaleDateString('en-IN')}
          </span>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">—</span>
        ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        let variant = 'default';
        if (row.status === 'sent') variant = 'info';
        if (row.status === 'confirmed' || row.status === 'converted') variant = 'success';
        if (row.status === 'expired' || row.status === 'cancelled') variant = 'danger';
        return (
          <Badge variant={variant} className="capitalize">
            {row.status || 'draft'}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/quotations/${row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Quotations</h2>
        <Button
          variant="primary"
          className="gap-2"
          onClick={() => navigate('/admin/quotations/new')}
        >
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
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <span className="text-sm text-[var(--text-muted)]">
            {filtered.length} quotation{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex-1 overflow-auto">
          <DataTable columns={columns} data={filtered} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
