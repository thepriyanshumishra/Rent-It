import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon, ArrowLeft, User, Mail, Phone, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { ThemeContext } from '../../context/ThemeContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      toast.success('Account created successfully!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.email?.[0] || error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg)] relative overflow-hidden transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-15 pointer-events-none" />

      {/* Top Navigation */}
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
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg hover:scale-105 transition-transform">
                R
              </div>
            </Link>
            <h1 className="text-3xl font-black text-[var(--text)] mb-1 tracking-tight">Join RentIt</h1>
            <p className="text-xs font-semibold text-[var(--text-muted)]">Create your account to start renting premium equipment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="first_name"
                    type="text"
                    required
                    placeholder="Rahul"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Last Name *
                </label>
                <input
                  id="last_name"
                  type="text"
                  required
                  placeholder="Sharma"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Work / Personal Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10 text-sm"
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

            <div>
              <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="confirm_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center py-3.5 font-extrabold rounded-2xl shadow-md text-base mt-3"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-[var(--accent)] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
