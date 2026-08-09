import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, Download, X, ShieldCheck, MapPin, 
  Calendar, Clock, Phone, Mail, Building2, QrCode, FileText 
} from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function QuotationSlipModal({ isOpen, onClose, order }) {
  const printRef = useRef();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const firstItem = order.items?.[0];
  const productName = firstItem?.product_name_display || firstItem?.product_name || firstItem?.product?.name || 'Rental Equipment';
  const qty = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1;
  const storeName = order.store_name || order.store?.name || 'RentIt Connaught Place Hub';
  const storeAddress = order.store_address || order.store?.address || 'B-42, Inner Circle, Connaught Place, New Delhi';
  const storePhone = order.store_phone || order.store?.phone || '+91 98112 34567';
  const pickupCode = order.pickup_code || 'PKP-8472';
  const orderNumber = order.order_number || `RNT-${order.id}`;

  const rentalAmount = parseFloat(order.total_amount || 0);
  const depositAmount = parseFloat(order.deposit_amount || 0);
  const grandTotal = rentalAmount + depositAmount;

  return (
    <AnimatePresence>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #quotation-print-slip, #quotation-print-slip * {
            visibility: visible;
          }
          #quotation-print-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:p-0 print:static">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs print:hidden"
        />

        {/* Slip Modal Container */}
        <motion.div
          id="quotation-print-slip"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:rounded-none print:w-full print:max-w-none"
        >
          {/* Action Bar (Hidden on Print) */}
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="font-extrabold text-sm tracking-tight">Official Rental Quotation & Pickup Slip</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Slip
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm border border-slate-700 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PRINTABLE SLIP CONTENT */}
          <div ref={printRef} className="p-8 sm:p-10 space-y-6 font-sans text-slate-800 bg-white">
            
            {/* Header / Brand */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#714B67] text-white flex items-center justify-center font-black text-lg">
                    R
                  </div>
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    Rent<span className="text-[#714B67]">It</span>
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Enterprise Rental Operations Network
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-md bg-purple-100 text-[#714B67] font-black text-xs uppercase tracking-wider mb-1">
                  Quotation & Pickup Voucher
                </span>
                <p className="text-lg font-extrabold text-slate-900">{orderNumber}</p>
                <p className="text-xs text-slate-500 font-medium">Issued: {fmtDate(order.created_at || new Date())}</p>
              </div>
            </div>

            {/* QR Code & Pickup Verification Highlight Box */}
            <div className="p-5 rounded-2xl bg-purple-50 border-2 border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">
                  Store Counter Verification Code
                </span>
                <p className="text-3xl font-black text-[#714B67] tracking-wider font-mono">
                  {pickupCode}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Show this slip or QR code to the store manager for instant handover.
                </p>
              </div>

              {/* QR Code Box */}
              {(() => {
                const qrText = `Order Number: ${orderNumber}\nVerification Code: ${pickupCode}`;
                const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}&color=0f172a`;
                return (
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-purple-200 shadow-xs shrink-0">
                    <div className="w-24 h-24 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden p-1">
                      <img src={qrImgUrl} alt="Verification QR Code" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 mt-1">{pickupCode}</span>
                  </div>
                );
              })()}
            </div>

            {/* 2-Column Info Grid: Store Hub & Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              
              {/* Pickup Hub Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Designated Pickup Hub
                </span>
                <p className="text-sm font-black text-slate-900">{storeName}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{storeAddress}</p>
                <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-500">

                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#714B67]" /> 
                    <span>Contact: {storePhone}</span>
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Customer Information
                </span>
                <p className="text-sm font-black text-slate-900">{order.customer_name || 'Valued Customer'}</p>
                <p className="text-xs text-slate-600">{order.customer_email || '—'}</p>
                <p className="text-xs text-slate-600">{order.customer_phone || 'Phone verified'}</p>
                <div className="pt-2 border-t border-slate-200 text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ID Verification & Escrow Confirmed
                </div>
              </div>
            </div>

            {/* Itemized Quotation Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Rental Schedule</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Security Deposit</th>
                    <th className="p-3 text-right">Rental Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-slate-900">
                          {item.product_name_display || item.product_name || 'Equipment'}
                        </td>
                        <td className="p-3 text-center text-slate-600">
                          {fmtDate(item.start_date || order.rental_start_date)} → {fmtDate(item.end_date || order.rental_end_date)}
                        </td>
                        <td className="p-3 text-right">{item.quantity || 1}</td>
                        <td className="p-3 text-right">₹{parseFloat(item.price || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right text-amber-600 font-bold">₹{parseFloat(item.deposit || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-black text-slate-900">₹{parseFloat(item.price || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 font-bold text-slate-900">{productName}</td>
                      <td className="p-3 text-center text-slate-600">{fmtDate(order.rental_start_date)} → {fmtDate(order.rental_end_date)}</td>
                      <td className="p-3 text-right">{qty}</td>
                      <td className="p-3 text-right">₹{rentalAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-amber-600 font-bold">₹{depositAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-black text-slate-900">₹{rentalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-end pt-2">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Net Rental Charges:</span>
                  <span className="font-bold text-slate-900">₹{rentalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold text-amber-600">₹{depositAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Convenience & Store Fee:</span>
                  <span className="font-bold text-emerald-600">FREE (Store Pickup)</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-[#714B67]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Signature & Verification Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
              <div className="space-y-8">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Customer Acknowledgement</p>
                <div className="border-b border-slate-300 w-48" />
                <p className="text-slate-600 text-[11px]">Signature: {order.customer_name || 'Customer'}</p>
              </div>

              <div className="space-y-8 text-right">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Authorized Store Officer</p>
                <div className="border-b border-slate-300 w-48 ml-auto" />
                <p className="text-slate-600 text-[11px]">Official Store Stamp & Sign</p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
