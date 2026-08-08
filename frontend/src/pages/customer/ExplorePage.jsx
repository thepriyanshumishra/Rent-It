import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Calendar, ArrowRight, Star, Package } from 'lucide-react';
import { productsApi } from '../../api';
import Spinner from '../../components/ui/Spinner';

const CATEGORIES_ICONS = {
  'Electronics': '📷',
  'Electronics & AV': '📷',
  'Cameras': '🎥',
  'Vehicles': '🛵',
  'Audio': '🎵',
  'Furniture': '🪑',
  'Outdoor': '⛺',
};

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const dayPrice = product.priceRules?.[0]?.rate_paise;
  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="card overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all duration-200 hover:shadow-lg"
    >
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        <img
          src={product.imageUrls?.[0] || `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <span className="badge badge-success text-[10px]">
            {product.totalInventory} available
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mb-1">
          {product.category?.name}
        </p>
        <h3 className="font-bold text-[var(--text)] text-sm leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        {product.short_desc && (
          <p className="text-[11px] text-[var(--text-muted)] mb-3 line-clamp-1">{product.short_desc}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            {dayPrice ? (
              <>
                <span className="text-lg font-black text-[var(--text)]">{formatPrice(dayPrice)}</span>
                <span className="text-xs text-[var(--text-muted)]">/day</span>
              </>
            ) : (
              <span className="text-sm text-[var(--text-muted)]">Contact for pricing</span>
            )}
          </div>
          <button className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all group-hover:scale-105">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {product.depositAmountPaise > 0 && (
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
            + {formatPrice(product.depositAmountPaise)} deposit
          </p>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', search, selectedCategory],
    queryFn: () => productsApi.list({ search: search || undefined, category: selectedCategory || undefined }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories(),
    staleTime: 300_000,
  });

  const products = productsData?.data?.data || [];
  const categories = categoriesData?.data?.data || [];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Search Bar */}
      <div className="bg-[var(--bg-elevated)] border-b border-[var(--border)] px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black text-[var(--text)] mb-4">Explore Rentals</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                id="explore-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cameras, bikes, gear..."
                className="input-field pl-10"
              />
            </div>
            <select
              id="explore-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field sm:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                !selectedCategory
                  ? 'bg-[var(--accent)] text-white border-transparent'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                  selectedCategory === c.id
                    ? 'bg-[var(--accent)] text-white border-transparent'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
              >
                {CATEGORIES_ICONS[c.name] || '📦'} {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)]">No products found</p>
            {search && (
              <button onClick={() => setSearch('')} className="btn-outline mt-4 text-sm">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
