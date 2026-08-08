import React, { createContext, useState, useEffect } from 'react';
import { getProfile, login as loginApi, logout as logoutApi, register as registerApi } from '../api/auth';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await getProfile();
          setUser(data);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (credentials) => {
    const { data } = await loginApi(credentials);
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    
    // Set token immediately for getProfile request
    api.defaults.headers.Authorization = `Bearer ${data.access}`;
    
    const profile = await getProfile();
    setUser(profile.data);
    return profile.data;
  };

  const register = async (userData) => {
    const { data } = await registerApi(userData);
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    
    api.defaults.headers.Authorization = `Bearer ${data.access}`;
    
    const profile = await getProfile();
    setUser(profile.data);
    return profile.data;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      delete api.defaults.headers.Authorization;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin' || user?.is_staff || user?.is_superuser;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, register, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
