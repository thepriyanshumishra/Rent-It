import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Percent, Sparkles, Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import { toast } from '../../components/ui/Toast';

const BecomeRenterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        ...formData,
        role: 'RENTER'
      });
      toast.success('Renter account created! Welcome to RentIt.');
      navigate('/renter/dashboard');
    } catch (err) {
      toast.error('Failed to create account. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-black text-xs uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" /> RentIt Asset Partner Program
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-[var(--text)] tracking-tight mb-4">
            Earn <span className="text-[var(--accent)]">60% Revenue Share</span> Renting Out Your Idle Gear
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed font-medium">
            Turn your unused cameras, MacBooks, drones, and e-bikes into passive income. We handle physical testing, doorstep pickup, damage escrow, and delivery to renters.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <div className="card p-6 border border-[var(--border)] text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <Percent className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-[var(--text)] mb-2">60 / 40 Payout Split</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Keep 60% of all rental income. Payouts are credited directly to your digital wallet upon order completion.
            </p>
          </div>

          <div className="card p-6 border border-[var(--border)] text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-[var(--text)] mb-2">Doorstep HQ Pickup</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Submit your listing and we pick up your item for physical testing at HQ. Zero hassle shipping for you.
            </p>
          </div>

          <div className="card p-6 border border-[var(--border)] text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-[var(--text)] mb-2">100% Escrow Protection</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Every rental is backed by security deposit escrow. If damaged, repairs are compensated directly to you.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto card p-8 sm:p-10 border border-[var(--border)] shadow-xl">
          <div className="mb-6 border-b border-[var(--border)] pb-4">
            <h2 className="text-2xl font-black text-[var(--text)] mb-1">Create Renter Account</h2>
            <p className="text-xs text-[var(--text-muted)]">Register today and submit your first gear listing for HQ approval.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Rahul"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Sharma"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Create Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full justify-center py-3.5 text-sm font-extrabold mt-4">
              {loading ? 'Creating Account...' : (
                <span className="flex items-center gap-2">
                  Start Listing Gear & Earn 60% <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
            Already have an account? <Link to="/login" className="text-[var(--accent)] font-bold hover:underline">Log in here</Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BecomeRenterPage;
