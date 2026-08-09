import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon, ArrowLeft, User, Mail, Phone, Lock, Building2, FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { registerVendor } from '../../api/auth';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { ThemeContext } from '../../context/ThemeContext';

const RegisterPage = () => {
  const [roleMode, setRoleMode] = useState('CUSTOMER'); // 'CUSTOMER' or 'VENDOR'
  
  // Customer form state
  const [customerData, setCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  // Vendor form state
  const [vendorData, setVendorData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    gst_number: '',
    password: '',
    confirm_password: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext) || { theme: 'light', toggleTheme: () => {} };
  const navigate = useNavigate();

  const handleCustomerChange = (e) => {
    setCustomerData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleVendorChange = (e) => {
    setVendorData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();

    if (!customerData.phone) {
      toast.error('Mobile number is mandatory for Customer signup');
      return;
    }

    if (customerData.password !== customerData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (customerData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        phone: customerData.phone,
        password: customerData.password,
      });
      toast.success('Account created successfully!');
      navigate('/explore', { replace: true });
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.email?.[0] || error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();

    if (!vendorData.phone) {
      toast.error('Mobile number is mandatory for Vendor registration');
      return;
    }

    if (vendorData.password !== vendorData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (vendorData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('first_name', vendorData.first_name);
      formData.append('last_name', vendorData.last_name);
      formData.append('email', vendorData.email);
      formData.append('phone', vendorData.phone);
      formData.append('company_name', vendorData.company_name);
      formData.append('gst_number', vendorData.gst_number);
      formData.append('password', vendorData.password);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await registerVendor(formData);
      toast.success('Vendor registered successfully! Please login.');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.email?.[0] || error.response?.data?.detail || 'Vendor registration failed. Please try again.';
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
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-[var(--text)]" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg z-10 my-auto"
      >
        <div className="card p-8 sm:p-10 shadow-2xl border border-[var(--border)] bg-[var(--bg-elevated)] rounded-3xl relative overflow-hidden">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg hover:scale-105 transition-transform">
                R
              </div>
            </Link>
            <h1 className="text-3xl font-black text-[var(--text)] mb-1 tracking-tight">Join RentIt</h1>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              {roleMode === 'CUSTOMER' ? 'Create your customer account to rent gear' : 'Register your company store as an authorized vendor'}
            </p>
          </div>

          {/* Clean Segmented Tab Toggle */}
          <div className="flex bg-[var(--bg-subtle)] p-1 rounded-2xl border border-[var(--border)] mb-6">
            <button
              type="button"
              onClick={() => setRoleMode('CUSTOMER')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                roleMode === 'CUSTOMER'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              Customer Signup
            </button>
            <button
              type="button"
              onClick={() => setRoleMode('VENDOR')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                roleMode === 'VENDOR'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              Vendor Signup
            </button>
          </div>

          {roleMode === 'CUSTOMER' ? (
            /* Customer Signup Form */
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
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
                      value={customerData.first_name}
                      onChange={handleCustomerChange}
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
                    value={customerData.last_name}
                    onChange={handleCustomerChange}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="rahul@example.com"
                    value={customerData.email}
                    onChange={handleCustomerChange}
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerData.phone}
                    onChange={handleCustomerChange}
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
                    value={customerData.password}
                    onChange={handleCustomerChange}
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
                    value={customerData.confirm_password}
                    onChange={handleCustomerChange}
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
          ) : (
            /* Vendor Signup Form */
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      id="company_name"
                      type="text"
                      required
                      placeholder="RentIt India Pvt Ltd"
                      value={vendorData.company_name}
                      onChange={handleVendorChange}
                      className="input-field pl-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    GST Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      id="gst_number"
                      type="text"
                      required
                      placeholder="19AAAAA1111A1Z1"
                      value={vendorData.gst_number}
                      onChange={handleVendorChange}
                      className="input-field pl-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Owner First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      id="first_name"
                      type="text"
                      required
                      placeholder="Rahul"
                      value={vendorData.first_name}
                      onChange={handleVendorChange}
                      className="input-field pl-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Owner Last Name *
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    required
                    placeholder="Sharma"
                    value={vendorData.last_name}
                    onChange={handleVendorChange}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Corporate Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="partner@rentit.com"
                    value={vendorData.email}
                    onChange={handleVendorChange}
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={vendorData.phone}
                    onChange={handleVendorChange}
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Company Logo Upload Zone */}
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-2xl p-4 bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle)]/75 hover:border-[var(--accent)] transition-all cursor-pointer">
                      <div className="flex flex-col items-center text-center space-y-1 text-xs text-[var(--text-muted)]">
                        <Upload className="w-5 h-5 text-[var(--accent)]" />
                        <span className="font-extrabold text-[var(--text-secondary)]">Upload logo image</span>
                        <span>PNG, JPG up to 2MB</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {logoPreview && (
                    <div className="w-16 h-16 rounded-2xl border border-[var(--border)] overflow-hidden bg-white flex items-center justify-center shrink-0">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={vendorData.password}
                      onChange={handleVendorChange}
                      className="input-field pl-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    id="confirm_password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={vendorData.confirm_password}
                    onChange={handleVendorChange}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center py-3.5 font-extrabold rounded-2xl shadow-md text-base mt-3"
              >
                {loading ? 'Registering Vendor...' : 'Register Vendor'}
              </Button>
            </form>
          )}

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
