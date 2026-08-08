import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../api/rentals';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = 'rentos_display_cart';

const loadLocalCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { items: [], total_rental_price: "0.00", total_deposit: "0.00" };
  } catch {
    return { items: [], total_rental_price: "0.00", total_deposit: "0.00" };
  }
};

const saveLocalCart = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {}
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState(loadLocalCart);
  const [loading, setLoading] = useState(false);

  // Persist display cart to localStorage on every change
  useEffect(() => {
    saveLocalCart(cart);
  }, [cart]);

  // On login: if local cart is empty, seed from API (cross-device recovery)
  // We do NOT overwrite a non-empty local cart — backend loses date differentiation.
  useEffect(() => {
    if (!isAuthenticated) return;
    const localCart = loadLocalCart();
    if (localCart.items.length > 0) return;

    setLoading(true);
    getCart()
      .then(({ data }) => {
        if (data?.items?.length > 0) setCart(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const addItem = async (itemData) => {
    const productObj = itemData.product || itemData;
    const productId = productObj?.id || itemData.product_id;
    const qty = itemData.quantity || 1;

    // Pre-check quantity cap
    const availableQty = productObj?.available_quantity ?? productObj?.quantity ?? 99;
    const alreadyInCart = (cart?.items || [])
      .filter(i => (i.product?.id || i.product_id) === productId)
      .reduce((sum, i) => sum + (i.quantity || 1), 0);

    if (alreadyInCart >= availableQty) {
      const { toast: t } = await import('../components/ui/Toast');
      t.error(`Only ${availableQty} unit(s) available — you already have ${alreadyInCart} in your cart.`);
      return;
    }

    // Always update local display cart first (date-aware, separate line items)
    addLocalItem(productObj, qty, itemData);

    // Fire API in background if authenticated (for backend order processing)
    if (isAuthenticated) {
      apiAddToCart({
        product_id: productId,
        quantity: qty,
        start_date: itemData.startDate || itemData.start_date || null,
        end_date: itemData.endDate || itemData.end_date || null,
        rental_period: itemData.pricing?.id || null
      }).catch(err => console.warn('Background API cart sync failed', err));
    }
  };

  const addLocalItem = (productObj, qty, itemData = {}) => {
    const sDate = itemData?.startDate || itemData?.start_date || null;
    const eDate = itemData?.endDate || itemData?.end_date || null;

    setCart(prevCart => {
      const existingItems = prevCart?.items || [];

      // Same product + same dates = merge quantity
      // Same product + different dates = new separate line item
      const existingIdx = existingItems.findIndex(i => {
        const sameProduct = (i.product?.id || i.product_id) === productObj.id;
        const iStart = i.start_date || i.startDate || null;
        const iEnd = i.end_date || i.endDate || null;
        return sameProduct && iStart === sDate && iEnd === eDate;
      });

      // Enforce available_quantity cap across ALL entries for this product
      const availableQty = productObj?.available_quantity ?? productObj?.quantity ?? 99;
      const alreadyInCart = existingItems
        .filter(i => (i.product?.id || i.product_id) === productObj.id)
        .reduce((sum, i) => sum + (i.quantity || 1), 0);
      const allowedQty = Math.min(qty, Math.max(0, availableQty - alreadyInCart));

      if (allowedQty <= 0) return prevCart;

      let newItems = [...existingItems];
      if (existingIdx > -1) {
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          quantity: Math.min(newItems[existingIdx].quantity + allowedQty, availableQty)
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
      return { ...prevCart, items: newItems };
    });
  };

  const removeItem = async (id) => {
    // Remove locally immediately for instant UI feedback
    setCart(prev => ({
      ...prev,
      items: (prev?.items || []).filter(item => item.id !== id)
    }));
    // Best-effort API sync
    if (isAuthenticated) {
      apiRemoveCartItem(id).catch(() => {});
    }
  };

  const updateItem = async (id, data) => {
    // Update locally immediately
    setCart(prev => ({
      ...prev,
      items: (prev?.items || []).map(item => item.id === id ? { ...item, ...data } : item)
    }));
    // Best-effort API sync
    if (isAuthenticated) {
      apiUpdateCartItem(id, data).catch(() => {});
    }
  };

  const clear = async () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem('rentos_guest_cart');
    setCart({ items: [], total_rental_price: "0.00", total_deposit: "0.00" });
    if (isAuthenticated) {
      apiClearCart().catch(() => {});
    }
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
      refreshCart: () => {}
    }}>
      {children}
    </CartContext.Provider>
  );
};
