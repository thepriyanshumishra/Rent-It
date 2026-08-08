import React, { useState, useEffect } from 'react';
import Skeleton from '../ui/Skeleton';
import { motion } from 'framer-motion';

export default function RevenueChart({ data = [], loading = false, period = 'month' }) {
  const [hoveredData, setHoveredData] = useState(null);

  if (loading) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-5 h-[350px] flex flex-col">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="flex-1 flex items-end gap-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${Math.random() * 60 + 20}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-5 h-[350px] flex items-center justify-center">
        <p className="text-[var(--text-muted)]">No revenue data available for this period.</p>
      </div>
    );
  }

  // Calculate SVG dimensions and scales
  const maxRevenue = Math.max(...data.map(d => d.revenue)) * 1.1 || 100; // Add 10% padding
  const svgHeight = 250;
  const getY = (val) => svgHeight - (val / maxRevenue) * svgHeight;
  
  // Format currency
  const formatCurrency = (val) => `₹${val.toLocaleString()}`;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-5 h-[350px] flex flex-col relative group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[var(--text)]">Revenue</h3>
        <div className="flex space-x-2">
          <span className="text-sm text-[var(--text-muted)] capitalize">{period} Overview</span>
        </div>
      </div>

      <div className="flex-1 relative mt-4">
        {/* Y-axis labels and grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          {[4, 3, 2, 1, 0].map((step) => {
            const val = (maxRevenue * step) / 4;
            return (
              <div key={step} className="flex items-center w-full relative">
                <span className="text-xs text-[var(--text-muted)] w-12 shrink-0">{formatCurrency(val)}</span>
                <div className="flex-1 border-t border-[var(--border-subtle)] border-dashed ml-2"></div>
              </div>
            );
          })}
        </div>

        {/* SVG Chart area */}
        <div className="absolute inset-0 ml-14 pb-6 flex items-end justify-between">
          {data.map((point, index) => {
            const height = (point.revenue / maxRevenue) * 100;
            return (
              <div 
                key={index} 
                className="relative flex flex-col items-center flex-1 h-full justify-end group/bar"
                onMouseEnter={() => setHoveredData(point)}
                onMouseLeave={() => setHoveredData(null)}
              >
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                  className="w-full max-w-[40px] bg-[var(--accent)] rounded-t-sm opacity-80 group-hover/bar:opacity-100 cursor-pointer transition-opacity"
                  style={{ minHeight: point.revenue > 0 ? '4px' : '0' }}
                />
                {/* X-axis label */}
                <div className="absolute -bottom-6 text-[10px] text-[var(--text-muted)] whitespace-nowrap overflow-hidden text-center w-full">
                  {point.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3 shadow-lg pointer-events-none z-10"
          >
            <p className="text-xs text-[var(--text-muted)] mb-1">{hoveredData.date}</p>
            <p className="text-lg font-bold text-[var(--text)]">{formatCurrency(hoveredData.revenue)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
