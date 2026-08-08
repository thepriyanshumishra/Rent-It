import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import RentalCard from '../../components/customer/RentalCard';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
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
    if (!item) return;
    const key = item.id || item.order_number;
    if (key && !uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  const rentals = Array.from(uniqueMap.values()).map(r => {
    const pId = r.product_id || r.items?.[0]?.product_id || 3;
    const mappedProd = sampleProductMap[pId] || { name: 'Super73-RX Electric Adventure Bike', price: 1800, deposit: 5000, category: 'Vehicles' };
    return {
      ...r,
      order_number: r.order_number || r.id || `RNT-${Math.floor(100000 + Math.random() * 900000)}`,
      product: r.product || {
        id: pId,
        name: mappedProd.name,
        category: mappedProd.category
      },
      rental_amount: r.rental_amount || mappedProd.price,
      deposit_amount: r.deposit_amount || mappedProd.deposit,
      start_date: r.start_date || new Date().toISOString().split('T')[0],
      end_date: r.end_date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: r.status || 'active'
    };
  });

  const activeRentals = rentals.filter(r => r.status === 'active' || r.status === 'ACTIVE' || r.status === 'reserved' || r.status === 'CONFIRMED' || r.status === 'PENDING_DELIVERY');
  const pastRentals = rentals.filter(r => r.status === 'completed' || r.status === 'RETURNED' || r.status === 'COMPLETED');

  const currentList = activeTab === 'active' ? activeRentals : pastRentals;

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
          <div>
            <span className="text-xs font-bold text-accent tracking-wider uppercase">Rental Dashboard</span>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">My Active Gear Rentals</h1>
          </div>

          <div className="flex bg-bg-elevated border border-border p-1 rounded-2xl shadow-xs">
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
                  <RentalCard rental={rental} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </PageTransition>
  );
};

export default MyRentalsPage;
