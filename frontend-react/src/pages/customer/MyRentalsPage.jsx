import React, { useState, useEffect, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Clock, ShieldCheck, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/shared/PageTransition';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import * as rentalsApi from '../../api/rentals';
import { AuthContext } from '../../context/AuthContext';
import { getProductImageUrl } from '../../utils/imageUtils';

const STATUS_META = {
  QUOTATION:      { label: 'Quotation',     color: '#94a3b8' },
  QUOTATION_SENT: { label: 'Sent',          color: '#f59e0b' },
  RESERVED:       { label: 'Confirmed ✓',   color: '#3b82f6' },
  PICKED_UP:      { label: 'Picked Up',     color: '#6366f1' },
  ACTIVE:         { label: 'Active',        color: '#6366f1' },
  LATE_RETURN:    { label: '⚠️ Overdue',   color: '#ef4444' },
  RETURNED:       { label: 'Returned',      color: '#10b981' },
  CANCELLED:      { label: 'Cancelled',     color: '#ef4444' },
};

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

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

const RentalCard = ({ rental }) => {
  const [imgError, setImgError] = useState(false);
  const [timerState, setTimerState] = useState({
    phase: 'ACTIVE',
    text: '',
    badgeClass: '',
    warningNotice: null,
  });

  const firstItem = rental.items?.[0];
  const productName = firstItem?.product_name_display || firstItem?.product_name || firstItem?.product?.name || 'Rental Equipment';
  const qty = rental.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1;
  const imageUrl = getProductImageUrl(firstItem?.product, productName);

  const rentalCharge = Number(rental.total_amount || rental.total_price || 0);
  const depositCharge = Number(rental.deposit_amount || 0);
  const grandTotalPaid = rentalCharge + depositCharge;

  const startDateStr = rental.rental_start_date || rental.start_date;
  const endDateStr = rental.rental_end_date || rental.end_date;

  // Live Real-Time Countdown Timer (ticks every 1000ms)
  useEffect(() => {
    const calculateCountdown = () => {
      const now = Date.now();
      
      let sTime = new Date(startDateStr).getTime();
      let eTime = new Date(endDateStr).getTime();

      if (typeof startDateStr === 'string' && startDateStr.length === 10) {
        sTime = new Date(`${startDateStr}T00:00:00`).getTime();
      }
      if (typeof endDateStr === 'string' && endDateStr.length === 10) {
        eTime = new Date(`${endDateStr}T23:59:59`).getTime();
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
  }, [startDateStr, endDateStr]);

  return (
    <Link to={`/my-rentals/${rental.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl p-6 transition-all hover:border-[var(--accent)] hover:shadow-xl space-y-4">
        
        {/* Main Card Header Row */}
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between border-b border-[var(--border)] pb-4">
          
          {/* Left Thumbnail & Equipment Details */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 shrink-0 bg-[var(--bg-subtle)] rounded-2xl overflow-hidden border border-[var(--border)] relative">
              <img 
                src={imgError ? getProductImageUrl({}, productName) : imageUrl} 
                alt={productName} 
                onError={() => setImgError(true)}
                className="w-full h-full object-cover" 
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-extrabold text-[var(--accent)]">{rental.order_number || rental.id}</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border capitalize ${
                  timerState.phase === 'OVERDUE' 
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                }`}>
                  {rental.status || 'Confirmed'} ✓
                </span>
              </div>

              <h3 className="font-extrabold text-[var(--text)] text-base leading-snug">
                {productName}{qty > 1 ? ` × ${qty}` : ''}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mt-1 font-medium">
                <span className="flex items-center gap-1">📅 {fmtDate(startDateStr)} → {fmtDate(endDateStr)}</span>
                <span>💳 {rental.payment_status}</span>
                <span>🏦 Deposit: {rental.deposit_status?.replace(/_/g, ' ')}</span>
                <span>{rental.delivery_method === 'STORE_PICKUP' ? '🏪 Store Pickup' : '🚚 Delivery'}</span>
              </div>
            </div>
          </div>

          {/* Right Outflow & Live Timer */}
          <div className="flex flex-col items-start md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[var(--border)] gap-2 shrink-0">
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

        {/* Warning Notice Banner (if < 2h or Overdue) */}
        {timerState.warningNotice && (
          <div className={`p-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 border ${
            timerState.phase === 'OVERDUE'
              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 font-bold'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
          }`}>
            <span>{timerState.warningNotice}</span>
          </div>
        )}

      </div>
    </Link>
  );
};

const ACTIVE_STATUSES  = ['QUOTATION', 'QUOTATION_SENT', 'RESERVED', 'PICKED_UP', 'ACTIVE', 'LATE_RETURN'];
const HISTORY_STATUSES = ['RETURNED', 'CANCELLED'];

const MyRentalsPage = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('active');

  const { data, isLoading } = useQuery({
    queryKey: ['my-rentals', user?.id || user?.email],
    queryFn: () => rentalsApi.getMyRentals(),
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });

  // Normalise response shape
  const rawRentals = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.data?.results) ? data.data.results
    : Array.isArray(data) ? data
    : [];

  const activeRentals  = rawRentals.filter(r => ACTIVE_STATUSES.includes(r.status));
  const historyRentals = rawRentals.filter(r => HISTORY_STATUSES.includes(r.status));
  const currentList    = activeTab === 'active' ? activeRentals : historyRentals;

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
          <div>
            <span className="text-xs font-bold text-accent tracking-wider uppercase">Rental Dashboard</span>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">My Rentals</h1>
          </div>
          <div className="flex bg-bg-elevated border border-border p-1 rounded-2xl">
            {[
              { key: 'active',  label: `Active & Reserved (${activeRentals.length})` },
              { key: 'history', label: `History (${historyRentals.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === tab.key ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid gap-4">
              <Skeleton className="w-full h-28 rounded-2xl" />
              <Skeleton className="w-full h-28 rounded-2xl" />
              <Skeleton className="w-full h-28 rounded-2xl" />
            </div>
          ) : currentList.length === 0 ? (
            <EmptyState
              icon={<Package className="w-12 h-12 text-accent" />}
              title={activeTab === 'active' ? 'No Active Rentals' : 'No Past Rentals'}
              description={
                activeTab === 'active'
                  ? "You don't have any active or reserved rentals right now."
                  : 'Your returned and cancelled rentals will appear here.'
              }
            />
          ) : (
            <motion.div
              className="grid gap-4"
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            >
              {currentList.map(rental => (
                <motion.div key={rental.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <RentalCard rental={rental} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MyRentalsPage;
