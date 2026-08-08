import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, Package, Archive, Users, Building2,
  DollarSign, BarChart2, Settings, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { path: '/admin/rentals', icon: FileText, label: 'Rentals' },
  { path: '/admin/business-orders', icon: Building2, label: 'Business Orders' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/inventory', icon: Archive, label: 'Inventory' },
  { path: '/admin/customers', icon: Users, label: 'Customers' },
  { path: '/admin/quotations', icon: FileText, label: 'Quotations' },
  { path: '/admin/finance', icon: DollarSign, label: 'Finance' },
  { path: '/admin/reports', icon: BarChart2, label: 'Reports' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' }
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 240 }}
      className="flex flex-col h-full bg-[var(--bg-elevated)] border-r border-[var(--border)] overflow-hidden shrink-0"
    >
      <div className="flex items-center justify-between p-4 h-[60px] border-b border-[var(--border)]">
        {!collapsed && <span className="text-xl font-black text-[var(--text)] whitespace-nowrap">RentIt</span>}
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
            className={({ isActive }) => `
              flex items-center px-3 py-2.5 rounded-md transition-all group relative
              ${isActive 
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-l-2 border-[var(--accent)]' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] border-l-2 border-transparent'
              }
            `}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center font-bold shrink-0">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-[var(--text)] truncate">{user?.full_name || user?.email || 'Admin User'}</p>
              <button 
                onClick={logout}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)] flex items-center mt-1 transition-colors"
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
