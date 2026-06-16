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
  Download,
  ExternalLink,
  Star,
  ListOrdered,
} from 'lucide-react';
import { opportunityAPI, volunteerAPI, certificateAPI } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/NewAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/ui/BackButton';

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
  volunteerStatus?: 'registered' | 'confirmed' | 'attended' | 'waitlisted';
  hoursLogged?: number;
  hasReviewed?: boolean;
  hasCertificate?: boolean;
  certificateId?: string;
  verificationUrl?: string;
  createdAt: string;
}

const MyOpportunities: React.FC = () => {
  const { user } = useAuth();
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
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewOpp, setReviewOpp] = useState<Opportunity | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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
    const parsed = parseFloat(hoursToLog);
    if (isNaN(parsed) || parsed <= 0) {
      toast({ title: 'Invalid hours', description: 'Please enter a number greater than 0', variant: 'destructive' });
      return;
    }
    const maxAllowed = selectedOpportunity.dateTime.duration
      ? selectedOpportunity.dateTime.duration * 2
      : 24;
    if (parsed > maxAllowed) {
      toast({ title: 'Hours too high', description: `Maximum allowed is ${maxAllowed} hours for this opportunity`, variant: 'destructive' });
      return;
    }
    try {
      setLoggingHours(true);
      const res = await volunteerAPI.logHours(selectedOpportunity._id, parsed);
      const newBadges: any[] = res?.newBadges ?? [];
      if (newBadges.length > 0) {
        newBadges.forEach((badge: any) => {
          toast({ title: `${badge.icon ?? '🏆'} Badge Earned!`, description: `You earned the "${badge.name}" badge — ${badge.description}` });
        });
      }
      toast({ title: 'Hours Saved', description: `${parsed} hours recorded for this activity` });
      setShowHoursDialog(false);
      setHoursToLog('');
      fetchOpportunities();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to log hours', variant: 'destructive' });
    } finally {
      setLoggingHours(false);
    }
  };

  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

  const handleDownloadCertificate = async (opportunityId: string, recipientName: string) => {
    setDownloadingCertId(opportunityId);
    try {
      await certificateAPI.downloadCompletionCertificate(opportunityId, recipientName);
      toast({ title: 'Certificate downloaded', description: 'Check your Downloads folder.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Download failed', variant: 'destructive' });
    } finally {
      setDownloadingCertId(null);
    }
  };

  const handleOpenReview = (opportunity: Opportunity) => {
    setReviewOpp(opportunity);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewDialog(true);
  };

  const submitReview = async () => {
    if (!reviewOpp) return;
    setSubmittingReview(true);
    try {
      await opportunityAPI.addReview(reviewOpp._id, reviewRating, reviewComment);
      toast({ title: 'Review submitted', description: 'Thank you for your feedback!' });
      setShowReviewDialog(false);
      setRegisteredOpportunities(prev =>
        prev.map(o => o._id === reviewOpp._id ? { ...o, hasReviewed: true } : o)
      );
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to submit review', variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary">{opportunity.category}</Badge>
                {opportunity.applicationStatus && getStatusBadge(opportunity.applicationStatus)}
                {opportunity.volunteerStatus === 'waitlisted' && (
                  <Badge variant="outline" className="border-amber-400 text-amber-600">
                    <ListOrdered className="h-3 w-3 mr-1" />Waitlisted
                  </Badge>
                )}
                {past && opportunity.volunteerStatus !== 'waitlisted' && <Badge variant="outline">Past</Badge>}
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
            
            {past && opportunity.applicationStatus === 'accepted' && opportunity.volunteerStatus !== 'waitlisted' && (
              <div className="space-y-2">
                {/* Attended status + hours */}
                {opportunity.volunteerStatus === 'attended' ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-green-700">
                      You attended
                      {opportunity.hoursLogged ? ` · ${opportunity.hoursLogged}h logged` : ''}
                    </span>
                    {opportunity.hoursLogged ? (
                      <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs text-gray-400 px-2" onClick={() => handleLogHours(opportunity)}>
                        Edit
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  // Not yet marked attended by organizer — show self-log option
                  opportunity.hoursLogged ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                      <Clock className="h-4 w-4 shrink-0" />{opportunity.hoursLogged}h self-reported
                      <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs text-gray-400 px-2" onClick={() => handleLogHours(opportunity)}>Update</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleLogHours(opportunity)}>
                      <Clock className="h-4 w-4 mr-2" />Log My Hours
                    </Button>
                  )
                )}

                {/* Certificate — most prominent action when available */}
                {opportunity.hasCertificate ? (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-orange-600 shrink-0" />
                      <span className="text-sm font-semibold text-orange-700">Certificate ready</span>
                    </div>
                    {opportunity.certificateId && (
                      <p className="text-xs text-gray-500 font-mono">{opportunity.certificateId}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => handleDownloadCertificate(opportunity._id, user?.name || '')}
                        disabled={downloadingCertId === opportunity._id}
                      >
                        {downloadingCertId === opportunity._id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <><Download className="h-3.5 w-3.5 mr-1.5" />Download</>
                        }
                      </Button>
                      {opportunity.verificationUrl && (
                        <Button
                          size="sm" variant="outline"
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                          onClick={() => window.open(opportunity.verificationUrl, '_blank')}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Verify
                        </Button>
                      )}
                    </div>
                  </div>
                ) : opportunity.volunteerStatus === 'attended' ? (
                  <div className="text-xs text-gray-400 text-center py-1">
                    Certificate pending — the organiser hasn't issued it yet
                  </div>
                ) : null}

                {/* Review */}
                {!opportunity.hasReviewed && (
                  <Button variant="outline" size="sm" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleOpenReview(opportunity)}>
                    <Star className="h-4 w-4 mr-2" />Leave a Review
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <BackButton />
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

      {/* Leave a Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={(open) => { if (!open) { setShowReviewDialog(false); setReviewOpp(null); setReviewRating(5); setReviewComment(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience volunteering for <strong>{reviewOpp?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Comment (optional)</p>
              <Textarea
                placeholder="Describe your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowReviewDialog(false); setReviewOpp(null); setReviewRating(5); setReviewComment(''); }}>
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={submittingReview}>
              {submittingReview ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Hours Dialog */}
      <Dialog open={showHoursDialog} onOpenChange={setShowHoursDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOpportunity?.hoursLogged ? 'Update Hours' : 'Log Volunteer Hours'}</DialogTitle>
            <DialogDescription>
              How many hours did you actually volunteer for <strong>{selectedOpportunity?.title}</strong>?
              {selectedOpportunity?.dateTime.duration && (
                <span className="block mt-1 text-xs text-gray-500">
                  Planned duration: {selectedOpportunity.dateTime.duration} hrs — enter your actual time.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="e.g. 3.5"
              value={hoursToLog}
              onChange={(e) => setHoursToLog(e.target.value)}
              min="0.5"
              max={selectedOpportunity?.dateTime.duration ? selectedOpportunity.dateTime.duration * 2 : 24}
              step="0.5"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2">
              Max: {selectedOpportunity?.dateTime.duration ? selectedOpportunity.dateTime.duration * 2 : 24} hrs
            </p>
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
