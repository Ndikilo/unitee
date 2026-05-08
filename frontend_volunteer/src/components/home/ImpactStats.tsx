import React, { useState, useEffect } from 'react';
import { usePublicStats } from '@/hooks/useApi';

const ImpactStats: React.FC = () => {
  const { data, isLoading: loading } = usePublicStats();
  const [counts, setCounts] = useState({ volunteers: 0, hours: 0, events: 0, communities: 0 });

  useEffect(() => {
    if (!data) return;
    const newTargets = {
      volunteers: data.totalUsers || 0,
      hours: data.totalVolunteerHours || 0,
      events: data.totalOpportunities || 0,
      communities: data.totalCommunities || 0,
    };
    if (Object.values(newTargets).every(v => v === 0)) {
      setCounts(newTargets);
      return;
    }
    const duration = 2000, steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const easeOut = 1 - Math.pow(1 - step / steps, 3);
      setCounts({
        volunteers: Math.floor(newTargets.volunteers * easeOut),
        hours: Math.floor(newTargets.hours * easeOut),
        events: Math.floor(newTargets.events * easeOut),
        communities: Math.floor(newTargets.communities * easeOut),
      });
      if (step >= steps) { clearInterval(timer); setCounts(newTargets); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [data]);

  const stats = [
    { 
      label: 'Active Volunteers', 
      value: counts.volunteers.toLocaleString(), 
      suffix: counts.volunteers > 0 ? '+' : '' 
    },
    { 
      label: 'Hours Contributed', 
      value: counts.hours.toLocaleString(), 
      suffix: counts.hours > 0 ? '+' : '' 
    },
    { 
      label: 'Opportunities Created', 
      value: counts.events.toLocaleString(), 
      suffix: '' 
    },
    { 
      label: 'Communities Served', 
      value: counts.communities.toLocaleString(), 
      suffix: '' 
    }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="text-center">
                <div className="h-12 bg-gray-700 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-gray-700 rounded w-24 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stat.value}{stat.suffix}
              </p>
              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
