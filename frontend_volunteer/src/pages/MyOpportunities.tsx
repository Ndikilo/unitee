import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Download
} from 'lucide-react';
import { opportunityAPI, certificateAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Opportunity {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    city: string;
    country: string;
  };
  dateTime: {
    start: string;
    end?: string;
    duration?: number;
  };
  capacity: {
    required: number;
    current: number;
  };
  organizer: {
    _id: string;
    name: string;
    organizationName?: string;
  };
  status: string;
  applicationStatus?: 'pending' | 'accepted' | 'rejected';
  hoursLogged?: number;
  createdAt: string;
}

const MyOpportunities: React.FC = () => {
  const { toast } = useToast();
  const [registeredOpportunities, setRegisteredOpportunities] = useState<Opportunity[]>([]);
  const [createdOpportunities, setCreatedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [hoursToLog, setHoursToLog] = useState('');
  const [loggingHours, setLoggingHours] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch registered opportunities
      const registeredResponse = await opportunityAPI.getUserOpportunities('registered');
      setRegisteredOpportunities(registeredResponse.data || []);
      
      // Try to fetch created opportunities (for organizers)
      try {
        const createdResponse = await opportunityAPI.getUserOpportunities('created');
        setCreatedOpportunities(createdResponse.data || []);
      } catch (err) {
        // User might not be an organizer, that's okay
        setCreatedOpportunities([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load opportunities');
      toast({
        title: "Error",
        description: "Failed to load your opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (opportunityId: string) => {
    try {
      setCancellingId(opportunityId);
      await opportunityAPI.cancelSignup(opportunityId);
      
      setRegisteredOpportunities(registeredOpportunities.filter(opp => opp._id !== opportunityId));
      
      toast({
        title: "Cancelled",
        description: "Your registration has been cancelled",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel registration",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogHours = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setHoursToLog(opportunity.dateTime.duration?.toString() || '');
    setShowHoursDialog(true);
  };

  const submitHours = async () => {
    if (!selectedOpportunity || !hoursToLog) return;
    
    try {
      setLoggingHours(true);
      // This would call an API to log hours - placeholder for now
      // await opportunityAPI.logHours(selectedOpportunity._id, parseFloat(hoursToLog));
      
      toast({
        title: "Hours Logged",
        description: `Successfully logged ${hoursToLog} hours`,
      });
      
      setShowHoursDialog(false);
      setHoursToLog('');
      fetchOpportunities();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to log hours",
        variant: "destructive",
      });
    } finally {
      setLoggingHours(false);
    }
  };

  const handleDownloadCertificate = async (opportunityId: string) => {
    try {
      setDownloadingCert(opportunityId);
      // This would fetch the certificate ID from the opportunity
      // For now, using opportunityId as placeholder
      await certificateAPI.downloadCertificate(opportunityId);
      
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to download certificate",
        variant: "destructive",
      });
    } finally {
      setDownloadingCert(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Registered</Badge>;
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const OpportunityCard = ({ opportunity, showCancelButton = false }: { opportunity: Opportunity; showCancelButton?: boolean }) => {
    const upcoming = isUpcoming(opportunity.dateTime.start);
    const past = isPast(opportunity.dateTime.start);

    return (
      <Card className={`${past ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{opportunity.category}</Badge>
                {opportunity.applicationStatus && getStatusBadge(opportunity.applicationStatus)}
                {past && <Badge variant="outline">Completed</Badge>}
              </div>
              <CardTitle className="text-lg">{opportunity.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {opportunity.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {opportunity.location.city}, {opportunity.location.country}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(opportunity.dateTime.start)}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {opportunity.capacity.current}/{opportunity.capacity.required} volunteers
          </div>
          
          {opportunity.dateTime.duration && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {opportunity.dateTime.duration} hours
            </div>
          )}
          
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-500 mb-3">
              Organized by {opportunity.organizer.organizationName || opportunity.organizer.name}
            </p>
            
            {showCancelButton && upcoming && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleCancelRegistration(opportunity._id)}
                disabled={cancellingId === opportunity._id}
              >
                {cancellingId === opportunity._id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Registration'
                )}
              </Button>
            )}
            
            {past && opportunity.applicationStatus === 'accepted' && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 py-2 rounded">
                  <Award className="h-4 w-4" />
                  <span>Completed - Certificate Available</span>
                </div>
                {opportunity.hoursLogged ? (
                  <div className="text-center text-sm text-gray-600">
                    Hours logged: {opportunity.hoursLogged}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleLogHours(opportunity)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Log Hours
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDownloadCertificate(opportunity._id)}
                  disabled={downloadingCert === opportunity._id}
                >
                  {downloadingCert === opportunity._id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Opportunities</h1>
        <p className="text-gray-600">
          Track your volunteer activities and manage your registrations
        </p>
      </div>

      <Tabs defaultValue="registered" className="space-y-6">
        <TabsList>
          <TabsTrigger value="registered">
            Registered ({registeredOpportunities.length})
          </TabsTrigger>
          {createdOpportunities.length > 0 && (
            <TabsTrigger value="created">
              Created ({createdOpportunities.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Registered Opportunities Tab */}
        <TabsContent value="registered" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          ) : registeredOpportunities.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No registered opportunities</h3>
              <p className="text-gray-600 mb-4">
                Start making a difference by signing up for volunteer opportunities
              </p>
              <Button onClick={() => window.location.href = '/opportunities'}>
                Browse Opportunities
              </Button>
            </Card>
          ) : (
            <>
              {/* Upcoming Opportunities */}
              {registeredOpportunities.filter(opp => isUpcoming(opp.dateTime.start)).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registeredOpportunities
                      .filter(opp => isUpcoming(opp.dateTime.start))
                      .map(opportunity => (
                        <OpportunityCard 
                          key={opportunity._id} 
                          opportunity={opportunity}
                          showCancelButton={true}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Past Opportunities */}
              {registeredOpportunities.filter(opp => isPast(opp.dateTime.start)).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Past</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registeredOpportunities
                      .filter(opp => isPast(opp.dateTime.start))
                      .map(opportunity => (
                        <OpportunityCard 
                          key={opportunity._id} 
                          opportunity={opportunity}
                        />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Created Opportunities Tab (for organizers) */}
        {createdOpportunities.length > 0 && (
          <TabsContent value="created" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdOpportunities.map(opportunity => (
                <OpportunityCard 
                  key={opportunity._id} 
                  opportunity={opportunity}
                />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Log Hours Dialog */}
      <Dialog open={showHoursDialog} onOpenChange={setShowHoursDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Volunteer Hours</DialogTitle>
            <DialogDescription>
              Enter the number of hours you volunteered for {selectedOpportunity?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Hours (e.g., 4.5)"
              value={hoursToLog}
              onChange={(e) => setHoursToLog(e.target.value)}
              min="0"
              step="0.5"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHoursDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitHours} disabled={!hoursToLog || loggingHours}>
              {loggingHours ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                'Log Hours'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyOpportunities;
