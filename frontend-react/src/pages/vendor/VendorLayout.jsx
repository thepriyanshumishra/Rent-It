import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import VendorHeader from '../../components/vendor/VendorHeader';
import { useStore } from '../../context/StoreContext';
import { api } from '../../api';

export default function VendorLayout() {
  const { selectStore } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManagedStore = async () => {
      try {
        let res = await api.get('/stores/?my_store=true');
        let stores = res.data;
        if (!Array.isArray(stores) || stores.length === 0) {
          res = await api.get('/stores/');
          stores = res.data;
        }
        if (Array.isArray(stores) && stores.length > 0) {
          selectStore(stores[0]);
        }
      } catch (err) {
        console.error('Failed to load managed store:', err);
      } finally {
        setLoading(false);
      }
    };
    loadManagedStore();
  }, [selectStore]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg)]">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <VendorHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-36 sm:pt-32 md:pt-28">
        <Outlet />
      </main>
    </div>
  );
}
