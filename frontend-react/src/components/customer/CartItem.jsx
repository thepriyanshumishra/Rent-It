import React from 'react';
import { Trash2, Package } from 'lucide-react';
import PriceDisplay from '../ui/PriceDisplay';

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

const CartItem = ({ item, onRemove }) => {
  if (!item) return null;

  const product = item.product || {};
  const fallbackInfo = sampleProductMap[item.product_id] || sampleProductMap[3];
  
  const productName = product.name || fallbackInfo.name;
  const categoryName = product.category_name || product.category || fallbackInfo.category;

  let imageUrl = product.primary_image;
  if (!imageUrl && product.images && product.images.length > 0) {
    const first = product.images[0];
    imageUrl = typeof first === 'string' ? first : (first.url || first.image_url);
  }

  const priceAmount = parseFloat(item.price || product.price || fallbackInfo?.price || 0);
  const depositAmount = parseFloat(
    item.securityDeposit ?? 
    item.security_deposit ?? 
    product.security_deposit ?? 
    product.pricings?.[0]?.security_deposit ?? 
    fallbackInfo?.deposit ?? 
    0
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-4 border-b border-border last:border-b-0">
      <div className="w-20 h-20 shrink-0 bg-bg-subtle rounded-2xl overflow-hidden border border-border">
        {imageUrl ? (
          <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-accent bg-accent-subtle">
            <Package className="w-7 h-7" />
          </div>
        )}
      </div>
      
      <div className="flex-grow flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{categoryName}</span>
            <h4 className="font-extrabold text-text text-base leading-snug">{productName}</h4>
            {(item.start_date || item.startDate) && (
              <div className="text-xs text-text-muted mt-1 font-medium">
                Rental Period: {item.start_date || item.startDate} to {item.end_date || item.endDate}
              </div>
            )}
          </div>
          <button 
            onClick={() => onRemove && onRemove(item.id)}
            className="text-text-muted hover:text-danger p-1.5 rounded-xl hover:bg-danger/10 transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-end justify-between mt-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Daily Rate</span>
            <PriceDisplay amount={priceAmount} className="font-black text-text text-base" />
          </div>
          {depositAmount > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Security Deposit (Refundable)</span>
              <PriceDisplay amount={depositAmount} className="font-bold text-text-secondary text-sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
