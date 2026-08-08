import React from 'react';
import DataTable from '../ui/DataTable';
import StatusIndicator from '../ui/StatusIndicator';
import PriceDisplay from '../ui/PriceDisplay';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import Badge from '../ui/Badge';

export default function RentalTable({ rentals = [], loading = false, onStatusUpdate, showCustomer = true }) {
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Order #',
      accessor: 'orderNumber',
      cell: (row) => <span className="font-medium text-[var(--text)]">{row.orderNumber}</span>
    },
    ...(showCustomer ? [{
      header: 'Customer',
      accessor: 'customer',
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row.customerName}</p>
          <p className="text-xs text-[var(--text-muted)]">{row.customerEmail}</p>
        </div>
      )
    }] : []),
    {
      header: 'Products',
      accessor: 'products',
      cell: (row) => (
        <div className="max-w-[200px] truncate text-sm">
          {row.items?.map(item => item.productName).join(', ') || 'Unknown Product'}
        </div>
      )
    },
    {
      header: 'Period',
      accessor: 'period',
      cell: (row) => (
        <div className="text-xs">
          <p>{new Date(row.startDate).toLocaleDateString()}</p>
          <p className="text-[var(--text-muted)]">to {new Date(row.endDate).toLocaleDateString()}</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusIndicator status={row.status} />
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      cell: (row) => <PriceDisplay amount={row.totalAmount} className="font-medium" />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/rentals/${row.id}`);
            }}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] rounded-md transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          
          {onStatusUpdate && (
            <div className="relative group">
              <button 
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] rounded-md transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              {/* Dropdown would go here, simplified for now */}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={rentals}
      loading={loading}
      onRowClick={(row) => navigate(`/admin/rentals/${row.id}`)}
      emptyMessage="No rentals found."
    />
  );
}
