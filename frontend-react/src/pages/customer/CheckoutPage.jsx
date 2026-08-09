import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Truck, Shield, AlertCircle, Package, ArrowLeft, ArrowRight, 
  CheckCircle2, Lock, ShieldCheck, MapPin, User, Phone, CreditCard,
  Building2, Clock
} from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import CheckoutSteps from '../../components/customer/CheckoutSteps';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import { useStore } from '../../context/StoreContext';
import { toast } from '../../components/ui/Toast';
import { getProductImageUrl } from '../../utils/imageUtils';
import * as rentalsApi from '../../api/rentals';


const getItemPrice = (item) => {
  const p = parseFloat(item.product?.price ?? item.price ?? 0);
  return p > 0 ? p : 0;
};

const getItemDeposit = (item) => {
  const d = item.product?.security_deposit ?? item.security_deposit ?? item.securityDeposit ?? 0;
  return parseFloat(d) || 0;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { cart, clearCart, removeItem, updateItem } = useCart();
  const { user } = useAuth();
  const { selectedStore, openStoreModal } = useStore();

  const queryParams = new URLSearchParams(location.search);
  const storeIdParam = queryParams.get('storeId');
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryMethod, setDeliveryMethod] = useState('STORE_PICKUP');
  
  // Address state — blank by default, prefill from user profile if available
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: ''
  });

  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || prev.name,
        phone: user.phone_number || user.phone || prev.phone
      }));
    }
  }, [user]);

  // 3 Streamlined steps
  const steps = [
    { label: 'Review Items' },
    { label: 'Delivery / Pickup' },
    { label: 'Payment & Escrow' }
  ];

const getDays = (item) => {
  const s = item.start_date || item.startDate;
  const e = item.end_date || item.endDate;
  if (!s || !e) return 1;
  const start = new Date(s);
  const end = new Date(e);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

  // Filter items by storeId parameter if present
  const itemsList = (cart?.items || []).filter(item => {
    if (!storeIdParam) return true;
    const itemStoreId = item.store?.id || item.product?.store?.id || item.product?.store_id;
    return itemStoreId ? String(itemStoreId) === String(storeIdParam) : true;
  });

  // Resolve store for checkout
  const checkoutStore = itemsList[0]?.store || selectedStore;
  
  let calcRental = 0;
  let calcDeposit = 0;

  itemsList.forEach(item => {
    const qty = item.quantity || 1;
    const days = getDays(item);
    calcRental += getItemPrice(item) * days * qty;
    calcDeposit += getItemDeposit(item) * qty;
  });

  const calculatedTotal = calcRental + calcDeposit;

  if (itemsList.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)]">Your Cart is Empty</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium max-w-sm mx-auto">Add equipment to your cart before proceeding to checkout.</p>
          <Button size="lg" className="rounded-2xl font-extrabold px-6" onClick={() => navigate('/explore')}>Browse Equipment Fleet</Button>
        </div>
      </PageTransition>
    );
  }

  const handleNext = () => setStep(s => Math.min(s + 1, steps.length));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const saveOrderToStorage = (orderObj) => {
    try {
      const existing = localStorage.getItem('rentos_placed_orders');
      const orders = existing ? JSON.parse(existing) : [];
      const updated = [orderObj, ...orders];
      localStorage.setItem('rentos_placed_orders', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage order save failed', e);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Validate address for delivery orders
    if (deliveryMethod === 'DELIVERY' && (!address.line1 || !address.city || !address.zip)) {
      toast.error('Please fill in your delivery address.');
      setIsProcessing(false);
      return;
    }

    let realOrder = null;

    try {
      const fullAddress = deliveryMethod === 'DELIVERY'
        ? `${address.name}, ${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state}`
        : 'Store Pickup';

      const chosenSlot = itemsList[0]?.pickup_slot || 'MORNING_10_1';

      const res = await rentalsApi.checkoutCart({
        store_id: checkoutStore?.id || selectedStore?.id,
        pickup_slot: chosenSlot,
        delivery_method: deliveryMethod,
        delivery_address: fullAddress,
        delivery_pincode: address.zip || '',
        total_amount: calculatedTotal,
        items: itemsList.map(item => ({
          product_id: item.product?.id || item.product_id || item.id,
          quantity: item.quantity || 1,
          startDate: item.start_date || item.startDate,
          endDate: item.end_date || item.endDate,
        }))
      });
      if (res?.data) {
        realOrder = res.data;
      }
    } catch (err) {
      console.error('Checkout API error:', err);
      toast.error(err?.response?.data?.detail || 'Checkout failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    const orderIdToUse = realOrder?.id || realOrder?.order_number;
    if (!orderIdToUse) {
      toast.error('Order creation failed — no order ID returned.');
      setIsProcessing(false);
      return;
    }

    // Remove only checked out items from cart
    for (const item of itemsList) {
      removeItem(item.id);
    }
    
    // Invalidate product & stock queries so stock decrements globally for all users
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['store-stocks'] });
    queryClient.invalidateQueries({ queryKey: ['my-rentals'] });

    toast.success('Rental order reserved successfully!');
    setIsProcessing(false);
    navigate(`/order-confirmation/${orderIdToUse}`);
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight">Checkout & Reserve</h1>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">Complete your rental order with zero-risk escrow protection.</p>
          </div>
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Cart
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="max-w-2xl mx-auto">
          <CheckoutSteps currentStep={step} steps={steps} />
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (lg:col-span-7): Active Step Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card p-6 sm:p-8 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-3xl shadow-sm">
              
            {/* STEP 1: REVIEW ITEMS */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-black text-[var(--text)]">Review Equipment List</h2>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Adjust quantities or remove items before proceeding.</p>
                  </div>

                  <div className="space-y-3">
                    {itemsList.map(item => {
                      const product = item.product || {};
                      const productName = product.name || item.name || 'Rental Equipment';
                      const categoryName = product.category_name || product.category || 'Equipment';

                      const imageUrl = getProductImageUrl(product, productName);

                      const itemPrice = getItemPrice(item);
                      const itemDeposit = getItemDeposit(item);
                      const qty = item.quantity || 1;
                      const daysCount = getDays(item);
                      const sDate = item.start_date || item.startDate || new Date().toISOString().split('T')[0];
                      const eDate = item.end_date || item.endDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
                      const availQty = product?.available_quantity ?? product?.quantity ?? 99;
                      const lineRental = itemPrice * daysCount * qty;
                      const lineDeposit = itemDeposit * qty;

                      const handleQtyChange = (delta) => {
                        const newQty = qty + delta;
                        if (newQty < 1) {
                          removeItem(item.id);
                        } else if (newQty > availQty) {
                          toast.error(`Only ${availQty} unit(s) available in stock.`);
                        } else {
                          updateItem(item.id, { quantity: newQty });
                        }
                      };

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]">
                          {/* Thumbnail */}
                          <div className="w-16 h-16 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden shrink-0 relative">
                            <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="text-[10px] font-extrabold text-[var(--accent)] uppercase tracking-wider block">{categoryName}</span>
                            <h4 className="font-extrabold text-[var(--text)] text-sm truncate">{productName}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] font-extrabold">
                                {daysCount} Day{daysCount > 1 ? 's' : ''} Rental
                              </span>
                              <span className="text-[var(--text-muted)]">{sDate} → {eDate}</span>
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] font-medium">
                              ₹{itemPrice.toLocaleString('en-IN')}/day × {daysCount}d = <span className="font-extrabold text-[var(--text)]">₹{lineRental.toLocaleString('en-IN')}</span>
                              {itemDeposit > 0 && (
                                <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-extrabold">+ ₹{lineDeposit.toLocaleString('en-IN')} deposit</span>
                              )}
                            </div>
                          </div>

                          {/* Qty controls + Remove */}
                          <div className="flex items-center gap-3 self-center shrink-0">
                            <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(-1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black text-[var(--text)] hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                                title={qty === 1 ? 'Remove item' : 'Decrease quantity'}
                              >
                                {qty === 1 ? '×' : '−'}
                              </button>
                              <span className="min-w-[20px] text-center text-sm font-black text-[var(--accent)]">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(1)}
                                disabled={qty >= availQty}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black text-[var(--text)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                title={qty >= availQty ? `Max ${availQty} available` : 'Increase quantity'}
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                    <Button onClick={handleNext} size="lg" className="rounded-2xl font-extrabold px-8 shadow-sm">
                      Continue to Address <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: DELIVERY ADDRESS */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-black text-[var(--text)] flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[var(--accent)]" /> Selected Pickup Hub
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Collect your equipment from this designated store location.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/40 text-xs text-[var(--text-secondary)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[var(--accent)] flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" /> Selected Store Location
                      </span>
                    </div>

                    <div className="bg-[var(--bg-elevated)] p-3.5 rounded-xl border border-[var(--border)] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[var(--text)] text-sm">
                          {checkoutStore ? checkoutStore.name : 'RentIt Flagship Hub'}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] uppercase">
                          {checkoutStore?.code || 'DEL-CP-01'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--accent)]" />
                        {checkoutStore?.address || 'B-42, Inner Circle, Connaught Place'}, {checkoutStore?.city || 'New Delhi'} – {checkoutStore?.pincode || '110001'}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[var(--accent)]" /> {checkoutStore?.opening_time || '10:00 AM'} – {checkoutStore?.closing_time || '08:00 PM'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--text-muted)]" /> {checkoutStore?.phone || '+91 98112 34567'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] italic">
                      ℹ️ Present your printable Quotation & Pickup QR slip at the store counter for instant collection.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)] flex justify-between">
                    <Button variant="ghost" onClick={handleBack} className="rounded-2xl font-bold">Back</Button>
                    <Button onClick={handleNext} size="lg" className="rounded-2xl font-extrabold px-8 shadow-sm">
                      Continue to Payment <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT & ESCROW */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-black text-[var(--text)]">Select Payment Method</h2>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Your security deposit is locked in escrow until return inspection.</p>
                  </div>

                  {/* Escrow Banner */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 items-start text-xs">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-emerald-700 dark:text-emerald-300">100% Escrow Protection Active</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mt-0.5">
                        Security deposit (₹{calcDeposit.toLocaleString('en-IN')}) is held safely in RentIt Escrow and released automatically upon return inspection.
                      </p>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[var(--accent)] bg-[var(--accent-subtle)] font-bold text-[var(--accent)]'
                          : 'border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mb-2 text-[var(--accent)]" />
                      <span className="text-xs font-extrabold block">Credit / Debit Card</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">Instant escrow hold & rental payment</span>
                    </button>

                    <div
                      className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/60 text-[var(--text-muted)] text-left opacity-65 cursor-not-allowed relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className="w-5 h-5 text-[var(--text-muted)]" />
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Coming Soon
                        </span>
                      </div>
                      <span className="text-xs font-extrabold block text-[var(--text-secondary)]">UPI / Net Banking</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">GPay, PhonePe, Paytm, BHIM</span>
                    </div>
                  </div>

                  {/* Card Simulation Form */}
                  <div className="space-y-3 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-1">Card Number</label>
                      <Input value="4242 •••• •••• 4242" readOnly className="font-mono text-xs font-bold text-[var(--text)] bg-[var(--bg-elevated)] border-[var(--border)]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-1">Expiry</label>
                        <Input value="12/30" readOnly className="font-mono text-xs font-bold text-[var(--text)] bg-[var(--bg-elevated)] border-[var(--border)]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-1">CVV</label>
                        <Input value="•••" readOnly className="font-mono text-xs font-bold text-[var(--text)] bg-[var(--bg-elevated)] border-[var(--border)]" type="password" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)] flex justify-between">
                    <Button variant="ghost" onClick={handleBack} disabled={isProcessing} className="rounded-2xl font-bold">Back</Button>
                    <Button 
                      size="lg" 
                      onClick={handlePayment} 
                      disabled={isProcessing}
                      className="rounded-2xl font-extrabold px-8 shadow-md gap-2"
                    >
                      {isProcessing ? (
                        'Processing Reservation...'
                      ) : (
                        <>
                          <Lock size={16} /> Pay ₹{calculatedTotal.toLocaleString('en-IN')} & Reserve
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column (lg:col-span-5): Sticky Order Summary */}
          <div className="lg:col-span-5">
            <div className="card p-6 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-3xl space-y-6 shadow-md sticky top-24">
              <h3 className="font-black text-lg text-[var(--text)] tracking-tight">Order Summary</h3>

              {/* Financial Itemization */}
              <div className="space-y-3 text-xs text-[var(--text-secondary)] font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                    Rental Charge Subtotal 
                    {itemsList.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[var(--accent-subtle)] text-[var(--accent)]">
                        {getDays(itemsList[0])} Day{getDays(itemsList[0]) > 1 ? 's' : ''}
                      </span>
                    )}
                  </span>
                  <span className="font-extrabold text-[var(--text)]">₹{calcRental.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-y border-[var(--border)]">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Security Deposit</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold">Escrow</span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{calcDeposit.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Fulfillment & Doorstep Delivery</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                </div>
              </div>

              {/* Total Payable Box */}
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-black text-[var(--text)] uppercase tracking-wider">Total Payable</span>
                  <span className="text-2xl font-black text-[var(--accent)]">₹{calculatedTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed">
                  * Includes rental fee + ₹{calcDeposit.toLocaleString('en-IN')} refundable escrow security deposit.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Deposit refunded within 24h of return inspection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span>Verified equipment with serial tracking</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </PageTransition>
  );
};

export default CheckoutPage;
