import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { certificateAPI } from '@/lib/api';
import { 
  DownloadIcon, 
  TrophyIcon, 
  CalendarIcon, 
  ShieldCheckIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  AwardIcon,
  ShareIcon,
  PrinterIcon
} from '@/components/icons/Icons';
import { useToast } from '@/hooks/use-toast';

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
  verificationUrl: string;
}

const CertificateManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateAPI.getUserCertificates(user?._id || user?.id || '');
      setCertificates(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to load certificates", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId: string) => {
    setDownloadingId(certificateId);
    try {
      await certificateAPI.downloadCertificate(certificateId);
      toast({ 
        title: "Success", 
        description: "Certificate downloaded successfully" 
      });
      fetchCertificates();
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to download certificate", 
        variant: "destructive" 
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const shareCertificate = (certificate: Certificate) => {
    const shareText = `I earned a certificate from UNITEE! ${certificate.title}`;
    const shareUrl = certificate.verificationUrl;
    
    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: shareText,
        url: shareUrl
      }).catch(() => {
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ 
      title: "Copied!", 
      description: "Verification link copied to clipboard" 
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'volunteer_completion': return TrophyIcon;
      case 'volunteer_passport': return ShieldCheckIcon;
      case 'achievement_badge': return StarIcon;
      case 'hours_milestone': return ClockIcon;
      case 'skill_certification': return AwardIcon;
      default: return TrophyIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'volunteer_completion': return 'from-green-400 to-emerald-600';
      case 'volunteer_passport': return 'from-blue-400 to-indigo-600';
      case 'achievement_badge': return 'from-purple-400 to-pink-600';
      case 'hours_milestone': return 'from-orange-400 to-red-600';
      case 'skill_certification': return 'from-cyan-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getAchievementBadge = (level: string) => {
    const badges = {
      bronze: { color: 'from-amber-600 to-amber-800', icon: '🥉', label: 'Bronze' },
      silver: { color: 'from-gray-400 to-gray-600', icon: '🥈', label: 'Silver' },
      gold: { color: 'from-yellow-400 to-yellow-600', icon: '🥇', label: 'Gold' },
      platinum: { color: 'from-purple-400 to-purple-600', icon: '💎', label: 'Platinum' }
    };
    return badges[level as keyof typeof badges] || badges.bronze;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center border border-blue-100">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrophyIcon size={40} className="text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Certificates Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Complete volunteer opportunities and achieve milestones to earn certificates and build your professional portfolio.
        </p>
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-gray-600">Complete Events</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-sm text-gray-600">Log Hours</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-sm text-gray-600">Earn Certificates</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrophyIcon size={24} />
            <span className="text-3xl font-bold">{certificates.length}</span>
          </div>
          <p className="text-blue-100 text-sm">Total Certificates</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <ClockIcon size={24} />
            <span className="text-3xl font-bold">
              {certificates.reduce((sum, cert) => sum + cert.hoursCompleted, 0)}
            </span>
          </div>
          <p className="text-green-100 text-sm">Total Hours</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <EyeIcon size={24} />
            <span className="text-3xl font-bold">
              {certificates.reduce((sum, cert) => sum + cert.verificationCount, 0)}
            </span>
          </div>
          <p className="text-purple-100 text-sm">Verifications</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <DownloadIcon size={24} />
            <span className="text-3xl font-bold">
              {certificates.reduce((sum, cert) => sum + cert.downloadCount, 0)}
            </span>
          </div>
          <p className="text-orange-100 text-sm">Downloads</p>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certificates.map((certificate) => {
          const TypeIcon = getTypeIcon(certificate.type);
          const typeColor = getTypeColor(certificate.type);
          const achievement = getAchievementBadge(certificate.achievementLevel);
          
          return (
            <div key={certificate._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              {/* Certificate Header with Gradient */}
              <div className={`bg-gradient-to-r ${typeColor} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <TypeIcon size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{certificate.title}</h3>
                      <p className="text-white text-opacity-90 text-sm">
                        {certificate.type.replace(/_/g, ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Achievement Badge */}
                  <div className={`bg-gradient-to-br ${achievement.color} px-3 py-1 rounded-full flex items-center gap-1 shadow-lg`}>
                    <span className="text-lg">{achievement.icon}</span>
                    <span className="text-xs font-bold">{achievement.label}</span>
                  </div>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">{certificate.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {certificate.hoursCompleted > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <ClockIcon size={20} className="text-blue-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-blue-900">{certificate.hoursCompleted}</p>
                      <p className="text-xs text-blue-600">Hours</p>
                    </div>
                  )}
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <EyeIcon size={20} className="text-purple-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-purple-900">{certificate.verificationCount}</p>
                    <p className="text-xs text-purple-600">Verified</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <DownloadIcon size={20} className="text-green-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-green-900">{certificate.downloadCount}</p>
                    <p className="text-xs text-green-600">Downloads</p>
                  </div>
                </div>

                {/* Skills */}
                {certificate.skillsAcquired.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Skills Acquired:</p>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skillsAcquired.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-3 py-1 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-200 font-medium">
                          {skill}
                        </span>
                      ))}
                      {certificate.skillsAcquired.length > 3 && (
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{certificate.skillsAcquired.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <span className="flex items-center gap-1">
                    <CalendarIcon size={14} />
                    {new Date(certificate.issuedDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheckIcon size={14} />
                    {certificate.issuerName}
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => downloadCertificate(certificate.certificateId)}
                    disabled={downloadingId === certificate.certificateId}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    <DownloadIcon size={16} />
                    {downloadingId === certificate.certificateId ? 'Downloading...' : 'Download'}
                  </button>
                  
                  <button
                    onClick={() => window.open(certificate.verificationUrl, '_blank')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md"
                  >
                    <ShieldCheckIcon size={16} />
                    Verify
                  </button>
                  
                  <button
                    onClick={() => shareCertificate(certificate)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md"
                  >
                    <ShareIcon size={16} />
                    Share
                  </button>
                </div>

                {/* Certificate ID */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-mono">
                    ID: {certificate.certificateId}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CertificateManager;