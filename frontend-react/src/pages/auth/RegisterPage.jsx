import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';
import { ThemeContext } from '../../context/ThemeContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    if (errors[e.target.id]) {
      setErrors(prev => ({ ...prev, [e.target.id]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      const serverErrors = error.response?.data || {};
      if (typeof serverErrors === 'object' && !Array.isArray(serverErrors)) {
        const formattedErrors = {};
        let firstMsg = '';
        Object.keys(serverErrors).forEach(key => {
          const val = serverErrors[key];
          const msg = Array.isArray(val) ? val.join(' ') : String(val);
          formattedErrors[key] = msg;
          if (!firstMsg) firstMsg = msg;
        });
        setErrors(formattedErrors);
        toast.error(firstMsg || 'Failed to create account. Please check the form.');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.match(/[a-z]+/)) strength += 25;
    if (pwd.match(/[A-Z]+/)) strength += 25;
    if (pwd.match(/[0-9]+/)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();
  let strengthColor = 'bg-bg-subtle';
  if (strength > 0) strengthColor = 'bg-danger';
  if (strength > 50) strengthColor = 'bg-warning';
  if (strength > 75) strengthColor = 'bg-success';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-bg relative overflow-hidden transition-colors duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

      {/* Top Bar for Auth Page */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-secondary hover:text-text hover:bg-bg-subtle transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10 my-auto"
      >
        <Card padding="lg" className="shadow-2xl border border-border bg-bg-elevated rounded-3xl">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-3">
              <div className="w-12 h-12 rounded-2xl bg-accent text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
                R
              </div>
            </Link>
            <h2 className="text-2xl font-extrabold text-text mb-1">Create Account</h2>
            <p className="text-sm text-text-muted">Join RentOS to start renting top gear</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="first_name"
                label="First Name"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
              />
              <Input
                id="last_name"
                label="Last Name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
              />
            </div>

            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              id="phone"
              type="tel"
              label="Phone Number (Optional)"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create strong password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-text-muted hover:text-text transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              {formData.password && (
                <div className="mt-2 flex gap-1 h-1 w-full rounded-full overflow-hidden bg-bg-subtle">
                  <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strength}%` }}></div>
                </div>
              )}
            </div>

            <Input
              id="confirm_password"
              type={showPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="Repeat password"
              value={formData.confirm_password}
              onChange={handleChange}
              error={errors.confirm_password}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                className="py-3 font-bold rounded-xl shadow-md text-sm"
              >
                Create Account & Rent
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-border-subtle text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-accent hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
