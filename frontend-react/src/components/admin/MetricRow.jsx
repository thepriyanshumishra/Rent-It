import React from 'react';
import Metric from '../ui/Metric';
import Skeleton from '../ui/Skeleton';

export default function MetricRow({ metrics = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[var(--bg-elevated)] p-5 rounded-2xl border border-[var(--border)]">
            <Skeleton className="w-8 h-8 rounded-xl mb-3" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {metrics.map((metric, i) => (
        <Metric
          key={i}
          title={metric.title}
          label={metric.label || metric.title}
          value={metric.value}
          icon={metric.icon}
          trend={metric.trend}
          change={metric.change || metric.trendValue}
          color={metric.color || 'var(--accent)'}
        />
      ))}
    </div>
  );
}
