'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import { formatMoney } from '../../lib/utils';
import {
  Boxes,
  Search,
  Filter,
  Star,
  CheckCircle2,
  ChevronRight,
  PackageCheck,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

const CATEGORIES_LIST = [
  { id: 'all', name: 'All Equipment' },
  { id: 'electronics-av', name: 'Electronics & AV' },
  { id: 'tools-machinery', name: 'Tools & Machinery' },
  { id: 'event-supplies', name: 'Event Supplies' },
];

export default function CategoriesCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating'>('recommended');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/');
      if (res.data.success || Array.isArray(res.data)) {
        setProducts(res.data.data || res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === 'all' ||
      p.category?.slug === selectedCategory ||
      p.category?.name?.toLowerCase().includes(selectedCategory.replace('-', ' '));
    const matchQuery =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const rateA = a.priceRules?.[0]?.rate_paise || 150000;
    const rateB = b.priceRules?.[0]?.rate_paise || 150000;
    if (sortBy === 'price_low') return rateA - rateB;
    if (sortBy === 'price_high') return rateB - rateA;
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Bar */}
      <div className="bg-slate-900 py-10 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
            Equipment Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Browse Rental Categories</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Explore verified professional cameras, power tools, audio systems, and event equipment with real-time stock availability.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search equipment by name, brand, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-purple-600"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-purple-600 cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Daily Rate: Low to High</option>
                <option value="price_high">Daily Rate: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-white rounded-3xl border border-slate-200" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400">
            <Boxes className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold text-slate-700">No equipment found matching your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => {
              const dayRate = product.priceRules?.[0]?.rate_paise || 150000;
              const deposit = product.depositAmountPaise || 500000;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                >
                  <div>
                    {/* Category Pill */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider border border-purple-100">
                        {product.category?.name || 'Equipment'}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9 (42)
                      </span>
                    </div>

                    {/* Image */}
                    <Link
                      href={`/products/${product.id}`}
                      className="aspect-4/3 w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden block p-2 mb-3"
                    >
                      <img
                        src={product.image_url || product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Title & Specs */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {product.totalInventory || 4} Units Available
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition leading-snug">
                        <Link href={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                        {product.short_desc || 'Verified commercial rental asset with multi-point inspection.'}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-black text-slate-900">{formatMoney(dayRate)}</span>
                        <span className="text-xs text-slate-500 font-semibold"> / day</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Deposit: {formatMoney(deposit)}
                      </span>
                    </div>

                    <Link
                      href={`/products/${product.id}`}
                      className="w-full py-2.5 rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      View Details & Rent <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
