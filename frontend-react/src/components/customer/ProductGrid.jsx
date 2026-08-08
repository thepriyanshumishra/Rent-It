import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import { Package } from 'lucide-react';

const ProductGrid = ({ products = [], loading = false, columns = 3 }) => {
  // Safely extract items array whether products is a plain array, DRF paginated object, or Axios response
  const items = Array.isArray(products)
    ? products
    : Array.isArray(products?.results)
    ? products.results
    : Array.isArray(products?.data?.results)
    ? products.data.results
    : Array.isArray(products?.data)
    ? products.data
    : [];

  const getGridClass = () => {
    switch(columns) {
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 3:
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (loading) {
    return (
      <div className={`grid gap-6 ${getGridClass()}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col bg-elevated border border-subtle rounded-2xl overflow-hidden h-[340px]">
             <Skeleton className="w-full aspect-[4/3] rounded-none" />
             <div className="p-4 flex flex-col flex-grow">
               <Skeleton className="w-16 h-5 mb-2" />
               <Skeleton className="w-3/4 h-5 mb-2" />
               <Skeleton className="w-full h-8 mb-4" />
               <div className="mt-auto flex justify-between items-end">
                 <Skeleton className="w-20 h-6" />
                 <Skeleton className="w-24 h-8" />
               </div>
             </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState 
        icon={<Package className="w-12 h-12" />}
        title="No products found"
        description="Try adjusting your filters or search criteria to find what you're looking for."
      />
    );
  }

  return (
    <motion.div 
      className={`grid gap-6 ${getGridClass()}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05 }
        }
      }}
    >
      {items.map(product => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
