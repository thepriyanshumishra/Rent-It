'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  ShoppingBag,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  Package,
  Menu,
  X,
  Bell,
  ChevronRight,
} from 'lucide-react';
import api from '../lib/api';

const NAV_LINKS = [
  { label: 'Categories', href: '/categories' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'For Business', href: '/business' },
  { label: 'Help & FAQ', href: '/help' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncAuth = () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('rentit_token');
        setToken(storedToken);
        if (storedToken) fetchCartCount();
      }
    };
    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const fetchCartCount = async () => {
    try {
      const res = await api.get('/cart/');
      if (res.data.success) {
        setCartCount(res.data.data?.items?.length || 0);
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rentit_token');
    localStorage.removeItem('rentit_refresh_token');
    setToken(null);
    setCartCount(0);
    setProfileOpen(false);
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/98 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-black text-xl shadow-lg shadow-brand-600/25 group-hover:shadow-brand-600/40 group-hover:scale-105 transition-all duration-200">
                R
              </div>
              <div className="hidden sm:block">
                <div className="flex items-baseline">
                  <span className="text-lg font-black text-slate-900 tracking-tight">Rent</span>
                  <span className="text-lg font-black text-brand-600 tracking-tight">It</span>
                </div>
                <p className="text-[9px] font-semibold text-slate-400 -mt-0.5 tracking-wide uppercase">
                  Rent Smart. Use Better.
                </p>
              </div>
            </Link>

            {/* Location Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition shrink-0">
              <MapPin className="h-3.5 w-3.5 text-brand-600" />
              <span>Bangalore, IN</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>

            {/* Search */}
            <div className="flex-1 max-w-sm hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cameras, tools, AV gear..."
                  className="w-full rounded-full bg-slate-50 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 border border-slate-200 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition"
                />
              </div>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden xl:flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition group"
                title="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-black text-white ring-2 ring-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {token ? (
                /* Authenticated User Profile Dropdown */
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    <div className="h-7 w-7 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                      U
                    </div>
                    <span className="hidden sm:block text-xs font-semibold text-slate-700">Account</span>
                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/80 py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed In</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">RentIt User</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="h-4 w-4 text-brand-600" />
                          My Profile & KYC
                          <ChevronRight className="h-3 w-3 ml-auto text-slate-300" />
                        </Link>
                        <Link
                          href="/my-rentals"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          My Rental Orders
                          <ChevronRight className="h-3 w-3 ml-auto text-slate-300" />
                        </Link>
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                          onClick={() => setProfileOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Portal
                          <ChevronRight className="h-3 w-3 ml-auto text-slate-300" />
                        </Link>
                      </div>
                      <div className="border-t border-slate-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest Actions */
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="hidden sm:block px-3.5 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="px-3.5 py-2 rounded-full bg-brand-600 text-xs font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 hover:shadow-brand-600/40 transition"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-In Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-lg">
                  R
                </div>
                <span className="font-black text-slate-900">
                  Rent<span className="text-brand-600">It</span>
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  className="w-full rounded-xl bg-slate-50 pl-9 pr-4 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 border border-slate-200 outline-none focus:border-brand-600"
                />
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>
              ))}

              <div className="border-t border-slate-100 pt-3 mt-3">
                <Link
                  href="/cart"
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Cart
                    {cartCount > 0 && (
                      <span className="h-5 w-5 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>
                {token && (
                  <>
                    <Link
                      href="/my-rentals"
                      className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                    >
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        My Rentals
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Portal
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile Footer Actions */}
            <div className="px-5 py-4 border-t border-slate-100">
              {token ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl border border-red-200 text-sm font-bold text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    className="py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 text-center transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="py-3 rounded-xl bg-brand-600 text-sm font-bold text-white text-center shadow-md hover:bg-brand-700 transition"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
