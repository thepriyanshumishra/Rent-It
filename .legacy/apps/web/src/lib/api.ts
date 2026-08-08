import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Access Token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rentit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: Silent Token Refresh on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('rentit_refresh_token');
        if (refreshToken) {
          try {
            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: refreshToken,
            });
            if (res.data.data?.accessToken) {
              const newToken = res.data.data.accessToken;
              localStorage.setItem('rentit_token', newToken);
              if (res.data.data.refreshToken) {
                localStorage.setItem('rentit_refresh_token', res.data.data.refreshToken);
              }
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch {
            localStorage.removeItem('rentit_token');
            localStorage.removeItem('rentit_refresh_token');
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
