import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Check, Package, Plus, Sparkles, X } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import RentalCard from '../../components/customer/RentalCard';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';
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

const MyRentalsPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedRentalToExtend, setSelectedRentalToExtend] = useState(null);
  const [extendDays, setExtendDays] = useState(2);

  const { data, isLoading } = useQuery({
    queryKey: ['my-rentals'],
    queryFn: () => rentalsApi.getMyRentals(),
    retry: false
  });

  // Read local orders placed in guest/demo session
  let localOrders = [];
  try {
    const stored = localStorage.getItem('rentos_placed_orders');
    if (stored) localOrders = JSON.parse(stored);
  } catch (e) {
    console.warn('LocalStorage read error', e);
  }

  const apiRentals = data?.data || [];
  const combined = [...localOrders, ...apiRentals];

  // Deduplicate orders
  const uniqueMap = new Map();
  combined.forEach(item => {
    if (item && item.id && !uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  });

  const rentals = Array.from(uniqueMap.values()).map(r => {
    const fallback = sampleProductMap[r.product_id] || sampleProductMap[3];
    const prod = r.product || r.items?.[0]?.product || fallback;
    
    return {
      ...r,
      order_number: r.order_number || r.id,
      status: r.status || 'active',
      start_date: r.start_date || new Date().toISOString().split('T')[0],
      end_date: r.end_date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      total_price: r.total_price || r.total_amount || 6800,
      deposit_amount: r.deposit_amount || fallback.deposit,
      product: typeof prod === 'object' ? prod : { name: fallback.name, category_name: fallback.category }
    };
  });

  const activeRentals = rentals.filter(r => ['active', 'confirmed', 'pickup_scheduled'].includes(r.status));
  const pastRentals = rentals.filter(r => ['completed', 'returned', 'inspected'].includes(r.status));

  const currentList = activeTab === 'active' ? activeRentals : pastRentals;

  const handleConfirmExtension = () => {
    if (!selectedRentalToExtend) return;
    
    try {
      const stored = localStorage.getItem('rentos_placed_orders');
      if (stored) {
        const orders = JSON.parse(stored);
        const updated = orders.map(o => {
          if (o.id === selectedRentalToExtend.id || o.order_number === selectedRentalToExtend.order_number) {
            const currentEnd = new Date(o.end_date || Date.now());
            currentEnd.setDate(currentEnd.getDate() + extendDays);
            return {
              ...o,
              end_date: currentEnd.toISOString().split('T')[0]
            };
          }
          return o;
        });
        localStorage.setItem('rentos_placed_orders', JSON.stringify(updated));
      }
      toast.success(`Rental period extended by +${extendDays} days!`);
      setSelectedRentalToExtend(null);
      window.location.reload();
    } catch (e) {
      toast.success(`Rental extension requested for +${extendDays} days`);
      setSelectedRentalToExtend(null);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Rental Dashboard</span>
            <h1 className="text-3xl font-black text-text mt-1">My Active Gear Rentals</h1>
          </div>

          {/* Segment Control */}
          <div className="flex bg-bg-elevated p-1.5 rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'active' 
                  ? 'bg-accent text-white shadow-sm' 
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Active & Reserved ({activeRentals.length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'history' 
                  ? 'bg-accent text-white shadow-sm' 
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Order History ({pastRentals.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {isLoading && rentals.length === 0 ? (
            <div className="grid gap-4">
              <Skeleton className="w-full h-36 rounded-3xl" />
              <Skeleton className="w-full h-36 rounded-3xl" />
            </div>
          ) : currentList.length === 0 ? (
            <EmptyState 
              icon={<Package className="w-12 h-12 text-accent" />}
              title={`No ${activeTab === 'active' ? 'Active' : 'Past'} Rentals`}
              description={activeTab === 'active' ? "You don't have any gear currently out on rental." : "Your past returned rentals will appear here."}
            />
          ) : (
            <motion.div 
              className="grid gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
            >
              {currentList.map(rental => (
                <motion.div key={rental.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <RentalCard 
                    rental={rental} 
                    onExtend={(r) => setSelectedRentalToExtend(r)} 
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* EXTEND DURATION MODAL */}
        <Modal 
          isOpen={!!selectedRentalToExtend} 
          onClose={() => setSelectedRentalToExtend(null)}
          title="Extend Rental Duration"
        >
          <div className="p-2 space-y-6">
            <div>
              <h4 className="font-extrabold text-text text-base">
                {selectedRentalToExtend?.product?.name || 'Rental Product'}
              </h4>
              <p className="text-xs text-text-muted mt-1 font-medium">
                Current Due Date: <span className="font-bold text-accent">{selectedRentalToExtend?.end_date}</span>
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Select Extension Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(days => (
                  <button
                    key={days}
                    onClick={() => setExtendDays(days)}
                    className={`py-3 px-4 rounded-2xl border-2 font-extrabold text-sm transition-all text-center ${
                      extendDays === days 
                        ? 'border-accent bg-accent-subtle/60 text-accent shadow-sm' 
                        : 'border-border bg-bg-elevated hover:border-border-strong text-text'
                    }`}
                  >
                    +{days} {days === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-bg-subtle p-4 rounded-2xl border border-border space-y-2 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-text-muted">Extension Charge (+{extendDays} days)</span>
                <span className="font-bold text-text">₹{(extendDays * 1800).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-text-muted">Security Deposit Held</span>
                <span className="font-bold text-success">No Additional Deposit</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setSelectedRentalToExtend(null)} className="rounded-xl font-bold">Cancel</Button>
              <Button onClick={handleConfirmExtension} size="lg" className="rounded-xl font-bold px-6 shadow-md">
                Confirm +{extendDays} Days Extension
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </PageTransition>
  );
};

export default MyRentalsPage;
