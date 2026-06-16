import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import Logo from '@/components/Logo';
import {
  Bell, ChevronDown, LogOut, Settings, User,
  LayoutDashboard, Users, Building, PlusCircle, Menu, X
} from 'lucide-react';

const OrganizerHeader: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'applications';

  const navLinks = [
    { label: 'Applications', href: '/organizer-dashboard?tab=applications', icon: Users },
    { label: 'Opportunities', href: '/organizer-dashboard?tab=opportunities', icon: LayoutDashboard },
    { label: 'Profile', href: '/profile', icon: Building },
    { label: 'Notifications', href: '/notifications', icon: Bell },
  ];

  const isActive = (href: string) => {
    const tabMatch = href.match(/\?tab=(.+)/);
    if (tabMatch) return location.pathname === '/organizer-dashboard' && activeTab === tabMatch[1];
    return location.pathname === href;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + org badge */}
          <div className="flex items-center gap-3">
            <Link to="/organizer-dashboard"><Logo size="sm" /></Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Organizer
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.label} to={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <link.icon size={15} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Quick create button */}
            <Link to="/organizer-dashboard?tab=opportunities"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              <PlusCircle size={15} />
              New Opportunity
            </Link>

            <Link to="/notifications"
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </Link>

            {!loading && user && (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors">
                  <img
                    src={(user as any).profile?.avatar || (user as any).organization?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'O')}&background=2563eb&color=fff&size=64`}
                    alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-none truncate max-w-[120px]">
                      {(user as any).organizationName || user.name?.split(' ')[0]}
                    </p>
                    <p className="text-xs text-blue-600 mt-0.5">Organization</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                        <p className="font-semibold text-gray-900 text-sm">
                          {(user as any).organizationName || user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          Organizer Account
                        </span>
                      </div>
                      <div className="py-1.5">
                        {[
                          { label: 'Profile', icon: User, href: '/profile' },
                          { label: 'Settings', icon: Settings, href: '/settings' },
                        ].map(item => (
                          <Link key={item.label} to={item.href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <item.icon size={15} className="text-gray-400" />{item.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                            <LogOut size={15} />Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <button onClick={() => setShowMobile(!showMobile)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              {showMobile ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobile && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link key={link.label} to={link.href}
              onClick={() => setShowMobile(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              <link.icon size={18} />{link.label}
            </Link>
          ))}
          <Link to="/organizer-dashboard?tab=opportunities"
            onClick={() => setShowMobile(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-blue-600 text-white">
            <PlusCircle size={18} />New Opportunity
          </Link>
          <div className="border-t border-gray-100 pt-2">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl">
              <LogOut size={18} />Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default OrganizerHeader;
