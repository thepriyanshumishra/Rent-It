import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../api/rentals';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

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

    // Pre-check quantity cap before attempting API
    const availableQty = productObj?.available_quantity ?? productObj?.quantity ?? 99;
    const alreadyInCart = (cart?.items || [])
      .filter(i => (i.product?.id || i.product_id) === productId)
      .reduce((sum, i) => sum + (i.quantity || 1), 0);

    if (alreadyInCart >= availableQty) {
      const { toast: t } = await import('../components/ui/Toast');
      t.error(`Only ${availableQty} unit(s) available — you already have ${alreadyInCart} in your cart.`);
      return;
    }

    if (isAuthenticated) {
      try {
        await apiAddToCart({
          product_id: productId,
          quantity: qty,
          start_date: itemData.startDate || itemData.start_date || null,
          end_date: itemData.endDate || itemData.end_date || null,
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
    const sDate = itemData?.startDate || itemData?.start_date || null;
    const eDate = itemData?.endDate || itemData?.end_date || null;

    setCart(prevCart => {
      const existingItems = prevCart?.items || [];

      // Key: same product + same start + same end date = merge quantities
      // Different dates = separate line item
      const existingIdx = existingItems.findIndex(i => {
        const sameProduct = (i.product?.id || i.product_id) === productObj.id;
        const iStart = i.start_date || i.startDate || null;
        const iEnd = i.end_date || i.endDate || null;
        const sameStartDate = iStart === sDate;
        const sameEndDate = iEnd === eDate;
        return sameProduct && sameStartDate && sameEndDate;
      });

      // Enforce available_quantity cap across ALL cart entries for this product
      const availableQty = productObj?.available_quantity ?? productObj?.quantity ?? 99;
      const alreadyInCart = existingItems
        .filter(i => (i.product?.id || i.product_id) === productObj.id)
        .reduce((sum, i) => sum + (i.quantity || 1), 0);
      const allowedQty = Math.min(qty, Math.max(0, availableQty - alreadyInCart));

      if (allowedQty <= 0) {
        // Signal overflow — caller will show toast
        return { ...prevCart, _quantityExceeded: productObj.id };
      }

      let newItems = [...existingItems];
      if (existingIdx > -1) {
        // Merge with existing same-period entry, still capped
        const newQty = newItems[existingIdx].quantity + allowedQty;
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          quantity: Math.min(newQty, availableQty)
        };
      } else {
        newItems.push({
          id: `${productObj.id}-${sDate}-${eDate}-${Date.now()}`,
          product_id: productObj.id,
          product: productObj,
          quantity: allowedQty,
          start_date: sDate,
          startDate: sDate,
          end_date: eDate,
          endDate: eDate,
          securityDeposit: productObj?.security_deposit ?? itemData?.securityDeposit
        });
      }
      return { ...prevCart, items: newItems, _quantityExceeded: null };
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
