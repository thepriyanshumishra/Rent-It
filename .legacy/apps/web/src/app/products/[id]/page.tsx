'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { formatMoney } from '../../../lib/utils';
import {
  Star,
  ShieldCheck,
  Zap,
  Clock,
  Calendar,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Sparkles,
  Info,
  UserCheck,
  Lock,
  RotateCcw,
  Check,
  Share2,
  Heart,
  HelpCircle,
  Truck,
  Building,
} from 'lucide-react';

// Comprehensive Rich Demo Products Database matching product IDs
const DETAILED_PRODUCTS: Record<string, any> = {
  prod_canon_r6_mk2: {
    id: 'prod_canon_r6_mk2',
    name: 'Canon EOS R6 Mark II Mirrorless Camera Body',
    category: { name: 'Electronics & AV', slug: 'electronics-av' },
    brand: 'Canon',
    assetValuePaise: 21500000, // ₹2,15,000 Market Price
    short_desc: 'Professional 24.2MP full-frame camera with 4K 60p video, 40fps electronic shutter, and advanced subject tracking AF.',
    rating: 4.9,
    reviewsCount: 42,
    totalInventory: 4,
    availableInventory: 3,
    nextAvailableInHours: 13, // 13 hours
    nextAvailableInMins: 45,
    paddingBufferMinutes: 60, // 1 hour turnaround buffer
    priceRules: [{ rate_paise: 150000 }], // ₹1,500 / day
    depositAmountPaise: 500000, // ₹5,000 deposit
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d611397?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: [
      { name: 'Sensor Size', value: '35.9 x 23.9 mm Full-Frame CMOS' },
      { name: 'Resolution', value: '24.2 Effective Megapixels' },
      { name: 'Video Recording', value: '4K UHD 60p (Over-sampled from 6K)' },
      { name: 'Continuous Shooting', value: 'Up to 40 fps (Electronic), 12 fps (Mechanical)' },
      { name: 'Autofocus', value: 'Dual Pixel CMOS AF II with Deep Learning' },
      { name: 'In-Body Stabilization', value: 'Up to 8-Stops IBIS Coordination' },
      { name: 'Storage Slots', value: 'Dual SD/SDHC/SDXC (UHS-II Compatible)' },
      { name: 'Weight', value: '670 g (Body only with battery)' },
    ],
    includedAccessories: [
      'Canon EOS R6 Mark II Body',
      'RF 24-105mm f/4L IS USM Lens',
      '2x LP-E6NH Rechargeable Batteries',
      'Dual Battery Charger with AC Cable',
      'SanDisk Extreme Pro 128GB SDXC UHS-II Card',
      'Heavy-Duty Padded Shoulder Carry Bag',
    ],
  },
  prod_dewalt_drill: {
    id: 'prod_dewalt_drill',
    name: 'DeWALT DCD7781D2 20V Max Cordless Hammer Drill Kit',
    category: { name: 'Tools & Machinery', slug: 'tools-machinery' },
    brand: 'DeWALT',
    assetValuePaise: 1850000, // ₹18,500 Market Price
    short_desc: 'Heavy-duty 20V Max brushless cordless hammer drill/driver with 2 batteries, charger, and contractor bag.',
    rating: 4.8,
    reviewsCount: 31,
    totalInventory: 6,
    availableInventory: 0, // All rented out example!
    nextAvailableInHours: 13,
    nextAvailableInMins: 15,
    paddingBufferMinutes: 60, // 1 hour inspection & sanitization
    priceRules: [{ rate_paise: 45000 }], // ₹450 / day
    depositAmountPaise: 200000, // ₹2,000 deposit
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: [
      { name: 'Voltage', value: '20V Max Lithium-Ion' },
      { name: 'Motor Type', value: 'Brushless High-Efficiency' },
      { name: 'Max Torque', value: '65 Nm' },
      { name: 'Speed Settings', value: '2 Speed Ranges (0-500 / 0-1750 RPM)' },
      { name: 'Chuck Capacity', value: '13 mm (1/2") Heavy-Duty Ratcheting' },
      { name: 'Weight', value: '1.5 kg (with battery)' },
    ],
    includedAccessories: [
      'DeWALT DCD7781 Brushless Drill',
      '2x 20V MAX 2.0Ah Li-Ion Batteries',
      'Fast Battery Charger',
      '14-Piece Titanium Drill Bit Set',
      'Hard Contractor Carrying Case',
    ],
  },
  prod_tent_10x10: {
    id: 'prod_tent_10x10',
    name: '10x10 Premium Event Tent & Canopy Shade',
    category: { name: 'Event Supplies', slug: 'event-supplies' },
    brand: 'RentIt Pro Events',
    assetValuePaise: 3500000, // ₹35,000 Market Price
    short_desc: 'Heavy-duty 100% waterproof pop-up commercial canopy tent with UV protective fabric and sturdy steel frame.',
    rating: 5.0,
    reviewsCount: 19,
    totalInventory: 3,
    availableInventory: 2,
    nextAvailableInHours: 0,
    nextAvailableInMins: 0,
    paddingBufferMinutes: 90, // 1.5 hours inspection & wash
    priceRules: [{ rate_paise: 200000 }], // ₹2,000 / day
    depositAmountPaise: 750000, // ₹7,500 deposit
    images: [
      'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: [
      { name: 'Dimensions', value: '10 x 10 Feet (100 Sq. Ft. Coverage)' },
      { name: 'Material', value: '500D Polyester Waterproof & UV Proof' },
      { name: 'Frame Type', value: 'Powder-Coated Rust-Proof Steel' },
      { name: 'Setup Time', value: 'Under 5 Minutes (Pop-Up Mechanism)' },
      { name: 'Included Height', value: 'Adjustable Peak Height up to 11 Ft' },
    ],
    includedAccessories: [
      '10x10 Pop-Up Canopy Frame & Top',
      '4x Heavy Sandbag Weight Bags',
      'Ground Stakes & Anchoring Ropes',
      'Rolling Storage Bag with Wheels',
    ],
  },
  prod_jbl_speaker: {
    id: 'prod_jbl_speaker',
    name: 'JBL EON715 1300W 15-Inch Powered PA Loudspeaker',
    category: { name: 'Electronics & AV', slug: 'electronics-av' },
    brand: 'JBL Professional',
    assetValuePaise: 6500000, // ₹65,000 Market Price
    short_desc: '1300-watt peak powered PA speaker with Bluetooth audio streaming, built-in 3-channel digital mixer, and dbx DSP.',
    rating: 4.9,
    reviewsCount: 56,
    totalInventory: 4,
    availableInventory: 3,
    nextAvailableInHours: 0,
    nextAvailableInMins: 0,
    paddingBufferMinutes: 60,
    priceRules: [{ rate_paise: 80000 }], // ₹800 / day
    depositAmountPaise: 300000, // ₹3,000 deposit
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: [
      { name: 'Power Rating', value: '1300W Peak / 650W RMS Class-D' },
      { name: 'Woofer Size', value: '15-Inch Custom Ferrite Woofer' },
      { name: 'Max SPL', value: '128 dB Peak' },
      { name: 'Bluetooth', value: 'Bluetooth 5.0 Audio Streaming & Control' },
      { name: 'Inputs', value: '2x XLR Combo Jacks, 1x 3.5mm Aux' },
    ],
    includedAccessories: [
      'JBL EON715 Loudspeaker',
      'Heavy-Duty Speaker Tripod Stand',
      '10m Balanced XLR Cable',
      'Heavy Power Cord',
      'Protective Slip Cover',
    ],
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params.id as string) || 'prod_canon_r6_mk2';

  // Get product or fallback to Canon camera
  const product = DETAILED_PRODUCTS[productId] || DETAILED_PRODUCTS.prod_canon_r6_mk2;

  const [selectedImage, setSelectedImage] = useState<string>(product.images[0]);
  const [startDate, setStartDate] = useState<string>('2025-05-24');
  const [endDate, setEndDate] = useState<string>('2025-05-27');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'included' | 'terms' | 'reviews'>('specs');
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (product.images?.[0]) setSelectedImage(product.images[0]);
  }, [productId]);

  const calculateDays = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 3;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const durationDays = calculateDays(startDate, endDate);
  const dailyRatePaise = product.priceRules[0]?.rate_paise || 150000;
  const rentalFeePaise = dailyRatePaise * durationDays * quantity;
  const depositPaise = (product.depositAmountPaise || 500000) * quantity;
  const totalAmountPaise = rentalFeePaise + depositPaise;

  const isAllRented = product.availableInventory === 0;

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await api.post('/cart/items/', {
        productId: product.id,
        startDate,
        endDate,
        quantity,
      });
      window.dispatchEvent(new Event('storage'));
      router.push('/cart');
    } catch {
      router.push('/cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-brand-600 transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/#categories" className="hover:text-brand-600 transition">
              {product.category?.name}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Image Gallery (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Active Image */}
            <div className="relative aspect-4/3 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden group">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`absolute top-4 right-4 h-10 w-10 rounded-full border flex items-center justify-center transition-all ${
                  isFavorite
                    ? 'bg-red-50 border-red-200 text-red-500 shadow-md'
                    : 'bg-white/90 border-slate-200 text-slate-400 hover:text-red-500 shadow-sm'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Verified Grade A+ Asset
              </div>
            </div>

            {/* Thumbnail Switcher */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((imgUrl: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`aspect-square rounded-2xl border overflow-hidden transition-all bg-white ${
                    selectedImage === imgUrl
                      ? 'border-brand-600 ring-2 ring-brand-600/20 scale-95 shadow-md'
                      : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Security Deposit & Asset Value Explainer Box */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Security Deposit & Theft Policy
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  100% Refundable
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-medium">
                <p>
                  <strong>Why ₹{(product.depositAmountPaise / 100).toLocaleString('en-IN')} Deposit?</strong> Deposit is held to cover minor wear, accidental accessory loss, or late return delays. It is instantly refunded upon inspection.
                </p>

                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1 text-slate-800">
                  <div className="flex justify-between font-bold">
                    <span>Full Asset Replacement Value:</span>
                    <span className="text-brand-700 font-mono">
                      {formatMoney(product.assetValuePaise)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    High-value equipment requires mandatory Govt ID (Aadhaar/DL) verification before dispatch. Covered under RentIt Rental Agreement.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 pt-1">
                <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <UserCheck className="h-3 w-3 text-brand-600" /> Aadhaar / ID Verified
                </span>
                <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Lock className="h-3 w-3 text-emerald-600" /> Encrypted Escrow
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: Product Information (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Brand & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-lg">
                  {product.brand}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {product.category?.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200 font-extrabold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-slate-500 font-medium">({product.reviewsCount} Customer Reviews)</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Tested
                </span>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {product.short_desc}
            </p>

            {/* PADDING PERIOD & RE-AVAILABILITY COUNTDOWN ALERT BANNER */}
            <div className="p-4 rounded-3xl border transition-all space-y-2">
              {isAllRented ? (
                <div className="bg-amber-50 border-amber-200 text-amber-900 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600 animate-pulse shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        All {product.totalInventory} Units Currently Rented Out
                      </h4>
                      <p className="text-[11px] text-amber-700 font-medium">
                        Next unit available in approx <strong className="font-bold text-amber-900">{product.nextAvailableInHours}h {product.nextAvailableInMins}m</strong>
                      </p>
                    </div>
                  </div>

                  {/* Padding Period Explainer Box */}
                  <div className="p-3 rounded-xl bg-white/80 border border-amber-200 text-[11px] text-slate-700 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                      Includes 1-Hour Turnaround & Padding Period:
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      After customer return, our engineers take <strong>60 minutes</strong> for mandatory multi-point inspection, battery load testing, and sanitization before making it re-available.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <PackageCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        ✓ {product.availableInventory} of {product.totalInventory} Units Available Now
                      </h4>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        In stock & ready for immediate store pickup or site delivery.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top Specs Chips */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Key Highlights
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {product.specs.slice(0, 4).map((spec: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      {spec.name}
                    </span>
                    <span className="font-extrabold text-slate-900 block mt-0.5 truncate">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Rental Calculator Box (3 Cols) */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 rounded-3xl bg-white p-6 border border-slate-200 shadow-xl space-y-5">
              
              {/* Daily Price & Deposit Header */}
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Rental Pricing Rate
                </span>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-brand-600">
                      {formatMoney(dailyRatePaise)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">/ day</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold mt-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  + {formatMoney(product.depositAmountPaise)} Refundable Deposit
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold text-slate-700">Rental Start Date</label>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between hover:bg-white focus-within:bg-white focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/10 transition cursor-pointer">
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="text-xs font-black text-slate-900 truncate">
                        24 May 2025 (Saturday)
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
                  <label className="block text-[11px] font-extrabold text-slate-700">Rental End Date</label>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between hover:bg-white focus-within:bg-white focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/10 transition cursor-pointer">
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="text-xs font-black text-slate-900 truncate">
                        27 May 2025 (Tuesday)
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

              {/* Quantity Stepper */}
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
                    onClick={() => setQuantity((q) => Math.min(product.totalInventory || 6, q + 1))}
                    className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 font-extrabold transition border border-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Rental Charge ({durationDays} Days):</span>
                  <span className="font-extrabold text-slate-900">{formatMoney(rentalFeePaise)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Refundable Deposit:
                  </span>
                  <span className="font-extrabold">{formatMoney(depositPaise)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                  <span className="text-xs font-black text-slate-900">Total Payable:</span>
                  <span className="text-2xl font-black text-brand-600">{formatMoney(totalAmountPaise)}</span>
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full py-3.5 rounded-2xl bg-brand-600 text-xs font-black text-white shadow-xl shadow-brand-600/30 hover:bg-brand-700 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {addingToCart ? 'Adding to Cart...' : 'Proceed to Rent'}
                </button>
              </div>

              {/* Trust Footer */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3 text-brand-600" /> Doorstep Delivery
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-emerald-600" /> Counter Pickup
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TABS: Specifications, Included Accessories, Terms & Reviews */}
        <div className="mt-14 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
            {[
              { id: 'specs', label: 'Technical Specifications' },
              { id: 'included', label: `What's in the Box (${product.includedAccessories.length})` },
              { id: 'terms', label: 'Rental Terms & Protection Policy' },
              { id: 'reviews', label: `Customer Reviews (${product.reviewsCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'specs' && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-base font-black text-slate-900">Detailed Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.specs.map((spec: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex justify-between text-xs">
                      <span className="font-semibold text-slate-500">{spec.name}</span>
                      <span className="font-extrabold text-slate-900 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'included' && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="text-base font-black text-slate-900">What&apos;s Included in the Rental Package</h3>
                <div className="space-y-2">
                  {product.includedAccessories.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4 max-w-3xl text-xs text-slate-600 leading-relaxed font-medium">
                <h3 className="text-base font-black text-slate-900">Rental Terms & Deposit Settlement Policy</h3>
                <ul className="space-y-2.5 list-disc pl-4">
                  <li><strong>Security Deposit Refund:</strong> Released back to original payment account within 24 hours of equipment return and digital inspection.</li>
                  <li><strong>Turnaround & Cleaning Buffer:</strong> Every returned item undergoes 1 hour of cleaning, sanitization, and technical diagnostics before re-availability.</li>
                  <li><strong>Late Returns:</strong> Overdue returns incur proportional daily rental charges plus applicable late penalty fees.</li>
                  <li><strong>Accidental Damage Coverage:</strong> Minor wear & tear is covered. Major damages are deducted from held security deposit according to official repair quotes.</li>
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Verified Customer Reviews</h3>
                    <p className="text-xs text-slate-500 font-medium">Overall Rating: {product.rating} out of 5 stars</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      author: 'Vikram Sethi',
                      date: '12 May 2025',
                      rating: 5,
                      comment: 'Camera was in pristine condition! Batteries were 100% charged and SD card was freshly formatted. Deposit was refunded same day.',
                    },
                    {
                      author: 'Pooja Nair',
                      date: '02 May 2025',
                      rating: 5,
                      comment: 'Smooth pickup process from their Bangalore hub. Staff inspected everything in front of me. Highly recommended for production teams.',
                    },
                  ].map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{rev.author}</span>
                        <span className="text-slate-400">{rev.date}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
