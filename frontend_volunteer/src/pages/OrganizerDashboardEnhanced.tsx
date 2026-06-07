import React, { useState, useEffect } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  UserCheck,
  Plus,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { organizerAPI, opportunityAPI, communityAPI } from '@/lib/api';
import { useAuth } from '@/contexts/NewAuthContext';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Environment', 'Education', 'Healthcare', 'Humanitarian', 'Social Services', 'Economic Development'];

const emptyForm = {
  title: '',
  description: '',
  category: 'Environment',
  address: '',
  city: '',
  country: 'Cameroon',
  startDate: '',
  endDate: '',
  duration: '',
  capacity: '',
  community: '',
  tags: '',
};

const OrganizerDashboardEnhanced: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Create opportunity modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchDashboardData();
    fetchCommunities();
  }, [isAuthenticated, authLoading]);

  const fetchDashboardData = async () => {
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
  };

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
      toast({ title: 'Success', description: `Application ${status}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update application', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const sf = (k: keyof typeof emptyForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const payload: any = {
        title:       form.title,
        description: form.description,
        category:    form.category,
        location: {
          address: form.address,
          city:    form.city,
          country: form.country,
        },
        dateTime: {
          start:    form.startDate,
          end:      form.endDate || undefined,
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Organizer Dashboard</h1>
            <p className="text-gray-600">Manage your opportunities and volunteers</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Opportunity
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Opportunities</p>
                  <p className="text-2xl font-bold">{stats?.activeOpportunities ?? opportunities.length}</p>
                </div>
                <Calendar className="h-10 w-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applicants</p>
                  <p className="text-2xl font-bold">{stats?.totalApplicants ?? 0}</p>
                </div>
                <Users className="h-10 w-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Events</p>
                  <p className="text-2xl font-bold">{stats?.completedEvents ?? 0}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verify a Certificate */}
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
              <Button
                onClick={() => verifyInput.trim() && navigate(`/verify/${verifyInput.trim()}`)}
                disabled={!verifyInput.trim()}
              >
                Verify
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Verify both organisation certificates and volunteer passports.</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">
              Pending Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              My Opportunities ({opportunities.length})
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            {applications.length === 0 ? (
              <Card className="p-12 text-center">
                <UserCheck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No pending applications</h3>
                <p className="text-gray-600">All applications have been reviewed</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <Card key={app._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{app.volunteer?.name}</h3>
                            <Badge variant="secondary">{app.opportunity?.title}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                          {app.volunteer?.profile?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="text-sm text-gray-600">Skills:</span>
                              {app.volunteer.profile.skills.map((skill: string, i: number) => (
                                <Badge key={i} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                          )}
                          {app.volunteer?.stats && (
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>Hours: {app.volunteer.stats.totalHours}</span>
                              <span>Events: {app.volunteer.stats.totalEvents}</span>
                            </div>
                          )}
                          {app.coverLetter && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{app.coverLetter}"</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApplicationAction(app._id, 'accepted')}
                            disabled={processingId === app._id}
                          >
                            {processingId === app._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><CheckCircle className="h-4 w-4 mr-1" />Accept</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
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
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No opportunities yet</h3>
                <p className="text-gray-600 mb-4">Create your first opportunity to get started</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />Create Opportunity
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opportunities.map(opp => (
                  <Card key={opp._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="secondary" className="mb-2">{opp.category}</Badge>
                          <CardTitle className="text-lg">{opp.title}</CardTitle>
                        </div>
                        <Badge variant={opp.status === 'published' ? 'default' : 'outline'}>
                          {opp.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{opp.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {opp.dateTime?.start ? new Date(opp.dateTime.start).toLocaleDateString() : '—'}
                        </span>
                        <span className="font-medium">
                          {opp.capacity?.current ?? 0}/{opp.capacity?.required ?? '?'} volunteers
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => organizerAPI.updateOpportunityStatus(opp._id, opp.status === 'published' ? 'draft' : 'published').then(fetchDashboardData)}
                        >
                          {opp.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Opportunity Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOpportunity} className="space-y-4 py-2">
            {/* Title & Category */}
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

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => sf('description', e.target.value)} placeholder="Describe the opportunity…" rows={3} required />
            </div>

            {/* Location */}
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

            {/* Dates */}
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

            {/* Capacity & Community */}
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

            {/* Tags */}
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={e => sf('tags', e.target.value)} placeholder="cleanup, environment, youth" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={creating}>
                Cancel
              </Button>
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
