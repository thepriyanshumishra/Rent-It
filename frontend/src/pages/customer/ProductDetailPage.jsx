import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Calendar, Shield, ArrowLeft, Package } from 'lucide-react';
import { productsApi } from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.detail(id),
    enabled: !!id,
  });

  const product = data?.data?.data;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Package className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
        <p className="text-[var(--text-muted)]">Product not found</p>
        <button onClick={() => navigate('/explore')} className="btn-outline mt-4">Back to Explore</button>
      </div>
    </div>
  );

  const dayPrice = product.priceRules?.[0]?.rate_paise || 0;
  const durationDays = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000));
  const rentalTotal = dayPrice * durationDays * quantity;
  const depositTotal = (product.depositAmountPaise || 0) * quantity;
  const grandTotal = rentalTotal + depositTotal;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: `/products/${id}` } } }); return; }
    setAdding(true); setAddError('');
    try {
      await addItem({
        productId: product.id,
        quantity,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setAddError(err.response?.data?.error?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="card overflow-hidden" style={{ height: '400px' }}>
              <img
                src={product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.imageUrls?.length > 1 && (
              <div className="flex gap-2">
                {product.imageUrls.slice(1, 4).map((url, i) => (
                  <div key={i} className="card overflow-hidden flex-1" style={{ height: '90px' }}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details + Booking */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-1">
                {product.category?.name}
              </p>
              <h1 className="text-2xl font-black text-[var(--text)] mb-2">{product.name}</h1>
              {product.short_desc && (
                <p className="text-[var(--text-muted)] text-sm">{product.short_desc}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="card p-4">
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-3xl font-black text-[var(--text)]">{formatPrice(dayPrice)}</span>
                <span className="text-[var(--text-muted)]">/day</span>
              </div>
              {product.depositAmountPaise > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{formatPrice(product.depositAmountPaise)} security deposit (refundable)</span>
                </div>
              )}
            </div>

            {/* Booking Form */}
            <div className="card p-4 space-y-4">
              <h3 className="font-bold text-[var(--text)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent)]" /> Select Dates
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Start Date</label>
                  <input
                    id="product-start-date"
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">End Date</label>
                  <input
                    id="product-end-date"
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-all font-bold">−</button>
                  <span className="text-lg font-bold text-[var(--text)] w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.totalInventory, quantity + 1))} className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-all font-bold">+</button>
                </div>
              </div>

              {/* Summary */}
              {dayPrice > 0 && durationDays > 0 && (
                <div className="bg-[var(--bg-subtle)] rounded-xl p-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">{formatPrice(dayPrice)} × {durationDays} day{durationDays > 1 ? 's' : ''} × {quantity}</span>
                    <span className="font-semibold text-[var(--text)]">{formatPrice(rentalTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Security deposit</span>
                    <span className="font-semibold text-[var(--text)]">{formatPrice(depositTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-[var(--border)] pt-1.5 mt-1.5">
                    <span className="text-[var(--text)]">Total</span>
                    <span className="text-[var(--accent)]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              )}

              {addError && (
                <p className="text-[var(--danger)] text-sm bg-[var(--danger-subtle)] p-2.5 rounded-xl">{addError}</p>
              )}

              <button
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={adding || product.totalInventory === 0}
                className="btn-primary w-full justify-center py-3"
              >
                {adding ? <Spinner size="sm" color="white" /> : added ? '✓ Added to Cart!' : (
                  <><ShoppingCart className="w-4 h-4" /> {isAuthenticated ? 'Add to Cart' : 'Sign in to Rent'}</>
                )}
              </button>

              {product.totalInventory === 0 && (
                <p className="text-center text-sm text-[var(--danger)]">Currently unavailable</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="card p-4">
                <h3 className="font-bold text-[var(--text)] mb-2">About this item</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
