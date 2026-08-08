import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, Package, ArrowUpRight } from 'lucide-react';
import Button from '../ui/Button';

const sampleImageFallbackMap = {
  'sony fx3': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  'macbook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  'super73': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
  'inspire': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
  'partybox': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
  'vision pro': 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
  'cam': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const {
    id, name, slug, short_description, images, primary_image,
    category, category_name, pricings, price, security_deposit,
    is_featured
  } = product;

  // Resolve image URL cleanly
  let imageUrl = primary_image || product.image_url || product.image;
  if (!imageUrl && images && images.length > 0) {
    const first = images[0];
    imageUrl = typeof first === 'string' ? first : (first.url || first.image_url || first.image);
  }

  // Fallback to high quality photography image if missing or error
  if (!imageUrl || imgError) {
    const lname = name?.toLowerCase() || '';
    for (const [key, fallbackUrl] of Object.entries(sampleImageFallbackMap)) {
      if (lname.includes(key)) {
        imageUrl = fallbackUrl;
        break;
      }
    }
  }

  const cheapestPricing = pricings && pricings.length > 0 
    ? [...pricings].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0] 
    : null;

  const priceAmount = cheapestPricing ? cheapestPricing.price : (price || 2000);
  const depositAmount = security_deposit || product.deposit || 30000;
  const categoryLabel = category_name || (typeof category === 'string' ? category : category?.name) || 'Cameras & Video';

  const formatDescription = (desc) => {
    if (!desc || desc.length < 5 || desc === 'dekhte hai') {
      return 'Professional grade enterprise equipment certified by HQ quality inspection.';
    }
    return desc;
  };

  return (
    <motion.div 
      className="group relative flex flex-col bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-[var(--accent)] hover:shadow-2xl hover:shadow-[var(--accent)]/10"
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/product/${slug || id}`)}
    >
      {/* Featured Badge */}
      {is_featured && (
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[var(--accent)] text-white shadow-md">
            <Sparkles className="w-3 h-3" /> HQ Featured
          </span>
        </div>
      )}

      {/* Stock Status Badge */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/90 text-white shadow-md backdrop-blur-md">
          <ShieldCheck className="w-3 h-3" /> In Stock
        </span>
      </div>

      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-subtle)]">
        {imageUrl && !imgError ? (
          <img 
            src={imageUrl} 
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)] bg-[var(--bg-subtle)] p-4 text-center">
            <Package className="w-12 h-12 text-[var(--accent)]/60 mb-2" />
            <span className="text-xs font-extrabold text-[var(--text-secondary)] line-clamp-1">{name}</span>
          </div>
        )}
      </div>
      
      {/* Product Info Section */}
      <div className="flex flex-col flex-grow p-5 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] block">
          {categoryLabel}
        </span>

        <h3 className="font-black text-[var(--text)] text-base line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
          {name}
        </h3>

        <p className="text-xs text-[var(--text-muted)] font-medium line-clamp-2 leading-relaxed flex-grow">
          {formatDescription(short_description)}
        </p>
        
        {/* Deposit Tag */}
        <div className="pt-2">
          <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-secondary)] inline-block">
            Security Deposit: <strong className="text-[var(--text)] font-extrabold">₹{Number(depositAmount).toLocaleString()}</strong>
          </span>
        </div>

        {/* Footer Rate & Action */}
        <div className="flex items-center justify-between pt-3.5 border-t border-[var(--border)] mt-auto">
          <div>
            <span className="text-lg font-black text-[var(--text)]">₹{Number(priceAmount).toLocaleString()}</span>
            <span className="text-[11px] font-bold text-[var(--text-muted)] ml-1">/ day</span>
          </div>

          <Button 
            size="sm" 
            className="rounded-xl px-4 py-2 text-xs font-black shadow-sm flex items-center gap-1 group-hover:bg-[var(--accent-hover)]"
            onClick={(e) => { 
              e.stopPropagation(); 
              navigate(`/product/${slug || id}`); 
            }}
          >
            Rent Now <ArrowUpRight size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
