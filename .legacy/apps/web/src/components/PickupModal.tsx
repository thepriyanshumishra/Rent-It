'use client';

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

interface PickupModalProps {
  rental: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const PickupModal: React.FC<PickupModalProps> = ({ rental, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`/rentals/${rental.id}/pickup`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to confirm pickup');
    } finally {
      setLoading(false);
    }
  };

  if (!rental) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
          Admin Operation
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-1">Confirm Pickup / Handover</h2>
        <p className="text-xs text-slate-500 mt-1">
          Rental Order: <span className="font-mono font-bold text-slate-900">{rental.rentalNumber}</span>
        </p>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-semibold text-slate-900">{rental.customer?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Scheduled Period:</span>
            <span className="font-medium text-slate-800">
              {new Date(rental.startDate).toLocaleDateString()} – {new Date(rental.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="font-semibold text-slate-700 block mb-1">Equipment Items:</span>
            {rental.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-slate-800 font-medium">
                <span>{item.product?.name}</span>
                <span>×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="mt-3 text-xs font-semibold text-red-600">{error}</div>}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow hover:bg-emerald-700 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Processing...' : 'Confirm Handover'}
          </button>
        </div>
      </div>
    </div>
  );
};
