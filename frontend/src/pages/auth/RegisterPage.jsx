import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      const details = err.response?.data?.error?.details;
      const msg = err.response?.data?.error?.message || 'Registration failed';
      if (details) {
        const firstKey = Object.keys(details)[0];
        setError(details[firstKey]?.[0] || msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Priyanshu Mishra', autocomplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@example.com', autocomplete: 'email' },
    { name: 'phone', label: 'Phone (optional)', type: 'tel', icon: Phone, placeholder: '+91 99999 00000', autocomplete: 'tel' },
    { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: '••••••••', autocomplete: 'new-password' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', icon: Lock, placeholder: '••••••••', autocomplete: 'new-password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[var(--bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.10)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white font-black text-xl shadow-lg">R</div>
          <span className="font-black text-2xl tracking-tight text-[var(--text)]">RentIt</span>
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Create Account</h1>
          <p className="text-[var(--text-muted)] text-sm mb-6">Join thousands renting smarter</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--danger-subtle)] border border-[var(--danger)]/20 text-[var(--danger)] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, type, icon: Icon, placeholder, autocomplete }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id={`register-${name}`}
                    name={name}
                    type={name.includes('password') ? (showPassword ? 'text' : 'password') : type}
                    autoComplete={autocomplete}
                    required={name !== 'phone'}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="input-field pl-10 pr-10"
                  />
                  {name === 'password' && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Spinner size="sm" color="white" /> : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent)] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
