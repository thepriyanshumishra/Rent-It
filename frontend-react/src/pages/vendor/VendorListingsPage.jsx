import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, Plus, Edit3, Trash2, ShieldAlert, 
  Clock, ShieldCheck, ExternalLink, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { useStore } from '../../context/StoreContext';
import * as productsApi from '../../api/products';
import { api } from '../../api';
import { getProductImageUrl } from '../../utils/imageUtils';

export default function VendorListingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedStore } = useStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  // 1. Fetch Store Product Listings
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['vendor-products', selectedStore?.id],
    queryFn: () => productsApi.getProducts({ my_listings: true })
  });

  // 2. Fetch Orders to check active rental guard
  const { data: rentals = [] } = useQuery({
    queryKey: ['store-orders', selectedStore?.id],
    queryFn: async () => {
      const res = await api.get('/rentals/orders/');
      const d = res.data;
      return Array.isArray(d) ? d : (d?.results || []);
    },
  });

  const productsList = Array.isArray(productsData?.data?.results) 
    ? productsData.data.results 
    : (Array.isArray(productsData?.data) ? productsData.data : []);

  // Helper check: Does product have active rentals?
  const isProductActivelyRented = (productId) => {
    return rentals.some(r => 
      ['RESERVED', 'PICKED_UP', 'ACTIVE', 'LATE_RETURN'].includes(r.status) &&
      r.items?.some(i => (i.product_id === productId || i.product?.id === productId))
    );
  };

  // Handle Delete Product Listing
  const handleDeleteListing = async (product) => {
    if (isProductActivelyRented(product.id)) {
      toast.error(`⛔ Cannot delete "${product.name}" while active rentals are in progress! Equipment is currently booked or checked out.`);
      return;
    }

    if (window.confirm(`Are you sure you want to remove "${product.name}" listing from catalog?`)) {
      try {
        await api.delete(`/products/products/${product.slug || product.id}/`);
        queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
        toast.success(`Product "${product.name}" listing removed successfully.`);
      } catch (err) {
        toast.error(err?.response?.data?.detail || 'Cannot delete listing while active rentals exist.');
      }
    }
  };

  const filteredProducts = productsList.filter(p => {
    const name = (p.name || '').toLowerCase();
    const cat = (p.category_name || p.category?.name || '').toLowerCase();
    return !searchTerm || name.includes(searchTerm.toLowerCase()) || cat.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Search / Add Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-elevated)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
        <div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] uppercase tracking-wider">
            Vendor Inventory Management
          </span>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight mt-1">
            My Equipment Listings
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Manage your store's listed equipment catalog, update pricing, and add new assets.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl pl-9 pr-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/vendor/products/new')}
            className="rounded-2xl font-black text-xs px-5 py-2.5 shadow-sm gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Listing
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      {isLoadingProducts ? (
        <div className="p-12 text-center text-xs text-[var(--text-muted)]">Loading store listings...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center text-xs text-[var(--text-muted)] card bg-[var(--bg-elevated)] rounded-3xl border border-[var(--border)]">
          No equipment listings found. Click "Add Listing" to publish a new product.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(prod => {
            const availQty = Number(prod.available_quantity ?? prod.quantity ?? 0);
            const totalQty = Number(prod.quantity || 1);
            const isRented = isProductActivelyRented(prod.id);

            return (
              <div key={prod.id} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between hover:border-[var(--accent)] transition-all">
                
                <div className="space-y-3">
                  {/* Thumbnail & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] overflow-hidden shrink-0">
                      <img 
                        src={getProductImageUrl(prod, prod.name)} 
                        alt={prod.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        availQty > 0 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                      }`}>
                        {availQty > 0 ? `In Stock (${availQty}/${totalQty})` : 'Out of Stock'}
                      </span>

                      {isRented && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Active Rental
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-wider block">
                      {prod.category_name || prod.category?.name || 'Equipment'}
                    </span>
                    <h3 className="font-extrabold text-[var(--text)] text-sm line-clamp-1 mt-0.5">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 font-medium">
                      {prod.short_description || 'Certified equipment unit.'}
                    </p>
                  </div>

                  {/* Pricing Info */}
                  <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-between text-xs font-bold">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Rental Rate</span>
                      <span className="text-[var(--text)] font-extrabold">₹{Number(prod.price || 0).toLocaleString('en-IN')}/day</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--text-muted)] block">Deposit</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹{Number(prod.security_deposit || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Controls Footer */}
                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/vendor/products/${prod.id}/edit`)}
                    className="rounded-xl text-xs font-extrabold py-2 px-3 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>

                  {isRented ? (
                    <div className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20" title="Cannot delete product while active rentals are in progress">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Cannot Delete (Active Rental)
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeleteListing(prod)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
