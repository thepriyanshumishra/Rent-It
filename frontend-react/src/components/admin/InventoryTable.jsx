import React from 'react';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InventoryTable({ items = [], loading = false }) {
  const navigate = useNavigate();

  const getStatusBadge = (row) => {
    const avail = row.available_quantity ?? 0;
    const total = row.quantity ?? 1;
    if (avail === 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (avail < total) return <Badge variant="info">Partially Rented ({avail}/{total})</Badge>;
    return <Badge variant="success">In Stock ({avail}/{total})</Badge>;
  };

  const columns = [
    {
      header: 'Equipment',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
            {row.image_url ? (
              <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-[var(--text-muted)] font-bold">No img</span>
            )}
          </div>
          <div>
            <p className="font-extrabold text-[var(--text)] text-sm">{row.name}</p>
            <p className="text-xs text-[var(--text-muted)] font-medium">{row.category_name || 'Uncategorized'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Listed By',
      accessor: 'owner',
      cell: (row) => (
        <div>
          <p className="text-xs font-bold text-[var(--text)]">{row.renter_name || 'HQ Fleet'}</p>
          {row.renter_email && <p className="text-[11px] text-[var(--text-muted)]">{row.renter_email}</p>}
        </div>
      )
    },
    {
      header: 'Daily Rate & Deposit',
      accessor: 'price',
      cell: (row) => (
        <div>
          <p className="text-xs font-extrabold text-[var(--text)]">₹{Number(row.price || 0).toLocaleString('en-IN')}/day</p>
          <p className="text-[11px] text-[var(--text-muted)] font-medium">Deposit: ₹{Number(row.security_deposit || 0).toLocaleString('en-IN')}</p>
        </div>
      )
    },
    {
      header: 'Fleet Stock',
      accessor: 'stock',
      cell: (row) => (
        <div>
          <p className="text-xs font-black text-[var(--text)]">
            {row.available_quantity ?? 0} Available <span className="text-[var(--text-muted)] font-normal">/ {row.quantity ?? 1} Total</span>
          </p>
          <p className="text-[10px] text-[var(--text-muted)] font-medium">
            {(row.quantity ?? 1) - (row.available_quantity ?? 0)} units currently out
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => getStatusBadge(row)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/products/${row.id}/edit`)}
            className="gap-1 text-xs py-1 px-2.5"
          >
            <Edit size={14} /> Edit
          </Button>
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
