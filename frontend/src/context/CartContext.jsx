import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartApi } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState({ items: [], summary: { itemCount: 0, subtotalPaise: 0, depositTotalPaise: 0, totalPaise: 0 } });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) return;
    setLoading(true);
    try {
      const res = await cartApi.get();
      if (res.data.success) setCart(res.data.data);
    } catch {
      // ignore (unauthenticated)
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (data) => {
    await cartApi.addItem(data);
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await cartApi.removeItem(itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartApi.clear();
    setCart({ items: [], summary: { itemCount: 0, subtotalPaise: 0, depositTotalPaise: 0, totalPaise: 0 } });
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      totalItems: cart.summary?.itemCount || 0,
      addItem,
      removeItem,
      clearCart,
      refetch: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
