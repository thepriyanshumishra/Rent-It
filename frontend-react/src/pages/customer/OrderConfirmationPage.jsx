import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Download, FileText, Package } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import Button from '../../components/ui/Button';
import PriceDisplay from '../../components/ui/PriceDisplay';
import Skeleton from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';
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

  const handleDownloadInvoice = () => {
    const invNumber = order.order_number || orderId || `RNT-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const custName = order.user?.name || order.address?.name || 'Valued Customer';
    const custPhone = order.address?.phone || '+91 98765 43210';
    const custAddr = typeof order.address === 'string' ? order.address : `${order.address?.line1 || 'B-104 Tech Park'}, ${order.address?.city || 'Noida'}, ${order.address?.state || 'UP'} - ${order.address?.zip || '201309'}`;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocked! Please allow popups to save/download PDF invoice.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>RentIt_Tax_Invoice_${invNumber}.pdf</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: 900; color: #6366f1; letter-spacing: -1px; }
          .logo-sub { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
          .inv-title { font-size: 22px; font-weight: 900; text-align: right; color: #0f172a; }
          .inv-meta { font-size: 12px; color: #475569; text-align: right; margin-top: 4px; }
          .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; border-radius: 99px; margin-top: 8px; }
          
          .grid { display: flex; justify-content: space-between; margin-bottom: 28px; gap: 20px; }
          .box { flex: 1; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
          .box-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px; tracking: 0.5px; }
          .box-content { font-weight: 600; line-height: 1.6; color: #334155; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 12px; }
          th { background: #f1f5f9; color: #475569; text-align: left; padding: 12px; font-weight: 800; text-transform: uppercase; font-size: 11px; border-bottom: 2px solid #cbd5e1; }
          td { padding: 14px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; }
          .text-right { text-align: right; }

          .summary-wrapper { display: flex; justify-content: flex-end; margin-bottom: 28px; }
          .summary-box { width: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 12px; }
          .summary-line { display: flex; justify-content: space-between; padding: 6px 0; font-weight: 600; color: #475569; }
          .summary-grand { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 8px; border-top: 2px solid #6366f1; font-weight: 900; font-size: 18px; color: #6366f1; }

          .escrow-banner { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px; font-size: 11px; color: #1e40af; font-weight: 600; margin-bottom: 28px; line-height: 1.5; }

          .footer { border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 10px; color: #94a3b8; text-align: center; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div className="header">
          <div>
            <div className="logo">RentIt</div>
            <div className="logo-sub">Enterprise Equipment Rental Platform</div>
          </div>
          <div>
            <div className="inv-title">TAX INVOICE</div>
            <div className="inv-meta">Invoice Ref: <strong>${invNumber}</strong></div>
            <div className="inv-meta">Date: ${dateStr}</div>
            <div style="text-align: right;"><span className="badge">✓ PAID & RESERVED</span></div>
          </div>
        </div>

        <div className="grid">
          <div className="box">
            <div className="box-title">Customer & Delivery Details</div>
            <div className="box-content">
              <strong>${custName}</strong><br/>
              Phone: ${custPhone}<br/>
              Address: ${custAddr}
            </div>
          </div>
          <div className="box">
            <div className="box-title">Rental Period & Fulfillment</div>
            <div className="box-content">
              <strong>Express Doorstep Delivery</strong><br/>
              Start Date: ${startDate}<br/>
              Return Deadline: ${endDate} (11:59 PM)
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Equipment Description</th>
              <th>Rental Period</th>
              <th>Fulfillment</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${productName}</strong></td>
              <td>${startDate} to ${endDate}</td>
              <td>Doorstep Pickup & Delivery</td>
              <td className="text-right">₹${rentalFee.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td><strong>Refundable Security Deposit (Escrow Vault)</strong></td>
              <td>100% Refundable on Return</td>
              <td>RentIt Escrow Protected</td>
              <td className="text-right">₹${depositFee.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div className="summary-wrapper">
          <div className="summary-box">
            <div className="summary-line">
              <span>Rental Charge Subtotal</span>
              <span>₹${rentalFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-line">
              <span>Escrow Security Deposit</span>
              <span>₹${depositFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-line">
              <span>Doorstep Delivery & Handling</span>
              <span style="color: #16a34a; font-weight: 800;">FREE</span>
            </div>
            <div className="summary-grand">
              <span>TOTAL PAID</span>
              <span>₹${totalCharged.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="escrow-banner">
          🔒 <strong>RentIt Escrow Guarantee:</strong> Your security deposit of ₹${depositFee.toLocaleString('en-IN')} is safely locked in escrow and will be refunded automatically to your payment method within 24 hours of return inspection.
        </div>

        <div className="footer">
          RentIt Platform Pvt Ltd • GSTIN: 07AAAAA0000A1Z5 • Support: support@rentit.com • +91 1800 123 4567<br/>
          This document serves as an official tax invoice & escrow payment receipt. System generated document.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
    toast.success('Tax Invoice PDF dialog generated! Choose "Save as PDF".');
  };

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
              <span className="text-text-muted font-medium">Delivery Mode</span>
              <span className="font-bold text-text capitalize text-right">Express Doorstep Delivery</span>
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
            onClick={handleDownloadInvoice}
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
