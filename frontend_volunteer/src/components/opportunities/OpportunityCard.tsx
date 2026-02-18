import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/NewAuthContext';
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  HeartIcon,
  CheckIcon
} from '@/components/icons/Icons';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  category: string;
  skills_required?: string[];
  location: string;
  city?: string;
  country?: string;
  start_date: string;
  end_date: string;
  volunteers_needed: number;
  volunteers_accepted?: number;
  hours_per_volunteer?: number;
  is_urgent?: boolean;
  is_emergency?: boolean;
  status?: string;
  is_verified_only?: boolean;
  image_url?: string;
  views?: number;
  organizer_name?: string;
  organizer_verified?: boolean;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApply?: (id: string) => void;
  onViewDetails?: (opportunity: Opportunity) => void;
  isApplied?: boolean;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onApply,
  onViewDetails,
  isApplied = false
}) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [applying, setApplying] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Environment': 'bg-emerald-100 text-emerald-700',
      'Education': 'bg-blue-100 text-blue-700',
      'Healthcare': 'bg-red-100 text-red-700',
      'Humanitarian': 'bg-orange-100 text-orange-700',
      'Social Services': 'bg-purple-100 text-purple-700',
      'Economic Development': 'bg-yellow-100 text-yellow-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const handleApply = async () => {
    if (!onApply || isApplied) return;
    setApplying(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onApply(opportunity.id);
    setApplying(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={opportunity.image_url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800'}
          alt={opportunity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(opportunity.category)}`}>
            {opportunity.category}
          </span>
          {opportunity.is_urgent && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
              <AlertTriangleIcon size={12} />
              {t('opp.urgent')}
            </span>
          )}
          {opportunity.is_emergency && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white flex items-center gap-1 animate-pulse">
              <AlertTriangleIcon size={12} />
              {t('opp.emergency')}
            </span>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
            isSaved
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <HeartIcon size={18} className={isSaved ? 'fill-current' : ''} />
        </button>

        {/* Verified Badge */}
        {opportunity.organizer_verified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-white/90 rounded-full">
            <ShieldCheckIcon size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-gray-700">{t('opp.verified')}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 
          className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onViewDetails?.(opportunity)}
        >
          {opportunity.title}
        </h3>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {opportunity.short_description || opportunity.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPinIcon size={16} className="text-gray-400" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon size={16} className="text-gray-400" />
            <span>{formatDate(opportunity.start_date)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon size={16} className="text-gray-400" />
              <span>{opportunity.hours_per_volunteer || 4} {t('opp.hours')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UsersIcon size={16} className="text-gray-400" />
              <span>{opportunity.volunteers_accepted || 0}/{opportunity.volunteers_needed}</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        {opportunity.skills_required && opportunity.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {opportunity.skills_required.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
              >
                {skill}
              </span>
            ))}
            {opportunity.skills_required.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-md">
                +{opportunity.skills_required.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={isApplied || applying || !isAuthenticated}
          className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            isApplied
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isApplied ? (
            <>
              <CheckIcon size={18} />
              {t('opp.applied')}
            </>
          ) : applying ? (
            <span className="animate-pulse">{t('common.loading')}</span>
          ) : (
            t('opp.apply')
          )}
        </button>
      </div>
    </div>
  );
};

export default OpportunityCard;
