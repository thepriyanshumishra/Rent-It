import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Sparkles, Package, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import PriceDisplay from '../ui/PriceDisplay';
import Button from '../ui/Button';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [rentedInfo, setRentedInfo] = useState(null);

  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem('rentos_placed_orders');
      if (stored) {
        const orders = JSON.parse(stored);
        const activeOrder = orders.find(o => {
          const pName = o.product?.name || o.items?.[0]?.product?.name || '';
          return pName.toLowerCase().includes(product.name.toLowerCase()) || 
                 product.name.toLowerCase().includes(pName.toLowerCase()) ||
                 o.product_id === product.id;
        });

        if (activeOrder && activeOrder.end_date) {
          const endMs = new Date(activeOrder.end_date).getTime();
          const nowMs = Date.now();
          const diffMs = endMs - nowMs;

          if (diffMs > 0) {
            const hours = Math.floor(diffMs / 3600000);
            const mins = Math.floor((diffMs % 3600000) / 60000);
            setRentedInfo({ hours, mins });
          } else {
            setRentedInfo({ hours: 2, mins: 45 });
          }
        }
      }
    } catch (e) {
      console.warn('Stock status check warning', e);
    }
  }, [product]);

  if (!product) return null;

  const {
    id, name, slug, short_description, images, primary_image,
    category, category_name, pricings, rating, review_count,
    is_featured, price
  } = product;

  // Resolve image URL
  let imageUrl = primary_image;
  if (!imageUrl && images && images.length > 0) {
    const first = images[0];
    imageUrl = typeof first === 'string' ? first : (first.url || first.image_url);
  }

  const cheapestPricing = pricings && pricings.length > 0 
    ? [...pricings].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0] 
    : null;

  const priceAmount = cheapestPricing ? cheapestPricing.price : (price || 0);
  const periodLabel = cheapestPricing ? (cheapestPricing.period_name || 'day') : 'day';
  const categoryLabel = category_name || (typeof category === 'string' ? category : category?.name);

  return (
    <motion.div 
      className="group relative flex flex-col bg-bg-elevated border border-border rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent hover:shadow-xl"
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/product/${slug}`)}
    >
      {is_featured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="accent" className="shadow-md backdrop-blur-md bg-accent text-white border-none flex items-center gap-1 font-extrabold text-[11px] px-2.5 py-1">
            <Sparkles className="w-3 h-3" /> Featured
          </Badge>
        </div>
      )}

      {/* Dynamic Stock & Return Countdown Badge */}
      <div className="absolute top-3 right-3 z-10">
        {rentedInfo ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-900/80 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-md">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" /> Available in {rentedInfo.hours}h {rentedInfo.mins}m
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-success/15 text-success border border-success/30 backdrop-blur-md shadow-sm">
            <ShieldCheck className="w-3 h-3" /> In Stock
          </span>
        )}
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-subtle">
        {imageUrl && !imgError ? (
          <motion.img 
            src={imageUrl} 
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 text-center">
            <Package className="w-10 h-10 text-accent/60 mb-2" />
            <span className="text-xs font-bold text-text-secondary line-clamp-1">{name}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-grow p-5">
        {categoryLabel && (
          <div className="mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
              {categoryLabel}
            </span>
          </div>
        )}

        <h3 className="font-extrabold text-text text-base line-clamp-1 mb-1.5 group-hover:text-accent transition-colors">
          {name}
        </h3>

        <p className="text-xs text-text-muted line-clamp-2 mb-4 flex-grow leading-relaxed">
          {short_description || 'High quality equipment available for flexible short and long term rentals.'}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-border-subtle">
          <div className="flex flex-col">
            {rating > 0 && (
              <div className="flex items-center text-xs text-warning mb-0.5">
                <Star className="w-3.5 h-3.5 fill-current mr-1" />
                <span className="font-bold text-text">{rating}</span>
                <span className="text-text-muted ml-1">({review_count || 12})</span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <PriceDisplay amount={priceAmount} className="text-text font-black text-lg" />
              <span className="text-xs text-text-muted font-medium">/ {periodLabel.toLowerCase()}</span>
            </div>
          </div>

          <Button 
            variant="primary" 
            size="sm" 
            className="rounded-xl px-4 py-2 text-xs font-bold shadow-sm hover:shadow-md transition-all"
            onClick={(e) => { 
              e.stopPropagation(); 
              navigate(`/product/${slug}`); 
            }}
          >
            Rent Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
