import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Sun, Moon, Sparkles, UserCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext) || { theme: 'light', toggleTheme: () => {} };
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'admin' || user.is_staff || user.is_superuser) {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'RENTER') {
        navigate('/renter/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleQuickDemoLogin = async (email, password) => {
    setLoading(true);
    setFormData({ email, password });
    try {
      const loggedInUser = await login({ email, password });
      toast.success(`Signed in as ${loggedInUser.first_name || loggedInUser.email}!`);
      
      const isUserAdmin = loggedInUser.role === 'ADMIN' || loggedInUser.role === 'admin' || loggedInUser.is_staff || loggedInUser.is_superuser;
      const isUserRenter = loggedInUser.role === 'RENTER' || loggedInUser.role === 'renter';

      if (isUserAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else if (isUserRenter) {
        navigate('/renter/dashboard', { replace: true });
      } else {
        navigate('/explore', { replace: true });
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || 'Demo authentication failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const loggedInUser = await login(formData);
      toast.success(`Welcome back, ${loggedInUser.first_name || loggedInUser.email}!`);
      
      const isUserAdmin = loggedInUser.role === 'ADMIN' || loggedInUser.role === 'admin' || loggedInUser.is_staff || loggedInUser.is_superuser;
      const isUserRenter = loggedInUser.role === 'RENTER' || loggedInUser.role === 'renter';

      if (isUserAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else if (isUserRenter) {
        navigate('/renter/dashboard', { replace: true });
      } else {
        navigate(from !== '/' && from !== '/login' ? from : '/explore', { replace: true });
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg)] relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-15 pointer-events-none" />

      {/* Top Header Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to RentIt Home
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] glass transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-[var(--text)]" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md z-10 my-auto"
      >
        <div className="card p-8 sm:p-10 shadow-2xl border border-[var(--border)] bg-[var(--bg-elevated)] rounded-3xl relative overflow-hidden">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg hover:scale-105 transition-transform">
                R
              </div>
            </Link>
            <h1 className="text-3xl font-black text-[var(--text)] mb-1 tracking-tight">Sign In to RentIt</h1>
            <p className="text-xs font-semibold text-[var(--text-muted)]">Enterprise Equipment & Asset Rental Management</p>
          </div>

          {/* Quick Instant Demo Access Buttons */}
          <div className="mb-6 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1-Click Instant Demo Login
              </span>
              <span className="text-[9px] text-emerald-500 font-extrabold">AUTO AUTH</span>
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('renter@rentit.com', 'Password@123')}
                className="px-2 py-2.5 rounded-xl text-[11px] font-extrabold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)] hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3 h-3" /> Renter
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('admin@rentit.com', 'Password@123')}
                className="px-2 py-2.5 rounded-xl text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-3 h-3" /> HQ Admin
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('customer@rentit.com', 'Password@123')}
                className="px-2 py-2.5 rounded-xl text-[11px] font-extrabold bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--text)] hover:text-[var(--bg)] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
              >
                <UserCheck className="w-3 h-3" /> Customer
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] text-center mt-2.5 font-medium">
              HQ Super Admin? Accessible via <a href="http://localhost:8000/admin/" target="_blank" rel="noreferrer" className="text-[var(--accent)] underline font-bold">Django Admin Panel</a>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@rentit.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center py-3.5 font-extrabold rounded-2xl shadow-md text-base mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Don't have an account?{' '}
              <Link to="/register" className="font-extrabold text-[var(--accent)] hover:underline">
                Create Free Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
