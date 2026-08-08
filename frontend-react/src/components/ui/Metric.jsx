import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import Card from './Card';
import Skeleton from './Skeleton';
import { motion } from 'framer-motion';

const Metric = ({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  loading = false,
  prefix = '',
  suffix = '',
}) => {
  const trendConfig = {
    up: { icon: ArrowUpRight, color: 'text-success' },
    down: { icon: ArrowDownRight, color: 'text-danger' },
    neutral: { icon: Minus, color: 'text-text-muted' },
  };

  const TrendIcon = trendConfig[trend].icon;
  const trendColor = trendConfig[trend].color;

  return (
    <Card className="relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        {icon && <div className="text-text-muted/50 group-hover:text-accent transition-colors">{icon}</div>}
      </div>
      
      {loading ? (
        <Skeleton className="h-8 w-24 mb-2" />
      ) : (
        <div className="flex items-baseline gap-2">
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text"
          >
            {prefix}{value}{suffix}
          </motion.h3>
        </div>
      )}

      {change && !loading && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span>{change}</span>
        </div>
      )}
    </Card>
  );
};

export default Metric;
