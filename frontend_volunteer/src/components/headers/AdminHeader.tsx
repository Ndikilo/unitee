import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import Logo from '@/components/Logo';
import {
  Bell, ChevronDown, LogOut, Settings,
  LayoutDashboard, Users, Briefcase, Flag, Shield,
  Award, AlertTriangle, Menu, X, Activity
} from 'lucide-react';

const AdminHeader: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  const navLinks = [
    { label: 'Overview', href: '/admin-dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin-dashboard', icon: Users },
    { label: 'Opportunities', href: '/admin-dashboard', icon: Briefcase },
    { label: 'Reports', href: '/admin-dashboard', icon: Flag },
    { label: 'Badges', href: '/admin-dashboard', icon: Award },
    { label: 'Alerts', href: '/admin-dashboard', icon: AlertTriangle },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + admin badge */}
          <div className="flex items-center gap-3">
            <Link to="/admin-dashboard"><Logo size="sm" showText={false} /></Link>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">UNITEE</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                <Shield size={10} />ADMIN
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link key={link.label} to={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                <link.icon size={14} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* System status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Activity size={12} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">System OK</span>
            </div>

            <Link to="/notifications"
              className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-gray-900" />
            </Link>

            {!loading && user && (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/10 transition-colors">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'A')}&background=ef4444&color=fff&size=64`}
                    alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-white leading-none">{user.name?.split(' ')[0]}</p>
                    <p className="text-xs text-red-400 mt-0.5">Administrator</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-60 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden z-20">
                      <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
                        <p className="font-semibold text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-400">
                          <Shield size={10} />Administrator
                        </span>
                      </div>
                      <div className="py-1.5">
                        {[
                          { label: 'Settings', icon: Settings, href: '/settings' },
                        ].map(item => (
                          <Link key={item.label} to={item.href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                            <item.icon size={15} className="text-gray-500" />{item.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-700 mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
                            <LogOut size={15} />Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <button onClick={() => setShowMobile(!showMobile)} className="lg:hidden p-2 text-gray-400 hover:bg-white/10 rounded-lg">
              {showMobile ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobile && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link key={link.label} to={link.href}
              onClick={() => setShowMobile(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">
              <link.icon size={18} />{link.label}
            </Link>
          ))}
          <div className="border-t border-gray-800 pt-2">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl">
              <LogOut size={18} />Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
