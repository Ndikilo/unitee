import React from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import VolunteerHeader from './headers/VolunteerHeader';
import OrganizerHeader from './headers/OrganizerHeader';
import AdminHeader from './headers/AdminHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  const Header = user?.userType === 'admin' || user?.role === 'admin'
    ? AdminHeader
    : user?.userType === 'organization' || user?.role === 'organizer'
    ? OrganizerHeader
    : VolunteerHeader;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
