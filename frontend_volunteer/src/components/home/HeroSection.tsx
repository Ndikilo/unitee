import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { ChevronRightIcon, UsersIcon, ClockIcon, BuildingIcon, GlobeIcon } from '@/components/icons/Icons';
import { usePublicStats } from '@/hooks/useApi';

// Curated Unsplash images of volunteers in Africa/Cameroon context
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80&auto=format&fit=crop', // volunteers group
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&q=80&auto=format&fit=crop', // community work
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&q=80&auto=format&fit=crop', // helping hands
];

interface HeroSectionProps {
  onGetStarted: () => void;
  onRegisterNGO: () => void;
  onStartVolunteering?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onRegisterNGO, onStartVolunteering }) => {
  const { isAuthenticated } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const { data: statsData } = usePublicStats();
  const stats = {
    volunteers: statsData?.totalUsers || 0,
    hours: statsData?.totalVolunteerHours || 0,
    organizations: statsData?.totalOrganizations || 0,
    communities: statsData?.totalCommunities || 0,
  };

  useEffect(() => {
    const timer = setInterval(() => setActiveImage(i => (i + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const statsDisplay = [
    { icon: UsersIcon, value: stats.volunteers > 0 ? `${stats.volunteers.toLocaleString()}+` : '—', label: 'Volunteers', color: 'text-orange-400' },
    { icon: ClockIcon, value: stats.hours > 0 ? `${stats.hours.toLocaleString()}+` : '—', label: 'Hours Given', color: 'text-green-400' },
    { icon: BuildingIcon, value: stats.organizations > 0 ? `${stats.organizations.toLocaleString()}+` : '—', label: 'Organizations', color: 'text-blue-400' },
    { icon: GlobeIcon, value: stats.communities > 0 ? `${stats.communities.toLocaleString()}+` : '—', label: 'Communities', color: 'text-orange-300' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Slideshow Background */}
      {HERO_IMAGES.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === activeImage ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/75 to-gray-900/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />

      {/* Slide indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveImage(i)}
            className={`h-1 rounded-full transition-all duration-300 ${i === activeImage ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="max-w-2xl">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 backdrop-blur-sm rounded-full border border-orange-400/30 mb-8">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-orange-300 text-sm font-medium tracking-wide">Empowering communities across Cameroon</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Volunteer.<br />
            <span className="text-green-400">Connect.</span><br />
            <span className="text-blue-400">Transform.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/75 mb-10 leading-relaxed max-w-xl">
            Join a growing movement of changemakers. Find verified volunteer opportunities, build your impact portfolio, and earn recognition for your service.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
            >
              {isAuthenticated ? 'Browse Opportunities' : 'Get Started Free'}
              <ChevronRightIcon size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onStartVolunteering ?? onGetStarted}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/25 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              Volunteer
            </button>
            <button
              onClick={onRegisterNGO}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/25 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              Register Your NGO
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statsDisplay.map((stat, i) => (
              <div key={i} className="bg-white/8 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <stat.icon size={22} className={`${stat.color} mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/55 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
