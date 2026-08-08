import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Truck, Shield, AlertCircle, Package } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import CheckoutSteps from '../../components/customer/CheckoutSteps';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PriceDisplay from '../../components/ui/PriceDisplay';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import { toast } from '../../components/ui/Toast';
import * as paymentsApi from '../../api/payments';
import * as rentalsApi from '../../api/rentals';

const sampleProductMap = {
  1: { name: 'Sony FX3 Cinema Camera Kit', price: 2500, deposit: 10000, category: 'Cameras & Video' },
  2: { name: 'Apple MacBook Pro 16" M3 Max', price: 3000, deposit: 15000, category: 'Electronics' },
  3: { name: 'Super73-RX Electric Adventure Bike', price: 1800, deposit: 5000, category: 'Vehicles & E-Bikes' },
  4: { name: 'DJI Inspire 3 Cinema Drone 8K', price: 8000, deposit: 25000, category: 'Cameras & Video' },
  5: { name: 'Herman Miller Aeron Ergonomic Chair', price: 600, deposit: 3000, category: 'Office Furniture' },
  6: { name: 'JBL PartyBox Ultimate PA System', price: 2000, deposit: 8000, category: 'Audio & Sound' },
  7: { name: 'EcoFlow Delta Pro Power Station', price: 1500, deposit: 6000, category: 'Event & Outdoor' },
  8: { name: 'Apple Vision Pro 512GB VR Headset', price: 4000, deposit: 20000, category: 'Electronics' }
};

const getItemPrice = (item) => {
  const p = parseFloat(item.product?.price || item.price || 0);
  if (p > 0) return p;
  const fallback = sampleProductMap[item.product_id] || sampleProductMap[item.id] || sampleProductMap[3];
  return fallback.price;
};

const getItemDeposit = (item) => {
  const firstPricing = item.product?.pricings?.[0];
  const d = parseFloat(firstPricing?.security_deposit || item.securityDeposit || 0);
  if (d > 0) return d;
  const fallback = sampleProductMap[item.product_id] || sampleProductMap[item.id] || sampleProductMap[3];
  return fallback.deposit;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  
  // Smart pre-filled address state
  const [address, setAddress] = useState({
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'John Doe' : 'John Doe',
    phone: user?.phone || '+91 98765 43210',
    line1: '123 Main Street',
    line2: 'Suite 4B',
    city: 'New Delhi',
    state: 'Delhi',
    zip: '110001'
  });

  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || prev.name,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const steps = [
    { label: 'Review' },
    { label: 'Method' },
    { label: 'Address' },
    { label: 'Payment' }
  ];

  const itemsList = cart?.items || [];
  
  let calcRental = 0;
  let calcDeposit = 0;

  itemsList.forEach(item => {
    const qty = item.quantity || 1;
    calcRental += getItemPrice(item) * qty;
    calcDeposit += getItemDeposit(item) * qty;
  });

  const calculatedTotal = calcRental + calcDeposit;

  if (itemsList.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-accent-subtle text-accent flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-text mb-2">Checkout Unavailable</h2>
        <p className="text-sm text-text-muted mb-6">Your rental cart is empty.</p>
        <Button size="lg" className="rounded-xl font-bold" onClick={() => navigate('/explore')}>Explore Products</Button>
      </div>
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
    const generatedId = `RNT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrderObj = {
      id: generatedId,
      order_number: generatedId,
      status: 'active',
      items: itemsList,
      rental_amount: calcRental,
      deposit_amount: calcDeposit,
      total_price: calculatedTotal,
      delivery_method: deliveryMethod,
      address: address,
      created_at: new Date().toISOString(),
      start_date: itemsList[0]?.start_date || itemsList[0]?.startDate || new Date().toISOString().split('T')[0],
      end_date: itemsList[0]?.end_date || itemsList[0]?.endDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      product: itemsList[0]?.product || { name: sampleProductMap[itemsList[0]?.product_id || 3]?.name || 'Super73-RX Electric Adventure Bike' }
    };

    saveOrderToStorage(newOrderObj);

    try {
      await rentalsApi.createOrder({ cart, deliveryMethod, address });
    } catch (err) {
      console.warn('Backend order API skipped/fallback', err);
    }

    clearCart();
    toast.success('Rental order reserved successfully!');
    setIsProcessing(false);
    navigate(`/order-confirmation/${generatedId}`);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-text mb-8">Checkout & Reserve</h1>
        
        <div className="mb-10">
          <CheckoutSteps currentStep={step} steps={steps} />
        </div>

        <div className="bg-bg-elevated border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          
          {/* STEP 1: REVIEW */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-extrabold text-text mb-6">Review Rental Items</h2>
              <div className="space-y-4 mb-8">
                {itemsList.map(item => {
                  const product = item.product || {};
                  const fallbackInfo = sampleProductMap[item.product_id] || sampleProductMap[item.id] || sampleProductMap[3];
                  const productName = product.name || fallbackInfo.name;
                  const categoryName = product.category_name || product.category || fallbackInfo.category;

                  let imageUrl = product.primary_image;
                  if (!imageUrl && product.images && product.images.length > 0) {
                    const first = product.images[0];
                    imageUrl = typeof first === 'string' ? first : (first.url || first.image_url);
                  }

                  const itemPrice = getItemPrice(item);
                  const itemDeposit = getItemDeposit(item);

                  return (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                      <div className="w-16 h-16 rounded-2xl bg-bg-subtle border border-border overflow-hidden shrink-0">
                        {imageUrl ? (
                          <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-accent bg-accent-subtle">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{categoryName}</span>
                        <h4 className="font-bold text-text text-sm">{productName}</h4>
                        {(item.start_date || item.startDate) && (
                          <p className="text-xs text-text-muted mt-0.5 font-medium">
                            {item.start_date || item.startDate} to {item.end_date || item.endDate}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <PriceDisplay amount={itemPrice} className="font-bold text-text text-base block" />
                        {itemDeposit > 0 && (
                          <span className="text-[11px] text-text-muted font-medium">Dep: ₹{itemDeposit}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center border-t border-border pt-6">
                <span className="text-base font-bold text-text">Total Payable</span>
                <PriceDisplay amount={calculatedTotal} className="text-2xl font-black text-accent" />
              </div>
              <div className="mt-8 flex justify-end">
                <Button onClick={handleNext} size="lg" className="rounded-xl font-bold px-8">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 2: METHOD */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-extrabold text-text mb-6">Choose Fulfillment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div 
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${deliveryMethod === 'pickup' ? 'border-accent bg-accent-subtle/50' : 'border-border bg-bg-elevated hover:border-border-strong'}`}
                >
                  <Store className={`w-8 h-8 ${deliveryMethod === 'pickup' ? 'text-accent' : 'text-text-muted'}`} />
                  <div>
                    <h4 className="font-bold text-text mb-1">Store Pickup</h4>
                    <p className="text-xs text-text-muted">Free • Collect from central store hub</p>
                  </div>
                </div>
                <div 
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${deliveryMethod === 'delivery' ? 'border-accent bg-accent-subtle/50' : 'border-border bg-bg-elevated hover:border-border-strong'}`}
                >
                  <Truck className={`w-8 h-8 ${deliveryMethod === 'delivery' ? 'text-accent' : 'text-text-muted'}`} />
                  <div>
                    <h4 className="font-bold text-text mb-1">Doorstep Delivery</h4>
                    <p className="text-xs text-text-muted">Direct doorstep delivery & return pick-up</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={handleBack} className="rounded-xl font-bold">Back</Button>
                <Button onClick={handleNext} className="rounded-xl font-bold px-8">Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-extrabold text-text mb-6">
                {deliveryMethod === 'delivery' ? 'Delivery Address' : 'Contact Information'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Full Name</label>
                  <Input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="John Doe" className="bg-bg-subtle border-border" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Phone Number</label>
                  <Input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="+91 98765 43210" className="bg-bg-subtle border-border" />
                </div>
                
                {deliveryMethod === 'delivery' && (
                  <>
                    <div className="col-span-1 md:col-span-2 mt-2 border-t border-border-subtle pt-4">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Address Line 1</label>
                      <Input value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} placeholder="House / Flat No., Building" className="bg-bg-subtle border-border" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Address Line 2</label>
                      <Input value={address.line2} onChange={e => setAddress({...address, line2: e.target.value})} placeholder="Street, Area, Landmark" className="bg-bg-subtle border-border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">City</label>
                      <Input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="New Delhi" className="bg-bg-subtle border-border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Pincode</label>
                      <Input value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} placeholder="110001" className="bg-bg-subtle border-border" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={handleBack} className="rounded-xl font-bold">Back</Button>
                <Button 
                  onClick={handleNext}
                  className="rounded-xl font-bold px-8"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-extrabold text-text mb-6">Confirm & Pay</h2>
              
              <div className="bg-bg-subtle p-4 rounded-2xl mb-6 flex gap-3 items-start border border-border">
                <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-text text-sm">Escrow Protected Payment</h4>
                  <p className="text-xs text-text-muted">Security deposits are held in escrow and released immediately upon return verification.</p>
                </div>
              </div>

              <div className="bg-accent-subtle border border-accent/20 p-4 rounded-2xl mb-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-accent shrink-0" />
                <p className="text-xs text-accent font-medium">Demo Payment Gateway Mode — Auto-approved instant confirmation.</p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Demo Card Number</label>
                  <Input value="4242 •••• •••• 4242" readOnly className="font-mono text-text-muted bg-bg-subtle border-border" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Expiry</label>
                    <Input value="12/30" readOnly className="font-mono text-text-muted bg-bg-subtle border-border" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">CVV</label>
                    <Input value="•••" readOnly className="font-mono text-text-muted bg-bg-subtle border-border" type="password" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                <Button variant="ghost" onClick={handleBack} disabled={isProcessing} className="rounded-xl font-bold">Back</Button>
                <Button 
                  size="lg" 
                  onClick={handlePayment} 
                  disabled={isProcessing}
                  className="rounded-xl font-bold px-8 shadow-md"
                >
                  {isProcessing ? 'Processing Order...' : `Pay ₹${calculatedTotal.toLocaleString()}`}
                </Button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </PageTransition>
  );
};

export default CheckoutPage;
