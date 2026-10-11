import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

/**
 * AdminRoute Component
 * Protects routes that require admin role
 * Redirects to home page with error message if user is not admin
 */
const AdminRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    toast.error('Please login to access admin panel');
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  // Redirect to home with error if not admin
  if (!isAdmin) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  // Render child routes if admin
  return <Outlet />;
};

export default AdminRoute;