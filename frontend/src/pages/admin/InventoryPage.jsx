import { useQuery } from '@tanstack/react-query';
import { Boxes, Package, AlertCircle } from 'lucide-react';
import { productsApi, adminApi } from '../../api';
import Spinner from '../../components/ui/Spinner';

export default function InventoryPage() {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products-inventory'],
    queryFn: () => productsApi.list(),
  });

  const products = productsData?.data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">Inventory Tracking</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">Physical asset counts and availability management</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase bg-[var(--bg-subtle)]">
                <th className="p-4 font-semibold">Equipment Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Total Fleet</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--bg-subtle)]/40">
                  <td className="p-4 font-bold text-[var(--text)]">{p.name}</td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">{p.category?.name || 'Uncategorized'}</td>
                  <td className="p-4 font-semibold text-[var(--text)]">{p.totalInventory || 1} units</td>
                  <td className="p-4">
                    <span className={`badge ${p.totalInventory > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {p.totalInventory > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
