'use client';

import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '../lib/api';
import { formatMoney } from '../lib/utils';
import { useRouter } from 'next/navigation';

interface AvailabilityModalProps {
  productId: string | null;
  onClose: () => void;
}

export const AvailabilityModal: React.FC<AvailabilityModalProps> = ({ productId, onClose }) => {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  // Default dates: tomorrow to +3 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const threeDaysLater = new Date(tomorrow);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  const [startDate, setStartDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(threeDaysLater.toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState(1);
  const [availability, setAvailability] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  React.useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${productId}`);
      if (res.data.success) {
        setProduct(res.data.data);
        checkAvailability(startDate, endDate, quantity);
      }
    } catch {
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (start: string, end: string, qty: number) => {
    if (!productId) return;
    try {
      setChecking(true);
      setError(null);
      const res = await api.get(`/products/${productId}/availability`, {
        params: {
          startDate: new Date(start).toISOString(),
          endDate: new Date(end).toISOString(),
          quantity: qty,
        },
      });
      if (res.data.success) {
        setAvailability(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error checking availability');
      setAvailability(null);
    } finally {
      setChecking(false);
    }
  };

  const handleDateChange = (s: string, e: string, q: number) => {
    setStartDate(s);
    setEndDate(e);
    setQuantity(q);
    checkAvailability(s, e, q);
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('rentit_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setAddingToCart(true);
      setError(null);
      await api.post('/cart/items', {
        productId,
        quantity,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      window.dispatchEvent(new Event('storage'));
      router.push('/cart');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (!productId) return null;

  const durationDays = Math.max(
    1,
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (86400 * 1000)),
  );
  const dayRate = product?.priceRules?.[0]?.ratePaise || 10000;
  const estimatedRentalPaise = dayRate * durationDays * quantity;
  const estimatedDepositPaise = (product?.depositAmountPaise || 0) * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
            <p className="mt-3 text-xs text-slate-500">Checking equipment schedule...</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-start gap-4">
              {product?.imageUrls?.[0] && (
                <img
                  src={product.imageUrls[0]}
                  alt={product.name}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
              )}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                  Select Rental Dates
                </span>
                <h2 className="text-lg font-bold text-slate-900">{product?.name}</h2>
              </div>
            </div>

            {/* Form inputs */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange(e.target.value, endDate, quantity)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange(startDate, e.target.value, quantity)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => handleDateChange(startDate, endDate, Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
              />
            </div>

            {/* Server Availability Indicator */}
            <div className="mt-5 p-4 rounded-xl border bg-slate-50">
              {checking ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                  Verifying availability with server...
                </div>
              ) : availability ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Inventory Status:</span>
                    {availability.isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Available ({availability.availableUnits} units ready)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Unavailable for dates selected
                      </span>
                    )}
                  </div>

                  {/* Price Estimate Breakdown */}
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>
                        Rental Fee ({durationDays} days × {quantity} qty):
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatMoney(estimatedRentalPaise)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Refundable Security Deposit:
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatMoney(estimatedDepositPaise)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-brand-700">
                      <span>Total Pay Now:</span>
                      <span>{formatMoney(estimatedRentalPaise + estimatedDepositPaise)}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {error && <div className="mt-3 text-xs font-semibold text-red-600">{error}</div>}

            {/* Submit Action */}
            <button
              onClick={handleAddToCart}
              disabled={!availability?.isAvailable || addingToCart}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 px-4 text-sm font-bold text-white shadow-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ShoppingBag className="h-4 w-4" />
              {addingToCart ? 'Adding to Cart...' : 'Proceed to Cart'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
