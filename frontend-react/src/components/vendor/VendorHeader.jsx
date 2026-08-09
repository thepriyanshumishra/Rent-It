import React, { useContext } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, FileText, 
  LogOut, Sun, Moon
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

export default function VendorHeader() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext) || { theme: 'light', toggleTheme: () => {} };
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/vendor/dashboard', label: 'Dashboard',          icon: LayoutDashboard },
    { to: '/vendor/listings',  label: 'My Listings',        icon: Package },
    { to: '/vendor/orders',    label: 'Orders & Verification', icon: FileText },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--bg-elevated)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-300">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">

        {/* Left — Brand Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/vendor/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-[var(--accent)] text-white font-black text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              R
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-base text-[var(--text)] tracking-tight block leading-none">
                RentIt
              </span>
              <span className="text-[9px] font-extrabold text-[var(--accent)] tracking-wider uppercase block mt-0.5">
                Vendor Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Center — Pill Navigation (absolutely centered) */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center bg-[var(--bg-subtle)] p-1 rounded-2xl border border-[var(--border)] shadow-xs gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--accent)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right — Theme + User */}
        <div className="ml-auto flex items-center gap-2.5 shrink-0">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Vendor User Badge */}
          <div className="flex items-center gap-2 pl-2.5 border-l border-[var(--border)]">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-extrabold text-[var(--text)] block leading-none">
                {user?.first_name || user?.username || 'Vendor'}
              </span>
              <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-wider block mt-0.5">
                Vendor Staff
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Sub-Header Navigation */}
      <div className="md:hidden flex overflow-x-auto border-t border-[var(--border)] px-4 py-2 bg-[var(--bg-subtle)] gap-1.5 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </header>
  );
}
