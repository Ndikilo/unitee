import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect to the proper organizer dashboard route
const OrganizerDashboard: React.FC = () => {
  return <Navigate to="/organizer-dashboard" replace />;
};

export default OrganizerDashboard;
