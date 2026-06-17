import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Logo from '@/components/Logo';
import {
  BellIcon,
  MenuIcon,
  XIcon,
  UsersIcon,
  TrophyIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  BuildingIcon,
  GlobeIcon,
  CalendarIcon as Calendar,
} from '@/components/icons/Icons';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onGetStarted?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onGetStarted }) => {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'opportunities', label: t('nav.opportunities'), href: '/opportunities' },
    { id: 'communities', label: t('nav.communities'), href: '/communities' },
  ];

  const dashboardLink = user?.role === 'admin'
    ? { id: 'admin-dashboard', label: t('nav.adminPanel'), icon: ShieldCheckIcon, href: '/admin-dashboard' }
    : user?.role === 'organizer'
    ? { id: 'organizer-dashboard', label: t('nav.dashboard'), icon: BuildingIcon, href: '/organizer-dashboard' }
    : { id: 'volunteer-dashboard', label: t('nav.impact'), icon: TrophyIcon, href: '/volunteer-dashboard' };

  const isActive = (id: string) => currentView === id;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white/95 backdrop-blur-md border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center shrink-0">
              <Logo size="md" />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => link.href ? (window.location.href = link.href) : onNavigate(link.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.id)
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => window.location.href = dashboardLink.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(dashboardLink.id)
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {dashboardLink.label}
                </button>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {language === 'en' ? 'FR' : 'EN'}
              </button>

              {authLoading ? (
                // Skeleton placeholder while auth state loads — prevents flash
                <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <button
                    onClick={() => (window.location.href = '/notifications')}
                    className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Notifications"
                  >
                    <BellIcon size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                  </button>

                  {/* User menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=10b981&color=fff&size=64`}
                        alt={user?.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <ChevronDownIcon size={14} className="text-gray-400 hidden sm:block" />
                    </button>

                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            <span className={`inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                              user?.role === 'admin' ? 'bg-purple-100 text-purple-700'
                              : user?.role === 'organizer' ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                            }`}>
                              {user?.role === 'admin' ? 'Administrator' : user?.role === 'organizer' ? 'Organizer' : 'Volunteer'}
                            </span>
                          </div>
                          <div className="py-1.5">
                            {[
                              { label: t('nav.myProfile'), icon: UsersIcon, href: '/profile' },
                              { label: t('nav.myOpportunities'), icon: Calendar, href: '/my-opportunities' },
                              { label: t('nav.settings'), icon: SettingsIcon, href: '/settings' },
                            ].map((item) => (
                              <button
                                key={item.label}
                                onClick={() => { setShowUserMenu(false); window.location.href = item.href; }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <item.icon size={16} className="text-gray-400" />
                                {item.label}
                              </button>
                            ))}
                            <div className="border-t border-gray-100 mt-1 pt-1">
                              <button
                                onClick={() => { logout(); setShowUserMenu(false); onNavigate('home'); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <LogOutIcon size={16} />
                                {t('nav.signOut')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => (window.location.href = '/login')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    onClick={() => onGetStarted?.()}
                    className="px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm"
                  >
                    {t('nav.getStarted')}
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                aria-label="Menu"
              >
                {showMobileMenu ? <XIcon size={22} /> : <MenuIcon size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => { window.location.href = link.href; setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                {link.label}
              </button>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => { window.location.href = dashboardLink.href; setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <dashboardLink.icon size={18} className="text-gray-400" />
                {dashboardLink.label}
              </button>
            )}

            {/* Language toggle — mobile */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 mt-1">
              <GlobeIcon size={15} className="text-gray-400" />
              <button
                onClick={() => setLanguage('en')}
                className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors ${
                  language === 'en' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                EN
              </button>
              <span className="text-gray-300 text-sm">|</span>
              <button
                onClick={() => setLanguage('fr')}
                className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors ${
                  language === 'fr' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                FR
              </button>
            </div>

            {!isAuthenticated && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => { window.location.href = '/login'; setShowMobileMenu(false); }}
                  className="w-full py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  {t('nav.signIn')}
                </button>
                <button
                  onClick={() => { onGetStarted?.(); setShowMobileMenu(false); }}
                  className="w-full py-3 text-sm font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                  {t('nav.getStarted')}
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
