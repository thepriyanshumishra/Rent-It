import React, { useState } from 'react';
import { Bell, Menu, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';
import { Link } from 'react-router-dom';

export default function AdminHeader({ title, subtitle, onMenuToggle }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-[60px] flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg)] shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">{title}</h1>
          {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--danger)]"></span>
          )}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md shadow-lg z-50 py-1">
                <div className="px-4 py-2 border-b border-[var(--border)] mb-1">
                  <p className="text-sm font-medium text-[var(--text)]">{user?.full_name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                </div>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/" 
                  className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
                  onClick={() => setShowDropdown(false)}
                >
                  Switch to Customer View
                </Link>
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--bg-subtle)] mt-1 border-t border-[var(--border-subtle)]"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
