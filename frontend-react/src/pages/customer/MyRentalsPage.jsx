import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import RentalCard from '../../components/customer/RentalCard';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import * as rentalsApi from '../../api/rentals';

const MyRentalsPage = () => {
  const [activeTab, setActiveTab] = useState('active');

  // Purge any old local storage mock order cache on page load for clean state
  useEffect(() => {
    localStorage.removeItem('rentos_placed_orders');
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['my-rentals'],
    queryFn: () => rentalsApi.getMyRentals(),
    retry: false
  });

  const apiRentals = Array.isArray(data?.data) 
    ? data.data 
    : (Array.isArray(data) ? data : (data?.results || []));

  const rentals = apiRentals.map(r => {
    return {
      ...r,
      order_number: r.order_number || `RNT-${r.id}`,
      product: r.product || r.items?.[0]?.product || { name: 'Rental Item' },
      rental_amount: r.total_amount || r.rental_amount || 0,
      deposit_amount: r.deposit_amount || 0,
      start_date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      end_date: r.end_date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: r.status || 'ACTIVE'
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
          {isLoading ? (
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
