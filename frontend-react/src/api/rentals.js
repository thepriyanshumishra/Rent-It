import api from './axios';

// ── CART ─────────────────────────────────────────────────
export const getCart         = ()           => api.get('/rentals/cart/');
export const addToCart       = (data)       => api.post('/rentals/cart/items/', data);
export const updateCartItem  = (id, data)   => api.put(`/rentals/cart/items/${id}/`, data);
export const removeCartItem  = (id)         => api.delete(`/rentals/cart/items/${id}/`);
export const clearCart       = ()           => api.delete('/rentals/cart/clear/');

// ── ORDERS ───────────────────────────────────────────────
export const checkoutCart    = (data)       => api.post('/rentals/orders/checkout/', data);
export const getOrders       = (params)     => api.get('/rentals/orders/', { params });
export const getOrder        = (id)         => api.get(`/rentals/orders/${id}/`);
export const getOrderById    = (id)         => api.get(`/rentals/orders/${id}/`);
export const getMyRentals    = ()           => api.get('/rentals/orders/');

// ── ORDER LIFECYCLE ACTIONS ──────────────────────────────
export const confirmPickup   = (id)         => api.post(`/rentals/orders/${id}/pickup-confirm/`);
export const processReturn   = (id, data)   => api.post(`/rentals/orders/${id}/process-return/`, data);
export const settleDeposit   = (id)         => api.post(`/rentals/orders/${id}/settle-deposit/`);
export const cancelOrder     = (id)         => api.post(`/rentals/orders/${id}/cancel/`);

// ── SETTINGS ─────────────────────────────────────────────
export const getLateFeeConfig  = ()         => api.get('/rentals/settings/late-fee/');
export const updateLateFeeConfig = (data)   => api.put('/rentals/settings/late-fee/', data);

// ── RENTAL PERIODS ───────────────────────────────────────
export const getRentalPeriods  = ()         => api.get('/rentals/rental-periods/');

// ── LEGACY (kept for compat) ─────────────────────────────
export const createOrder     = (data)       => api.post('/rentals/orders/', data);
export const getMerchants    = ()           => api.get('/accounts/merchants/');
export const verifyPickup    = (id, code)   => api.post(`/rentals/orders/${id}/verify-pickup/`, { pickup_code: code });
