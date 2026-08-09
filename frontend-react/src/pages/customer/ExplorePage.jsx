import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Filter, X, SlidersHorizontal, Search, Sparkles, 
  Layers, ArrowUpDown, MapPin, Compass, Navigation 
} from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import ProductGrid from '../../components/customer/ProductGrid';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { useStore } from '../../context/StoreContext';
import * as productsApi from '../../api/products';
import { getStoreStocks } from '../../api/stores';

const RADIUS_OPTIONS = [
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 2000, label: 'All India' },
];

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTermInput, setSearchTermInput] = useState(searchParams.get('search') || '');
  const [radiusKm, setRadiusKm] = useState(100);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { userLocation, openStoreModal, selectedStore, allStores } = useStore();

  React.useEffect(() => {
    setIsRefreshing(true);
    const timer = setTimeout(() => {
      setIsRefreshing(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [radiusKm]);
  
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { category: categoryParam, search: searchParam, sort: sortParam }],
    queryFn: () => productsApi.getProducts({ category: categoryParam, search: searchParam, sort: sortParam })
  });

  const { data: stocksData } = useQuery({
    queryKey: ['store-stocks'],
    queryFn: () => getStoreStocks({ limit: 100 })
  });

  const categories = [
    'All Categories',
    'Cameras & Video',
    'Electronics',
    'Vehicles & E-Bikes',
    'Audio & Sound',
    'Office Furniture',
    'Event & Outdoor'
  ];

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All Categories') newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchTermInput('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchTermInput);
  };

  // Parse stocks list
  const stocksList = Array.isArray(stocksData?.data)
    ? stocksData.data
    : Array.isArray(stocksData?.data?.results)
    ? stocksData.data.results
    : Array.isArray(stocksData)
    ? stocksData
    : [];

  // Parse raw products catalog from API
  const rawApiItems = Array.isArray(productsData?.data)
    ? productsData.data
    : Array.isArray(productsData?.data?.results)
    ? productsData.data.results
    : Array.isArray(productsData)
    ? productsData
    : [];

  // ── STORE-FIRST DISTANCE ALGORITHM ─────────────────────────────
  // 1. Get all stores within selected radiusKm (or all stores if radiusKm >= 500)
  const storesInRange = (allStores || []).filter(store => {
    if (radiusKm >= 500) return true; // All India
    const dist = Number(store.distance_km);
    return !isNaN(dist) && dist <= radiusKm;
  });

  // 2. Sort stores in increasing order of distance (nearest store first, farthest last)
  storesInRange.sort((a, b) => {
    const da = Number(a.distance_km ?? 999999);
    const db = Number(b.distance_km ?? 999999);
    return da - db;
  });

  // 3. For each store in increasing distance order, build listing entries for all items in that store
  let storeProductListings = [];

  if (stocksList.length === 0 && rawApiItems.length > 0) {
    // Initial loading fallback
    storeProductListings = rawApiItems.map(p => ({
      ...p,
      listingKey: `default-${p.id}`,
      _closestStore: allStores?.[0] || selectedStore
    }));
  } else {
    storesInRange.forEach(store => {
      const storeId = Number(store.id);
      
      // Find all stocks in this store with available quantity > 0
      const storeStocks = stocksList.filter(s => 
        Number(s.store?.id || s.store) === storeId && Number(s.available_quantity) > 0
      );

      storeStocks.forEach(stock => {
        const prodId = Number(stock.product?.id || stock.product);
        const prodDef = rawApiItems.find(p => Number(p.id) === prodId);

        if (prodDef) {
          storeProductListings.push({
            ...prodDef,
            listingKey: `${store.id}-${prodDef.id}`,
            _closestStore: store,
            available_quantity: stock.available_quantity,
            total_quantity: stock.total_quantity,
          });
        }
      });
    });
  }

  // 4. Apply Category and Search filtering on store listings
  let filteredItems = storeProductListings.filter(item => {
    // Category filter
    const matchesCat = !categoryParam || categoryParam === 'All Categories' || 
      (item.category_name || item.category?.name || '')?.toLowerCase().includes(categoryParam.toLowerCase());
      
    // Search query filter
    const matchesSearch = !searchParam || 
      item.name?.toLowerCase().includes(searchParam.toLowerCase()) || 
      item.short_description?.toLowerCase().includes(searchParam.toLowerCase());

    return matchesCat && matchesSearch;
  });

  // Apply sorting
  if (sortParam === 'price_asc') {
    filteredItems.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortParam === 'price_desc') {
    filteredItems.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  }

  const hasFilters = categoryParam || searchParam;

  return (
    <PageTransition>
      <div className="min-h-screen pb-16">
        
        {/* Luxury Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[var(--accent-subtle)]/40 via-[var(--bg-elevated)] to-[var(--bg)] border-b border-[var(--border)] py-12 px-4 sm:px-6 lg:px-8">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[var(--accent)]/15 via-purple-500/10 to-indigo-500/15 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto space-y-4 text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black text-[var(--text)] tracking-tight">
              Explore Enterprise <span className="text-[var(--accent)]">Gear Fleet</span>
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto font-medium leading-relaxed">
              Instant access to cinema cameras, M3 workstations, e-bikes & sound gear with transparent security deposits & door logistics.
            </p>

            {/* Quick Search Bar inside Hero */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-4">
              <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] focus-within:border-[var(--accent)] transition-all">
                <Search className="absolute left-4 text-[var(--text-muted)] w-5 h-5 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Search gear name, model, e.g. FX3, MacBook, Super73..."
                  value={searchTermInput}
                  onChange={(e) => setSearchTermInput(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 text-sm font-medium bg-transparent text-[var(--text)] outline-none"
                />
                <button 
                  type="submit"
                  className="absolute right-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-black rounded-xl transition-all shadow-sm"
                >
                  Search Fleet
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          
          {/* Top Category Pills Scrollbar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border)]">
            <span className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
              <Layers size={14} className="text-[var(--accent)]" /> Categories:
            </span>
            {categories.map(cat => {
              const isSelected = (!categoryParam && cat === 'All Categories') || (categoryParam.toLowerCase() === cat.toLowerCase());
              return (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat === 'All Categories' ? '' : cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20' 
                      : 'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Distance Radius Slider & Location Header */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-md space-y-5 relative overflow-hidden">
            {/* Custom slider CSS styles injection */}
            <style>{`
              .premium-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 8px;
                border-radius: 9999px;
                background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--progress), var(--bg-subtle) var(--progress), var(--bg-subtle) 100%);
                outline: none;
                transition: background 0.15s ease;
              }
              .premium-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: var(--accent);
                border: 4px solid var(--bg-elevated);
                box-shadow: 0 4px 10px rgba(99, 102, 241, 0.45);
                cursor: pointer;
                transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.15s ease;
              }
              .premium-slider::-webkit-slider-thumb:hover {
                transform: scale(1.25);
                background: var(--accent-hover);
                box-shadow: 0 6px 14px rgba(99, 102, 241, 0.6);
              }
              .premium-slider::-moz-range-thumb {
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: var(--accent);
                border: 4px solid var(--bg-elevated);
                box-shadow: 0 4px 10px rgba(99, 102, 241, 0.45);
                cursor: pointer;
                transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.15s ease;
              }
              .premium-slider::-moz-range-thumb:hover {
                transform: scale(1.25);
                background: var(--accent-hover);
                box-shadow: 0 6px 14px rgba(99, 102, 241, 0.6);
              }
            `}</style>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-xs font-black text-[var(--text)] flex items-center gap-1.5">
                    Hub Radius: <strong className="text-[var(--accent)] font-extrabold text-sm">{radiusKm >= 500 ? 'All India (∞)' : `${radiusKm} km`}</strong>
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                    Showing physical inventory near <strong className="text-[var(--text)]">{userLocation?.city || 'Kolkata'}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openStoreModal}
                className="text-xs font-extrabold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer bg-[var(--bg-subtle)] px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--accent-subtle)] transition-colors"
              >
                Change Location ({userLocation?.city || 'Set Location'}) →
              </button>
            </div>

            {/* Custom Range Slider Control */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative pt-1">
                  {/* Floating tooltip/current value indicator */}
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={radiusKm >= 500 ? 200 : radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    style={{
                      '--progress': `${((Math.min(200, radiusKm) - 10) / (200 - 10)) * 100}%`
                    }}
                    className="premium-slider"
                  />

                  {/* Track indicators / scale markings */}
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-black px-1 mt-2">
                    <span>10 km</span>
                    <span>50 km</span>
                    <span>100 km</span>
                    <span>150 km</span>
                    <span>200 km</span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 shrink-0 bg-[var(--bg-subtle)] p-1.5 rounded-2xl border border-[var(--border)]">
                  {RADIUS_OPTIONS.map((opt) => {
                    const isActive = radiusKm === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRadiusKm(opt.value)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[var(--accent)] text-white shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar: Count, Active Filters & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                Fleet Catalog ({filteredItems.length} Available Models)
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {hasFilters && (
                <button 
                  onClick={clearFilters} 
                  className="text-xs font-extrabold text-[var(--danger)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X size={14} /> Clear Filters
                </button>
              )}

              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-[var(--text-muted)]" />
                <Select 
                  value={sortParam}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="text-xs font-extrabold rounded-xl py-2 px-3 bg-[var(--bg-elevated)] border border-[var(--border)]"
                  options={[
                    { value: 'newest', label: 'Newest Arrivals' },
                    { value: 'price_asc', label: 'Price: Low to High' },
                    { value: 'price_desc', label: 'Price: High to Low' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-[var(--text-muted)]">Active Filters:</span>
              {categoryParam && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20 rounded-full text-xs font-extrabold">
                  Category: {categoryParam}
                  <button onClick={() => updateFilter('category', '')} className="hover:text-[var(--text)]"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchParam && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20 rounded-full text-xs font-extrabold">
                  Query: "{searchParam}"
                  <button onClick={() => updateFilter('search', '')} className="hover:text-[var(--text)]"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid Wrapper with micro-fade refresh transition */}
          <div className={`transition-all duration-250 transform origin-top ${
            isRefreshing ? 'opacity-30 scale-[0.99] blur-[1px]' : 'opacity-100 scale-100'
          }`}>
            <ProductGrid products={filteredItems} loading={isLoading} columns={3} />
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default ExplorePage;
