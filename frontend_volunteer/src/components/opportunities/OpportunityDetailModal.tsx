import React from 'react';
import Modal from '@/components/ui/Modal';
import { Opportunity } from './OpportunityCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/NewAuthContext';
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  CheckIcon,
  BuildingIcon
} from '@/components/icons/Icons';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (id: string) => void;
  isApplied: boolean;
}

const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onApply,
  isApplied
}) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  if (!opportunity) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const spotsLeft = opportunity.volunteers_needed - (opportunity.volunteers_accepted || 0);
  const progressPercent = ((opportunity.volunteers_accepted || 0) / opportunity.volunteers_needed) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {/* Hero Image */}
      <div className="relative h-64 sm:h-80">
        <img
          src={opportunity.image_url || '/placeholder.svg'}
          alt={opportunity.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getCategoryColor(opportunity.category)}`}>
            {opportunity.category}
          </span>
          {opportunity.is_urgent && (
            <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
              <AlertTriangleIcon size={14} />
              Urgent
            </span>
          )}
          {opportunity.is_emergency && (
            <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-red-500 text-white flex items-center gap-1 animate-pulse">
              <AlertTriangleIcon size={14} />
              Emergency
            </span>
          )}
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{opportunity.title}</h2>
          {opportunity.organizer_name && (
            <div className="flex items-center gap-2">
              <BuildingIcon size={16} className="text-white/80" />
              <span className="text-white/90">{opportunity.organizer_name}</span>
              {opportunity.organizer_verified && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/80 rounded-full">
                  <ShieldCheckIcon size={12} className="text-white" />
                  <span className="text-xs text-white font-medium">Verified</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <CalendarIcon size={24} className="text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-semibold text-gray-900">{formatDate(opportunity.start_date).split(',')[1]}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <ClockIcon size={24} className="text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-semibold text-gray-900">{formatTime(opportunity.start_date)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <ClockIcon size={24} className="text-emerald-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-semibold text-gray-900">{opportunity.hours_per_volunteer || 4}h</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <UsersIcon size={24} className="text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Spots Left</p>
            <p className="font-semibold text-gray-900">{spotsLeft}</p>
          </div>
        </div>

        {/* Volunteer Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Volunteer spots filled</span>
            <span className="text-sm font-semibold text-gray-900">
              {opportunity.volunteers_accepted || 0} / {opportunity.volunteers_needed}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
          <MapPinIcon size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">{opportunity.location}</p>
            <p className="text-sm text-gray-500">{opportunity.city}, {opportunity.country}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About this opportunity</h3>
          <p className="text-gray-600 leading-relaxed">{opportunity.description}</p>
        </div>

        {/* Skills Required */}
        {opportunity.skills_required && opportunity.skills_required.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills needed</h3>
            <div className="flex flex-wrap gap-2">
              {opportunity.skills_required.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={() => {
            if (!isApplied) {
              onApply(opportunity.id);
            }
          }}
          disabled={isApplied || !isAuthenticated}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
            isApplied
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isApplied ? (
            <>
              <CheckIcon size={22} />
              Application Submitted
            </>
          ) : !isAuthenticated ? (
            'Sign in to Apply'
          ) : (
            t('opp.apply')
          )}
        </button>

        {!isAuthenticated && (
          <p className="text-center text-sm text-gray-500 mt-3">
            You need to sign in to apply for this opportunity
          </p>
        )}
      </div>
    </Modal>
  );
};

export default OpportunityDetailModal;
