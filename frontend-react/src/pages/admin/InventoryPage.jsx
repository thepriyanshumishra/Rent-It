import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import InventoryTable from '../../components/admin/InventoryTable';
import Button from '../../components/ui/Button';
import { Plus, Search } from 'lucide-react';

const fetchInventory = async () => {
  return [
    { inventory_id: 'INV-001', serial_number: 'SN12345', product_name: 'Sony A7III', variant_name: 'Body', status: 'available', condition: 'good', barcode: '10001' },
    { inventory_id: 'INV-002', serial_number: 'SN12346', product_name: 'Sony A7III', variant_name: 'Body', status: 'rented', condition: 'fair', barcode: '10002' },
    { inventory_id: 'INV-003', serial_number: 'LNS-778', product_name: 'Canon 24-70mm', variant_name: 'Lens', status: 'maintenance', condition: 'damaged', barcode: '20001' },
  ];
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: fetchInventory
  });

  const filtered = inventory.filter(i => 
    i.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Inventory</h2>
        <Button variant="primary" className="gap-2">
          <Plus size={16} /> Add Item
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total', count: inventory.length, color: 'text-[var(--text)]' },
          { label: 'Available', count: inventory.filter(i => i.status === 'available').length, color: 'text-[var(--success)]' },
          { label: 'Rented', count: inventory.filter(i => i.status === 'rented').length, color: 'text-[var(--info)]' },
          { label: 'Reserved', count: 0, color: 'text-[var(--text-secondary)]' },
          { label: 'Overdue', count: 0, color: 'text-[var(--warning)]' },
          { label: 'Repair', count: inventory.filter(i => i.status === 'maintenance').length, color: 'text-[var(--danger)]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center cursor-pointer hover:border-[var(--accent)] transition-colors">
            <p className={`text-xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-[var(--text-muted)] text-xs mt-1 uppercase tracking-wider font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search by serial number, product name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <InventoryTable items={filtered} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
