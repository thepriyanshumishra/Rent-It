import React from 'react';
import DataTable from '../ui/DataTable';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';

export default function CustomerTable({ customers = [], loading = false }) {
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0">
            {row.name.charAt(0)}
          </div>
          <span className="font-medium text-[var(--text)]">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'contact',
      cell: (row) => (
        <div className="text-sm">
          <p>{row.email}</p>
          <p className="text-[var(--text-muted)]">{row.phone}</p>
        </div>
      )
    },
    {
      header: 'Total Rentals',
      accessor: 'total_rentals',
      cell: (row) => <span className="font-medium">{row.total_rentals || 0}</span>
    },
    {
      header: 'Active Rentals',
      accessor: 'active_rentals',
      cell: (row) => (
        row.active_rentals > 0 
          ? <Badge variant="info">{row.active_rentals} Active</Badge> 
          : <span className="text-[var(--text-muted)]">None</span>
      )
    },
    {
      header: 'Joined',
      accessor: 'created_at',
      cell: (row) => <span className="text-sm text-[var(--text-secondary)]">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/customers/${row.id}`);
            }}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] rounded-md transition-colors"
          >
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      loading={loading}
      onRowClick={(row) => navigate(`/admin/customers/${row.id}`)}
      emptyMessage="No customers found."
    />
  );
}
