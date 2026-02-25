import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/NewAuthContext';
import { UsersIcon, MapPinIcon, CheckIcon, MessageCircleIcon } from '@/components/icons/Icons';

export interface Community {
  id: string;
  name: string;
  description?: string;
  location?: string;
  city?: string;
  country?: string;
  image_url?: string;
  member_count: number;
  is_public?: boolean;
  requires_approval?: boolean;
}

interface CommunityCardProps {
  community: Community;
  onJoin?: (id: string) => void;
  onViewDetails?: (community: Community) => void;
  isJoined?: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onJoin,
  onViewDetails,
  isJoined = false
}) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!onJoin || isJoined) return;
    setJoining(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onJoin(community.id);
    setJoining(false);
  };

  const getCommunityImage = () => {
    // Use community image if available, otherwise use placeholder
    return community.image_url || '/placeholder.svg';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={getCommunityImage()}
          alt={community.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Member Count Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
          <UsersIcon size={14} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {community.member_count.toLocaleString()} {t('comm.members')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 
          className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onViewDetails?.(community)}
        >
          {community.name}
        </h3>
        
        {community.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {community.description}
          </p>
        )}

        {/* Location */}
        {community.city && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MapPinIcon size={14} className="text-gray-400" />
            <span>{community.city}, {community.country || 'Cameroon'}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleJoin}
            disabled={isJoined || joining || !isAuthenticated}
            className={`flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isJoined
                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isJoined ? (
              <>
                <CheckIcon size={16} />
                {t('comm.joined')}
              </>
            ) : joining ? (
              <span className="animate-pulse">{t('common.loading')}</span>
            ) : (
              t('comm.join')
            )}
          </button>
          
          {isJoined && (
            <button
              onClick={() => onViewDetails?.(community)}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <MessageCircleIcon size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
