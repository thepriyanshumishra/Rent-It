import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { rentalsApi } from '../../api';
import { useCart } from '../../context/CartContext';
import Spinner from '../../components/ui/Spinner';

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [fulfillmentType, setFulfillmentType] = useState('STORE_PICKUP');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const items = cart.items || [];
  const summary = cart.summary || {};

  const handleConfirmOrder = async () => {
    setProcessing(true);
    setError('');
    try {
      const res = await rentalsApi.checkout({
        fulfillmentType,
        notes,
      });
      const rentalId = res.data?.data?.rentalId || res.data?.data?.rental?.id;
      if (rentalId) {
        await rentalsApi.confirmPayment(rentalId);
      }
      await clearCart();
      navigate('/my-rentals');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text)] mb-2">Your cart is empty</h2>
          <button onClick={() => navigate('/explore')} className="btn-primary mt-4">
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-black text-[var(--text)] mb-6">Checkout & Payment</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Fulfillment Selection */}
            <div className="card p-5">
              <h2 className="font-bold text-[var(--text)] text-lg mb-4">Fulfillment Option</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('STORE_PICKUP')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    fulfillmentType === 'STORE_PICKUP'
                      ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                      : 'border-[var(--border)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <p className="font-bold text-sm text-[var(--text)]">Store Pickup</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Pick up at store location</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('DELIVERY')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    fulfillmentType === 'DELIVERY'
                      ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                      : 'border-[var(--border)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <p className="font-bold text-sm text-[var(--text)]">Doorstep Delivery</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Direct to your address</p>
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Delivery Notes / Special Instructions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Apartment number, gate code, or specific timing..."
                  rows={2}
                  className="input-field text-sm resize-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-5">
              <h2 className="font-bold text-[var(--text)] text-lg mb-4">Payment Method</h2>
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[var(--text)]">Simulated Instant Payment</p>
                  <p className="text-xs text-[var(--text-muted)]">Secure sandbox environment for demonstration</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div>
            <div className="card p-5 sticky top-24">
              <h2 className="font-bold text-[var(--text)] text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs pb-2 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text)] font-medium truncate max-w-[160px]">{item.productName}</span>
                    <span className="text-[var(--text-secondary)] font-semibold">{formatPrice(item.totalRentalPaise)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Rental Subtotal</span>
                  <span className="font-semibold text-[var(--text)]">{formatPrice(summary.subtotalPaise || 0)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Security Deposit</span>
                  <span className="font-semibold text-[var(--text)]">{formatPrice(summary.depositTotalPaise || 0)}</span>
                </div>
                <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-base">
                  <span className="text-[var(--text)]">Total Payable</span>
                  <span className="text-[var(--accent)]">{formatPrice(summary.totalPaise || 0)}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-[var(--danger-subtle)] text-[var(--danger)] text-xs mb-3">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={processing}
                className="btn-primary w-full justify-center py-3"
              >
                {processing ? <Spinner size="sm" color="white" /> : (
                  <>Confirm & Pay {formatPrice(summary.totalPaise || 0)} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
