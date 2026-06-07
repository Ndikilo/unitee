import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CertificateTemplatesTab from '@/components/admin/CertificateTemplatesTab';
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
  Plus, Edit, X, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, opportunityAPI, communityAPI, badgeAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [verifyInput, setVerifyInput] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loadingSystemHealth, setLoadingSystemHealth] = useState(false);
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
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showBadgeStatsModal, setShowBadgeStatsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Forms
  const [alertData, setAlertData] = useState({ title: '', message: '', severity: 'medium', targetCity: '' });
  const [notificationData, setNotificationData] = useState({ title: '', message: '', targetRole: 'all' });
  const [newCategory, setNewCategory] = useState('');
  const [badgeFormData, setBadgeFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'participation',
    criteriaType: 'events_completed',
    threshold: 1,
    tier: 'bronze',
    points: 10
  });


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
      setUsers(Array.isArray(usersData) ? usersData : usersData.users || usersData.data || []);
      setOpportunities(Array.isArray(oppsData) ? oppsData : oppsData.opportunities || oppsData.data || []);
      setCommunities(Array.isArray(commsData) ? commsData : commsData.communities || commsData.data || []);
      setReports(Array.isArray(reportsData) ? reportsData : reportsData.reports || reportsData.data || []);
      setCertificates([]);
    } catch (err: any) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const badgesData = await badgeAPI.adminGetAllBadges();
      setBadges(Array.isArray(badgesData) ? badgesData : []);
    } catch (err: any) {
      console.error('Badges error:', err);
      toast({ title: "Error", description: "Failed to load badges", variant: "destructive" });
    }
  };

  // User Actions
  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'delete') {
        if (!confirm('Permanently delete this user? This cannot be undone.')) return;
        await adminAPI.deleteUser(userId);
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
    if (items.length === 0 || !confirm(`Permanently delete ${items.length} ${type}? This cannot be undone.`)) return;

    try {
      if (type === 'users') {
        await Promise.all(selectedUsers.map(id => adminAPI.deleteUser(id)));
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
  const handleOpportunityAction = async (oppId: string) => {
    try {
      if (!confirm('Delete this opportunity?')) return;
      await opportunityAPI.delete(oppId);
      setOpportunities(opportunities.filter(o => o._id !== oppId));
      toast({ title: "Success", description: "Opportunity deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Community Actions
  const handleCommunityAction = async (commId: string) => {
    try {
      if (!confirm('Delete this community?')) return;
      await communityAPI.delete(commId);
      setCommunities(communities.filter(c => c._id !== commId));
      toast({ title: "Success", description: "Community deleted" });
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

  // Badge Management
  const handleCreateBadge = async () => {
    try {
      if (!badgeFormData.name || !badgeFormData.description) {
        toast({ title: "Error", description: "Name and description required", variant: "destructive" });
        return;
      }
      await badgeAPI.adminCreateBadge({
        name: badgeFormData.name,
        description: badgeFormData.description,
        icon: badgeFormData.icon,
        category: badgeFormData.category,
        criteria: {
          type: badgeFormData.criteriaType,
          threshold: badgeFormData.threshold
        },
        tier: badgeFormData.tier,
        points: badgeFormData.points
      });
      setShowBadgeModal(false);
      setBadgeFormData({
        name: '',
        description: '',
        icon: '🏆',
        category: 'participation',
        criteriaType: 'events_completed',
        threshold: 1,
        tier: 'bronze',
        points: 10
      });
      fetchBadges();
      toast({ title: "Success", description: "Badge created successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateBadge = async () => {
    try {
      if (!selectedItem?._id) return;
      await badgeAPI.adminUpdateBadge(selectedItem._id, {
        name: badgeFormData.name,
        description: badgeFormData.description,
        icon: badgeFormData.icon,
        category: badgeFormData.category,
        criteria: {
          type: badgeFormData.criteriaType,
          threshold: badgeFormData.threshold
        },
        tier: badgeFormData.tier,
        points: badgeFormData.points
      });
      setShowBadgeModal(false);
      setSelectedItem(null);
      fetchBadges();
      toast({ title: "Success", description: "Badge updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    try {
      if (!confirm('Delete this badge? This action cannot be undone.')) return;
      await badgeAPI.adminDeleteBadge(badgeId);
      fetchBadges();
      toast({ title: "Success", description: "Badge deleted successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleBadge = async (badgeId: string) => {
    try {
      await badgeAPI.adminToggleBadge(badgeId);
      fetchBadges();
      toast({ title: "Success", description: "Badge status updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDuplicateBadge = async (badgeId: string) => {
    try {
      await badgeAPI.adminDuplicateBadge(badgeId);
      fetchBadges();
      toast({ title: "Success", description: "Badge duplicated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEditBadge = (badge: any) => {
    setSelectedItem(badge);
    setBadgeFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      criteriaType: badge.criteria.type,
      threshold: badge.criteria.threshold,
      tier: badge.tier,
      points: badge.points
    });
    setShowBadgeModal(true);
  };

  const handleViewBadgeStats = async (badge: any) => {
    try {
      const stats = await badgeAPI.adminGetBadgeStats(badge._id);
      setSelectedItem(stats);
      setShowBadgeStatsModal(true);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load badge stats", variant: "destructive" });
    }
  };

  // Fetch System Health
  const fetchSystemHealth = async () => {
    if (systemHealth && Date.now() - systemHealth.timestamp < 300000) {
      // Use cached data if less than 5 minutes old
      return;
    }
    
    setLoadingSystemHealth(true);
    try {
      const data = await adminAPI.getSystemHealth();
      const uptimeMs = data.uptimeSeconds * 1000;
      const health = {
        timestamp: Date.now(),
        uptime: uptimeMs,
        serverStartTime: data.serverStartTime,
        memoryUsage: data.memory?.heapPercent || 0,
        heapUsedMB: data.memory?.heapUsedMB || 0,
        heapTotalMB: data.memory?.heapTotalMB || 0,
        rssMB: data.memory?.rssMB || 0,
        activeUsers24h: data.activeUsers24h || 0,
        databaseSize: data.database ? `${data.database.dataSizeMB} MB` : 'N/A',
        databaseObjects: data.database?.objects || 0,
        nodeVersion: data.nodeVersion || process.versions?.node || 'N/A',
        environment: data.environment || 'N/A',
      };
      setSystemHealth(health);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch system health", variant: "destructive" });
    } finally {
      setLoadingSystemHealth(false);
    }
  };

  // Format uptime
  const formatUptime = (ms: number) => {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${days}d ${hours}h ${minutes}m`;
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
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredUsers = getFilteredUsers();
  const filteredOpportunities = getFilteredOpportunities();
  const filteredCommunities = getFilteredCommunities();

  return (
    <DashboardLayout>
    <div className="max-w-7xl mx-auto">
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
      <Tabs value={activeTab} onValueChange={(tab) => { setActiveTab(tab); if (tab === 'system') fetchSystemHealth(); if (tab === 'badges') fetchBadges(); }} className="space-y-6">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="cert-templates">Templates</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>


        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Recent Users</CardTitle></CardHeader><CardContent><div className="space-y-2">{users.slice(0, 5).map(u => (<div key={u._id} className="flex justify-between p-3 border rounded"><div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div><Badge>{u.role}</Badge></div>))}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Pending Reports</CardTitle></CardHeader><CardContent><div className="space-y-2">{reports.slice(0, 5).map(r => (<div key={r._id} className="p-3 border rounded"><Badge variant="destructive" className="text-xs">{r.type}</Badge><p className="text-sm font-medium mt-1">{r.reason}</p></div>))}{reports.length === 0 && <p className="text-center text-gray-500 py-4">No pending reports</p>}</div></CardContent></Card>
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                  Verify a Certificate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 max-w-lg">
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
                <p className="text-xs text-gray-400 mt-2">Verify both organisation certificates and volunteer passports. Admins can verify all types.</p>
              </CardContent>
            </Card>
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
            <CardContent><div className="space-y-2">{filteredOpportunities.map(o => (<div key={o._id} className="flex items-start gap-3 p-4 border rounded hover:bg-gray-50"><Checkbox checked={selectedOpportunities.includes(o._id)} onCheckedChange={(c) => c ? setSelectedOpportunities([...selectedOpportunities, o._id]) : setSelectedOpportunities(selectedOpportunities.filter(id => id !== o._id))} className="mt-1" /><div className="flex-1"><h3 className="font-semibold mb-1">{o.title}</h3><div className="flex items-center gap-2 mb-2"><Badge variant="outline">{o.category}</Badge><span className="text-sm text-gray-600">📍 {o.location}</span></div><p className="text-sm text-gray-600 mb-1">{o.description?.substring(0, 100)}...</p><p className="text-xs text-gray-500">By {o.organizer?.name} • {new Date(o.date).toLocaleDateString()}</p></div><div className="flex gap-2"><Button size="sm" variant="destructive" onClick={() => handleOpportunityAction(o._id)}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div></CardContent>
          </Card>
        </TabsContent>

        {/* Communities Tab */}
        <TabsContent value="communities">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Community Management</CardTitle><p className="text-sm text-gray-600">{filteredCommunities.length} communities</p></div></CardHeader>
            <CardContent><div className="space-y-2">{filteredCommunities.map(c => (<div key={c._id} className="flex items-start justify-between p-4 border rounded hover:bg-gray-50"><div className="flex-1"><h3 className="font-semibold mb-1">{c.name}</h3><div className="flex items-center gap-2 mb-2"><Badge variant="outline">{c.category}</Badge><span className="text-sm text-gray-600">📍 {c.location}</span><span className="text-sm text-gray-600">👥 {c.members?.length || 0} members</span></div><p className="text-sm text-gray-600">{c.description?.substring(0, 100)}...</p></div><div className="flex gap-2"><Button size="sm" variant="destructive" onClick={() => handleCommunityAction(c._id)}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div></CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          <Card>
            <CardHeader><CardTitle>Certificate Management</CardTitle></CardHeader>
            <CardContent>{certificates.length === 0 ? (<div className="text-center py-12"><Award className="h-16 w-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-600">No certificates issued</p></div>) : (<div className="space-y-2">{certificates.map(cert => (<div key={cert._id} className="flex justify-between p-4 border rounded"><div><h3 className="font-semibold">{cert.volunteer?.name}</h3><p className="text-sm text-gray-600">{cert.opportunity?.title}</p><p className="text-xs text-gray-500">{cert.hours} hours • Issued {new Date(cert.issuedAt).toLocaleDateString()}</p></div><Button size="sm" variant="outline">View</Button></div>))}</div>)}</CardContent>
          </Card>

        </TabsContent>

        {/* Certificate Templates Tab */}
        <CertificateTemplatesTab />


        {/* Badges Tab */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Badge Management</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Create and manage achievement badges for volunteers</p>
                </div>
                <Button onClick={() => { setSelectedItem(null); setBadgeFormData({ name: '', description: '', icon: '🏆', category: 'participation', criteriaType: 'events_completed', threshold: 1, tier: 'bronze', points: 10 }); setShowBadgeModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Badge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-4">No badges created yet</p>
                  <Button onClick={() => setShowBadgeModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Badge
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map(badge => (
                    <div key={badge._id} className={`p-4 border rounded-lg ${badge.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{badge.icon}</div>
                          <div>
                            <h3 className="font-semibold text-sm">{badge.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{badge.category}</Badge>
                              <Badge variant={badge.tier === 'platinum' ? 'default' : badge.tier === 'gold' ? 'default' : badge.tier === 'silver' ? 'secondary' : 'outline'} className="text-xs">{badge.tier}</Badge>
                            </div>
                          </div>
                        </div>
                        <Badge variant={badge.isActive ? 'default' : 'secondary'} className="text-xs">
                          {badge.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b">
                        <span>Criteria: {badge.criteria.type.replace(/_/g, ' ')}</span>
                        <span>Threshold: {badge.criteria.threshold}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-gray-600">Points: <span className="font-semibold text-blue-600">{badge.points}</span></span>
                        <span className="text-gray-600">Earned by: <span className="font-semibold text-green-600">{badge.earnedCount || 0}</span> users</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewBadgeStats(badge)} className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          Stats
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditBadge(badge)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggleBadge(badge._id)}>
                          {badge.isActive ? <Ban className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDuplicateBadge(badge._id)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteBadge(badge._id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          {reports.length === 0 ? (<Card className="p-12 text-center"><CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" /><h3 className="text-xl font-semibold mb-2">All Clear!</h3><p className="text-gray-600">No pending reports</p></Card>) : (<div className="space-y-4">{reports.map(r => (<Card key={r._id}><CardContent className="p-6"><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-3 mb-3"><Badge variant="destructive">{r.type}</Badge><span className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</span></div><h3 className="font-semibold mb-2 text-lg">{r.reason}</h3><p className="text-sm text-gray-600 mb-3">{r.description}</p>{r.reporter && <p className="text-xs text-gray-500">Reported by: {r.reporter.name}</p>}</div><div className="flex gap-2 ml-4"><Button size="sm" onClick={() => handleReportAction(r._id, 'resolved')}><CheckCircle className="h-4 w-4 mr-1" />Resolve</Button><Button size="sm" variant="outline" onClick={() => handleReportAction(r._id, 'dismissed')}><XCircle className="h-4 w-4 mr-1" />Dismiss</Button></div></div></CardContent></Card>))}</div>)}
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system">
          {loadingSystemHealth ? (
            <Card className="p-12 text-center"><Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" /><p className="text-gray-600">Loading system metrics...</p></Card>
          ) : systemHealth ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">System Health Monitor</h2>
                <Button onClick={fetchSystemHealth} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Refresh Data</Button>
              </div>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">Server Uptime</p><p className="text-2xl font-bold">{formatUptime(systemHealth.uptime)}</p><p className="text-xs text-green-600 mt-1">● Online</p></div><TrendingUp className="h-10 w-10 text-green-500 opacity-20" /></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">Active Users (24h)</p><p className="text-2xl font-bold">{systemHealth.activeUsers24h}</p><p className="text-xs text-gray-500 mt-1">Unique sessions</p></div><Users className="h-10 w-10 text-purple-500 opacity-20" /></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">Heap Memory</p><p className="text-2xl font-bold">{systemHealth.memoryUsage}%</p><p className="text-xs text-gray-500 mt-1">{systemHealth.heapUsedMB} / {systemHealth.heapTotalMB} MB</p></div><AlertTriangle className="h-10 w-10 text-blue-500 opacity-20" /></div></CardContent></Card>
              </div>

              {/* Resource Usage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Memory Usage</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2"><span className="text-sm font-medium">Heap Used</span><span className="text-sm text-gray-600">{systemHealth.memoryUsage}%</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${systemHealth.memoryUsage}%`}}></div></div>
                      </div>
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between"><span className="text-sm text-gray-600">Heap Used</span><span className="font-medium">{systemHealth.heapUsedMB} MB</span></div>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">Heap Total</span><span className="font-medium">{systemHealth.heapTotalMB} MB</span></div>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">RSS (process)</span><span className="font-medium">{systemHealth.rssMB} MB</span></div>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">Database Size</span><span className="font-medium">{systemHealth.databaseSize}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">DB Objects</span><span className="font-medium">{systemHealth.databaseObjects?.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>User Activity</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded"><span className="text-sm font-medium">Total Users</span><span className="text-xl font-bold">{stats?.totalUsers || 0}</span></div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded"><span className="text-sm font-medium">Active (24h)</span><span className="text-xl font-bold text-green-600">{systemHealth.activeUsers24h}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Info */}
              <Card>
                <CardHeader><CardTitle>System Information</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="text-xs text-gray-600 mb-1">Node Version</p><p className="font-medium">{systemHealth.nodeVersion}</p></div>
                    <div><p className="text-xs text-gray-600 mb-1">MongoDB</p><p className="font-medium">Connected</p></div>
                    <div><p className="text-xs text-gray-600 mb-1">Environment</p><p className="font-medium">{systemHealth.environment}</p></div>
                    <div><p className="text-xs text-gray-600 mb-1">Last Restart</p><p className="font-medium">{systemHealth.serverStartTime ? new Date(systemHealth.serverStartTime).toLocaleString() : 'N/A'}</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center"><TrendingUp className="h-16 w-16 mx-auto text-gray-300 mb-4" /><h3 className="text-xl font-semibold mb-2">System Health Monitor</h3><p className="text-gray-600 mb-4">View detailed system metrics and performance data</p><Button onClick={fetchSystemHealth}>Load System Health</Button></Card>
          )}
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

      {/* Badge Create/Edit Modal */}
      <Dialog open={showBadgeModal} onOpenChange={setShowBadgeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Badge' : 'Create New Badge'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Badge Name</Label>
                <Input placeholder="e.g., First Steps" value={badgeFormData.name} onChange={(e) => setBadgeFormData({ ...badgeFormData, name: e.target.value })} />
              </div>
              <div>
                <Label>Icon (Emoji)</Label>
                <Input placeholder="🏆" value={badgeFormData.icon} onChange={(e) => setBadgeFormData({ ...badgeFormData, icon: e.target.value })} maxLength={2} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Badge description..." value={badgeFormData.description} onChange={(e) => setBadgeFormData({ ...badgeFormData, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={badgeFormData.category} onValueChange={(v) => setBadgeFormData({ ...badgeFormData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="impact">Impact</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="skills">Skills</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tier</Label>
                <Select value={badgeFormData.tier} onValueChange={(v) => setBadgeFormData({ ...badgeFormData, tier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Criteria Type</Label>
                <Select value={badgeFormData.criteriaType} onValueChange={(v) => setBadgeFormData({ ...badgeFormData, criteriaType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="events_completed">Events Completed</SelectItem>
                    <SelectItem value="hours_logged">Hours Logged</SelectItem>
                    <SelectItem value="people_helped">People Helped</SelectItem>
                    <SelectItem value="communities_joined">Communities Joined</SelectItem>
                    <SelectItem value="skills_added">Skills Added</SelectItem>
                    <SelectItem value="events_created">Events Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Threshold</Label>
                <Input type="number" min="1" value={badgeFormData.threshold} onChange={(e) => setBadgeFormData({ ...badgeFormData, threshold: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div>
              <Label>Points</Label>
              <Input type="number" min="1" value={badgeFormData.points} onChange={(e) => setBadgeFormData({ ...badgeFormData, points: parseInt(e.target.value) || 10 })} />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Preview</h4>
              <div className="flex items-center gap-3">
                <div className="text-4xl">{badgeFormData.icon}</div>
                <div>
                  <p className="font-semibold">{badgeFormData.name || 'Badge Name'}</p>
                  <p className="text-sm text-gray-600">{badgeFormData.description || 'Badge description'}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{badgeFormData.category}</Badge>
                    <Badge className="text-xs">{badgeFormData.tier}</Badge>
                    <Badge variant="secondary" className="text-xs">{badgeFormData.points} pts</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBadgeModal(false); setSelectedItem(null); }}>Cancel</Button>
            <Button onClick={selectedItem ? handleUpdateBadge : handleCreateBadge}>
              {selectedItem ? 'Update Badge' : 'Create Badge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Stats Modal */}
      <Dialog open={showBadgeStatsModal} onOpenChange={setShowBadgeStatsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Badge Statistics</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-5xl">{selectedItem.badge?.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedItem.badge?.name}</h3>
                  <p className="text-gray-600">{selectedItem.badge?.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{selectedItem.badge?.category}</Badge>
                    <Badge>{selectedItem.badge?.tier}</Badge>
                    <Badge variant="secondary">{selectedItem.badge?.points} points</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-blue-600">{selectedItem.earnedCount || 0}</p>
                    <p className="text-sm text-gray-600">Users Earned</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-green-600">{selectedItem.badge?.criteria?.threshold}</p>
                    <p className="text-sm text-gray-600">Threshold</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-purple-600">{selectedItem.badge?.isActive ? 'Active' : 'Inactive'}</p>
                    <p className="text-sm text-gray-600">Status</p>
                  </CardContent>
                </Card>
              </div>
              {selectedItem.recentEarners && selectedItem.recentEarners.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recent Earners</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedItem.recentEarners.map((earner: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{earner.userName}</p>
                          <p className="text-sm text-gray-600">{earner.userEmail}</p>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(earner.earnedAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
