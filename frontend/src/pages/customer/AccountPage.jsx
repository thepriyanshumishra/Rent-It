import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Shield, ArrowRight, LogOut } from 'lucide-react';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const customer = user?.customer;

  const kycStatus = customer?.kyc_status || 'NOT_SUBMITTED';
  const kycConfig = {
    NOT_SUBMITTED: { label: 'Not Verified', badge: 'badge-muted', desc: 'Complete KYC to unlock all features' },
    PENDING:       { label: 'Under Review', badge: 'badge-warning', desc: 'Your documents are being reviewed' },
    APPROVED:      { label: 'Verified ✓',  badge: 'badge-success', desc: 'Your identity is verified' },
    REJECTED:      { label: 'Rejected',    badge: 'badge-danger',  desc: 'Please resubmit your documents' },
  };
  const kyc = kycConfig[kycStatus] || kycConfig.NOT_SUBMITTED;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-[var(--text)] mb-6">My Account</h1>

        {/* Profile Card */}
        <div className="card p-6 mb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-subtle)] border-2 border-[var(--accent)]/30 flex items-center justify-center">
              <span className="text-2xl font-black text-[var(--accent)]">
                {(customer?.name || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">{customer?.name || 'Customer'}</h2>
              <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[var(--bg-subtle)] rounded-xl">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">Email</p>
                <p className="text-sm font-medium text-[var(--text)]">{user?.email}</p>
              </div>
            </div>
            {customer?.phone && (
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-subtle)] rounded-xl">
                <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Phone</p>
                  <p className="text-sm font-medium text-[var(--text)]">{customer.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KYC Status Card */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[var(--text)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent)]" /> Identity Verification
            </h3>
            <span className={`badge ${kyc.badge}`}>{kyc.label}</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">{kyc.desc}</p>
          {kycStatus !== 'APPROVED' && (
            <Link to="/kyc" className="btn-primary text-sm py-2.5 inline-flex items-center gap-2">
              {kycStatus === 'NOT_SUBMITTED' ? 'Start Verification' : 'View Status'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Quick Links */}
        <div className="card p-5 mb-4">
          <h3 className="font-bold text-[var(--text)] mb-3">Quick Links</h3>
          <div className="space-y-1">
            <Link to="/my-rentals" className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-subtle)] transition-all group">
              <span className="text-sm font-medium text-[var(--text-secondary)]">My Rentals</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </Link>
            <Link to="/explore" className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-subtle)] transition-all group">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Explore Products</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </Link>
          </div>
        </div>

        {/* Logout */}
        <button
          id="account-logout-btn"
          onClick={logout}
          className="btn-outline w-full justify-center text-[var(--danger)] border-[var(--danger-subtle)] hover:bg-[var(--danger-subtle)] py-3"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
