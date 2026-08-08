import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories } from '../api/products';
import { useState } from 'react';

export default function useProducts(initialParams = {}) {
  const [params, setParams] = useState(initialParams);

  const productsQuery = useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const search = (query) => {
    setParams(prev => ({ ...prev, search: query, page: 1 }));
  };

  const filter = (filters) => {
    setParams(prev => ({ ...prev, ...filters, page: 1 }));
  };

  return {
    products: productsQuery.data?.data?.results || [],
    totalProducts: productsQuery.data?.data?.count || 0,
    categories: categoriesQuery.data?.data || [],
    loading: productsQuery.isLoading || categoriesQuery.isLoading,
    search,
    filter,
    params,
    setParams
  };
}
