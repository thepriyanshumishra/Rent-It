import React, { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Grid, Sun, Moon, LogOut } from 'lucide-react';

export default function RenterLayout() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext) || { theme: 'light', toggleTheme: () => {} };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      
      {/* Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
          
          {/* Left: Brand Logo & Renter Portal Tag */}
          <Link to="/renter/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-indigo-600 flex items-center justify-center text-white shadow-md shadow-[var(--accent)]/20 group-hover:scale-105 transition-transform">
              <Grid className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-[var(--text)] leading-none">
                Rent<span className="text-[var(--accent)]">It</span>
              </span>
              <span className="text-[10px] font-extrabold text-emerald-500 tracking-widest uppercase mt-0.5">
                Renter Partner Portal (60% Share)
              </span>
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Storefront Link */}
            <Link 
              to="/explore"
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-all"
            >
              ← Storefront
            </Link>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 pl-1 border-l border-[var(--border)]">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'R'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[var(--text)] leading-tight max-w-[100px] truncate">
                    {user?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-wider">
                    RENTER
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-24">
        <Outlet />
      </main>

    </div>
  );
}
