import React from 'react';
import Metric from '../ui/Metric';
import Skeleton from '../ui/Skeleton';

export default function MetricRow({ metrics = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)]">
            <Skeleton className="w-8 h-8 rounded-full mb-3" />
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, i) => (
        <Metric
          key={i}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          trend={metric.trend}
          trendValue={metric.trendValue}
          color={metric.color || 'var(--accent)'}
        />
      ))}
    </div>
  );
}
