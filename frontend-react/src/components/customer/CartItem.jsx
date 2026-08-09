import React, { useState } from 'react';
import { Trash2, Package } from 'lucide-react';
import PriceDisplay from '../ui/PriceDisplay';
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

const calculateDays = (s, e) => {
  if (!s || !e) return 3;
  const start = new Date(s);
  const end = new Date(e);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const [imgErr, setImgErr] = useState(false);

  if (!item) return null;

  const product = item.product || {};
  const fallbackInfo = sampleProductMap[item.product_id] || sampleProductMap[3];
  
  const productName = product.name || fallbackInfo.name;
  const categoryName = product.category_name || product.category || fallbackInfo.category;

  const imageUrl = getProductImageUrl(product, productName);

  const startDate = item.start_date || item.startDate;
  const endDate = item.end_date || item.endDate;
  const daysCount = calculateDays(startDate, endDate);

  const qty = Math.max(1, item.quantity || 1);
  const unitDailyRate = parseFloat(item.price || product.price || fallbackInfo?.price || 0);
  const unitDeposit = parseFloat(
    item.securityDeposit ?? 
    item.security_deposit ?? 
    product.security_deposit ?? 
    product.pricings?.[0]?.security_deposit ?? 
    fallbackInfo?.deposit ?? 
    0
  );

  const totalRental = unitDailyRate * daysCount * qty;
  const totalDeposit = unitDeposit * qty;

  const handleDecrease = () => {
    if (qty > 1) {
      if (onUpdateQuantity) onUpdateQuantity(item.id, qty - 1);
    } else {
      if (onRemove) onRemove(item.id);
    }
  };

  const handleIncrease = () => {
    if (onUpdateQuantity) onUpdateQuantity(item.id, qty + 1);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-5 border-b border-[var(--border)] last:border-b-0">
      {/* Product Image */}
      <div className="w-24 h-24 shrink-0 bg-[var(--bg-subtle)] rounded-2xl overflow-hidden border border-[var(--border)] relative">
        <img 
          src={imgErr ? getProductImageUrl({}, productName) : imageUrl} 
          alt={productName} 
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover" 
        />
      </div>
      
      {/* Details & Controls */}
      <div className="flex-grow flex flex-col justify-between space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="text-[10px] font-extrabold text-[var(--accent)] uppercase tracking-wider">{categoryName}</span>
            <h4 className="font-extrabold text-[var(--text)] text-base leading-snug">{productName}</h4>
            {startDate && endDate && (
              <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                Rental Period: <span className="font-bold text-[var(--text-secondary)]">{startDate}</span> to <span className="font-bold text-[var(--text-secondary)]">{endDate}</span> ({daysCount} day{daysCount > 1 ? 's' : ''})
              </div>
            )}
          </div>
          
          <button 
            onClick={() => onRemove && onRemove(item.id)}
            className="text-[var(--text-muted)] hover:text-red-500 p-1.5 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quantity Controls & Financial Itemization */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border)]/60">
          
          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[var(--text-secondary)] mr-1">Qty:</span>
            <div className="flex items-center gap-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-1 shadow-xs">
              <button 
                type="button"
                onClick={handleDecrease}
                className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] text-[var(--text)] font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
                title={qty === 1 ? "Remove item" : "Decrease quantity"}
              >
                -
              </button>
              <span className="text-sm font-black text-[var(--accent)] min-w-[20px] text-center">{qty}</span>
              <button 
                type="button"
                onClick={handleIncrease}
                className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] text-[var(--text)] font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
                title="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="flex items-center gap-6 text-right ml-auto">
            <div>
              <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">Rental Charge</span>
              <PriceDisplay amount={totalRental} className="font-black text-[var(--text)] text-sm" />
              {qty > 1 && (
                <span className="text-[10px] text-[var(--text-muted)] block">₹{unitDailyRate.toLocaleString('en-IN')}/day × {daysCount}d × {qty}</span>
              )}
            </div>

            {totalDeposit > 0 && (
              <div>
                <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">Refundable Deposit</span>
                <PriceDisplay amount={totalDeposit} className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm" />
                {qty > 1 && (
                  <span className="text-[10px] text-[var(--text-muted)] block">₹{unitDeposit.toLocaleString('en-IN')} × {qty}</span>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartItem;
