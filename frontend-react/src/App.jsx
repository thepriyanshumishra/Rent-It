import React, { Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from './components/ui/Toast';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import PageTransition from './components/shared/PageTransition';

// Lazy loaded pages
const HomePage = React.lazy(() => import('./pages/customer/HomePage'));
const ExplorePage = React.lazy(() => import('./pages/customer/ExplorePage'));
const ProductDetailPage = React.lazy(() => import('./pages/customer/ProductDetailPage'));
const BecomeLenderPage = React.lazy(() => import('./pages/customer/BecomeLenderPage'));
const CartPage = React.lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/customer/CheckoutPage'));
const OrderConfirmationPage = React.lazy(() => import('./pages/customer/OrderConfirmationPage'));
const MyRentalsPage = React.lazy(() => import('./pages/customer/MyRentalsPage'));
const RentalDetailPage = React.lazy(() => import('./pages/customer/RentalDetailPage'));
const AccountPage = React.lazy(() => import('./pages/customer/AccountPage'));

const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));

// Lender Portal Pages
const LenderLayout = React.lazy(() => import('./pages/lender/LenderLayout'));
const LenderDashboardPage = React.lazy(() => import('./pages/lender/LenderDashboardPage'));
const NewListingPage = React.lazy(() => import('./pages/lender/NewListingPage'));

// Admin Portal Pages
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const RentalsPage = React.lazy(() => import('./pages/admin/RentalsPage'));
const ListingRequestsPage = React.lazy(() => import('./pages/admin/ListingRequestsPage'));
const AdminRentalDetailPage = React.lazy(() => import('./pages/admin/AdminRentalDetailPage'));
const ProductFormPage = React.lazy(() => import('./pages/admin/ProductFormPage'));
const InventoryPage = React.lazy(() => import('./pages/admin/InventoryPage'));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage'));
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
// ADMIN → /admin/dashboard, LENDER → /lender/dashboard
const CustomerLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <FullPageSpinner />;

  const role = String(user?.role || '').toUpperCase();
  const isAdminUser = role === 'ADMIN' || user?.is_staff || user?.is_superuser;
  const isLenderUser = role === 'LENDER';

  if (isAdminUser) return <Navigate to="/admin/dashboard" replace />;
  if (isLenderUser) return <Navigate to="/lender/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300">
      <Navbar />
      <main className="flex-1 pt-20">
        <Suspense fallback={<PageSpinner />}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/become-a-lender" element={<BecomeLenderPage />} />
              <Route path="/become-a-renter" element={<Navigate to="/become-a-lender" replace />} />
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
            <CartProvider>
              <Toaster />
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

                {/* Lender Portal — LENDER role only */}
                <Route path="/lender" element={
                  <Suspense fallback={null}>
                    <ProtectedRoute allowedRole="LENDER">
                      <LenderLayout />
                    </ProtectedRoute>
                  </Suspense>
                }>
                  <Route index element={<LenderDashboardPage />} />
                  <Route path="dashboard" element={<LenderDashboardPage />} />
                  <Route path="listings/new" element={<NewListingPage />} />
                </Route>

                {/* Admin Portal — ADMIN role only */}
                <Route path="/admin" element={
                  <Suspense fallback={null}>
                    <ProtectedRoute allowedRole="ADMIN">
                      <AdminLayout />
                    </ProtectedRoute>
                  </Suspense>
                }>
                  <Route index element={<DashboardPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="listing-requests" element={<ListingRequestsPage />} />
                  <Route path="rentals" element={<RentalsPage />} />
                  <Route path="rentals/:id" element={<AdminRentalDetailPage />} />
                  <Route path="products/new" element={<ProductFormPage />} />
                  <Route path="products/:id/edit" element={<ProductFormPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Customer Routes — CUSTOMER or unauthenticated only */}
                <Route path="/*" element={<CustomerLayout />} />
              </Routes>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
