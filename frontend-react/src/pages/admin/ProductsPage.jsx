import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

// Mock API
const fetchProducts = async () => {
  return [
    { id: 1, name: 'Sony A7III', category: 'Cameras', inventory: { available: 2, total: 3 }, status: 'active', price: 1500 },
    { id: 2, name: 'Canon 24-70mm f/2.8', category: 'Lenses', inventory: { available: 1, total: 1 }, status: 'active', price: 800 },
    { id: 3, name: 'DJI Ronin RS3', category: 'Accessories', inventory: { available: 0, total: 2 }, status: 'inactive', price: 1200 },
  ];
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts
  });

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--bg-subtle)] rounded border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] text-xs">
            Img
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{row.category}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Inventory',
      accessor: 'inventory',
      cell: (row) => (
        <span className={row.inventory.available === 0 ? 'text-[var(--danger)] font-medium' : ''}>
          {row.inventory.available} / {row.inventory.total} available
        </span>
      )
    },
    {
      header: 'Base Price',
      accessor: 'price',
      cell: (row) => `₹${row.price}/day`
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/products/${row.id}/edit`)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Products</h2>
        <Button variant="primary" className="gap-2" onClick={() => navigate('/admin/products/new')}>
          <Plus size={16} /> New Product
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-sm mb-1">Total Products</p>
          <p className="text-2xl font-bold text-[var(--text)]">{products.length}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-sm mb-1">Active</p>
          <p className="text-2xl font-bold text-[var(--success)]">{products.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-sm mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-[var(--danger)]">{products.filter(p => p.inventory.available === 0).length}</p>
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
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
          <DataTable 
            columns={columns} 
            data={products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))} 
            loading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
