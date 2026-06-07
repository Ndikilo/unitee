import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { opportunityAPI, badgeAPI, certificateAPI } from '@/lib/api';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import {
  ClockIcon,
  TrophyIcon,
  CalendarIcon,
  AwardIcon,
  ChevronRightIcon,
  CheckIcon,
  MapPinIcon,
} from '@/components/icons/Icons';
import { Eye, Award, Shield, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CertificatePreviewModal from '@/components/certificates/CertificatePreviewModal';

const levelColors: Record<string, { bg: string; text: string; ring: string }> = {
  platinum: { bg: 'bg-blue-100',   text: 'text-blue-700',   ring: 'ring-blue-300' },
  gold:     { bg: 'bg-amber-100',  text: 'text-amber-700',  ring: 'ring-amber-300' },
  silver:   { bg: 'bg-slate-100',  text: 'text-slate-600',  ring: 'ring-slate-300' },
  bronze:   { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-300' },
};

const computeLevel = (hours: number) => {
  if (hours >= 100) return 'platinum';
  if (hours >= 50)  return 'gold';
  if (hours >= 20)  return 'silver';
  return 'bronze';
};

const VolunteerDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'certificates' | 'activity' | 'badges'>('certificates');
  const [applications, setApplications] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [orgCertificates, setOrgCertificates] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [showPassportPreview, setShowPassportPreview] = useState(false);
  const [previewCertId, setPreviewCertId] = useState<string | null>(null);

  const hours   = user?.stats?.totalHours  ?? 0;
  const events  = user?.stats?.totalEvents ?? 0;
  const badgeCt = user?.stats?.badges?.length ?? 0;
  const level   = computeLevel(hours);
  const levelStyle = levelColors[level] ?? levelColors.bronze;

  useEffect(() => {
    if (!user) return;
    if ((user as any).onboardingCompleted === false) setShowOnboarding(true);
    loadApplications();
    loadBadges();
    loadOrgCertificates();
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoadingApps(true);
      const data = await opportunityAPI.getUserOpportunities('registered');
      setApplications(Array.isArray(data) ? data : (data?.data ?? []));
    } catch { /* silently fail */ } finally { setLoadingApps(false); }
  };

  const loadBadges = async () => {
    try {
      setLoadingBadges(true);
      const data = await badgeAPI.getMyBadges().catch(() => ({ earned: [], available: [] }));
      const earned: any[]    = data?.earned    ?? [];
      const available: any[] = data?.available ?? [];
      setBadges([
        ...earned.map((b: any) => ({ ...b, earned: true })),
        ...available.map((b: any) => ({ ...b, earned: false })),
      ]);
    } catch { setBadges([]); } finally { setLoadingBadges(false); }
  };

  const loadOrgCertificates = async () => {
    if (!user?._id) return;
    try {
      setLoadingCerts(true);
      const res = await certificateAPI.getUserCertificates(user._id);
      const list: any[] = Array.isArray(res) ? res : (res?.data ?? []);
      // Only show org-issued certificates, not passport snapshots
      setOrgCertificates(list.filter((c: any) => c.type !== 'volunteer_passport'));
    } catch { setOrgCertificates([]); } finally { setLoadingCerts(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':  return 'bg-emerald-100 text-emerald-700';
      case 'pending':   return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'rejected':  return 'bg-red-100 text-red-700';
      default:          return 'bg-gray-100 text-gray-700';
    }
  };

  const normaliseApp = (app: any) => ({
    id:           app._id ?? app.id,
    title:        app.opportunity?.title ?? app.title ?? 'Opportunity',
    organization: app.opportunity?.createdBy?.name ?? app.organization ?? '',
    status:       app.applicationStatus ?? app.status ?? 'pending',
    date:         app.opportunity?.dateTime?.start ?? app.dateTime?.start ?? app.date ?? '',
    location:     app.opportunity?.location?.city
                    ? `${app.opportunity.location.city}, ${app.opportunity.location.country ?? ''}`
                    : app.location ?? '',
  });

  const certLevelColors: Record<string, string> = {
    platinum: 'bg-blue-50 border-blue-200 text-blue-700',
    gold:     'bg-amber-50 border-amber-200 text-amber-700',
    silver:   'bg-slate-50 border-slate-200 text-slate-600',
    bronze:   'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className="py-8">
      <OnboardingModal
        open={showOnboarding}
        onComplete={() => { setShowOnboarding(false); refreshUser(); }}
      />

      {/* ── PROFILE HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
        <img
          src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'V')}&background=3b82f6&color=fff&size=128`}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            {user?.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                <CheckIcon size={11} /> Verified
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full ring-1 ${levelStyle.bg} ${levelStyle.text} ${levelStyle.ring}`}>
              {level.charAt(0).toUpperCase() + level.slice(1)} Level
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-3">{user?.profile?.city ?? 'Cameroon'} • Volunteer</p>
          {/* Compact stats strip */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-gray-600">
              <ClockIcon size={15} className="text-blue-500" />
              <strong>{hours}</strong> hours
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <CalendarIcon size={15} className="text-emerald-500" />
              <strong>{events}</strong> events
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <TrophyIcon size={15} className="text-amber-500" />
              <strong>{badgeCt}</strong> badges
            </span>
          </div>
        </div>

        {/* Passport button in header */}
        <button
          onClick={() => setShowPassportPreview(true)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Eye size={16} />
          View Passport
        </button>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            {[
              { id: 'certificates', label: 'Certificates' },
              { id: 'activity',     label: 'Activity' },
              { id: 'badges',       label: t('impact.badges') },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* ── CERTIFICATES TAB ──────────────────────────────────── */}
          {activeTab === 'certificates' && (
            <div>
              {loadingCerts ? (
                <p className="text-sm text-gray-400 text-center py-10">Loading certificates…</p>
              ) : orgCertificates.length === 0 ? (
                <div className="text-center py-12">
                  <Award size={48} className="mx-auto text-gray-200 mb-3" />
                  <p className="font-medium text-gray-600 mb-1">No certificates yet</p>
                  <p className="text-sm text-gray-400">
                    When you complete volunteer events, organisations can issue you certificates here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orgCertificates.map((cert: any) => {
                    const certLevel = cert.achievementLevel ?? 'bronze';
                    const cls = certLevelColors[certLevel] ?? certLevelColors.bronze;
                    return (
                      <div key={cert._id ?? cert.certificateId}
                        className={`rounded-xl border-2 p-4 ${cls.split(' ').slice(0, 2).join(' ')} bg-white`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{cert.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Shield size={11} />
                              {cert.issuerName ?? cert.issuerId?.name ?? 'Organisation'}
                            </p>
                            {cert.opportunityTitle && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{cert.opportunityTitle}</p>
                            )}
                          </div>
                          <span className={`flex-shrink-0 px-2 py-0.5 text-[11px] font-bold uppercase rounded-full border ${cls}`}>
                            {certLevel}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : '—'}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPreviewCertId(cert.certificateId)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <Eye size={13} /> View
                            </button>
                            <button
                              onClick={() => certificateAPI.downloadCertificate(cert.certificateId)
                                .catch(() => toast({ title: 'Download failed', variant: 'destructive' }))}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
                            >
                              <Download size={13} /> PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVITY TAB ──────────────────────────────────────── */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {loadingApps ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : applications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No activity yet. Sign up for an opportunity to get started.</p>
              ) : (
                applications.map(raw => {
                  const app = normaliseApp(raw);
                  return (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">{app.title}</p>
                          <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{app.organization}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {app.date && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon size={11} />
                              {new Date(app.date).toLocaleDateString()}
                            </span>
                          )}
                          {app.location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon size={11} />
                              {app.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRightIcon size={18} className="text-gray-400 flex-shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── BADGES TAB ────────────────────────────────────────── */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loadingBadges ? (
                <p className="col-span-4 text-sm text-gray-400 text-center py-8">Loading badges…</p>
              ) : badges.length === 0 ? (
                <p className="col-span-4 text-sm text-gray-400 text-center py-8">No badges available yet.</p>
              ) : (
                badges.map((badge: any) => (
                  <div
                    key={badge._id}
                    className={`p-4 rounded-xl text-center transition-all ${
                      badge.earned
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200'
                        : 'bg-gray-50 border-2 border-gray-100'
                    }`}
                  >
                    <div className={`text-4xl mb-2 ${badge.earned ? '' : 'opacity-40 grayscale'}`}>{badge.icon}</div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{badge.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
                    {badge.earned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                        ✓ {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Earned'}
                      </span>
                    ) : (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{badge.current ?? 0}</span>
                          <span>{badge.criteria?.threshold ?? '?'}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${badge.progress ?? 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{badge.progress ?? 0}% complete</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── MODALS ───────────────────────────────────────────────── */}
      {showPassportPreview && user && (
        <CertificatePreviewModal
          userId={user._id}
          passportMode={true}
          onClose={() => setShowPassportPreview(false)}
        />
      )}
      {previewCertId && user && (
        <CertificatePreviewModal
          userId={user._id}
          certificateId={previewCertId}
          onClose={() => setPreviewCertId(null)}
        />
      )}
    </div>
  );
};

export default VolunteerDashboard;
