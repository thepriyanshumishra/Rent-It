import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon, ArrowLeft, Lock, Mail, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { ThemeContext } from '../../context/ThemeContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    toast.info(`Filled credentials for ${email}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await login(formData);
      toast.success(`Welcome back, ${user.first_name || user.email}!`);
      if (user.role === 'ADMIN' || user.role === 'admin' || user.is_staff || user.is_superuser) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
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
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
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

          {/* Quick Demo Access Pills */}
          <div className="mb-6 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Instant Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@rentit.com', 'admin123456')}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo('customer@rentit.com', 'customer123456')}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" /> Customer Demo
              </button>
            </div>
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
