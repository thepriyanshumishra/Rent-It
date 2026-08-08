import React, { useEffect } from 'react';
import Input from '../ui/Input';
import PriceDisplay from '../ui/PriceDisplay';
import { Clock, Lock } from 'lucide-react';

const RentalDatePicker = ({ 
  startDate, 
  endDate, 
  onStartChange, 
  onEndChange, 
  pricings = [], 
  onPricingSelect, 
  selectedPricing,
  basePrice = 0,
  isRented = false,
  rentedInfo = null
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  const defaultStart = startDate || today;
  const defaultEnd = endDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  useEffect(() => {
    if (!startDate && onStartChange) onStartChange(defaultStart);
    if (!endDate && onEndChange) onEndChange(defaultEnd);
  }, []);

  const minEndDate = startDate 
    ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0]
    : today;

  // Build rental options from pricings or fallback basePrice
  const optionsList = (pricings && pricings.length > 0) 
    ? pricings 
    : [{ id: 'base', period_name: 'Daily Pass', price: basePrice, security_deposit: 0 }];

  useEffect(() => {
    if (!selectedPricing && optionsList.length > 0 && onPricingSelect) {
      onPricingSelect(optionsList[0]);
    }
  }, [optionsList]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const daysCount = calculateDays();
  const activePricing = selectedPricing || optionsList[0];
  const unitPrice = parseFloat(activePricing?.price || basePrice || 0);
  const totalRentalCost = unitPrice * (activePricing?.period_name?.toLowerCase().includes('weekly') ? Math.ceil(daysCount / 7) : daysCount);

  return (
    <div className="flex flex-col gap-4">
      {/* Rented Status Alert Banner */}
      {isRented && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            Currently Out on Rental • Unlocks in {rentedInfo?.hours || 62}h {rentedInfo?.mins || 30}m
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Locked
          </span>
        </div>
      )}

      {/* Dates Selection */}
      <div className={`grid grid-cols-2 gap-4 transition-all ${isRented ? 'opacity-50 pointer-events-none' : ''}`}>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Pick-up Date</label>
          <Input 
            type="date"
            min={today}
            disabled={isRented}
            value={startDate || defaultStart}
            onChange={(e) => onStartChange(e.target.value)}
            className="w-full bg-bg-elevated border-border text-text font-semibold disabled:bg-bg-subtle disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Return Date</label>
          <Input 
            type="date"
            min={minEndDate}
            disabled={isRented}
            value={endDate || defaultEnd}
            onChange={(e) => onEndChange(e.target.value)}
            className="w-full bg-bg-elevated border-border text-text font-semibold disabled:bg-bg-subtle disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Plans Selection */}
      <div className={`mt-2 transition-all ${isRented ? 'opacity-50 pointer-events-none' : ''}`}>
        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Select Rental Plan</label>
        <div className="grid grid-cols-1 gap-2.5">
          {optionsList.map((pricing) => {
            const isSelected = activePricing?.id === pricing.id;
            const planLabel = pricing.period_name || (pricing.duration_hours ? `${pricing.duration_hours / 24}-Day Pass` : 'Daily Rate');
            return (
              <div 
                key={pricing.id}
                onClick={() => !isRented && onPricingSelect && onPricingSelect(pricing)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isRented 
                    ? 'border-border bg-bg-subtle cursor-not-allowed opacity-60' 
                    : isSelected 
                      ? 'border-accent bg-accent-subtle shadow-sm cursor-pointer' 
                      : 'border-border bg-bg-elevated hover:border-border-strong cursor-pointer'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-sm text-text block capitalize">{planLabel}</span>
                    <span className="text-xs text-text-muted">{daysCount} day{daysCount > 1 ? 's' : ''} rental duration</span>
                  </div>
                  <PriceDisplay amount={pricing.price} className="font-extrabold text-base text-accent" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upfront Total */}
      <div className={`mt-2 p-4 rounded-2xl bg-bg-subtle border border-border flex justify-between items-center transition-all ${isRented ? 'opacity-50' : ''}`}>
        <div>
          <span className="text-xs text-text-muted uppercase tracking-wider font-semibold block">Total Estimated Cost</span>
          <span className="text-xs text-text-secondary">{daysCount} day{daysCount > 1 ? 's' : ''} @ ₹{unitPrice}/day</span>
        </div>
        <PriceDisplay amount={totalRentalCost} className="font-black text-xl text-text" />
      </div>
    </div>
  );
};

export default RentalDatePicker;
