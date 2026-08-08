'use client';

import React from 'react';
import { formatMoney } from '../lib/utils';
import { ShieldCheck, Calendar, CheckCircle2 } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    shortDesc?: string;
    depositAmountPaise: number;
    imageUrls: string[];
    category?: { name: string };
    priceRules: Array<{ ratePaise: number; durationUnit: string }>;
    totalInventory: number;
  };
  onSelect: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const dayRule = product.priceRules.find((r) => r.durationUnit === 'DAY') || product.priceRules[0];
  const ratePaise = dayRule ? dayRule.ratePaise : 10000;

  return (
    <div className="group flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {product.imageUrls && product.imageUrls[0] ? (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 font-medium text-xs">
            No image
          </div>
        )}
        {/* Category Tag */}
        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-semibold text-slate-700 shadow-sm border border-slate-200">
            {product.category.name}
          </span>
        )}
        {/* Inventory Units Count Tag */}
        <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold shadow-sm">
          <CheckCircle2 className="h-3 w-3" />
          {product.totalInventory} Units
        </span>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 min-h-[32px]">
          {product.shortDesc || product.description || 'Professional equipment ready for rental.'}
        </p>

        {/* Financial Highlights Box */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Daily Rate
            </span>
            <span className="text-sm font-extrabold text-brand-700">
              {formatMoney(ratePaise)} <span className="text-[10px] font-normal text-slate-500">/day</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex items-center gap-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Deposit
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {formatMoney(product.depositAmountPaise)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(product.id)}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 px-4 text-xs font-bold text-white shadow hover:bg-brand-700 active:scale-98 transition"
        >
          <Calendar className="h-4 w-4" />
          Check Dates & Rent
        </button>
      </div>
    </div>
  );
};
