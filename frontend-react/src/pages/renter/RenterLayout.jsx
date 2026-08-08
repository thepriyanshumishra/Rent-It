import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import RenterSidebar from '../../components/renter/RenterSidebar';
import useAuth from '../../hooks/useAuth';

export default function RenterLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      <RenterSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Bar */}
        <header className="h-[65px] bg-[var(--bg-elevated)] border-b border-[var(--border)] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-lg text-[var(--text)]">Renter Portal Dashboard</h1>
            <span className="badge badge-success">60% Revenue Share</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ← Storefront
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" />
            <span className="text-xs font-bold text-[var(--text-secondary)]">
              Welcome, {user?.full_name || user?.email}
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
