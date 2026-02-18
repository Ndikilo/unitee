import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { opportunityAPI } from '@/lib/api';
import OpportunityCard, { Opportunity } from '@/components/opportunities/OpportunityCard';
import OpportunityDetailModal from '@/components/opportunities/OpportunityDetailModal';
import { ChevronRightIcon } from '@/components/icons/Icons';

interface FeaturedOpportunitiesProps {
  onViewAll: () => void;
}

const FeaturedOpportunities: React.FC<FeaturedOpportunitiesProps> = ({ onViewAll }) => {
  const { t } = useLanguage();
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [featuredOpportunities, setFeaturedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedOpportunities = async () => {
      try {
        setLoading(true);
        const data = await opportunityAPI.getAll({ limit: 4, featured: true });
        setFeaturedOpportunities(data || []);
      } catch (error) {
        console.error('Failed to fetch featured opportunities:', error);
        setFeaturedOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedOpportunities();
  }, []);

  const handleApply = (id: string) => {
    setAppliedIds(prev => new Set([...prev, id]));
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Featured Opportunities
              </h2>
              <p className="text-gray-600 text-lg">
                Make an impact with these high-priority volunteer opportunities
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-12 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Featured Opportunities
            </h2>
            <p className="text-gray-600 text-lg">
              Make an impact with these high-priority volunteer opportunities
            </p>
          </div>
          <button
            onClick={onViewAll}
            className="group flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            {t('common.viewAll')}
            <ChevronRightIcon size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Grid */}
        {featuredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onApply={handleApply}
                onViewDetails={setSelectedOpportunity}
                isApplied={appliedIds.has(opportunity.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Featured Opportunities Yet</h3>
            <p className="text-gray-500 mb-6">
              Check back soon for exciting volunteer opportunities in your area.
            </p>
            <button
              onClick={onViewAll}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse All Opportunities
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        isOpen={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onApply={handleApply}
        isApplied={selectedOpportunity ? appliedIds.has(selectedOpportunity.id) : false}
      />
    </section>
  );
};

export default FeaturedOpportunities;
