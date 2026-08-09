import { api } from './index';

// ── STORES API ───────────────────────────────────────────
export const getStores = (params = {}) => api.get('/stores/', { params });
export const getStore = (id) => api.get(`/stores/${id}/`);
export const getStoreInventory = (storeId) => api.get(`/stores/${storeId}/inventory/`);
export const getStoreStocks = (params = {}) => api.get('/store-stocks/', { params });
