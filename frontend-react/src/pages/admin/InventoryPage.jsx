import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import InventoryTable from '../../components/admin/InventoryTable';
import EmptyState from '../../components/ui/EmptyState';
import { Search, Box, Plus } from 'lucide-react';
import api from '../../api/axios';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: productsRaw = [], isLoading } = useQuery({
    queryKey: ['admin-inventory-products'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/products/');
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
      } catch (e) {
        return [];
      }
    }
  });

  const products = Array.isArray(productsRaw) ? productsRaw : [];

  const inventoryItems = products.map(p => ({
    id: p.id,
    name: p.name,
    category_name: p.category_name || p.category?.name || 'Standard',
    image_url: p.images?.[0]?.image_url || p.images?.[0]?.image || p.primary_image || p.image_url || null,
    renter_name: p.renter?.full_name || p.renter?.first_name || p.renter?.email || 'HQ Fleet',
    renter_email: p.renter?.email || '',
    price: p.price,
    security_deposit: p.security_deposit || p.deposit || 0,
    quantity: p.quantity ?? 1,
    available_quantity: p.available_quantity ?? 0,
    is_active: p.is_active
  }));

  const filtered = inventoryItems.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.renter_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = inventoryItems.length;
  const totalUnits = inventoryItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const availableUnits = inventoryItems.reduce((acc, curr) => acc + (curr.available_quantity || 0), 0);
  const rentedUnits = Math.max(0, totalUnits - availableUnits);

  return (
    <div className="space-y-6 flex flex-col h-full">
      
      {/* Header with Top-Right + Add Product Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">HQ Equipment Inventory</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Monitor real-time fleet stock, renter equipment listings, and available units.
          </p>
        </div>
        <Link 
          to="/admin/products/new"
          className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm shrink-0"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Real Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Equipment Models', count: totalProducts, color: 'text-[var(--text)]' },
          { label: 'Total Fleet Units', count: totalUnits, color: 'text-[var(--text)]' },
          { label: 'Available Stock', count: availableUnits, color: 'text-[var(--success)]' },
          { label: 'Currently Rented', count: rentedUnits, color: 'text-[var(--info)]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border)] text-center shadow-xs">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
            <p className="text-[var(--text-muted)] text-[10px] mt-1 uppercase tracking-wider font-extrabold">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search equipment name, category, or owner..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-xs font-medium"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <EmptyState 
              icon={Box} 
              title="No Inventory Gear Found" 
              description="Inventory list will automatically populate when listing requests are inspected and approved by HQ." 
            />
          ) : (
            <InventoryTable items={filtered} loading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}
