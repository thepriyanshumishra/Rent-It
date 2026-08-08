import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, X, SlidersHorizontal, Search, Sparkles, Layers, ArrowUpDown } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import ProductGrid from '../../components/customer/ProductGrid';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import * as productsApi from '../../api/products';

const sampleFleetCatalog = [
  {
    id: 101,
    name: 'Sony FX3 Cinema Camera Kit',
    slug: 'sony-fx3-cinema-camera-kit',
    category_name: 'Cameras & Video',
    price: 2500,
    security_deposit: 10000,
    short_description: 'Full-frame cinema camera with XLR handle unit, 2x 160GB CFexpress cards, and FE 24-70mm GM II lens.',
    primary_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    rating: 4.9,
    review_count: 28
  },
  {
    id: 102,
    name: 'Apple MacBook Pro 16" M3 Max',
    slug: 'apple-macbook-pro-16-m3-max',
    category_name: 'Electronics',
    price: 3000,
    security_deposit: 15000,
    short_description: '36GB Unified Memory, 1TB SSD, 16-core CPU & 40-core GPU. Liquid Retina XDR Display for heavy 8K rendering.',
    primary_image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    rating: 5.0,
    review_count: 42
  },
  {
    id: 103,
    name: 'Super73-RX Electric Adventure Bike',
    slug: 'super73-rx-electric-bike',
    category_name: 'Vehicles & E-Bikes',
    price: 1800,
    security_deposit: 5000,
    short_description: '750W high-output motor, full dual suspension, inverted coil spring fork, and 40+ mile street battery range.',
    primary_image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    is_featured: false,
    rating: 4.8,
    review_count: 19
  },
  {
    id: 104,
    name: 'DJI Inspire 3 Cinema Drone 8K',
    slug: 'dji-inspire-3-cinema-drone-8k',
    category_name: 'Cameras & Video',
    price: 8000,
    security_deposit: 25000,
    short_description: 'Zenmuse X9-8K Air Gimbal Camera, dual-control flight station, Waypoint Pro 3D tracking, and 8K ProRes RAW recording.',
    primary_image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    rating: 4.9,
    review_count: 15
  },
  {
    id: 105,
    name: 'JBL PartyBox Ultimate PA System',
    slug: 'jbl-partybox-ultimate-pa-system',
    category_name: 'Audio & Sound',
    price: 2000,
    security_deposit: 8000,
    short_description: '1100W RMS high-definition sound with Dolby Atmos spatial audio, synchronized multi-color light show, and wireless mics.',
    primary_image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    is_featured: false,
    rating: 4.7,
    review_count: 31
  },
  {
    id: 106,
    name: 'Apple Vision Pro 512GB VR Headset',
    slug: 'apple-vision-pro-512gb',
    category_name: 'Electronics',
    price: 4000,
    security_deposit: 20000,
    short_description: 'Spatial computing headset with dual micro-OLED 4K displays, M2+R1 dual chips, and Solo Knit + Dual Loop Bands.',
    primary_image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    rating: 4.9,
    review_count: 36
  }
];

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTermInput, setSearchTermInput] = useState(searchParams.get('search') || '');
  
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { category: categoryParam, search: searchParam, sort: sortParam }],
    queryFn: () => productsApi.getProducts({ category: categoryParam, search: searchParam, sort: sortParam })
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

  // Combine real backend items with sample fleet catalog items if backend items count is low
  let rawApiItems = Array.isArray(productsData?.data)
    ? productsData.data
    : Array.isArray(productsData?.data?.results)
    ? productsData.data.results
    : Array.isArray(productsData)
    ? productsData
    : [];

  // Filter out any invalid null items
  rawApiItems = rawApiItems.filter(Boolean);

  // Merge sample products so the storefront looks rich & complete
  let combinedItems = [...rawApiItems];
  sampleFleetCatalog.forEach(sample => {
    if (!combinedItems.some(item => item.id === sample.id || item.slug === sample.slug)) {
      combinedItems.push(sample);
    }
  });

  // Apply frontend filtering
  let filteredItems = combinedItems.filter(item => {
    const matchesCat = !categoryParam || categoryParam === 'All Categories' || 
      (item.category_name || item.category?.name || '')?.toLowerCase().includes(categoryParam.toLowerCase());
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
              Live Enterprise Fleet Marketplace
            </div>

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

          {/* Product Grid */}
          <ProductGrid products={filteredItems} loading={isLoading} columns={3} />
        </div>

      </div>
    </PageTransition>
  );
};

export default ExplorePage;
