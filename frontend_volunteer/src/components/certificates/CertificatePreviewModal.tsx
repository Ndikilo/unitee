import React, { useState, useEffect } from 'react';
import { certificateAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X, Download, Loader2, Shield, Award, CheckCircle, Clock, Star, Zap, Calendar, Trophy, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertificatePreviewModalProps {
  userId: string;
  opportunityId?: string;
  certificateId?: string;
  passportMode?: boolean;
  onClose: () => void;
}

const levelColors: Record<string, { bg: string; text: string; border: string; star: string }> = {
  gold:     { bg: 'from-amber-50 to-yellow-50',  text: 'text-amber-700',  border: 'border-amber-300', star: 'text-amber-500' },
  silver:   { bg: 'from-slate-50 to-gray-100',   text: 'text-slate-600',  border: 'border-slate-300', star: 'text-slate-400' },
  bronze:   { bg: 'from-orange-50 to-amber-50',  text: 'text-orange-700', border: 'border-orange-300', star: 'text-orange-500' },
  platinum: { bg: 'from-blue-50 to-indigo-50',   text: 'text-blue-700',   border: 'border-blue-300',  star: 'text-blue-500' },
};

const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  userId,
  opportunityId,
  certificateId: propCertId,
  passportMode = false,
  onClose,
}) => {
  const { toast } = useToast();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [includePhoto, setIncludePhoto] = useState(true);

  useEffect(() => {
    loadCertificate();
  }, []);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setError('');

      if (passportMode) {
        const res = await certificateAPI.getMyPassport();
        setCert(res?.data ?? res);
        return;
      }

      if (propCertId) {
        const res = await certificateAPI.verifyCertificate(propCertId);
        setCert(res?.data?.certificate ?? res?.certificate ?? res);
        return;
      }

      const res = await certificateAPI.getUserCertificates(userId);
      const list: any[] = Array.isArray(res) ? res : (res?.data ?? []);
      if (list.length === 0) {
        setError('No certificate has been issued yet.');
        return;
      }
      const found = opportunityId
        ? list.find(c => (c.opportunityId?._id ?? c.opportunityId) === opportunityId) ?? list[0]
        : list[0];
      setCert(found);
    } catch {
      setError(passportMode ? 'Could not load passport data.' : 'Could not load certificate.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      if (passportMode) {
        await certificateAPI.downloadMyPassport(cert?.recipientName ?? 'Volunteer', includePhoto);
        toast({ title: 'Downloaded', description: 'Your Volunteer Passport has been saved as PDF.' });
      } else {
        if (!cert?.certificateId) return;
        await certificateAPI.downloadCertificate(cert.certificateId);
        toast({ title: 'Downloaded', description: 'Certificate saved as PDF.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to download.', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const level        = cert?.metrics?.achievementLevel ?? cert?.achievementLevel ?? 'bronze';
  const colors       = levelColors[level] ?? levelColors.bronze;
  const issuedDate   = cert?.issuedDate
    ? new Date(cert.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const skills: string[]  = cert?.metrics?.skillsAcquired ?? cert?.skillsAcquired ?? [];
  const hours: number     = cert?.metrics?.hoursCompleted  ?? cert?.hoursCompleted  ?? 0;
  const events: number    = cert?.metrics?.totalEvents     ?? 0;
  const badgeCount: number = cert?.metrics?.badgesEarned   ?? cert?.earnedBadges?.length ?? 0;
  const earnedBadges: any[] = cert?.earnedBadges ?? [];
  const recipientName = cert?.recipient?.name ?? cert?.recipientName ?? '—';
  const issuerName    = cert?.issuer?.name    ?? cert?.issuerName    ?? 'UNITEE Platform';
  const title         = cert?.title           ?? (passportMode ? 'Volunteer Passport' : 'Certificate of Achievement');
  const oppTitle      = cert?.opportunity?.title ?? cert?.opportunityTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-orange-500" />
            <span className="font-semibold text-gray-900">
              {passportMode ? 'Volunteer Passport' : 'Certificate Preview'}
            </span>
            {passportMode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                <Zap size={10} />
                Live
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={36} className="animate-spin text-blue-500" />
              <p className="text-gray-500">
                {passportMode ? 'Loading your passport…' : 'Loading certificate…'}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Award size={48} className="text-gray-200" />
              <p className="text-gray-500 max-w-xs">{error}</p>
              <p className="text-xs text-gray-400">
                Certificates are issued by organizers once you complete an event.
              </p>
            </div>
          ) : (
            <>
              {/* ─── CERTIFICATE CARD ─────────────────────────────────── */}
              <div className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-br ${colors.bg} overflow-hidden relative select-none`}>

                {/* Top decorative band */}
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

                <div className="px-8 py-8">
                  {/* Platform name + live badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-2xl font-black text-blue-700 tracking-tight leading-none">UNITEE</p>
                      <p className="text-xs text-gray-500 mt-0.5">Volunteer Community Action</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {passportMode && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 border border-green-200">
                          <Zap size={10} className="text-green-600" />
                          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Live Data</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-200 bg-green-50">
                        <Shield size={12} className="text-green-600" />
                        <span className="text-xs font-semibold text-green-700">Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate heading */}
                  <div className="text-center mb-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium mb-1">
                      {passportMode ? 'Volunteer Passport' : 'Certificate of Achievement'}
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200" />
                      <Star size={14} className={colors.star} />
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">This is to certify that</p>
                    <p className="text-3xl font-bold text-gray-900">{recipientName}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {passportMode ? 'is a verified UNITEE volunteer' : 'has successfully completed'}
                    </p>
                    <p className="text-lg font-bold text-blue-800 mt-1">{title}</p>
                  </div>

                  {/* Opportunity (non-passport only) */}
                  {!passportMode && oppTitle && (
                    <div className="text-center mb-5">
                      <span className="inline-block px-4 py-1.5 bg-white/60 border border-blue-100 rounded-full text-sm text-blue-700 font-medium">
                        {oppTitle}
                      </span>
                    </div>
                  )}

                  {/* Metrics row */}
                  <div className={`grid gap-3 mb-6 ${passportMode ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    {hours > 0 && (
                      <div className="flex flex-col items-center bg-white/70 rounded-xl p-3 border border-white">
                        <Clock size={18} className="text-blue-500 mb-1" />
                        <p className="text-2xl font-bold text-gray-900">{hours}</p>
                        <p className="text-xs text-gray-500">Hours</p>
                      </div>
                    )}
                    {passportMode && (
                      <div className="flex flex-col items-center bg-white/70 rounded-xl p-3 border border-white">
                        <Calendar size={18} className="text-emerald-500 mb-1" />
                        <p className="text-2xl font-bold text-gray-900">{events}</p>
                        <p className="text-xs text-gray-500">Events</p>
                      </div>
                    )}
                    <div className="flex flex-col items-center bg-white/70 rounded-xl p-3 border border-white">
                      <Star size={18} className={`${colors.star} mb-1`} />
                      <p className={`text-sm font-bold uppercase ${colors.text}`}>{level}</p>
                      <p className="text-xs text-gray-500">Level</p>
                    </div>
                    {passportMode ? (
                      <div className="flex flex-col items-center bg-white/70 rounded-xl p-3 border border-white">
                        <Trophy size={18} className="text-amber-500 mb-1" />
                        <p className="text-2xl font-bold text-gray-900">{badgeCount}</p>
                        <p className="text-xs text-gray-500">Badges</p>
                      </div>
                    ) : skills.length > 0 && (
                      <div className="flex flex-col items-center bg-white/70 rounded-xl p-3 border border-white">
                        <CheckCircle size={18} className="text-green-500 mb-1" />
                        <p className="text-2xl font-bold text-gray-900">{skills.length}</p>
                        <p className="text-xs text-gray-500">Skills</p>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-white/80 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Earned badge icons (passport only) */}
                  {passportMode && earnedBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {earnedBadges.map((b: any, i: number) => (
                        <span key={i} title={b.name} className="text-xl" role="img" aria-label={b.name}>
                          {b.icon ?? '🏆'}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer: issuer + date */}
                  <div className="flex items-end justify-between pt-5 border-t border-blue-100/60">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Issued by</p>
                      <p className="text-sm font-semibold text-gray-800">{issuerName}</p>
                      <div className="mt-1 w-24 h-px bg-gray-300" />
                      <p className="text-xs text-gray-400 mt-0.5">Authorized Signature</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">
                        {passportMode ? 'Generated on' : 'Date of Issue'}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">{issuedDate}</p>
                      {!passportMode && cert?.certificateId && (
                        <p className="text-[10px] text-gray-400 mt-1 font-mono">{cert.certificateId}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom decorative band */}
                <div className="h-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-blue-600" />
              </div>

              {/* Note */}
              {passportMode ? (
                <p className="text-center text-xs text-green-600 mt-3 flex items-center justify-center gap-1">
                  <Zap size={11} />
                  This passport reflects your current achievements and updates automatically as you progress.
                </p>
              ) : (
                <p className="text-center text-xs text-gray-400 mt-3">
                  This certificate can be verified at{' '}
                  <span className="font-mono text-blue-500">{cert?.verificationUrl ?? `unitee.app/verify/${cert?.certificateId}`}</span>
                </p>
              )}

              {/* Photo toggle (passport only) */}
              {passportMode && (
                <label className="flex items-center gap-2 mt-4 cursor-pointer select-none w-fit mx-auto">
                  <div
                    onClick={() => setIncludePhoto(v => !v)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${includePhoto ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${includePhoto ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <Camera size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-600">Include my photo in the PDF</span>
                </label>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {downloading
                    ? <><Loader2 size={15} className="animate-spin" />Downloading…</>
                    : <><Download size={15} />Download PDF</>
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificatePreviewModal;
