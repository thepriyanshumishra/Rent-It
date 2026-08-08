import React from 'react';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Eye, Edit, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InventoryTable({ items = [], loading = false, onStatusUpdate }) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'available': return 'success';
      case 'rented': return 'info';
      case 'damaged': return 'danger';
      case 'overdue': return 'warning';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const columns = [
    {
      header: 'ID / Serial',
      accessor: 'serial',
      cell: (row) => (
        <div>
          <p className="font-medium text-[var(--text)]">{row.inventory_id}</p>
          <p className="text-xs text-[var(--text-muted)]">SN: {row.serial_number || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Product',
      accessor: 'product',
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row.product_name}</p>
          {row.variant_name && <p className="text-xs text-[var(--text-muted)]">{row.variant_name}</p>}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={getStatusColor(row.status)}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Condition',
      accessor: 'condition',
      cell: (row) => <span className="text-sm capitalize">{row.condition || 'Good'}</span>
    },
    {
      header: 'QR Code',
      accessor: 'qr',
      cell: (row) => (
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <QrCode size={14} /> {row.barcode || 'Generate'}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button 
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] rounded-md transition-colors"
            title="Edit Details"
          >
            <Edit size={16} />
          </button>
          {row.status === 'rented' && (
            <button 
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] rounded-md transition-colors"
              title="View Active Rental"
            >
              <Eye size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      loading={loading}
      emptyMessage="No inventory items found."
    />
  );
}
