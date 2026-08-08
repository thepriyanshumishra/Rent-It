import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function InspectionForm({ returnRecord, inventoryItem, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    condition: 'good',
    hasDamage: false,
    damageDescription: '',
    estimatedCost: 0,
    hasMissingItems: false,
    missingDescription: '',
    inspectorNotes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
        <CheckCircle className="text-[var(--success)]" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">Return Inspection</h3>
          <p className="text-sm text-[var(--text-muted)]">Inspect item and record condition upon return.</p>
        </div>
      </div>

      <Select
        label="Item Condition"
        name="condition"
        value={formData.condition}
        onChange={handleChange}
        options={[
          { value: 'excellent', label: 'Excellent - Like New' },
          { value: 'good', label: 'Good - Normal Wear' },
          { value: 'fair', label: 'Fair - Heavy Wear' },
          { value: 'damaged', label: 'Damaged - Requires Repair' }
        ]}
        required
      />

      <div className="space-y-4">
        <label className="flex items-center gap-2 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg cursor-pointer hover:border-[var(--danger)] transition-colors">
          <input 
            type="checkbox" 
            name="hasDamage" 
            checked={formData.hasDamage} 
            onChange={handleChange}
            className="rounded border-[var(--border)] text-[var(--danger)] focus:ring-[var(--danger)]"
          />
          <span className="font-medium text-[var(--text)] flex items-center gap-2">
            <AlertTriangle size={16} className={formData.hasDamage ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'} />
            Item is Damaged
          </span>
        </label>

        {formData.hasDamage && (
          <div className="pl-8 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Damage Details</label>
              <textarea
                name="damageDescription"
                value={formData.damageDescription}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--danger)] resize-y"
                placeholder="Describe the damage..."
                required
              />
            </div>
            <Input 
              label="Estimated Repair Cost (₹)" 
              name="estimatedCost" 
              type="number" 
              min="0"
              value={formData.estimatedCost} 
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-2 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg cursor-pointer hover:border-[var(--warning)] transition-colors">
          <input 
            type="checkbox" 
            name="hasMissingItems" 
            checked={formData.hasMissingItems} 
            onChange={handleChange}
            className="rounded border-[var(--border)] text-[var(--warning)] focus:ring-[var(--warning)]"
          />
          <span className="font-medium text-[var(--text)]">Parts/Accessories Missing</span>
        </label>

        {formData.hasMissingItems && (
          <div className="pl-8 animate-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Missing Items List</label>
            <textarea
              name="missingDescription"
              value={formData.missingDescription}
              onChange={handleChange}
              rows={2}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--warning)] resize-y"
              placeholder="e.g. Lens cap, battery charger..."
              required
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Internal Notes</label>
        <textarea
          name="inspectorNotes"
          value={formData.inspectorNotes}
          onChange={handleChange}
          rows={3}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-y"
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary">
          Submit Inspection
        </Button>
      </div>
    </form>
  );
}
