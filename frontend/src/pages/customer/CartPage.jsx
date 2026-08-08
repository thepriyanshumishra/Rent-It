import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import { cartApi, rentalsApi } from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, loading, removeItem, refetch } = useCart();
  const [removingId, setRemovingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  const handleRemove = async (itemId) => {
    setRemovingId(itemId);
    try { await removeItem(itemId); } finally { setRemovingId(null); }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/cart' } } }); return; }
    setCheckingOut(true); setError('');
    try {
      const res = await rentalsApi.checkout({});
      const rentalId = res.data?.data?.rentalId || res.data?.data?.rental?.id;
      if (rentalId) {
        // Auto confirm payment (simulated)
        await rentalsApi.confirmPayment(rentalId);
        navigate('/my-rentals');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const items = cart.items || [];
  const summary = cart.summary || {};

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-[var(--text)] mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Your Cart
          {items.length > 0 && <span className="text-sm font-normal text-[var(--text-muted)]">({items.length} item{items.length > 1 ? 's' : ''})</span>}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">Your cart is empty</h2>
            <p className="text-[var(--text-muted)] mb-6">Browse our collection and find something to rent</p>
            <Link to="/explore" className="btn-primary">Explore Products</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="card p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&q=80'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--text)] text-sm truncate">{item.productName}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatDate(item.startDate)} → {formatDate(item.endDate)} · {item.durationDays} day{item.durationDays > 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-sm font-bold text-[var(--text)]">{formatPrice(item.totalRentalPaise)}</p>
                        <p className="text-xs text-[var(--text-muted)]">+{formatPrice(item.depositAmountPaise)} deposit</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removingId === item.id}
                        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-subtle)] transition-all"
                      >
                        {removingId === item.id ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="card p-5 sticky top-24">
                <h2 className="font-bold text-[var(--text)] mb-4">Order Summary</h2>
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Rental charges</span>
                    <span className="font-semibold text-[var(--text)]">{formatPrice(summary.subtotalPaise || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Security deposits</span>
                    <span className="font-semibold text-[var(--text)]">{formatPrice(summary.depositTotalPaise || 0)}</span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2.5 flex justify-between">
                    <span className="font-bold text-[var(--text)]">Total</span>
                    <span className="font-black text-lg text-[var(--accent)]">{formatPrice(summary.totalPaise || 0)}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-[var(--danger)] text-sm bg-[var(--danger-subtle)] p-2.5 rounded-xl mb-3">{error}</p>
                )}

                <button
                  id="checkout-btn"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="btn-primary w-full justify-center py-3"
                >
                  {checkingOut ? <Spinner size="sm" color="white" /> : (
                    <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                  Deposits are refundable after inspection
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
