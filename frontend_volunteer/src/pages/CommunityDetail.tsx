import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  MapPin, 
  Globe,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Award,
  Clock
} from 'lucide-react';
import { communityAPI, opportunityAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/NewAuthContext';

const CommunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [community, setCommunity] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCommunityDetails();
    }
  }, [id]);

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      const [communityData, opportunitiesData] = await Promise.all([
        communityAPI.getById(id!),
        opportunityAPI.getAll({ community: id })
      ]);
      
      setCommunity(communityData);
      setOpportunities(opportunitiesData.data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load community details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to join communities",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      setJoining(true);
      await communityAPI.join(id!);
      setCommunity({ ...community, isMember: true, stats: { ...community.stats, totalVolunteers: community.stats.totalVolunteers + 1 } });
      toast({
        title: "Success!",
        description: "You've joined the community",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to join community",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      setJoining(true);
      await communityAPI.leave(id!);
      setCommunity({ ...community, isMember: false, stats: { ...community.stats, totalVolunteers: community.stats.totalVolunteers - 1 } });
      toast({
        title: "Left Community",
        description: "You've left the community",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to leave community",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
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

  if (!community) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Community not found
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate('/communities')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Communities
      </Button>

      {/* Header */}
      {community.image && (
        <div className="h-64 rounded-lg overflow-hidden mb-6">
          <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{community.category}</Badge>
            {community.verificationStatus === 'verified' && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
          <p className="text-gray-600">{community.description}</p>
        </div>
        
        {community.isMember ? (
          <Button variant="outline" onClick={handleLeave} disabled={joining}>
            {joining ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Leave Community
          </Button>
        ) : (
          <Button onClick={handleJoin} disabled={joining}>
            {joining ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Join Community
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-2xl font-bold">{community.stats.totalVolunteers}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Opportunities</p>
                <p className="text-2xl font-bold">{community.stats.totalOpportunities}</p>
              </div>
              <Calendar className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{community.stats.totalHours}</p>
              </div>
              <Clock className="h-10 w-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities ({opportunities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {community.location && (
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3" />
                  {community.location.city}, {community.location.country}
                </div>
              )}
              {community.website && (
                <div className="flex items-center text-gray-700">
                  <Globe className="h-5 w-5 mr-3" />
                  <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {community.website}
                  </a>
                </div>
              )}
              {community.contactEmail && (
                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-3" />
                  <a href={`mailto:${community.contactEmail}`} className="text-blue-600 hover:underline">
                    {community.contactEmail}
                  </a>
                </div>
              )}
              {community.contactPhone && (
                <div className="flex items-center text-gray-700">
                  <Phone className="h-5 w-5 mr-3" />
                  {community.contactPhone}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          {opportunities.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No opportunities yet</h3>
              <p className="text-gray-600">Check back later for volunteer opportunities from this community</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map(opp => (
                <Card key={opp._id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/opportunities')}>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">{opp.category}</Badge>
                    <CardTitle className="text-lg">{opp.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{opp.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(opp.dateTime.start).toLocaleDateString()}</span>
                      <span>{opp.capacity.current}/{opp.capacity.required} volunteers</span>
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

export default CommunityDetail;
