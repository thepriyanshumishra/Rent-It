import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
          if (res.data.access) {
            localStorage.setItem('accessToken', res.data.access);
            original.headers.Authorization = `Bearer ${res.data.access}`;
            return api(original);
          }
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    api.post('/auth/login/', { email, password }),
  register: (data) =>
    api.post('/auth/register/', data),
  me: () =>
    api.get('/auth/me/'),
  refresh: (refresh) =>
    api.post('/auth/refresh/', { refresh }),
};

// ─── Products ─────────────────────────────────────────────
export const productsApi = {
  list: (params) => api.get('/products/', { params }),
  detail: (id) => api.get(`/products/${id}/`),
  categories: () => api.get('/categories/'),
  availability: (id, startDate, endDate) =>
    api.get(`/products/${id}/availability/`, { params: { startDate, endDate } }),
};

// ─── Cart ──────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get('/cart/'),
  addItem: (data) => api.post('/cart/items/', data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}/`),
  clear: () => api.delete('/cart/'),
};

// ─── Rentals ───────────────────────────────────────────────
export const rentalsApi = {
  checkout:      (data)      => api.post('/rentals/checkout/', data),
  list:          (params)    => api.get('/rentals/', { params }),
  detail:        (id)        => api.get(`/rentals/${id}/`),
  // Vendor / store-staff actions
  confirmPickup: (id, data)  => api.post(`/rentals/${id}/pickup-confirm/`, data),
  processReturn: (id, data)  => api.post(`/rentals/${id}/process-return/`, data),
  settleDeposit: (id, data)  => api.post(`/rentals/${id}/settle-deposit/`, data),
  cancel:        (id, data)  => api.post(`/rentals/${id}/cancel/`, data),
};

export default api;
