import React from 'react';
import { AlertCircle, Clock, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import { Link } from 'react-router-dom';

export default function AttentionItems({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-5">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">Needs Attention</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-5 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">Needs Attention</h3>
      
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 text-[var(--success)] flex items-center justify-center mb-3">
            <AlertCircle size={24} />
          </div>
          <p className="text-[var(--text)] font-medium">All clear!</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Nothing requires your immediate attention.</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
          {items.map((item, idx) => {
            let Icon = AlertCircle;
            let iconColor = 'var(--accent)';
            let bgColor = 'var(--accent-subtle)';
            
            if (item.type === 'overdue') {
              Icon = AlertTriangle;
              iconColor = 'var(--danger)';
              bgColor = 'var(--danger)/10';
            } else if (item.type === 'pending_returns') {
              Icon = Clock;
              iconColor = 'var(--warning)';
              bgColor = 'var(--warning)/10';
            } else if (item.type === 'low_inventory') {
              Icon = Package;
              iconColor = 'var(--info)';
              bgColor = 'var(--info)/10';
            }

            return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] transition-colors group">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: bgColor, color: iconColor }}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--text)] truncate">{item.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{item.description}</p>
                </div>
                {item.link && (
                  <Link 
                    to={item.link}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors self-center"
                  >
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
