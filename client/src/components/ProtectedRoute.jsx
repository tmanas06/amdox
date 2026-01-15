import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 * 
 * @param {React.ReactNode} children - Child components to render
 * @param {string} redirectTo - Path to redirect to if not authenticated (default: '/login')
 */
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show loading spinner or skeleton while checking auth
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
