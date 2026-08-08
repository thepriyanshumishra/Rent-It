'use client';

import React, { useState } from 'react';
import { X, Receipt, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { formatMoney } from '../lib/utils';

interface SettlementModalProps {
  rental: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({ rental, onClose, onSuccess }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSettle = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`/rentals/${rental.id}/settle`, { notes });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to settle deposit');
    } finally {
      setLoading(false);
    }
  };

  if (!rental) return null;

  const heldDeposit = rental.depositTotalPaise || 0;
  const existingCharges = rental.charges?.reduce((sum: number, c: any) => sum + c.amountPaise, 0) || 0;
  const netRefund = Math.max(0, heldDeposit - existingCharges);
  const netDeduction = Math.min(heldDeposit, existingCharges);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
          Financial Operation
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-1">Settle Security Deposit</h2>
        <p className="text-xs text-slate-500 mt-1">
          Rental Order: <span className="font-mono font-bold text-slate-900">{rental.rentalNumber}</span>
        </p>

        {/* Settlement Financial Summary */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Security Deposit Held:</span>
            <span className="font-bold text-slate-900">{formatMoney(heldDeposit)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Inspection & Late Fee Charges:</span>
            <span className="font-bold text-red-600">{formatMoney(existingCharges)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Deducted from Deposit:</span>
            <span className="font-bold text-slate-900">{formatMoney(netDeduction)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-emerald-700">
            <span>Net Customer Refund:</span>
            <span>{formatMoney(netRefund)}</span>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Settlement Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Deposit settlement completed."
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
            onClick={handleSettle}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow hover:bg-emerald-700 flex items-center justify-center gap-1.5"
          >
            <Receipt className="h-4 w-4" />
            {loading ? 'Settling...' : 'Confirm Settlement'}
          </button>
        </div>
      </div>
    </div>
  );
};
