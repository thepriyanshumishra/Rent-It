import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, GuestOnlyRoute } from './components/shared/ProtectedRoute';
import Navbar from './components/shared/Navbar';

// Pages — Customer
import HomePage from './pages/customer/HomePage';
import ExplorePage from './pages/customer/ExplorePage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import MyRentalsPage from './pages/customer/MyRentalsPage';
import AccountPage from './pages/customer/AccountPage';

// Pages — Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages — Admin
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import RentalsPage from './pages/admin/RentalsPage';
import ReturnsPage from './pages/admin/ReturnsPage';
import InventoryPage from './pages/admin/InventoryPage';
import ProductsPage from './pages/admin/ProductsPage';
import CustomersPage from './pages/admin/CustomersPage';
import KycPage from './pages/admin/KycPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <footer className="py-8 border-t border-[var(--border)] text-center text-[var(--text-muted)] text-sm">
        © 2026 RentIt. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Customer routes */}
                <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
                <Route path="/explore" element={<CustomerLayout><ExplorePage /></CustomerLayout>} />
                <Route path="/products/:id" element={<CustomerLayout><ProductDetailPage /></CustomerLayout>} />
                <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <CustomerLayout><CheckoutPage /></CustomerLayout>
                  </ProtectedRoute>
                } />
                <Route path="/my-rentals" element={
                  <ProtectedRoute>
                    <CustomerLayout><MyRentalsPage /></CustomerLayout>
                  </ProtectedRoute>
                } />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <CustomerLayout><AccountPage /></CustomerLayout>
                  </ProtectedRoute>
                } />

                {/* Auth routes */}
                <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
                <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />

                {/* Admin routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<DashboardPage />} />
                  <Route path="rentals" element={<RentalsPage />} />
                  <Route path="returns" element={<ReturnsPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="kyc" element={<KycPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
