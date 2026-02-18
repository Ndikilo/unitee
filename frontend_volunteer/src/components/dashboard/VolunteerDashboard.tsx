import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { opportunityAPI } from '@/lib/api';
import CertificateManager from '@/components/certificates/CertificateManager';
import {
  ClockIcon,
  TrophyIcon,
  UsersIcon,
  CalendarIcon,
  AwardIcon,
  DownloadIcon,
  ChevronRightIcon,
  CheckIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@/components/icons/Icons';

const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Try to get language context, but provide fallback if not available
  let t = (key: string) => key; // Default fallback function
  try {
    const { t: translateFn } = useLanguage();
    t = translateFn;
  } catch (error) {
    console.log('Language context not available, using fallback');
  }
  
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'badges' | 'certificates'>('overview');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Default badges data
  const defaultBadges = [
    { id: 1, name: 'First Steps', description: 'Completed first volunteer event', icon: '🎯', earned: true, date: 'Dec 15, 2025', progress: 0 },
    { id: 2, name: 'Dedicated Helper', description: 'Completed 5 events', icon: '💪', earned: true, date: 'Jan 5, 2026', progress: 0 },
    { id: 3, name: 'Time Giver', description: 'Logged 10+ hours', icon: '⏰', earned: true, date: 'Jan 8, 2026', progress: 0 },
    { id: 4, name: 'Community Builder', description: 'Joined 3 communities', icon: '🏘️', earned: true, date: 'Jan 10, 2026', progress: 0 },
    { id: 5, name: 'Skill Master', description: 'Added 5 skills', icon: '🌟', earned: true, date: 'Jan 12, 2026', progress: 0 },
    { id: 6, name: 'Community Champion', description: 'Complete 10 events', icon: '🏆', earned: false, progress: 80, date: '' },
    { id: 7, name: 'Hundred Hours Hero', description: 'Log 100 hours', icon: '💯', earned: false, progress: 45, date: '' },
    { id: 8, name: 'Local Leader', description: 'Lead a community', icon: '👑', earned: false, progress: 0, date: '' }
  ];

  const impactStats = [
    { label: t('impact.hours'), value: user?.stats?.totalHours || 0, icon: ClockIcon, color: 'bg-blue-500' },
    { label: t('impact.events'), value: user?.stats?.totalEvents || 0, icon: CalendarIcon, color: 'bg-emerald-500' },
    { label: t('impact.helped'), value: user?.stats?.peopleHelped || 0, icon: UsersIcon, color: 'bg-purple-500' },
    { label: t('impact.badges'), value: user?.stats?.badges?.length || 0, icon: TrophyIcon, color: 'bg-amber-500' }
  ];

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const data = await opportunityAPI.getUserOpportunities('registered');
        setApplications(data || []);
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadApplications();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=3b82f6&color=fff&size=128`}
            alt={user?.full_name}
            className="w-20 h-20 rounded-2xl object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
            <p className="text-gray-500">{user?.city || 'Cameroon'} • Volunteer since Dec 2025</p>
            {user?.is_verified && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                <CheckIcon size={12} />
                Verified Volunteer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {impactStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'applications', label: 'My Applications' },
              { id: 'badges', label: t('impact.badges') },
              { id: 'certificates', label: 'Certificates' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Volunteer Passport */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t('impact.passport')}</h3>
                    <p className="text-blue-100 text-sm">Your digital volunteer identity</p>
                  </div>
                  <AwardIcon size={32} className="text-blue-200" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-blue-200 text-xs">Total Hours</p>
                    <p className="text-2xl font-bold">{user?.stats?.totalHours || 0}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">Events</p>
                    <p className="text-2xl font-bold">{user?.stats?.totalEvents || 0}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">Badges</p>
                    <p className="text-2xl font-bold">{user?.stats?.badges?.length || 0}</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <DownloadIcon size={18} />
                  {t('impact.certificate')}
                </button>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{app.title}</p>
                        <p className="text-sm text-gray-500">{app.organization}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">{app.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{app.organization}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={12} />
                        {app.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon size={12} />
                        {app.location}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon size={20} className="text-gray-400" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {defaultBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl text-center transition-all ${
                    badge.earned
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200'
                      : 'bg-gray-50 border-2 border-gray-100 opacity-60'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{badge.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
                  {badge.earned ? (
                    <p className="text-xs text-amber-600 font-medium">{badge.date}</p>
                  ) : (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{badge.progress}%</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'certificates' && (
            <CertificateManager />
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
