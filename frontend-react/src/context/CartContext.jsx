import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../api/rentals';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState(() => {
    const local = localStorage.getItem('rentos_guest_cart');
    return local ? JSON.parse(local) : { items: [], total_rental_price: "0.00", total_deposit: "0.00" };
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await getCart();
      if (data) setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Persist guest cart to local storage
  useEffect(() => {
    if (!isAuthenticated && cart) {
      localStorage.setItem('rentos_guest_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addItem = async (itemData) => {
    const productObj = itemData.product || itemData;
    const productId = productObj?.id || itemData.product_id;
    const qty = itemData.quantity || 1;

    if (isAuthenticated) {
      try {
        await apiAddToCart({
          product_id: productId,
          quantity: qty,
          rental_period: itemData.pricing?.id || null
        });
        await fetchCart();
      } catch (error) {
        console.warn('API Add to cart failed, storing locally', error);
        addLocalItem(productObj, qty, itemData);
      }
    } else {
      addLocalItem(productObj, qty, itemData);
    }
  };

  const addLocalItem = (productObj, qty, itemData = {}) => {
    setCart(prevCart => {
      const existingItems = prevCart?.items || [];
      const existingIdx = existingItems.findIndex(i => (i.product?.id || i.product_id) === productObj.id);
      
      let newItems = [...existingItems];
      if (existingIdx > -1) {
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          quantity: newItems[existingIdx].quantity + qty
        };
      } else {
        newItems.push({
          id: Date.now(),
          product_id: productObj.id,
          product: productObj,
          quantity: qty,
          start_date: itemData?.startDate,
          end_date: itemData?.endDate
        });
      }
      return { ...prevCart, items: newItems };
    });
  };

  const removeItem = async (id) => {
    if (isAuthenticated) {
      try {
        await apiRemoveCartItem(id);
        await fetchCart();
        return;
      } catch (error) {
        console.warn('API remove failed, updating locally', error);
      }
    }
    setCart(prev => ({
      ...prev,
      items: (prev?.items || []).filter(item => item.id !== id)
    }));
  };

  const updateItem = async (id, data) => {
    if (isAuthenticated) {
      try {
        await apiUpdateCartItem(id, data);
        await fetchCart();
        return;
      } catch (error) {
        console.warn('API update failed', error);
      }
    }
    setCart(prev => ({
      ...prev,
      items: (prev?.items || []).map(item => item.id === id ? { ...item, ...data } : item)
    }));
  };

  const clear = async () => {
    if (isAuthenticated) {
      try {
        await apiClearCart();
      } catch (error) {
        console.warn('API clear failed', error);
      }
    }
    localStorage.removeItem('rentos_guest_cart');
    setCart({ items: [], total_rental_price: "0.00", total_deposit: "0.00" });
  };

  const totalItems = (cart?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
  
  const totalAmount = (cart?.items || []).reduce((acc, item) => {
    const itemPrice = parseFloat(item.product?.price || item.rental_price || 0);
    return acc + (itemPrice * (item.quantity || 1));
  }, 0);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addItem,
      addToCart: addItem,
      removeItem,
      updateItem,
      clearCart: clear,
      totalItems,
      totalAmount,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
