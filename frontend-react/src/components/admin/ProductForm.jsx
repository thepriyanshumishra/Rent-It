import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

export default function ProductForm({ product = null, onSave, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || '',
    short_description: product?.short_description || '',
    description: product?.description || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    rental_terms: product?.rental_terms || '',
    included_items: product?.included_items || '',
  });

  const [specifications, setSpecifications] = useState(
    product?.specifications ? Object.entries(product.specifications).map(([k, v]) => ({ key: k, value: v })) : []
  );

  const [pricing, setPricing] = useState(
    product?.pricing || [{ duration_days: 1, price: 0, security_deposit: 0 }]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpec = () => setSpecifications([...specifications, { key: '', value: '' }]);
  const removeSpec = (index) => setSpecifications(specifications.filter((_, i) => i !== index));

  const handlePriceChange = (index, field, value) => {
    const newPricing = [...pricing];
    newPricing[index][field] = Number(value);
    setPricing(newPricing);
  };

  const addPricing = () => setPricing([...pricing, { duration_days: 7, price: 0, security_deposit: 0 }]);
  const removePricing = (index) => setPricing(pricing.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Transform specifications array back to object
    const specsObj = {};
    specifications.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    onSave({
      ...formData,
      specifications: specsObj,
      pricing
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Product Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Sony A7III Camera"
          />
          <Select 
            label="Category" 
            name="category_id" 
            value={formData.category_id} 
            onChange={handleChange}
            options={[
              { value: '1', label: 'Cameras' },
              { value: '2', label: 'Lenses' },
              { value: '3', label: 'Lighting' },
              { value: '4', label: 'Audio' }
            ]}
          />
          <div className="md:col-span-2">
            <Input 
              label="Short Description" 
              name="short_description" 
              value={formData.short_description} 
              onChange={handleChange} 
              placeholder="Brief summary for listings"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-y"
              placeholder="Detailed product description..."
            />
          </div>
          <div className="flex gap-6 md:col-span-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="is_active" 
                checked={formData.is_active} 
                onChange={handleChange}
                className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text)]">Active (visible on store)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="is_featured" 
                checked={formData.is_featured} 
                onChange={handleChange}
                className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text)]">Featured Product</span>
            </label>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Pricing & Deposits</h3>
          <Button type="button" variant="outline" size="sm" onClick={addPricing} className="gap-2">
            <Plus size={16} /> Add Pricing Rule
          </Button>
        </div>
        <div className="space-y-4">
          {pricing.map((price, idx) => (
            <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-[var(--bg)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <div className="w-full md:w-1/3">
                <Input 
                  label="Duration (Days)" 
                  type="number" 
                  min="1"
                  value={price.duration_days} 
                  onChange={(e) => handlePriceChange(idx, 'duration_days', e.target.value)} 
                  required 
                />
              </div>
              <div className="w-full md:w-1/3">
                <Input 
                  label="Price (₹)" 
                  type="number" 
                  min="0"
                  value={price.price} 
                  onChange={(e) => handlePriceChange(idx, 'price', e.target.value)} 
                  required 
                />
              </div>
              <div className="w-full md:w-1/3">
                <Input 
                  label="Security Deposit (₹)" 
                  type="number" 
                  min="0"
                  value={price.security_deposit} 
                  onChange={(e) => handlePriceChange(idx, 'security_deposit', e.target.value)} 
                  required 
                />
              </div>
              <button 
                type="button" 
                onClick={() => removePricing(idx)}
                className="p-2.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-md transition-colors mb-0.5"
                disabled={pricing.length === 1}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Specifications</h3>
          <Button type="button" variant="outline" size="sm" onClick={addSpec} className="gap-2">
            <Plus size={16} /> Add Spec
          </Button>
        </div>
        <div className="space-y-3">
          {specifications.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">No specifications added yet.</p>
          ) : (
            specifications.map((spec, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-1/3">
                  <Input 
                    placeholder="e.g. Resolution" 
                    value={spec.key} 
                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)} 
                  />
                </div>
                <div className="flex-1">
                  <Input 
                    placeholder="e.g. 24.2 Megapixels" 
                    value={spec.value} 
                    onChange={(e) => handleSpecChange(idx, 'value', e.target.value)} 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => removeSpec(idx)}
                  className="p-2.5 text-[var(--text-muted)] hover:text-[var(--danger)] mt-0.5 rounded-md"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Terms & Includes */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Rental Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Included Items</label>
            <textarea
              name="included_items"
              value={formData.included_items}
              onChange={handleChange}
              rows={4}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-y"
              placeholder="Battery, Charger, Strap..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Specific Rental Terms</label>
            <textarea
              name="rental_terms"
              value={formData.rental_terms}
              onChange={handleChange}
              rows={4}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-y"
              placeholder="Any specific rules for this item..."
            />
          </div>
        </div>
      </div>

      {/* Images Upload Area (UI only) */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Images</h3>
        <div className="border-2 border-dashed border-[var(--border-strong)] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--bg-subtle)] transition-colors">
          <div className="w-12 h-12 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] mb-3">
            <Upload size={24} />
          </div>
          <p className="text-[var(--text)] font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-[var(--text-muted)]">SVG, PNG, JPG or GIF (max. 800x400px)</p>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border)]">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
