import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedDashboard: React.FC = () => {
  // Redirect to main app with dashboard view - AppLayout will handle role-based dashboard display
  return <Navigate to="/?view=dashboard" replace />;
};

export default RoleBasedDashboard;