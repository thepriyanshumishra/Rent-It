import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rentit_access');
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
      const refresh = localStorage.getItem('rentit_refresh');
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
          if (res.data.access) {
            localStorage.setItem('rentit_access', res.data.access);
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
  checkout: (data) => api.post('/rentals/checkout/', data),
  confirmPayment: (rentalId) => api.post(`/rentals/${rentalId}/confirm-payment/`),
  list: (params) => api.get('/rentals/', { params }),
  detail: (id) => api.get(`/rentals/${id}/`),
  requestReturn: (id, notes) => api.post(`/rentals/${id}/request-return/`, { notes }),
  // Admin only
  confirmPickup: (id, data) => api.post(`/rentals/${id}/pickup/`, data),
  processReturn: (id, data) => api.post(`/rentals/${id}/return/`, data),
  inspect: (id, data) => api.post(`/rentals/${id}/inspect/`, data),
  settle: (id, data) => api.post(`/rentals/${id}/settle/`, data),
};

// ─── Admin ────────────────────────────────────────────────
export const adminApi = {
  // Real backend: GET /api/reports/dashboard/
  dashboard: () => api.get('/reports/dashboard/'),
  // Real backend: GET /api/inventory/items/
  inventory: () => api.get('/inventory/items/'),
  updateInventoryStatus: (id, data) =>
    api.patch(`/inventory/items/${id}/`, data),
  // Real backend: GET /api/auth/customers/
  customers: () => api.get('/auth/customers/'),
  // Real backend: GET /api/returns/ (pickups app)
  returnRequests: () => api.get('/returns/'),
  processReturnRequest: (id, action) =>
    api.post(`/returns/${id}/${action}/`),
  // Real backend: GET /api/reports/revenue/
  revenueReport: () => api.get('/reports/revenue/'),
};

export default api;
