import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
  // Redirect to main app with admin dashboard view
  return <Navigate to="/?view=admin" replace />;
};

export default AdminDashboardPage;