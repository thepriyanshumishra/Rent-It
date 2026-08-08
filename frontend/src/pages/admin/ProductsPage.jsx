import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Plus, Tag } from 'lucide-react';
import { productsApi } from '../../api';
import Spinner from '../../components/ui/Spinner';

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.list(),
  });

  const products = data?.data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">Product Catalog</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">Manage rental products, pricing rules, and deposit requirements</p>
        </div>
        <button className="btn-primary text-xs py-2 px-4 gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.id} className="card overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="badge badge-success text-[10px]">{p.totalInventory} in stock</span>
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">{p.category?.name}</span>
                  <h3 className="font-bold text-[var(--text)] text-sm mb-1">{p.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">{p.short_desc}</p>
                  
                  <div className="bg-[var(--bg-subtle)] p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Daily Rate:</span>
                      <span className="font-bold text-[var(--text)]">{formatPrice(p.priceRules?.[0]?.rate_paise || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Deposit:</span>
                      <span className="font-semibold text-[var(--text-secondary)]">{formatPrice(p.depositAmountPaise || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border-subtle)] flex gap-2">
                <button className="btn-outline flex-1 justify-center text-xs py-1.5">Edit Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
