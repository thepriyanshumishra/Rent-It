import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Clock, CheckCircle, RotateCcw, AlertTriangle, Calendar } from 'lucide-react';
import { rentalsApi } from '../../api';
import Spinner from '../../components/ui/Spinner';

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG = {
  DRAFT:               { label: 'Draft',           badge: 'badge-muted',   icon: Clock },
  PENDING_CONFIRMATION:{ label: 'Pending',         badge: 'badge-warning', icon: Clock },
  CONFIRMED:           { label: 'Confirmed',       badge: 'badge-info',    icon: CheckCircle },
  SCHEDULED:           { label: 'Scheduled',       badge: 'badge-info',    icon: Calendar },
  ACTIVE:              { label: 'Active',          badge: 'badge-success', icon: Package },
  OVERDUE:             { label: 'Overdue!',        badge: 'badge-danger',  icon: AlertTriangle },
  RETURNED:            { label: 'Returned',        badge: 'badge-muted',   icon: RotateCcw },
  UNDER_INSPECTION:    { label: 'Under Inspection',badge: 'badge-warning', icon: Clock },
  PENDING_SETTLEMENT:  { label: 'Pending Settlement',badge: 'badge-warning',icon: Clock },
  COMPLETED:           { label: 'Completed',       badge: 'badge-muted',   icon: CheckCircle },
  CANCELLED:           { label: 'Cancelled',       badge: 'badge-danger',  icon: AlertTriangle },
};

function ReturnModal({ rental, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      await rentalsApi.requestReturn(rental.id, notes);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 animate-fade-in">
        <h2 className="text-lg font-bold text-[var(--text)] mb-2">Request Return</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Submit a return request for <strong>{rental.items?.[0]?.product?.name || 'your item'}</strong>. 
          Our team will coordinate the pickup.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions for the pickup..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
        {error && <p className="text-[var(--danger)] text-sm mb-3 bg-[var(--danger-subtle)] p-2.5 rounded-xl">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <Spinner size="sm" color="white" /> : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RentalCard({ rental, onReturn }) {
  const config = STATUS_CONFIG[rental.status] || STATUS_CONFIG.ACTIVE;
  const StatusIcon = config.icon;
  const canReturn = ['ACTIVE', 'OVERDUE'].includes(rental.status);

  return (
    <div className="card p-5 hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-0.5">#{rental.rental_number}</p>
          <h3 className="font-bold text-[var(--text)]">
            {rental.items?.[0]?.product?.name || 'Rental Item'}
            {rental.items?.length > 1 && <span className="text-[var(--text-muted)] text-sm"> +{rental.items.length - 1} more</span>}
          </h3>
        </div>
        <span className={`badge ${config.badge}`}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--bg-subtle)] rounded-xl p-3">
          <p className="text-xs text-[var(--text-muted)] mb-0.5">Rental Period</p>
          <p className="text-sm font-semibold text-[var(--text)]">
            {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
          </p>
        </div>
        <div className="bg-[var(--bg-subtle)] rounded-xl p-3">
          <p className="text-xs text-[var(--text-muted)] mb-0.5">Total</p>
          <p className="text-sm font-bold text-[var(--accent)]">{formatPrice(rental.total_paise || 0)}</p>
        </div>
      </div>

      {rental.status === 'OVERDUE' && (
        <div className="bg-[var(--danger-subtle)] rounded-xl p-3 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--danger)] flex-shrink-0" />
          <p className="text-sm text-[var(--danger)] font-medium">This rental is overdue. Late fees may apply.</p>
        </div>
      )}

      {canReturn && (
        <button
          id={`return-btn-${rental.id}`}
          onClick={() => onReturn(rental)}
          className="btn-outline w-full justify-center text-sm py-2.5"
        >
          <RotateCcw className="w-4 h-4" /> Request Return
        </button>
      )}
    </div>
  );
}

export default function MyRentalsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [returnRental, setReturnRental] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-rentals'],
    queryFn: () => rentalsApi.list(),
    retry: 1,
  });

  const rentals = data?.data?.data || [];
  const activeStatuses = ['PENDING_CONFIRMATION', 'CONFIRMED', 'SCHEDULED', 'ACTIVE', 'OVERDUE', 'RETURNED', 'UNDER_INSPECTION', 'PENDING_SETTLEMENT'];
  const pastStatuses = ['COMPLETED', 'CANCELLED'];

  const activeRentals = rentals.filter(r => activeStatuses.includes(r.status));
  const pastRentals = rentals.filter(r => pastStatuses.includes(r.status));
  const currentList = activeTab === 'active' ? activeRentals : pastRentals;

  const handleReturnSuccess = () => {
    queryClient.invalidateQueries(['my-rentals']);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-[var(--text)] mb-6">My Rentals</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--bg-subtle)] rounded-2xl mb-6 w-fit">
          {[
            { key: 'active', label: `Active (${activeRentals.length})` },
            { key: 'past', label: `Past (${pastRentals.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              id={`tab-${key}`}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-[var(--bg-elevated)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="text-center py-10">
            <p className="text-[var(--danger)]">Failed to load rentals. Please try again.</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">
              {activeTab === 'active' ? 'No active rentals' : 'No past rentals'}
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              {activeTab === 'active' ? 'Start browsing and rent something today!' : 'Your completed rentals will appear here.'}
            </p>
            {activeTab === 'active' && (
              <a href="/explore" className="btn-primary">Explore Products</a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((rental) => (
              <RentalCard key={rental.id} rental={rental} onReturn={setReturnRental} />
            ))}
          </div>
        )}
      </div>

      {returnRental && (
        <ReturnModal
          rental={returnRental}
          onClose={() => setReturnRental(null)}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}
