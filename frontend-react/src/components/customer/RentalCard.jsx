import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, Download, Calendar, ArrowUpRight, AlertTriangle } from 'lucide-react';
import Badge from '../ui/Badge';
import PriceDisplay from '../ui/PriceDisplay';
import Button from '../ui/Button';
import { getProductImageUrl } from '../../utils/imageUtils';

const sampleProductMap = {
  1: { name: 'Sony FX3 Cinema Camera Kit', price: 2500, deposit: 10000, category: 'Cameras & Video' },
  2: { name: 'Apple MacBook Pro 16" M3 Max', price: 3000, deposit: 15000, category: 'Electronics' },
  3: { name: 'Super73-RX Electric Adventure Bike', price: 1800, deposit: 5000, category: 'Vehicles & E-Bikes' },
  4: { name: 'DJI Inspire 3 Cinema Drone 8K', price: 8000, deposit: 25000, category: 'Cameras & Video' },
  5: { name: 'Herman Miller Aeron Ergonomic Chair', price: 600, deposit: 3000, category: 'Office Furniture' },
  6: { name: 'JBL PartyBox Ultimate PA System', price: 2000, deposit: 8000, category: 'Audio & Sound' },
  7: { name: 'EcoFlow Delta Pro Power Station', price: 1500, deposit: 6000, category: 'Event & Outdoor' },
  8: { name: 'Apple Vision Pro 512GB VR Headset', price: 4000, deposit: 20000, category: 'Electronics' }
};

const formatTimeComponents = (ms) => {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
  }
  return `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
};

const RentalCard = ({ rental, onExtend }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [timerState, setTimerState] = useState({
    phase: 'ACTIVE',
    text: '',
    badgeClass: '',
    warningNotice: null,
  });

  if (!rental) return null;

  const { id, order_number, product, status, start_date, end_date, total_price, deposit_amount } = rental;

  const fallbackProduct = sampleProductMap[rental.product_id] || sampleProductMap[3];
  const productName = product?.name || fallbackProduct.name;
  const depositFee = deposit_amount || fallbackProduct.deposit;
  
  // Financial calculation: Rental charge + Security deposit = Total Outflow Paid
  const rentalCharge = Number(total_price || 0);
  const depositCharge = Number(depositFee || 0);
  const grandTotalPaid = rentalCharge + depositCharge;

  // Image resolution
  const imageUrl = getProductImageUrl(product, productName);

  // Live Real-Time Countdown Timer (ticks every 1000ms)
  useEffect(() => {
    const calculateCountdown = () => {
      const now = Date.now();
      
      let sTime = new Date(start_date).getTime();
      let eTime = new Date(end_date).getTime();

      if (typeof start_date === 'string' && start_date.length === 10) {
        sTime = new Date(`${start_date}T00:00:00`).getTime();
      }
      if (typeof end_date === 'string' && end_date.length === 10) {
        eTime = new Date(`${end_date}T23:59:59`).getTime();
      }

      if (isNaN(sTime)) sTime = now - 86400000;
      if (isNaN(eTime)) eTime = now + 2 * 86400000;

      if (now < sTime) {
        // Phase 1: Upcoming / Activating Soon
        const diff = sTime - now;
        setTimerState({
          phase: 'UPCOMING',
          text: `Activating in ${formatTimeComponents(diff)}`,
          badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          warningNotice: null
        });
      } else if (now >= sTime && now <= eTime) {
        // Phase 2: Active
        const diff = eTime - now;
        const isNearExpiry = diff <= 2 * 60 * 60 * 1000; // <= 2 hours remaining

        if (isNearExpiry) {
          setTimerState({
            phase: 'ACTIVE_WARNING',
            text: `Ending in ${formatTimeComponents(diff)}`,
            badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse',
            warningNotice: '⚠️ Try to return it as soon as possible or you will start getting fined.'
          });
        } else {
          setTimerState({
            phase: 'ACTIVE',
            text: `Active • ${formatTimeComponents(diff)} remaining`,
            badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            warningNotice: null
          });
        }
      } else {
        // Phase 3: Overdue / Overtime Penalty
        const diff = now - eTime;
        setTimerState({
          phase: 'OVERDUE',
          text: `Overdue by ${formatTimeComponents(diff)}`,
          badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse',
          warningNotice: '🚨 OVERDUE WARNING: Extra time penalty charges are actively accumulating! Try to return it as soon as possible or you will start getting fined.'
        });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [start_date, end_date]);

  return (
    <div 
      className="relative flex flex-col bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl p-5 md:p-6 transition-all duration-300 hover:border-[var(--accent)] hover:shadow-xl cursor-pointer group space-y-4"
      onClick={() => navigate(`/my-rentals/${id}`)}
    >
      <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between border-b border-[var(--border)] pb-5">
        
        {/* Left Image & Product Details */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 shrink-0 bg-[var(--bg-subtle)] rounded-2xl overflow-hidden border border-[var(--border)] relative">
            <img 
              src={imgError ? getProductImageUrl({}, productName) : imageUrl} 
              alt={productName} 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-extrabold text-[var(--accent)]">{order_number || id}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border capitalize ${
                timerState.phase === 'OVERDUE' 
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {status || (timerState.phase === 'OVERDUE' ? 'OVERDUE' : 'Confirmed')} ✓
              </span>
            </div>
            <h3 className="font-extrabold text-[var(--text)] text-base leading-snug group-hover:text-[var(--accent)] transition-colors">
              {productName}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" /> {start_date} → {end_date}
            </p>
          </div>
        </div>

        {/* Right Financial Outflow & Live Timer */}
        <div className="flex flex-col items-start md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[var(--border)] gap-2">
          <div className="text-left md:text-right">
            <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">Total Outflow Paid</span>
            <span className="text-xl font-black text-[var(--accent)]">₹{grandTotalPaid.toLocaleString('en-IN')}</span>
            <span className="text-[11px] font-bold text-[var(--text-secondary)] block mt-0.5">
              ₹{rentalCharge.toLocaleString('en-IN')} rental + ₹{depositCharge.toLocaleString('en-IN')} deposit
            </span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${timerState.badgeClass}`}>
            <Clock className="w-3.5 h-3.5" /> {timerState.text}
          </div>
        </div>

      </div>

      {/* Warning Notice Banner (If near expiry or overdue) */}
      {timerState.warningNotice && (
        <div className={`p-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 border ${
          timerState.phase === 'OVERDUE'
            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
        }`}>
          <span>{timerState.warningNotice}</span>
        </div>
      )}

      {/* Footer Details & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium bg-[var(--bg-subtle)] px-3 py-1.5 rounded-xl border border-[var(--border)] w-full sm:w-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Security Deposit Held: <strong className="text-[var(--text)] font-bold">₹{depositFee.toLocaleString('en-IN')}</strong></span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button 
            size="sm"
            className="rounded-xl font-bold text-xs py-2 px-4 flex items-center gap-1 shadow-sm flex-1 sm:flex-none"
            onClick={(e) => { e.stopPropagation(); navigate(`/my-rentals/${id}`); }}
          >
            Manage Order <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

    </div>
  );
};

export default RentalCard;
