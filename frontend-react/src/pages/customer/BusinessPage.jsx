import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Package, CheckCircle2, ArrowRight, ShieldCheck, Clock, Users, Send } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../api/axios';

const BusinessPage = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    equipment_needed: '',
    duration: '1 Week',
    start_date: '',
    estimated_budget: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/quotations/business-orders/', formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit business order inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs mb-4"
          >
            <Building2 className="w-4 h-4" /> B2B & Enterprise Solutions
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--text)] mb-4"
          >
            Bulk Rentals for <span className="text-[var(--accent)]">Businesses & Events</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--text-secondary)]"
          >
            Equip your workforce, film crew, or corporate conference. Dedicated account management, flexible billing, and insured fleet logistics.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="card p-6 border border-[var(--border)]">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-[var(--accent)] flex items-center justify-center mb-4">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-[var(--text)] mb-2">Custom Fleet Solutions</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Get matched sets of MacBooks, 8K Cinema Drones, or E-Bike fleets provisioned with custom software images and accessories.
            </p>
          </div>

          <div className="card p-6 border border-[var(--border)]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-[var(--text)] mb-2">Corporate GST Invoicing</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Tax-compliant invoices with GSTIN integration, flexible security deposit waivers, and credit term options for verified companies.
            </p>
          </div>

          <div className="card p-6 border border-[var(--border)]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-[var(--text)] mb-2">Priority On-Site Support</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Dedicated rental operations manager, on-call technical replacement support, and doorstep setup for production shoots.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto card p-8 sm:p-10 border border-[var(--border)] relative overflow-hidden shadow-xl">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text)] mb-2">Bulk Order Request Submitted!</h2>
              <p className="text-[var(--text-muted)] max-w-md mx-auto mb-6">
                Thank you for contacting RentIt B2B. Our Enterprise Account Executive will review your requirements and get in touch with a customized quotation within 2 hours.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline">
                Submit Another Request
              </Button>
            </motion.div>
          ) : (
            <div>
              <div className="mb-8 border-b border-[var(--border)] pb-6">
                <h2 className="text-2xl font-black text-[var(--text)] mb-1">Request a Business Quotation</h2>
                <p className="text-sm text-[var(--text-muted)]">Fill out your company details and equipment requirements below.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      required
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="Acme Studios Pvt Ltd"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      name="contact_name"
                      required
                      value={formData.contact_name}
                      onChange={handleChange}
                      placeholder="Rahul Sharma"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rahul@acmestudios.com"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Phone Number *
                    </label>
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
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Required Equipment & Quantities *
                  </label>
                  <textarea
                    name="equipment_needed"
                    required
                    rows={3}
                    value={formData.equipment_needed}
                    onChange={handleChange}
                    placeholder="e.g. 5x Sony FX3 Cinema Cameras, 10x MacBook Pro M3 Max, 2x Super73 E-Bikes for 5-day commercial shoot"
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Duration
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="1-3 Days">1-3 Days</option>
                      <option value="1 Week">1 Week</option>
                      <option value="2-4 Weeks">2-4 Weeks</option>
                      <option value="1+ Months">1+ Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Est. Budget (Optional)
                    </label>
                    <input
                      type="text"
                      name="estimated_budget"
                      value={formData.estimated_budget}
                      onChange={handleChange}
                      placeholder="₹50,000 - ₹2,00,000"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Additional Notes / Logistics Needs
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Need GST invoice, delivery to film location in Mumbai..."
                    className="input-field resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full justify-center py-3.5 text-base font-extrabold"
                >
                  {loading ? 'Submitting Inquiry...' : (
                    <span className="flex items-center gap-2">
                      Submit Bulk Order Inquiry <Send className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default BusinessPage;
