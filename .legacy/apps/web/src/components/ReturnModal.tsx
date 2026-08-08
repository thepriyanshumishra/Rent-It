'use client';

import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import api from '../lib/api';

interface ReturnModalProps {
  rental: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ rental, onClose, onSuccess }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReturn = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`/rentals/${rental.id}/return`, { notes });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to process return');
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

        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
          Admin Operation
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-1">Record Equipment Return</h2>
        <p className="text-xs text-slate-500 mt-1">
          Rental Order: <span className="font-mono font-bold text-slate-900">{rental.rentalNumber}</span>
        </p>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Return Notes / Observations</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Returned at counter by customer. Items appear complete."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-brand-600 outline-none"
          />
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
            onClick={handleReturn}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-amber-600 text-xs font-bold text-white shadow hover:bg-amber-700 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            {loading ? 'Recording...' : 'Record Return'}
          </button>
        </div>
      </div>
    </div>
  );
};
