import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
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
const BusinessPage = React.lazy(() => import('./pages/customer/BusinessPage'));
const CartPage = React.lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/customer/CheckoutPage'));
const OrderConfirmationPage = React.lazy(() => import('./pages/customer/OrderConfirmationPage'));
const MyRentalsPage = React.lazy(() => import('./pages/customer/MyRentalsPage'));
const RentalDetailPage = React.lazy(() => import('./pages/customer/RentalDetailPage'));
const AccountPage = React.lazy(() => import('./pages/customer/AccountPage'));

const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));

const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const RentalsPage = React.lazy(() => import('./pages/admin/RentalsPage'));
const BusinessOrdersPage = React.lazy(() => import('./pages/admin/BusinessOrdersPage'));
const AdminRentalDetailPage = React.lazy(() => import('./pages/admin/AdminRentalDetailPage'));
const ProductsPage = React.lazy(() => import('./pages/admin/ProductsPage'));
const ProductFormPage = React.lazy(() => import('./pages/admin/ProductFormPage'));
const InventoryPage = React.lazy(() => import('./pages/admin/InventoryPage'));
const CustomersPage = React.lazy(() => import('./pages/admin/CustomersPage'));
const CustomerDetailPage = React.lazy(() => import('./pages/admin/CustomerDetailPage'));
const QuotationsPage = React.lazy(() => import('./pages/admin/QuotationsPage'));
const QuotationFormPage = React.lazy(() => import('./pages/admin/QuotationFormPage'));
const FinancePage = React.lazy(() => import('./pages/admin/FinancePage'));
const ReportsPage = React.lazy(() => import('./pages/admin/ReportsPage'));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage'));
const NotFoundPage = React.lazy(() => import('./pages/customer/NotFoundPage'));

const CustomerLayout = () => (
  <div className="min-h-screen flex flex-col relative transition-colors duration-300">
    <Navbar />
    <main className="flex-1 pt-20">
      <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div></div>}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/businesses" element={<BusinessPage />} />
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

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <Toaster />
              <Routes>
                {/* Auth Routes */}
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

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <Suspense fallback={null}>
                    <ProtectedRoute allowedRole="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  </Suspense>
                }>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="rentals" element={<RentalsPage />} />
                  <Route path="rentals/:id" element={<AdminRentalDetailPage />} />
                  <Route path="business-orders" element={<BusinessOrdersPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/new" element={<ProductFormPage />} />
                  <Route path="products/:id/edit" element={<ProductFormPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="customers/:id" element={<CustomerDetailPage />} />
                  <Route path="quotations" element={<QuotationsPage />} />
                  <Route path="quotations/new" element={<QuotationFormPage />} />
                  <Route path="quotations/:id" element={<QuotationFormPage />} />
                  <Route path="finance" element={<FinancePage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route index element={<DashboardPage />} />
                </Route>

                {/* Customer Routes (Catch-all layout) */}
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
