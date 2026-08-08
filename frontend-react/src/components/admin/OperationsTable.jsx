import React, { useState } from 'react';
import { Truck, RotateCcw, AlertTriangle, Eye, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import Badge from '../ui/Badge';
import { Link } from 'react-router-dom';

export default function OperationsTable({ operations = [], loading = false }) {
  const [activeTab, setActiveTab] = useState('all');
  
  if (loading) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-5 overflow-hidden">
        <div className="flex gap-4 mb-4 border-b border-[var(--border)] pb-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-6 w-20" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'All Operations' },
    { id: 'pickup', label: 'Pickups' },
    { id: 'return', label: 'Returns' },
    { id: 'overdue', label: 'Overdue' }
  ];

  const filteredOps = operations.filter(op => activeTab === 'all' || op.type === activeTab);

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl flex flex-col h-full overflow-hidden">
      <div className="px-5 pt-5 pb-0 border-b border-[var(--border)]">
        <div className="flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {filteredOps.length === 0 ? (
          <EmptyState 
            icon={Check} 
            title="All caught up!" 
            description={`No ${activeTab !== 'all' ? activeTab + ' ' : ''}operations scheduled for today.`} 
          />
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <AnimatePresence>
                  {filteredOps.map((op) => (
                    <motion.tr 
                      key={op.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] transition-colors group"
                    >
                      <td className="py-3 text-[var(--text-secondary)] whitespace-nowrap">{op.time}</td>
                      <td className="py-3 font-medium">{op.customerName}</td>
                      <td className="py-3 text-[var(--text-secondary)]">{op.productName}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {op.type === 'pickup' && <Truck size={14} className="text-[var(--info)]" />}
                          {op.type === 'return' && <RotateCcw size={14} className="text-[var(--success)]" />}
                          {op.type === 'overdue' && <AlertTriangle size={14} className="text-[var(--danger)]" />}
                          <span className="capitalize">{op.type}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge 
                          variant={op.status === 'pending' ? 'warning' : op.status === 'completed' ? 'success' : 'default'}
                        >
                          {op.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Link 
                          to={`/admin/rentals/${op.rentalId}`}
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
