import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Skeleton from '../ui/Skeleton';

/**
 * ProtectedRoute — enforces authentication and role-based access.
 *
 * Usage:
 *   <ProtectedRoute />                   → any authenticated user
 *   <ProtectedRoute allowedRole="STAFF"> → Vendor (STAFF role) only
 *
 * Two front-end portals exist: Vendor (/vendor) and Customer (/).
 * Admin management is handled exclusively via Django Admin (/django-admin/).
 */
const ProtectedRoute = ({ allowedRole = null, children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  // Not logged in → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = String(user?.role || '').toUpperCase();
  const isVendorUser = role === 'STAFF';

  if (allowedRole) {
    const required = String(allowedRole).toUpperCase();

    if (required === 'STAFF') {
      if (!isVendorUser) {
        return <Navigate to="/" replace />;
      }
    } else {
      // Generic role check
      if (role !== required) {
        if (isVendorUser) return <Navigate to="/vendor/dashboard" replace />;
        return <Navigate to="/" replace />;
      }
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
