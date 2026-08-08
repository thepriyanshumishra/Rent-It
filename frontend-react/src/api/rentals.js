import api from './axios';

export const getCart = () => api.get('/rentals/cart/');
export const addToCart = (data) => api.post('/rentals/cart/items/', data);
export const updateCartItem = (id, data) => api.put(`/rentals/cart/items/${id}/`, data);
export const removeCartItem = (id) => api.delete(`/rentals/cart/items/${id}/`);
export const clearCart = () => api.delete('/rentals/cart/clear/');
export const createOrder = (data) => api.post('/rentals/orders/', data);
export const checkoutCart = (data) => api.post('/rentals/orders/checkout/', data);
export const getOrders = (params) => api.get('/rentals/orders/', { params });
export const getOrder = (id) => api.get(`/rentals/orders/${id}/`);
export const cancelOrder = (id) => api.post(`/rentals/orders/${id}/cancel/`);

export const getMerchants = () => api.get('/accounts/merchants/');
export const verifyPickup = (id, code) => api.post(`/rentals/orders/${id}/verify-pickup/`, { pickup_code: code });
export const processReturn = (id, data) => api.post(`/rentals/orders/${id}/process-return/`, data);
