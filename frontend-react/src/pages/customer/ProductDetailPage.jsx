import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Star, ChevronRight, Truck, ShoppingCart, ShieldCheck, Clock, Shield, 
  Lock, Calendar, CheckCircle2, UserCheck, ArrowLeft
} from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import ProductGallery from '../../components/customer/ProductGallery';
import RentalDatePicker from '../../components/customer/RentalDatePicker';
import ProductCard from '../../components/customer/ProductCard';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import * as productsApi from '../../api/products';
import useCart from '../../hooks/useCart';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndStr = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [rentQuantity, setRentQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [rentedInfo, setRentedInfo] = useState(null);
  const [nextAvailableDate, setNextAvailableDate] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProduct(slug)
  });

  const { data: relatedData } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => productsApi.getFeaturedProducts()
  });

  const product = data?.data;

  const maxQuantity = Math.max(1, product?.available_quantity ?? product?.quantity ?? 1);

  const rawRelated = Array.isArray(relatedData?.data)
    ? relatedData.data
    : (Array.isArray(relatedData?.data?.results)
      ? relatedData.data.results
      : (Array.isArray(relatedData) ? relatedData : []));

  const relatedProducts = rawRelated.filter(p => p.id !== product?.id).slice(0, 3);

  // Dynamic availability check
  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem('rentos_placed_orders');
      if (stored) {
        const orders = JSON.parse(stored);
        const activeOrder = orders.find(o => {
          const pName = o.product?.name || o.items?.[0]?.product?.name || '';
          return (pName && product.name && (
            pName.toLowerCase().includes(product.name.toLowerCase()) || 
            product.name.toLowerCase().includes(pName.toLowerCase())
          )) || o.product_id === product.id;
        });

        if (activeOrder && activeOrder.end_date) {
          const endMs = new Date(activeOrder.end_date).getTime();
          const nowMs = Date.now();
          const diffMs = endMs - nowMs;

          if (diffMs > 0) {
            const hours = Math.floor(diffMs / 3600000);
            const mins = Math.floor((diffMs % 3600000) / 60000);
            setRentedInfo({ hours, mins });
            setNextAvailableDate(activeOrder.end_date);
          } else {
            setRentedInfo(null);
            setNextAvailableDate(null);
          }
        } else {
          setRentedInfo(null);
          setNextAvailableDate(null);
        }
      }
    } catch (e) {
      console.warn('Stock status check warning', e);
    }
  }, [product]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7"><Skeleton className="w-full aspect-[4/3] rounded-3xl" /></div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-64" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isError || !product) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <EmptyState title="Product Not Found" description="The rental product you are looking for does not exist or has been unlisted." />
        </div>
      </PageTransition>
    );
  }

  const categoryName = product.category_name || product.category?.name || product.category || 'Equipment';

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.primary_image ? [product.primary_image] : (product.image_url ? [product.image_url] : []));

  const handleAddToCartOnly = () => {
    const sDate = startDate || todayStr;
    const eDate = endDate || defaultEndStr;
    
    addToCart({
      product,
      startDate: sDate,
      endDate: eDate,
      pricing: { price: product.price, period_name: 'Daily Rate' },
      deliveryMethod: 'delivery',
      quantity: rentQuantity
    });
    toast.success(`Added ${rentQuantity} unit(s) of ${product.name} to rental cart!`);
  };

  const handleRentNow = () => {
    const sDate = startDate || todayStr;
    const eDate = endDate || defaultEndStr;
    
    addToCart({
      product,
      startDate: sDate,
      endDate: eDate,
      pricing: { price: product.price, period_name: 'Daily Rate' },
      deliveryMethod: 'delivery',
      quantity: rentQuantity
    });
    toast.success(`Proceeding to instant rental checkout!`);
    navigate('/checkout');
  };

  const handlePreReserveNextSlot = () => {
    const futureStart = nextAvailableDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const futureEnd = new Date(new Date(futureStart).getTime() + 3 * 86400000).toISOString().split('T')[0];

    addToCart({
      product,
      startDate: futureStart,
      endDate: futureEnd,
      pricing: { price: product.price, period_name: 'Pre-Reserve Slot' },
      deliveryMethod: 'delivery',
      quantity: 1
    });
    toast.success(`Pre-reserved upcoming slot starting ${futureStart}!`);
    navigate('/cart');
  };

  const specsList = product.specifications && typeof product.specifications === 'object'
    ? Object.entries(product.specifications)
    : [];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
            <Link to="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/explore" className="hover:text-[var(--text)] transition-colors">Explore</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--accent)] font-extrabold capitalize">{categoryName}</span>
          </nav>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        {/* Top Hero Grid: Gallery + Details Deck (Left) & Sticky Reservation Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column (lg:col-span-7): Gallery, Partner Info & Details Tabs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Gallery */}
            <ProductGallery images={galleryImages} productName={product.name} />

            {/* Verification & Partner Bar */}
            <div className="card p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center font-black text-sm shrink-0">
                  {(product.renter?.first_name || product.renter_name || 'R')[0].toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-extrabold text-[var(--text)] flex items-center gap-1">
                    {product.renter?.full_name || product.renter_name || 'HQ Verified Fleet Owner'}
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-medium block">
                    60% Partner Renter • Inspected by RentIt HQ
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verified Listing
              </span>
            </div>

            {/* Tabbed Content Deck (Directly under Gallery) */}
            <div className="space-y-4 pt-2">
              
              {/* Tab Navigation */}
              <div className="flex border-b border-[var(--border)] space-x-6 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: 'Overview & Details' },
                  { id: 'specs', label: `Specifications ${specsList.length > 0 ? `(${specsList.length})` : ''}` },
                  { id: 'included', label: 'Included Items' },
                  { id: 'terms', label: 'Rental Terms' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Panels */}
              <div className="card p-6 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-3xl min-h-[180px]">
                
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <h3 className="text-sm font-black text-[var(--text)]">Equipment Description</h3>
                    <p className="whitespace-pre-line font-medium text-xs text-[var(--text)] leading-relaxed">
                      {product.description || product.short_description || 'No detailed description provided for this item.'}
                    </p>

                    {product.included_items && (
                      <div className="mt-4 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1.5">
                        <span className="text-xs font-extrabold text-[var(--text)] block uppercase tracking-wider">Included In Box</span>
                        <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{product.included_items}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Specs Tab */}
                {activeTab === 'specs' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-[var(--text)]">Technical Specifications</h3>
                    {specsList.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] italic font-medium">Standard manufacturer specs apply for this equipment model.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {specsList.map(([key, val]) => (
                          <div key={key} className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex justify-between items-center text-xs">
                            <span className="text-[var(--text-muted)] font-extrabold uppercase tracking-wider">{key}</span>
                            <span className="font-bold text-[var(--text)]">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Included Items Tab */}
                {activeTab === 'included' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-[var(--text)]">Package Accessories</h3>
                    {product.included_items ? (
                      <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-medium text-[var(--text)] leading-relaxed">
                        {product.included_items}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] italic font-medium">Includes standard body, battery, and charging accessories.</p>
                    )}
                  </div>
                )}

                {/* Rental Terms Tab */}
                {activeTab === 'terms' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-[var(--text)]">Rental Policy & Verification Rules</h3>
                    <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium leading-relaxed space-y-2">
                      <p>{product.rental_terms || 'Standard RentIt policy applies: Government ID verification is required upon pickup or delivery. Security deposits are held safely in escrow and refunded within 24 hours of return inspection.'}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Right Column (lg:col-span-5): Sticky Reservation Card */}
          <div className="lg:col-span-5">
            <div className="card p-6 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-3xl space-y-6 shadow-md sticky top-24">
              
              {/* Product Title & Stock Status */}
              <div className="space-y-2 border-b border-[var(--border)] pb-4">
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-2xl font-black text-[var(--text)] leading-tight tracking-tight">
                    {product.name}
                  </h1>
                  {rentedInfo ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/30 shrink-0">
                      <Clock className="w-3.5 h-3.5 animate-pulse" /> Out on Rental
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" /> In Stock ({product.available_quantity ?? product.quantity ?? 1} Available)
                    </span>
                  )}
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{product.rating || '4.9'}</span>
                  </div>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span className="text-[var(--text-secondary)]">{product.review_count || 14} Verified Reviews</span>
                </div>

                <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed pt-1">
                  {product.short_description || product.description?.substring(0, 120)}
                </p>
              </div>

              {/* Price Callout */}
              <div className="flex items-baseline justify-between bg-[var(--bg-subtle)] p-4 rounded-2xl border border-[var(--border)]">
                <div>
                  <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">Daily Rental Rate</span>
                  <span className="text-2xl font-black text-[var(--accent)]">₹{Number(product.price).toLocaleString('en-IN')}<span className="text-xs font-bold text-[var(--text-muted)]"> / day</span></span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                <div>
                  <span className="text-xs font-extrabold text-[var(--text)] block">Rental Quantity</span>
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">Units ({maxQuantity} in stock)</span>
                </div>
                <div className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-1 shadow-xs">
                  <button 
                    type="button"
                    onClick={() => setRentQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--accent-subtle)] text-[var(--text)] font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-base font-black text-[var(--accent)] min-w-[24px] text-center">{rentQuantity}</span>
                  <button 
                    type="button"
                    onClick={() => setRentQuantity(q => Math.min(maxQuantity, q + 1))}
                    className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--accent-subtle)] text-[var(--text)] font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rental Date Picker & Duration Presets */}
              <RentalDatePicker 
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                basePrice={product.price}
                securityDeposit={product.security_deposit}
                quantity={rentQuantity}
                isRented={!!rentedInfo}
                rentedInfo={rentedInfo}
              />

              {/* CTA Action Buttons (Amazon/Flipkart Style: Add to Cart + Rent Now) */}
              {rentedInfo ? (
                <div className="space-y-2">
                  <Button 
                    disabled
                    className="w-full justify-center py-3.5 text-sm font-extrabold rounded-2xl opacity-60 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 mr-2" /> Currently Rented ({rentedInfo.hours}h {rentedInfo.mins}m remaining)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePreReserveNextSlot}
                    className="w-full justify-center py-3 text-xs font-extrabold rounded-2xl text-[var(--accent)] border-[var(--accent)]/40 hover:bg-[var(--accent-subtle)]"
                  >
                    <Calendar className="w-4 h-4 mr-2" /> Pre-Reserve Next Available Slot
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleAddToCartOnly}
                    className="w-full justify-center py-3.5 text-sm font-black rounded-2xl gap-2 border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-subtle)]"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="primary"
                    onClick={handleRentNow}
                    className="w-full justify-center py-3.5 text-sm font-black shadow-lg rounded-2xl gap-2 bg-[var(--accent)] text-white hover:opacity-95"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Rent Now
                  </Button>
                </div>
              )}

              {/* Trust Features Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] font-medium">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" /> 100% Escrow Protected
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" /> Doorstep Pickup & Return
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" /> Instant Order Confirmation
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> HQ Quality Verified
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Related Equipment Suggestions */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[var(--text)] tracking-tight">Similar Equipment You Might Need</h3>
                <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Explore additional gear in the {categoryName} fleet.</p>
              </div>
              <Link to="/explore" className="text-xs font-extrabold text-[var(--accent)] hover:underline flex items-center gap-1">
                View All Equipment <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map(relProduct => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default ProductDetailPage;
