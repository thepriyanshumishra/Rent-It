import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductGallery = ({ images = [], productName = "Product" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.url || img.image_url || img.image;
  };

  const imageList = Array.isArray(images) ? images.map(getImageUrl).filter(Boolean) : [];

  if (imageList.length === 0) {
    return (
      <div className="w-full aspect-square md:aspect-[4/3] bg-bg-elevated border border-border rounded-2xl flex items-center justify-center text-text-muted">
        No Images Available
      </div>
    );
  }

  const activeUrl = imageList[currentIndex] || imageList[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square md:aspect-[4/3] bg-bg-elevated border border-border rounded-2xl overflow-hidden group shadow-sm">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={activeUrl}
            alt={`${productName} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        
        {/* Mobile Dot Navigation */}
        {imageList.length > 1 && (
          <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {imageList.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === currentIndex ? 'bg-accent' : 'bg-text-muted/50'}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Rail */}
      {imageList.length > 1 && (
        <div className="hidden md:flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {imageList.map((url, i) => (
            <div 
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`
                w-20 h-20 shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                ${i === currentIndex ? 'border-accent opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}
              `}
            >
              <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
