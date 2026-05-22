import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';

const RoleBasedDashboard: React.FC = () => {
  const { user, loading } = useAuth();

  // Wait for auth to resolve before redirecting
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    );
  }

  const type = user?.userType || user?.role;

  if (type === 'admin') return <Navigate to="/admin-dashboard" replace />;
  if (type === 'organization' || type === 'organizer') return <Navigate to="/organizer-dashboard" replace />;
  return <Navigate to="/volunteer-dashboard" replace />;
};

export default RoleBasedDashboard;
