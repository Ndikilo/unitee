import React, { useState, useEffect } from 'react';
import { AlertTriangleIcon, XIcon, ChevronRightIcon } from '@/components/icons/Icons';

interface EmergencyBannerProps {
  onRespond: () => void;
}

interface Alert {
  _id: string;
  title: string;
  message: string;
  severity: string;
  targetCity?: string;
}

const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onRespond }) => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const apiUrl = `${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/emergency-alerts`;
    fetch(apiUrl)
      .then(r => r.json())
      .then(data => {
        const active = (data.alerts || data || []).find((a: Alert & { isActive: boolean }) => a.isActive);
        if (active) setAlert(active);
      })
      .catch(() => {});
  }, []);

  if (!alert || dismissed) return null;

  const severityColors: Record<string, string> = {
    critical: 'from-red-700 to-red-800',
    high: 'from-red-600 to-red-700',
    medium: 'from-orange-500 to-orange-600',
    low: 'from-yellow-500 to-yellow-600',
  };

  const bg = severityColors[alert.severity] || severityColors.high;

  return (
    <div className={`bg-gradient-to-r ${bg} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangleIcon size={18} />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">
                {alert.title}{alert.targetCity ? ` — ${alert.targetCity}` : ''}
              </p>
              <p className="text-white/80 text-xs sm:text-sm line-clamp-1">{alert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRespond}
              className="hidden sm:flex items-center gap-1 px-4 py-1.5 bg-white text-red-600 font-semibold text-sm rounded-lg hover:bg-red-50 transition-colors"
            >
              Respond
              <ChevronRightIcon size={14} />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;
