import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useStore } from '../../context/StoreContext';
import { 
  ShoppingBag, LogOut, Sun, Moon, Sparkles, 
  Package, Compass, Grid, MapPin, ChevronDown, Building2
} from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext) || { cartCount: 0 };
  const { theme, toggleTheme } = useContext(ThemeContext) || { theme: 'light', toggleTheme: () => {} };
  const { selectedStore, userLocation, openStoreModal } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
        
        {/* Left: Brand Logo & Store Selector */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-purple-600 flex items-center justify-center text-white shadow-md shadow-[var(--accent)]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-[var(--text)] leading-none">
                Rent<span className="text-[var(--accent)]">It</span>
              </span>
              <span className="text-[10px] font-extrabold text-[var(--text-muted)] tracking-widest uppercase mt-0.5">
                Enterprise Fleet
              </span>
            </div>
          </Link>

          {/* User Location Pill */}
          <button
            onClick={openStoreModal}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] hover:border-[var(--accent)] text-left transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-6 h-6 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-wider leading-none">
                Location
              </span>
              <span className="text-xs font-bold text-[var(--text)] max-w-[150px] truncate group-hover:text-[var(--accent)] transition-colors leading-tight mt-0.5">
                {userLocation?.city ? `${userLocation.city}${userLocation.state ? ', ' + userLocation.state.split(' ')[0] : ''}` : 'Set Location'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>

        {/* Center: Main Navigation Pills */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1.5 bg-[var(--bg-elevated)] p-1.5 rounded-2xl border border-[var(--border)] shadow-xs">
          <Link 
            to="/explore" 
            className={`px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all ${
              location.pathname === '/explore' 
                ? 'bg-[var(--accent)] text-white shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Compass className="w-4 h-4" /> Explore
          </Link>

          {isAuthenticated && (
            <Link 
              to="/my-rentals"
              className={`px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all ${
                location.pathname.startsWith('/my-rentals') 
                  ? 'bg-[var(--accent)] text-white shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Package className="w-4 h-4" /> My Rentals
            </Link>
          )}

          {user?.role === 'STAFF' && (
            <Link 
              to="/vendor/dashboard"
              className={`px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all ${
                location.pathname.startsWith('/vendor') 
                  ? 'bg-[var(--accent)] text-white shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Building2 className="w-4 h-4" /> Vendor Portal
            </Link>
          )}
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-all cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Cart Icon (Customers & Unauthenticated) */}
          {(!user || user.role === 'CUSTOMER') && (
            <Link 
              to="/cart" 
              className="relative p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[var(--accent)] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--bg)] shadow-xs animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Auth Buttons */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-2xl font-extrabold text-xs">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="rounded-2xl font-extrabold text-xs shadow-md">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1 border-l border-[var(--border)]">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="w-7 h-7 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center font-black text-xs">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[var(--text)] leading-tight max-w-[100px] truncate">
                    {user?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] font-extrabold text-[var(--accent)] uppercase tracking-wider">
                    {user?.role || 'CUSTOMER'}
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
          )}

        </div>
      </div>
    </nav>
  );
}
