import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

const fetchProducts = async () => {
  const res = await api.get('/products/');
  const data = res.data;
  return Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  });

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      cell: (row) => {
        const thumb =
          row.images?.[0]?.image_url ||
          row.images?.[0]?.image ||
          null;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--bg-subtle)] rounded border border-[var(--border)] overflow-hidden flex items-center justify-center text-[var(--text-muted)] text-xs shrink-0">
              {thumb ? (
                <img src={thumb} alt={row.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px]">No img</span>
              )}
            </div>
            <div>
              <p className="font-medium text-[var(--text)]">{row.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{row.category_name || row.category?.name || '—'}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Inventory',
      accessor: 'available_quantity',
      cell: (row) => {
        const avail = row.available_quantity ?? 0;
        const total = row.quantity ?? row.stock_quantity ?? 0;
        return (
          <span className={avail === 0 ? 'text-[var(--danger)] font-medium' : 'text-[var(--text-secondary)]'}>
            {avail} / {total} available
          </span>
        );
      },
    },
    {
      header: 'Daily Rate',
      accessor: 'price',
      cell: (row) => (
        <span className="font-medium text-[var(--text)]">
          ₹{Number(row.price || 0).toLocaleString('en-IN')}/day
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (row) => (
        <Badge variant={row.is_active ? 'success' : 'default'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/products/${row.id}/edit`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Products</h2>
        <Button
          variant="primary"
          className="gap-2"
          onClick={() => navigate('/admin/products/new')}
        >
          <Plus size={16} /> New Product
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-sm mb-1">Total Products</p>
          <p className="text-2xl font-bold text-[var(--text)]">{products.length}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-sm mb-1">Active</p>
          <p className="text-2xl font-bold text-[var(--success)]">
            {products.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-sm mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-[var(--danger)]">
            {products.filter((p) => (p.available_quantity ?? 0) === 0).length}
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <DataTable columns={columns} data={filtered} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
