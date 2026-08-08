import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Plus, Trash2, Search, Send, FileText } from 'lucide-react';
import PriceDisplay from '../ui/PriceDisplay';

export default function QuotationForm({ quotation = null, onSave, onCancel, loading = false }) {
  const [isExistingCustomer, setIsExistingCustomer] = useState(true);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', id: '' });
  
  const [items, setItems] = useState(
    quotation?.items || [{ productId: '', variantId: '', days: 1, qty: 1, price: 0 }]
  );

  const [notes, setNotes] = useState(quotation?.notes || '');
  const deliveryFee = 500; // Example fixed fee or from config

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { productId: '', variantId: '', days: 1, qty: 1, price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const totalRental = items.reduce((sum, item) => sum + (item.price * item.qty * item.days), 0);
  const totalDeposit = items.reduce((sum, item) => sum + (item.deposit || 0 * item.qty), 0); // Assuming deposit logic
  const grandTotal = totalRental + deliveryFee;

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave({ customer, items, notes }); }}>
      
      {/* Customer Section */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Customer Details</h3>
          <div className="flex gap-2 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)]">
            <button 
              type="button"
              className={`px-3 py-1 text-sm rounded-md transition-colors ${isExistingCustomer ? 'bg-[var(--bg-elevated)] shadow text-[var(--text)]' : 'text-[var(--text-muted)]'}`}
              onClick={() => setIsExistingCustomer(true)}
            >
              Existing
            </button>
            <button 
              type="button"
              className={`px-3 py-1 text-sm rounded-md transition-colors ${!isExistingCustomer ? 'bg-[var(--bg-elevated)] shadow text-[var(--text)]' : 'text-[var(--text-muted)]'}`}
              onClick={() => setIsExistingCustomer(false)}
            >
              Walk-in
            </button>
          </div>
        </div>

        {isExistingCustomer ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search customer by name or email..." 
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} required />
            <Input label="Email" type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} required />
            <Input label="Phone" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} required />
          </div>
        )}
      </div>

      {/* Items Section */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Rental Items</h3>
        </div>
        
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-end bg-[var(--bg)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <div className="flex-1">
                <Select 
                  label="Product" 
                  options={[{value:'1', label:'Sony A7III'}, {value:'2', label:'Canon 24-70mm'}]} 
                />
              </div>
              <div className="w-24">
                <Input type="number" label="Days" value={item.days} onChange={e => handleItemChange(idx, 'days', e.target.value)} />
              </div>
              <div className="w-24">
                <Input type="number" label="Qty" value={item.qty} onChange={e => handleItemChange(idx, 'qty', e.target.value)} />
              </div>
              <div className="w-32">
                <Input type="number" label="Unit Price" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} />
              </div>
              <button 
                type="button" 
                onClick={() => removeItem(idx)}
                className="p-2.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-md transition-colors mb-0.5"
                disabled={items.length === 1}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
            <Plus size={16} /> Add Product
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-2">Notes</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-none"
            placeholder="Additional terms or notes for the customer..."
          />
        </div>
        
        <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)] flex flex-col justify-center">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Total Rental:</span>
              <PriceDisplay amount={totalRental} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Security Deposit:</span>
              <PriceDisplay amount={totalDeposit} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Delivery Fee:</span>
              <PriceDisplay amount={deliveryFee} />
            </div>
            <div className="pt-2 mt-2 border-t border-[var(--border)] flex justify-between font-bold text-lg">
              <span>Grand Total:</span>
              <PriceDisplay amount={grandTotal} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="outline" className="gap-2">
          <FileText size={16} /> Save as Draft
        </Button>
        <Button type="submit" variant="primary" loading={loading} className="gap-2">
          <Send size={16} /> Save & Send
        </Button>
      </div>
    </form>
  );
}
