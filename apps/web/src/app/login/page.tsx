'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import {
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Zap,
  Package,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

const BRAND_FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Refundable Deposits',
    desc: 'Your security deposit is fully refunded after every safe return — no deductions, no delays.',
  },
  {
    icon: Zap,
    title: 'Real-Time Availability',
    desc: 'Zero double-booking. Live inventory means what you see is actually available.',
  },
  {
    icon: Package,
    title: 'Pre-Inspected Gear',
    desc: 'Every item passes a multi-point quality check before dispatch. Guaranteed operational.',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { email, password, name, phone } : { email, password };

      const res = await api.post(endpoint, payload);
      if (res.data.success || res.data.access) {
        const tokens = res.data.data?.tokens || res.data;
        const accessToken = tokens.accessToken || tokens.access;
        const refreshToken = tokens.refreshToken || tokens.refresh;
        const user = res.data.data?.user || {
          role: email.includes('admin') ? 'ADMIN' : 'CUSTOMER',
        };

        const userObj = {
          name: res.data.data?.user?.name || (email.includes('customer') ? 'Priyanshu Sharma' : email.includes('admin') ? 'Admin Manager' : name || 'RentIt User'),
          email: email,
          role: user.role,
          kycStatus: localStorage.getItem('rentit_kyc_status') || 'NOT_VERIFIED',
        };

        localStorage.setItem('rentit_token', accessToken);
        localStorage.setItem('rentit_user', JSON.stringify(userObj));
        if (refreshToken) localStorage.setItem('rentit_refresh_token', refreshToken);
        window.dispatchEvent(new Event('storage'));

        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');

        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (user.role === 'ADMIN' || user.role === 'STAFF') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setIsRegister(false);
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login/', { email: userEmail, password: pass });
      if (res.data.success || res.data.access) {
        const tokens = res.data.data?.tokens || res.data;
        const accessToken = tokens.accessToken || tokens.access;
        const refreshToken = tokens.refreshToken || tokens.refresh;
        const isAdmin = userEmail.includes('admin');

        const userObj = {
          name: userEmail.includes('customer') ? 'Priyanshu Sharma' : 'Admin Manager',
          email: userEmail,
          role: isAdmin ? 'ADMIN' : 'CUSTOMER',
          kycStatus: localStorage.getItem('rentit_kyc_status') || 'NOT_VERIFIED',
        };

        localStorage.setItem('rentit_token', accessToken);
        localStorage.setItem('rentit_user', JSON.stringify(userObj));
        if (refreshToken) localStorage.setItem('rentit_refresh_token', refreshToken);
        window.dispatchEvent(new Event('storage'));

        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');

        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push(isAdmin ? '/admin' : '/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Quick login failed. Check if the API is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col bg-slate-950 p-12 relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-900/30 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-600/40">
              R
            </div>
            <span className="text-xl font-black text-white">
              Rent<span className="text-brand-400">It</span>
            </span>
          </div>

          {/* Main copy */}
          <div className="mt-auto mb-auto flex flex-col gap-8 pt-20">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-400">
                Professional Equipment Rental
              </span>
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
                Rent what you need.
                <br />
                <span className="text-brand-400">Return it. Done.</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                India's most transparent equipment rental platform — with real-time availability, verified gear, and 100% refundable security deposits.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-5">
              {BRAND_FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom trust line */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Trusted by 2,400+ customers across India</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black">
              R
            </div>
            <span className="text-lg font-black text-slate-900">
              Rent<span className="text-brand-600">It</span>
            </span>
          </div>

          {/* Form header */}
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              {isRegister
                ? 'Start renting professional equipment in minutes.'
                : 'Sign in to manage your rentals and orders.'}
            </p>
          </div>

          {/* Quick Demo CTA */}
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-3">
              ⚡ Demo Accounts — Click to login instantly
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@rentit.com', 'customer123456')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-white border border-brand-200 text-xs font-bold text-brand-900 hover:bg-brand-50 transition shadow-sm text-center disabled:opacity-60"
              >
                Demo Customer
                <p className="text-[10px] font-normal text-slate-400 mt-0.5">Browse & checkout gear</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@rentit.com', 'admin123456')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-700 transition shadow-sm text-center disabled:opacity-60"
              >
                Demo Admin
                <p className="text-[10px] font-normal text-brand-200 mt-0.5">Operations & dashboard</p>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <hr className="flex-1 border-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or continue with email</span>
            <hr className="flex-1 border-slate-200" />
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Priyanshu Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 outline-none transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                {!isRegister && (
                  <button type="button" className="text-xs text-brand-600 font-medium hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2">
                <span>⚠</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-brand-600/40 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  {isRegister ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In to RentIt'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch form */}
          <p className="text-center text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="font-bold text-brand-600 hover:underline"
            >
              {isRegister ? 'Sign In' : 'Register Now'}
            </button>
          </p>

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-6 pt-2">
            {[
              { icon: ShieldCheck, label: 'SSL Secured' },
              { icon: CheckCircle2, label: 'No Spam' },
              { icon: Lock, label: 'Data Privacy' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Icon className="h-3.5 w-3.5 text-emerald-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
