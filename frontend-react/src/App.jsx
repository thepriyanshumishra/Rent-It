import React, { Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { StoreProvider } from './context/StoreContext';
import LocationSelectorModal from './components/store/LocationSelectorModal';
import { Toaster } from './components/ui/Toast';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import PageTransition from './components/shared/PageTransition';

// Lazy loaded pages
const HomePage = React.lazy(() => import('./pages/customer/HomePage'));
const ExplorePage = React.lazy(() => import('./pages/customer/ExplorePage'));
const ProductDetailPage = React.lazy(() => import('./pages/customer/ProductDetailPage'));
const CartPage = React.lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/customer/CheckoutPage'));
const OrderConfirmationPage = React.lazy(() => import('./pages/customer/OrderConfirmationPage'));
const MyRentalsPage = React.lazy(() => import('./pages/customer/MyRentalsPage'));
const RentalDetailPage = React.lazy(() => import('./pages/customer/RentalDetailPage'));
const AccountPage = React.lazy(() => import('./pages/customer/AccountPage'));

const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));


// Vendor Portal Pages
const VendorLayout = React.lazy(() => import('./pages/vendor/VendorLayout'));
const VendorDashboardPage = React.lazy(() => import('./pages/vendor/VendorDashboardPage'));
const VendorListingsPage = React.lazy(() => import('./pages/vendor/VendorListingsPage'));
const VendorOrdersPage = React.lazy(() => import('./pages/vendor/VendorOrdersPage'));
const VendorProductFormPage = React.lazy(() => import('./pages/admin/ProductFormPage'));

const NotFoundPage = React.lazy(() => import('./pages/customer/NotFoundPage'));

// Loading spinner used while auth state is resolving
const FullPageSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[var(--bg)]">
    <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Page-level lazy load fallback
const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─── Customer Layout (only for CUSTOMER role or unauthenticated users) ────────
// STAFF → /vendor/dashboard
const CustomerLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <FullPageSpinner />;

  const role = String(user?.role || '').toUpperCase();
  const isStaffUser = role === 'STAFF';

  if (isStaffUser) return <Navigate to="/vendor/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300">
      <Navbar />
      <main className="flex-1 pt-24">
        <Suspense fallback={<PageSpinner />}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />

              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Protected Customer Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/my-rentals" element={<MyRentalsPage />} />
                <Route path="/my-rentals/:orderId" element={<RentalDetailPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PageTransition>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <StoreProvider>
              <CartProvider>
                <Toaster />
                <LocationSelectorModal />
                <Routes>
                  {/* Auth Routes — accessible by everyone */}
                  <Route path="/login" element={
                    <Suspense fallback={null}>
                      <PageTransition><LoginPage /></PageTransition>
                    </Suspense>
                  } />
                  <Route path="/register" element={
                    <Suspense fallback={null}>
                      <PageTransition><RegisterPage /></PageTransition>
                    </Suspense>
                  } />

                  {/* Vendor Portal — STAFF role only */}
                  <Route path="/vendor" element={
                    <Suspense fallback={null}>
                      <ProtectedRoute allowedRole="STAFF">
                        <VendorLayout />
                      </ProtectedRoute>
                    </Suspense>
                  }>
                    <Route index element={<Navigate to="/vendor/dashboard" replace />} />
                    <Route path="dashboard" element={<VendorDashboardPage />} />
                    <Route path="listings" element={<VendorListingsPage />} />
                    <Route path="orders" element={<VendorOrdersPage />} />
                    <Route path="products/new" element={<VendorProductFormPage />} />
                    <Route path="products/:id/edit" element={<VendorProductFormPage />} />
                  </Route>


                  {/* Customer Routes — CUSTOMER or unauthenticated only */}
                  <Route path="/*" element={<CustomerLayout />} />
                </Routes>
              </CartProvider>
            </StoreProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
