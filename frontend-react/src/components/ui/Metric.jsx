import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, FileText, Clock, Truck, DollarSign } from 'lucide-react';
import Card from './Card';
import Skeleton from './Skeleton';
import { motion } from 'framer-motion';

const ICON_MAP = {
  'file-text': FileText,
  'clock': Clock,
  'truck': Truck,
  'dollar-sign': DollarSign
};

const Metric = ({
  label,
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  loading = false,
  prefix = '',
  suffix = '',
  color = 'var(--accent)'
}) => {
  const displayLabel = label || title;
  const trendConfig = {
    up: { icon: ArrowUpRight, color: 'text-success' },
    down: { icon: ArrowDownRight, color: 'text-danger' },
    neutral: { icon: Minus, color: 'text-text-muted' },
  };

  const TrendIcon = trendConfig[trend]?.icon || Minus;
  const trendColor = trendConfig[trend]?.color || 'text-text-muted';

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string' && ICON_MAP[icon]) {
      const IconComponent = ICON_MAP[icon];
      return <IconComponent className="w-5 h-5" />;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && 'render' in icon)) {
      const IconComponent = icon;
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  return (
    <Card className="relative overflow-hidden group border border-[var(--border)] p-5 rounded-2xl bg-[var(--bg-elevated)] shadow-xs">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">{displayLabel}</span>
        {icon && (
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
            {renderIcon()}
          </div>
        )}
      </div>
      
      {loading ? (
        <Skeleton className="h-8 w-24 mb-2" />
      ) : (
        <div className="flex items-baseline gap-2 mt-1">
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black tracking-tight text-[var(--text)]"
          >
            {prefix}{value}{suffix}
          </motion.h3>
        </div>
      )}

      {change && !loading && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{change}</span>
        </div>
      )}
    </Card>
  );
};

export default Metric;
