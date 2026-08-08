import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, FileText, Clock, Truck, DollarSign } from 'lucide-react';
import MetricRow from '../../components/admin/MetricRow';
import OperationsTable from '../../components/admin/OperationsTable';
import RevenueChart from '../../components/admin/RevenueChart';
import AttentionItems from '../../components/admin/AttentionItems';
import Button from '../../components/ui/Button';
import api from '../../api/axios';

export default function DashboardPage() {
  const { data: rentalsRaw, isLoading: loadingRentals, refetch: refetchRentals } = useQuery({
    queryKey: ['admin-rentals'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/rentals/');
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
      } catch (e) {
        return [];
      }
    }
  });

  const { data: listingReqsRaw, isLoading: loadingReqs, refetch: refetchReqs } = useQuery({
    queryKey: ['admin-listing-requests'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/listing-requests/');
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
      } catch (e) {
        return [];
      }
    }
  });

  const { data: productsRaw, isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/products/');
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
      } catch (e) {
        return [];
      }
    }
  });

  const rentalsData = Array.isArray(rentalsRaw) ? rentalsRaw : [];
  const listingReqs = Array.isArray(listingReqsRaw) ? listingReqsRaw : [];
  const products = Array.isArray(productsRaw) ? productsRaw : [];

  const handleRefresh = () => {
    refetchRentals();
    refetchReqs();
    refetchProducts();
  };

  const activeRentalsCount = rentalsData.filter(r => r && r.status === 'ACTIVE').length;
  const pendingInspectionCount = listingReqs.filter(r => r && r.status === 'PENDING_VERIFICATION').length;
  const liveStorefrontCount = products.filter(p => p && p.is_active).length;
  const totalRevenue = rentalsData
    .filter(r => r && (r.payment_status === 'PAID' || r.status === 'COMPLETED'))
    .reduce((sum, r) => sum + Number(r.total_amount || r.total || 0), 0);

  const metrics = [
    { title: 'Active Rentals', label: 'Active Rentals', value: String(activeRentalsCount), icon: FileText, color: 'var(--accent)' },
    { title: 'Pending Verification', label: 'Pending Verification', value: String(pendingInspectionCount), icon: Clock, color: 'var(--warning)' },
    { title: 'Live Storefront Fleet', label: 'Live Storefront Fleet', value: String(liveStorefrontCount), icon: Truck, color: 'var(--info)' },
    { title: 'Total Revenue', label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'var(--success)' }
  ];

  const operations = rentalsData.map(r => ({
    id: r.id,
    time: new Date(r.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    customerName: r.customer_name || r.user_email || 'Customer',
    productName: r.items?.[0]?.product_name || 'Equipment',
    type: r.status === 'ACTIVE' ? 'pickup' : 'return',
    status: (r.status || 'pending').toLowerCase(),
    rentalId: r.id
  }));

  const revenueData = [
    { date: 'Today', revenue: totalRevenue }
  ];

  const attentionItems = [
    ...(pendingInspectionCount > 0 ? [{
      type: 'pending_returns',
      title: `${pendingInspectionCount} Renter Request(s) Pending Verification`,
      description: 'Items awaiting physical inspection and tax invoice approval.',
      link: '/admin/listing-requests'
    }] : [])
  ];

  const isLoading = loadingRentals || loadingReqs || loadingProducts;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">HQ Operations Dashboard</h2>
          <p className="text-xs text-[var(--text-muted)] font-semibold mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 font-bold rounded-xl">
          <RefreshCw size={15} /> Refresh Data
        </Button>
      </div>

      <MetricRow metrics={metrics} loading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] mb-3">Today's Operations</h3>
          <div className="h-[calc(100%-2.25rem)]">
            <OperationsTable operations={operations} loading={isLoading} />
          </div>
        </div>
        <div className="h-[400px]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] mb-3">Revenue Performance</h3>
          <div className="h-[calc(100%-2.25rem)]">
            <RevenueChart data={revenueData} loading={isLoading} period="month" />
          </div>
        </div>
      </div>

      {attentionItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <AttentionItems items={attentionItems} loading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
