import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import VolunteerDashboard from '@/components/dashboard/VolunteerDashboard';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <VolunteerDashboard />
    </DashboardLayout>
  );
};

export default Dashboard;
