import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Building2, MapPin, ArrowUpRight } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import CartItem from '../../components/customer/CartItem';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import useCart from '../../hooks/useCart';
import { useStore } from '../../context/StoreContext';

const calculateDays = (s, e) => {
  if (!s || !e) return 3;
  const start = new Date(s);
  const end = new Date(e);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeItem, updateItem } = useCart();
  const { getClosestStoreWithStock, selectedStore } = useStore();

  const isEmpty = !cart?.items || cart.items.length === 0;

  const defaultStore = {
    id: 'default',
    name: 'Park Street Lifestyle Store',
    address: '18 Park Street, Mullick Bazar, Kolkata, West Bengal',
    opening_time: '10:00 AM',
    closing_time: '09:00 PM',
    opening_hours: '10:00 AM – 09:00 PM',
    distance_km: 2.5
  };

  const resolveStore = (item) => {
    let st = item.store;
    if (!st && item.product?.store) {
      st = item.product.store;
    }
    if (!st && getClosestStoreWithStock && item.product?.id) {
      st = getClosestStoreWithStock(item.product.id);
    }
    return st || selectedStore || defaultStore;
  };

  // Group items by store ID
  const groupedItems = {};
  if (!isEmpty) {
    cart.items.forEach(item => {
      const st = resolveStore(item);
      const storeId = st?.id || 'default';
      if (!groupedItems[storeId]) {
        groupedItems[storeId] = {
          store: st,
          items: []
        };
      }
      groupedItems[storeId].items.push(item);
    });
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">Your Rental Cart</h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">Review your items and proceed to checkout per store location.</p>
        </div>

        {isEmpty ? (
          <div className="py-12">
            <EmptyState 
              icon={<ShoppingCart className="w-16 h-16 text-[var(--accent)] opacity-40" />}
              title="Your rental cart is empty"
              description="Looks like you haven't selected any gear to rent yet."
              action={
                <Button size="lg" className="font-bold rounded-2xl px-6" onClick={() => navigate('/explore')}>
                  Explore Available Gear
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedItems).map(storeId => {
              const { store, items } = groupedItems[storeId];
              
              // Calculate group totals
              let groupRentalTotal = 0;
              let groupDepositTotal = 0;
              
              items.forEach(item => {
                const product = item.product || {};
                const qty = Math.max(1, item.quantity || 1);
                const days = calculateDays(item.start_date || item.startDate, item.end_date || item.endDate);
                const unitDailyRate = parseFloat(item.price || product.price || 0);
                const unitDeposit = parseFloat(
                  item.securityDeposit ?? 
                  item.security_deposit ?? 
                  product.security_deposit ?? 
                  0
                );
                groupRentalTotal += unitDailyRate * days * qty;
                groupDepositTotal += unitDeposit * qty;
              });

              const groupTotalPayable = groupRentalTotal + groupDepositTotal;

              return (
                <div key={storeId} className="card p-6 sm:p-8 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-[2.5rem] shadow-xs space-y-6">
                  {/* Store Header Block */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏪</span>
                        <h2 className="text-base font-black text-[var(--text)] leading-tight">{store.name}</h2>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium leading-normal flex items-start gap-1.5 pl-6">
                        <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </p>
                    </div>
                    {store.distance_km !== null && store.distance_km !== undefined && (
                      <span className="self-start sm:self-center text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        ⚡ {store.distance_km} km away
                      </span>
                    )}
                  </div>

                  {/* Grouped Items List */}
                  <div className="divide-y divide-[var(--border)]/50">
                    {items.map(item => (
                      <CartItem 
                        key={item.id} 
                        item={item} 
                        onRemove={removeItem} 
                        onUpdateQuantity={(id, newQty) => updateItem(id, { quantity: newQty })}
                      />
                    ))}
                  </div>

                  {/* Store Group Summary & Checkout */}
                  <div className="pt-6 border-t border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-subtle)] p-6 rounded-3xl">
                    <div className="grid grid-cols-3 gap-6 md:gap-10">
                      <div>
                        <span className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">Rental Subtotal</span>
                        <span className="text-base font-black text-[var(--text)]">₹{groupRentalTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">Escrow Deposit</span>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹{groupDepositTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-l border-[var(--border)] pl-6">
                        <span className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">Total Payable</span>
                        <span className="text-lg font-black text-[var(--accent)]">₹{groupTotalPayable.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="rounded-2xl px-6 py-3 text-xs font-black shadow-sm flex items-center justify-center gap-1.5 shrink-0 self-stretch md:self-center"
                      onClick={() => navigate(`/checkout?storeId=${store.id}`)}
                    >
                      Checkout from this Store <ArrowUpRight size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-start">
              <button 
                onClick={() => navigate('/explore')}
                className="text-xs text-[var(--accent)] hover:underline font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                ← Continue Browsing Rentals
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default CartPage;
