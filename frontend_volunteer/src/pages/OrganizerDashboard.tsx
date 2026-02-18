import React from 'react';
import { Navigate } from 'react-router-dom';

const OrganizerDashboard: React.FC = () => {
  // Redirect to main app with dashboard view
  return <Navigate to="/?view=dashboard" replace />;
};

export default OrganizerDashboard;