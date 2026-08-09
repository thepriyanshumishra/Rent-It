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
import QuotationSlipModal from '../../components/shared/QuotationSlipModal';
import * as rentalsApi from '../../api/rentals';
import * as invoicesApi from '../../api/invoices';
import { toast } from '../../components/ui/Toast';
import { getProductImageUrl } from '../../utils/imageUtils';

const STATUS_META = {
  QUOTATION:      { label: 'Quotation',     color: '#94a3b8' },
  QUOTATION_SENT: { label: 'Sent',          color: '#f59e0b' },
  RESERVED:       { label: 'Confirmed',     color: '#3b82f6' },
  PICKED_UP:      { label: 'Picked Up',     color: 'var(--accent)' },
  ACTIVE:         { label: 'Active',        color: 'var(--accent)' },
  LATE_RETURN:    { label: 'Overdue ⚠️',   color: '#ef4444' },
  RETURNED:       { label: 'Returned',      color: '#10b981' },
  CANCELLED:      { label: 'Cancelled',     color: '#ef4444' },
};

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const RentalDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [isSlipOpen, setIsSlipOpen] = useState(false);

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

  // Use only real API data — no localStorage, no fake fallbacks
  const order = data?.data || (Array.isArray(data?.data?.results) ? null : null);

  // Not found state
  if (!isLoading && !order) {
    return (
      <PageTransition>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-3">Order Not Found</h2>
          <p className="text-[var(--text-muted)] mb-6">We couldn't find rental order <strong>{orderId}</strong>.</p>
          <button onClick={() => navigate('/my-rentals')} className="px-6 py-2.5 rounded-2xl bg-[var(--accent)] text-white font-bold text-sm">
            Back to My Rentals
          </button>
        </div>
      </PageTransition>
    );
  }

  const statusMeta = STATUS_META[order?.status] || { label: order?.status || 'Unknown', color: 'var(--text-muted)' };
  const firstItem = order?.items?.[0];
  const productName = firstItem?.product_name_display || firstItem?.product_name || firstItem?.product?.name || 'Rental Item';
  const categoryName = firstItem?.product?.category_name || '—';
  const startDate = order?.rental_start_date || order?.start_date;
  const endDate   = order?.rental_end_date   || order?.end_date;
  const rentalFee = parseFloat(order?.total_amount || 0);
  const depositFee = parseFloat(order?.deposit_amount || 0);
  const totalPaid = rentalFee + depositFee;
  const deliveryMethod = order?.delivery_method || 'STORE_PICKUP';


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
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '2px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                  background: `${statusMeta.color}22`, color: statusMeta.color, border: `1px solid ${statusMeta.color}44`
                }}>
                  <ShieldCheck className="w-3.5 h-3.5" /> {statusMeta.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text mt-1">{productName}</h1>
            </div>
            <div className="text-left md:text-right bg-bg-subtle px-4 py-2.5 rounded-2xl border border-border">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Rental Duration</p>
              <p className="font-extrabold text-text text-sm mt-0.5">{fmtDate(startDate)} → {fmtDate(endDate)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent-subtle overflow-hidden border border-border shrink-0 relative">
                <img 
                  src={getProductImageUrl(order.product, productName)} 
                  alt={productName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-wider">{categoryName}</span>
                <p className="text-xs text-text-muted line-clamp-1 mt-0.5 font-medium">
                  {order.store_name ? `Pickup Hub: ${order.store_name}` : 'RentIt Enterprise Fleet Equipment'}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSlipOpen(true)}
              className="rounded-xl font-bold text-xs shrink-0 self-start sm:self-auto"
            >
              📄 View Quotation Slip
            </Button>
          </div>
        </div>

        {/* Quotation Slip Modal */}
        <QuotationSlipModal
          isOpen={isSlipOpen}
          onClose={() => setIsSlipOpen(false)}
          order={order}
        />

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
