import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Skeleton from '../ui/Skeleton';

/**
 * ProtectedRoute — enforces authentication and role-based access.
 *
 * Usage:
 *   <ProtectedRoute />                  → any authenticated user
 *   <ProtectedRoute allowedRole="ADMIN"> → ADMIN only
 *   <ProtectedRoute allowedRole="RENTER"> → RENTER only
 *
 * Redirect logic when the wrong role tries to access:
 *   ADMIN on a RENTER route  → /admin/dashboard
 *   RENTER on an ADMIN route → /renter/dashboard
 *   Anyone else              → /
 */
const ProtectedRoute = ({ allowedRole = null, children }) => {
  const { isAuthenticated, user, loading, isAdmin } = useAuth();
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
  const isAdminUser = isAdmin || role === 'ADMIN' || user?.is_staff || user?.is_superuser;
  const isRenterUser = role === 'RENTER';

  if (allowedRole) {
    const required = String(allowedRole).toUpperCase();

    if (required === 'ADMIN') {
      if (!isAdminUser) {
        // Wrong role — send to correct portal
        if (isRenterUser) return <Navigate to="/renter/dashboard" replace />;
        return <Navigate to="/" replace />;
      }
    } else if (required === 'RENTER') {
      if (!isRenterUser) {
        if (isAdminUser) return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/" replace />;
      }
    } else {
      // Generic role check
      if (role !== required) {
        if (isAdminUser) return <Navigate to="/admin/dashboard" replace />;
        if (isRenterUser) return <Navigate to="/renter/dashboard" replace />;
        return <Navigate to="/" replace />;
      }
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
