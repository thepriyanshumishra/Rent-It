import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Bell, Menu, X, User, Sun, Moon, Compass, Package, Building2, LayoutDashboard, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useNotifications from '../../hooks/useNotifications';
import { ThemeContext } from '../../context/ThemeContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'h-16 glass shadow-sm' 
          : 'h-20 bg-transparent'
      }`}
    >
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 z-50 group">
          <div className="w-9 h-9 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
            R
          </div>
          <span className="font-black text-xl tracking-tight text-[var(--text)]">RentIt</span>
        </Link>

        {/* Desktop Nav Pills */}
        <nav className="hidden md:flex items-center gap-2 bg-[var(--bg-elevated)]/80 border border-[var(--border)] p-1.5 rounded-2xl shadow-xs">
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

          <Link 
            to="/businesses"
            className={`px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all ${
              location.pathname === '/businesses' 
                ? 'bg-[var(--accent)] text-white shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Building2 className="w-4 h-4" /> Businesses
          </Link>
          
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

          {isAdmin && (
            <Link 
              to="/admin"
              className={`px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20`}
            >
              <LayoutDashboard className="w-4 h-4" /> Admin Portal
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] border border-[var(--border)] transition-all"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart */}
          <Link 
            to="/cart"
            className="relative p-2.5 rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] border border-[var(--border)] transition-all"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg)]">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
              <Link 
                to="/account"
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[var(--bg-subtle)] hover:bg-[var(--border)] text-sm font-bold text-[var(--text)] transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center">
                  {(user?.first_name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span>{user?.first_name || user?.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2.5 rounded-2xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 border border-[var(--border)] transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-extrabold text-[var(--text)] hover:text-[var(--accent)] transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-2xl text-sm font-extrabold bg-[var(--accent)] text-white hover:opacity-90 shadow-md transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-2xl text-[var(--text)] hover:bg-[var(--bg-subtle)] border border-[var(--border)]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-[var(--border)] px-4 py-4 space-y-3"
          >
            <Link to="/explore" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-subtle)] text-sm font-bold text-[var(--text)]">
              <Compass className="w-5 h-5 text-[var(--accent)]" /> Explore Products
            </Link>
            <Link to="/businesses" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-subtle)] text-sm font-bold text-[var(--text)]">
              <Building2 className="w-5 h-5 text-[var(--accent)]" /> Business Bulk Orders
            </Link>
            <Link to="/my-rentals" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-subtle)] text-sm font-bold text-[var(--text)]">
              <Package className="w-5 h-5 text-[var(--accent)]" /> My Rentals
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-bold">
                <LayoutDashboard className="w-5 h-5" /> Admin Operations Portal
              </Link>
            )}
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <button onClick={toggleTheme} className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)]">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[var(--text)]" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              {isAuthenticated ? (
                <button onClick={logout} className="text-sm font-bold text-red-500">Sign Out</button>
              ) : (
                <Link to="/login" className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-bold">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
