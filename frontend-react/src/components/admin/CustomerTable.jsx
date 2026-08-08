import React from 'react';
import DataTable from '../ui/DataTable';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';

const getCustomerName = (row) => {
  if (!row) return 'Customer';
  if (row.name) return row.name;
  const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim();
  if (fullName) return fullName;
  return row.username || row.email?.split('@')[0] || 'Customer';
};

export default function CustomerTable({ customers = [], loading = false }) {
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Name / Role',
      accessor: 'name',
      cell: (row) => {
        const name = getCustomerName(row);
        const role = row.role || 'CUSTOMER';
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-extrabold text-[var(--text)] text-xs block">{name}</span>
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider block">{role}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Contact Info',
      accessor: 'contact',
      cell: (row) => (
        <div className="text-xs">
          <p className="font-bold text-[var(--text)]">{row.email || 'No email'}</p>
          <p className="text-[var(--text-muted)] font-medium">{row.phone_number || row.phone || 'No phone'}</p>
        </div>
      )
    },
    {
      header: 'Total Rentals',
      accessor: 'total_rentals',
      cell: (row) => <span className="font-bold text-xs text-[var(--text)]">{row.total_rentals || row.rentals_count || 0}</span>
    },
    {
      header: 'Active Status',
      accessor: 'active_rentals',
      cell: (row) => {
        const activeCount = row.active_rentals || 0;
        return activeCount > 0 
          ? <Badge variant="info">{activeCount} Active</Badge> 
          : <span className="text-[11px] text-[var(--text-muted)] font-medium">No Active Rentals</span>;
      }
    },
    {
      header: 'Joined Date',
      accessor: 'created_at',
      cell: (row) => {
        const dateVal = row.created_at || row.date_joined;
        return (
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            {dateVal ? new Date(dateVal).toLocaleDateString() : 'Recent'}
          </span>
        );
      }
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
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] rounded-xl transition-colors"
            title="View Details"
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
      emptyMessage="No customer accounts registered yet."
    />
  );
}
