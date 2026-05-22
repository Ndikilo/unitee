import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import Logo from '@/components/Logo';
import {
  Bell, ChevronDown, LogOut, Settings, User,
  LayoutDashboard, Briefcase, Users, Award, FileText, Menu, X
} from 'lucide-react';

const VolunteerHeader: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  const navLinks = [
    { label: 'Dashboard', href: '/volunteer-dashboard', icon: LayoutDashboard },
    { label: 'Opportunities', href: '/opportunities', icon: Briefcase },
    { label: 'My Activities', href: '/my-opportunities', icon: Award },
    { label: 'Communities', href: '/communities', icon: Users },
    { label: 'Certificates', href: '/volunteer-dashboard?tab=certificates', icon: FileText },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/volunteer-dashboard"><Logo size="sm" /></Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <link.icon size={15} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
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
                    src={user.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'V')}&background=f97316&color=fff&size=64`}
                    alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-none">{user.name?.split(' ')[0]}</p>
                    <p className="text-xs text-orange-500 mt-0.5">Volunteer</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                      <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                        <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1.5">
                        {[
                          { label: 'My Profile', icon: User, href: '/profile' },
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
            <Link key={link.href} to={link.href}
              onClick={() => setShowMobile(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                isActive(link.href) ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              <link.icon size={18} />{link.label}
            </Link>
          ))}
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

export default VolunteerHeader;
