import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/NewAuthContext';
import { adminAPI } from '@/lib/api';
import { ChevronRightIcon, UsersIcon, ClockIcon, BuildingIcon, GlobeIcon } from '@/components/icons/Icons';

interface HeroSectionProps {
  onGetStarted: () => void;
  onRegisterNGO: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onRegisterNGO }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    volunteers: 0,
    hours: 0,
    organizations: 0,
    communities: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAPI.getStats();
        setStats({
          volunteers: data.totalUsers || 0,
          hours: data.totalVolunteerHours || 0,
          organizations: data.totalOrganizations || 0,
          communities: data.totalCommunities || 0
        });
      } catch (error) {
        // Silently fail for unauthorized access - use default stats
        setStats({
          volunteers: 150,
          hours: 2500,
          organizations: 25,
          communities: 12
        });
      }
    };

    fetchStats();
  }, []);

  const statsDisplay = [
    { 
      icon: UsersIcon, 
      value: stats.volunteers > 0 ? `${stats.volunteers.toLocaleString()}+` : '0', 
      label: t('stats.volunteers'), 
      color: 'text-blue-600' 
    },
    { 
      icon: ClockIcon, 
      value: stats.hours > 0 ? `${stats.hours.toLocaleString()}+` : '0', 
      label: t('stats.hours'), 
      color: 'text-emerald-600' 
    },
    { 
      icon: BuildingIcon, 
      value: stats.organizations > 0 ? `${stats.organizations.toLocaleString()}+` : '0', 
      label: t('stats.organizations'), 
      color: 'text-purple-600' 
    },
    { 
      icon: GlobeIcon, 
      value: stats.communities > 0 ? `${stats.communities.toLocaleString()}+` : '0', 
      label: t('stats.communities'), 
      color: 'text-orange-600' 
    }
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80"
          alt="Volunteers working together"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">
              Empowering communities across Cameroon
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t('hero.title').split('.').map((part, i) => (
              <span key={i}>
                {part}
                {i < 2 && (
                  <span className={`${
                    i === 0 ? 'text-blue-400' : i === 1 ? 'text-emerald-400' : 'text-purple-400'
                  }`}>.</span>
                )}
                {i < 2 && <br />}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {isAuthenticated ? 'Browse Opportunities' : t('hero.cta')}
              <ChevronRightIcon size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onRegisterNGO}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              {t('hero.ctaOrg')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsDisplay.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all"
              >
                <stat.icon size={28} className={`${stat.color} mb-3`} />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/50 text-sm">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
