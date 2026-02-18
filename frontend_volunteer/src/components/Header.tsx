import React, { useState } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthModal from '@/components/auth/AuthModal';
import {
  GlobeIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  HomeIcon,
  UsersIcon,
  TrophyIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  BuildingIcon,
  BarChartIcon,
  CalendarIcon as Calendar
} from '@/components/icons/Icons';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: HomeIcon },
    { id: 'opportunities', label: t('nav.opportunities'), icon: UsersIcon, link: '/opportunities' },
    { id: 'communities', label: t('nav.communities'), icon: UsersIcon, link: '/communities' },
  ];

  const userNavItems = user?.role === 'admin'
    ? [
        { id: 'dashboard', label: t('nav.dashboard'), icon: BarChartIcon, link: '/admin-dashboard' },
        { id: 'admin', label: t('nav.admin'), icon: ShieldCheckIcon, link: '/admin-dashboard' }
      ]
    : user?.role === 'organizer'
    ? [
        { id: 'dashboard', label: t('nav.dashboard'), icon: BuildingIcon, link: '/organizer-dashboard' }
      ]
    : [
        { id: 'impact', label: t('nav.impact'), icon: TrophyIcon, link: '/volunteer-dashboard' }
      ];

  const notifications = [
    { id: 1, title: 'Application Accepted', message: 'Your application for Beach Cleanup was accepted!', time: '2h ago', unread: true },
    { id: 2, title: 'New Opportunity', message: 'A new event matches your interests in Douala', time: '5h ago', unread: true },
    { id: 3, title: 'Badge Earned', message: 'You earned the "First Steps" badge!', time: '1d ago', unread: false }
  ];

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center">
                  <GlobeIcon className="text-white" size={22} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  UNITEE
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.link ? window.location.href = item.link : onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {isAuthenticated && userNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.link ? window.location.href = item.link : onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {language === 'en' ? 'FR' : 'EN'}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => window.location.href = '/notifications'}
                      className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <BellIcon size={20} />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=3b82f6&color=fff`}
                        alt={user?.full_name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <ChevronDownIcon size={16} className="text-gray-400 hidden sm:block" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user?.full_name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                            user?.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : user?.role === 'organizer'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user?.role === 'admin' ? 'Administrator' : user?.role === 'organizer' ? 'NGO/Organizer' : 'Volunteer'}
                          </span>
                        </div>
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              window.location.href = '/profile';
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <UsersIcon size={18} />
                            <span>My Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              window.location.href = '/my-opportunities';
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <Calendar size={18} />
                            <span>My Opportunities</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onNavigate('settings');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <SettingsIcon size={18} />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={() => {
                              signOut();
                              setShowUserMenu(false);
                              onNavigate('home');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
                          >
                            <LogOutIcon size={18} />
                            <span>{t('nav.signOut')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => openAuth('signin')}
                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    onClick={() => openAuth('signup')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    {t('nav.signUp')}
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {showMobileMenu ? <XIcon size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
              {isAuthenticated && userNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <button
                    onClick={() => {
                      openAuth('signin');
                      setShowMobileMenu(false);
                    }}
                    className="w-full py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    onClick={() => {
                      openAuth('signup');
                      setShowMobileMenu(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg"
                  >
                    {t('nav.signUp')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;
