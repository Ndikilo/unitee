import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Calendar, CheckCircle, XCircle, Clock, Loader2, UserCheck,
  Plus, ExternalLink, ShieldCheck, FileText, ClipboardList,
  Award, TrendingUp, Download, BarChart2, Filter,
} from 'lucide-react';
import { organizerAPI, opportunityAPI, communityAPI } from '@/lib/api';
import { useAuth } from '@/contexts/NewAuthContext';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Environment', 'Education', 'Healthcare', 'Humanitarian', 'Social Services', 'Economic Development'];

const emptyForm = {
  title: '', description: '', category: 'Environment',
  address: '', city: '', country: 'Cameroon',
  startDate: '', endDate: '', duration: '', capacity: '', community: '', tags: '',
};

// ─── Attendance Modal ──────────────────────────────────────────────────────────
interface AttendanceEntry {
  userId: string;
  name: string;
  email: string;
  currentStatus: string;
  currentHours: number;
  attended: boolean;
  hours: string;
}

const AttendanceModal: React.FC<{
  open: boolean;
  onClose: () => void;
  opportunity: any;
  onSaved: () => void;
}> = ({ open, onClose, opportunity, onSaved }) => {
  const { toast } = useToast();
  const [volunteers, setVolunteers] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [issuingCerts, setIssuingCerts] = useState(false);
  const [certsResult, setCertsResult] = useState<{ issued: number; skipped: number } | null>(null);
  const [defaultHours, setDefaultHours] = useState(String(opportunity?.dateTime?.duration || ''));

  useEffect(() => {
    if (!open || !opportunity) return;
    setCertsResult(null);
    setDefaultHours(String(opportunity?.dateTime?.duration || ''));
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await organizerAPI.getOpportunityVolunteers(opportunity._id);
        const list: AttendanceEntry[] = (res?.data ?? []).map((v: any) => ({
          userId: v.user?._id ?? v.user,
          name: v.user?.name ?? 'Unknown',
          email: v.user?.email ?? '',
          currentStatus: v.status,
          currentHours: v.hoursLogged ?? 0,
          attended: v.status === 'attended',
          hours: String(v.hoursLogged || opportunity?.dateTime?.duration || ''),
        }));
        setVolunteers(list);
      } catch {
        toast({ title: 'Error', description: 'Could not load volunteers', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [open, opportunity]);

  const applyDefaultHours = () => {
    setVolunteers(prev => prev.map(v => ({ ...v, hours: defaultHours })));
  };

  const toggleAttended = (userId: string) => {
    setVolunteers(prev => prev.map(v =>
      v.userId === userId ? { ...v, attended: !v.attended } : v
    ));
  };

  const setHours = (userId: string, val: string) => {
    setVolunteers(prev => prev.map(v =>
      v.userId === userId ? { ...v, hours: val } : v
    ));
  };

  const selectAll = () => {
    const allAttended = volunteers.every(v => v.attended);
    setVolunteers(prev => prev.map(v => ({ ...v, attended: !allAttended })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const attendances = volunteers.map(v => ({
        userId: v.userId,
        status: v.attended ? 'attended' : 'no-show',
        hours: parseFloat(v.hours) || 0,
      }));
      await organizerAPI.bulkMarkAttended(opportunity._id, attendances);
      toast({ title: 'Attendance saved', description: `${volunteers.filter(v => v.attended).length} marked as attended` });
      onSaved();
      // Refresh local state to reflect saved statuses
      setVolunteers(prev => prev.map(v => ({
        ...v,
        currentStatus: v.attended ? 'attended' : 'no-show',
        currentHours: parseFloat(v.hours) || 0,
      })));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save attendance', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleIssueCerts = async () => {
    setIssuingCerts(true);
    try {
      const res = await organizerAPI.bulkIssueCertificates(opportunity._id);
      const result = { issued: res?.issued ?? 0, skipped: res?.skipped ?? 0 };
      setCertsResult(result);
      toast({
        title: 'Certificates issued',
        description: `${result.issued} new certificate${result.issued !== 1 ? 's' : ''} issued${result.skipped > 0 ? `, ${result.skipped} already had one` : ''}.`,
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to issue certificates', variant: 'destructive' });
    } finally {
      setIssuingCerts(false);
    }
  };

  const attendedCount = volunteers.filter(v => v.attended).length;
  const hasAttended = volunteers.some(v => v.currentStatus === 'attended');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-base">
            Attendance — <span className="font-normal text-gray-600">{opportunity?.title}</span>
          </DialogTitle>
          {opportunity?.dateTime?.start && (
            <p className="text-xs text-gray-500">
              {new Date(opportunity.dateTime.start).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {opportunity.dateTime.duration ? ` · ${opportunity.dateTime.duration}h planned` : ''}
            </p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : volunteers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12 text-center px-6">
            <div>
              <UserCheck className="h-12 w-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 text-sm">No accepted volunteers yet.</p>
              <p className="text-gray-400 text-xs mt-1">Accept applications first from the Applications tab.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Default hours + select all */}
            <div className="px-5 py-3 bg-gray-50 border-b shrink-0 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 mb-1 block">Default hours for everyone</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={defaultHours}
                      onChange={e => setDefaultHours(e.target.value)}
                      placeholder="e.g. 3.5"
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={applyDefaultHours}>
                      Apply to all
                    </Button>
                  </div>
                </div>
                <div className="text-right shrink-0 pt-4">
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={selectAll}>
                    {volunteers.every(v => v.attended) ? 'Deselect all' : 'Select all'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Volunteer list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {volunteers.map(v => (
                <div
                  key={v.userId}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    v.attended ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleAttended(v.userId)}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      v.attended
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {v.attended && <CheckCircle className="h-3.5 w-3.5" />}
                  </button>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.name}</p>
                    <p className="text-xs text-gray-400 truncate">{v.email}</p>
                  </div>

                  {/* Hours */}
                  <div className="shrink-0 w-20">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={v.hours}
                      onChange={e => setHours(v.userId, e.target.value)}
                      placeholder="hrs"
                      className="h-7 text-xs text-center"
                      disabled={!v.attended}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t bg-white shrink-0 space-y-2">
              {/* Certificate issuance */}
              {(hasAttended || attendedCount > 0) && (
                <div className={`flex items-center justify-between p-3 rounded-xl border ${certsResult ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                  {certsResult ? (
                    <p className="text-xs text-green-700 font-medium">
                      ✓ {certsResult.issued} certificate{certsResult.issued !== 1 ? 's' : ''} issued
                      {certsResult.skipped > 0 ? `, ${certsResult.skipped} already had one` : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-blue-700">
                      Issue certificates to {hasAttended ? 'attended volunteers' : `${attendedCount} attendees`}
                    </p>
                  )}
                  {!certsResult && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-100 shrink-0 ml-2"
                      disabled={issuingCerts}
                      onClick={handleIssueCerts}
                    >
                      {issuingCerts ? <Loader2 className="h-3 w-3 animate-spin" /> : <Award className="h-3 w-3 mr-1" />}
                      Issue Certs
                    </Button>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                    : `Save Attendance (${attendedCount} attended)`
                  }
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Impact Report Tab ─────────────────────────────────────────────────────────
const ImpactReportTab: React.FC<{ organizerName: string }> = ({ organizerName }) => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await organizerAPI.getImpactReport(params);
      setReport(res?.data ?? null);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Could not load impact data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await organizerAPI.downloadImpactCsv({
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      });
      toast({ title: 'Exported', description: 'CSV downloaded successfully' });
    } catch {
      toast({ title: 'Error', description: 'Export failed', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await organizerAPI.downloadImpactPdf({
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      });
      toast({ title: 'PDF downloaded', description: 'Branded impact report saved.' });
    } catch {
      toast({ title: 'Error', description: 'PDF export failed', variant: 'destructive' });
    } finally {
      setExportingPdf(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 w-40" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 w-40" />
            </div>
            <Button size="sm" onClick={fetchReport} disabled={loading} className="h-9">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4 mr-1.5" />}
              Apply Filter
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={handleExportCSV} disabled={exporting} className="h-9">
                {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Download className="h-4 w-4 mr-1.5" />}
                CSV
              </Button>
              <Button size="sm" onClick={handleExportPdf} disabled={exportingPdf} className="h-9 bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {exportingPdf ? 'Generating…' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {report ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Events', value: report.summary.totalEvents, icon: Calendar, color: 'text-blue-500' },
              { label: 'Completed', value: report.summary.completedEvents, icon: CheckCircle, color: 'text-green-500' },
              { label: 'Volunteers', value: report.summary.totalVolunteers, icon: Users, color: 'text-orange-500' },
              { label: 'Hours', value: report.summary.totalHours, icon: Clock, color: 'text-purple-500' },
              { label: 'Certificates', value: report.summary.totalCertificates, icon: Award, color: 'text-yellow-500' },
            ].map(item => (
              <Card key={item.label}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-2xl font-bold mt-0.5">{item.value}</p>
                    </div>
                    <item.icon className={`h-8 w-8 opacity-20 ${item.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Volunteer breakdown table */}
          {report.breakdown.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-gray-400" />
                  Volunteer Activity Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium text-gray-500 text-xs">Volunteer</th>
                        <th className="pb-2 font-medium text-gray-500 text-xs">Activity</th>
                        <th className="pb-2 font-medium text-gray-500 text-xs">Date</th>
                        <th className="pb-2 font-medium text-gray-500 text-xs text-right">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {report.breakdown.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-2.5">
                            <p className="font-medium text-gray-900">{row.volunteerName}</p>
                            <p className="text-xs text-gray-400">{row.volunteerEmail}</p>
                          </td>
                          <td className="py-2.5">
                            <p className="text-gray-700 line-clamp-1">{row.activity}</p>
                            <p className="text-xs text-gray-400">{row.category} · {row.city}</p>
                          </td>
                          <td className="py-2.5 text-gray-600 whitespace-nowrap">{row.date}</td>
                          <td className="py-2.5 text-right font-medium">{row.hours}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <BarChart2 className="h-12 w-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500">No attendance data for this period.</p>
              <p className="text-gray-400 text-sm mt-1">Mark volunteers as attended from the Opportunities tab.</p>
            </Card>
          )}
        </>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : null}
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const OrganizerDashboardEnhanced: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'applications');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Create opportunity modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Attendance modal
  const [attendanceOpp, setAttendanceOpp] = useState<any>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchDashboardData();
    fetchCommunities();
  }, [isAuthenticated, authLoading]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, appsData, oppsData] = await Promise.all([
        organizerAPI.getStats(),
        organizerAPI.getApplications({ status: 'pending' }),
        organizerAPI.getOpportunities(),
      ]);
      setStats(statsData?.data ?? statsData);
      setApplications(appsData?.data ?? []);
      setOpportunities(oppsData?.data ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommunities = async () => {
    try {
      const data = await communityAPI.getAll();
      setCommunities(Array.isArray(data) ? data : (data?.communities ?? data?.data ?? []));
    } catch {
      setCommunities([]);
    }
  };

  const handleApplicationAction = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      setProcessingId(applicationId);
      await organizerAPI.updateApplicationStatus(applicationId, status);
      setApplications(prev => prev.filter(app => app._id !== applicationId));
      toast({ title: status === 'accepted' ? 'Accepted' : 'Rejected', description: `Volunteer has been notified.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update application', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const sf = (k: keyof typeof emptyForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleAiAssist = async () => {
    if (!form.title || !form.city || !form.category) {
      toast({ title: 'Fill in first', description: 'Enter a title, city, and category before using Template Assist.', variant: 'destructive' });
      return;
    }
    setAiLoading(true);
    try {
      const res = await organizerAPI.generateOpportunityContent({
        title: form.title, goal: form.title, location: form.city, category: form.category,
      });
      const data = res?.data ?? res;
      if (data.description) sf('description', data.description);
      if (data.suggestedVolunteers) sf('capacity', String(data.suggestedVolunteers));
      if (data.suggestedHours) sf('duration', String(data.suggestedHours));
      toast({ title: 'Template applied', description: 'Review and adjust the filled-in fields.' });
    } catch {
      toast({ title: 'Failed', description: 'Could not generate template. Please fill in manually.', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const payload: any = {
        title: form.title, description: form.description, category: form.category,
        location: { address: form.address, city: form.city, country: form.country },
        dateTime: {
          start: form.startDate, end: form.endDate || undefined,
          duration: form.duration ? parseFloat(form.duration) : undefined,
        },
        capacity: { required: parseInt(form.capacity) || 10 },
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (form.community) payload.community = form.community;
      await opportunityAPI.create(payload);
      toast({ title: 'Opportunity created!', description: `"${form.title}" is now live.` });
      setShowCreateModal(false);
      setForm(emptyForm);
      fetchDashboardData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create opportunity', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const isPastEvent = (opp: any) => opp.dateTime?.start && new Date(opp.dateTime.start) < new Date();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Organizer Dashboard</h1>
            <p className="text-gray-600">Manage your opportunities and volunteers</p>
          </div>
          <Button onClick={() => { setShowCreateModal(true); setActiveTab('opportunities'); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Opportunity
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Active Events', value: stats?.activeOpportunities ?? opportunities.length, icon: Calendar, color: 'text-blue-500' },
            { label: 'Total Applicants', value: stats?.totalApplicants ?? 0, icon: Users, color: 'text-green-500' },
            { label: 'Pending', value: applications.length, icon: Clock, color: 'text-yellow-500' },
            { label: 'Completed', value: stats?.completedEvents ?? 0, icon: CheckCircle, color: 'text-purple-500' },
            { label: 'Total Hours', value: stats?.totalHours ?? 0, icon: TrendingUp, color: 'text-orange-500' },
            { label: 'Certificates', value: stats?.totalCertificates ?? 0, icon: Award, color: 'text-pink-500' },
          ].map(item => (
            <Card key={item.label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">{item.label}</p>
                    <p className="text-2xl font-bold mt-0.5">{item.value}</p>
                  </div>
                  <item.icon className={`h-8 w-8 opacity-20 ${item.color} hidden sm:block`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certificate Verify */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              Verify a Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter certificate ID…"
                value={verifyInput}
                onChange={e => setVerifyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifyInput.trim() && navigate(`/verify/${verifyInput.trim()}`)}
              />
              <Button onClick={() => verifyInput.trim() && navigate(`/verify/${verifyInput.trim()}`)} disabled={!verifyInput.trim()}>
                Verify
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Verify volunteer passports and completion certificates.</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="applications">
              Applications {applications.length > 0 && <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5">{applications.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              Opportunities ({opportunities.length})
            </TabsTrigger>
            <TabsTrigger value="impact">
              Impact Report
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            {applications.length === 0 ? (
              <Card className="p-12 text-center">
                <UserCheck className="h-16 w-16 mx-auto text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No pending applications</h3>
                <p className="text-gray-500">All applications have been reviewed. New ones will appear here.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <Card key={app._id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold">{app.volunteer?.name}</h3>
                            <Badge variant="secondary" className="text-xs">{app.opportunity?.title}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                          {app.volunteer?.profile?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {app.volunteer.profile.skills.slice(0, 4).map((skill: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                          )}
                          {app.volunteer?.stats && (
                            <p className="text-xs text-gray-500">
                              {app.volunteer.stats.totalHours}h volunteered · {app.volunteer.stats.totalEvents} events
                            </p>
                          )}
                          {app.coverLetter && (
                            <p className="text-sm text-gray-600 mt-2 italic line-clamp-2">"{app.coverLetter}"</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleApplicationAction(app._id, 'accepted')}
                            disabled={processingId === app._id}
                          >
                            {processingId === app._id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <><CheckCircle className="h-4 w-4 mr-1" />Accept</>
                            }
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            onClick={() => handleApplicationAction(app._id, 'rejected')}
                            disabled={processingId === app._id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities">
            {opportunities.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No opportunities yet</h3>
                <p className="text-gray-500 mb-4">Create your first opportunity to start connecting with volunteers.</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />Create Opportunity
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {opportunities.map(opp => {
                  const past = isPastEvent(opp);
                  const attendedCount = opp.volunteers?.filter((v: any) => v.status === 'attended').length ?? 0;
                  return (
                    <Card key={opp._id} className={past ? 'opacity-90' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <Badge variant="secondary" className="mb-1.5 text-xs">{opp.category}</Badge>
                            <CardTitle className="text-base leading-snug">{opp.title}</CardTitle>
                          </div>
                          <Badge variant={opp.status === 'published' ? 'default' : 'outline'} className="shrink-0 text-xs">
                            {opp.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-500 line-clamp-2">{opp.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{opp.dateTime?.start ? new Date(opp.dateTime.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                          <span>{opp.capacity?.current ?? 0}/{opp.capacity?.required ?? '?'} volunteers</span>
                        </div>

                        {/* Attendance summary if past */}
                        {past && opp.volunteers?.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {attendedCount} attended · {opp.volunteers.length - attendedCount} not marked
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm" variant="outline" className="flex-1 text-xs"
                            onClick={() => organizerAPI.updateOpportunityStatus(opp._id, opp.status === 'published' ? 'draft' : 'published').then(fetchDashboardData)}
                          >
                            {opp.status === 'published' ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm" variant="outline" className="flex-1 text-xs gap-1"
                            onClick={() => setAttendanceOpp(opp)}
                          >
                            <ClipboardList className="h-3.5 w-3.5" />
                            {past ? 'Attendance' : 'Volunteers'}
                          </Button>
                          {past && opp.status !== 'completed' && (
                            <Button
                              size="sm" variant="outline" className="text-xs text-green-700 border-green-200 hover:bg-green-50"
                              onClick={() => organizerAPI.updateOpportunityStatus(opp._id, 'completed').then(fetchDashboardData)}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Impact Report Tab */}
          <TabsContent value="impact">
            <ImpactReportTab organizerName={(user as any)?.organizationName || user?.name || 'Organisation'} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Attendance Modal */}
      {attendanceOpp && (
        <AttendanceModal
          open={!!attendanceOpp}
          onClose={() => setAttendanceOpp(null)}
          opportunity={attendanceOpp}
          onSaved={fetchDashboardData}
        />
      )}

      {/* Create Opportunity Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOpportunity} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => sf('title', e.target.value)} placeholder="e.g. Beach Cleanup Drive" required />
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <select
                  value={form.category}
                  onChange={e => sf('category', e.target.value)}
                  className="w-full h-10 px-3 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Description *</Label>
                <Button
                  type="button" variant="outline" size="sm"
                  onClick={handleAiAssist} disabled={aiLoading}
                  className="h-7 text-xs gap-1.5 text-gray-600 border-gray-200"
                >
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                  {aiLoading ? 'Generating…' : 'Template Assist'}
                </Button>
              </div>
              <Textarea value={form.description} onChange={e => sf('description', e.target.value)} placeholder="Describe the opportunity…" rows={3} required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 space-y-1.5">
                <Label>Address</Label>
                <Input value={form.address} onChange={e => sf('address', e.target.value)} placeholder="Street / landmark" />
              </div>
              <div className="space-y-1.5">
                <Label>City *</Label>
                <Input value={form.city} onChange={e => sf('city', e.target.value)} placeholder="Douala" required />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={e => sf('country', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Duration (hrs)</Label>
                <Input type="number" min="0.5" step="0.5" value={form.duration} onChange={e => sf('duration', e.target.value)} placeholder="4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Date & Time *</Label>
                <Input type="datetime-local" value={form.startDate} onChange={e => sf('startDate', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>End Date & Time</Label>
                <Input type="datetime-local" value={form.endDate} onChange={e => sf('endDate', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Volunteers Needed *</Label>
                <Input type="number" min="1" value={form.capacity} onChange={e => sf('capacity', e.target.value)} placeholder="20" required />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center justify-between">
                  <span>Community <span className="text-gray-400 font-normal">(optional)</span></span>
                  {communities.length === 0 && (
                    <Link to="/communities" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink size={11} />Create one
                    </Link>
                  )}
                </Label>
                <select
                  value={form.community}
                  onChange={e => sf('community', e.target.value)}
                  className="w-full h-10 px-3 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No community (standalone)</option>
                  {communities.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={e => sf('tags', e.target.value)} placeholder="cleanup, environment, youth" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={creating}>Cancel</Button>
              <Button type="submit" disabled={creating}>
                {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : 'Create Opportunity'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default OrganizerDashboardEnhanced;
