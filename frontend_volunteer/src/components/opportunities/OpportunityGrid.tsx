import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { opportunityAPI } from '@/lib/api';
import OpportunityCard, { Opportunity } from './OpportunityCard';
import OpportunityDetailModal from './OpportunityDetailModal';
import {
  SearchIcon,
  FilterIcon,
  MapPinIcon,
  ChevronDownIcon,
  XIcon
} from '@/components/icons/Icons';

const categories = [
  'All Categories',
  'Environment',
  'Education',
  'Healthcare',
  'Humanitarian',
  'Social Services',
  'Economic Development'
];

const cities = [
  'All Cities',
  'Douala',
  'Yaoundé',
  'Buea',
  'Limbe',
  'Bamenda',
  'Kribi',
  'Bafoussam'
];

const OpportunityGrid: React.FC = () => {
  const { t } = useLanguage();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [showFilters, setShowFilters] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);



  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const data = await opportunityAPI.getAll();
        // Ensure data is always an array
        const opportunitiesArray = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
        setOpportunities(opportunitiesArray);
      } catch (err) {
        console.error('Failed to fetch opportunities:', err);
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const filteredOpportunities = useMemo(() => {
    // Ensure opportunities is always an array before filtering
    const opportunitiesArray = Array.isArray(opportunities) ? opportunities : [];
    return opportunitiesArray.filter((opp) => {
      const matchesSearch = searchQuery === '' ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All Categories' ||
        opp.category === selectedCategory;

      const matchesCity = selectedCity === 'All Cities' ||
        opp.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [opportunities, searchQuery, selectedCategory, selectedCity]);

  const handleApply = (id: string) => {
    setAppliedIds(prev => new Set([...prev, id]));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedCity('All Cities');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All Categories' || selectedCity !== 'All Cities';

  return (
    <div className="py-8">
      {/* Search & Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('opp.search')}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Category */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* City */}
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="appearance-none pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XIcon size={18} />
                Clear
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl"
          >
            <FilterIcon size={20} />
            <span>{t('opp.filter')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="lg:hidden mt-4 p-4 bg-white border border-gray-200 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('opp.category')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('opp.location')}</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-3 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{filteredOpportunities.length}</span> opportunities found
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
      ) : filteredOpportunities.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onApply={handleApply}
              onViewDetails={setSelectedOpportunity}
              isApplied={appliedIds.has(opportunity.id)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        isOpen={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onApply={handleApply}
        isApplied={selectedOpportunity ? appliedIds.has(selectedOpportunity.id) : false}
      />
    </div>
  );
};

export default OpportunityGrid;
