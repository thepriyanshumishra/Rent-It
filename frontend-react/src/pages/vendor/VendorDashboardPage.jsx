import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, FileText, CheckCircle2, Clock, 
  ArrowRight, ShieldCheck, QrCode, Plus, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { useStore } from '../../context/StoreContext';
import * as productsApi from '../../api/products';
import { api } from '../../api';

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { selectedStore } = useStore();

  // Fetch orders
  const { data: rentals = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['store-orders', selectedStore?.id],
    queryFn: async () => {
      const res = await api.get('/rentals/orders/');
      const d = res.data;
      const all = Array.isArray(d) ? d : (d?.results || []);
      if (selectedStore?.id) {
        return all.filter(r => !r.store || r.store === selectedStore.id || r.store_code === selectedStore.code);
      }
      return all;
    },
  });

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['vendor-products', selectedStore?.id],
    queryFn: () => productsApi.getProducts({ my_listings: true })
  });

  const productsList = Array.isArray(productsData?.data?.results) 
    ? productsData.data.results 
    : (Array.isArray(productsData?.data) ? productsData.data : []);

  const pendingPickups  = rentals.filter(r => r.status === 'RESERVED' || r.status === 'QUOTATION_SENT');
  const activeRentals   = rentals.filter(r => ['PICKED_UP', 'ACTIVE', 'LATE_RETURN'].includes(r.status));
  const completedReturns = rentals.filter(r => r.status === 'RETURNED');

  const greeting = user?.first_name ? `Welcome, ${user.first_name}` : 'Welcome, Vendor Partner';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">

      {/* ── Welcome Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--accent)] text-white p-6 sm:p-8 shadow-xl">
        {/* Decorative shapes */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-16 -bottom-12 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left text block */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full bg-white/15 border border-white/20 uppercase tracking-widest">
              Store Counter Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {greeting} 👋
            </h1>
            {/* Company name from VendorProfile */}
            {user?.vendor_profile?.company_name && (
              <p className="text-sm text-white/90 font-bold flex items-center gap-1.5">
                🏢 {user.vendor_profile.company_name}
                {user.vendor_profile.gst_number && (
                  <span className="text-[10px] font-medium text-white/60 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
                    GST: {user.vendor_profile.gst_number}
                  </span>
                )}
              </p>
            )}
            {selectedStore && (
              <p className="text-sm text-white/80 font-medium flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {selectedStore.name}
                {selectedStore.city ? ` · ${selectedStore.city}` : ''}
              </p>
            )}
            <p className="text-xs text-white/70 font-medium max-w-md mt-1">
              Verify customer pickup codes, manage inventory, and process returns from the counter.
            </p>
          </div>

          {/* Right action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate('/vendor/orders')}
              className="rounded-2xl font-black text-xs py-3 px-5 bg-white text-[var(--accent)] hover:bg-white/90 shadow-md justify-center gap-1.5 border-0"
            >
              <QrCode className="w-4 h-4" /> Verify Pickup Code
            </Button>
            <Button
              onClick={() => navigate('/vendor/listings')}
              className="rounded-2xl font-black text-xs py-3 px-5 bg-white/15 hover:bg-white/25 text-white border border-white/25 shadow-sm justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Manage Listings
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div
          onClick={() => navigate('/vendor/listings')}
          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:border-[var(--accent)] hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Total Listings</span>
            <div className="w-9 h-9 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-4xl font-black text-[var(--text)]">
            {isLoadingProducts ? '…' : productsList.length}
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
            Manage fleet catalog <ArrowRight className="w-3 h-3 text-[var(--accent)]" />
          </span>
        </div>

        <div
          onClick={() => navigate('/vendor/orders')}
          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:border-amber-500 hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Awaiting Pickup</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-4xl font-black text-amber-600 dark:text-amber-400">
            {isLoadingOrders ? '…' : pendingPickups.length}
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
            Requires verification <ArrowRight className="w-3 h-3 text-amber-500" />
          </span>
        </div>

        <div
          onClick={() => navigate('/vendor/orders')}
          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:border-[var(--accent)] hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Active On Rent</span>
            <div className="w-9 h-9 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-4xl font-black text-[var(--accent)]">
            {isLoadingOrders ? '…' : activeRentals.length}
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
            Currently checked out <ArrowRight className="w-3 h-3 text-[var(--accent)]" />
          </span>
        </div>

        <div
          onClick={() => navigate('/vendor/orders')}
          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:border-emerald-500 hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Returned & Done</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
            {isLoadingOrders ? '…' : completedReturns.length}
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
            Inspection complete <ArrowRight className="w-3 h-3 text-emerald-500" />
          </span>
        </div>

      </div>

      {/* ── Quick Access Blocks ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div
          onClick={() => navigate('/vendor/listings')}
          className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-11 h-11 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform mb-4">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
            Manage Equipment Listings
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">
            View listed products, add new inventory units, edit rental rates, and safely remove unrented listings.
          </p>
          <div className="mt-4 flex items-center text-xs font-extrabold text-[var(--accent)] gap-1">
            Go to My Listings <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => navigate('/vendor/orders')}
          className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-11 h-11 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
            Orders & Pickup Code Verification
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">
            Match customer 6-digit pickup verification codes (RNT-XXXXXX), confirm handovers, and process equipment returns.
          </p>
          <div className="mt-4 flex items-center text-xs font-extrabold text-[var(--accent)] gap-1">
            Go to Orders & Verification <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
}
