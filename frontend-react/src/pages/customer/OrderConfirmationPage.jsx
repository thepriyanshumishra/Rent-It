import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Download, FileText, Package } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import Button from '../../components/ui/Button';
import PriceDisplay from '../../components/ui/PriceDisplay';
import Skeleton from '../../components/ui/Skeleton';
import * as rentalsApi from '../../api/rentals';
import * as invoicesApi from '../../api/invoices';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

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
    delivery_method: 'Doorstep Delivery',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    product: { name: 'Super73-RX Electric Adventure Bike' }
  };

  const productName = order.product?.name || order.items?.[0]?.product?.name || 'Super73-RX Electric Adventure Bike';
  const startDate = order.start_date || new Date().toISOString().split('T')[0];
  const endDate = order.end_date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const rentalFee = parseFloat(order.rental_amount || 1800);
  const depositFee = parseFloat(order.deposit_amount || 5000);
  const totalCharged = parseFloat(order.total_price || rentalFee + depositFee);

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col items-center">
        
        {/* Success Animated Badge */}
        <motion.div 
          className="w-20 h-20 bg-success/15 text-success rounded-full flex items-center justify-center mb-6 shadow-sm border border-success/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Check className="w-10 h-10" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-black text-text mb-2 text-center">Rental Booking Confirmed!</h1>
        <p className="text-sm text-text-muted text-center max-w-md mb-10 leading-relaxed font-medium">
          Your rental order has been reserved successfully. You will receive real-time SMS & email notifications for dispatch and delivery tracking.
        </p>

        {/* Order Details Card */}
        <div className="w-full bg-bg-elevated border border-border rounded-3xl p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
            <div>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Booking Reference</span>
              <span className="font-mono font-extrabold text-accent text-base">{order.order_number || orderId}</span>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
              Active / Reserved
            </span>
          </div>

          <div className="space-y-3.5 mb-8 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-medium">Product Rented</span>
              <span className="font-extrabold text-text text-right">{productName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-medium">Rental Period</span>
              <span className="font-bold text-text text-right">{startDate} to {endDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-medium">Fulfillment Choice</span>
              <span className="font-bold text-text capitalize text-right">{order.delivery_method || 'Doorstep Delivery'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-medium">Return Deadline</span>
              <span className="font-bold text-warning text-right">{endDate} 11:59 PM</span>
            </div>
          </div>

          <div className="bg-bg-subtle p-4 rounded-2xl space-y-3 mb-2 border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted font-medium">Rental Charge</span>
              <PriceDisplay amount={rentalFee} className="font-bold text-text" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted font-medium">Escrow Deposit</span>
              <PriceDisplay amount={depositFee} className="font-bold text-text-secondary" />
            </div>
            <div className="flex justify-between font-extrabold text-base pt-3 border-t border-border">
              <span className="text-text">Total Charged</span>
              <PriceDisplay amount={totalCharged} className="text-accent font-black text-xl" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button 
            variant="secondary" 
            className="rounded-xl font-bold flex items-center justify-center gap-2"
            onClick={() => invoicesApi.downloadInvoice(orderId)}
          >
            <Download className="w-4 h-4" /> Download Invoice
          </Button>
          <Button 
            onClick={() => navigate('/my-rentals')}
            className="rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <FileText className="w-4 h-4" /> View My Rentals
          </Button>
          <Button 
            variant="ghost" 
            className="rounded-xl font-bold"
            onClick={() => navigate('/explore')}
          >
            Browse More Gear
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default OrderConfirmationPage;
