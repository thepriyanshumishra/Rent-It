import React from 'react';
import Button from '../ui/Button';
import PriceDisplay from '../ui/PriceDisplay';
import Skeleton from '../ui/Skeleton';
import { Info, ArrowRight } from 'lucide-react';

const sampleProductMap = {
  1: { price: 2500, deposit: 10000 },
  2: { price: 3000, deposit: 15000 },
  3: { price: 1800, deposit: 5000 },
  4: { price: 8000, deposit: 25000 },
  5: { price: 600, deposit: 3000 },
  6: { price: 2000, deposit: 8000 },
  7: { price: 1500, deposit: 6000 },
  8: { price: 4000, deposit: 20000 }
};

const getItemPrice = (item) => {
  const p = parseFloat(item.product?.price || item.price || 0);
  if (p > 0) return p;
  const fallback = sampleProductMap[item.product_id] || sampleProductMap[item.id] || sampleProductMap[3];
  return fallback.price;
};

const getItemDeposit = (item) => {
  const firstPricing = item.product?.pricings?.[0];
  const d = parseFloat(firstPricing?.security_deposit || item.securityDeposit || 0);
  if (d > 0) return d;
  const fallback = sampleProductMap[item.product_id] || sampleProductMap[item.id] || sampleProductMap[3];
  return fallback.deposit;
};

const CartSummary = ({ cart, loading, onCheckout }) => {
  if (loading) {
    return (
      <div className="bg-bg-elevated border border-border rounded-3xl p-6">
        <Skeleton className="w-1/2 h-6 mb-6" />
        <div className="space-y-4 mb-6">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
        </div>
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    );
  }

  const items = cart?.items || [];

  let calcRental = 0;
  let calcDeposit = 0;

  if (items.length > 0) {
    items.forEach(item => {
      const qty = item.quantity || 1;
      calcRental += getItemPrice(item) * qty;
      calcDeposit += getItemDeposit(item) * qty;
    });
  } else {
    calcRental = parseFloat(cart?.total_rental_price || 0);
    calcDeposit = parseFloat(cart?.total_deposit || 0);
  }

  const deliveryFee = cart?.deliveryFee || 0;
  const calcTotal = calcRental + calcDeposit + deliveryFee;

  return (
    <div className="bg-bg-elevated border border-border rounded-3xl p-6 sticky top-24 shadow-sm">
      <h3 className="font-extrabold text-lg text-text mb-6">Order Summary</h3>
      
      <div className="space-y-4 mb-6 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-text-muted font-medium">Rental Subtotal</span>
          <PriceDisplay amount={calcRental} className="text-text font-bold text-base" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted font-medium flex items-center gap-1">
            Security Deposit 
            <span title="Fully refundable upon item return inspection" className="cursor-help">
              <Info className="w-3.5 h-3.5 text-accent" />
            </span>
          </span>
          <PriceDisplay amount={calcDeposit} className="text-text font-bold text-base" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted font-medium">Delivery & Fulfillment</span>
          {deliveryFee === 0 ? (
            <span className="text-success font-bold text-sm">Free</span>
          ) : (
            <PriceDisplay amount={deliveryFee} className="text-text font-bold" />
          )}
        </div>
      </div>
      
      <div className="border-t border-border pt-4 mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-extrabold text-text text-base">Total Payable</span>
          <PriceDisplay amount={calcTotal} className="font-black text-2xl text-accent" />
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">
          * Security deposit is held in escrow and refunded upon return inspection.
        </p>
      </div>
      
      <Button 
        variant="primary" 
        size="lg"
        className="w-full rounded-2xl font-bold py-3.5 shadow-md flex items-center justify-center gap-2 text-sm" 
        onClick={onCheckout}
        disabled={items.length === 0}
      >
        Proceed to Checkout <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default CartSummary;
