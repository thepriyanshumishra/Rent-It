import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('rentit_access');
    if (!token) { setLoading(false); return; }
    try {
      const res = await authApi.me();
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('rentit_access');
      localStorage.removeItem('rentit_refresh');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    // Django simplejwt returns { access, refresh }
    const { access, refresh } = res.data;
    localStorage.setItem('rentit_access', access);
    localStorage.setItem('rentit_refresh', refresh);
    await fetchMe();
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const { tokens } = res.data.data;
    localStorage.setItem('rentit_access', tokens.accessToken);
    localStorage.setItem('rentit_refresh', tokens.refreshToken);
    await fetchMe();
  };

  const logout = () => {
    localStorage.removeItem('rentit_access');
    localStorage.removeItem('rentit_refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN' || user?.role === 'STAFF',
      isCustomer: user?.role === 'CUSTOMER',
      login,
      register,
      logout,
      refetch: fetchMe,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
