import React, { useContext } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
  LayoutDashboard, Archive, LogOut, Sun, Moon, Sparkles, 
  ShieldCheck, QrCode
} from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'HQ Dashboard' },
  { path: '/admin/listing-requests', icon: Sparkles, label: 'Listing Requests' },
  { path: '/admin/rentals', icon: QrCode, label: 'Pickups & Orders' },
  { path: '/admin/inventory', icon: Archive, label: 'HQ Inventory' },
];

export default function AdminHeader() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext) || { theme: 'light', toggleTheme: () => {} };
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
        
        {/* Left: Brand Logo & Admin Badge */}
        <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-purple-600 flex items-center justify-center text-white shadow-md shadow-[var(--accent)]/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[var(--text)] leading-none">
              Rent<span className="text-[var(--accent)]">It</span>
            </span>
            <span className="text-[10px] font-extrabold text-[var(--accent)] tracking-widest uppercase mt-0.5">
              HQ Admin Portal
            </span>
          </div>
        </Link>

        {/* Center: Admin Top Navigation Pills (Exact Horizontal Center) */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1.5 bg-[var(--bg-elevated)] p-1.5 rounded-2xl border border-[var(--border)] shadow-xs">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  isActive 
                    ? 'bg-[var(--accent)] text-white shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* Right: Theme Toggle & Admin Profile */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-all cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Admin User Profile Badge */}
          <div className="flex items-center gap-2 pl-1 border-l border-[var(--border)]">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center font-black text-xs">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text)] leading-tight max-w-[100px] truncate">
                  {user?.full_name || 'Admin'}
                </span>
                <span className="text-[9px] font-extrabold text-[var(--accent)] uppercase tracking-wider">
                  HQ ADMIN
                </span>
              </div>
            </div>

            <button 
              onClick={logout}
              className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
