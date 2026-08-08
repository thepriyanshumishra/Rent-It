import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Compass, Shield, Clock, RotateCcw, ArrowRight, Camera, Laptop, Car, Music, Sofa, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../api';

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

const CATEGORIES = [
  { name: 'Electronics & AV', icon: Laptop },
  { name: 'Cameras & Video', icon: Camera },
  { name: 'Vehicles & E-Bikes', icon: Car },
  { name: 'Audio & Sound', icon: Music },
  { name: 'Office Furniture', icon: Sofa },
  { name: 'Event & Outdoor', icon: Package },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: featuredData } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => productsApi.list({ is_featured: true }),
  });

  const featured = featuredData?.data?.data || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/explore?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12)_0%,transparent_65%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold text-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            Enterprise Rental Management Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[var(--text)] leading-[1.1] mb-6">
            Rent Anything. <br />
            <span className="text-[var(--accent)]">Seamless Operations.</span>
          </h1>

          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-8">
            Discover top-tier equipment, electronics, and vehicles on demand. Full lifecycle management with security deposit tracking and instant return inspection.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto card p-2 flex flex-col sm:flex-row gap-2 shadow-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cameras, bikes, drones, laptops..."
                className="input-field pl-10 border-0 bg-transparent"
              />
            </div>
            <button type="submit" className="btn-primary py-3 px-6 justify-center">
              Search Rentals
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Browse by Category</h2>
            <p className="text-sm text-[var(--text-muted)]">Find items available for flexible rental terms</p>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-[var(--accent)] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              to={`/explore?category=${encodeURIComponent(name)}`}
              className="card p-5 text-center hover:-translate-y-1 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-[var(--text)] text-sm">{name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text)]">Featured Equipment</h2>
              <p className="text-sm text-[var(--text-muted)]">Popular gear available right now</p>
            </div>
            <Link to="/explore" className="text-sm font-semibold text-[var(--accent)] hover:underline flex items-center gap-1">
              Explore All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 3).map((item) => (
              <div key={item.id} className="card overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[var(--text)] mb-1">{item.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-1">{item.short_desc}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-[var(--text)]">
                        {formatPrice(item.priceRules?.[0]?.rate_paise || 0)}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">/day</span>
                    </div>
                    <Link to={`/products/${item.id}`} className="btn-primary text-xs py-1.5 px-3">
                      Rent Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feature Highlights */}
      <section className="bg-[var(--bg-elevated)] border-t border-[var(--border)] py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text)] mb-1">Protected Deposits</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Transparent security deposit calculation. Instant return settlement after quick condition inspection.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text)] mb-1">Flexible Durations</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Rent for 1 day, 1 week, or custom extended periods with automated rate calculation.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text)] mb-1">Easy Returns</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Request a return directly from your dashboard. Store pickup or doorstep courier dispatch options.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
