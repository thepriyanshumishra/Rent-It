'use client';

import React, { useState } from 'react';
import { X, SearchCheck, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';

interface InspectionModalProps {
  rental: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({ rental, onClose, onSuccess }) => {
  const [result, setResult] = useState<'OK' | 'DAMAGED' | 'MISSING_ITEMS'>('OK');
  const [notes, setNotes] = useState('');
  const [damages, setDamages] = useState<Array<{ description: string; severity: string; chargeAmountPaise: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDamage = () => {
    setDamages([
      ...damages,
      { description: '', severity: 'MINOR', chargeAmountPaise: 50000 },
    ]);
  };

  const removeDamage = (index: number) => {
    setDamages(damages.filter((_, i) => i !== index));
  };

  const handleInspect = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`/rentals/${rental.id}/inspect`, {
        result,
        notes,
        damages: result !== 'OK' ? damages : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to complete inspection');
    } finally {
      setLoading(false);
    }
  };

  if (!rental) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
          Admin Operation
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-1">Equipment Condition Inspection</h2>
        <p className="text-xs text-slate-500 mt-1">
          Rental Order: <span className="font-mono font-bold text-slate-900">{rental.rentalNumber}</span>
        </p>

        {/* Inspection Result Options */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Inspection Condition Result</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setResult('OK')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                result === 'OK'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ✓ OK / Perfect
            </button>
            <button
              type="button"
              onClick={() => setResult('DAMAGED')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                result === 'DAMAGED'
                  ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⚠ Damaged
            </button>
            <button
              type="button"
              onClick={() => setResult('MISSING_ITEMS')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                result === 'MISSING_ITEMS'
                  ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ❓ Missing Items
            </button>
          </div>
        </div>

        {/* Damage Charges Entry */}
        {result !== 'OK' && (
          <div className="mt-4 p-4 rounded-xl bg-red-50/50 border border-red-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-900">Recorded Damage / Missing Items</span>
              <button
                type="button"
                onClick={addDamage}
                className="flex items-center gap-1 text-[11px] font-bold text-red-700 hover:text-red-900"
              >
                <Plus className="h-3.5 w-3.5" /> Add Charge Item
              </button>
            </div>

            {damages.map((d, i) => (
              <div key={i} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-red-200">
                <input
                  type="text"
                  placeholder="Description (e.g. Scratched lens glass)"
                  value={d.description}
                  onChange={(e) => {
                    const newD = [...damages];
                    newD[i].description = e.target.value;
                    setDamages(newD);
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                />
                <input
                  type="number"
                  placeholder="Charge (₹)"
                  value={d.chargeAmountPaise / 100}
                  onChange={(e) => {
                    const newD = [...damages];
                    newD[i].chargeAmountPaise = (Number(e.target.value) || 0) * 100;
                    setDamages(newD);
                  }}
                  className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => removeDamage(i)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Inspection comments..."
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
            onClick={handleInspect}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 text-xs font-bold text-white shadow hover:bg-purple-700 flex items-center justify-center gap-1.5"
          >
            <SearchCheck className="h-4 w-4" />
            {loading ? 'Submitting...' : 'Complete Inspection'}
          </button>
        </div>
      </div>
    </div>
  );
};
