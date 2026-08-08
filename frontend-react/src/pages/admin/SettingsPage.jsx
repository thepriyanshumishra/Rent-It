import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text)]">Settings</h2>
        <p className="text-[var(--text-muted)]">Manage your platform configuration.</p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border)] pb-0">
        {[
          { id: 'general', label: 'General' },
          { id: 'late_fee', label: 'Late Fee Config' },
          { id: 'rental', label: 'Rental Settings' },
          { id: 'notifications', label: 'Notifications' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Organization Name" defaultValue="RentOS Pro" />
              <Input label="Currency" defaultValue="INR (₹)" disabled />
              <Input label="Contact Phone" defaultValue="+91 9876543210" />
              <Input label="Contact Email" defaultValue="admin@rentos.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Store Address (for pickups)</label>
              <textarea rows={3} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" defaultValue="123 Tech Park, Bangalore" />
            </div>
            <Button variant="primary">Save Changes</Button>
          </div>
        )}

        {activeTab === 'late_fee' && (
          <div className="space-y-6">
            <p className="text-sm text-[var(--info)] bg-[var(--info)]/10 p-3 rounded-lg border border-[var(--info)]/20">These settings apply globally. Product-specific overrides can be set per product.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input type="number" label="Grace Period (Hours)" defaultValue="2" />
              <Input type="number" label="Fee Per Day (₹)" defaultValue="500" />
              <Input type="number" label="Maximum Late Fee Cap (₹)" defaultValue="5000" />
            </div>
            <Button variant="primary">Save Changes</Button>
          </div>
        )}

        {activeTab === 'rental' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4" />
                <span className="text-[var(--text)]">Allow online bookings</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4" />
                <span className="text-[var(--text)]">Require security deposit</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4" />
                <span className="text-[var(--text)]">Auto-confirm new orders</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border)]">
              <Input type="number" label="Default Delivery Fee (₹)" defaultValue="300" />
            </div>
            <p className="text-xs text-[var(--text-muted)]">Delivery fee applies to orders requiring delivery within the configured radius.</p>
            <Button variant="primary">Save Changes</Button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Input label="Admin Notification Email" defaultValue="alerts@rentos.com" />
            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h4 className="text-sm font-semibold text-[var(--text)]">Notify Admin On:</h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4" />
                <span className="text-[var(--text)] text-sm">New Order Placed</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4" />
                <span className="text-[var(--text)] text-sm">Rental is Overdue</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4" />
                <span className="text-[var(--text)] text-sm">Return is Submitted</span>
              </label>
            </div>
            <Button variant="primary">Save Changes</Button>
          </div>
        )}
      </div>
    </div>
  );
}
