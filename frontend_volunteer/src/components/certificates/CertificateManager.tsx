import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { 
  DownloadIcon, 
  TrophyIcon, 
  CalendarIcon, 
  ShieldCheckIcon,
  EyeIcon,
  StarIcon,
  ClockIcon
} from '@/components/icons/Icons';

interface Certificate {
  _id: string;
  certificateId: string;
  type: string;
  title: string;
  description: string;
  issuerName: string;
  opportunityTitle?: string;
  hoursCompleted: number;
  skillsAcquired: string[];
  achievementLevel: string;
  issuedDate: string;
  expiryDate?: string;
  status: string;
  downloadCount: number;
  verificationCount: number;
}

const CertificateManager: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const response = await fetch(`/api/certificates/user/${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      const data = await response.json();
      setCertificates(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId: string) => {
    setDownloadingId(certificateId);
    try {
      const response = await fetch(`/api/certificates/download/${certificateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UNITEE-Certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Refresh certificates to update download count
      fetchCertificates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'volunteer_completion': return TrophyIcon;
      case 'volunteer_passport': return ShieldCheckIcon;
      case 'achievement_badge': return StarIcon;
      case 'hours_milestone': return ClockIcon;
      default: return TrophyIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'volunteer_completion': return 'bg-green-100 text-green-800';
      case 'volunteer_passport': return 'bg-blue-100 text-blue-800';
      case 'achievement_badge': return 'bg-purple-100 text-purple-800';
      case 'hours_milestone': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAchievementColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">My Certificates</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {certificates.length} Total
          </span>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <TrophyIcon size={48} className="text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h4>
            <p className="text-gray-500">
              Complete volunteer opportunities to earn certificates and build your portfolio.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((certificate) => {
              const TypeIcon = getTypeIcon(certificate.type);
              return (
                <div key={certificate._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TypeIcon size={24} className="text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">{certificate.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(certificate.type)}`}>
                            {certificate.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{certificate.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={14} />
                            {new Date(certificate.issuedDate).toLocaleDateString()}
                          </span>
                          
                          {certificate.hoursCompleted > 0 && (
                            <span className="flex items-center gap-1">
                              <ClockIcon size={14} />
                              {certificate.hoursCompleted} hours
                            </span>
                          )}
                          
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAchievementColor(certificate.achievementLevel)}`}>
                            {certificate.achievementLevel.toUpperCase()}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <EyeIcon size={14} />
                            Verified {certificate.verificationCount} times
                          </span>
                        </div>

                        {certificate.skillsAcquired.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Skills Acquired:</p>
                            <div className="flex flex-wrap gap-1">
                              {certificate.skillsAcquired.map((skill, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-400">
                          <p>Certificate ID: <span className="font-mono">{certificate.certificateId}</span></p>
                          <p>Issued by: {certificate.issuerName}</p>
                          {certificate.opportunityTitle && (
                            <p>Related to: {certificate.opportunityTitle}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => downloadCertificate(certificate.certificateId)}
                        disabled={downloadingId === certificate.certificateId}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <DownloadIcon size={16} />
                        {downloadingId === certificate.certificateId ? 'Downloading...' : 'Download PDF'}
                      </button>
                      
                      <button
                        onClick={() => window.open(`/verify/${certificate.certificateId}`, '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <ShieldCheckIcon size={16} />
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateManager;