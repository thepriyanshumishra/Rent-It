import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, Download, Calendar, ArrowUpRight, Package } from 'lucide-react';
import Badge from '../ui/Badge';
import PriceDisplay from '../ui/PriceDisplay';
import Button from '../ui/Button';

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

const RentalCard = ({ rental, onExtend }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  if (!rental) return null;

  const { id, order_number, product, status, start_date, end_date, total_price, deposit_amount } = rental;

  const fallbackProduct = sampleProductMap[rental.product_id] || sampleProductMap[3];
  const productName = product?.name || fallbackProduct.name;
  const categoryName = product?.category_name || product?.category || fallbackProduct.category;
  const depositFee = deposit_amount || fallbackProduct.deposit;

  // Image resolution
  let imageUrl = product?.primary_image || product?.image;
  if (!imageUrl && product?.images && product.images.length > 0) {
    const first = product.images[0];
    imageUrl = typeof first === 'string' ? first : (first.url || first.image_url);
  }

  // Calculate live return countdown
  useEffect(() => {
    const calculateCountdown = () => {
      const targetMs = new Date(end_date || Date.now() + 3*86400000).getTime();
      const diffMs = targetMs - Date.now();
      
      if (diffMs <= 0) {
        setTimeLeft('Return Due Today');
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h Remaining`);
      } else {
        setTimeLeft(`${hours}h ${mins}m Remaining`);
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 30000);
    return () => clearInterval(timer);
  }, [end_date]);

  return (
    <div 
      className="relative flex flex-col bg-bg-elevated border border-border rounded-3xl p-5 md:p-6 transition-all duration-300 hover:border-accent hover:shadow-xl cursor-pointer group"
      onClick={() => navigate(`/my-rentals/${id}`)}
    >
      <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between border-b border-border pb-5 mb-5">
        
        {/* Left Image & Product Details */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 shrink-0 bg-bg-subtle rounded-2xl overflow-hidden border border-border">
            {imageUrl && !imgError ? (
              <img 
                src={imageUrl} 
                alt={productName} 
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-accent bg-accent-subtle">
                <Package className="w-8 h-8" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-extrabold text-accent">{order_number || id}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-success/10 text-success border border-success/20 capitalize">
                Active Rental
              </span>
            </div>
            <h3 className="font-extrabold text-text text-base leading-snug group-hover:text-accent transition-colors">
              {productName}
            </h3>
            <p className="text-xs text-text-muted mt-1 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" /> {start_date} → {end_date}
            </p>
          </div>
        </div>

        {/* Right Financial & Countdown Summary */}
        <div className="flex flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-border-subtle">
          <div className="text-left md:text-right">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Amount</span>
            <PriceDisplay amount={total_price || 6800} className="font-black text-text text-lg" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-accent-subtle text-accent border border-accent/20 mt-1">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> {timeLeft}
          </div>
        </div>

      </div>

      {/* Footer Details & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-1.5 text-xs text-text-muted font-medium bg-bg-subtle px-3 py-1.5 rounded-xl border border-border w-full sm:w-auto">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span>Security Deposit Held: <strong className="text-text font-bold">₹{depositFee.toLocaleString()}</strong></span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onExtend && (
            <Button 
              variant="secondary" 
              size="sm"
              className="rounded-xl font-bold text-xs py-2 px-3 flex-1 sm:flex-none"
              onClick={(e) => { e.stopPropagation(); onExtend(rental); }}
            >
              Extend Duration
            </Button>
          )}

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
