import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api/rentals';

export default function useRentals(params = {}) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrders(params),
  });

  const activeRentals = data?.data?.results?.filter(
    order => ['CONFIRMED', 'ACTIVE', 'OVERDUE'].includes(order.status)
  ) || [];

  return {
    orders: data?.data?.results || [],
    activeRentals,
    loading: isLoading,
    refetch,
    totalCount: data?.data?.count || 0
  };
}
