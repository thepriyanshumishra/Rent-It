'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { formatMoney } from '../lib/utils';
import {
  Zap,
  ShieldCheck,
  Truck,
  Heart,
  Calendar,
  Minus,
  Plus,
  Info,
  ShoppingBag,
  ArrowRight,
  Monitor,
  Wrench,
  Tent,
  LayoutGrid,
  MoreHorizontal,
  Headphones,
  Coins,
  Award,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  MapPin,
  Camera,
  Volume2,
  ChevronRight,
  UserCheck,
  RotateCcw,
  Check,
} from 'lucide-react';

// Default Showcase Products matching user mockups
const DEMO_PRODUCTS = [
  {
    id: 'prod_canon_r6_mk2',
    name: 'Canon EOS R6 Mark II',
    category: { name: 'Electronics & AV', slug: 'electronics-av' },
    short_desc: 'Professional Full-Frame Mirrorless Camera',
    specs: ['24.2 MP', '4K 60fps', 'Dual Pixel AF II'],
    rating: 4.9,
    reviewsCount: 42,
    totalInventory: 4,
    priceRules: [{ rate_paise: 150000 }], // ₹1,500 / day
    depositAmountPaise: 500000, // ₹5,000 deposit
    image_url:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod_dewalt_drill',
    name: 'DeWALT DCD7781D2 Drill',
    category: { name: 'Tools & Machinery', slug: 'tools-machinery' },
    short_desc: '20V Max Cordless Drill Driver Kit',
    specs: ['20V Max', '2 Speed', '65Nm Torque'],
    rating: 4.8,
    reviewsCount: 31,
    totalInventory: 6,
    priceRules: [{ rate_paise: 45000 }], // ₹450 / day
    depositAmountPaise: 200000, // ₹2,000 deposit
    image_url:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod_tent_10x10',
    name: '10x10 Premium Event Tent',
    category: { name: 'Event Supplies', slug: 'event-supplies' },
    short_desc: 'Heavy-Duty Waterproof Outdoor Canopy',
    specs: ['10x10 ft', 'Waterproof', 'UV Shield'],
    rating: 5.0,
    reviewsCount: 19,
    totalInventory: 3,
    priceRules: [{ rate_paise: 200000 }], // ₹2,000 / day
    depositAmountPaise: 750000, // ₹7,500 deposit
    image_url:
      'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod_jbl_speaker',
    name: 'JBL EON715 PA Speaker',
    category: { name: 'Electronics & AV', slug: 'electronics-av' },
    short_desc: '15" Powered Loudspeaker with Bluetooth',
    specs: ['1300W Peak', 'Bluetooth', '15 Inch Woofer'],
    rating: 4.9,
    reviewsCount: 56,
    totalInventory: 2,
    priceRules: [{ rate_paise: 80000 }], // ₹800 / day
    depositAmountPaise: 300000, // ₹3,000 deposit
    image_url:
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
  },
];

const CATEGORIES = [
  {
    id: 'all',
    name: 'All Categories',
    icon: LayoutGrid,
    count: '350+ Items',
    desc: 'Browse complete catalog',
  },
  {
    id: 'electronics-av',
    name: 'Electronics & AV',
    icon: Camera,
    count: '120+ Items',
    desc: 'Cameras, Audio, Lighting',
  },
  {
    id: 'tools-machinery',
    name: 'Tools & Machinery',
    icon: Wrench,
    count: '85+ Items',
    desc: 'Generators, Drills, Mixers',
  },
  {
    id: 'event-supplies',
    name: 'Event & Party',
    icon: Tent,
    count: '64+ Items',
    desc: 'Canopies, Staging, Seating',
  },
  {
    id: 'audio-dj',
    name: 'Stage & Audio',
    icon: Volume2,
    count: '45+ Items',
    desc: 'Speakers, DJ Gear, Mics',
  },
];

export default function Homepage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>('Bangalore, India');

  // Modal / Drawer State for Renting
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(DEMO_PRODUCTS[0]);
  const [startDate, setStartDate] = useState<string>('2025-05-24');
  const [endDate, setEndDate] = useState<string>('2025-05-27');
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const merged = res.data.data.map((p: any) => {
          const matchedDemo = DEMO_PRODUCTS.find(
            (d) => d.name.toLowerCase() === p.name.toLowerCase()
          );
          return {
            ...p,
            specs: matchedDemo?.specs || p.specs || ['Professional Grade'],
            rating: matchedDemo?.rating || 4.9,
            reviewsCount: matchedDemo?.reviewsCount || 24,
            image_url: p.image_url || p.imageUrls?.[0] || matchedDemo?.image_url,
          };
        });
        setProducts(merged);
      }
    } catch {
      setProducts(DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const openRentalModal = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const calculateDays = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 3;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!mounted) {
      if (dateStr === '2025-05-24') return { dateFormatted: '24 May 2025', dayName: 'Saturday' };
      if (dateStr === '2025-05-27') return { dateFormatted: '27 May 2025', dayName: 'Tuesday' };
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { dateFormatted: '24 May 2025', dayName: 'Saturday' };
      const dateFormatted = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      return { dateFormatted, dayName };
    } catch {
      return { dateFormatted: dateStr, dayName: '' };
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    try {
      setAddingToCart(true);
      await api.post('/cart/items/', {
        productId: selectedProduct.id,
        startDate,
        endDate,
        quantity,
      });
      window.dispatchEvent(new Event('storage'));
      router.push('/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      router.push('/cart');
    } finally {
      setAddingToCart(false);
      setIsModalOpen(false);
    }
  };

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      p.category?.slug === selectedCategory ||
      p.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.short_desc?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const durationDays = calculateDays(startDate, endDate);
  const dayRatePaise = selectedProduct?.priceRules?.[0]?.rate_paise || 150000;
  const rentalFeePaise = dayRatePaise * durationDays * quantity;
  const depositPaise = (selectedProduct?.depositAmountPaise || 500000) * quantity;
  const totalAmountPaise = rentalFeePaise + depositPaise;

  const startDateInfo = formatDateDisplay(startDate);
  const endDateInfo = formatDateDisplay(endDate);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-brand-600 selection:text-white">
      
      {/* 1. HERO SECTION (FULL WIDTH HERO BANNER) */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Background Atmosphere */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Live Status Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-purple-200 text-xs font-extrabold tracking-wider uppercase border border-white/15 backdrop-blur-xl shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            INDIA'S PREMIUM EQUIPMENT RENTAL PLATFORM
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
              Rent Professional Equipment.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-300 to-indigo-300">
                Rented Simply.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Wide range of verified cameras, power generators, event canopies, and stage audio with real-time availability, transparent daily rates, and 100% refundable security deposits.
            </p>
          </div>

          {/* Floating Search & Location Bar */}
          <div className="max-w-4xl mx-auto bg-white p-3 sm:p-4 rounded-3xl sm:rounded-full shadow-2xl border border-white/20 text-slate-900 text-left grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            {/* Search Input (5 Cols) */}
            <div className="sm:col-span-5 relative flex items-center px-3 border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0">
              <Search className="h-4 w-4 text-brand-600 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What gear do you need? (e.g. Canon R6, Drill, Speaker)"
                className="w-full text-xs font-semibold placeholder-slate-400 outline-none bg-transparent"
              />
            </div>

            {/* Location (3 Cols) */}
            <div className="sm:col-span-3 relative flex items-center px-3 border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0">
              <MapPin className="h-4 w-4 text-brand-600 shrink-0 mr-2" />
              <select
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full text-xs font-semibold outline-none bg-transparent text-slate-800 cursor-pointer"
              >
                <option value="Bangalore, India">Bangalore, IN</option>
                <option value="Mumbai, India">Mumbai, IN</option>
                <option value="Delhi NCR, India">Delhi NCR, IN</option>
              </select>
            </div>

            {/* Quick Category (2 Cols) */}
            <div className="sm:col-span-2 px-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Category
              </span>
              <span className="text-xs font-bold text-slate-800 capitalize truncate block">
                {selectedCategory === 'all' ? 'All Equipment' : selectedCategory}
              </span>
            </div>

            {/* Search Button (2 Cols) */}
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3 px-4 rounded-2xl sm:rounded-full bg-brand-600 hover:bg-brand-700 text-xs font-black text-white shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-1.5"
              >
                Search <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Micro Trust Pills */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 500+ Verified Gear Items
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Refundable Security Deposit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Doorstep Delivery & Store Pickup
            </span>
          </div>
        </div>
      </section>

      {/* 2. BROWSE CATEGORIES SECTION */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600">
                Explore Equipment
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Browse by Category
              </h2>
            </div>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
            >
              View all categories <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-5 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-lg ${
                    isSelected
                      ? 'border-brand-600 bg-purple-50/60 ring-2 ring-brand-600/20 shadow-md'
                      : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-3 rounded-2xl ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {cat.count}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">{cat.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATALOG GRID */}
      <section id="catalog-section" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600">
                Live Inventory
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Popular Equipment for Rent
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Select your dates to verify real-time availability and lock your reservation.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Gear
              </button>
              <button
                onClick={() => setSelectedCategory('electronics-av')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === 'electronics-av'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Electronics & AV
              </button>
              <button
                onClick={() => setSelectedCategory('tools-machinery')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === 'tools-machinery'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tools & Machinery
              </button>
              <button
                onClick={() => setSelectedCategory('event-supplies')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === 'event-supplies'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Event Supplies
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent mx-auto"></div>
              <p className="mt-3 text-xs text-slate-500 font-medium">Loading equipment catalog...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const dayRate = product.priceRules?.[0]?.rate_paise || 150000;
                const deposit = product.depositAmountPaise || 500000;
                const isFav = favorites[product.id];

                return (
                  <div
                    key={product.id}
                    className="group relative rounded-3xl bg-white border border-slate-200/90 p-5 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-purple-50 text-brand-700 text-[10px] font-extrabold tracking-wider uppercase border border-purple-100">
                          {product.category?.name || 'Equipment'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(product.id, e)}
                          className={`p-1.5 rounded-full transition ${
                            isFav
                              ? 'text-red-500 bg-red-50'
                              : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>
                      </div>

                      {/* Image Frame */}
                      <Link
                        href={`/products/${product.id}`}
                        className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center p-3 mb-3 border border-slate-100 block cursor-pointer"
                      >
                        <img
                          src={product.image_url || product.imageUrls?.[0]}
                          alt={product.name}
                          className="h-full w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {product.totalInventory || 4} Units Available
                          </span>
                          {product.rating && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.rating} ({product.reviewsCount})
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition leading-snug">
                          <Link href={`/products/${product.id}`}>
                            {product.name}
                          </Link>
                        </h3>

                        <p className="text-[11px] text-slate-500 font-semibold line-clamp-1 leading-relaxed">
                          {product.short_desc}
                        </p>

                        {/* Specs */}
                        {product.specs && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {product.specs.map((spec: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Rent CTA */}
                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-lg font-black text-slate-900">
                            {formatMoney(dayRate)}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold"> / day</span>
                        </div>

                        <span className="text-[10px] font-bold text-slate-500">
                          Deposit: {formatMoney(deposit)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition text-center"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => openRentalModal(product)}
                          className="py-2.5 px-3 rounded-xl bg-brand-600 text-white text-xs font-black hover:bg-brand-700 shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-1"
                        >
                          Rent Now <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW RENTIT WORKS SECTION */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl text-left space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400">
              Simple 3-Step Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">How RentIt Works</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              Complete rental lifecycle management built for operational transparency, live inventory tracking, and guaranteed security deposit refunds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 backdrop-blur relative overflow-hidden">
              <span className="text-5xl font-black text-brand-500/20 absolute top-4 right-6 pointer-events-none">
                01
              </span>
              <div className="h-12 w-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-white">Select Equipment & Dates</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Choose your required gear, pick start and end dates, and instantly view live availability with zero hidden charges.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 backdrop-blur relative overflow-hidden">
              <span className="text-5xl font-black text-brand-500/20 absolute top-4 right-6 pointer-events-none">
                02
              </span>
              <div className="h-12 w-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-white">Store Pickup or Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Collect your pre-inspected gear directly from our store hub or select fast doorstep delivery straight to your site.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 backdrop-blur relative overflow-hidden">
              <span className="text-5xl font-black text-brand-500/20 absolute top-4 right-6 pointer-events-none">
                03
              </span>
              <div className="h-12 w-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-white">Return & Instant Deposit Refund</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Return the gear after your rental duration. Following a quick digital inspection, your 100% security deposit is refunded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 SOCIAL PROOF / TESTIMONIALS */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Trusted by Professionals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Rented the Canon EOS R6 for a 3-day corporate shoot. Equipment arrived in perfect condition, deposit was refunded the same day we returned it.",
                author: "Arjun Mehta",
                role: "Freelance Photographer, Bengaluru",
                rating: 5,
                avatar: "AM",
              },
              {
                quote: "Used the DeWALT drill kit for our office renovation. Saved ₹8,000 vs buying. The pickup process took 5 minutes.",
                author: "Sneha Krishnan",
                role: "Interior Designer, Chennai",
                rating: 5,
                avatar: "SK",
              },
              {
                quote: "The JBL speakers were flawless for our product launch event. Transparent pricing, zero surprises. Will rent again.",
                author: "Rohit Sharma",
                role: "Event Manager, Mumbai",
                rating: 5,
                avatar: "RS",
              },
            ].map((t) => (
              <div
                key={t.author}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-brand-200 hover:shadow-md transition-all duration-200"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                  <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.author}</p>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: '500+', label: 'Equipment Items' },
              { value: '2,400+', label: 'Rentals Completed' },
              { value: '100%', label: 'Deposit Refund Rate' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-brand-600">{stat.value}</div>
                <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY RENTIT / VALUE PILLARS */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600">
              Built for Professionals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Professionals Choose RentIt
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 text-brand-600 shrink-0 border border-purple-100">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">Multi-Point Inspection</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Every gear unit undergoes rigorous quality testing before every single dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 text-brand-600 shrink-0 border border-purple-100">
                <Zap className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">Zero Double-Booking</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Real-time database availability prevents overlapping reservations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 text-brand-600 shrink-0 border border-purple-100">
                <Coins className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">100% Refundable Deposit</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Transparent deposit tracking with instant digital refunds upon inspection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 text-brand-600 shrink-0 border border-purple-100">
                <Headphones className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">24/7 Expert Support</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Dedicated technical support team to assist with gear setup and operational questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-900 to-purple-950 p-8 sm:p-14 text-white shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl text-center sm:text-left">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Ready to Start Your Next Production?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Browse our catalog of professional cameras, tools, and audio systems. Book online with instant availability verification.
              </p>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 text-xs font-black hover:bg-slate-100 shadow-xl transition shrink-0 flex items-center gap-2"
            >
              Explore All Equipment <ArrowRight className="h-4 w-4 text-brand-600" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE AVAILABILITY & RENTAL MODAL DRAWER */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Check Availability & Rent</h3>
                <p className="text-xs text-slate-500 font-medium">Configure rental dates and quantity.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Selected Item Preview */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={selectedProduct.image_url || selectedProduct.imageUrls?.[0]}
                alt={selectedProduct.name}
                className="h-16 w-16 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-slate-900 truncate">
                  {selectedProduct.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {selectedProduct.short_desc || selectedProduct.category?.name}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1">
                  ✓ {selectedProduct.totalInventory || 4} Units Available
                </span>
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-700">Start Date</label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between hover:bg-white focus-within:bg-white focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/10 transition cursor-pointer">
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {startDateInfo.dateFormatted}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {startDateInfo.dayName}
                    </p>
                  </div>
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-700">End Date</label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between hover:bg-white focus-within:bg-white focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/10 transition cursor-pointer">
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {endDateInfo.dateFormatted}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {endDateInfo.dayName}
                    </p>
                  </div>
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Quantity</label>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 font-extrabold transition border border-slate-200"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-black text-slate-900">
                  {quantity} {quantity === 1 ? 'Unit' : 'Units'}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(selectedProduct?.totalInventory || 6, q + 1))}
                  className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 font-extrabold transition border border-slate-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-900">Price Breakdown</h4>

              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Rental Fee ({durationDays} Days):</span>
                <span className="font-extrabold text-slate-900">{formatMoney(rentalFeePaise)}</span>
              </div>

              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Refundable Deposit:</span>
                <span className="font-extrabold text-slate-900">{formatMoney(depositPaise)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                <span className="text-xs font-black text-slate-900">
                  Total Payable (Incl. Deposit):
                </span>
                <span className="text-2xl font-black text-brand-600">
                  {formatMoney(totalAmountPaise)}
                </span>
              </div>
            </div>

            {/* Notice */}
            <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-100 flex items-start gap-2 text-[11px] text-slate-700 leading-relaxed font-medium">
              <Info className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
              <p>
                {formatMoney(depositPaise)} security deposit is 100% refundable after safe equipment return.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 py-3 px-4 rounded-2xl bg-brand-600 text-xs font-black text-white shadow-xl shadow-brand-600/30 hover:bg-brand-700 transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                {addingToCart ? 'Adding...' : 'Proceed to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
