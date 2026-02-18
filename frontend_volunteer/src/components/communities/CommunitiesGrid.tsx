import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { communityAPI } from '@/lib/api';
import CommunityCard, { Community } from './CommunityCard';
import CommunityDetailModal from './CommunityDetailModal';
import { SearchIcon, PlusIcon, MapPinIcon, ChevronDownIcon } from '@/components/icons/Icons';

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

const CommunitiesGrid: React.FC = () => {
  const { t } = useLanguage();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  const sampleCommunities: Community[] = [];

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const data = await communityAPI.getAll();
        // Ensure data is always an array
        const communitiesArray = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
        setCommunities(communitiesArray);
      } catch (err) {
        console.log('No communities found:', err);
        setCommunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const filteredCommunities = useMemo(() => {
    // Ensure communities is always an array before filtering
    const communitiesArray = Array.isArray(communities) ? communities : [];
    return communitiesArray.filter((comm) => {
      const matchesSearch = searchQuery === '' ||
        comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (comm.description && comm.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCity = selectedCity === 'All Cities' ||
        comm.city === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [communities, searchQuery, selectedCity]);

  const handleJoin = (id: string) => {
    setJoinedIds(prev => new Set([...prev, id]));
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('nav.communities')}</h1>
          <p className="text-gray-600">Join local groups and make an impact in your neighborhood</p>
        </div>
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all">
          <PlusIcon size={20} />
          {t('comm.create')}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
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
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{filteredCommunities.length}</span> communities found
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No communities found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or create a new community</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onJoin={handleJoin}
              onViewDetails={setSelectedCommunity}
              isJoined={joinedIds.has(community.id)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <CommunityDetailModal
        community={selectedCommunity}
        isOpen={!!selectedCommunity}
        onClose={() => setSelectedCommunity(null)}
        onJoin={handleJoin}
        isJoined={selectedCommunity ? joinedIds.has(selectedCommunity.id) : false}
      />
    </div>
  );
};

export default CommunitiesGrid;
