import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ShieldCheck, Image as ImageIcon } from 'lucide-react';

const ProductGallery = ({ images = [], productName = "Equipment" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.url || img.image_url || img.image;
  };

  const rawList = Array.isArray(images) ? images.map(getImageUrl).filter(Boolean) : [];
  const imageList = rawList.length > 0 ? rawList : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop'];

  const activeUrl = imageList[currentIndex] || imageList[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl overflow-hidden group shadow-md flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={activeUrl}
            alt={`${productName} - View ${currentIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => setIsZoomed(true)}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none z-10">
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[var(--bg)]/90 backdrop-blur-md text-[var(--text)] border border-[var(--border)] shadow-xs flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" /> Quality Inspected
          </span>
        </div>

        {/* Zoom Button */}
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-4 right-4 p-2.5 rounded-2xl bg-[var(--bg)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--text)] hover:text-[var(--accent)] transition-all shadow-md group-hover:opacity-100 opacity-80"
          title="Full screen view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Counter Badge */}
        {imageList.length > 1 && (
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-extrabold flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-white/80" /> {currentIndex + 1} / {imageList.length}
          </div>
        )}
      </div>

      {/* Thumbnails Rail */}
      {imageList.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
          {imageList.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                i === currentIndex
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 scale-105 shadow-md'
                  : 'border-[var(--border)] opacity-60 hover:opacity-100 hover:border-[var(--border-strong)]'
              }`}
            >
              <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={activeUrl}
              alt={productName}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductGallery;
