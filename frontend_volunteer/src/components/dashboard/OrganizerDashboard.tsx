import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { organizerAPI, opportunityAPI } from '@/lib/api';
import apiRequest from '@/lib/api';
import {
  PlusIcon,
  UsersIcon,
  EyeIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
  SparklesIcon,
  BarChartIcon,
  ShieldCheckIcon,
} from '@/components/icons/Icons';

// ─── Certificate Modal ────────────────────────────────────────────────────────
interface CertModalProps {
  opportunity: any;
  acceptedVolunteers: any[];
  onClose: () => void;
}

const CertificateModal: React.FC<CertModalProps> = ({ opportunity, acceptedVolunteers, onClose }) => {
  const { toast } = useToast();
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [issuedIds, setIssuedIds] = useState<Set<string>>(new Set());

  const handleIssue = async (volunteer: any) => {
    setIssuingId(volunteer._id);
    try {
      await apiRequest('/certificates/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'volunteer_completion',
          title: `Volunteer Certificate — ${opportunity.title}`,
          description: `Awarded for completing the volunteer opportunity: ${opportunity.title}`,
          recipientId: volunteer._id,
          opportunityId: opportunity._id,
          hoursCompleted: opportunity.dateTime?.duration || 4,
          skillsAcquired: opportunity.requirements?.skills || [],
          achievementLevel: 'bronze',
        }),
      });
      setIssuedIds(prev => new Set([...prev, volunteer._id]));
      toast({ title: 'Certificate issued', description: `Certificate issued to ${volunteer.name}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to issue certificate', variant: 'destructive' });
    } finally {
      setIssuingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Issue Certificates</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <XIcon size={20} />
          </button>
        </div>
        <div className="px-6 py-2 text-sm text-gray-500 border-b border-gray-50">
          Opportunity: <span className="font-medium text-gray-700">{opportunity.title}</span>
        </div>
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {acceptedVolunteers.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No accepted volunteers for this opportunity.</p>
          ) : (
            acceptedVolunteers.map((vol: any) => (
              <div key={vol._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{vol.name}</p>
                  <p className="text-xs text-gray-500">{vol.email}</p>
                </div>
                {issuedIds.has(vol._id) ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Issued</span>
                ) : (
                  <button
                    onClick={() => handleIssue(vol)}
                    disabled={issuingId === vol._id}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {issuingId === vol._id ? 'Issuing...' : 'Issue'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py2 text-sm text-gray-600 hover:text-gray-800 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OrganizerDashboard: React.FC = () => {
  const { toast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'applicants'>('overview');

  // Data state
  const [stats, setStats] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Applicant action state
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Opportunity manage menu state
  const [showManageMenu, setShowManageMenu] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingOpp, setEditingOpp] = useState<any | null>(null);

  // Certificate modal state
  const [certModalOpp, setCertModalOpp] = useState<any | null>(null);
  const [certVolunteers, setCertVolunteers] = useState<any[]>([]);

  // Manage menu ref for click-outside
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  // Close manage menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowManageMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, oppsRes, appsRes] = await Promise.all([
        organizerAPI.getStats(),
        organizerAPI.getOpportunities(),
        organizerAPI.getApplications(),
      ]);
      setStats(statsRes.data);
      setOpportunities(oppsRes.data || []);
      setApplicants(appsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ── Applicant actions ──────────────────────────────────────────────────────
  const handleApplicationAction = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setProcessingId(applicationId);
    try {
      await organizerAPI.updateApplicationStatus(applicationId, status);
      // Optimistic update
      setApplicants(prev =>
        prev.map(a => (a._id === applicationId ? { ...a, status } : a))
      );
      toast({
        title: status === 'accepted' ? 'Application accepted' : 'Application rejected',
        description: `The application has been ${status}.`,
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update application', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  // ── Opportunity actions ────────────────────────────────────────────────────
  const handleDeleteOpportunity = async (oppId: string) => {
    if (!window.confirm('Delete this opportunity? This cannot be undone.')) return;
    setDeletingId(oppId);
    try {
      await opportunityAPI.delete(oppId);
      setOpportunities(prev => prev.filter(o => o._id !== oppId));
      toast({ title: 'Deleted', description: 'Opportunity deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Certificate modal ──────────────────────────────────────────────────────
  const openCertModal = async (opp: any) => {
    try {
      const res = await organizerAPI.getApplications({ opportunityId: opp._id, status: 'accepted' });
      const accepted = (res.data || []).map((app: any) => ({
        _id: app.volunteer?._id,
        name: app.volunteer?.name,
        email: app.volunteer?.email,
      }));
      setCertVolunteers(accepted);
      setCertModalOpp(opp);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load volunteers', variant: 'destructive' });
    }
  };

  // ── Edit form submit ───────────────────────────────────────────────────────
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingOpp) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const updated = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
    };
    try {
      await opportunityAPI.update(editingOpp._id, updated);
      setOpportunities(prev =>
        prev.map(o => (o._id === editingOpp._id ? { ...o, ...updated } : o))
      );
      toast({ title: 'Updated', description: 'Opportunity updated successfully.' });
      setEditingOpp(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update', variant: 'destructive' });
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      published: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-gray-100 text-gray-600',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-600',
      archived: 'bg-yellow-100 text-yellow-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const appStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      accepted: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-600',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchAll} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Opportunities', value: stats?.activeOpportunities ?? 0, icon: <CalendarIcon size={20} className="text-blue-500" /> },
          { label: 'Total Applicants', value: stats?.totalApplicants ?? 0, icon: <UsersIcon size={20} className="text-emerald-500" /> },
          { label: 'Total Views', value: stats?.totalViews ?? 0, icon: <EyeIcon size={20} className="text-purple-500" /> },
          { label: 'Completed Events', value: stats?.completedEvents ?? 0, icon: <BarChartIcon size={20} className="text-orange-500" /> },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(['overview', 'opportunities', 'applicants'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' && <SparklesIcon size={14} className="inline mr-1.5 -mt-0.5" />}
              {tab === 'opportunities' && <CalendarIcon size={14} className="inline mr-1.5 -mt-0.5" />}
              {tab === 'applicants' && <UsersIcon size={14} className="inline mr-1.5 -mt-0.5" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              {opportunities.length === 0 && applicants.length === 0 ? (
                <p className="text-gray-400 text-sm">No activity yet. Create your first opportunity to get started.</p>
              ) : (
                <div className="space-y-3">
                  {applicants.slice(0, 5).map(app => (
                    <div key={app._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <img
                        src={
                          app.volunteer?.profile?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(app.volunteer?.name || 'V')}&background=3b82f6&color=fff&size=32`
                        }
                        alt={app.volunteer?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {app.volunteer?.name || 'Unknown volunteer'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Applied to: {app.opportunity?.title || '—'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${appStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Opportunities Tab ── */}
          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">My Opportunities</h3>
                <a
                  href="/opportunities/create"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon size={14} />
                  New
                </a>
              </div>

              {/* Edit form */}
              {editingOpp && (
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">Edit Opportunity</h4>
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                      <input
                        name="title"
                        defaultValue={editingOpp.title}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        defaultValue={editingOpp.description}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingOpp(null)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {opportunities.length === 0 ? (
                <p className="text-gray-400 text-sm">No opportunities yet.</p>
              ) : (
                <div className="space-y-3">
                  {opportunities.map(opp => (
                    <div key={opp._id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 truncate">{opp.title}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(opp.status)}`}>
                            {opp.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{opp.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Issue Certificates button for completed opps */}
                        {opp.status === 'completed' && (
                          <button
                            onClick={() => openCertModal(opp)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <ShieldCheckIcon size={12} />
                            Certificates
                          </button>
                        )}

                        {/* Manage dropdown */}
                        <div className="relative" ref={showManageMenu === opp._id ? menuRef : undefined}>
                          <button
                            onClick={() => setShowManageMenu(prev => (prev === opp._id ? null : opp._id))}
                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Manage ▾
                          </button>
                          {showManageMenu === opp._id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                              <button
                                onClick={() => {
                                  setEditingOpp(opp);
                                  setShowManageMenu(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => {
                                  window.location.href = `/opportunities/${opp._id}`;
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <EyeIcon size={14} /> View
                              </button>
                              <button
                                onClick={() => {
                                  setShowManageMenu(null);
                                  handleDeleteOpportunity(opp._id);
                                }}
                                disabled={deletingId === opp._id}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                              >
                                🗑️ {deletingId === opp._id ? 'Deleting…' : 'Delete'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Applicants Tab ── */}
          {activeTab === 'applicants' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Applicants</h3>
              {applicants.length === 0 ? (
                <p className="text-gray-400 text-sm">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {applicants.map(app => (
                    <div key={app._id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <img
                        src={
                          app.volunteer?.profile?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(app.volunteer?.name || 'V')}&background=3b82f6&color=fff&size=40`
                        }
                        alt={app.volunteer?.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {app.volunteer?.name || 'Unknown volunteer'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {app.opportunity?.title || '—'}
                        </p>
                        {app.volunteer?.profile?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {app.volunteer.profile.skills.slice(0, 3).map((skill: string) => (
                              <span key={skill} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApplicationAction(app._id, 'accepted')}
                              disabled={processingId === app._id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              <CheckIcon size={12} />
                              {processingId === app._id ? '…' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleApplicationAction(app._id, 'rejected')}
                              disabled={processingId === app._id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                              <XIcon size={12} />
                              {processingId === app._id ? '…' : 'Reject'}
                            </button>
                          </>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${appStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Certificate Modal ── */}
      {certModalOpp && (
        <CertificateModal
          opportunity={certModalOpp}
          acceptedVolunteers={certVolunteers}
          onClose={() => { setCertModalOpp(null); setCertVolunteers([]); }}
        />
      )}
    </div>
  );
};

export default OrganizerDashboard;
