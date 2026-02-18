import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

interface EmergencyAlert {
  _id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  targetCity?: string;
  isActive: boolean;
  createdAt: string;
}

const EmergencyAlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAlerts();
    // Load dismissed alerts from localStorage
    const dismissed = localStorage.getItem('dismissedEmergencyAlerts');
    if (dismissed) {
      setDismissedAlerts(JSON.parse(dismissed));
    }
  }, []);

  const fetchActiveAlerts = async () => {
    try {
      // Only fetch if user has access (not restricted to admin for viewing)
      const data = await adminAPI.getEmergencyAlerts();
      const activeAlerts = data.filter((alert: EmergencyAlert) => alert.isActive);
      setAlerts(activeAlerts);
    } catch (error) {
      // Silently fail if user doesn't have access to emergency alerts
      console.log('Emergency alerts not accessible for current user');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    const newDismissed = [...dismissedAlerts, alertId];
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissedEmergencyAlerts', JSON.stringify(newDismissed));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 border-red-700 text-white';
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'medium':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'low':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert._id));

  if (loading || visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => (
        <Alert key={alert._id} className={`${getSeverityColor(alert.severity)} relative`}>
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {getSeverityIcon(alert.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-sm">
                  {alert.severity.toUpperCase()}: {alert.title}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert._id)}
                  className="h-6 w-6 p-0 hover:bg-black/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <AlertDescription className="text-sm">
                {alert.message}
                {alert.targetCity && (
                  <span className="block mt-1 text-xs opacity-75">
                    Location: {alert.targetCity}
                  </span>
                )}
                <span className="block mt-1 text-xs opacity-75">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
              </AlertDescription>
            </div>
          </div>
          
          {alert.severity === 'critical' && (
            <div className="mt-3 flex items-center gap-2">
              <Button 
                size="sm" 
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                More Info
              </Button>
            </div>
          )}
        </Alert>
      ))}
    </div>
  );
};

export default EmergencyAlertBanner;