import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Check, Download, FileText, Package, Building2, MapPin, 
  Clock, Phone, ShieldCheck, QrCode, ArrowRight, Home 
} from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import QuotationSlipModal from '../../components/shared/QuotationSlipModal';
import * as rentalsApi from '../../api/rentals';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => rentalsApi.getOrderById(orderId),
    retry: false
  });

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center">
          <Skeleton className="w-24 h-24 rounded-full mb-8" />
          <Skeleton className="w-64 h-8 mb-4" />
          <Skeleton className="w-96 h-4 mb-12" />
          <Skeleton className="w-full h-64 rounded-3xl" />
        </div>
      </PageTransition>
    );
  }

  const order = data?.data;

  if (!order) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
          <h2 className="text-2xl font-bold text-[var(--text)]">Order Details Unavailable</h2>
          <p className="text-xs text-[var(--text-muted)]">We couldn't retrieve the live details for order #{orderId}.</p>
          <Button onClick={() => navigate('/my-rentals')} className="rounded-2xl">Go to My Rentals</Button>
        </div>
      </PageTransition>
    );
  }

  const firstItem = order.items?.[0];
  const productName = firstItem?.product_name_display || firstItem?.product_name || firstItem?.product?.name || 'Rental Equipment';
  const startDate = order.rental_start_date || order.start_date;
  const endDate = order.rental_end_date || order.end_date;
  const rentalFee = parseFloat(order.total_amount || 0);
  const depositFee = parseFloat(order.deposit_amount || 0);
  const totalCharged = rentalFee + depositFee;

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        
        {/* Success Icon & Heading */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10"
          >
            <Check className="w-10 h-10 stroke-[3]" />
          </motion.div>
          <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">
            Rental Order Reserved!
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium max-w-md mx-auto">
            Order <span className="font-extrabold text-[var(--accent)]">{order.order_number || `#${order.id}`}</span> has been confirmed. Your equipment is locked & prepared for on-store collection.
          </p>
        </div>

        {/* Store Counter Pickup Verification Box */}
        <div className="p-6 rounded-3xl bg-[var(--accent-subtle)] border-2 border-[var(--accent)]/30 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest block">
                Store Pickup Verification Code
              </span>
              <p className="text-3xl font-black text-[var(--accent)] tracking-wider font-mono mt-1">
                {order.pickup_code || 'PKP-8472'}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
                Present this code or your Quotation Slip at the store counter.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setIsSlipOpen(true);
                  setTimeout(() => {
                    window.print();
                  }, 300);
                }}
                className="rounded-2xl font-black text-xs px-5 py-3 shadow-md shadow-[var(--accent)]/20"
              >
                <Download className="w-4 h-4 mr-2" /> Download Quotation
              </Button>
            </div>
          </div>

          {/* Store Location Card */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[var(--text)] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[var(--accent)]" /> {order.store_name || 'RentIt Connaught Place Hub'}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] uppercase">
                {order.store_code || 'DEL-CP-01'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {order.store_address || 'B-42, Inner Circle, Connaught Place, New Delhi – 110001'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Contact: {order.store_phone || '+91 98112 34567'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details Summary Card */}
        <div className="card p-6 sm:p-8 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">Equipment Rented</span>
              <h2 className="text-lg font-black text-[var(--text)] mt-0.5">{productName}</h2>
            </div>
            <span className="text-xs font-extrabold text-[var(--accent)] bg-[var(--accent-subtle)] px-3 py-1 rounded-full border border-[var(--accent)]/30">
              Reserved
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Rental Start</span>
              <span className="font-extrabold text-[var(--text)]">{fmtDate(startDate)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Return Due</span>
              <span className="font-extrabold text-[var(--text)]">{fmtDate(endDate)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Security Deposit</span>
              <span className="font-extrabold text-amber-500">₹{depositFee.toLocaleString('en-IN')} (Escrow)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center text-sm font-black text-[var(--text)]">
            <span>Total Paid (Rental + Deposit)</span>
            <span className="text-xl text-[var(--accent)]">₹{totalCharged.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={() => navigate('/my-rentals')}
            className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4 text-[var(--accent)]" /> Go to My Rentals
          </button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/explore')}
            className="w-full sm:w-auto rounded-2xl font-extrabold text-xs px-6 py-2.5"
          >
            Browse More Equipment <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Quotation Slip Printable Modal */}
        <QuotationSlipModal
          isOpen={isSlipOpen}
          onClose={() => setIsSlipOpen(false)}
          order={order}
        />
      </div>
    </PageTransition>
  );
};

export default OrderConfirmationPage;
