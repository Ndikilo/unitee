import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Calendar, 
  AlertTriangle,
  Shield,
  TrendingUp,
  Loader2,
  CheckCircle,
  XCircle,
  Ban
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AdminDashboardEnhanced: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '',
    message: '',
    severity: 'medium',
    targetCity: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, reportsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 10 }),
        adminAPI.getReports({ status: 'pending', limit: 10 })
      ]);
      
      setStats(statsData);
      setUsers(usersData.data || []);
      setReports(reportsData.data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId: string, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(userId, { isActive });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive } : u));
      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'suspended'}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleReportAction = async (reportId: string, status: string, resolution?: string) => {
    try {
      await adminAPI.updateReport(reportId, { status, resolution });
      setReports(reports.filter(r => r._id !== reportId));
      toast({
        title: "Success",
        description: "Report updated",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  const handleCreateAlert = async () => {
    try {
      await adminAPI.createEmergencyAlert(alertData);
      setShowAlertForm(false);
      setAlertData({ title: '', message: '', severity: 'medium', targetCity: '' });
      toast({
        title: "Success",
        description: "Emergency alert created",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform management and oversight</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Opportunities</p>
                <p className="text-2xl font-bold">{stats?.totalOpportunities || 0}</p>
              </div>
              <Calendar className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{stats?.totalHours || 0}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="alerts">Emergency Alerts</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'organizer' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        {user.emailVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {!user.isActive && (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {user.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserStatusUpdate(user._id, false)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleUserStatusUpdate(user._id, true)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          {reports.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No pending reports</h3>
              <p className="text-gray-600">All reports have been reviewed</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <Card key={report._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="destructive">{report.type}</Badge>
                          <span className="text-sm text-gray-600">
                            Reported {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2">{report.reason}</h3>
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        <p className="text-xs text-gray-500">
                          Reported by: {report.reporter?.name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReportAction(report._id, 'resolved', 'Action taken')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report._id, 'dismissed')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Emergency Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Emergency Alerts</CardTitle>
                <Button onClick={() => setShowAlertForm(!showAlertForm)}>
                  {showAlertForm ? 'Cancel' : 'Create Alert'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAlertForm && (
                <div className="space-y-4 mb-6 p-4 border rounded-lg">
                  <Input
                    placeholder="Alert Title"
                    value={alertData.title}
                    onChange={(e) => setAlertData({ ...alertData, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Alert Message"
                    value={alertData.message}
                    onChange={(e) => setAlertData({ ...alertData, message: e.target.value })}
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={alertData.severity} onValueChange={(value) => setAlertData({ ...alertData, severity: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Target City (optional)"
                      value={alertData.targetCity}
                      onChange={(e) => setAlertData({ ...alertData, targetCity: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreateAlert} className="w-full">
                    Create Emergency Alert
                  </Button>
                </div>
              )}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Emergency alerts will be sent to all users matching the criteria
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardEnhanced;
