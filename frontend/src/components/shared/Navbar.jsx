import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Sun, Moon, Compass, Package, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = isAdmin
    ? [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard }]
    : [
        { to: '/explore', label: 'Explore', icon: Compass },
        { to: '/my-rentals', label: 'My Rentals', icon: Package },
      ];

  const isActive = (path) =>
    path === '/admin' ? location.pathname.startsWith('/admin') : location.pathname === path;

  const customerName = user?.customer?.name || user?.email?.split('@')[0] || 'Account';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-sm h-16' : 'bg-transparent h-20'
      }`}
    >
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 z-50 group">
          <div className="w-9 h-9 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
            R
          </div>
          <span className="font-black text-xl tracking-tight text-[var(--text)]">RentIt</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 bg-[var(--bg-elevated)]/80 border border-[var(--border)] p-1.5 rounded-2xl shadow-sm">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                isActive(to)
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] border border-[var(--border)] transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart */}
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative p-2.5 rounded-2xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] border border-[var(--border)] transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* User */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)] font-medium px-2">
                {customerName}
              </span>
              {!isAdmin && (
                <Link
                  to="/account"
                  className="p-2.5 rounded-2xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] border border-[var(--border)] transition-all"
                >
                  <User className="w-4 h-4" />
                </Link>
              )}
              <button
                onClick={logout}
                className="p-2.5 rounded-2xl text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-subtle)] border border-[var(--border)] transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2 px-4">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-all z-50"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-[var(--border)] px-4 py-4 space-y-2 animate-fade-in">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive(to)
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
          {!isAdmin && (
            <Link to="/cart" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]">
              <ShoppingCart className="w-4 h-4" /> Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          )}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
            <button onClick={toggleTheme} className="btn-outline text-sm flex-1 justify-center">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
            {isAuthenticated ? (
              <button onClick={logout} className="btn-outline text-sm text-[var(--danger)] border-[var(--danger-subtle)] flex-1 justify-center">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <Link to="/login" className="btn-primary text-sm flex-1 justify-center">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
