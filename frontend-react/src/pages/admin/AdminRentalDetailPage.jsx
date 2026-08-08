import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, User, CreditCard } from 'lucide-react';
import StatusIndicator from '../../components/ui/StatusIndicator';
import Timeline from '../../components/ui/Timeline';
import PriceDisplay from '../../components/ui/PriceDisplay';
import Button from '../../components/ui/Button';

export default function AdminRentalDetailPage() {
  const { id } = useParams();

  // Mock data
  const rental = {
    id,
    orderNumber: `ORD-${id}`,
    status: 'active',
    created: '2026-08-01T10:00:00Z',
    customer: { name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543210' },
    items: [
      { id: 1, name: 'Sony A7III', variant: 'Body Only', startDate: '2026-08-07', endDate: '2026-08-10', price: 1500, days: 3, deposit: 5000 }
    ],
    financials: { rental: 4500, deposit: 5000, lateFee: 0, total: 9500 },
    timeline: [
      { status: 'pending', title: 'Order Placed', date: '2026-08-01 10:00 AM' },
      { status: 'confirmed', title: 'Payment Received', date: '2026-08-01 10:15 AM' },
      { status: 'active', title: 'Picked Up', date: '2026-08-07 09:30 AM' },
      { status: 'pending', title: 'Expected Return', date: '2026-08-10 10:00 AM', isFuture: true }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/rentals" className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[var(--text)]">{rental.orderNumber}</h2>
            <StatusIndicator status={rental.status} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">Placed on {new Date(rental.created).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main details) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">Rental Items</h3>
            <div className="space-y-4">
              {rental.items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-[var(--border-subtle)] last:border-0">
                  <div>
                    <p className="font-medium text-[var(--text)]">{item.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{item.variant}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                      <Calendar size={12} /> {item.startDate} to {item.endDate} ({item.days} days)
                    </div>
                  </div>
                  <div className="text-right">
                    <PriceDisplay amount={item.price * item.days} className="font-medium" />
                    <p className="text-xs text-[var(--text-muted)]">Deposit: ₹{item.deposit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">Order Timeline</h3>
            <Timeline items={rental.timeline} />
          </div>

          {/* Actions depending on status */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6 flex gap-4">
            <Button variant="outline" className="flex-1">Mark as Returned</Button>
            <Button variant="outline" className="flex-1 text-[var(--danger)] hover:bg-[var(--danger)]/10">Cancel Order</Button>
          </div>
        </div>

        {/* Right Column (Sidebar details) */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-[var(--text)] font-semibold">
              <User size={18} className="text-[var(--accent)]" /> Customer Info
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-[var(--text-muted)]">Name:</span> {rental.customer.name}</p>
              <p><span className="text-[var(--text-muted)]">Email:</span> {rental.customer.email}</p>
              <p><span className="text-[var(--text-muted)]">Phone:</span> {rental.customer.phone}</p>
            </div>
            <Link to="/admin/customers/1" className="block mt-4 text-sm text-[var(--accent)] hover:underline">View Full Profile</Link>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-[var(--text)] font-semibold">
              <CreditCard size={18} className="text-[var(--accent)]" /> Financials
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Rental Amount</span>
                <PriceDisplay amount={rental.financials.rental} />
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Security Deposit</span>
                <PriceDisplay amount={rental.financials.deposit} />
              </div>
              {rental.financials.lateFee > 0 && (
                <div className="flex justify-between text-[var(--danger)]">
                  <span>Late Fee</span>
                  <PriceDisplay amount={rental.financials.lateFee} />
                </div>
              )}
              <div className="pt-3 border-t border-[var(--border)] flex justify-between font-bold text-base">
                <span>Total Paid</span>
                <PriceDisplay amount={rental.financials.total} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
