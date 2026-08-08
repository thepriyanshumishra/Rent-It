import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import MultiFileUpload from '../ui/MultiFileUpload';
import { Plus, Trash2, Box, Info, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';

export default function ProductForm({ product = null, onSave, onCancel, loading = false }) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category?.id ? String(product.category.id) : (product?.category_id ? String(product.category_id) : ''),
    price: product?.price ? String(product.price) : '',
    security_deposit: product?.security_deposit ? String(product.security_deposit) : (product?.deposit ? String(product.deposit) : ''),
    quantity: product?.quantity ?? 1,
    available_quantity: product?.available_quantity ?? (product?.quantity ?? 1),
    short_description: product?.short_description || '',
    description: product?.description || '',
    included_items: product?.included_items || '',
    rental_terms: product?.rental_terms || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    images: Array.isArray(product?.images) 
      ? product.images.map(img => img.image_url || img.url || img.image).filter(Boolean)
      : (product?.image_url ? [product.image_url] : []),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/');
      return data.results || data || [];
    }
  });

  const categoryOptions = (categories || []).map(cat => ({
    value: String(cat.id),
    label: cat.name
  }));

  const [specifications, setSpecifications] = useState(
    product?.specifications && typeof product.specifications === 'object'
      ? Object.entries(product.specifications).map(([k, v]) => ({ key: k, value: String(v) }))
      : []
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

  const handlePhotosChange = (urls) => {
    setFormData(prev => ({ ...prev, images: urls }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const specsObj = {};
    specifications.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    onSave({
      ...formData,
      price: Number(formData.price) || 0,
      security_deposit: Number(formData.security_deposit) || 0,
      quantity: Number(formData.quantity) || 1,
      available_quantity: Number(formData.available_quantity) || 0,
      category: formData.category_id ? Number(formData.category_id) : null,
      specifications: specsObj,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Basic Equipment Information */}
      <div className="card p-6 border border-[var(--border)] bg-[var(--bg-elevated)] space-y-4 rounded-2xl shadow-xs">
        <h3 className="text-base font-black text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <Box className="w-4 h-4 text-[var(--accent)]" /> Basic Equipment Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Sony FX3 Cinema Camera Body"
              className="input-field py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleChange}
              className="input-field py-2.5 text-sm"
            >
              <option value="">Select Category...</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing, Deposit & Stock Quantity Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Daily Rate (₹/day) *
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 2500"
              className="input-field py-2.5 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Security Deposit (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              name="security_deposit"
              required
              value={formData.security_deposit}
              onChange={handleChange}
              placeholder="e.g. 15000"
              className="input-field py-2.5 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Total Stock Quantity *
            </label>
            <input
              type="number"
              min="1"
              name="quantity"
              required
              value={formData.quantity}
              onChange={handleChange}
              className="input-field py-2.5 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Available Units *
            </label>
            <input
              type="number"
              min="0"
              max={formData.quantity}
              name="available_quantity"
              required
              value={formData.available_quantity}
              onChange={handleChange}
              className="input-field py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </div>

        {/* Active & Featured Visibility Controls */}
        <div className="flex flex-wrap gap-6 pt-2 border-t border-[var(--border)]">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4"
            />
            <span className="text-xs font-extrabold text-[var(--text)]">Active & Visible on Storefront</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4"
            />
            <span className="text-xs font-extrabold text-[var(--text)]">Featured Equipment (Homepage Banner)</span>
          </label>
        </div>
      </div>

      {/* Descriptions & Included Items */}
      <div className="card p-6 border border-[var(--border)] bg-[var(--bg-elevated)] space-y-4 rounded-2xl shadow-xs">
        <h3 className="text-base font-black text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <Info className="w-4 h-4 text-[var(--accent)]" /> Descriptions & Rental Notes
        </h3>

        <div>
          <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
            Short Description (Summary for Search Cards)
          </label>
          <input
            type="text"
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            placeholder="Brief summary line (e.g. 4K 120fps Full-Frame Cinema Camera with dual ISO)"
            className="input-field py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
            Full Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed equipment description, features, specs, and usage guidelines..."
            className="input-field py-2.5 text-sm resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Included Items (What's in the box)
            </label>
            <textarea
              name="included_items"
              rows={3}
              value={formData.included_items}
              onChange={handleChange}
              placeholder="e.g. Body cap, 2x NP-FZ100 batteries, dual charger, XLR top handle, carrying case"
              className="input-field py-2.5 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Specific Rental Terms / Rules
            </label>
            <textarea
              name="rental_terms"
              rows={3}
              value={formData.rental_terms}
              onChange={handleChange}
              placeholder="e.g. Government ID proof required at pickup. Returns due by 11:00 AM."
              className="input-field py-2.5 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Equipment Photos */}
      <div className="card p-6 border border-[var(--border)] bg-[var(--bg-elevated)] space-y-4 rounded-2xl shadow-xs">
        <h3 className="text-base font-black text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <ImageIcon className="w-4 h-4 text-[var(--accent)]" /> Equipment Photos
        </h3>

        <MultiFileUpload
          label="Equipment Gallery Photos"
          values={formData.images}
          onChange={handlePhotosChange}
          maxFiles={5}
          helperText="Upload clear high-res photos. First image will serve as primary storefront cover."
        />
      </div>

      {/* Key Specifications */}
      <div className="card p-6 border border-[var(--border)] bg-[var(--bg-elevated)] space-y-4 rounded-2xl shadow-xs">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
          <h3 className="text-base font-black text-[var(--text)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" /> Key Specifications
          </h3>
          <button
            type="button"
            onClick={addSpec}
            className="btn-outline py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 rounded-xl"
          >
            <Plus size={14} /> Add Spec
          </button>
        </div>

        <div className="space-y-3">
          {specifications.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic font-medium">
              No custom specifications added yet. Click "Add Spec" to list key specs (e.g. Resolution, Weight, Mount).
            </p>
          ) : (
            specifications.map((spec, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Feature (e.g. Sensor)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  className="input-field py-2 text-xs w-1/3 font-bold"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Full-Frame CMOS)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  className="input-field py-2 text-xs flex-1 font-medium"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button type="button" variant="outline" onClick={onCancel} className="px-6 py-2.5 text-xs font-bold rounded-xl">
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} className="px-8 py-2.5 text-xs font-extrabold rounded-xl">
          {isEditing ? 'Save Product Changes' : 'Publish Product to Store'}
        </Button>
      </div>
    </form>
  );
}
