import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  UserCheck
} from 'lucide-react';
import { organizerAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const OrganizerDashboardEnhanced: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, appsData, oppsData] = await Promise.all([
        organizerAPI.getStats(),
        organizerAPI.getApplications({ status: 'pending' }),
        organizerAPI.getOpportunities({ status: 'active' })
      ]);
      
      setStats(statsData);
      setApplications(appsData.data || []);
      setOpportunities(oppsData.data || []);
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

  const handleApplicationAction = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      setProcessingId(applicationId);
      await organizerAPI.updateApplicationStatus(applicationId, status);
      
      setApplications(applications.filter(app => app._id !== applicationId));
      
      toast({
        title: "Success",
        description: `Application ${status}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update application",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
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
        <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
        <p className="text-gray-600">Manage your opportunities and volunteers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Opportunities</p>
                <p className="text-2xl font-bold">{stats?.totalOpportunities || 0}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Volunteers</p>
                <p className="text-2xl font-bold">{stats?.totalVolunteers || 0}</p>
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
                <p className="text-sm text-gray-600">Active Opportunities</p>
                <p className="text-2xl font-bold">{opportunities.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                        {app.volunteer?.profile?.skills && app.volunteer.profile.skills.length > 0 && (
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
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApplicationAction(app._id, 'accepted')}
                          disabled={processingId === app._id}
                        >
                          {processingId === app._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplicationAction(app._id, 'rejected')}
                          disabled={processingId === app._id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
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
              <h3 className="text-xl font-semibold mb-2">No active opportunities</h3>
              <p className="text-gray-600">Create your first opportunity to get started</p>
              <Button className="mt-4">Create Opportunity</Button>
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
                      <Badge variant={opp.status === 'active' ? 'default' : 'outline'}>
                        {opp.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{opp.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(opp.dateTime.start).toLocaleDateString()}
                      </span>
                      <span className="font-medium">
                        {opp.capacity.current}/{opp.capacity.required} volunteers
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
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
  );
};

export default OrganizerDashboardEnhanced;
