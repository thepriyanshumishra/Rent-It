import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, FileText, Upload, AlertCircle, Send, Plus, Trash2, ShieldCheck, Info } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import MultiFileUpload from '../../components/ui/MultiFileUpload';
import { toast } from '../../components/ui/Toast';

export default function NewListingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    quantity: 1,
    daily_price: '',
    security_deposit: '',
    short_description: '',
    description: '',
    included_items: '',
    rental_terms: '',
    purchase_bill_url: '',
    images: [],
  });

  const [specifications, setSpecifications] = useState([]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/');
      return data.results || data || [];
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBillUpload = (url) => {
    setFormData((prev) => ({ ...prev, purchase_bill_url: url }));
  };

  const handlePhotosChange = (urls) => {
    setFormData((prev) => ({ ...prev, images: urls }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpec = () => setSpecifications([...specifications, { key: '', value: '' }]);
  const removeSpec = (index) => setSpecifications(specifications.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.purchase_bill_url) {
      toast.error('Mandatory: Please upload a purchase bill or invoice proof.');
      return;
    }

    const specsObj = {};
    specifications.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    setLoading(true);
    try {
      await api.post('/listing-requests/', {
        ...formData,
        quantity: Number(formData.quantity) || 1,
        short_description: formData.short_description || formData.description?.substring(0, 200) || formData.product_name,
        category: formData.category ? Number(formData.category) : null,
        image_url: formData.images[0] || '',
        images_data: formData.images,
        specifications: specsObj,
      });
      toast.success('Equipment submitted for HQ quality check!');
      navigate('/lender/dashboard');
    } catch (err) {
      toast.error('Failed to submit listing request. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="card p-6 border border-[var(--border)]">
        <h2 className="text-2xl font-black text-[var(--text)]">List New Equipment for Rental</h2>
        <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
          Provide accurate gear details, purchase bill proof, specs, and photos. RentIt HQ will inspect and verify the item upon approval.
        </p>
      </div>

      {/* Form Card */}
      <div className="card p-8 border border-[var(--border)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Equipment Name *
              </label>
              <input
                type="text"
                name="product_name"
                required
                value={formData.product_name}
                onChange={handleChange}
                placeholder="e.g. Sony FX3 Cinema Camera Body"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Category...</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Daily Rental Price (₹/day) *
              </label>
              <input
                type="number"
                step="0.01"
                name="daily_price"
                required
                value={formData.daily_price}
                onChange={handleChange}
                placeholder="e.g. 2500"
                className="input-field"
              />
              {formData.daily_price && (
                <span className="text-[11px] text-emerald-500 font-extrabold block mt-1">
                  Your 60% Payout: ₹{(Number(formData.daily_price) * 0.6).toFixed(2)}/day
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Security Deposit (Escrow) *
              </label>
              <input
                type="number"
                step="0.01"
                name="security_deposit"
                required
                value={formData.security_deposit}
                onChange={handleChange}
                placeholder="e.g. 10000"
                className="input-field"
              />
            </div>
          </div>

          {/* Quantity Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
                Quantity Available to List *
              </label>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Identical units covered by this single bill
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                name="quantity"
                min="1"
                max="50"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="input-field w-32 font-black text-center"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, (Number(p.quantity) || 1) - 1) }))}
                  className="btn-outline py-2 px-3 font-bold text-xs rounded-xl"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, quantity: (Number(p.quantity) || 1) + 1 }))}
                  className="btn-outline py-2 px-3 font-bold text-xs rounded-xl"
                >
                  +
                </button>
                {Number(formData.quantity) > 1 && (
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {Number(formData.quantity)} units @ ₹{formData.daily_price ? (Number(formData.daily_price) * 0.6).toFixed(0) : '—'}/day each
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic bill warning */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                    Important: You can upload only ONE purchase bill
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium leading-relaxed">
                    You are listing <strong>{formData.quantity} unit{Number(formData.quantity) !== 1 ? 's' : ''}</strong>.
                    Make sure <strong>all {Number(formData.quantity) !== 1 ? formData.quantity + ' ' : ''}unit{Number(formData.quantity) !== 1 ? 's are' : ' is'} covered</strong> under the single bill you upload below.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Bill Upload Field */}
          <FileUpload
            label="Upload Purchase Bill / Tax Invoice Proof"
            required={true}
            value={formData.purchase_bill_url}
            onChange={handleBillUpload}
            placeholder="Click to browse or drag and drop GST Invoice / Purchase Bill (PDF or Image)"
            helperText="Accepted formats: JPG, PNG, WEBP, PDF up to 10MB. Stored directly on Django Media Server."
          />

          {/* Multiple Equipment Photos Upload Grid */}
          <MultiFileUpload
            label="Upload Equipment Photos (Multiple)"
            values={formData.images}
            onChange={handlePhotosChange}
            maxFiles={5}
            helperText="Upload up to 5 clear photos of your equipment (Front view, accessories, serial number, etc.). First photo will be the cover image."
          />

          {/* Short Description */}
          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Short Summary (For Storefront Cards)
            </label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              placeholder="e.g. 4K 120fps Full-Frame Cinema Camera Body with Dual Base ISO"
              className="input-field"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed equipment description, features, specs, and handling instructions..."
              className="input-field resize-y"
            />
          </div>

          {/* Key Specifications Section */}
          <div className="card p-5 border border-[var(--border)] bg-[var(--bg-elevated)] space-y-3 rounded-2xl">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2.5">
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
                Key Specifications
              </label>
              <button
                type="button"
                onClick={addSpec}
                className="btn-outline py-1 px-3 text-xs font-bold flex items-center gap-1.5 rounded-xl"
              >
                <Plus size={14} /> Add Spec
              </button>
            </div>

            {specifications.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic font-medium">
                No specifications added. Click "Add Spec" to add key features.
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
                    placeholder="Value (e.g. Full-Frame Exmor R)"
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

          {/* Included Items & Specific Rental Terms */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Included Items <span className="text-[var(--text-muted)] font-normal normal-case">(What's in the box)</span>
              </label>
              <textarea
                name="included_items"
                rows={3}
                value={formData.included_items}
                onChange={handleChange}
                placeholder="e.g. Sony FX3 Body, 24-70mm lens, 2x batteries"
                className="input-field resize-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Specific Rental Terms <span className="text-[var(--text-muted)] font-normal normal-case">(Item Rules)</span>
              </label>
              <textarea
                name="rental_terms"
                rows={3}
                value={formData.rental_terms}
                onChange={handleChange}
                placeholder="e.g. Valid Govt ID required at pickup."
                className="input-field resize-none text-xs"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full justify-center py-3.5 text-base font-extrabold rounded-xl">
            {loading ? 'Submitting to HQ...' : (
              <span className="flex items-center gap-2">
                Submit Item for HQ Inspection <Send className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
