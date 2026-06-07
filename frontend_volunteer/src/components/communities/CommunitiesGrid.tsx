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

  const sampleCommunities: Community[] = [
    {
      id: 'comm-1',
      name: 'Douala Green Warriors',
      description: 'Environmental activists working to make Douala cleaner and greener. Join us for regular cleanup drives and tree planting initiatives.',
      location: 'Douala',
      city: 'Douala',
      country: 'Cameroon',
      member_count: 156,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'
    },
    {
      id: 'comm-2',
      name: 'Yaoundé Youth Network',
      description: 'Connecting young volunteers across the capital city. We organize events, workshops, and community service projects.',
      location: 'Yaoundé',
      city: 'Yaoundé',
      country: 'Cameroon',
      member_count: 243,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'
    },
    {
      id: 'comm-3',
      name: 'Buea Tech Volunteers',
      description: 'Tech professionals giving back to the community through coding workshops, digital literacy programs, and tech support.',
      location: 'Buea',
      city: 'Buea',
      country: 'Cameroon',
      member_count: 89,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800'
    },
    {
      id: 'comm-4',
      name: 'Limbe Coastal Guardians',
      description: 'Protecting our beaches and marine ecosystems. Regular beach cleanups and environmental awareness campaigns.',
      location: 'Limbe',
      city: 'Limbe',
      country: 'Cameroon',
      member_count: 67,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800'
    },
    {
      id: 'comm-5',
      name: 'Bamenda Health Heroes',
      description: 'Healthcare volunteers serving the Northwest region. Medical outreach, health education, and community support.',
      location: 'Bamenda',
      city: 'Bamenda',
      country: 'Cameroon',
      member_count: 112,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'
    },
    {
      id: 'comm-6',
      name: 'Kribi Beach Volunteers',
      description: 'Dedicated to preserving the beauty of Kribi beaches and supporting local fishing communities.',
      location: 'Kribi',
      city: 'Kribi',
      country: 'Cameroon',
      member_count: 45,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
    },
    {
      id: 'comm-7',
      name: 'Bafoussam Women Empowerment',
      description: 'Supporting women entrepreneurs and promoting gender equality through skills training and mentorship.',
      location: 'Bafoussam',
      city: 'Bafoussam',
      country: 'Cameroon',
      member_count: 78,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800'
    },
    {
      id: 'comm-8',
      name: 'Douala Education Alliance',
      description: 'Teachers and education advocates working to improve literacy and access to education in underserved areas.',
      location: 'Douala',
      city: 'Douala',
      country: 'Cameroon',
      member_count: 134,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800'
    },
    {
      id: 'comm-9',
      name: 'Yaoundé Food Bank Network',
      description: 'Fighting hunger in the capital through food collection, distribution, and community kitchens.',
      location: 'Yaoundé',
      city: 'Yaoundé',
      country: 'Cameroon',
      member_count: 198,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'
    },
    {
      id: 'comm-10',
      name: 'Cameroon Animal Welfare',
      description: 'Protecting and caring for animals across Cameroon. Rescue operations, shelter support, and awareness campaigns.',
      location: 'Douala',
      city: 'Douala',
      country: 'Cameroon',
      member_count: 56,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'
    },
    {
      id: 'comm-11',
      name: 'Buea Mountain Hikers',
      description: 'Adventure volunteers who combine hiking with environmental conservation on Mount Cameroon.',
      location: 'Buea',
      city: 'Buea',
      country: 'Cameroon',
      member_count: 92,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'
    },
    {
      id: 'comm-12',
      name: 'Limbe Youth Sports Club',
      description: 'Promoting sports and healthy lifestyles among youth through coaching, tournaments, and fitness programs.',
      location: 'Limbe',
      city: 'Limbe',
      country: 'Cameroon',
      member_count: 145,
      is_public: true,
      image_url: 'https://images.unsplash.com/photo-1461896836934- voices-of-africa?w=800'
    }
  ];

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const data = await communityAPI.getAll();
        if (data && data.length > 0) {
          setCommunities(data);
        } else {
          setCommunities(sampleCommunities);
        }
      } catch (err) {
        console.log('Using sample data:', err);
        setCommunities(sampleCommunities);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const filteredCommunities = useMemo(() => {
    return communities.filter((comm) => {
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
