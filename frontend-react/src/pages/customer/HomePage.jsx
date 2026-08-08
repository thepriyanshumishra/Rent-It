import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Laptop, Sofa, Car, Camera, Music, Shield, Eye, Lock, RotateCcw, Search, Calendar, ChevronRight } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import ScrollReveal from '../../components/shared/ScrollReveal';
import Button from '../../components/ui/Button';
import ProductGrid from '../../components/customer/ProductGrid';
import { useQuery } from '@tanstack/react-query';
import * as productsApi from '../../api/products';

const HomePage = () => {
  const navigate = useNavigate();

  // Quick Rental Search Bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getProducts({ is_featured: true })
  });

  const categories = [
    { name: 'Cameras & Video', icon: <Camera className="w-5 h-5 text-accent" /> },
    { name: 'Electronics', icon: <Laptop className="w-5 h-5 text-accent" /> },
    { name: 'Vehicles & E-Bikes', icon: <Car className="w-5 h-5 text-accent" /> },
    { name: 'Audio & Sound', icon: <Music className="w-5 h-5 text-accent" /> },
    { name: 'Office Furniture', icon: <Sofa className="w-5 h-5 text-accent" /> },
    { name: 'Event & Outdoor', icon: <Package className="w-5 h-5 text-accent" /> }
  ];

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <PageTransition>
      {/* Section 1: Hero */}
      <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden pt-12 pb-16 px-4">
        {/* Subtle decorative radial light pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-15 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
          
          <motion.h1 
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-text">Rent what you need.</span><br/>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">Only when you need it.</span>
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Access top-tier camera gear, MacBooks, e-bikes, and event equipment on demand. Flexible daily, weekly, or monthly rentals with full deposit protection.
          </motion.p>

          {/* Odoo Rentals Inspired Interactive Booking Bar */}
          <motion.form
            onSubmit={handleQuickSearch}
            className="w-full max-w-4xl bg-bg-elevated border border-border rounded-3xl p-3 sm:p-4 shadow-2xl mb-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex flex-col gap-1 p-2.5 rounded-2xl bg-bg-subtle border border-border-subtle">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Search className="w-3 h-3 text-accent" /> Search Item
              </label>
              <input
                type="text"
                placeholder="Camera, Laptop, E-Bike..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-text font-semibold outline-none placeholder:text-text-muted/60"
              />
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-2xl bg-bg-subtle border border-border-subtle">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-accent" /> Pick-up Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm text-text font-semibold outline-none cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-2xl bg-bg-subtle border border-border-subtle">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-accent" /> Return Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm text-text font-semibold outline-none cursor-pointer"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="h-full w-full rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg py-3 text-sm"
            >
              <Search className="w-4 h-4" /> Find Available
            </Button>
          </motion.form>

          <motion.div 
            className="flex flex-wrap justify-center gap-6 md:gap-12 text-xs sm:text-sm text-text-secondary font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center gap-2"><Package className="w-4 h-4 text-accent" /> 500+ Verified Items</div>
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-accent" /> 100% Refundable Deposit</div>
            <div className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-accent" /> Doorstep Delivery & Returns</div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Interactive Categories */}
      <ScrollReveal className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text mb-1">Browse by Category</h2>
            <p className="text-sm text-text-muted font-medium">Explore rental gear curated for creators and professionals</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/explore')} className="flex items-center gap-1 font-bold text-sm">
            All Categories <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.name.toLowerCase())}`)}
              className="flex flex-col items-center text-center p-5 bg-bg-elevated border border-border rounded-3xl cursor-pointer hover:border-accent hover:shadow-lg transition-all group shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent-subtle flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <span className="font-bold text-xs sm:text-sm text-text group-hover:text-accent transition-colors">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Section 3: Featured Products */}
      <ScrollReveal className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Curated Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text mt-1">Featured Rentals</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/explore')} className="flex items-center gap-1 font-bold text-sm">
            View All Rentals <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <ProductGrid products={featuredProducts?.data || []} loading={featuredLoading} columns={3} />
      </ScrollReveal>

      {/* Section 4: How It Works */}
      <ScrollReveal id="how-it-works" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">Simple 4-Step Process</span>
          <h2 className="text-3xl sm:text-4xl font-black text-text mt-1">Renting Made Seamless</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            { num: '01', title: 'Select Product', desc: 'Browse available items and choose your preferred rental dates.' },
            { num: '02', title: 'Book & Deposit', desc: 'Confirm your booking with instant verification and upfront terms.' },
            { num: '03', title: 'Receive & Use', desc: 'Enjoy doorstep delivery or store pickup at your convenience.' },
            { num: '04', title: 'Return & Refund', desc: 'Hand back the item upon period end and receive your deposit.' }
          ].map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center p-6 bg-bg-elevated border border-border rounded-3xl shadow-sm">
              <span className="text-4xl font-black text-accent mb-3">{step.num}</span>
              <h3 className="text-base font-bold text-text mb-2">{step.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Section 5: Trust & Benefits */}
      <ScrollReveal className="py-20 bg-bg-subtle border-y border-border">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-text">Quality Inspected</h3>
            <p className="text-xs text-text-muted leading-relaxed">Every item undergoes thorough multi-point testing before dispatch.</p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-text">Zero Hidden Costs</h3>
            <p className="text-xs text-text-muted leading-relaxed">Upfront pricing calculators with clear security deposit breakdowns.</p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-text">Protected Deposits</h3>
            <p className="text-xs text-text-muted leading-relaxed">Your deposit is securely held and released immediately upon return.</p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-text">Hassle-Free Returns</h3>
            <p className="text-xs text-text-muted leading-relaxed">Flexible extensions and return scheduling right from your dashboard.</p>
          </div>
        </div>
      </ScrollReveal>

      {/* Section 6: CTA Section */}
      <ScrollReveal className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto p-10 bg-bg-elevated border border-border rounded-3xl shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-black text-text mb-4">Ready to start renting?</h2>
          <p className="text-text-muted text-base mb-8 max-w-xl mx-auto font-medium">Join thousands of creators and businesses who access premium gear on demand.</p>
          <Button size="lg" className="rounded-2xl px-8 py-3.5 font-bold shadow-lg text-sm" onClick={() => navigate('/explore')}>
            Explore All Products
          </Button>
        </div>
      </ScrollReveal>
    </PageTransition>
  );
};

export default HomePage;
