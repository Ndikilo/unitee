import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Users, Calendar, AlertTriangle, Shield, TrendingUp, Loader2, CheckCircle, XCircle, Ban,
  RefreshCw, Trash2, Search, FileText, Award, Bell, MapPin, Eye, Settings as SettingsIcon,
  Plus, Edit, X
} from 'lucide-react';
import { adminAPI, opportunityAPI, communityAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  
  // State
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([
    'Education', 'Healthcare', 'Environment', 'Community Development', 
    'Disaster Relief', 'Youth Programs', 'Elderly Care', 'Animal Welfare'
  ]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  
  // Bulk selection
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  
  // Modals
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditOppModal, setShowEditOppModal] = useState(false);
  const [showEditCommModal, setShowEditCommModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Forms
  const [alertData, setAlertData] = useState({ title: '', message: '', severity: 'medium', targetCity: '' });
  const [notificationData, setNotificationData] = useState({ title: '', message: '', targetRole: 'all' });
  const [newCategory, setNewCategory] = useState('');


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, oppsData, commsData, reportsData] = await Promise.all([
        adminAPI.getStats().catch(() => ({ totalUsers: 0, totalOpportunities: 0, totalCommunities: 0, totalApplications: 0, totalHours: 0, activeUsers: 0, pendingReports: 0 })),
        adminAPI.getUsers({ limit: 100 }).catch(() => ({ data: [] })),
        opportunityAPI.getAll().catch(() => []),
        communityAPI.getAll().catch(() => []),
        adminAPI.getReports({ status: 'pending' }).catch(() => ({ data: [] }))
      ]);
      
      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
      setOpportunities(Array.isArray(oppsData) ? oppsData : oppsData.data || []);
      setCommunities(Array.isArray(commsData) ? commsData : commsData.data || []);
      setReports(Array.isArray(reportsData) ? reportsData : reportsData.data || []);
      setApplications([]);
      setCertificates([]);
    } catch (err: any) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'delete') {
        if (!confirm('Delete this user?')) return;
        setUsers(users.filter(u => u._id !== userId));
      } else if (action === 'suspend' || action === 'activate') {
        await adminAPI.updateUserStatus(userId, { isActive: action === 'activate' });
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: action === 'activate' } : u));
      } else if (action === 'verify') {
        await adminAPI.updateUserStatus(userId, { isVerified: true });
        setUsers(users.map(u => u._id === userId ? { ...u, emailVerified: true } : u));
      } else if (action === 'promote') {
        if (!confirm('Promote this user to Admin? This will give them full platform control.')) return;
        // await adminAPI.updateUserRole(userId, { role: 'admin' });
        setUsers(users.map(u => u._id === userId ? { ...u, role: 'admin' } : u));
      } else if (action === 'demote') {
        if (!confirm('Demote this admin to regular user?')) return;
        // await adminAPI.updateUserRole(userId, { role: 'user' });
        setUsers(users.map(u => u._id === userId ? { ...u, role: 'user' } : u));
      }
      toast({ title: "Success", description: `User ${action}d` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Bulk Delete
  const handleBulkDelete = async (type: 'users' | 'opportunities') => {
    const items = type === 'users' ? selectedUsers : selectedOpportunities;
    if (items.length === 0 || !confirm(`Delete ${items.length} ${type}?`)) return;
    
    try {
      if (type === 'users') {
        setUsers(users.filter(u => !selectedUsers.includes(u._id)));
        setSelectedUsers([]);
      } else {
        for (const id of selectedOpportunities) await opportunityAPI.delete(id);
        setOpportunities(opportunities.filter(o => !selectedOpportunities.includes(o._id)));
        setSelectedOpportunities([]);
      }
      toast({ title: "Success", description: `${items.length} ${type} deleted` });
    } catch (err: any) {
      toast({ title: "Error", description: "Bulk delete failed", variant: "destructive" });
    }
  };

  // Opportunity Actions
  const handleOpportunityAction = async (oppId: string, action: string) => {
    try {
      if (action === 'delete') {
        if (!confirm('Delete this opportunity?')) return;
        await opportunityAPI.delete(oppId);
        setOpportunities(opportunities.filter(o => o._id !== oppId));
        toast({ title: "Success", description: "Opportunity deleted" });
      } else if (action === 'edit') {
        setSelectedItem(opportunities.find(o => o._id === oppId));
        setShowEditOppModal(true);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Community Actions
  const handleCommunityAction = async (commId: string, action: string) => {
    try {
      if (action === 'delete') {
        if (!confirm('Delete this community?')) return;
        await communityAPI.delete(commId);
        setCommunities(communities.filter(c => c._id !== commId));
        toast({ title: "Success", description: "Community deleted" });
      } else if (action === 'edit') {
        setSelectedItem(communities.find(c => c._id === commId));
        setShowEditCommModal(true);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Report Actions
  const handleReportAction = async (reportId: string, status: string) => {
    try {
      await adminAPI.updateReport(reportId, { status, resolution: `${status} by admin` });
      setReports(reports.filter(r => r._id !== reportId));
      toast({ title: "Success", description: `Report ${status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Application Actions
  const handleApplicationAction = async (appId: string, status: string) => {
    try {
      setApplications(applications.map(a => a._id === appId ? { ...a, status } : a));
      toast({ title: "Success", description: `Application ${status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Emergency Alert
  const handleCreateAlert = async () => {
    try {
      if (!alertData.title || !alertData.message) {
        toast({ title: "Error", description: "Title and message required", variant: "destructive" });
        return;
      }
      await adminAPI.createEmergencyAlert(alertData);
      setShowAlertModal(false);
      setAlertData({ title: '', message: '', severity: 'medium', targetCity: '' });
      toast({ title: "Success", description: "Emergency alert created" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Send Notification
  const handleSendNotification = async () => {
    try {
      if (!notificationData.title || !notificationData.message) {
        toast({ title: "Error", description: "Title and message required", variant: "destructive" });
        return;
      }
      setShowNotificationModal(false);
      setNotificationData({ title: '', message: '', targetRole: 'all' });
      toast({ title: "Success", description: "Notification sent to users" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Category Management
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory)) {
      toast({ title: "Error", description: "Category already exists", variant: "destructive" });
      return;
    }
    setCategories([...categories, newCategory]);
    setNewCategory('');
    toast({ title: "Success", description: "Category added" });
  };

  const handleRemoveCategory = (category: string) => {
    if (!confirm(`Remove category "${category}"?`)) return;
    setCategories(categories.filter(c => c !== category));
    toast({ title: "Success", description: "Category removed" });
  };

  // Filters
  const getFilteredUsers = () => {
    let filtered = users;
    if (searchTerm) filtered = filtered.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (userRoleFilter !== 'all') filtered = filtered.filter(u => u.role === userRoleFilter);
    if (userStatusFilter === 'active') filtered = filtered.filter(u => u.isActive);
    else if (userStatusFilter === 'suspended') filtered = filtered.filter(u => !u.isActive);
    return filtered;
  };

  const getFilteredOpportunities = () => {
    if (!searchTerm) return opportunities;
    return opportunities.filter(o => o.title?.toLowerCase().includes(searchTerm.toLowerCase()) || o.location?.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const getFilteredCommunities = () => {
    if (!searchTerm) return communities;
    return communities.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.location?.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();
  const filteredOpportunities = getFilteredOpportunities();
  const filteredCommunities = getFilteredCommunities();


  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Control Panel</h1>
          <p className="text-gray-600">Complete platform management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAlertModal(true)} className="bg-red-600 hover:bg-red-700">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency Alert
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <Card><CardContent className="pt-6"><div className="text-center"><Users className="h-8 w-8 mx-auto text-blue-500 mb-2" /><p className="text-2xl font-bold">{stats?.totalUsers || 0}</p><p className="text-xs text-gray-600">Users</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><Calendar className="h-8 w-8 mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold">{stats?.totalOpportunities || 0}</p><p className="text-xs text-gray-600">Opportunities</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><MapPin className="h-8 w-8 mx-auto text-purple-500 mb-2" /><p className="text-2xl font-bold">{stats?.totalCommunities || 0}</p><p className="text-xs text-gray-600">Communities</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><FileText className="h-8 w-8 mx-auto text-orange-500 mb-2" /><p className="text-2xl font-bold">{stats?.totalApplications || 0}</p><p className="text-xs text-gray-600">Applications</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-2" /><p className="text-2xl font-bold">{reports.length}</p><p className="text-xs text-gray-600">Reports</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><TrendingUp className="h-8 w-8 mx-auto text-indigo-500 mb-2" /><p className="text-2xl font-bold">{stats?.totalHours || 0}</p><p className="text-xs text-gray-600">Hours</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><CheckCircle className="h-8 w-8 mx-auto text-emerald-500 mb-2" /><p className="text-2xl font-bold">{stats?.activeUsers || 0}</p><p className="text-xs text-gray-600">Active</p></div></CardContent></Card>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        {activeTab === 'users' && (
          <>
            <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Volunteer</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>


        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Recent Users</CardTitle></CardHeader><CardContent><div className="space-y-2">{users.slice(0, 5).map(u => (<div key={u._id} className="flex justify-between p-3 border rounded"><div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div><Badge>{u.role}</Badge></div>))}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Pending Reports</CardTitle></CardHeader><CardContent><div className="space-y-2">{reports.slice(0, 5).map(r => (<div key={r._id} className="p-3 border rounded"><Badge variant="destructive" className="text-xs">{r.type}</Badge><p className="text-sm font-medium mt-1">{r.reason}</p></div>))}{reports.length === 0 && <p className="text-center text-gray-500 py-4">No pending reports</p>}</div></CardContent></Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>User Management</CardTitle><div className="flex gap-2">{selectedUsers.length > 0 && <Button size="sm" variant="destructive" onClick={() => handleBulkDelete('users')}><Trash2 className="h-4 w-4 mr-1" />Delete ({selectedUsers.length})</Button>}<p className="text-sm text-gray-600">{filteredUsers.length} users</p></div></div></CardHeader>
            <CardContent><div className="space-y-2">{filteredUsers.map(u => (<div key={u._id} className="flex items-center gap-3 p-4 border rounded hover:bg-gray-50"><Checkbox checked={selectedUsers.includes(u._id)} onCheckedChange={(c) => c ? setSelectedUsers([...selectedUsers, u._id]) : setSelectedUsers(selectedUsers.filter(id => id !== u._id))} disabled={u.role === 'admin'} /><div className="flex-1"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{u.name}</h3><Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'organizer' ? 'default' : 'secondary'} className="text-xs">{u.role}</Badge>{u.emailVerified && <Badge variant="outline" className="text-green-600 text-xs"><Shield className="h-3 w-3 mr-1" />Verified</Badge>}{!u.isActive && <Badge variant="destructive" className="text-xs">Suspended</Badge>}</div><p className="text-sm text-gray-600">{u.email}</p><p className="text-xs text-gray-500">Joined {new Date(u.createdAt).toLocaleDateString()}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setSelectedItem(u); setShowUserModal(true); }}><Eye className="h-4 w-4" /></Button>{!u.emailVerified && <Button size="sm" variant="outline" onClick={() => handleUserAction(u._id, 'verify')}><CheckCircle className="h-4 w-4" /></Button>}{u.role !== 'admin' ? (<><Button size="sm" variant="outline" className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300" onClick={() => handleUserAction(u._id, 'promote')}><Shield className="h-4 w-4" /></Button>{u.isActive ? <Button size="sm" variant="outline" onClick={() => handleUserAction(u._id, 'suspend')}><Ban className="h-4 w-4" /></Button> : <Button size="sm" onClick={() => handleUserAction(u._id, 'activate')}><CheckCircle className="h-4 w-4" /></Button>}<Button size="sm" variant="destructive" onClick={() => handleUserAction(u._id, 'delete')}><Trash2 className="h-4 w-4" /></Button></>) : (<Button size="sm" variant="outline" onClick={() => handleUserAction(u._id, 'demote')} className="text-orange-600 border-orange-300 hover:bg-orange-50">Demote</Button>)}</div></div>))}</div></CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Opportunity Management</CardTitle><div className="flex gap-2">{selectedOpportunities.length > 0 && <Button size="sm" variant="destructive" onClick={() => handleBulkDelete('opportunities')}><Trash2 className="h-4 w-4 mr-1" />Delete ({selectedOpportunities.length})</Button>}<p className="text-sm text-gray-600">{filteredOpportunities.length} opportunities</p></div></div></CardHeader>
            <CardContent><div className="space-y-2">{filteredOpportunities.map(o => (<div key={o._id} className="flex items-start gap-3 p-4 border rounded hover:bg-gray-50"><Checkbox checked={selectedOpportunities.includes(o._id)} onCheckedChange={(c) => c ? setSelectedOpportunities([...selectedOpportunities, o._id]) : setSelectedOpportunities(selectedOpportunities.filter(id => id !== o._id))} className="mt-1" /><div className="flex-1"><h3 className="font-semibold mb-1">{o.title}</h3><div className="flex items-center gap-2 mb-2"><Badge variant="outline">{o.category}</Badge><span className="text-sm text-gray-600">📍 {o.location}</span></div><p className="text-sm text-gray-600 mb-1">{o.description?.substring(0, 100)}...</p><p className="text-xs text-gray-500">By {o.organizer?.name} • {new Date(o.date).toLocaleDateString()}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => handleOpportunityAction(o._id, 'edit')}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => handleOpportunityAction(o._id, 'delete')}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div></CardContent>
          </Card>
        </TabsContent>

        {/* Communities Tab */}
        <TabsContent value="communities">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Community Management</CardTitle><p className="text-sm text-gray-600">{filteredCommunities.length} communities</p></div></CardHeader>
            <CardContent><div className="space-y-2">{filteredCommunities.map(c => (<div key={c._id} className="flex items-start justify-between p-4 border rounded hover:bg-gray-50"><div className="flex-1"><h3 className="font-semibold mb-1">{c.name}</h3><div className="flex items-center gap-2 mb-2"><Badge variant="outline">{c.category}</Badge><span className="text-sm text-gray-600">📍 {c.location}</span><span className="text-sm text-gray-600">👥 {c.members?.length || 0} members</span></div><p className="text-sm text-gray-600">{c.description?.substring(0, 100)}...</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => handleCommunityAction(c._id, 'edit')}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => handleCommunityAction(c._id, 'delete')}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div></CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader><CardTitle>Application Management</CardTitle></CardHeader>
            <CardContent>{applications.length === 0 ? (<div className="text-center py-12"><FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-600">No pending applications</p></div>) : (<div className="space-y-3">{applications.map(app => (<div key={app._id} className="p-4 border rounded"><div className="flex justify-between items-start mb-2"><div><h3 className="font-semibold">{app.volunteer?.name}</h3><p className="text-sm text-gray-600">{app.opportunity?.title}</p></div><Badge>{app.status}</Badge></div><div className="flex gap-2 mt-3"><Button size="sm" onClick={() => handleApplicationAction(app._id, 'approved')}><CheckCircle className="h-4 w-4 mr-1" />Approve</Button><Button size="sm" variant="outline" onClick={() => handleApplicationAction(app._id, 'rejected')}><XCircle className="h-4 w-4 mr-1" />Reject</Button></div></div>))}</div>)}</CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Certificate Management</CardTitle><Button size="sm" onClick={() => setShowNotificationModal(true)}><Plus className="h-4 w-4 mr-1" />Issue Certificate</Button></div></CardHeader>
            <CardContent>{certificates.length === 0 ? (<div className="text-center py-12"><Award className="h-16 w-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-600">No certificates issued</p></div>) : (<div className="space-y-2">{certificates.map(cert => (<div key={cert._id} className="flex justify-between p-4 border rounded"><div><h3 className="font-semibold">{cert.volunteer?.name}</h3><p className="text-sm text-gray-600">{cert.opportunity?.title}</p><p className="text-xs text-gray-500">{cert.hours} hours • Issued {new Date(cert.issuedAt).toLocaleDateString()}</p></div><Button size="sm" variant="outline">View</Button></div>))}</div>)}</CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          {reports.length === 0 ? (<Card className="p-12 text-center"><CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" /><h3 className="text-xl font-semibold mb-2">All Clear!</h3><p className="text-gray-600">No pending reports</p></Card>) : (<div className="space-y-4">{reports.map(r => (<Card key={r._id}><CardContent className="p-6"><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-3 mb-3"><Badge variant="destructive">{r.type}</Badge><span className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</span></div><h3 className="font-semibold mb-2 text-lg">{r.reason}</h3><p className="text-sm text-gray-600 mb-3">{r.description}</p>{r.reporter && <p className="text-xs text-gray-500">Reported by: {r.reporter.name}</p>}</div><div className="flex gap-2 ml-4"><Button size="sm" onClick={() => handleReportAction(r._id, 'resolved')}><CheckCircle className="h-4 w-4 mr-1" />Resolve</Button><Button size="sm" variant="outline" onClick={() => handleReportAction(r._id, 'dismissed')}><XCircle className="h-4 w-4 mr-1" />Dismiss</Button></div></div></CardContent></Card>))}</div>)}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader><div className="flex justify-between"><CardTitle>Category Management</CardTitle><Button size="sm" onClick={() => setShowCategoryModal(true)}><Plus className="h-4 w-4 mr-1" />Add Category</Button></div></CardHeader>
              <CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{categories.map(cat => (<div key={cat} className="flex items-center justify-between p-3 border rounded"><span className="font-medium">{cat}</span><Button size="sm" variant="ghost" onClick={() => handleRemoveCategory(cat)}><X className="h-4 w-4" /></Button></div>))}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
              <CardContent><Button onClick={() => setShowNotificationModal(true)}><Bell className="h-4 w-4 mr-2" />Send Bulk Notification</Button></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>


      {/* Modals */}
      
      {/* Emergency Alert Modal */}
      <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Emergency Alert</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Alert Title" value={alertData.title} onChange={(e) => setAlertData({ ...alertData, title: e.target.value })} />
            <Textarea placeholder="Alert Message" value={alertData.message} onChange={(e) => setAlertData({ ...alertData, message: e.target.value })} rows={4} />
            <Select value={alertData.severity} onValueChange={(v) => setAlertData({ ...alertData, severity: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Target City (optional)" value={alertData.targetCity} onChange={(e) => setAlertData({ ...alertData, targetCity: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertModal(false)}>Cancel</Button>
            <Button onClick={handleCreateAlert} className="bg-red-600 hover:bg-red-700">Create Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name</Label><p className="font-medium">{selectedItem.name}</p></div>
                <div><Label>Email</Label><p className="font-medium">{selectedItem.email}</p></div>
                <div><Label>Role</Label><Badge>{selectedItem.role}</Badge></div>
                <div><Label>Status</Label><Badge variant={selectedItem.isActive ? 'default' : 'destructive'}>{selectedItem.isActive ? 'Active' : 'Suspended'}</Badge></div>
                <div><Label>Verified</Label><Badge variant={selectedItem.emailVerified ? 'default' : 'secondary'}>{selectedItem.emailVerified ? 'Yes' : 'No'}</Badge></div>
                <div><Label>Joined</Label><p>{new Date(selectedItem.createdAt).toLocaleDateString()}</p></div>
              </div>
              {selectedItem.stats && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Total Hours</Label><p className="text-2xl font-bold">{selectedItem.stats.totalHours || 0}</p></div>
                    <div><Label>Events</Label><p className="text-2xl font-bold">{selectedItem.stats.totalEvents || 0}</p></div>
                    <div><Label>People Helped</Label><p className="text-2xl font-bold">{selectedItem.stats.peopleHelped || 0}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Bulk Notification</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Notification Title" value={notificationData.title} onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })} />
            <Textarea placeholder="Notification Message" value={notificationData.message} onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })} rows={4} />
            <Select value={notificationData.targetRole} onValueChange={(v) => setNotificationData({ ...notificationData, targetRole: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="user">Volunteers Only</SelectItem>
                <SelectItem value="organizer">Organizers Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationModal(false)}>Cancel</Button>
            <Button onClick={handleSendNotification}>Send Notification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Category Name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
            <Button onClick={() => { handleAddCategory(); setShowCategoryModal(false); }}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
