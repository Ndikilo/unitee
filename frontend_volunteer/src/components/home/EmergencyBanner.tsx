import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangleIcon, XIcon, ChevronRightIcon } from '@/components/icons/Icons';

interface EmergencyBannerProps {
  onRespond: () => void;
}

const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onRespond }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangleIcon size={20} />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">
                {t('emergency.active')}: Flood Relief - Douala
              </p>
              <p className="text-red-100 text-xs sm:text-sm">
                Urgent volunteers needed for emergency response
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRespond}
              className="hidden sm:flex items-center gap-1 px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              {t('emergency.respond')}
              <ChevronRightIcon size={16} />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;
