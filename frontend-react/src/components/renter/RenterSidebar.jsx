import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, PlusCircle, PackageCheck, Wallet, FileText,
  LogOut, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { path: '/renter/dashboard', icon: LayoutDashboard, label: 'Earnings Overview' },
  { path: '/renter/listings/new', icon: PlusCircle, label: 'List New Equipment' },
  { path: '/renter/listings', icon: PackageCheck, label: 'My Listed Gear' },
];

export default function RenterSidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 250 }}
      className="flex flex-col h-full bg-[var(--bg-elevated)] border-r border-[var(--border)] overflow-hidden shrink-0"
    >
      <div className="flex items-center justify-between p-4 h-[65px] border-b border-[var(--border)]">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-black text-[var(--text)] flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" /> Renter Portal
            </span>
            <span className="text-[11px] font-bold text-[var(--accent)]">60% Revenue Share Partner</span>
          </div>
        )}
        <button 
          onClick={onToggle}
          className="p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mx-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => `
              flex items-center px-3 py-2.5 rounded-xl transition-all group relative font-medium text-sm
              ${isActive 
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-l-4 border-[var(--accent)] font-bold' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] border-l-4 border-transparent'
              }
            `}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-black shrink-0">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'R'}
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-bold text-[var(--text)] truncate">{user?.full_name || 'Renter Partner'}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email}</p>
              <button 
                onClick={logout}
                className="text-xs text-[var(--danger)] hover:underline flex items-center mt-1 font-semibold transition-colors"
              >
                <LogOut size={12} className="mr-1" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
