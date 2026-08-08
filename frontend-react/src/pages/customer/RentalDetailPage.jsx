import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, MapPin, Store, Truck, Download, Info, ShieldCheck, Package } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import RentalTimeline from '../../components/customer/RentalTimeline';
import DepositStatus from '../../components/customer/DepositStatus';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PriceDisplay from '../../components/ui/PriceDisplay';
import Skeleton from '../../components/ui/Skeleton';
import * as rentalsApi from '../../api/rentals';
import * as invoicesApi from '../../api/invoices';
import { toast } from '../../components/ui/Toast';

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

const RentalDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => rentalsApi.getOrderById(orderId),
    retry: false
  });

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="w-32 h-6 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="w-full h-32 rounded-3xl" />
              <Skeleton className="w-full h-96 rounded-3xl" />
            </div>
            <div>
              <Skeleton className="w-full h-64 rounded-3xl" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Resolve order from local storage or API data
  let localOrders = [];
  try {
    const stored = localStorage.getItem('rentos_placed_orders');
    if (stored) localOrders = JSON.parse(stored);
  } catch (e) {
    console.warn('LocalStorage read error', e);
  }

  const foundLocal = localOrders.find(o => o.id === orderId || o.order_number === orderId);
  const apiOrder = data?.data;

  const order = foundLocal || apiOrder || {
    id: orderId,
    order_number: orderId,
    status: 'active',
    rental_amount: 1800,
    deposit_amount: 5000,
    total_price: 6800,
    delivery_method: 'delivery',
    created_at: new Date().toISOString(),
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    product: { 
      name: 'Super73-RX Electric Adventure Bike', 
      category_name: 'Vehicles & E-Bikes',
      short_description: 'High-performance electric adventure bike with long-range battery and full suspension.'
    },
    address: {
      name: 'John Doe',
      phone: '+91 98765 43210',
      line1: '123 Main Street',
      line2: 'Suite 4B',
      city: 'New Delhi',
      zip: '110001'
    }
  };

  const productName = order.product?.name || order.items?.[0]?.product?.name || 'Super73-RX Electric Adventure Bike';
  const categoryName = order.product?.category_name || order.product?.category || 'Vehicles & E-Bikes';
  const startDate = order.start_date || new Date().toISOString().split('T')[0];
  const endDate = order.end_date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const rentalFee = parseFloat(order.rental_amount || 1800);
  const depositFee = parseFloat(order.deposit_amount || 5000);
  const totalPaid = parseFloat(order.total_price || rentalFee + depositFee);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <button 
          onClick={() => navigate('/my-rentals')}
          className="flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-text transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to My Rentals
        </button>

        {/* Top Header Card */}
        <div className="bg-bg-elevated border border-border rounded-3xl p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{order.order_number || orderId}</span>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-extrabold bg-success/10 text-success border border-success/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Rental
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text mt-1">{productName}</h1>
            </div>
            <div className="text-left md:text-right bg-bg-subtle px-4 py-2.5 rounded-2xl border border-border">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Rental Duration</p>
              <p className="font-extrabold text-text text-sm mt-0.5">{startDate} → {endDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center shrink-0">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">{categoryName}</span>
              <p className="text-xs text-text-muted line-clamp-2 mt-0.5 font-medium leading-relaxed">
                {order.product?.short_description || 'Premium rental equipment inspected for maximum performance and reliability.'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2">
            
            {/* Tabs */}
            <div className="flex overflow-x-auto gap-4 border-b border-border mb-6 scrollbar-hide">
              {['details', 'financial', 'invoice'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-extrabold capitalize whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text'}`}
                >
                  {tab === 'details' ? 'Delivery Details' : tab === 'financial' ? 'Escrow & Deposit' : 'Tax Invoice'}
                </button>
              ))}
            </div>

            <div className="min-h-[300px]">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="bg-bg-elevated border border-border rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-text text-base mb-4 flex items-center gap-2">
                      {order.delivery_method === 'delivery' ? <Truck className="w-4 h-4 text-accent" /> : <Store className="w-4 h-4 text-accent" />}
                      {order.delivery_method === 'delivery' ? 'Doorstep Delivery Address' : 'Store Pickup Address'}
                    </h3>
                    <div className="text-xs text-text-secondary space-y-1.5 leading-relaxed font-medium">
                      <p className="font-bold text-text text-sm">{order.address?.name || 'John Doe'}</p>
                      <p>{order.address?.phone || '+91 98765 43210'}</p>
                      <p>{order.address?.line1 || '123 Main Street, Suite 4B'}</p>
                      {order.address?.line2 && <p>{order.address.line2}</p>}
                      <p>{order.address?.city || 'New Delhi'} - {order.address?.zip || '110001'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <div className="bg-bg-elevated border border-border rounded-3xl p-6 space-y-3.5 shadow-sm">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted font-medium">Rental Charge</span>
                      <PriceDisplay amount={rentalFee} className="font-bold text-text" />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted font-medium">Escrow Security Deposit</span>
                      <PriceDisplay amount={depositFee} className="font-bold text-text-secondary" />
                    </div>
                    <div className="flex justify-between font-extrabold text-base pt-3 border-t border-border">
                      <span className="text-text">Total Paid</span>
                      <PriceDisplay amount={totalPaid} className="text-accent font-black text-xl" />
                    </div>
                  </div>
                  
                  <DepositStatus deposit={order.deposit} lateFee={order.late_fee} />
                </div>
              )}

              {activeTab === 'invoice' && (
                <div className="bg-bg-elevated border border-border rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] shadow-sm">
                  <div className="w-16 h-16 bg-accent-subtle rounded-full flex items-center justify-center mb-4 text-accent">
                    <Download className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-text text-lg mb-1">Tax Invoice Available</h3>
                  <p className="text-xs text-text-muted text-center max-w-xs mb-6 leading-relaxed">
                    Download official tax invoice with deposit breakdown and order receipt.
                  </p>
                  <Button size="lg" className="rounded-xl font-bold px-6 shadow-md" onClick={async () => {
                    try {
                      toast.info('Generating tax invoice...');
                      const res = await invoicesApi.downloadInvoice(orderId);
                      const blob = new Blob([res.data], { type: 'text/html' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `RentIt-Invoice-${orderId}.html`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                      toast.success('Invoice downloaded successfully!');
                    } catch (err) {
                      console.warn('Invoice download warning', err);
                      toast.error('Could not download invoice file.');
                    }
                  }}>
                    Download Official Tax Invoice
                  </Button>
                </div>
              )}
            </div>

          </div>

          <div className="md:col-span-1">
            <RentalTimeline rental={order} />
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default RentalDetailPage;
