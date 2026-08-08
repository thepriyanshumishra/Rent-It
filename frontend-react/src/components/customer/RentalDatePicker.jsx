import React, { useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Lock, ShieldCheck, HelpCircle, Truck, Store } from 'lucide-react';
import PriceDisplay from '../ui/PriceDisplay';

const RentalDatePicker = ({ 
  startDate, 
  endDate, 
  onStartChange, 
  onEndChange, 
  pricings = [], 
  onPricingSelect, 
  selectedPricing,
  basePrice = 0,
  securityDeposit = 0,
  isRented = false,
  rentedInfo = null,
  deliveryMethod = 'delivery',
  onDeliveryMethodChange
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

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const setPresetDuration = (days) => {
    const startMs = startDate ? new Date(startDate).getTime() : Date.now();
    const newEnd = new Date(startMs + days * 86400000).toISOString().split('T')[0];
    if (onEndChange) onEndChange(newEnd);
  };

  const daysCount = calculateDays();
  const dailyRate = Number(basePrice) || 0;
  const depositAmount = Number(securityDeposit) || 0;
  const subtotalRental = dailyRate * daysCount;
  const totalPayable = subtotalRental + depositAmount;

  return (
    <div className="space-y-5">
      
      {/* Rented Out Alert Banner */}
      {isRented && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
              Currently Out on Rental
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3" /> Unlocks in {rentedInfo?.hours || 62}h {rentedInfo?.mins || 30}m
            </span>
          </div>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">
            You can pre-reserve the next available slot below or pick future rental dates.
          </p>
        </div>
      )}

      {/* Date Inputs */}
      <div className={`space-y-3 ${isRented ? 'opacity-75' : ''}`}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon size={14} className="text-[var(--accent)]" /> Rental Period
          </label>
          <span className="text-xs font-bold text-[var(--accent)]">
            {daysCount} Day{daysCount > 1 ? 's' : ''} Rental
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">Pick-up Date</span>
            <input 
              type="date"
              min={today}
              value={startDate || defaultStart}
              onChange={(e) => onStartChange && onStartChange(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">Return Date</span>
            <input 
              type="date"
              min={minEndDate}
              value={endDate || defaultEnd}
              onChange={(e) => onEndChange && onEndChange(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Duration Preset Pills */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase mr-1">Presets:</span>
          {[
            { label: '1 Day', days: 1 },
            { label: '3 Days', days: 3 },
            { label: '1 Wk (7d)', days: 7 },
            { label: '2 Wks (14d)', days: 14 },
          ].map(preset => (
            <button
              key={preset.days}
              type="button"
              onClick={() => setPresetDuration(preset.days)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all border ${
                daysCount === preset.days
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--border)]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>



      {/* Complete Financial Breakdown Box */}
      <div className="card p-4 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
          <span>Rental Charge ({daysCount} day{daysCount > 1 ? 's' : ''} @ ₹{dailyRate.toLocaleString('en-IN')}/day)</span>
          <span className="font-extrabold text-[var(--text)]">₹{subtotalRental.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            Refundable Security Deposit
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">100% Refundable</span>
          </span>
          <span className="font-extrabold text-[var(--text)]">₹{depositAmount.toLocaleString('en-IN')}</span>
        </div>

        <div className="border-t border-[var(--border)] pt-2.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[var(--text)] uppercase tracking-wider block">Total Amount Payable</span>
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">Includes rental + refundable deposit</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-[var(--accent)]">₹{totalPayable.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Escrow Guarantee Pill */}
        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium border-t border-[var(--border)]/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Security deposit is held safely in escrow and refunded immediately upon return.</span>
        </div>
      </div>
    </div>
  );
};

export default RentalDatePicker;
