import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import SearchBar from '../../components/customer/SearchBar';
import ProductGrid from '../../components/customer/ProductGrid';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import * as productsApi from '../../api/products';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
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
  };

  const hasFilters = categoryParam || searchParam;
  const productCount = productsData?.data?.count ?? (Array.isArray(productsData?.data?.results) ? productsData.data.results.length : (Array.isArray(productsData?.data) ? productsData.data.length : 0));

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header section with proper spacing */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Rental Marketplace</span>
            <h1 className="text-3xl font-extrabold text-text mt-1">Explore Rentals</h1>
            <p className="text-sm text-text-muted mt-1">
              {isLoading ? 'Searching available inventory...' : `Showing ${productCount} available product${productCount === 1 ? '' : 's'}`}
            </p>
          </div>
          
          <div className="md:hidden">
            <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={() => setShowMobileFilters(!showMobileFilters)}>
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`
            md:w-64 shrink-0 space-y-6 bg-bg-elevated p-5 rounded-2xl border border-border h-fit shadow-sm
            ${showMobileFilters ? 'block' : 'hidden md:block'}
          `}>
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
              <SlidersHorizontal className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-sm text-text uppercase tracking-wider">Filter Equipment</h3>
            </div>

            <div>
              <label className="font-semibold text-xs text-text-muted uppercase tracking-wider block mb-2">Search Query</label>
              <SearchBar 
                initialValue={searchParam}
                onSearch={(val) => updateFilter('search', val)}
                placeholder="Search MacBook, Camera..."
              />
            </div>
            
            <div>
              <label className="font-semibold text-xs text-text-muted uppercase tracking-wider block mb-3">Categories</label>
              <div className="space-y-2">
                {categories.map(cat => {
                  const isSelected = (!categoryParam && cat === 'All Categories') || (categoryParam.toLowerCase() === cat.toLowerCase());
                  return (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group py-1">
                      <input 
                        type="radio" 
                        name="category"
                        checked={isSelected}
                        onChange={() => updateFilter('category', cat === 'All Categories' ? '' : cat)}
                        className="accent-accent w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-sm transition-colors ${isSelected ? 'font-bold text-accent' : 'text-text-secondary group-hover:text-text'}`}>
                        {cat}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-text-muted uppercase tracking-wider block mb-2">Sort By</label>
              <Select 
                value={sortParam}
                onChange={(e) => updateFilter('sort', e.target.value)}
                options={[
                  { value: 'newest', label: 'Newest Arrivals' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                  { value: 'popular', label: 'Most Popular' }
                ]}
              />
            </div>

            {hasFilters && (
              <Button variant="ghost" className="w-full text-xs" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Main Grid */}
          <div className="flex-grow">
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-6 items-center">
                <span className="text-xs font-semibold text-text-muted">Active Filters:</span>
                {categoryParam && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-subtle text-accent border border-accent/20 rounded-full text-xs font-medium">
                    Category: <span className="font-bold">{categoryParam}</span>
                    <button onClick={() => updateFilter('category', '')} className="hover:text-text"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {searchParam && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-subtle text-accent border border-accent/20 rounded-full text-xs font-medium">
                    Search: "{searchParam}"
                    <button onClick={() => updateFilter('search', '')} className="hover:text-text"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs text-text-muted hover:text-text underline ml-2">Reset</button>
              </div>
            )}
            
            <ProductGrid products={productsData?.data || []} loading={isLoading} columns={3} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ExplorePage;
