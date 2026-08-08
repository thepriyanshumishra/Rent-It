import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Bell, Menu, X, User, Sun, Moon, Compass, Package } from 'lucide-react';
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
          <div className="w-9 h-9 rounded-2xl bg-accent flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
            R
          </div>
          <span className="font-black text-xl tracking-tight text-text">RentOS</span>
        </Link>

        {/* Desktop Nav Pills */}
        <nav className="hidden md:flex items-center gap-2 bg-bg-elevated/80 border border-border p-1.5 rounded-2xl shadow-xs">
          <Link 
            to="/explore"
            className={`px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all ${
              location.pathname === '/explore' 
                ? 'bg-accent text-white shadow-sm' 
                : 'text-text-secondary hover:text-text hover:bg-bg-subtle'
            }`}
          >
            <Compass className="w-4 h-4" /> Explore
          </Link>
          
          <Link 
            to="/my-rentals"
            className={`px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all ${
              location.pathname.startsWith('/my-rentals') 
                ? 'bg-accent text-white shadow-sm' 
                : 'text-text-secondary hover:text-text hover:bg-bg-subtle'
            }`}
          >
            <Package className="w-4 h-4" /> My Rentals
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl text-text-secondary hover:text-text hover:bg-bg-subtle border border-border transition-all"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>

          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2.5 rounded-2xl text-text-secondary hover:text-text hover:bg-bg-subtle border border-border transition-all">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-md">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <button className="relative p-2.5 rounded-2xl text-text-secondary hover:text-text hover:bg-bg-subtle border border-border transition-all">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full"></span>
                )}
              </button>
              
              {/* User Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-accent/30 transition-all ml-1">
                  <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                    {user?.first_name?.charAt(0) || user?.email?.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                </button>

                <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-bg-elevated border border-border rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 z-50">
                  <div className="px-4 py-2.5 border-b border-border-subtle mb-1">
                    <p className="text-sm font-extrabold truncate text-text">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-accent font-bold hover:bg-bg-subtle transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/account" className="block px-4 py-2 text-sm font-semibold text-text hover:text-accent hover:bg-bg-subtle transition-colors">
                    Account Settings
                  </Link>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-extrabold text-text-secondary hover:text-text transition-colors px-4 py-2 rounded-xl">
                Log in
              </Link>
              <Link to="/register" className="btn-primary text-sm px-5 py-2.5 rounded-2xl font-bold shadow-md">
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3 z-50">
          <button onClick={toggleTheme} className="p-2 rounded-xl text-text-secondary">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
          <Link to="/cart" className="relative p-2 text-text">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-text p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-bg-elevated border-b border-border shadow-2xl p-4 flex flex-col gap-3 md:hidden z-40"
          >
            <Link to="/explore" className="text-base font-bold p-3 hover:bg-bg-subtle rounded-xl text-text flex items-center gap-2">
              <Compass className="w-5 h-5 text-accent" /> Explore Products
            </Link>
            <Link to="/my-rentals" className="text-base font-bold p-3 hover:bg-bg-subtle rounded-xl text-text flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" /> My Rentals
            </Link>
            
            {isAuthenticated ? (
              <>
                {isAdmin && <Link to="/admin" className="text-base font-bold text-accent p-3 hover:bg-bg-subtle rounded-xl">Admin Dashboard</Link>}
                <Link to="/account" className="text-base font-bold p-3 hover:bg-bg-subtle rounded-xl text-text">Account Settings</Link>
                <button onClick={logout} className="text-base font-bold text-danger text-left p-3 hover:bg-danger/10 rounded-xl">Sign Out</button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-border-subtle">
                <Link to="/login" className="btn-secondary py-3 text-center rounded-xl font-bold">Log in</Link>
                <Link to="/register" className="btn-primary py-3 text-center rounded-xl font-bold">Sign up</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
